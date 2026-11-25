# ResumeIQ Roadmap

## Phase 0 — Foundation
- [ ] Repository setup
- [x] Next.js setup
- [x] TypeScript
- [x] Tailwind
- [x] UI system
- [x] Environment configuration

## Phase 1 — Authentication
- [x] Supabase
- [x] Sign up
- [x] Login
- [x] Logout
- [x] Protected routes

## Phase 2 — Resume ingestion
- [x] PDF upload
- [x] File validation
- [x] Text extraction
- [x] Resume storage

## Phase 3 — Resume analysis
- [x] Resume parser
- [x] AI analysis
- [x] Structured output
- [x] Score calculation

## Phase 4 — Job matching
- [x] Job input
- [x] Job parsing
- [x] Matching engine
- [x] Match score

## Phase 5 — RAG
- [x] Chunking
- [x] Embeddings
- [x] pgvector
- [x] Retrieval
- [x] Context generation

## Phase 6 — Dashboard
- [x] Resume dashboard
- [x] Scores
- [x] Recommendations
- [x] History

## Phase 7 — Production
- [x] Testing
- [x] Security
- [ ] Performance
- [x] Error handling
- [ ] Analytics
- [x] Deployment

## Launch board (minor project showcase)

Goal: finished and presentable, not a running product. AI stays off (no key).

Must do:
- [ ] Supabase → Auth → Email: turn off "Confirm email" (you)
- [ ] Supabase → Auth → URL Configuration: Site URL + redirect URL (you)
- [ ] Send the real contact email for Privacy/Terms (you → Claude swaps it)
- [x] Show "AI analysis is off in this demo" instead of a failure (Claude)
- [ ] Sign up once on the live site and click through every page (you + Claude)

Nice to have (skip if short on time):
- [ ] Demo login with a sample resume for graders
- [ ] Rename the Vercel project for a nicer URL
- [ ] Screenshots + live link in README for the submission

Skipped on purpose: AI features, custom email (SMTP), analytics, performance work.
