# ResumeIQ

AI resume analysis (ATS score, keyword gaps, suggestions) and an AI-assisted
resume builder. Next.js (App Router) + TypeScript, Supabase (Postgres, Auth,
Storage), and Claude for the AI features.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind + shadcn/ui
- Supabase: Postgres, Auth (email/password), Storage
- Claude (`@anthropic-ai/sdk`) for analysis + builder section generation,
  with zod-validated structured output
- `pdf-parse` / `mammoth` for resume text extraction, `@react-pdf/renderer`
  for exporting builder drafts to PDF
- Vitest (unit) + Playwright (e2e)

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Run every file in `supabase/migrations/` in order (SQL editor, or
   `supabase db push` once the project is linked with the CLI). They create
   `profiles`, `resumes`, `resume_versions`, `analyses`, `ai_usage`, `jobs`,
   `resume_chunks` (pgvector), their RLS policies, the `match_resume_chunks`
   retrieval function, and a private `resumes` storage bucket.
3. Deploy the embeddings Edge Function with JWT verification off (it checks
   the user's session itself):
   ```
   supabase functions deploy embed --no-verify-jwt
   ```
4. Email templates can stay at their defaults: signup and reset emails
   return through `/auth/confirm` (PKCE code exchange), which also accepts
   `token_hash` links if you customize the templates later.
5. For a deployed site, set **Authentication → URL Configuration → Site
   URL** to its address (email links must return to the Site URL's host).
6. Copy the Project URL and the `anon`/publishable key from
   **Project Settings → API**.

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — from
  Supabase above.
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com).
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3001` locally.
- `DAILY_AI_CALL_LIMIT` — optional, defaults to 20.

Every page checks the Supabase session, so the app needs valid (or at least
correctly-formatted) Supabase env vars just to boot, even on the landing
page.

### 3. Install and run

```bash
npm install
npm run dev
```

## Commands

```bash
npm run dev         # start the dev server (Turbopack)
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test          # unit tests (Vitest)
npm run test:e2e      # e2e tests (Playwright; starts its own dev server)
```

## Project layout

```
app/
  (auth)/            login, signup, forgot/reset password, auth actions
  (app)/             authenticated area: dashboard, analyses, settings,
                     analyze, builder, resume/job actions
  api/                route handlers for analyze / generate / builder actions
  auth/               Supabase confirm + signout route handlers
lib/
  supabase/           browser/server/proxy Supabase clients
  ai/                 Claude client, prompts (analysis, job parsing,
                      builder), zod schemas, input limits
  analysis/           analysis pipeline: job resolution → retrieval → AI → save
  matching/           deterministic requirement-weighted match score
  rag/                resume chunking, embeddings (via Edge Function), retrieval
  parsing/            PDF/DOCX → text extraction
  db/                  Supabase query helpers, daily AI-call rate limiting
  pdf/                 @react-pdf/renderer resume document
supabase/migrations/  hand-authored SQL schema + RLS policies
supabase/functions/   `embed` Edge Function (gte-small embeddings)
tests/unit/           Vitest
tests/e2e/             Playwright
```

## What's implemented vs. simplified for this scope

- **Auth**: email/password only (no OAuth yet — `@supabase/ssr` makes
  adding a provider straightforward later).
- **Rate limiting**: a daily (UTC) per-user cap on AI calls, recorded in
  `ai_usage` (`lib/db/rate-limit.ts`). Analyses, job parsing, and builder
  generations each count once, including failed calls (the API cost is
  incurred either way). No network/IP-layer rate limiting yet.
- **Job matching**: pasted postings are parsed once into individual
  requirements and saved to `jobs`. The match score is computed in code
  (`lib/matching/score.ts`: required ×2, partial = half credit), not asked
  of the model.
- **RAG**: resumes are chunked and embedded on their first job match, and
  the most similar chunks per requirement are passed to the model as
  evidence. Retrieval is best-effort — if embeddings fail, the analysis
  still runs on the full resume text.
- **Builder**: four fixed sections (summary, experience, skills,
  education), one PDF template. No section reordering or multiple resume
  templates yet.
- **File upload limit**: 5MB, PDF/DOCX/TXT only.
- **No payments** — matches the current scope (auth without billing).

## Deployment

- **App**: Vercel (or any Next.js host). Set the env vars above in the
  hosting platform.
- **Database/Auth/Storage**: Supabase cloud project — run the migration
  there too, and repeat the email template change in that project's
  dashboard.
