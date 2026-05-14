# Skylar — Keiser University Mascot Chat

An interactive chat experience starring **Skylar**, the Keiser University seahawk mascot. Skylar greets prospective students, answers questions grounded in a configurable FAQ knowledge base, and shows source attribution beneath every reply.

## What's in here

```
├── server.js                  # Express server + /api/complete proxy to Anthropic
├── package.json
├── railway.json               # Railway deploy config
├── .env.example               # Copy to .env locally
│
├── index.html                 # PRODUCTION entry — responsive, with AI disclaimer
├── skylar-app.jsx             # Production app shell (responsive, disclaimer, ?embed=1)
├── embed.html                 # Iframe snippet for the institutional website
│
├── Skylar Chat v2.html        # Internal /tweaks playground (live brand editor)
├── app-v2.jsx                 # App shell + Tweaks panel wiring
├── variations-v2.jsx          # The "Meet Skylar" layout
├── skylar-chat-v2.jsx         # Chat engine + FAQ retrieval + sources
├── skylar-chat.jsx            # Shared bubbles, composer, quick-chips
├── mascot.jsx                 # Mascot avatars (video + abstract fallbacks)
├── faqs.js                    # Keiser FAQ knowledge base (~65 entries)
│
├── design-canvas.jsx          # (Optional) Figma-ish canvas for the prototype shell
├── tweaks-panel.jsx           # Live tweak controls (palette, persona, FAQs)
├── browser-window.jsx         # Browser-chrome frame around the design
├── image-slot.js              # Drag-to-fill logo placeholder
│
└── uploads/
    └── World Cup Skylar Video.mp4   # Skylar mascot video loop
```

## Local development

```bash
git clone <your-repo-url>
cd skylar
cp .env.example .env           # then paste your ANTHROPIC_API_KEY
npm install
npm run dev                    # http://localhost:3000
```

## Routes

- `/` — production app. Responsive across mobile/tablet/desktop, with a blocking AI disclaimer on first visit (stored in localStorage).
- `/?embed=1` — same app, no disclaimer modal, no hero (chat only). Use this URL inside the iframe snippet for the institutional website (see `embed.html`).
- `/tweaks` — internal playground with the live Tweaks panel (brand colors, persona, FAQ JSON). Not linked from anywhere public; share the URL only with people who need it.
- `/api/complete` — server-side proxy to Anthropic.
- `/healthz` — Railway healthcheck.

## Deploy to Railway

1. Push this repo to GitHub.
2. In Railway, **New Project → Deploy from GitHub repo** and pick this one.
3. Open the service → **Variables** → add `ANTHROPIC_API_KEY` (your real key).
4. Railway auto-detects Node from `package.json` and runs `node server.js`.
5. Open the public URL — Skylar should greet you.

The health check at `/healthz` is wired up so Railway can monitor the service.

## How the AI replies work

- The browser calls `window.claude.complete({ messages: [...] })`.
- In production, that's a shim that POSTs to `/api/complete` on the same server.
- The server calls Anthropic's API with your key and returns the text.
- The system prompt + FAQ context are assembled client-side in `skylar-chat-v2.jsx`. The model is told to answer **only** from the FAQ context and to defer to admissions for anything outside it.

To swap models or providers, edit `server.js` — the `/api/complete` endpoint is the only place the upstream API lives.

## Editing the FAQ corpus

Open `faqs.js`. Each entry has the shape:

```js
{
  q: "How do I apply?",
  a: "You can apply online...",
  tags: ["apply", "application", "admissions"]
}
```

Tags help the keyword retriever find the right FAQ. Add as many as you'd like — the retriever ranks by overlap and only passes the top 3 hits to the model.

You can also override the corpus at runtime by pasting JSON into the **Knowledge** section of the in-page Tweaks panel.

## Brand customization

The Tweaks panel (toggle from the toolbar) lets you change:
- **School name + tagline**
- **Primary / accent / neutral colors** — pick from preset swatches
- **Skylar's personality** — warm, peppy, witty, or calm
- **Quick-reply chips** — four prompts shown on first load

### Logo

The logo slot at the top of the left panel uses an `<image-slot>` web component that's read-only outside the in-platform editor. To set a logo for production:

1. Place your logo file (e.g. `logo.png`) in the project root.
2. In `variations-v2.jsx`, replace the `<image-slot>` element with a regular `<img src="/logo.png" alt="Keiser University" />` styled to the same size.

## Caveats

- **Skylar isn't a real Keiser-affiliated service.** This is a prototype — the brand, colors, and content slots are designed so the real Keiser team can drop in official assets and copy.
- **Skylar can be wrong.** The model is grounded but not infallible. Always include the "double-check with admissions" disclaimer (already in the UI).
- **No PII handling.** Don't log or persist user messages without first reviewing privacy implications.
