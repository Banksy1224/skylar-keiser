// skylar-handoff.jsx — Live-counselor SMS handoff: feature-flag check,
// consent modal, lead submission. Loaded by index.html via Babel transform.
//
// Contract with server:
//   GET  /api/handoff/status        → { feature_flag_on, yakchat_configured, ... }
//   GET  /api/handoff/consent-text  → { version, headline, body, checkbox, submit, cancel, legalReviewNotice }
//   POST /api/handoff/consent       → { ok, mode }   // mode: 'sms_sent' | 'lead_recorded' | error
//
// The button only renders when feature_flag_on === true. If the server returns
// feature_flag_on=false, this entire module is a no-op for the user.

(function () {
  // Lazy load + cache the handoff status, the consent text, and a small
  // hook that components can use to decide whether to render the button.
  const STATUS_PROMISE = (typeof fetch === 'function')
    ? fetch('/api/handoff/status').then((r) => r.ok ? r.json() : { feature_flag_on: false }).catch(() => ({ feature_flag_on: false }))
    : Promise.resolve({ feature_flag_on: false });

  function useHandoffStatus() {
    const [status, setStatus] = React.useState(null);
    React.useEffect(() => { STATUS_PROMISE.then(setStatus); }, []);
    return status;
  }

  // Fetch the consent text (lang-aware). Cached per (lang, brand) pair.
  const CONSENT_CACHE = new Map();
  function fetchConsent(lang, brand) {
    const key = `${lang}::${brand}`;
    if (CONSENT_CACHE.has(key)) return CONSENT_CACHE.get(key);
    const p = fetch(`/api/handoff/consent-text?lang=${encodeURIComponent(lang)}&brand=${encodeURIComponent(brand)}`)
      .then((r) => r.json());
    CONSENT_CACHE.set(key, p);
    return p;
  }

  // ─── ConsentModal ───────────────────────────────────────────────────────
  function ConsentModal({ open, onClose, onSubmitted, lang, brand, contextQuestion, theme, sessionId }) {
    const [consent, setConsent] = React.useState(null);
    const [form, setForm] = React.useState({ first_name: '', last_name: '', email: '', phone: '', checked: false });
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      if (!open) return;
      fetchConsent(lang, brand).then(setConsent).catch(() => setError('Could not load consent text.'));
    }, [open, lang, brand]);

    if (!open) return null;

    const strings = lang === 'es'
      ? {
          firstName: 'Nombre', lastName: 'Apellido', email: 'Email',
          phone: 'Número de celular (EE.UU.)', phonePlaceholder: '305-555-1234',
          required: 'Requerido', loading: 'Cargando…', successSent: 'Enviado. Un consejero te enviará un mensaje pronto.',
          successLead: 'Recibimos tu solicitud. Un consejero te contactará pronto.',
          phoneInvalid: 'Por favor ingresa un número de teléfono válido de EE.UU.',
          optedOut: 'Este número ya optó por no recibir mensajes. Por favor contacta a admisiones por otro medio.',
          mismatch: 'No pudimos validar el texto del consentimiento. Por favor recarga e intenta de nuevo.',
          serverError: 'Algo salió mal. Por favor intenta de nuevo.',
          checkRequired: 'Por favor marca la casilla de consentimiento.',
          phoneRequired: 'Por favor ingresa tu número de celular.',
        }
      : {
          firstName: 'First name', lastName: 'Last name', email: 'Email',
          phone: 'Mobile number (U.S.)', phonePlaceholder: '305-555-1234',
          required: 'Required', loading: 'Loading…', successSent: 'Sent. A counselor will text you shortly.',
          successLead: 'Got it. A counselor will reach out shortly.',
          phoneInvalid: 'Please enter a valid U.S. phone number.',
          optedOut: 'This number is opted out of SMS. Please contact admissions another way.',
          mismatch: 'We could not validate the consent text. Please reload and try again.',
          serverError: 'Something went wrong. Please try again.',
          checkRequired: 'Please check the consent box.',
          phoneRequired: 'Please enter your mobile number.',
        };

    async function submit() {
      setError(null);
      if (!form.phone.trim()) { setError(strings.phoneRequired); return; }
      if (!form.checked) { setError(strings.checkRequired); return; }
      if (!consent) { setError(strings.loading); return; }
      setSubmitting(true);
      try {
        const res = await fetch('/api/handoff/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            phone: form.phone,
            first_name: form.first_name || null,
            last_name: form.last_name || null,
            email: form.email || null,
            lang, brand,
            consent_text_version: consent.version,
            consent_text_snapshot: consent.body,
            context_question: contextQuestion,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          const reasonMap = {
            invalid_phone: strings.phoneInvalid,
            phone_opted_out: strings.optedOut,
            consent_text_mismatch: strings.mismatch,
          };
          setError(reasonMap[data.reason] || strings.serverError);
          setSubmitting(false);
          return;
        }
        onSubmitted({ mode: data.mode, message: data.mode === 'sms_sent' ? strings.successSent : strings.successLead });
      } catch (e) {
        setError(strings.serverError);
        setSubmitting(false);
      }
    }

    const overlay = {
      position: 'fixed', inset: 0, background: 'rgba(11,37,69,.62)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      padding: 16,
    };
    const panel = {
      background: '#fff', borderRadius: 16, maxWidth: 560, width: '100%',
      maxHeight: '92vh', overflow: 'auto', padding: 24,
      boxShadow: '0 20px 60px rgba(11,37,69,.35)',
      fontFamily: 'inherit',
    };
    const label = { fontSize: 12, fontWeight: 600, color: theme && theme.navy || '#0b2545', marginBottom: 4, display: 'block' };
    const input = {
      width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: 14,
      border: `1px solid ${(theme && theme.border) || 'rgba(11,37,69,.18)'}`,
      borderRadius: 10, fontFamily: 'inherit', marginBottom: 10,
    };

    return React.createElement('div', { style: overlay, onClick: (e) => { if (e.target === e.currentTarget) onClose(); } },
      React.createElement('div', { style: panel, role: 'dialog', 'aria-modal': 'true' },
        consent && React.createElement('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#b04040', marginBottom: 6 } }, consent.legalReviewNotice),
        React.createElement('h2', { style: { margin: '0 0 12px', fontSize: 20, color: theme && theme.navy || '#0b2545' } }, consent ? consent.headline : strings.loading),
        consent && React.createElement('div', { style: { fontSize: 13, lineHeight: 1.55, color: '#333', whiteSpace: 'pre-wrap', marginBottom: 14, padding: 12, background: '#f7f6f1', borderRadius: 10 } }, consent.body),
        // Form fields
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
          React.createElement('div', null,
            React.createElement('label', { style: label }, strings.firstName),
            React.createElement('input', { style: input, value: form.first_name, onChange: (e) => setForm({ ...form, first_name: e.target.value }) })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: label }, strings.lastName),
            React.createElement('input', { style: input, value: form.last_name, onChange: (e) => setForm({ ...form, last_name: e.target.value }) })
          ),
        ),
        React.createElement('label', { style: label }, strings.email),
        React.createElement('input', { style: input, type: 'email', value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }) }),
        React.createElement('label', { style: label }, strings.phone, ' ', React.createElement('span', { style: { color: '#b04040' } }, '*')),
        React.createElement('input', { style: input, type: 'tel', placeholder: strings.phonePlaceholder, value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) }),
        // Checkbox
        consent && React.createElement('label', { style: { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, lineHeight: 1.5, color: '#222', marginBottom: 12, cursor: 'pointer' } },
          React.createElement('input', { type: 'checkbox', checked: form.checked, onChange: (e) => setForm({ ...form, checked: e.target.checked }), style: { marginTop: 3 } }),
          React.createElement('span', null, consent.checkbox)
        ),
        // Error
        error && React.createElement('div', { style: { fontSize: 13, color: '#b04040', marginBottom: 10 } }, error),
        // Buttons
        React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } },
          React.createElement('button', {
            onClick: onClose, disabled: submitting,
            style: { padding: '9px 16px', fontSize: 14, borderRadius: 999, border: '1px solid rgba(11,37,69,.18)', background: '#fff', color: theme && theme.navy || '#0b2545', cursor: 'pointer' }
          }, consent ? consent.cancel : '…'),
          React.createElement('button', {
            onClick: submit, disabled: submitting || !consent,
            style: { padding: '9px 16px', fontSize: 14, borderRadius: 999, border: 'none', background: (theme && theme.gold) || '#f0b75a', color: theme && theme.navy || '#0b2545', fontWeight: 700, cursor: 'pointer', opacity: submitting ? .6 : 1 }
          }, submitting ? '…' : (consent ? consent.submit : '…'))
        )
      )
    );
  }

  // ─── Export to window ─────────────────────────────────────────────────
  Object.assign(window, {
    useHandoffStatus,
    ConsentModal,
  });
})();
