@AGENTS.md

# ResumeIQ

## Product

ResumeIQ is an AI-powered resume analysis and optimization platform.

## Goal

Build a production-quality full-stack application rather than a demo.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL
- Supabase
- pgvector
- LLM API
- Vercel

## Engineering Principles

- TypeScript everywhere possible.
- Prefer simple solutions over unnecessary abstractions.
- Do not introduce libraries without a reason.
- Do not rewrite working code unnecessarily.
- Never hardcode secrets.
- Never expose API keys to the client.
- Validate external input.
- Keep components reusable.
- Keep business logic separate from UI.
- Write tests for important functionality.

## Git

- Work in small commits.
- Never force push.
- Never delete branches without asking.
- Never commit .env files.
- Never commit secrets.

## Before modifying code

- Inspect relevant files.
- Understand existing architecture.
- Make the smallest appropriate change.

## Verification

After implementing a feature:

1. Run the relevant tests.
2. Run type checking.
3. Run linting.
4. Run the application when relevant.
5. Verify the feature.
6. Fix discovered issues.

## Product rule

Do not add features that aren't part of the current scope without asking first.
