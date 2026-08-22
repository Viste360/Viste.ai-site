export const VISTE_TENANT_ID = "10000000-0000-4000-8000-000000000010";

function enabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}

function configured(value: string | undefined) {
  const candidate = value?.trim();
  return candidate && !/(example|replace|placeholder|tbd)/i.test(candidate) ? candidate : undefined;
}

export function getVoiceConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    enabled: enabled(env.VOICE_MODULE_ENABLED),
    globalKillSwitch: enabled(env.VOICE_GLOBAL_KILL_SWITCH),
    outboundPolicyReviewed: enabled(env.VOICE_OUTBOUND_POLICY_REVIEWED),
    defaultProvider: configured(env.VOICE_DEFAULT_PROVIDER) || "elevenlabs",
    defaultTelephonyProvider: configured(env.VOICE_DEFAULT_TELEPHONY_PROVIDER) || "twilio",
    veraAgentId: configured(env.ELEVENLABS_VERA_AGENT_ID),
    veraPhoneNumberId: configured(env.ELEVENLABS_VERA_PHONE_NUMBER_ID),
    elevenLabsApiKey: configured(env.ELEVENLABS_API_KEY),
    elevenLabsWebhookSecret: configured(env.ELEVENLABS_WEBHOOK_SECRET),
    twilioWebhookAuthToken: configured(env.TWILIO_WEBHOOK_AUTH_TOKEN),
    phoneHashSalt: configured(env.VOICE_PHONE_HASH_SALT),
    recordingBucket: configured(env.VOICE_RECORDING_BUCKET) || "voice-recordings",
    audioRetentionDays: Number(env.VOICE_DEFAULT_AUDIO_RETENTION_DAYS || 30),
    transcriptRetentionDays: Number(env.VOICE_DEFAULT_TRANSCRIPT_RETENTION_DAYS || 90),
    demoDataTtlDays: Number(env.VOICE_DEMO_DATA_TTL_DAYS || 7),
    demoMaxCallsPerNumber30Days: Number(env.VOICE_DEMO_MAX_CALLS_PER_NUMBER_30D || 3),
  } as const;
}

export function voiceRuntimeReady(env: NodeJS.ProcessEnv = process.env) {
  const config = getVoiceConfig(env);
  return config.enabled
    && !config.globalKillSwitch
    && Boolean(config.elevenLabsApiKey && config.veraAgentId);
}
