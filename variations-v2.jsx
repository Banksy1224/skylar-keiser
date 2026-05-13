// variations-v2.jsx — Variation B, branded-for-anyone edition.
// - <image-slot> for the school logo
// - editable wordmark via tweaks
// - configurable brand colors (any palette)
// - FAQ-grounded chat with source attribution

function VariationImmersiveV2({ tweaks, theme }) {
  const initialChips = React.useMemo(() => tweaks.chips, [tweaks.chips.join('|')]);
  const { messages, typing, chips, send, react } = useSkylarThreadV2({
    persona: tweaks.persona,
    initialChips,
    brand: tweaks.brand,
    faqs: tweaks.faqs,
  });
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  // Derived colors
  const navy = theme.navy;
  const gold = theme.gold;
  const cream = theme.cream;

  return (
    <ChromeWindow
      tabs={[{ title: `Meet Skylar — ${tweaks.brand}` }]}
      url={`${tweaks.brand.toLowerCase().replace(/[^a-z0-9]+/g, '')}.edu/skylar`}
      width={1280} height={820}
    >
      <div style={{
        width: '100%', height: '100%',
        background: cream, fontFamily: '"Geist", "Inter", system-ui, sans-serif',
        display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 0,
      }}>
        {/* ── LEFT: brand + mascot stage ────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(160deg, ${lighten(navy, 0.12)} 0%, ${navy} 55%, ${darken(navy, 0.5)} 100%)`,
          color: '#fff', padding: '36px 48px 32px', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* halo rings */}
          <svg viewBox="0 0 600 800" width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.16, pointerEvents: 'none' }}>
            {[120, 200, 290, 400, 520].map((r, i) => (
              <circle key={i} cx="300" cy="520" r={r} stroke={gold} strokeWidth="1" fill="none" />
            ))}
          </svg>

          {/* Brand lockup — logo slot + editable wordmark */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
            <image-slot
              id="brand-logo"
              shape="rounded"
              radius="8"
              placeholder="Logo"
              style={{ width: 44, height: 44, flex: '0 0 auto', background: 'rgba(255,255,255,.08)', border: '1px dashed rgba(255,255,255,.3)' }}
            ></image-slot>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.08 }}>
              <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, letterSpacing: '.005em' }}>
                {tweaks.brand}
              </span>
              <span style={{ fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', marginTop: 2 }}>
                {tweaks.tagline}
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2, marginTop: 36 }}>
            <span style={{
              fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase',
              color: gold, fontWeight: 600,
            }}>Future students</span>
            <h1 style={{
              fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400,
              fontSize: 64, lineHeight: 1.02, letterSpacing: '-.015em', margin: '12px 0 12px',
            }}>
              Meet <em style={{ color: gold, fontStyle: 'italic' }}>Skylar</em>.
            </h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.55, color: 'rgba(255,255,255,.78)', maxWidth: 440, margin: 0 }}>
              Your guide to life at {tweaks.brand}. Ask about programs, applying,
              what dorm life is really like, or what folks do on a Tuesday night.
            </p>
          </div>

          {/* big mascot stage — real Skylar video */}
          <div style={{ position: 'relative', zIndex: 2, margin: '28px 0 18px' }}>
            <div style={{
              width: '100%', aspectRatio: '16 / 10', borderRadius: 22, position: 'relative', overflow: 'hidden',
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.10)',
              boxShadow: '0 24px 60px rgba(0,0,0,.4)',
            }}>
              <video src={SKYLAR_VIDEO_SRC} autoPlay loop muted playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,.45) 100%)' }} />
              <div style={{
                position: 'absolute', left: 14, bottom: 12, right: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                color: 'rgba(255,255,255,.92)', fontSize: 12, letterSpacing: '.04em',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff4d4d', boxShadow: '0 0 0 4px rgba(255,77,77,.18)' }} />
                  LIVE · Skylar
                </span>
                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 10.5, opacity: 0.7 }}>looping</span>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 18, fontSize: 11.5, color: 'rgba(255,255,255,.55)', marginTop: 'auto' }}>
            <span>Grounded in {tweaks.faqs.length} FAQs</span>
            <span>· Replies under 2s</span>
            <span>· Hand-off to admissions any time</span>
          </div>
        </div>

        {/* ── RIGHT: chat panel ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '32px 32px 26px', background: cream }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mascot style="video" size={40} navy={navy} gold={gold} cream={cream} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: navy }}>Skylar</div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3ab369' }} />
                  Online · Grounded in {tweaks.faqs.length} FAQs
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Programs', 'Apply', 'Visit'].map((t) => (
                <button key={t} style={{
                  background: '#fff', border: `1px solid ${theme.border}`, color: navy,
                  borderRadius: 999, padding: '6px 12px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
          </div>

          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto', padding: '14px 16px',
            background: '#fff', borderRadius: 18, border: `1px solid ${theme.border}`,
          }}>
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const showAvatar = m.role === 'skylar' && (!prev || prev.role !== 'skylar');
              return (
                <BubbleV2 key={m.id} msg={m} theme={theme} onReact={react}
                  showAvatar={showAvatar}
                  AvatarSlot={<Mascot style="video" size={28} navy={navy} gold={gold} cream={cream} />} />
              );
            })}
            {typing && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', margin: '10px 0' }}>
                <Mascot style="video" size={28} navy={navy} gold={gold} cream={cream} />
                <div style={{
                  background: theme.skylarBg, border: `1px solid ${theme.border}`,
                  padding: '8px 12px', borderRadius: 18, borderBottomLeftRadius: 6,
                }}>
                  <TypingDots color={navy} />
                </div>
              </div>
            )}
            <QuickChips chips={chips} onPick={send} theme={theme} />
          </div>

          <div style={{ marginTop: 14 }}>
            <Composer onSend={send} theme={theme} placeholder="Ask Skylar anything…" />
            <div style={{ fontSize: 10.5, color: 'rgba(0,0,0,.4)', marginTop: 8, textAlign: 'center', letterSpacing: '.04em' }}>
              Skylar answers from your loaded FAQs. For specifics, double-check with admissions.
            </div>
          </div>
        </div>
      </div>
    </ChromeWindow>
  );
}

// tiny color helpers
function _hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function _rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('');
}
function lighten(hex, amt) {
  const [r, g, b] = _hexToRgb(hex);
  return _rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}
function darken(hex, amt) {
  const [r, g, b] = _hexToRgb(hex);
  return _rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}

Object.assign(window, { VariationImmersiveV2 });
