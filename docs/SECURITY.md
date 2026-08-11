# Security operations

The site sends CSP, frame, sniffing, permissions and referrer protections; production adds HSTS. Forms enforce origin, JSON content type, body size, schema, honeypot, elapsed time and per-instance rate limits. VIS_010 also uses the atomic Supabase rate-limit function for durable throttling. IP values are hashed with a runtime or configured salt and are never logged in plaintext.

Cloudflare Turnstile is optional in local development and required when `TURNSTILE_SECRET_KEY` is configured. Configure both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and the server-only secret together. The dynamic Advisor renders the widget explicitly; the server validates the action-bound, short-lived token through Siteverify before persistence or any future AI call. Failed validation is closed, counted by reason without retaining an IP or token, and never forwarded to a model. See [Cloudflare's client rendering guidance](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/) and [server validation guidance](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

Contact storage and notification run independently with eight-second upstream timeouts, so one provider can succeed if the other is unavailable. Each submission receives a non-sensitive request ID. Operational logs contain only that ID, the generated lead reference, delivery channel outcomes and duration; names, emails, IP addresses and message bodies are never logged.

Supabase secret, Turnstile secret and email keys are server-only. RLS denies browser table access and admin users require Auth plus an allowlist or tenant membership. The public `/api/health` endpoint exposes only status categories; it never checks or returns secret values. Run `npm audit`, `npm run check` and browser tests before release. Rotate keys after suspected exposure and inspect Vercel/Supabase/Resend logs without copying form bodies into tickets.

Security reports: `security@viste.ai`. Verify the mailbox before advertising a formal disclosure programme.
