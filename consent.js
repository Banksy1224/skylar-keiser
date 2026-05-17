// consent.js — TCPA consent text, versioned. Imported by both the server (for
// hashing/persistence) and the client (for display). Any change to text MUST
// bump the version. The version is what we store alongside the user's consent
// record, so we always know exactly what they agreed to.
//
// **DRAFT — REQUIRES REVIEW BY KEISER LEGAL COUNSEL BEFORE GOING LIVE.**
// This text was drafted as "maximally conservative" by an AI assistant based on
// common TCPA-compliant patterns in U.S. higher-education admissions. It has
// NOT been reviewed by an attorney. Do not flip YAKCHAT_HANDOFF_ENABLED=true
// until this draft has been reviewed and approved by qualified legal counsel.

export const CONSENT_VERSION = 'v0.1-DRAFT-2026-05-17';

// English consent text. {{brand}} is replaced at runtime with the brand string.
// The text is intentionally long. Each clause exists to address a specific
// TCPA / FCC / state-law requirement. Trimming this without legal review is risky.
export const CONSENT_TEXT_EN = `By checking the box below and providing my mobile number, I expressly consent to receive text messages from {{brand}} and its admissions team at the mobile number I provided, including text messages sent using an automated system, autodialer, or pre-recorded voice technology, for the purpose of responding to my inquiry about academic programs and admissions.

I understand that:
• This consent is NOT a condition of admission, enrollment, or receiving any goods or services from {{brand}}.
• Message and data rates from my mobile carrier may apply.
• Message frequency may vary depending on my engagement with the admissions team.
• I can opt out at any time by replying STOP to any message I receive. After I reply STOP, I will no longer receive automated SMS from {{brand}} at that number.
• I can reply HELP for assistance.
• My phone number and the contents of these messages may be stored by {{brand}} and its service providers (including Microsoft and YakChat) for the purposes of facilitating this conversation, regulatory compliance, and recordkeeping.
• Standard text messaging carrier delivery is not guaranteed and timing of replies may vary.

I have read the {{brand}} privacy notice and I am at least 18 years of age, or if under 18, my parent or legal guardian consents on my behalf.`;

// Spanish translation. Same legal substance; translated for clarity, NOT
// abridged. If Spanish-speaking users will see this, this also requires legal
// review (translation accuracy is its own consent question).
export const CONSENT_TEXT_ES = `Al marcar la casilla a continuación y proporcionar mi número de celular, otorgo mi consentimiento expreso para recibir mensajes de texto de {{brand}} y de su equipo de admisiones al número de celular que indico, incluyendo mensajes de texto enviados mediante un sistema automatizado, marcador automático o tecnología de voz pregrabada, con el propósito de responder a mi consulta sobre programas académicos y admisiones.

Entiendo que:
• Este consentimiento NO es una condición de admisión, inscripción ni de recibir bienes o servicios de {{brand}}.
• Pueden aplicar tarifas estándar de mensajes y datos de mi operador de telefonía móvil.
• La frecuencia de mensajes puede variar según mi interacción con el equipo de admisiones.
• Puedo cancelar mi consentimiento en cualquier momento respondiendo STOP a cualquier mensaje que reciba. Después de responder STOP, dejaré de recibir mensajes SMS automatizados de {{brand}} a ese número.
• Puedo responder HELP para obtener ayuda.
• Mi número de teléfono y el contenido de estos mensajes pueden ser almacenados por {{brand}} y sus proveedores de servicios (incluidos Microsoft y YakChat) con fines de facilitar esta conversación, cumplimiento regulatorio y mantenimiento de registros.
• La entrega estándar de mensajes de texto no está garantizada y los tiempos de respuesta pueden variar.

He leído el aviso de privacidad de {{brand}} y soy mayor de 18 años, o si soy menor de 18 años, mi padre, madre o tutor legal otorga su consentimiento en mi nombre.`;

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
