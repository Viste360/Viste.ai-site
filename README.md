# Viste.ai global website

The bilingual public site and lead platform for Viste.ai. English lives at `/`; Spanish lives at `/es`. The application is a single Next.js project deployed from GitHub to Vercel. Repository-owned typed content keeps routine updates reviewable and reversible.

## Local setup

1. Install Node.js 20.9 or newer.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and add only development credentials. Never commit that file.
4. Run `npm run dev` and open `http://localhost:3000`.

Quality gate: `npm run check` and `npm run test:e2e`.

## Production model

- `main` is the expected Vercel production branch.
- Every other branch must create a noindex Preview deployment.
- Supabase and Resend are optional at build time but at least one must be configured for form delivery.
- Direct email and WhatsApp contact remain visible if a form integration is unavailable.
- OpenAI is not called by the launch site.

See [OWNER_GUIDE.md](./docs/OWNER_GUIDE.md), [VERCEL_SETUP.md](./docs/VERCEL_SETUP.md), [SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md) and [ROLLBACK.md](./docs/ROLLBACK.md).
