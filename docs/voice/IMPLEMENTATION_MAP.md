# VISTE Voice implementation map

Date: 21 August 2026  
Source: `VISTE-Voice-AI-Sales-Agent-Blueprint-v1.0.md`

## Delivery boundary

This first implementation establishes the provider-neutral control plane, Vera's bilingual public experience, consented demo requests, provider webhooks, and release gates. Live calling remains disabled until the Preview environment has reviewed credentials, an approved caller number, and an outbound policy approval.

## Reuse

| Existing VISTE capability | VISTE Voice use |
| --- | --- |
| `tenants`, `memberships`, and `is_tenant_member` | Tenant ownership and read isolation for every voice record |
| `contacts`, `opportunities`, `bookings`, and `approvals` | CRM, qualification, calendar outcomes, and human approval; no duplicate CRM tables |
| `consent_records` and `suppression_entries` | Extended for telephone consent evidence and immediate opt-out enforcement |
| `agent_configs` and `knowledge_sources` | Existing generic AI configuration and approved knowledge remain valid; voice-specific versions reference the same tenant |
| Studio `brands`, `brand_voices`, and ElevenLabs catalogue route | Approved brand/voice assets and the existing server-only ElevenLabs credential |
| `audit_logs` and `security_events` | Configuration, compliance, and abuse evidence |
| Supabase server client pattern | Server-only writes with no secret or service key in the browser |
| Turnstile, contact-form protections, analytics, bilingual layouts, metadata, and design tokens | Public demo protection and English/Spanish route parity |

## Add now

- Voice provider and telephony contracts with ElevenLabs and Twilio adapters.
- A deny-by-default outbound compliance engine, including Spain's 17 October 2026 commercial `400` number rule.
- Versioned Vera prompt composition with immutable AI-disclosure and opt-out rules.
- Voice agents, versions, numbers, offers, calls, events, analyses, tool runs, usage, outbound decisions, and temporary demo-request records.
- Explicit Data API grants, RLS on every new public table, service-only mutations, and tenant-member reads.
- HMAC verification for ElevenLabs and Twilio, timestamp checks, replay-safe provider event keys, and redacted persistence.
- `/voice` and `/es/voz`, a secured web-voice session, and a consented requested-callback form.
- Unit tests for policy boundaries, signatures, prompt invariants, and request validation; browser tests for bilingual rendering and the demo funnel.
- Preview setup and acceptance documentation.

## Change carefully

- Add `/voice` ↔ `/es/voz` to locale routing, sitemap, and public-route tests.
- Add only placeholder voice settings to `.env.example`; all credentials remain server-only.
- Extend the content-security policy only for the ElevenLabs WebRTC/WebSocket connection used by the first-party voice UI.
- Generalize the existing Turnstile widget's action name while preserving its current default.

## Defer behind explicit release gates

- Purchasing or releasing telephone numbers.
- Enabling production outbound calls or DNS changes.
- Website crawling and temporary knowledge extraction; the submitted URL is stored for a reviewed worker, not fetched synchronously.
- Customer portal, VISTE HQ voice dashboard, Stripe metering, WhatsApp delivery, recording playback, and OpenAI Realtime runtime.
- Voice cloning, cold lists, autonomous payment collection, or regulated-advice use cases.

## Release gates

1. `VOICE_MODULE_ENABLED=true` in Vercel Preview.
2. ElevenLabs Vera agent and Twilio-connected ElevenLabs phone-number identifiers configured server-side.
3. `VOICE_OUTBOUND_POLICY_REVIEWED=true` only after the approved legal/operational policy is recorded.
4. Valid HMAC secrets, phone-hash salt, Turnstile, Supabase migration, and private recording bucket.
5. `npm run check` and `npm run test:e2e` passing on a non-production branch.
6. Preview web conversation, requested callback, disclosure, opt-out, duplicate webhook, and kill-switch tests completed before production.
