# Vercel setup and release

Framework: Next.js; install `npm ci`; build `npm run build`; Node 24 recommended. Confirm the existing project points to `Viste360/Viste.ai-site` and `main` is the production branch. Non-main branches must be Preview only.

Configure environment variables by scope. Preview must use isolated/non-delivering lead settings and remains noindex. Production form delivery requires Supabase or Resend. `NEXT_PUBLIC_SITE_URL=https://viste.ai` in Production.

Enable Vercel Web Analytics and Speed Insights in the project dashboard. Both clients remain consent-gated in the application. Use `GET /api/health` for uptime checks; `contact: "ready"` means at least one secure form delivery channel is configured, while `contact: "direct"` means the visible email and WhatsApp fallback remains active.

Release sequence: push working branch → inspect Vercel Preview → run checks against its URL → approve commit → fast-forward `main` → watch build → live smoke test, including `/api/health`. Do not change DNS or the production domain in this workflow.
