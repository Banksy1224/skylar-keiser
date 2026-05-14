#!/usr/bin/env node
/*
 * crawl-keiser.mjs — Reviewable crawler for keiseruniversity.edu (or any
 * institutional domain) into a JSON candidate-FAQ file.
 *
 * USAGE (from the repo root):
 *   node scripts/crawl-keiser.mjs \
 *     --start https://www.keiseruniversity.edu/admissions/ \
 *     --start https://www.keiseruniversity.edu/financial-aid/ \
 *     --max 40 \
 *     --out faqs-from-website-candidates.json
 *
 * Then OPEN the output file and:
 *   1. Read every entry. Delete anything misleading, outdated, marketing fluff,
 *      or off-brand.
 *   2. Edit answers to be conservative ("you may", "typically", "as of [date]").
 *      Never claim specifics you can't defend.
 *   3. Add `tags` to each entry so the keyword retriever can find them.
 *   4. When happy, copy the entries you want to keep into faqs.js.
 *
 * DESIGN CHOICES:
 *  - Respects robots.txt — fetches /robots.txt before any other URL and
 *    refuses to crawl disallowed paths.
 *  - Identifies itself with a real User-Agent so Keiser IT can see it.
 *  - Single concurrent request, 1.5s delay between fetches — polite.
 *  - Only crawls same-host pages.
 *  - Strips boilerplate (nav, script, style, footer) before extracting text.
 *  - Does NOT send anything to an LLM. The candidate Q/A pairs are derived
 *    deterministically from <h1>/<h2>/<h3> + the paragraph that follows.
 *    You (a human) decide what becomes real FAQ content.
 *
 * NO DEPENDENCIES. Run with plain `node`.
 */

import { writeFileSync } from "node:fs";
import { argv } from "node:process";

// ── Args ─────────────────────────────────────────────────────────────────
function parseArgs(arr) {
  const out = { starts: [], max: 30, out: "faqs-from-website-candidates.json", delay: 1500 };
  for (let i = 2; i < arr.length; i++) {
    const a = arr[i];
    if (a === "--start") out.starts.push(arr[++i]);
    else if (a === "--max") out.max = parseInt(arr[++i], 10);
    else if (a === "--out") out.out = arr[++i];
    else if (a === "--delay") out.delay = parseInt(arr[++i], 10);
    else if (a === "--help" || a === "-h") { usage(); process.exit(0); }
  }
  if (!out.starts.length) { usage(); process.exit(1); }
  return out;
}
function usage() {
  console.error(`
crawl-keiser.mjs — reviewable institutional crawler

  --start <url>     Seed URL (repeatable). Required.
  --max <n>         Max pages to fetch (default 30).
  --out <path>      Output JSON path (default faqs-from-website-candidates.json).
  --delay <ms>      Politeness delay between requests (default 1500ms).

Example:
  node scripts/crawl-keiser.mjs \\
    --start https://www.keiseruniversity.edu/admissions/ \\
    --max 25
`);
}

const args = parseArgs(argv);

// ── Robots ───────────────────────────────────────────────────────────────
async function fetchRobots(origin) {
  try {
    const r = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": UA },
    });
    if (!r.ok) return { allow: () => true };
    const text = await r.text();
    // Tiny robots.txt parser: tracks the * agent block and the agent block
    // matching us by name; collects Disallow paths.
    const lines = text.split(/\r?\n/);
    let current = null;
    const disallows = new Set();
    for (const raw of lines) {
      const line = raw.replace(/#.*/, "").trim();
      if (!line) continue;
      const m = line.match(/^(User-agent|Disallow|Allow):\s*(.*)$/i);
      if (!m) continue;
      const [, k, v] = m;
      if (k.toLowerCase() === "user-agent") {
        const ua = v.trim().toLowerCase();
        current = ua === "*" || ua === "skylarbot" || UA.toLowerCase().includes(ua);
      } else if (current && k.toLowerCase() === "disallow" && v.trim()) {
        disallows.add(v.trim());
      }
    }
    return {
      allow: (path) => {
        for (const d of disallows) {
          if (path.startsWith(d)) return false;
        }
        return true;
      },
    };
  } catch (_e) {
    return { allow: () => true };
  }
}

const UA = "SkylarBot/1.0 (+contact admissions; reviewable-crawler for FAQ seeding)";

// ── HTML utilities (no external deps) ────────────────────────────────────
function stripBoilerplate(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "");
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ");
}

function textOf(htmlFragment) {
  return decode(htmlFragment.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? textOf(m[1]) : "";
}

function extractLinks(html, baseUrl, baseHost) {
  const out = new Set();
  const re = /<a\b[^>]*href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const u = new URL(m[1], baseUrl);
      if (u.host !== baseHost) continue;
      if (!/^https?:$/.test(u.protocol)) continue;
      if (/\.(pdf|jpg|jpeg|png|gif|svg|webp|mp4|mov|zip|docx?|xlsx?|pptx?)$/i.test(u.pathname)) continue;
      u.hash = "";
      out.add(u.toString());
    } catch (_e) { /* skip bad URL */ }
  }
  return [...out];
}

// Pull a flat array of headings + the text node that follows them.
// We use this to seed Q/A candidates: heading → "Q", following block → "A".
function extractHeadingPairs(html) {
  const cleaned = stripBoilerplate(html);
  const pairs = [];
  // Split on heading tags but keep them.
  const re = /<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<h[1-3]\b|$)/gi;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const heading = textOf(m[2]);
    if (!heading || heading.length < 4 || heading.length > 200) continue;
    let body = textOf(m[3]);
    // Trim to ~600 chars to keep candidates reviewable; reviewer can expand later.
    if (body.length > 600) body = body.slice(0, 597) + "…";
    if (!body || body.length < 30) continue;
    pairs.push({ q: heading, a: body });
  }
  return pairs;
}

// ── Crawler ──────────────────────────────────────────────────────────────
async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function crawl() {
  if (!args.starts.length) throw new Error("No --start URLs");
  const startUrl = new URL(args.starts[0]);
  const origin = `${startUrl.protocol}//${startUrl.host}`;
  const robots = await fetchRobots(origin);

  const queue = [...args.starts];
  const seen = new Set();
  const out = [];
  let fetched = 0;

  while (queue.length && fetched < args.max) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    let path;
    try { path = new URL(url).pathname; } catch { continue; }
    if (!robots.allow(path)) {
      console.error(`  skip (robots): ${url}`);
      continue;
    }
    console.error(`  fetch [${fetched + 1}/${args.max}]: ${url}`);
    try {
      const r = await fetch(url, {
        headers: { "User-Agent": UA, "Accept": "text/html" },
        redirect: "follow",
      });
      if (!r.ok) { console.error(`    -> ${r.status}`); continue; }
      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("text/html")) { console.error(`    -> not html (${ct})`); continue; }
      const html = await r.text();
      fetched++;

      const title = extractTitle(html);
      const pairs = extractHeadingPairs(html);
      for (const p of pairs) {
        out.push({
          source_url: url,
          source_title: title,
          q: p.q,
          a: p.a,
          tags: [],
          status: "needs_review",
        });
      }

      // Enqueue same-host links (only crawl deeper if we have headroom).
      if (fetched < args.max) {
        for (const link of extractLinks(html, url, startUrl.host)) {
          if (!seen.has(link)) queue.push(link);
        }
      }
    } catch (e) {
      console.error(`    -> error: ${e.message}`);
    }
    await sleep(args.delay);
  }

  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────
console.error(`Crawling ${args.starts.length} seed(s), max ${args.max} pages, ${args.delay}ms delay`);
console.error(`User-Agent: ${UA}`);
console.error("");

const candidates = await crawl();

writeFileSync(args.out, JSON.stringify(candidates, null, 2));
console.error(`\nWrote ${candidates.length} candidate Q/A pairs to ${args.out}`);
console.error(`Review every entry manually before merging into faqs.js.`);
console.error(`Mark each entry's "status" as "approved" or delete it; the merge`);
console.error(`step should ignore anything still marked "needs_review".`);
