# Security operations

The site sends CSP, frame, sniffing, permissions and referrer protections; production adds HSTS. Forms enforce origin, JSON content type, body size, schema, honeypot, elapsed time and per-instance rate limits. IP values are hashed with a runtime or configured salt and are never logged in plaintext.

Contact storage and notification run independently with eight-second upstream timeouts, so one provider can succeed if the other is unavailable. Each submission receives a non-sensitive request ID. Operational logs contain only that ID, the generated lead reference, delivery channel outcomes and duration; names, emails, IP addresses and message bodies are never logged.

Supabase secret and email keys are server-only. RLS denies browser table access and admin users require Auth plus an allowlist. The public `/api/health` endpoint exposes only status, release, timestamp and contact mode; it never checks or returns secret values. Run `npm audit`, `npm run check` and browser tests before release. Rotate keys after suspected exposure and inspect Vercel/Supabase/Resend logs without copying form bodies into tickets.

Security reports: `security@viste.ai`. Verify the mailbox before advertising a formal disclosure programme.
