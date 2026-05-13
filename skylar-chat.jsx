// skylar-chat.jsx — shared chat building blocks used by all 3 variations.

const SCRIPTED_OPENERS = {
  warm: "Hey there! 🦅 I'm Skylar. Thinking about coming to school here? I'd love to help — ask me anything about programs, life on campus, or even just what folks like to do around here.",
  peppy: "Hi hi hi! 🦅 So glad you stopped by! I'm Skylar, your campus sidekick. What can I help you figure out today??",
  witty: "Skylar here, fully caffeinated and ready. 🦅 What brings you in — programs, vibes, or just curious?",
  calm: "Hello, I'm Skylar. I can help you explore programs, campus life, and what your day-to-day might look like as a student. Where would you like to start?",
};

const PERSONA_PROMPT = {
  warm: "You are Skylar, the warm and supportive seahawk mascot of a coastal university. You talk to prospective students like a kind older sibling: encouraging, calm, never pushy. Keep replies under 80 words, use plain language, and end with a gentle question that keeps the conversation moving. Use 🦅 sparingly. Do not invent specific tuition figures, deadlines, or accreditation claims; if asked, suggest they check the official admissions page.",
  peppy: "You are Skylar, the peppy seahawk mascot. Spirited, exclamation-friendly, but never overwhelming. Keep replies under 70 words and end with a helpful next-step question. Use 🦅 once at most. Don't fabricate facts — point to admissions for hard numbers.",
  witty: "You are Skylar, a witty seahawk mascot. Dry, charming, lightly self-aware. Keep replies under 70 words, never sarcastic at the student's expense. End with a question. 🦅 max once. No invented tuition/deadlines.",
  calm: "You are Skylar, a calm, professional helper mascot. Concise, neutral, factual where possible. Replies under 80 words. End with a clarifying question. No 🦅. Don't fabricate facts; point to admissions for specifics.",
};

const DEFAULT_CHIPS = [
  "What programs do you offer?",
  "Tell me about campus life",
  "How do I apply?",
  "What's a typical day like?",
];

function useSkylarThread({ persona = 'warm', initialChips = DEFAULT_CHIPS } = {}) {
  const [messages, setMessages] = React.useState([
    { id: 'm0', role: 'skylar', text: SCRIPTED_OPENERS[persona] || SCRIPTED_OPENERS.warm, reactions: [] },
  ]);
  const [typing, setTyping] = React.useState(false);
  const [chips, setChips] = React.useState(initialChips);

  // refresh opener when persona changes (only if thread is still just the opener)
  React.useEffect(() => {
    setMessages((m) => {
      if (m.length === 1 && m[0].role === 'skylar') {
        return [{ ...m[0], text: SCRIPTED_OPENERS[persona] || SCRIPTED_OPENERS.warm }];
      }
      return m;
    });
  }, [persona]);

  const send = React.useCallback(async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = { id: 'u' + Date.now(), role: 'user', text: text.trim(), reactions: [] };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    setChips([]); // hide chips after first user msg

    // Build conversation history for the model
    const history = [
      { role: 'user', content: `${PERSONA_PROMPT[persona] || PERSONA_PROMPT.warm}\n\nThe student just said: "${text.trim()}"` },
    ];

    let reply = "";
    try {
      reply = await window.claude.complete({ messages: history });
    } catch (e) {
      reply = "Hmm — my signal dropped for a sec. Could you try that again?";
    }
    // small artificial delay so the typing indicator is visible
    await new Promise((r) => setTimeout(r, 350));
    setMessages((m) => [...m, { id: 's' + Date.now(), role: 'skylar', text: reply.trim(), reactions: [] }]);
    setTyping(false);
  }, [persona]);

  const react = React.useCallback((msgId, emoji) => {
    setMessages((m) => m.map((msg) => {
      if (msg.id !== msgId) return msg;
      const has = msg.reactions.includes(emoji);
      return { ...msg, reactions: has ? msg.reactions.filter((e) => e !== emoji) : [...msg.reactions, emoji] };
    }));
  }, []);

  return { messages, typing, chips, send, react, setChips };
}

// ─────── Visual atoms ───────

function TypingDots({ color = '#0b2545' }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', padding: '4px 2px' }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: color, opacity: 0.6,
          animation: `sky-dot 1.2s ${i * 0.15}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`@keyframes sky-dot { 0%,80%,100%{transform:translateY(0);opacity:.35} 40%{transform:translateY(-3px);opacity:.95} }`}</style>
    </span>
  );
}

// Bubble — has hover reactions row. Subtle entry animation.
function Bubble({ msg, theme, onReact, showAvatar = false, AvatarSlot = null, dense = false }) {
  const isUser = msg.role === 'user';
  const [hover, setHover] = React.useState(false);
  const wrap = {
    display: 'flex', gap: 8, alignItems: 'flex-end',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    margin: dense ? '6px 0' : '10px 0',
    animation: 'sky-bubble-in .28s cubic-bezier(.2,.7,.3,1)',
  };
  const bubble = {
    maxWidth: '78%', padding: dense ? '8px 12px' : '11px 14px',
    borderRadius: 18,
    background: isUser ? theme.userBg : theme.skylarBg,
    color: isUser ? theme.userText : theme.skylarText,
    border: isUser ? 'none' : `1px solid ${theme.border}`,
    fontSize: 14.5, lineHeight: 1.45, position: 'relative',
    boxShadow: isUser ? `0 1px 0 ${theme.userBg}` : '0 1px 2px rgba(11,37,69,.04)',
    borderBottomRightRadius: isUser ? 6 : 18,
    borderBottomLeftRadius: isUser ? 18 : 6,
  };
  return (
    <div style={wrap} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {!isUser && showAvatar && <div style={{ flex: '0 0 auto' }}>{AvatarSlot}</div>}
      <div style={{ position: 'relative', maxWidth: '78%' }}>
        <div style={bubble}>{msg.text}</div>
        {msg.reactions.length > 0 && (
          <div style={{
            position: 'absolute', bottom: -10, [isUser ? 'right' : 'left']: 8,
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: 999, padding: '2px 8px', fontSize: 12, display: 'flex', gap: 4,
            boxShadow: '0 2px 6px rgba(11,37,69,.08)',
          }}>
            {msg.reactions.map((e, i) => <span key={i}>{e}</span>)}
          </div>
        )}
        {hover && !isUser && (
          <div style={{
            position: 'absolute', top: -14, [isUser ? 'right' : 'left']: 10,
            display: 'flex', gap: 2, background: theme.surface, padding: '3px 4px',
            borderRadius: 999, border: `1px solid ${theme.border}`,
            boxShadow: '0 4px 12px rgba(11,37,69,.10)', zIndex: 3,
          }}>
            {['👏', '🦅', '❤️'].map((e) => (
              <button key={e} onClick={() => onReact(msg.id, e)} style={{
                background: 'transparent', border: 0, cursor: 'pointer',
                fontSize: 14, padding: '2px 4px', lineHeight: 1, borderRadius: 6,
              }} onMouseEnter={(ev) => ev.currentTarget.style.background = 'rgba(0,0,0,.06)'}
                 onMouseLeave={(ev) => ev.currentTarget.style.background = 'transparent'}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes sky-bubble-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

function QuickChips({ chips, onPick, theme }) {
  if (!chips || !chips.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 2px 10px' }}>
      {chips.map((c, i) => (
        <button key={i} onClick={() => onPick(c)} style={{
          background: theme.chipBg, color: theme.chipText,
          border: `1px solid ${theme.chipBorder}`, borderRadius: 999,
          padding: '7px 12px', fontSize: 12.5, fontFamily: 'inherit',
          cursor: 'pointer', transition: 'background .15s, transform .15s',
          animation: `sky-chip-in .32s ${i * 0.05}s both cubic-bezier(.2,.7,.3,1)`,
        }} onMouseEnter={(e) => { e.currentTarget.style.background = theme.chipHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
           onMouseLeave={(e) => { e.currentTarget.style.background = theme.chipBg; e.currentTarget.style.transform = 'translateY(0)'; }}>
          {c}
        </button>
      ))}
      <style>{`@keyframes sky-chip-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

// Composer with mic + send
function Composer({ onSend, theme, placeholder = 'Message Skylar…', compact = false }) {
  const [val, setVal] = React.useState('');
  const submit = () => { if (val.trim()) { onSend(val); setVal(''); } };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: compact ? '8px 8px 8px 14px' : '10px 10px 10px 16px',
      background: theme.surface, border: `1px solid ${theme.border}`,
      borderRadius: 999, boxShadow: '0 1px 2px rgba(11,37,69,.04)',
    }}>
      <input value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder={placeholder}
        style={{
          flex: 1, border: 0, outline: 0, background: 'transparent',
          color: theme.text, fontSize: 14.5, fontFamily: 'inherit', padding: '4px 0',
        }} />
      <button title="Voice input" style={{
        width: 32, height: 32, borderRadius: '50%', border: 0, cursor: 'pointer',
        background: 'transparent', color: theme.subtle, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(11,37,69,.06)'}
         onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/>
        </svg>
      </button>
      <button onClick={submit} disabled={!val.trim()} title="Send" style={{
        width: 34, height: 34, borderRadius: '50%', border: 0, cursor: val.trim() ? 'pointer' : 'default',
        background: val.trim() ? theme.send : theme.sendDim, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background .15s, transform .1s',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="6"/><polyline points="5 13 12 6 19 13"/>
        </svg>
      </button>
    </div>
  );
}

// Theme builder from palette
function makeTheme({ navy = '#0b2545', gold = '#d4a83a', cream = '#f7f2e6', text = '#1a1d24' } = {}) {
  return {
    navy, gold, cream, text,
    surface: '#ffffff',
    border: 'rgba(11,37,69,.10)',
    skylarBg: '#f6f1e3',
    skylarText: '#1a1d24',
    userBg: navy,
    userText: '#ffffff',
    chipBg: '#ffffff',
    chipBorder: 'rgba(11,37,69,.15)',
    chipText: navy,
    chipHover: '#f6f1e3',
    send: navy,
    sendDim: 'rgba(11,37,69,.25)',
    subtle: 'rgba(11,37,69,.5)',
  };
}

Object.assign(window, {
  useSkylarThread, TypingDots, Bubble, QuickChips, Composer, makeTheme,
  DEFAULT_CHIPS,
});
