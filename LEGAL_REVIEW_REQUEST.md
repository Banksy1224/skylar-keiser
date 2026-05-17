# Skylar — Legal review request: TCPA consent flow for live counselor SMS

**Status:** DRAFT — built but feature-flagged OFF. Not user-visible until counsel signs off.
**Owner:** Robert Keiser (Vice-Chancellor, Graduate School)
**Drafted by:** Edison (AI assistant) on 2026-05-17
**Audience:** Keiser University general counsel / compliance officer

---

## What we're proposing

A new feature in Skylar, Keiser's AI admissions chatbot, that lets prospective students click a button to be texted by a Keiser admissions counselor. The text is sent via Keiser's existing YakChat (Microsoft Teams SMS) enterprise tool. The student initiates the request; the counselor replies from Teams; the conversation lands on the student's phone as SMS.

**Why we need legal review:** TCPA (Telephone Consumer Protection Act, 47 U.S.C. § 227 and FCC implementing regulations) requires "prior express written consent" before automated systems can send marketing/non-emergency SMS to a mobile number. Higher-education admissions has been an active TCPA litigation target. Before flipping this feature on, we want counsel to review and approve (a) the proposed consent language, (b) the opt-out mechanism, and (c) the audit recordkeeping.

## What we've built (and what is gated)

Everything is in production code today on the live Skylar app, but **the feature flag (`YAKCHAT_HANDOFF_ENABLED`) is OFF**, which means:

- The "Text an admissions counselor" button is NOT rendered to any user.
- The server-side SMS send path is short-circuited; no SMS would go out even if a consent record somehow got created.
- The consent text in the codebase is marked "DRAFT — pending legal review" with a red banner in the UI.

The infrastructure that's already live and working (without the SMS feature):
- A `tcpa_consent` table in Supabase that stores proof-of-consent records (phone, timestamp, IP, user-agent, exact text shown, SHA-256 hash of that text, language, session ID)
- An `sms_optouts` table that records every STOP message and is checked before any SMS attempt
- A `/api/handoff/optout` webhook endpoint that YakChat would POST to when a student replies STOP

Once counsel approves, we flip the flag on Railway and the button appears.

## The proposed consent flow

1. Student is chatting with Skylar.
2. When Skylar's retrieval engine has low confidence (no good FAQ match), it offers two CTAs: (a) the existing "Talk to a counselor now" link to keiseruniversity.edu/request-information (no SMS), and (b) the new "Text an admissions counselor" button (SMS via YakChat).
3. If the student clicks the SMS button, a modal opens.
4. The modal displays:
   - A red "DRAFT — pending legal review" banner (until counsel signs off; we'll remove this then)
   - The full consent disclosure text (below)
   - Form fields: first name, last name, email, mobile number (required)
   - A required, unchecked-by-default checkbox: "I have read and agree to the above..."
   - Submit button (disabled until checkbox is checked and phone is filled)
5. On submit, the server:
   - Re-renders the canonical consent text server-side
   - Refuses to record consent if the text the client claims to have shown doesn't match (anti-tampering)
   - Records the consent event in `tcpa_consent` with IP, user-agent, timestamp, version, full text snapshot, and SHA-256 hash
   - Checks `sms_optouts`; if the number is on the opt-out list, refuses to record consent and shows an error
   - Posts a notification to a Microsoft Teams admissions channel so a counselor sees the new lead
   - If YakChat is configured AND the feature flag is on, sends a first SMS to the student: "Hi {first_name}, this is Keiser University admissions. I got your request and will reply shortly. Reply STOP to opt out."
6. The counselor replies from Teams; YakChat delivers as SMS.
7. If the student replies STOP, YakChat's webhook hits our `/api/handoff/optout` endpoint; we add the number to `sms_optouts` and never send to it again.

## The proposed consent text (English version)

> By checking the box below and providing my mobile number, I expressly consent to receive text messages from Keiser University and its admissions team at the mobile number I provided, including text messages sent using an automated system, autodialer, or pre-recorded voice technology, for the purpose of responding to my inquiry about academic programs and admissions.
>
> I understand that:
> • This consent is NOT a condition of admission, enrollment, or receiving any goods or services from Keiser University.
> • Message and data rates from my mobile carrier may apply.
> • Message frequency may vary depending on my engagement with the admissions team.
> • I can opt out at any time by replying STOP to any message I receive. After I reply STOP, I will no longer receive automated SMS from Keiser University at that number.
> • I can reply HELP for assistance.
> • My phone number and the contents of these messages may be stored by Keiser University and its service providers (including Microsoft and YakChat) for the purposes of facilitating this conversation, regulatory compliance, and recordkeeping.
> • Standard text messaging carrier delivery is not guaranteed and timing of replies may vary.
>
> I have read the Keiser University privacy notice and I am at least 18 years of age, or if under 18, my parent or legal guardian consents on my behalf.

A Spanish translation is available in the same source file (`consent.js`). The translation has been done for legal substance, not just literal word-for-word, but we recommend a Spanish-fluent attorney review it before showing it to Spanish-speaking users.

## Specific questions for counsel

1. **Is the disclosure language above sufficient under TCPA and FCC regulations for prospective-student outreach?** If not, what changes are needed? We can swap the text and the version stamp in 5 minutes.
2. **Is single-step affirmative checkbox consent acceptable, or do you want two-step consent** (e.g., a separate checkbox for SMS vs. one for general marketing)?
3. **Is the proposed retention period sufficient?** We're storing consent records indefinitely (no automatic deletion); we plan to keep them at minimum 4 years (TCPA statute of limitations) but could keep longer.
4. **Is the Spanish translation legally equivalent**, or do you want to require English-only consent at first?
5. **Do we need to link to Keiser's privacy notice from the modal**, and if so, which URL? We've referenced "the Keiser University privacy notice" generically; if there's a specific URL, we'll wire it in.
6. **Are there state-specific carve-outs we need to address** (Florida CAN-SPAM analog, California CCPA-related rules for under-13 users, etc.)? Skylar is hosted from Florida but accessible nationwide.
7. **Is there a minimum age verification mechanism you want?** The current text relies on the student's assertion that they're 18+ or have parental consent. Counsel may want a stronger gate.
8. **Who at Keiser is the named TCPA compliance officer?** We'd like to add their contact to the modal under "questions about this consent."

## What needs to be true before we flip the flag

| # | Action | Owner | Status |
|---|---|---|---|
| 1 | Counsel review of `consent.js` text in English | Keiser legal | ☐ Pending |
| 2 | Counsel review of Spanish translation | Keiser legal | ☐ Pending |
| 3 | Provision a dedicated YakChat number for admissions outreach | IT / YakChat admin | ☐ Pending |
| 4 | Configure YakChat to POST inbound STOP messages to `/api/handoff/optout` | IT / YakChat admin | ☐ Pending |
| 5 | Define counselor coverage hours (when is the channel actively monitored?) | Admissions ops | ☐ Pending |
| 6 | Decide off-hours behavior: hide button entirely, or show with "off-hours, reply tomorrow" disclaimer | Robert + admissions ops | ☐ Pending |
| 7 | Set Railway env vars: `YAKCHAT_HANDOFF_ENABLED`, `YAKCHAT_API_KEY`, `YAKCHAT_FROM_NUMBER`, optionally `TEAMS_WEBHOOK_URL` | Robert | ☐ Pending |
| 8 | Internal soft-launch with 5-10 test students (Keiser staff acting as students) before public flip | Edison + Robert | ☐ Pending |

## Risk if we ship without legal review

TCPA carries statutory damages of $500–$1,500 per text per recipient. A class action involving Keiser sending a few hundred non-consented SMS could be a six- or seven-figure exposure. The cost of having counsel spend 30-60 minutes reviewing this document and the consent text is negligible by comparison.

## Code locations (for technical review if counsel wants engineering's audit)

- `consent.js` — versioned consent text, English and Spanish
- `handoff.js` — server-side phone normalization, consent recording, opt-out check, YakChat send
- `server.js` — `/api/handoff/*` route handlers
- `skylar-handoff.jsx` — client-side consent modal
- Supabase tables: `public.tcpa_consent`, `public.sms_optouts` (both append-only, RLS-locked, service_role only)
- GitHub: https://github.com/Banksy1224/skylar-keiser
- Live URL (feature currently invisible): https://skylar-keiser-production.up.railway.app/
