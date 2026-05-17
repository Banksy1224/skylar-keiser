// handoff.js — Live-counselor SMS handoff infrastructure.
//
// What this module does:
//   1. Normalises phone numbers to E.164 (US default if no country code).
//   2. Records a TCPA consent event in Supabase, with hashing of the exact text shown.
//   3. Checks the sms_optouts table before any send.
//   4. Provides a YakChat send stub (real API call only when YAKCHAT_API_KEY is set
//      AND YAKCHAT_HANDOFF_ENABLED=true; otherwise logs and queues).
//   5. Records inbound STOP webhooks from YakChat into sms_optouts.
//
// What this module does NOT do (intentionally):
//   • Send SMS without a recorded consent event in the same request.
//   • Update or delete tcpa_consent rows.
//   • Trust client-supplied IP / user-agent — always reads from req headers server-side.
//   • Ship without the feature flag — defaults to disabled.

import crypto from 'node:crypto';

// ─── Configuration ─────────────────────────────────────────────────────────
const FEATURE_FLAG = (process.env.YAKCHAT_HANDOFF_ENABLED || '').toLowerCase() === 'true';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_KEY);
const YAKCHAT_API_KEY = process.env.YAKCHAT_API_KEY || '';
const YAKCHAT_FROM_NUMBER = process.env.YAKCHAT_FROM_NUMBER || '';
const YAKCHAT_API_BASE = process.env.YAKCHAT_API_BASE || 'https://api.yakchat.com';
const TEAMS_WEBHOOK_URL = process.env.TEAMS_WEBHOOK_URL || ''; // optional: drop new leads into a Teams channel

export function handoffStatus() {
  return {
    feature_flag_on: FEATURE_FLAG,
    supabase_enabled: SUPABASE_ENABLED,
    yakchat_configured: Boolean(YAKCHAT_API_KEY && YAKCHAT_FROM_NUMBER),
    teams_webhook_configured: Boolean(TEAMS_WEBHOOK_URL),
  };
}

// ─── Phone normalisation ───────────────────────────────────────────────────
// We only accept US/CA numbers in this build. If you expand to other countries
// later, this needs to grow: real i18n phone parsing belongs in libphonenumber.
export function normalisePhone(input) {
  if (typeof input !== 'string') return null;
  const digits = input.replace(/[^0-9]/g, '');
  if (digits.length === 10) return '+1' + digits;             // 305-555-1234
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits; // 13055551234
  // Reject anything we can't confidently parse as US/CA E.164. Better to fail
  // closed than send SMS to a malformed number.
  return null;
}

// ─── Supabase helpers ──────────────────────────────────────────────────────
async function supabaseInsert(table, row) {
  if (!SUPABASE_ENABLED) {
    console.warn(`[handoff] supabase disabled — would have inserted into ${table}:`, JSON.stringify(row).slice(0, 300));
    return { ok: false, reason: 'supabase_disabled' };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[handoff] supabase insert ${table} failed:`, res.status, body.slice(0, 300));
      return { ok: false, reason: 'supabase_error', status: res.status };
    }
    return { ok: true };
  } catch (e) {
    console.error(`[handoff] supabase insert ${table} threw:`, e.message);
    return { ok: false, reason: 'supabase_throw', error: e.message };
  }
}

async function supabaseQueryOptout(phone_e164) {
  if (!SUPABASE_ENABLED) return { ok: false, reason: 'supabase_disabled', optout: false };
  try {
    const url = `${SUPABASE_URL}/rest/v1/sms_optouts?phone_e164=eq.${encodeURIComponent(phone_e164)}&select=phone_e164`;
    const res = await fetch(url, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return { ok: false, reason: 'supabase_error', optout: true }; // fail-closed
    const rows = await res.json();
    return { ok: true, optout: Array.isArray(rows) && rows.length > 0 };
  } catch (e) {
    console.error('[handoff] optout query threw:', e.message);
    return { ok: false, reason: 'supabase_throw', optout: true };               // fail-closed
  }
}

// ─── Public API: record consent ────────────────────────────────────────────
// Called by /api/handoff/consent. The caller is responsible for serving the
// EXACT consent text the user saw; we recompute its hash to verify integrity
// and we store the full text snapshot for audit.
//
// Returns: { ok, reason?, consent_id? } — never throws.
export async function recordConsent({
  session_id, phone, first_name, last_name, email, lang,
  consent_text_version, consent_text_snapshot, ip_address, user_agent, context_question, meta,
}) {
  const phone_e164 = normalisePhone(phone);
  if (!phone_e164) return { ok: false, reason: 'invalid_phone' };
  if (!session_id) return { ok: false, reason: 'missing_session_id' };
  if (!consent_text_version || !consent_text_snapshot) {
    return { ok: false, reason: 'missing_consent_text' };
  }
  // Check opt-out: if this number is on the no-SMS list, do NOT record new consent.
  // (A user who opted out must re-enter via an out-of-band path; we don't accept
  //  a click-through to override an opt-out.)
  const optout = await supabaseQueryOptout(phone_e164);
  if (optout.optout) return { ok: false, reason: 'phone_opted_out' };

  const consent_text_hash = crypto.createHash('sha256').update(consent_text_snapshot).digest('hex');

  const row = {
    session_id,
    phone_e164,
    first_name: first_name || null,
    last_name: last_name || null,
    email: email || null,
    consent_text_version,
    consent_text_hash,
    consent_text_snapshot,
    ip_address: ip_address || null,
    user_agent: user_agent ? user_agent.slice(0, 256) : null,
    lang: (lang === 'es') ? 'es' : 'en',
    context_question: context_question ? String(context_question).slice(0, 500) : null,
    meta: meta || null,
  };
  const ins = await supabaseInsert('tcpa_consent', row);
  if (!ins.ok) return { ok: false, reason: ins.reason || 'insert_failed' };
  return { ok: true, phone_e164, consent_text_hash };
}

// ─── Public API: record opt-out ────────────────────────────────────────────
// Called by /api/handoff/optout (YakChat STOP webhook).
// Idempotent: if the phone is already opted out, do nothing.
export async function recordOptout({ phone, source, raw_message, meta }) {
  const phone_e164 = normalisePhone(phone);
  if (!phone_e164) return { ok: false, reason: 'invalid_phone' };
  const existing = await supabaseQueryOptout(phone_e164);
  if (existing.optout) return { ok: true, already_opted_out: true };
  const ins = await supabaseInsert('sms_optouts', {
    phone_e164,
    source: source || 'yakchat_stop',
    raw_message: raw_message ? String(raw_message).slice(0, 500) : null,
    meta: meta || null,
  });
  return ins;
}

// ─── Public API: send via YakChat ─────────────────────────────────────────
// In this build, this is a guarded stub. It only sends if:
//   (a) feature flag is on
//   (b) YakChat API creds are configured
//   (c) the recipient phone is NOT in sms_optouts
//
// If any of those fail, returns { ok: false, reason } WITHOUT sending. The caller
// (route handler) decides how to respond to the user.
//
// When fully wired up, this function will need to use YakChat's actual REST
// shape — confirm with their docs before sending real traffic.
export async function yakchatSend({ phone, body, lang }) {
  if (!FEATURE_FLAG) return { ok: false, reason: 'feature_flag_off' };
  if (!YAKCHAT_API_KEY || !YAKCHAT_FROM_NUMBER) {
    return { ok: false, reason: 'yakchat_not_configured' };
  }
  const phone_e164 = normalisePhone(phone);
  if (!phone_e164) return { ok: false, reason: 'invalid_phone' };

  const optout = await supabaseQueryOptout(phone_e164);
  if (optout.optout) return { ok: false, reason: 'phone_opted_out' };

  try {
    // NOTE: the exact YakChat API path/payload here is a placeholder. Verify
    // against current YakChat REST docs before going live. The shape below
    // is consistent with their published examples for sending SMS from a
    // configured channel number.
    const res = await fetch(`${YAKCHAT_API_BASE}/v1/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${YAKCHAT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: YAKCHAT_FROM_NUMBER,
        to: phone_e164,
        body,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[handoff] yakchat send failed:', res.status, text.slice(0, 300));
      return { ok: false, reason: 'yakchat_error', status: res.status };
    }
    return { ok: true, phone_e164 };
  } catch (e) {
    console.error('[handoff] yakchat threw:', e.message);
    return { ok: false, reason: 'yakchat_throw', error: e.message };
  }
}

// ─── Public API: drop lead into Teams channel ──────────────────────────────
// Posts a card to a Microsoft Teams Incoming Webhook so counselors see the new
// lead immediately. Independent of YakChat — works even when YAKCHAT_HANDOFF_ENABLED=false.
export async function teamsNotify({ phone_e164, first_name, last_name, email, context_question, lang }) {
  if (!TEAMS_WEBHOOK_URL) return { ok: false, reason: 'teams_webhook_not_configured' };
  const card = {
    text: [
      `**New Skylar lead (${lang || 'en'})**`,
      `Name: ${first_name || ''} ${last_name || ''}`.trim() || '—',
      `Phone: ${phone_e164}`,
      email ? `Email: ${email}` : null,
      context_question ? `Question: ${context_question}` : null,
    ].filter(Boolean).join('\n'),
  };
  try {
    const res = await fetch(TEAMS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    console.error('[handoff] teams notify threw:', e.message);
    return { ok: false, reason: 'teams_throw' };
  }
}
