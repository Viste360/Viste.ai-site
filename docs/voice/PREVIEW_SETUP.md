# VISTE Voice Preview setup

VISTE Voice ships disabled and deny-by-default. Configure it first in a non-production Vercel Preview environment.

## 0. Public host and call path

Keep VISTE Voice in the existing Vercel project. Add `voice.viste.ai` as a served custom domain, not a redirect. The application internally rewrites the subdomain homepage to `/voice` and `/es` to `/es/voz`, while keeping the branded hostname visible. Add the exact project-specific CNAME shown by Vercel only after Preview acceptance.

The normal native call path is:

- Telephone audio: caller → Twilio number → ElevenLabs Vera agent.
- Browser demo: browser → `voice.viste.ai` → short-lived ElevenLabs WebRTC token.
- Control and data: ElevenLabs → signed `voice.viste.ai/api/voice/*` tools and webhooks → Supabase.

Do not send the live telephone audio through Vercel. Do not replace the Twilio number's primary Voice URL after ElevenLabs imports and configures it.

## 1. Database

Apply `20260821130238_viste_voice_foundation.sql` to the existing VISTE Supabase project. Confirm that every new `voice_*` public table has RLS enabled, authenticated users have tenant-scoped read access only, and server-side service access is available.

The migration creates the private `voice-recordings` Storage bucket without a browser read policy. Do not add a public policy. Playback will use short-lived signed URLs in a later portal phase.

## 2. ElevenLabs and Twilio

Create Vera as a private, versioned ElevenAgents agent and import one approved, voice-capable Twilio number through ElevenLabs' native integration. A purchased Twilio number supports inbound and outbound service; a verified caller ID is outbound-only. Assign Vera to the imported number. ElevenLabs configures the Twilio voice routing, so VISTE should not overwrite that primary Voice URL.

Use a restricted Twilio API key where supported. Keep the Twilio Auth Token only where it is required for Twilio request-signature validation. Configure Spanish and English, interruption support, no recording for the public demo, and the VISTE webhook/tool URLs.

Set the Preview-only server values from `.env.example`, including:

- `ELEVENLABS_VERA_AGENT_ID`
- `ELEVENLABS_VERA_PHONE_NUMBER_ID`
- `ELEVENLABS_WEBHOOK_SECRET`
- Twilio API credentials and webhook auth token
- independent random values for `VOICE_TOOL_BEARER_TOKEN`, `VOICE_TOOL_SIGNING_SECRET` and `VOICE_PHONE_HASH_SALT`

The ElevenLabs post-call webhook is `/api/voice/webhooks/elevenlabs`. The Twilio status webhook is `/api/voice/webhooks/twilio`. Configure ElevenLabs webhook tools with `Authorization: Bearer <VOICE_TOOL_BEARER_TOKEN>` and the mapped `X-Viste-Agent-Id`. The endpoint also accepts the provider-neutral HMAC-SHA256 scheme using `X-Viste-Timestamp` and `X-Viste-Signature`.

For requested callbacks, VISTE first records consent and approves policy, then calls the ElevenLabs outbound-call API with Vera's agent ID and imported phone-number ID. Store both the returned ElevenLabs conversation ID and Twilio Call SID in Supabase. Human transfers use ElevenLabs' native transfer tool and approved E.164 destinations.

## 3. Release switches

Keep `VOICE_MODULE_ENABLED=false` while wiring credentials. Keep `VOICE_OUTBOUND_POLICY_REVIEWED=false` until the approved Spain/EU policy and the caller-number classification have been recorded. The global kill switch must be tested in both states.

Only after those checks:

1. Set `VOICE_MODULE_ENABLED=true` in Preview.
2. Complete the web conversation at `/voice` and `/es/voz`.
3. Request one callback to a controlled test number.
4. Confirm the spoken AI disclosure and that no recording starts.
5. Repeat the post-call webhook and verify that no duplicate call/event is created.
6. Trigger `record_opt_out` and verify that the same phone hash is blocked immediately.
7. Turn on `VOICE_GLOBAL_KILL_SWITCH` and confirm that new sessions and callbacks stop without a deployment.

## 4. Production boundary

Do not change DNS or enable production outbound calls from this setup step. Run `npm run check` and `npm run test:e2e`, review the Vercel Preview, obtain the required policy approval, and promote through the normal VISTE release process.
