# Security header report

Verified on the Vercel preview on 3 August 2026.

| Control | Preview result | Production policy |
|---|---|---|
| Content Security Policy | Present; self by default, object blocked, framing denied, form submission self-only | Same, without the preview-toolbar allowance |
| HSTS | `max-age=63072000; includeSubDomains; preload` from Vercel | Required |
| MIME sniffing | `X-Content-Type-Options: nosniff` | Required |
| Referrer | `strict-origin-when-cross-origin` | Required |
| Permissions | camera, microphone, geolocation and browsing topics disabled | Required |
| Frame protection | `frame-ancestors 'none'` plus `X-Frame-Options: DENY` | Required |
| Preview index protection | `X-Robots-Tag: noindex, nofollow` | Removed in production |
| Server disclosure | Next.js powered-by header disabled | Required |

API defenses include content-type and 20KB limits, same-origin enforcement, strict schema validation, hidden honeypot, minimum completion time, five-attempt/15-minute rate limits, hashed IP keys, server-only provider credentials, bounded provider timeouts, no-store responses and safe error messages. Logs exclude submitted personal fields.

Remaining launch checks: rotate and scope provider credentials; use a random `CONTACT_IP_SALT`; verify Supabase RLS/revokes after applying the migration; verify sender-domain SPF/DKIM/DMARC; confirm Vercel team access and MFA; test CSP against the final production hostname.
