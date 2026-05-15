// analytics.js — append-only event logger for Skylar.
//
// Strategy: Supabase primary (skylar_events table), local JSON fallback on disk.
// - If SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, we POST to the REST API.
// - Whether or not Supabase succeeds, we ALSO append to events.log (JSONL) on disk.
//   The on-disk file is rotated at ~5MB and serves as a belt-and-suspenders trail
//   in case Supabase is unreachable.
// - No PII enters this module. Questions are truncated server-side to 500 chars.
// - All writes are fire-and-forget from the caller's perspective: failures are
//   logged to stderr but never bubble up to the chat response. Analytics MUST NOT
//   block or break the user-facing experience.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, 'events.log');
const LOG_MAX_BYTES = 5 * 1024 * 1024; // 5 MB before rotation

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_KEY);

if (!SUPABASE_ENABLED) {
  console.warn('[analytics] Supabase not configured — events will only go to events.log');
}

// ─── Hard limits ────────────────────────────────────────────────────────────
const MAX_Q_LEN = 500;
const VALID_TYPES = new Set([
  'session_start', 'retrieval', 'source_click', 'handoff', 'reaction', 'lang_switch',
]);

// Sanitize: ensure no oversized strings, valid event_type, JSONB-safe meta.
function sanitize(evt) {
  const out = {
    session_id: String(evt.session_id || '').slice(0, 64),
    event_type: VALID_TYPES.has(evt.event_type) ? evt.event_type : null,
    question: evt.question ? String(evt.question).slice(0, MAX_Q_LEN) : null,
    faq_indices: Array.isArray(evt.faq_indices) ? evt.faq_indices.filter(Number.isInteger).slice(0, 10) : null,
    top_score: typeof evt.top_score === 'number' ? evt.top_score : null,
    faq_index: Number.isInteger(evt.faq_index) ? evt.faq_index : null,
    lang: typeof evt.lang === 'string' ? evt.lang.slice(0, 8) : null,
    persona: typeof evt.persona === 'string' ? evt.persona.slice(0, 16) : null,
    meta: evt.meta && typeof evt.meta === 'object' ? evt.meta : null,
    user_agent: evt.user_agent ? String(evt.user_agent).slice(0, 256) : null,
  };
  if (!out.session_id || !out.event_type) return null;
  return out;
}

function appendLocal(evt) {
  try {
    // Rotate if too large
    if (fs.existsSync(LOG_FILE)) {
      const stat = fs.statSync(LOG_FILE);
      if (stat.size > LOG_MAX_BYTES) {
        const rotated = LOG_FILE + '.' + new Date().toISOString().replace(/[:.]/g, '-');
        fs.renameSync(LOG_FILE, rotated);
      }
    }
    const line = JSON.stringify({ ts: new Date().toISOString(), ...evt }) + '\n';
    fs.appendFileSync(LOG_FILE, line);
  } catch (e) {
    console.error('[analytics] local log write failed:', e.message);
  }
}

async function postSupabase(evt) {
  if (!SUPABASE_ENABLED) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/skylar_events`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(evt),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[analytics] supabase insert failed:', res.status, body.slice(0, 200));
    }
  } catch (e) {
    console.error('[analytics] supabase fetch failed:', e.message);
  }
}

// Public API: fire-and-forget.
export function logEvent(rawEvt) {
  const evt = sanitize(rawEvt);
  if (!evt) {
    console.warn('[analytics] dropped invalid event:', JSON.stringify(rawEvt).slice(0, 200));
    return;
  }
  appendLocal(evt);
  // Don't await — fire and forget.
  postSupabase(evt).catch(() => {});
}

export function analyticsHealth() {
  return {
    supabase_enabled: SUPABASE_ENABLED,
    local_log: LOG_FILE,
    local_log_exists: fs.existsSync(LOG_FILE),
  };
}
