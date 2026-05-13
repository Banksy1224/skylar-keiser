// app-v2.jsx — Variation B, placeholder-friendly + FAQ-grounded.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "brand": "Keiser University",
  "tagline": "FLAGSHIP · WEST PALM BEACH, FL",
  "primaryColor": "#0b2545",
  "accentColor": "#d4a83a",
  "neutralColor": "#f7f2e6",
  "persona": "warm",
  "chips": [
    "What programs are most popular?",
    "How do I apply?",
    "Tell me about financial aid",
    "What sports do you offer?"
  ],
  "faqsJson": ""
}/*EDITMODE-END*/;

function parseFaqs(jsonStr) {
  if (!jsonStr || !jsonStr.trim()) return window.SKYLAR_DEFAULT_FAQS || [];
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) return parsed;
    return window.SKYLAR_DEFAULT_FAQS || [];
  } catch (_e) {
    return window.SKYLAR_DEFAULT_FAQS || [];
  }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const faqs = React.useMemo(() => parseFaqs(t.faqsJson), [t.faqsJson]);
  const theme = React.useMemo(
    () => makeTheme({ navy: t.primaryColor, gold: t.accentColor, cream: t.neutralColor }),
    [t.primaryColor, t.accentColor, t.neutralColor]
  );

  const composed = { ...t, faqs };

  return (
    <React.Fragment>
      <DesignCanvas>
        <DCSection
          id="skylar-b"
          title="Skylar · Meet-the-mascot page"
          subtitle="Drop your logo, set your brand colors, paste your FAQs — Skylar grounds every reply in them."
        >
          <DCArtboard id="immersive" label="Meet Skylar — branded for you" width={1280} height={820}>
            <VariationImmersiveV2 tweaks={composed} theme={theme} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand" />
        <TweakText
          label="School name"
          value={t.brand}
          onChange={(v) => setTweak('brand', v)}
        />
        <TweakText
          label="Tagline / location"
          value={t.tagline}
          onChange={(v) => setTweak('tagline', v)}
        />

        <TweakSection label="Brand colors" />
        <TweakColor
          label="Primary"
          value={t.primaryColor}
          options={['#0b2545', '#13343b', '#1a1d3a', '#0e2a23', '#3b1d1d', '#1e293b']}
          onChange={(v) => setTweak('primaryColor', v)}
        />
        <TweakColor
          label="Accent"
          value={t.accentColor}
          options={['#d4a83a', '#e8b53b', '#c97a3d', '#cba24a', '#b8884a', '#a98555']}
          onChange={(v) => setTweak('accentColor', v)}
        />
        <TweakColor
          label="Neutral"
          value={t.neutralColor}
          options={['#f7f2e6', '#fbf7ea', '#f5efe6', '#f3eedc', '#f4f1ec', '#faf8f3']}
          onChange={(v) => setTweak('neutralColor', v)}
        />

        <TweakSection label="Personality" />
        <TweakSelect
          label="Tone"
          value={t.persona}
          options={[
            { value: 'warm',  label: 'Warm & supportive' },
            { value: 'peppy', label: 'Peppy & spirited'  },
            { value: 'witty', label: 'Witty & playful'   },
            { value: 'calm',  label: 'Calm & professional' },
          ]}
          onChange={(v) => setTweak('persona', v)}
        />

        <TweakSection label="Quick replies" />
        {t.chips.map((c, i) => (
          <TweakText
            key={i}
            label={`Chip ${i + 1}`}
            value={c}
            onChange={(v) => {
              const next = t.chips.slice();
              next[i] = v;
              setTweak('chips', next);
            }}
          />
        ))}

        <TweakSection label={`Knowledge · ${faqs.length} FAQs loaded`} />
        <div style={{ fontSize: 10.5, color: 'rgba(0,0,0,.55)', lineHeight: 1.45, margin: '-2px 0 4px' }}>
          Paste a JSON array of <code>{`{ q, a, tags }`}</code> objects.
          Leave blank to use the placeholder corpus.
        </div>
        <textarea
          value={t.faqsJson}
          onChange={(e) => setTweak('faqsJson', e.target.value)}
          placeholder={`[\n  { "q": "How do I apply?", "a": "...", "tags": ["apply"] }\n]`}
          style={{
            width: '100%', boxSizing: 'border-box',
            minHeight: 100, padding: '8px 10px',
            border: '1px solid rgba(0,0,0,.15)', borderRadius: 8,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 11, lineHeight: 1.4, resize: 'vertical',
            background: '#fff', color: '#29261b',
          }}
        />
        <TweakButton
          label={t.faqsJson ? 'Reset to placeholder FAQs' : 'Show placeholder JSON'}
          onClick={() => {
            if (t.faqsJson) {
              setTweak('faqsJson', '');
            } else {
              setTweak('faqsJson', JSON.stringify(window.SKYLAR_DEFAULT_FAQS, null, 2));
            }
          }}
          secondary
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
