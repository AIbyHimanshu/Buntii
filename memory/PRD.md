# Buntii — Pre-launch Waitlist Website · PRD

## Original problem statement
Build a production-quality pre-launch waitlist website for Buntii — a real-time local marketplace for independent shops (greengrocers, fishmongers, bakers, butchers). Validation layer only: explain Buntii, recruit shoppers + traders to a waitlist, build local density on Green Lanes. Locked jade/coral design system (7 core + 3 state values), Bricolage Grotesque + DM Sans, verbatim approved copy, "trust your auntie" voice. Pages: / /shoppers /traders /privacy /terms /admin. Waitlist: form → Turnstile → Supabase → admin dashboard (CSV/XLSX) → Resend confirmation → PostHog events. Stat block with confirmed figures (38.6%, £17bn, fishmongers <1,000 directional). Founders section omitted (copy marked "Not Yet Decided").

## Platform adaptation (decided with user)
- Environment runs React (CRA) + FastAPI + MongoDB, not Next.js + Supabase + Vercel.
- User will paste Supabase Project URL + anon/service keys and PostHog + Turnstile keys — NOT YET PROVIDED.
- Storage layer auto-switches: MongoDB now → Supabase Postgres (REST, service role) the moment `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` land in backend/.env. Schema + RLS SQL: /app/reference/supabase_setup.sql.
- Admin auth: JWT + bcrypt, seeded admin (test credentials in /app/memory/test_credentials.md).
- Email: Emergent-managed Resend (EMERGENT_EMAIL_KEY) — live and verified.

## User personas
- Squeezed household shopper — wants real food reduced nearby, no mystery bags.
- Values-led deal-hunter — early adopter, future deal-spotter.
- Independent trader (Green Lanes) — no EPOS, thin margins, posts surplus at close.
- Buntii founder/admin — needs waitlist visibility, filtering, export.

## Core requirements (static)
1. Locked design system honoured exactly (tokens, contrast rules, one coral band/CTA, jade prices, wordmark colourways with full stop).
2. Verbatim approved copy; no invented traction, merchants, or biographies.
3. Waitlist data model per spec (role, postcode, trader step-2 fields, UTM, referral).
4. Public insert / admin-only read; admin protected by real auth.
5. CSV (filtered) + XLSX (Shoppers/Traders/Summary sheets) export.
6. PostHog events; Turnstile bot protection; Resend confirmations.
7. Deployment checklist gates before production.

## Implemented — 2026-08-19
- Design system: tokens, button/card/form states, wordmark component, awning mark, marquee, masked hero reveal, parallax hero cards, animate-on-scroll stat counters, Lenis smooth scroll, framer-motion reveals.
- Homepage (all 11 sections in mandated order + FAQ), /shoppers, /traders, /privacy, /terms.
- Waitlist form: role segmented, UK postcode validation with helper errors, trader second step, referral link generation + copy, UTM/ref attribution capture.
- Backend: /api/waitlist, /api/waitlist/details, JWT auth (login/me/logout, idempotent admin seed), admin signups search/filter, CSV + XLSX export, Supabase-ready storage switch, Turnstile verify (fail-open until keyed), PostHog server capture (no-op until keyed).
- Resend confirmation emails via managed proxy — verified 202 Accepted.
- Verified end-to-end: shopper signup (UI + API), duplicate handling, trader 2-step (UI), admin login, table tabs, filters, CSV, XLSX, 401 on unauthenticated admin.

## Backlog
- P0: Founder story section — needs founder-approved copy before it ships (currently omitted).
- P0: User to do ONE manual waitlist signup on the preview to tick the real Turnstile checkbox (automation can't tick it by design; the loop was verified with Cloudflare's official test keys).
- P1: Replace dummy social URLs (@buntii.app handles unconfirmed); confirm privacy@/legal@buntii.co.uk inboxes exist.
- P1: Legal review of Privacy/Terms drafts; mobile device QA; branded sending domain for email (currently platform-shared domain).
- P1: Connect buntii.co.uk domain; submit sitemap to Search Console.
- P2: PostGIS migration path (direct asyncpg/pooler connection) when live-map work starts; brute-force lockout on admin login; rate limiting on /api/waitlist; referral leaderboard.

## Implemented — 2026-08-19 (evening, integrations live)
- Supabase Postgres is now the source of truth (service-role key configured; health reports store: supabase). Verified: signup insert, duplicate 409 handling, trader details PATCH, admin reads/filters/CSV/XLSX all run against Supabase; RLS confirmed — anon key SELECT returns [] while service role reads.
- PostHog live on EU cloud (browser + server events).
- Turnstile live: widget renders after hostname allowlist; full widget→token→siteverify→accept loop verified with Cloudflare test keys; tokenless/forged requests rejected with 400.
- Test rows cleaned from production Supabase project.

## Next tasks
1. Collect Supabase/PostHog/Turnstile keys from user and wire them live.
2. Re-run deployment checklist once keys are in.
3. Mobile viewport polish pass on hero card stack.
