// skylar-chat-v2.jsx — adds FAQ-grounded RAG-style retrieval + sources chips.
// Replaces useSkylarThread for the v2 file.

const SCRIPTED_OPENERS_V2 = {
  warm:  "Hi! I'm Skylar 🦅 — your guide to {{brand}}. I can answer questions about programs, applying, campus life, and what to expect. What would you like to know?",
  peppy: "Hi hi hi! 🦅 I'm Skylar from {{brand}} and I'm here to help! What can I dig up for you today??",
  witty: "Skylar reporting in. 🦅 Ask me about {{brand}} — programs, applying, life on campus, the works.",
  calm:  "Hello — I'm Skylar. I can help you explore {{brand}}: programs, admissions, and campus life. Where would you like to start?",
};

const PERSONA_PROMPT_V2 = {
  warm:  "You are Skylar, the warm and supportive seahawk mascot of {{brand}}. You talk to prospective students like a kind older sibling: encouraging, calm, never pushy.",
  peppy: "You are Skylar, the peppy seahawk mascot of {{brand}}. Spirited and exclamation-friendly, but never overwhelming.",
  witty: "You are Skylar, the witty seahawk mascot of {{brand}}. Dry, charming, lightly self-aware, never sarcastic at the student's expense.",
  calm:  "You are Skylar, the calm and professional helper mascot of {{brand}}. Concise, neutral, factual where possible.",
};

// Tiny keyword retriever — scores each FAQ by overlap with the question.
// Returns up to `k` results above threshold, plus their indices for "sources" chips.
function retrieveFAQs(question, faqs, k = 3) {
  if (!faqs || !faqs.length || !question) return [];
  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const stop = new Set(['the','a','an','is','are','do','does','i','you','what','how','when','where','to','for','of','in','on','my','me','can','about','tell','please','with','this','that','will','be','it']);
  const qTokens = norm(question).split(/\s+/).filter((t) => t && !stop.has(t) && t.length > 2);
  if (!qTokens.length) return [];
  const scored = faqs.map((f, idx) => {
    const hay = norm((f.q || '') + ' ' + (f.a || '') + ' ' + (f.tags || []).join(' '));
    let score = 0;
    for (const tok of qTokens) {
      if (hay.includes(tok)) score += 1;
      // bonus if it appears in the question text itself
      if (norm(f.q || '').includes(tok)) score += 0.6;
    }
    return { idx, score, faq: f };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score >= 1).slice(0, k);
}

function useSkylarThreadV2({ persona = 'warm', initialChips = [], brand = 'Keiser University', faqs = [] } = {}) {
  const opener = (SCRIPTED_OPENERS_V2[persona] || SCRIPTED_OPENERS_V2.warm).replaceAll('{{brand}}', brand);
  const [messages, setMessages] = React.useState([
    { id: 'm0', role: 'skylar', text: opener, reactions: [], sources: [] },
  ]);
  const [typing, setTyping] = React.useState(false);
  const [chips, setChips] = React.useState(initialChips);

  React.useEffect(() => {
    setMessages((m) => {
      if (m.length === 1 && m[0].role === 'skylar') {
        return [{ ...m[0], text: opener }];
      }
      return m;
    });
  }, [opener]);

  React.useEffect(() => {
    setChips(initialChips);
  }, [initialChips.join('|')]);

  const send = React.useCallback(async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = { id: 'u' + Date.now(), role: 'user', text: text.trim(), reactions: [] };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    setChips([]);

    const hits = retrieveFAQs(text.trim(), faqs, 3);
    const context = hits.length
      ? hits.map((h, i) => `[${i + 1}] Q: ${h.faq.q}\nA: ${h.faq.a}`).join('\n\n')
      : '(no relevant FAQs found)';

    const persona_prompt = (PERSONA_PROMPT_V2[persona] || PERSONA_PROMPT_V2.warm).replaceAll('{{brand}}', brand);

    const system = `${persona_prompt}

You answer ONLY using the FAQ context below. Keep replies under 70 words. End with a gentle next-step question.

Rules:
- If the FAQ context covers the question, answer using only that information.
- If it does NOT cover the question, say something like: "I don't have that one in my notes — for the most accurate answer, the ${brand} admissions team can help." Then suggest a related topic if one's in the context.
- Never invent facts, tuition figures, deadlines, or accreditation claims.
- Use plain language. Use the 🦅 emoji at most once. Don't mention "FAQ" or "context" by name.

FAQ context:
${context}

The student just asked: "${text.trim()}"`;

    let reply = "";
    try {
      reply = await window.claude.complete({ messages: [{ role: 'user', content: system }] });
    } catch (e) {
      reply = "Hmm — my signal dropped for a sec. Could you try that again?";
    }
    await new Promise((r) => setTimeout(r, 350));
    setMessages((m) => [...m, {
      id: 's' + Date.now(),
      role: 'skylar',
      text: reply.trim(),
      reactions: [],
      sources: hits.map((h) => ({ idx: h.idx, q: h.faq.q })),
    }]);
    setTyping(false);
  }, [persona, brand, faqs]);

  const react = React.useCallback((msgId, emoji) => {
    setMessages((m) => m.map((msg) => {
      if (msg.id !== msgId) return msg;
      const has = msg.reactions.includes(emoji);
      return { ...msg, reactions: has ? msg.reactions.filter((e) => e !== emoji) : [...msg.reactions, emoji] };
    }));
  }, []);

  return { messages, typing, chips, send, react, setChips };
}

// Bubble v2 — adds "Sources" footer when message has source FAQs.
function BubbleV2({ msg, theme, onReact, showAvatar = false, AvatarSlot = null, dense = false }) {
  const isUser = msg.role === 'user';
  const [hover, setHover] = React.useState(false);
  const wrap = {
    display: 'flex', gap: 8, alignItems: 'flex-end',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    margin: dense ? '6px 0' : '10px 0',
    animation: 'sky-bubble-in .28s cubic-bezier(.2,.7,.3,1)',
  };
  const bubble = {
    maxWidth: '100%', padding: dense ? '8px 12px' : '11px 14px',
    borderRadius: 18,
    background: isUser ? theme.userBg : theme.skylarBg,
    color: isUser ? theme.userText : theme.skylarText,
    border: isUser ? 'none' : `1px solid ${theme.border}`,
    fontSize: 14.5, lineHeight: 1.5, position: 'relative',
    borderBottomRightRadius: isUser ? 6 : 18,
    borderBottomLeftRadius: isUser ? 18 : 6,
  };
  return (
    <div style={wrap} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {!isUser && showAvatar && <div style={{ flex: '0 0 auto' }}>{AvatarSlot}</div>}
      <div style={{ position: 'relative', maxWidth: '82%' }}>
        <div style={bubble}>{msg.text}</div>

        {/* Sources */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div style={{
            marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center',
          }}>
            <span style={{
              fontSize: 10.5, color: 'rgba(11,37,69,.5)', letterSpacing: '.06em',
              textTransform: 'uppercase', marginRight: 2, fontWeight: 500,
            }}>Sourced from</span>
            {msg.sources.map((s, i) => (
              <span key={i} title={s.q} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 999,
                background: theme.surface, border: `1px solid ${theme.border}`,
                color: theme.navy, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap', cursor: 'default',
              }}>{s.q}</span>
            ))}
          </div>
        )}

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
            position: 'absolute', top: -14, left: 10,
            display: 'flex', gap: 2, background: theme.surface, padding: '3px 4px',
            borderRadius: 999, border: `1px solid ${theme.border}`,
            boxShadow: '0 4px 12px rgba(11,37,69,.10)', zIndex: 3,
          }}>
            {['👏', '🦅', '❤️'].map((e) => (
              <button key={e} onClick={() => onReact(msg.id, e)} style={{
                background: 'transparent', border: 0, cursor: 'pointer',
                fontSize: 14, padding: '2px 4px', lineHeight: 1, borderRadius: 6,
              }}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { useSkylarThreadV2, BubbleV2, retrieveFAQs });
