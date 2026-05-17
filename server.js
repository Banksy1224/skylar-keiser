// server.js — Express server for Railway deployment.
// Serves the static HTML/JSX files and proxies AI requests to Anthropic
// so the API key never lives in the browser.

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logEvent, analyticsHealth } from './analytics.js';
import { recordConsent, recordOptout, yakchatSend, teamsNotify, handoffStatus, normalisePhone } from './handoff.js';
import { renderConsent, CONSENT_VERSION } from './consent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '1mb' }));

// ─── API: /api/event ────────────────────────────────────────────────────
// Browser-side analytics endpoint. Fire-and-forget; never blocks the chat.
// We intentionally do NOT trust the client's user_agent header — we use the
// req.headers['user-agent'] server-side and ignore whatever the body says.
app.post('/api/event', (req, res) => {
  try {
    const body = req.body || {};
    logEvent({
      session_id: body.session_id,
      event_type: body.event_type,
      question: body.question,
      faq_indices: body.faq_indices,
      top_score: body.top_score,
      faq_index: body.faq_index,
      lang: body.lang,
      persona: body.persona,
      meta: body.meta,
      user_agent: req.headers['user-agent'],
    });
    res.status(204).end();
  } catch (e) {
    // Analytics must never break the app.
    console.error('[/api/event] failed:', e.message);
    res.status(204).end();
  }
});

app.get('/api/analytics/health', (_req, res) => {
  res.json(analyticsHealth());
});

// ─── Handoff: feature flag + consent + send ────────────────────────────────
function clientIp(req) {
  // Trust Railway's proxy headers but fall back to socket.remoteAddress.
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : null;
}

// Client polls this to know whether to render the SMS-handoff button at all.
app.get('/api/handoff/status', (_req, res) => {
  res.json(handoffStatus());
});

// Return the consent text to render in the modal. We control the text
// server-side so the client cannot tamper with what is shown vs. what is
// recorded. The client sends back the exact snapshot it displayed; the server
// re-renders and refuses to record if the snapshot doesn't match.
app.get('/api/handoff/consent-text', (req, res) => {
  const lang = (req.query.lang === 'es') ? 'es' : 'en';
  const brand = typeof req.query.brand === 'string' ? req.query.brand.slice(0, 64) : 'Keiser University';
  res.json(renderConsent(lang, brand));
});

app.post('/api/handoff/consent', async (req, res) => {
  try {
    const b = req.body || {};
    // Re-render server-side and compare to the snapshot the client claims to
    // have shown. Refuses to record if they don't match — protects against a
    // tampered client showing one thing and recording another.
    const lang = (b.lang === 'es') ? 'es' : 'en';
    const brand = typeof b.brand === 'string' ? b.brand.slice(0, 64) : 'Keiser University';
    const expected = renderConsent(lang, brand);
    if (b.consent_text_version !== expected.version || b.consent_text_snapshot !== expected.body) {
      return res.status(400).json({ ok: false, reason: 'consent_text_mismatch' });
    }
    const result = await recordConsent({
      session_id: b.session_id,
      phone: b.phone,
      first_name: b.first_name,
      last_name: b.last_name,
      email: b.email,
      lang,
      consent_text_version: expected.version,
      consent_text_snapshot: expected.body,
      ip_address: clientIp(req),
      user_agent: req.headers['user-agent'],
      context_question: b.context_question,
      meta: { brand },
    });
    if (!result.ok) {
      return res.status(result.reason === 'phone_opted_out' ? 403 : 400).json(result);
    }

    // Log a handoff analytics event so dashboards see it.
    logEvent({
      session_id: b.session_id,
      event_type: 'handoff',
      question: b.context_question,
      lang,
      meta: { mode: 'consent_recorded', phone_e164: result.phone_e164 },
      user_agent: req.headers['user-agent'],
    });

    // Drop a notification in Teams so a counselor can pick it up immediately.
    // Fire-and-forget; do not gate the response on this.
    teamsNotify({
      phone_e164: result.phone_e164,
      first_name: b.first_name,
      last_name: b.last_name,
      email: b.email,
      context_question: b.context_question,
      lang,
    }).catch(() => {});

    // If YakChat is fully configured, send the first SMS to the student.
    // Otherwise we still succeeded — the student's consent is recorded and the
    // Teams notification is out; the counselor will reach out manually.
    const status = handoffStatus();
    if (status.feature_flag_on && status.yakchat_configured) {
      const message = lang === 'es'
        ? `Hola ${b.first_name || ''}, soy del equipo de admisiones de Keiser University. Recibí tu solicitud y te responderé a la brevedad. Responde STOP para dejar de recibir mensajes.`
        : `Hi ${b.first_name || ''}, this is Keiser University admissions. I got your request and will reply shortly. Reply STOP to opt out.`;
      yakchatSend({ phone: result.phone_e164, body: message.trim(), lang }).catch(() => {});
    }

    res.json({ ok: true, mode: status.feature_flag_on && status.yakchat_configured ? 'sms_sent' : 'lead_recorded' });
  } catch (e) {
    console.error('[/api/handoff/consent] failed:', e.message);
    res.status(500).json({ ok: false, reason: 'server_error' });
  }
});

// YakChat STOP webhook. YakChat must be configured to POST inbound messages
// here; the body shape depends on their webhook contract — confirm against
// current docs before going live. For now we accept a flexible body that
// covers their common shapes.
app.post('/api/handoff/optout', async (req, res) => {
  try {
    const b = req.body || {};
    const phone = b.from || b.phone || b.sender || b.msisdn;
    const msg = b.body || b.message || b.text || '';
    // Only opt out on STOP/UNSUBSCRIBE/CANCEL/END/QUIT — the FCC-mandated keywords.
    const trimmed = (msg || '').trim().toUpperCase();
    const STOP_WORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'STOPALL'];
    if (!STOP_WORDS.includes(trimmed)) {
      // Not a STOP message — acknowledge but do nothing.
      return res.json({ ok: true, action: 'ignored' });
    }
    const result = await recordOptout({ phone, source: 'yakchat_stop', raw_message: msg });
    res.json({ ok: result.ok, ...result });
  } catch (e) {
    console.error('[/api/handoff/optout] failed:', e.message);
    res.status(500).json({ ok: false, reason: 'server_error' });
  }
});

// Initialise the Anthropic client. Reads ANTHROPIC_API_KEY from env.
const client = new Anthropic();

// ─── API: /api/complete ─────────────────────────────────────────────────
// Accepts { messages: [{ role, content }] } and returns { text }.
// Mirrors the shape of the in-preview window.claude.complete helper.
app.post('/api/complete', async (req, res) => {
  try {
    const { messages, system } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const result = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: 1024,
      ...(system ? { system } : {}),
      messages,
    });

    const text = (result.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    res.json({ text });
  } catch (err) {
    console.error('claude.complete failed:', err);
    res.status(500).json({ error: err.message || 'completion failed' });
  }
});

// ─── Health check (Railway pings this) ──────────────────────────────────
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// ─── Static files ───────────────────────────────────────────────────────
// Serve everything in the project root: HTML, JSX, the Skylar video, fonts, etc.
app.use(express.static(__dirname, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jsx')) {
      // Babel reads these via <script type="text/babel" src="..."> — needs
      // a permissive mime so the browser fetches them as text.
      res.setHeader('Content-Type', 'text/babel; charset=utf-8');
    }
  },
}));

// Default route — production app (responsive, with disclaimer modal).
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Internal playground — the original Tweaks-panel design canvas.
// Not linked from anywhere public; gated by URL only.
app.get('/tweaks', (_req, res) => {
  res.sendFile(path.join(__dirname, 'Skylar Chat v2.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Skylar running on http://localhost:${port}`);
});
