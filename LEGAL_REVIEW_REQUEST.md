# Legal Review Request — Skylar SMS Counselor Handoff

**To:** Keiser University Legal Counsel
**From:** Robert Keiser, Vice-Chancellor — Graduate School
**Date:** 2026-05-17
**Status:** DRAFT — code is built and deployed behind a feature flag; **no SMS is being sent and no consent records are being collected** until this review is complete.
**Estimated review effort:** 15–30 minutes (see Section 3 — the ask is narrow).

---

## 1. What this is

Skylar is the AI chat assistant live at `https://skylar-keiser-production.up.railway.app/` (also embeddable into Keiser web properties). When a prospective student's question is one Skylar cannot confidently answer, we want to offer them a button labeled **"Text an admissions counselor"** that connects them via YakChat (Microsoft Teams SMS) — the same enterprise platform Keiser counselors already use daily for SMS communications with applicants and enrolled students.

Before any SMS is sent, the user must complete a TCPA consent modal. **This memo is a request to bless the consent text below.**

The infrastructure is built, locked behind a feature flag (`YAKCHAT_HANDOFF_ENABLED=false`), and the button is invisible to users until that flag is flipped. We will not flip the flag until you sign off.

---

## 2. Framing — why this is an extension, not a new program

Keiser University already operates a counsel-approved TCPA consent program on the live RFI page at `https://www.keiseruniversity.edu/request-information/`. The consent language in production there reads, verbatim:

> "By clicking the 'Submit' button, I authorize Keiser University to make or allow the placement of recurring marketing calls, emails, and texts to me at the phone number that I have provided, including through the use of automated technology or a prerecorded or artificial voice. I understand that I am not required to provide my phone number as a condition of purchasing any property, goods, or services."

**Skylar's consent text uses that exact sentence verbatim as its anchor clause.** We then add six supplementary disclosures aligned to 2025 CTIA / 10DLC best practice for chatbot-originated SMS opt-in:

1. STOP keyword honoring
2. HELP keyword for assistance
3. Message-and-data-rates disclaimer
4. Variable message-frequency disclaimer
5. Named service providers (Microsoft, YakChat) and retention purpose
6. Age-of-majority / parental consent

**The ask is therefore narrowed to: are the six additional disclosures acceptable as drafted, or would you like any removed or rewritten?** The RFI anchor sentence is what you have already approved.

A separate operational consideration — Keiser admissions counselors are already rigorously trained on STOP-keyword compliance under the existing YakChat program — so this extension inherits an existing operational SOP rather than creating a new one.

---

## 3. The narrow ask

Please review **Section 5** below and answer:

1. **Anchor clause:** Confirm the RFI sentence is reproduced verbatim and acceptably contextualized.
2. **Each of the six supplementary disclosures:** approve, strike, or rewrite.
3. **Spanish translation:** approve as drafted, or replace with a counsel-preferred Spanish version (Keiser may already have one in use elsewhere).
4. **Checkbox label:** approve as drafted.
5. **Affirmative-checkbox pattern vs. RFI's click-through pattern:** Skylar uses an explicit checkbox before submit. This is stricter than the RFI form's click-submit-implies-consent pattern. Please confirm this is acceptable for this channel (we expect it is, as it strengthens defensibility).
6. **Retention period for `tcpa_consent` records:** Skylar records are stored append-only in Supabase. Please specify minimum retention (recommended: 4 years from last contact, per typical TCPA statute-of-limitations practice).
7. **Whether a "Privacy Policy" hyperlink should be added to the consent modal** (the RFI page has one; Skylar's modal currently references the privacy notice in prose but does not link to it).
8. **Sign-off authority** for future text changes — bump procedure when language is revised.

---

## 4. What happens when the user agrees

1. The user types a question Skylar cannot confidently answer (retriever top-score < 1.5).
2. A pill labeled "Text an admissions counselor" appears below Skylar's response (only when the feature flag is on).
3. User clicks it; a modal opens with the full consent text from Section 5.
4. User checks the affirmative-consent checkbox, enters their mobile number and (optionally) name + email, and clicks "Connect me with a counselor."
5. The server **re-renders the consent text canonically** and refuses to record if the snapshot the client sent does not match byte-for-byte (anti-tamper protection).
6. The server **checks the `sms_optouts` table first** — if the phone number has previously replied STOP from any channel, the request is refused with HTTP 403 (fail-closed: even if the lookup query errors, the request is treated as opted-out).
7. The server records into `tcpa_consent` (append-only, RLS-locked, service-role only): phone in E.164, version, SHA-256 hash of consent text, full consent text snapshot, IP address, user agent, language, the question that triggered the request, timestamp.
8. The server then dispatches a first SMS to the user via YakChat introducing the counselor and (optionally) a Teams webhook notification to the admissions team.
9. STOP replies from the user route through YakChat's webhook to `/api/handoff/optout`, which appends to `sms_optouts` and is honored by all subsequent send attempts.

---

## 5. **The text — please review verbatim**

**Version stamp recorded with each consent:** `v0.2-DRAFT-2026-05-17`
**SHA-256 hash:** computed and stored per record so future audits can prove which text version any individual user agreed to.

### 5a. English

**Headline:** Before we connect you with a counselor

**Body** (paragraph 1 is the **verbatim RFI anchor sentence**; paragraph 2 is the **six-clause delta**):

> By checking the box below and providing my mobile number, I authorize Keiser University to make or allow the placement of recurring marketing calls, emails, and texts to me at the phone number that I have provided, including through the use of automated technology or a prerecorded or artificial voice. I understand that I am not required to provide my phone number as a condition of purchasing any property, goods, or services.
>
> In addition, I understand that:
> • Message and data rates from my mobile carrier may apply.
> • Message frequency may vary depending on my engagement with the admissions team.
> • I can opt out at any time by replying STOP to any message I receive. After I reply STOP, I will no longer receive automated SMS from Keiser University at that number.
> • I can reply HELP for assistance.
> • My phone number and the contents of these messages may be stored by Keiser University and its service providers (including Microsoft and YakChat) for the purposes of facilitating this conversation, regulatory compliance, and recordkeeping.
> • I am at least 18 years of age, or if under 18, my parent or legal guardian consents on my behalf.
>
> I have read the Keiser University privacy notice.

**Affirmative-consent checkbox label** (required to enable the submit button):

> I have read and agree to the above. I consent to receive SMS messages from Keiser University admissions at the mobile number I provided.

**Submit button:** Connect me with a counselor
**Cancel button:** Never mind

### 5b. Spanish

**Headline:** Antes de conectarte con un consejero

**Body:**

> Al marcar la casilla a continuación y proporcionar mi número de celular, autorizo a Keiser University a realizar o permitir la realización de llamadas, correos electrónicos y mensajes de texto recurrentes con fines de marketing al número de teléfono que he proporcionado, incluido el uso de tecnología automatizada o una voz pregrabada o artificial. Entiendo que no estoy obligado a proporcionar mi número de teléfono como condición para adquirir bienes, servicios o cualquier propiedad.
>
> Además, entiendo que:
> • Pueden aplicar tarifas estándar de mensajes y datos de mi operador de telefonía móvil.
> • La frecuencia de mensajes puede variar según mi interacción con el equipo de admisiones.
> • Puedo cancelar mi consentimiento en cualquier momento respondiendo STOP a cualquier mensaje que reciba. Después de responder STOP, dejaré de recibir mensajes SMS automatizados de Keiser University a ese número.
> • Puedo responder HELP para obtener ayuda.
> • Mi número de teléfono y el contenido de estos mensajes pueden ser almacenados por Keiser University y sus proveedores de servicios (incluidos Microsoft y YakChat) con fines de facilitar esta conversación, cumplimiento regulatorio y mantenimiento de registros.
> • Soy mayor de 18 años, o si soy menor de 18 años, mi padre, madre o tutor legal otorga su consentimiento en mi nombre.
>
> He leído el aviso de privacidad de Keiser University.

**Checkbox label:**

> He leído y acepto lo anterior. Doy mi consentimiento para recibir mensajes SMS del equipo de admisiones de Keiser University al número de celular que proporcioné.

**Submit button:** Conéctame con un consejero
**Cancel button:** Mejor no

---

## 6. Technical safeguards already implemented

| Safeguard | How it works |
| --- | --- |
| **Versioned consent** | Every record stores `consent_text_version`, currently `v0.2-DRAFT-2026-05-17`. Any change to the text requires a version bump. |
| **Cryptographic snapshot** | SHA-256 hash of the consent text and a full text snapshot stored per record. We can always prove which text any user agreed to. |
| **Anti-tamper** | Client must send the consent text it displayed; server re-renders the canonical version and refuses to record if they don't match byte-for-byte. |
| **Affirmative consent** | Submit button is disabled until the user checks the consent checkbox. |
| **Capture metadata** | IP address, user agent, timestamp, session ID, language, and the user's triggering question are all recorded. |
| **Opt-out honored before every send** | `sms_optouts` table is checked before any SMS dispatch. Fail-closed: if the check errors, the send is refused. |
| **STOP webhook** | YakChat STOP replies route to `/api/handoff/optout`, which appends to `sms_optouts`. STOP keywords honored: STOP, UNSUBSCRIBE, CANCEL, END, QUIT, STOPALL. |
| **Append-only storage** | `tcpa_consent` and `sms_optouts` are RLS-locked, service-role only. No deletes or updates from application code. |
| **Phone normalization** | Numbers normalized to US/CA E.164 only (`+1XXXXXXXXXX`); non-US/CA phones are rejected. |
| **Feature flag** | `YAKCHAT_HANDOFF_ENABLED` defaults to false. Button is invisible to users. No SMS infrastructure runs until counsel approves and the flag is flipped. |

---

## 7. Sign-off checklist

Please initial or strike each item:

- [ ] English consent text approved as drafted (Section 5a)
- [ ] English consent text approved with edits — strike or rewrite below:
- [ ] Spanish consent text approved as drafted (Section 5b)
- [ ] Spanish consent text approved with edits — strike or rewrite below:
- [ ] Affirmative-checkbox pattern approved (stricter than RFI click-submit)
- [ ] Retention period specified: _____________ years
- [ ] Privacy Policy hyperlink should be added to modal: Yes / No
- [ ] Sign-off authority for future text changes: _____________
- [ ] Approved to flip `YAKCHAT_HANDOFF_ENABLED=true` once IT provisions YakChat number and STOP webhook

**Reviewer name:** _______________________________
**Date:** _______________________________
**Approved consent version:** v0.____-_____________

---

*Once reviewed and approved, please return this memo to Robert Keiser. The consent text version stamp will be bumped from `-DRAFT` to a final version, the hash will be re-recorded in the source code, and the feature flag will be enabled in coordination with the YakChat administrator.*
