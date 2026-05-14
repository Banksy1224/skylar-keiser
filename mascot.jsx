// mascot.jsx — Original abstract seahawk avatar (geometric, not branded).
// Three styles, all draw an idle bob + breathing animation.

const MASCOT_KEYFRAMES = `
@keyframes sky-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
@keyframes sky-blink { 0%,92%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.1)} }
@keyframes sky-wing { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(6deg)} }
@keyframes sky-pulse { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.9;transform:scale(1.08)} }
@keyframes sky-orbit { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;
if (typeof document !== 'undefined' && !document.getElementById('mascot-styles')) {
  const s = document.createElement('style');
  s.id = 'mascot-styles';
  s.textContent = MASCOT_KEYFRAMES;
  document.head.appendChild(s);
}

// Style A — Crest mark: shield-ish circular badge with abstract wing chevron.
function MascotCrest({ size = 64, navy = '#0b2545', gold = '#d4a83a', ring = '#f7f2e6' }) {
  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'inline-flex' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 30% 25%, ${navy} 0%, ${navy} 55%, #061a36 100%)`,
        boxShadow: `0 6px 18px ${navy}55, inset 0 0 0 2px ${ring}`,
        animation: 'sky-bob 3.6s ease-in-out infinite',
      }} />
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'relative', animation: 'sky-bob 3.6s ease-in-out infinite' }}>
        {/* abstract wing chevrons */}
        <path d="M22 62 L40 44 L46 54 L34 66 Z" fill={gold} opacity="0.95"/>
        <path d="M38 58 L56 38 L64 50 L48 64 Z" fill={gold}/>
        <path d="M54 56 L72 38 L78 50 L62 62 Z" fill={gold} opacity="0.8"/>
        {/* eye dot */}
        <circle cx="70" cy="34" r="3" fill={ring} />
      </svg>
    </div>
  );
}

// Style B — Geo bird: circular face with two eyes, a beak triangle, animated wing.
function MascotGeo({ size = 64, navy = '#0b2545', gold = '#d4a83a', cream = '#f7f2e6' }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: navy,
        boxShadow: `0 6px 18px ${navy}55`,
        overflow: 'hidden',
      }}>
        {/* soft gold halo */}
        <div style={{
          position: 'absolute', inset: '15%', borderRadius: '50%',
          background: `radial-gradient(circle, ${gold}22, transparent 70%)`,
          animation: 'sky-pulse 2.8s ease-in-out infinite',
        }} />
      </div>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'relative' }}>
        {/* wing (animated) */}
        <g style={{ transformOrigin: '52px 52px', animation: 'sky-wing 2.4s ease-in-out infinite' }}>
          <path d="M50 52 Q34 44 24 58 Q40 56 50 64 Z" fill={gold}/>
        </g>
        {/* eyes */}
        <g style={{ transformOrigin: '50px 42px', animation: 'sky-blink 4.2s ease-in-out infinite' }}>
          <circle cx="42" cy="42" r="4.2" fill={cream}/>
          <circle cx="58" cy="42" r="4.2" fill={cream}/>
          <circle cx="43" cy="43" r="2" fill={navy}/>
          <circle cx="59" cy="43" r="2" fill={navy}/>
        </g>
        {/* beak */}
        <path d="M48 50 L52 50 L50 56 Z" fill={gold}/>
      </svg>
    </div>
  );
}

// Style C — Minimal monogram: solid disk with S glyph.
function MascotMono({ size = 64, navy = '#0b2545', gold = '#d4a83a', cream = '#f7f2e6' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${navy} 0%, #14315c 100%)`,
      boxShadow: `0 6px 18px ${navy}55, inset 0 -2px 6px rgba(0,0,0,.25)`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      animation: 'sky-bob 3.6s ease-in-out infinite',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `conic-gradient(from 200deg, transparent 0%, ${gold}15 30%, transparent 60%)`,
        animation: 'sky-orbit 8s linear infinite',
      }} />
      <span style={{
        fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif',
        fontSize: size * 0.62, color: gold, fontWeight: 400,
        lineHeight: 1, position: 'relative', fontStyle: 'italic',
        marginTop: -size * 0.04,
      }}>S</span>
    </div>
  );
}

// Style D — Video: real Skylar clip looped silently in a circular avatar.
// Falls back to MascotGeo if the video errors (e.g. file missing).
const SKYLAR_VIDEO_SRC = "uploads/World Cup Skylar Video.mp4";
function MascotVideo({ size = 64, navy = '#0b2545', gold = '#d4a83a', cream = '#f7f2e6', objectPosition = '50% 55%' }) {
  const [errored, setErrored] = React.useState(false);
  if (errored) return <MascotGeo size={size} navy={navy} gold={gold} cream={cream} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden',
      background: navy, position: 'relative',
      boxShadow: `0 6px 18px ${navy}55, inset 0 0 0 2px ${cream}`,
    }}>
      <video
        src={SKYLAR_VIDEO_SRC}
        autoPlay loop muted playsInline
        onError={() => setErrored(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition, display: 'block' }}
      />
    </div>
  );
}

function Mascot({ style = 'video', size = 64, ...rest }) {
  if (style === 'crest') return <MascotCrest size={size} {...rest} />;
  if (style === 'mono')  return <MascotMono  size={size} {...rest} />;
  if (style === 'geo')   return <MascotGeo size={size} {...rest} />;
  return <MascotVideo size={size} {...rest} />;
}

// Big mascot stage — full-bleed Skylar video with the existing scene framing.
function MascotStage({ style = 'video', navy = '#0b2545', gold = '#d4a83a', cream = '#f7f2e6', height = 320 }) {
  const [errored, setErrored] = React.useState(false);
  return (
    <div style={{
      width: '100%', height, borderRadius: 20, position: 'relative', overflow: 'hidden',
      background: `radial-gradient(120% 80% at 50% 20%, #14315c 0%, ${navy} 60%, #04132b 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* radial rings backdrop */}
      <svg viewBox="0 0 400 400" width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
        {[60, 110, 170, 240].map((r, i) => (
          <circle key={i} cx="200" cy="220" r={r} stroke={gold} strokeWidth="1" fill="none" />
        ))}
      </svg>
      {style === 'video' && !errored ? (
        <video src={SKYLAR_VIDEO_SRC} autoPlay loop muted playsInline
          onError={() => setErrored(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Mascot style={errored ? 'geo' : style} size={Math.min(height * 0.55, 200)} navy={navy} gold={gold} cream={cream} />
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Mascot, MascotCrest, MascotGeo, MascotMono, MascotVideo, MascotStage, SKYLAR_VIDEO_SRC });
