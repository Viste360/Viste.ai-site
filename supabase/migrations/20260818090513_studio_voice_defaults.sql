-- Save the preferred ElevenLabs voice and text-to-speech model for each brand.
-- Studio remains server-only for mutations; authenticated clients retain read-only access.

alter table public.brand_voices
  add column if not exists model_id text not null default 'eleven_multilingual_v2';

alter table public.brands
  add column if not exists default_voice_id uuid references public.brand_voices(id) on delete set null,
  add column if not exists default_tts_model_id text not null default 'eleven_multilingual_v2';

alter table public.campaigns
  add column if not exists tts_model_id text;

create index if not exists brands_default_voice_idx
  on public.brands (default_voice_id)
  where default_voice_id is not null;
