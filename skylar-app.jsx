// skylar-app.jsx — Production app shell.
// Responsive (mobile/tablet/desktop), AI disclaimer gate, and ?embed=1 mode.
// Bypasses the DesignCanvas/Tweaks scaffolding used by the in-platform editor.

// Color helpers (inlined from variations-v2 so the production bundle doesn't depend on it).
function _skylar_hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function _skylar_rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('');
}
function lighten(hex, amt) {
  const [r, g, b] = _skylar_hexToRgb(hex);
  return _skylar_rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}
function darken(hex, amt) {
  const [r, g, b] = _skylar_hexToRgb(hex);
  return _skylar_rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}

// Tries each of these URLs in order; first one that loads wins.
// Drop your approved logo into the repo root as one of these filenames
// (logo.png recommended for raster, logo.svg for vector).
const LOGO_CANDIDATES = ["/logo.svg", "/logo.png"];

// BrandLogo: loads the first available logo file, auto-detects aspect ratio,
// and renders it appropriately:
//   - wide-aspect file (wordmark, ratio > 1.4)  -> render at natural aspect, no chip background
//   - square-ish file (icon/seal)               -> render as a chip with light background
//   - no file found                              -> dashed-border 'KU' placeholder
// onShape(kind) lets the parent suppress the duplicate text wordmark when the logo IS the wordmark.
function BrandLogo({ size = 44, onShape }) {
  const [state, setState] = React.useState({ src: null, kind: "none", w: 0, h: 0 });
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const candidate of LOGO_CANDIDATES) {
        try {
          const head = await fetch(candidate, { method: "HEAD" });
          if (!head.ok) continue;
          // Probe natural dimensions so we can decide chip vs wordmark layout.
          const dims = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
            img.onerror = () => resolve({ w: 1, h: 1 });
            img.src = candidate;
          });
          if (cancelled) return;
          const ratio = dims.w / Math.max(1, dims.h);
          const kind = ratio > 1.4 ? "wordmark" : "square";
          setState({ src: candidate, kind, w: dims.w, h: dims.h });
          if (onShape) onShape(kind);
          return;
        } catch (_e) { /* try next */ }
      }
      if (onShape) onShape("none");
    })();
    return () => { cancelled = true; };
  }, [onShape]);

  if (state.src && state.kind === "wordmark") {
    // Render at natural aspect ratio; no chip background, no padding.
    const naturalRatio = state.w / Math.max(1, state.h);
    return (
      <img
        src={state.src}
        alt="Keiser University"
        style={{
          height: size, width: "auto", maxWidth: size * naturalRatio,
          flex: "0 0 auto", objectFit: "contain", display: "block",
        }}
      />
    );
  }

  if (state.src && state.kind === "square") {
    return (
      <img
        src={state.src}
        alt="Keiser University"
        style={{
          width: size, height: size, flex: "0 0 auto",
          borderRadius: 8, objectFit: "contain",
          background: "rgba(255,255,255,.96)", padding: 4,
        }}
      />
    );
  }

  // Fallback when no logo file is present yet.
  return (
    <div style={{
      width: size, height: size, flex: "0 0 auto",
      borderRadius: 8, background: "rgba(255,255,255,.08)",
      border: "1px dashed rgba(255,255,255,.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.max(9, Math.floor(size / 5)),
      color: "rgba(255,255,255,.7)", letterSpacing: ".12em", fontWeight: 600,
    }}>KU</div>
  );
}

const PROD_DEFAULTS = {
  brand: "Keiser University",
  tagline: "",
  primaryColor: "#0b2545",
  accentColor: "#d4a83a",
  neutralColor: "#f7f2e6",
  persona: "warm",
  chips: [
    "What programs are most popular?",
    "How do I apply?",
    "Tell me about financial aid",
    "What sports do you offer?",
  ],
};

// Bumping this string invalidates prior acceptances and re-prompts the modal.
const DISCLAIMER_VERSION = "v2-legal-2026-05-13";
const DISCLAIMER_STORAGE_KEY = `skylar.disclaimer.${DISCLAIMER_VERSION}`;

function useMediaQuery(query) {
  const get = () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange);
    };
  }, [query]);
  return matches;
}

function useQueryFlag(name) {
  return React.useMemo(() => {
    if (typeof window === "undefined") return false;
    const v = new URLSearchParams(window.location.search).get(name);
    return v !== null && v !== "0" && v !== "false";
  }, [name]);
}

function DisclaimerModal({ onAccept, brand, accentColor, primaryColor }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="skylar-disclaimer-title"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(8, 14, 28, 0.85)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", overflowY: "auto",
      }}
    >
      <div style={{
        background: "#fff", maxWidth: 560, width: "100%",
        borderRadius: 18, padding: "28px 26px 22px",
        boxShadow: "0 30px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.06)",
        fontFamily: '"Geist", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        color: "#1d2433", maxHeight: "calc(100vh - 40px)", overflowY: "auto",
      }}>
        <div style={{
          display: "inline-block", padding: "4px 10px", borderRadius: 999,
          background: `${accentColor}22`, color: primaryColor,
          fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase",
          marginBottom: 14,
        }}>
          Important notice — please read
        </div>
        <h2 id="skylar-disclaimer-title" style={{
          fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400,
          fontSize: 26, lineHeight: 1.15, margin: "0 0 10px", color: primaryColor,
        }}>
          Skylar is an AI assistant. Its responses are not official statements of {brand}.
        </h2>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "#33384a", margin: "0 0 14px" }}>
          By continuing, you acknowledge and agree to the following terms:
        </p>
        <ol style={{
          margin: "0 0 16px", padding: "0 0 0 18px",
          fontSize: 13.5, lineHeight: 1.55, color: "#33384a",
        }}>
          <li style={{ padding: "6px 0" }}>
            <strong>Not official.</strong> Skylar is an automated AI assistant. Its responses do <em>not</em> constitute official statements, representations, advice, commitments, or guarantees by {brand}, its officers, employees, or affiliates.
          </li>
          <li style={{ padding: "6px 0" }}>
            <strong>No reliance.</strong> Skylar may produce inaccurate, incomplete, or outdated information. You should not rely on Skylar for any decision involving admissions, enrollment, tuition, financial aid, transfer credits, accreditation, employment outcomes, immigration, or legal, financial, or medical matters. Independently verify all material information directly with {brand}'s admissions office before acting.
          </li>
          <li style={{ padding: "6px 0" }}>
            <strong>No contract; no enrollment offer.</strong> Nothing Skylar says creates an offer, acceptance, contract, scholarship, financial aid award, or any other enforceable commitment between you and {brand}.
          </li>
          <li style={{ padding: "6px 0" }}>
            <strong>Privacy.</strong> Do not share Social Security numbers, government IDs, passwords, financial account details, health information, or other sensitive personal data. Conversations may be logged, reviewed, and used to improve the assistant.
          </li>
          <li style={{ padding: "6px 0" }}>
            <strong>As-is; limitation of liability.</strong> Skylar is provided “as is,” without warranties of any kind. To the fullest extent permitted by law, {brand} and the operators of this tool disclaim all liability for any loss or damage arising from your use of, or reliance on, Skylar's responses.
          </li>
        </ol>
        <p style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(0,0,0,.55)", margin: "0 0 16px",
                    padding: "10px 12px", background: "#f7f5ef", borderRadius: 8 }}>
          For binding answers, contact {brand} Admissions. If you are in crisis, please contact emergency services (911 in the U.S.) or a crisis hotline — Skylar is not a crisis-response tool.
        </p>
        <button
          type="button"
          onClick={onAccept}
          style={{
            width: "100%", padding: "13px 16px", border: "none", cursor: "pointer",
            background: primaryColor, color: "#fff", borderRadius: 12,
            fontFamily: "inherit", fontSize: 15, fontWeight: 600, letterSpacing: ".02em",
          }}
        >
          I have read and accept these terms
        </button>
        <div style={{ fontSize: 11, color: "rgba(0,0,0,.45)", textAlign: "center", marginTop: 10 }}>
          Clicking above records your acceptance for this device.
        </div>
      </div>
    </div>
  );
}

function ProdChat({ tweaks, theme, isMobile, isEmbed }) {
  const initialChips = React.useMemo(() => tweaks.chips, [tweaks.chips.join("|")]);
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

  // Tracks the loaded logo's shape so we can hide the duplicate text wordmark when the logo IS a wordmark.
  const [logoShape, setLogoShape] = React.useState("none");

  const navy = theme.navy;
  const gold = theme.gold;
  const cream = theme.cream;

  const showHero = !isMobile && !isEmbed;

  return (
    <div style={{
      width: "100%", height: "100%",
      background: cream,
      fontFamily: '"Geist", "Inter", system-ui, sans-serif',
      display: "grid",
      gridTemplateColumns: showHero ? "minmax(360px, 1.05fr) minmax(340px, 1fr)" : "1fr",
      overflow: "hidden",
    }}>
      {showHero && (
        <div style={{
          background: `linear-gradient(160deg, ${lighten(navy, 0.12)} 0%, ${navy} 55%, ${darken(navy, 0.5)} 100%)`,
          color: "#fff", padding: "36px 48px 32px", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", minHeight: 0,
        }}>
          <svg viewBox="0 0 600 800" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"
               style={{ position: "absolute", inset: 0, opacity: 0.16, pointerEvents: "none" }}>
            {[120, 200, 290, 400, 520].map((r, i) => (
              <circle key={i} cx="300" cy="520" r={r} stroke={gold} strokeWidth="1" fill="none" />
            ))}
          </svg>

          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 12 }}>
            <BrandLogo size={44} onShape={setLogoShape} />
            {/* Hide the text wordmark when the loaded logo IS a wordmark, to avoid duplication. */}
            {logoShape !== "wordmark" ? (
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.08, minWidth: 0 }}>
                <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, letterSpacing: ".005em",
                               whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {tweaks.brand}
                </span>
                {tweaks.tagline ? (
                  <span style={{ fontSize: 10.5, letterSpacing: ".2em", textTransform: "uppercase",
                                 color: "rgba(255,255,255,.55)", marginTop: 2,
                                 whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tweaks.tagline}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div style={{ position: "relative", zIndex: 2, marginTop: 36 }}>
            <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase",
                           color: gold, fontWeight: 600 }}>Future students</span>
            <h1 style={{
              fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400,
              fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.02, letterSpacing: "-.015em",
              margin: "12px 0 12px",
            }}>
              Meet <em style={{ color: gold, fontStyle: "italic" }}>Skylar</em>.
            </h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.55, color: "rgba(255,255,255,.78)",
                        maxWidth: 440, margin: 0 }}>
              Your guide to life at {tweaks.brand}. Ask about programs, applying, what dorm life is really like,
              or what folks do on a Tuesday night.
            </p>
          </div>

          <div style={{ position: "relative", zIndex: 2, margin: "28px 0 18px", flex: "1 1 auto", minHeight: 0,
                        display: "flex", alignItems: "center" }}>
            <div style={{
              width: "100%", aspectRatio: "16 / 10", borderRadius: 22, position: "relative", overflow: "hidden",
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.10)",
              boxShadow: "0 24px 60px rgba(0,0,0,.4)",
            }}>
              <video src={typeof SKYLAR_VIDEO_SRC !== "undefined" ? SKYLAR_VIDEO_SRC : "/uploads/World Cup Skylar Video.mp4"}
                     autoPlay loop muted playsInline
                     style={{ width: "100%", height: "100%", objectFit: "cover",
                              objectPosition: "50% 35%", display: "block" }} />
              <div style={{ position: "absolute", inset: 0,
                            background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,.45) 100%)" }} />
              <div style={{
                position: "absolute", left: 14, bottom: 12, right: 14,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                color: "rgba(255,255,255,.92)", fontSize: 12, letterSpacing: ".04em",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff4d4d",
                                 boxShadow: "0 0 0 4px rgba(255,77,77,.18)" }} />
                  LIVE · Skylar
                </span>
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                               fontSize: 10.5, opacity: 0.7 }}>looping</span>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 18,
                        fontSize: 11.5, color: "rgba(255,255,255,.55)", flexWrap: "wrap" }}>
            <span>Grounded in {tweaks.faqs.length} FAQs</span>
            <span>· Replies under 2s</span>
            <span>· Hand-off to admissions any time</span>
          </div>
        </div>
      )}

      {/* RIGHT (or full): chat panel */}
      <div style={{
        display: "flex", flexDirection: "column",
        padding: isMobile ? "14px 14px 12px" : "32px 32px 26px",
        background: cream, minHeight: 0, minWidth: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: 12, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <Mascot style="video" size={isMobile ? 36 : 40} navy={navy} gold={gold} cream={cream} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: navy,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Skylar{isMobile ? ` · ${tweaks.brand}` : ""}
              </div>
              <div style={{ fontSize: 12, color: "rgba(0,0,0,.5)",
                            display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3ab369" }} />
                Online · AI assistant
              </div>
            </div>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {["Programs", "Apply", "Visit"].map((t) => (
                <button key={t} style={{
                  background: "#fff", border: `1px solid ${theme.border}`, color: navy,
                  borderRadius: 999, padding: "6px 12px", fontSize: 12,
                  fontFamily: "inherit", cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>
          )}
        </div>

        <div ref={scrollRef} style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: isMobile ? "12px 12px" : "14px 16px",
          background: "#fff", borderRadius: 18, border: `1px solid ${theme.border}`,
          WebkitOverflowScrolling: "touch", minHeight: 0,
        }}>
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const showAvatar = m.role === "skylar" && (!prev || prev.role !== "skylar");
            return (
              <BubbleV2 key={m.id} msg={m} theme={theme} onReact={react}
                showAvatar={showAvatar}
                AvatarSlot={<Mascot style="video" size={28} navy={navy} gold={gold} cream={cream} />} />
            );
          })}
          {typing && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", margin: "10px 0" }}>
              <Mascot style="video" size={28} navy={navy} gold={gold} cream={cream} />
              <div style={{
                background: theme.skylarBg, border: `1px solid ${theme.border}`,
                padding: "8px 12px", borderRadius: 18, borderBottomLeftRadius: 6,
              }}>
                <TypingDots color={navy} />
              </div>
            </div>
          )}
          <QuickChips chips={chips} onPick={send} theme={theme} />
        </div>

        <div style={{ marginTop: 12 }}>
          <Composer onSend={send} theme={theme} placeholder="Ask Skylar anything…" />
          <div style={{ fontSize: 10.5, color: "rgba(0,0,0,.5)", marginTop: 8,
                        textAlign: "center", letterSpacing: ".04em" }}>
            AI assistant — not an official {tweaks.brand} statement. Verify any decision with admissions.
          </div>
        </div>
      </div>
    </div>
  );
}

function SkylarApp() {
  const isMobile = useMediaQuery("(max-width: 820px)");
  const isEmbed = useQueryFlag("embed");

  // Disclaimer state — skip in embed mode (the embedding page is responsible for it).
  const [accepted, setAccepted] = React.useState(() => {
    if (typeof window === "undefined") return true;
    if (isEmbed) return true;
    try {
      return window.localStorage.getItem(DISCLAIMER_STORAGE_KEY) === "1";
    } catch (_e) {
      return false;
    }
  });

  const accept = React.useCallback(() => {
    try { window.localStorage.setItem(DISCLAIMER_STORAGE_KEY, "1"); } catch (_e) {}
    setAccepted(true);
  }, []);

  const tweaks = React.useMemo(() => ({
    ...PROD_DEFAULTS,
    faqs: window.SKYLAR_DEFAULT_FAQS || [],
  }), []);

  const theme = React.useMemo(
    () => makeTheme({ navy: tweaks.primaryColor, gold: tweaks.accentColor, cream: tweaks.neutralColor }),
    [tweaks.primaryColor, tweaks.accentColor, tweaks.neutralColor]
  );

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: tweaks.neutralColor }}>
      <ProdChat tweaks={tweaks} theme={theme} isMobile={isMobile} isEmbed={isEmbed} />
      {!accepted && (
        <DisclaimerModal
          onAccept={accept}
          brand={tweaks.brand}
          accentColor={tweaks.accentColor}
          primaryColor={tweaks.primaryColor}
        />
      )}
    </div>
  );
}

const _skylarRoot = ReactDOM.createRoot(document.getElementById("root"));
_skylarRoot.render(<SkylarApp />);
