# Contact form test report

Test date: 3 August 2026

## Automated evidence

- 15 Vitest tests passed, including valid/invalid schema cases, qualification logic, storage, notification, booking, honeypot, provider failure and the rule that notification alone cannot substitute for durable Supabase storage.
- Browser tests passed on desktop and mobile for all required fields, validation failure, safe API failure, mocked successful conversion, qualified booking handoff and error/success rendering.
- UTM source/medium/campaign/term/content, referrer and source URL are carried to the server and mapped to the lead record.
- No secret values or submitted field values are written to application logs.

## Deployed-preview evidence

Preview tested: `https://viste-ai-site-4tja8cjjz-vistes-projects-c629d2e5.vercel.app`

- `/api/health` reported `contact: "ready"` and `ready` for lead storage, notification and booking.
- The deliberately marked qualified submission returned HTTP 201 with reference `f204b2aa-776c-4c4b-9fce-5aa10541ade2`, `notification: "sent"` and the approved Google Calendar booking URL.
- The matching Supabase row contained the expected QA company marker, qualification state and UTM attribution.
- Resend recorded a successful API request and a `sent` transactional message to the configured notification recipient.
- Earlier controlled attempts demonstrated the fail-closed path: an invalid payload returned HTTP 400, an unavailable durable store returned HTTP 503, and neither condition produced a false success response.
- The two marked QA rows created while repairing and retesting the provider configuration were removed after verification. No production lead data was changed.

## Required live-delivery acceptance test

1. Apply the Supabase migration and add Preview-only provider values in Vercel.
2. Confirm `/api/health` reports every contact check as `ready`.
3. Submit one clearly marked test lead with a unique UTM campaign.
4. Match browser reference ID, Supabase row and transactional email.
5. Confirm the qualified test opens the approved booking URL and an unqualified test does not.
6. Trigger the rate limit and notification failure monitor in a controlled test.
7. Delete test records under the agreed test-data process and record the evidence.

The acceptance test passed on 3 August 2026. The reviewed release candidate is approved for production promotion; the live domain must still receive a post-deployment smoke test.
