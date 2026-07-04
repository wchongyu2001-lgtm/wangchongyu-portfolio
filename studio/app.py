#!/usr/bin/env python3
"""The Studio — local admin for wangchongyu.com.

Stdlib-only HTTP server (Post Room pattern). Every smart feature shells out to
headless Claude (`claude -p`, subscription) and parses JSON from stdout.
Binds 127.0.0.1 only — never expose. Publish = build + sanitize gate + git push.
"""
import json
import os
import re
import shutil
import subprocess
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(BASE, 'content')
CLAUDE = os.path.expanduser('~/.local/bin/claude')
PORT = 8786

CONTENT_FILES = ['site.json', 'flagship.json', 'projects.json', 'experience.json',
                 'skills.json', 'archive.json', 'keywords.json', 'facts.json',
                 'market-signal.json']
META_FILES = {'keywords.json', 'facts.json', 'market-signal.json'}  # studio inputs, not site copy


def read_content(name):
    with open(os.path.join(CONTENT, name)) as f:
        return json.load(f)


def all_content_text():
    parts = []
    for name in CONTENT_FILES:
        if name in META_FILES:
            continue
        parts.append(f'--- {name} ---\n' + open(os.path.join(CONTENT, name)).read())
    return '\n'.join(parts)


def grounding_text():
    facts = json.dumps(read_content('facts.json'), indent=1)
    market = json.dumps(read_content('market-signal.json'), indent=1)
    return (f'VERIFIED FACTS LEDGER (the only real results — treat any site claim not '
            f'traceable to these as UNVERIFIED and flag it):\n{facts}\n\n'
            f'MARKET SIGNAL (what recruiters for these roles actually ask for and '
            f'search on LinkedIn — judge relevance against THIS, not generic taste):\n{market}')


def ask_claude(prompt, timeout=240):
    """Run headless claude; --setting-sources project skips global user hooks."""
    proc = subprocess.run(
        [CLAUDE, '-p', '--setting-sources', 'project'],
        input=prompt, capture_output=True, text=True, timeout=timeout, cwd=BASE,
    )
    if proc.returncode != 0:
        raise RuntimeError(f'claude exited {proc.returncode}: {proc.stderr[-500:]}')
    return proc.stdout.strip()


def extract_json(text):
    """Parse the first JSON object/array in a claude reply (tolerates prose around it)."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r'```(?:json)?\s*([\[{].*?[\]}])\s*```', text, re.S)
    if m:
        return json.loads(m.group(1))
    start = min([i for i in (text.find('{'), text.find('[')) if i >= 0], default=-1)
    if start >= 0:
        depth = 0
        opener, closer = text[start], {'{': '}', '[': ']'}[text[start]]
        for i in range(start, len(text)):
            if text[i] == opener:
                depth += 1
            elif text[i] == closer:
                depth -= 1
                if depth == 0:
                    return json.loads(text[start:i + 1])
    raise ValueError('no JSON found in claude reply:\n' + text[:800])


AUDIENCE = ('The reader is a skimming recruiter for asset-management / fund-distribution / '
            'strategy-consulting internships in Singapore. They give the page 45 seconds. '
            'The owner is an SMU Finance & Strategy undergrad positioned as an '
            '"AI-native finance operator".')


def job_critique():
    prompt = f"""You are a brutally honest recruiter-lens copy critic. {AUDIENCE}

Below is the full content of the portfolio site as JSON files, plus two grounding
inputs: a VERIFIED FACTS LEDGER and a MARKET SIGNAL file built from real 2026 job
postings and recruiter search behaviour.

Critique the site section by section AS A SKIMMING RECRUITER:
- Ground every judgement in the market signal — what these recruiters actually ask
  for and search, not generic taste.
- Reward copy backed by real results from the facts ledger (dollars, counts,
  percentages). Flag any claim NOT traceable to the ledger as unverified.
- Does each section land in 5 seconds? Impact first? Strong verbs? Any jargon
  meaningless to a finance recruiter? Address the recruiter_fears_to_preempt.

Reply with ONLY this JSON (no prose before or after):
{{"overall": <0-10>, "verdict": "<one blunt sentence>",
 "sections": [{{"id": "<file/section>", "score": <0-10>, "issues": ["..."],
               "best_fix": "<the single highest-impact rewrite, concrete text>"}}],
 "unverified_claims": ["<site claims not backed by the facts ledger>"],
 "top_fixes": ["<3-5 highest-impact changes across the whole site, concrete>"]}}

{grounding_text()}

CONTENT:
{all_content_text()}"""
    return extract_json(ask_claude(prompt))


def job_keywords():
    bank = json.dumps(read_content('keywords.json')['roles'], indent=1)
    prompt = f"""You are an ATS/keyword optimizer for a portfolio site. {AUDIENCE}

Check the site content against the keyword bank AND the linkedin_search_terms in the
market signal below (those are what recruiters actually type into LinkedIn search).
Keywords must appear NATURALLY — flag stuffing as a failure, not a win.

Reply with ONLY this JSON:
{{"coverage_score": <0-100>,
 "present": [{{"keyword": "...", "where": "<file/section>"}}],
 "missing_high_value": ["..."],
 "insertions": [{{"keyword": "...", "section": "<where>",
                 "suggestion": "<natural sentence or phrase edit>"}}],
 "stuffing_warnings": ["..."]}}

KEYWORD BANK:
{bank}

{grounding_text()}

CONTENT:
{all_content_text()}"""
    return extract_json(ask_claude(prompt))


def job_variants(text, context=''):
    prompt = f"""You are a copy chief. {AUDIENCE}

Rewrite the passage below in 3 distinct styles, then pick the best for this audience.
Keep facts identical — never invent numbers or claims.

Reply with ONLY this JSON:
{{"variants": [{{"style": "punchy", "text": "..."}},
              {{"style": "formal", "text": "..."}},
              {{"style": "story-led", "text": "..."}}],
 "recommendation": "<punchy|formal|story-led|original>",
 "why": "<one sentence>"}}

CONTEXT: {context or 'portfolio site copy'}
PASSAGE:
{text}"""
    return extract_json(ask_claude(prompt))


def job_freshness():
    home = os.path.expanduser('~')
    inventory = []
    for root in (os.path.join(home, 'claude'), os.path.join(home, 'repos')):
        if not os.path.isdir(root):
            continue
        for d in sorted(os.listdir(root)):
            p = os.path.join(root, d)
            if not os.path.isdir(p) or d.startswith(('.', '_')):
                continue
            mtime = time.strftime('%Y-%m-%d', time.localtime(os.path.getmtime(p)))
            first = ''
            cm = os.path.join(p, 'CLAUDE.md')
            if os.path.exists(cm):
                with open(cm, errors='ignore') as f:
                    first = ' '.join(f.read(400).split())[:200]
            inventory.append(f'{d} (modified {mtime}): {first}')
    memory_idx = ''
    mem = os.path.join(home, '.claude', 'projects', '-Users-wangchongyu', 'memory', 'MEMORY.md')
    if os.path.exists(mem):
        memory_idx = open(mem, errors='ignore').read()

    current = [p['title'] for p in read_content('projects.json')]
    current += [a['title'] for a in read_content('archive.json')]
    current.append(read_content('flagship.json')['title'])

    prompt = f"""You are the freshness auditor for a portfolio site. {AUDIENCE}

Compare what the owner has actually built (project inventory + memory index below)
against what the site currently shows. Find (a) projects/updates NOT yet on the site
worth adding, (b) site entries that look stale versus reality. Sanitize: no client or
worker names, no internal IPs/URLs/ports, no credentials in any draft.

Reply with ONLY this JSON:
{{"new_candidates": [{{"title": "...", "evidence": "<why you think it exists/matters>",
   "suggested_placement": "<case study|archive>",
   "draft": {{"title": "...", "note": "<archive one-liner>"}} }}],
 "stale": [{{"title": "<existing entry>", "why": "..."}}],
 "verdict": "<one sentence: is the site current?>"}}

CURRENTLY ON SITE:
{json.dumps(current, indent=1)}

PROJECT FOLDER INVENTORY:
{chr(10).join(inventory)}

MEMORY INDEX:
{memory_idx}"""
    return extract_json(ask_claude(prompt, timeout=300))


def job_chat(messages):
    convo = '\n'.join(f"{m['role'].upper()}: {m['text']}" for m in messages[-12:])
    prompt = f"""You are the resident critic/editor for the owner's portfolio site
(wangchongyu.com). {AUDIENCE}
You can see the full site content below, plus the verified facts ledger and market
signal. Never invent results — only claim what the ledger backs. Answer the owner's
questions, critique, draft copy on request. Be direct and concrete; plain text reply
(no JSON).

{grounding_text()}

SITE CONTENT:
{all_content_text()}

CONVERSATION:
{convo}
ASSISTANT:"""
    return ask_claude(prompt)


def job_publish():
    log = []

    def run(cmd, timeout=600):
        p = subprocess.run(cmd, shell=True, cwd=BASE, capture_output=True, text=True, timeout=timeout)
        log.append(f'$ {cmd}\n{p.stdout[-1200:]}{p.stderr[-800:]}')
        if p.returncode != 0:
            raise RuntimeError(f'{cmd} failed ({p.returncode})')
        return p

    dirty = subprocess.run('git status --porcelain', shell=True, cwd=BASE,
                           capture_output=True, text=True).stdout.strip()
    run('npm run build')
    run('npm run sanitize')  # the gate — raises (blocks publish) on any hit
    if dirty:
        run('git add content/ && git -c core.hooksPath=/dev/null commit -m "Content update via studio"')
    run('git push')
    return {'ok': True, 'committed': bool(dirty), 'log': '\n\n'.join(log)}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, code, body, ctype='application/json'):
        data = body if isinstance(body, bytes) else json.dumps(body).encode()
        self.send_response(code)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path in ('/', '/index.html'):
            with open(os.path.join(BASE, 'studio', 'studio.html'), 'rb') as f:
                self._send(200, f.read(), 'text/html; charset=utf-8')
        elif self.path == '/api/content':
            self._send(200, {name: read_content(name) for name in CONTENT_FILES})
        elif self.path == '/api/status':
            git = subprocess.run('git status --porcelain && git log --oneline -1', shell=True,
                                 cwd=BASE, capture_output=True, text=True).stdout.strip()
            self._send(200, {'git': git, 'claude': os.path.exists(CLAUDE)})
        else:
            self._send(404, {'error': 'not found'})

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length) or b'{}')
        try:
            if self.path == '/api/save':
                name = body['file']
                if name not in CONTENT_FILES:
                    raise ValueError('unknown file')
                parsed = json.loads(body['text'])  # validate before writing
                path = os.path.join(CONTENT, name)
                shutil.copy(path, path + '.bak')
                with open(path, 'w') as f:
                    json.dump(parsed, f, indent=2, ensure_ascii=False)
                    f.write('\n')
                self._send(200, {'ok': True})
            elif self.path == '/api/critique':
                self._send(200, job_critique())
            elif self.path == '/api/keywords':
                self._send(200, job_keywords())
            elif self.path == '/api/variants':
                self._send(200, job_variants(body['text'], body.get('context', '')))
            elif self.path == '/api/fresh':
                self._send(200, job_freshness())
            elif self.path == '/api/chat':
                self._send(200, {'reply': job_chat(body['messages'])})
            elif self.path == '/api/publish':
                self._send(200, job_publish())
            else:
                self._send(404, {'error': 'not found'})
        except Exception as e:  # surface errors to the UI
            self._send(500, {'error': str(e)})


if __name__ == '__main__':
    print(f'The Studio → http://127.0.0.1:{PORT}')
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
