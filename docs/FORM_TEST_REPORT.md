# Contact form test report

Test date: 3 August 2026

## Automated evidence

- 15 Vitest tests passed, including valid/invalid schema cases, qualification logic, storage, notification, booking, honeypot, provider failure and the rule that notification alone cannot substitute for durable Supabase storage.
- Browser tests passed on desktop and mobile for all required fields, validation failure, safe API failure, mocked successful conversion, qualified booking handoff and error/success rendering.
- UTM source/medium/campaign/term/content, referrer and source URL are carried to the server and mapped to the lead record.
- No secret values or submitted field values are written to application logs.

## Deployed-preview evidence

The preview shows the complete bilingual form. A request using explicitly illustrative data returned HTTP 503, a non-sensitive request ID and `mailto:hello@viste.ai` fallback because Preview provider variables are not configured. `/api/health` reports `configuration-required` for storage, notification and booking. This is the required fail-closed behavior, not a launch-ready result.

## Required live-delivery acceptance test

1. Apply the Supabase migration and add Preview-only provider values in Vercel.
2. Confirm `/api/health` reports every contact check as `ready`.
3. Submit one clearly marked test lead with a unique UTM campaign.
4. Match browser reference ID, Supabase row and transactional email.
5. Confirm the qualified test opens the approved booking URL and an unqualified test does not.
6. Trigger the rate limit and notification failure monitor in a controlled test.
7. Delete test records under the agreed test-data process and record the evidence.

Production approval is blocked until this acceptance test passes.
