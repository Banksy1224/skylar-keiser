// server.js — Express server for Railway deployment.
// Serves the static HTML/JSX files and proxies AI requests to Anthropic
// so the API key never lives in the browser.

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '1mb' }));

// Initialise the Anthropic client. Reads ANTHROPIC_API_KEY from env.
const client = new Anthropic();

// ─── API: /api/complete ─────────────────────────────────────────────────
// Accepts { messages: [{ role, content }] } and returns { text }.
// Mirrors the shape of the in-preview window.claude.complete helper.
app.post('/api/complete', async (req, res) => {
  try {
    const { messages, system } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const result = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: 1024,
      ...(system ? { system } : {}),
      messages,
    });

    const text = (result.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    res.json({ text });
  } catch (err) {
    console.error('claude.complete failed:', err);
    res.status(500).json({ error: err.message || 'completion failed' });
  }
});

// ─── Health check (Railway pings this) ──────────────────────────────────
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// ─── Static files ───────────────────────────────────────────────────────
// Serve everything in the project root: HTML, JSX, the Skylar video, fonts, etc.
app.use(express.static(__dirname, {
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jsx')) {
      // Babel reads these via <script type="text/babel" src="..."> — needs
      // a permissive mime so the browser fetches them as text.
      res.setHeader('Content-Type', 'text/babel; charset=utf-8');
    }
  },
}));

// Default route — send the v2 file.
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'Skylar Chat v2.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Skylar running on http://localhost:${port}`);
});
