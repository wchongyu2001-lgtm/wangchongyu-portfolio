# Portfolio Site + Smart Studio — Design Spec
**Date:** 2026-07-04 · **Owner:** Wang Chongyu · **Status:** Approved (grill-me session)

## Positioning
**AI-native finance operator.** "SMU finance student who builds the AI systems most teams only talk about."
Target readers: asset-management / IB / fund-distribution and consulting recruiters.
Keywords to weave naturally: asset management, fund distribution, due diligence, valuation, investor relations,
LLM automation, agentic workflows, Claude Code, Python, Excel modelling.

## Decisions (from grill session)
| Decision | Choice |
|---|---|
| Audience | Finance internships (AM/IB/PE/distribution) + consulting |
| Domain | wangchongyu.com (user purchased; attach when visible) — live on wangchongyu.vercel.app immediately |
| Contact | Email + LinkedIn only; phone stripped everywhere public |
| Showcase | 1 flagship + 7 case studies + "also built" archive |
| Flagship | Wang Desk AI Asset-Management System (incl. WRDS pipeline, valuation engine, PM/Analyst/Risk/Scout role memos, daily briefs) |
| Case studies | Conduit fund-distribution pipeline (resume-public info ONLY), Worker Master ops suite, Budget Bot, Post Room, Idea Scout + research pipelines, The Desk (meta), House Finder |
| Sensitive data | Sanitized: no NRIC, no client/worker names, no internal URLs/IPs/ports, no phone |
| Page | Full one-pager: hero → flagship → case grid → archive → experience → skills → education → contact + resume.pdf. Case detail pages at /projects/<slug> |
| Design | New editorial-professional identity (serif display, restrained, "analyst who builds"); via /frontend anti-slop gate; NOT Desk tokens |
| Stack | Static Next.js (App Router, static export) on Vercel; public GitHub repo; content lives in content/*.json — site is a pure renderer |
| Analytics | Vercel Analytics |
| Resume | Sanitized copy of current PDF (phone redacted) at /resume.pdf |
| Backend | Phase 2: Mac-local Flask studio (ai-build-coach pattern): chat critic via headless `claude -p` (subscription, $0), editable content panels, publish = sanitize gate → git push → Vercel deploy |
| Critic jobs | Recruiter-lens critique, ATS keyword optimizer, 3-variant generator, freshness auditor |
| Phasing | Phase 1 = public site live. Phase 2 = studio. Between phases, edits via Claude Code directly. |

## Architecture
```
content/*.json  ──►  Next.js static build  ──►  Vercel (public)
      ▲                                            ▲
      │ edits                                      │ git push (auto-deploy)
Claude Code (interim) / Studio (Phase 2, local :87xx, claude -p critic)
      │
scripts/sanitize-check.mjs  — pre-publish gate: greps build output for
      phone, NRIC patterns (S/T/F/G/M + 7 digits + letter), internal IPs/hosts,
      client & worker names blocklist. Non-zero exit blocks publish.
```

## Verification (Phase 1 done =)
- Live URL on Vercel, mobile-clean, Lighthouse ≥ 90
- All internal links + resume.pdf work
- Sanitize gate green on built output
- 45-second-skim test: positioning, flagship, and CTA all land above the fold-and-one-scroll

## Phase 2 verification
- Each critic job demonstrated end-to-end on real content
- One full edit → critique → publish loop
