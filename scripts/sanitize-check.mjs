#!/usr/bin/env node
// Pre-publish gate: scan the built site + content for data that must never go public.
// Exits non-zero (blocking publish) on any hit.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['out', 'content'];
const TEXT_EXT = new Set(['.html', '.txt', '.xml', '.json', '.js', '.css', '.md']);

const RULES = [
  { name: 'phone number', re: /9819\s*3479|\+65\s*9819/g },
  { name: 'NRIC/FIN', re: /\b[STFGM]\d{7}[A-Z]\b/g },
  { name: 'internal VPS IP', re: /46\.62\.169\.80/g },
  { name: 'internal hostnames', re: /sslip\.io|duckdns\.org|tailscale/gi },
  { name: 'internal ports', re: /:87[0-9]{2}\b|:8080\b|:8765\b|:8092\b/g },
  { name: 'credentials', re: /desk\/0225|oqmAEddYxxW|BASIC_AUTH|OAUTH_TOKEN/g },
  { name: 'client/worker identifiers', re: /New V Spa CPF|Budgetwangbot|businessinfo0225/gi },
  { name: 'agency UEN context leak', re: /hetzner_budget_bot/g },
];

let hits = 0;

function scan(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      scan(p);
    } else if (TEXT_EXT.has(extname(name))) {
      const text = readFileSync(p, 'utf8');
      for (const rule of RULES) {
        const m = text.match(rule.re);
        if (m) {
          hits++;
          console.error(`✗ ${rule.name} in ${p}: ${[...new Set(m)].join(', ')}`);
        }
      }
    }
  }
}

for (const root of ROOTS) {
  try {
    scan(root);
  } catch {
    console.error(`(skipped missing dir: ${root})`);
  }
}

if (hits > 0) {
  console.error(`\nSANITIZE GATE FAILED — ${hits} hit(s). Publish blocked.`);
  process.exit(1);
}
console.log('Sanitize gate: clean ✓');
