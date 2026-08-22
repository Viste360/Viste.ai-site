# Viste Avatar Studio

Status: owner-only Preview foundation implemented. Production rendering remains disabled.

## Product boundary

Avatar Studio is the creation and operations layer behind avatar experiences such as Michael Live Coach. It is available at `/avatar/studio` and `/es/avatar/studio`; the workout experience stays at `/avatar` and `/es/avatar`.

The web application does not run GPU models. It stores consented talent profiles, approved scripts, private source assets and render-job state. A separate provider performs video generation, so the same workflow can use a self-hosted open-source worker or a reviewed hosted provider later.

## Implemented

- Owner-only Google sign-in using the existing Studio identity and tenant boundary.
- Bilingual Avatar Studio UI with talent, script, provider, queue and pilot-media views.
- Documented consent evidence required before a talent can become ready.
- Private source video and optional voice references reused from Studio Assets.
- Provider-neutral render jobs with manual-ingest and self-hosted open-source modes.
- Server-only worker URL and token; source media is passed through one-hour signed URLs.
- Rendering disabled by default with `AVATAR_RENDERING_ENABLED=false`.
- RLS-backed Supabase migration and explicit authenticated read grants.
- Current owner test clips clearly marked for replacement before launch.

## Open-source worker contract

When enabled, the server sends `POST {AVATAR_OPEN_SOURCE_RENDER_URL}/v1/jobs` with a bearer token and this payload:

```json
{
  "external_job_id": "uuid",
  "source_video_url": "one-hour signed URL",
  "source_audio_url": "optional one-hour signed URL",
  "script": "approved line",
  "language": "en",
  "aspect_ratio": "9:16",
  "background": "studio_dark"
}
```

The worker must answer with `{ "id": "provider-job-id", "status": "queued" }` or `processing`. The adapter is intentionally model-neutral; LivePortrait, MuseTalk or a successor can sit behind this contract without changing the product UI or database.

## Activation checklist

1. Apply `supabase/migrations/202608210002_avatar_studio.sql` to the correct Supabase environment.
2. Upload reference video, optional voice audio and consent evidence through private Studio Assets.
3. Deploy a separately isolated GPU worker with authentication, request limits and private output storage.
4. Set `AVATAR_OPEN_SOURCE_RENDER_URL` and `AVATAR_OPEN_SOURCE_RENDER_TOKEN` in Vercel Preview only.
5. Set `AVATAR_RENDERING_ENABLED=true` in Preview and verify a non-production talent/job end to end.
6. Add worker status synchronisation and output ingestion before approving clips for runtime use.

No production domain, DNS, hosted provider account or paid generation is activated by this implementation.
