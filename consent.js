// consent.js — TCPA consent text, versioned. Imported by both the server (for
// hashing/persistence) and the client (for display). Any change to text MUST
// bump the version. The version is what we store alongside the user's consent
// record, so we always know exactly what they agreed to.
//
// **DRAFT — REQUIRES REVIEW BY KEISER LEGAL COUNSEL BEFORE GOING LIVE.**
//
// v0.2 design note (2026-05-17): The opening clause is the VERBATIM consent
// language already in production on https://www.keiseruniversity.edu/request-information/
// (the live RFI form, which has been operating under counsel's approval).
// We then layer six additional disclosures required by 2025 CTIA / 10DLC best
// practice for chatbot-originated SMS opt-in (STOP/HELP, frequency, carrier
// rates, named service providers, retention purpose, age-of-majority).
//
// This phrasing lets counsel's review become "are the additional disclosures
// acceptable?" rather than "is all of this acceptable?" — the anchor clause is
// already approved.

export const CONSENT_VERSION = 'v0.2-DRAFT-2026-05-17';

// English consent text.
// {{brand}} is replaced at runtime — for Keiser University, this renders as
// "Keiser University" so the RFI-anchor sentence matches the live RFI page
// word-for-word.
//
// PARAGRAPH 1 (anchor): VERBATIM from keiseruniversity.edu/request-information/
//   — already in counsel-approved production use.
// PARAGRAPH 2 (delta): Six additional disclosures aligned to 2025 CTIA / 10DLC
//   best practice for chatbot-originated SMS. New language relative to the RFI.
export const CONSENT_TEXT_EN = `By checking the box below and providing my mobile number, I authorize {{brand}} to make or allow the placement of recurring marketing calls, emails, and texts to me at the phone number that I have provided, including through the use of automated technology or a prerecorded or artificial voice. I understand that I am not required to provide my phone number as a condition of purchasing any property, goods, or services.

In addition, I understand that:
• Message and data rates from my mobile carrier may apply.
• Message frequency may vary depending on my engagement with the admissions team.
• I can opt out at any time by replying STOP to any message I receive. After I reply STOP, I will no longer receive automated SMS from {{brand}} at that number.
• I can reply HELP for assistance.
• My phone number and the contents of these messages may be stored by {{brand}} and its service providers (including Microsoft and YakChat) for the purposes of facilitating this conversation, regulatory compliance, and recordkeeping.
• I am at least 18 years of age, or if under 18, my parent or legal guardian consents on my behalf.

I have read the {{brand}} privacy notice.`;

// Spanish translation. Same legal substance; translated for clarity, NOT
// abridged. The anchor sentence mirrors the structure and force of the English
// RFI clause; if Keiser counsel has a preferred Spanish RFI translation already
// in use elsewhere, we should substitute that text verbatim before going live.
export const CONSENT_TEXT_ES = `Al marcar la casilla a continuación y proporcionar mi número de celular, autorizo a {{brand}} a realizar o permitir la realización de llamadas, correos electrónicos y mensajes de texto recurrentes con fines de marketing al número de teléfono que he proporcionado, incluido el uso de tecnología automatizada o una voz pregrabada o artificial. Entiendo que no estoy obligado a proporcionar mi número de teléfono como condición para adquirir bienes, servicios o cualquier propiedad.

Además, entiendo que:
• Pueden aplicar tarifas estándar de mensajes y datos de mi operador de telefonía móvil.
• La frecuencia de mensajes puede variar según mi interacción con el equipo de admisiones.
• Puedo cancelar mi consentimiento en cualquier momento respondiendo STOP a cualquier mensaje que reciba. Después de responder STOP, dejaré de recibir mensajes SMS automatizados de {{brand}} a ese número.
• Puedo responder HELP para obtener ayuda.
• Mi número de teléfono y el contenido de estos mensajes pueden ser almacenados por {{brand}} y sus proveedores de servicios (incluidos Microsoft y YakChat) con fines de facilitar esta conversación, cumplimiento regulatorio y mantenimiento de registros.
• Soy mayor de 18 años, o si soy menor de 18 años, mi padre, madre o tutor legal otorga su consentimiento en mi nombre.

He leído el aviso de privacidad de {{brand}}.`;

export const CONSENT_HEADLINE_EN = 'Before we connect you with a counselor';
export const CONSENT_HEADLINE_ES = 'Antes de conectarte con un consejero';

export const CONSENT_CHECKBOX_LABEL_EN = 'I have read and agree to the above. I consent to receive SMS messages from {{brand}} admissions at the mobile number I provided.';
export const CONSENT_CHECKBOX_LABEL_ES = 'He leído y acepto lo anterior. Doy mi consentimiento para recibir mensajes SMS del equipo de admisiones de {{brand}} al número de celular que proporcioné.';

export const CONSENT_SUBMIT_EN = 'Connect me with a counselor';
export const CONSENT_SUBMIT_ES = 'Conéctame con un consejero';

export const CONSENT_CANCEL_EN = 'Never mind';
export const CONSENT_CANCEL_ES = 'Mejor no';

export const TEXTS = {
  en: {
    version: CONSENT_VERSION,
    headline: CONSENT_HEADLINE_EN,
    body: CONSENT_TEXT_EN,
    checkbox: CONSENT_CHECKBOX_LABEL_EN,
    submit: CONSENT_SUBMIT_EN,
    cancel: CONSENT_CANCEL_EN,
    legalReviewNotice: 'DRAFT — pending legal review',
  },
  es: {
    version: CONSENT_VERSION,
    headline: CONSENT_HEADLINE_ES,
    body: CONSENT_TEXT_ES,
    checkbox: CONSENT_CHECKBOX_LABEL_ES,
    submit: CONSENT_SUBMIT_ES,
    cancel: CONSENT_CANCEL_ES,
    legalReviewNotice: 'BORRADOR — pendiente de revisión legal',
  },
};

// Render a consent text for a given lang + brand. Used both server-side
// (for hashing the snapshot) and client-side (for display).
export function renderConsent(lang, brand) {
  const t = TEXTS[lang] || TEXTS.en;
  return {
    version: t.version,
    headline: t.headline,
    body: t.body.replaceAll('{{brand}}', brand),
    checkbox: t.checkbox.replaceAll('{{brand}}', brand),
    submit: t.submit,
    cancel: t.cancel,
    legalReviewNotice: t.legalReviewNotice,
  };
}
