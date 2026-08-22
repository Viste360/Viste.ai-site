import { z } from "zod";

export const avatarProviderIds = ["manual", "open_source"] as const;
export type AvatarProviderId = (typeof avatarProviderIds)[number];

export const avatarRenderRequestSchema = z.object({
  talentId: z.string().uuid(),
  provider: z.enum(avatarProviderIds),
  script: z.string().trim().min(2).max(1_200),
  language: z.enum(["en", "es"]),
  cueId: z.string().trim().min(2).max(120).nullable().optional(),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  background: z.enum(["transparent", "studio_dark", "source"]).default("studio_dark"),
});

export type AvatarRenderRequest = z.infer<typeof avatarRenderRequestSchema>;

export type AvatarWorkerSubmission = AvatarRenderRequest & {
  jobId: string;
  sourceVideoUrl: string;
  sourceAudioUrl?: string;
  callbackUrl?: string;
};

export type AvatarProviderStatus = {
  id: AvatarProviderId | "heygen";
  configured: boolean;
  mode: "ingest" | "self_hosted" | "hosted";
};

export function avatarProviderStatuses(): AvatarProviderStatus[] {
  const renderingEnabled = process.env.AVATAR_RENDERING_ENABLED === "true";
  return [
    { id: "manual", configured: true, mode: "ingest" },
    {
      id: "open_source",
      configured: renderingEnabled && Boolean(process.env.AVATAR_OPEN_SOURCE_RENDER_URL && process.env.AVATAR_OPEN_SOURCE_RENDER_TOKEN),
      mode: "self_hosted",
    },
    { id: "heygen", configured: false, mode: "hosted" },
  ];
}

function openSourceConfiguration() {
  if (process.env.AVATAR_RENDERING_ENABLED !== "true") return null;
  const baseUrl = process.env.AVATAR_OPEN_SOURCE_RENDER_URL?.replace(/\/$/, "");
  const token = process.env.AVATAR_OPEN_SOURCE_RENDER_TOKEN;
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

const workerResponseSchema = z.object({
  id: z.string().min(1).max(240),
  status: z.enum(["queued", "processing"]).default("queued"),
});

export async function submitOpenSourceRender(input: AvatarWorkerSubmission) {
  const configuration = openSourceConfiguration();
  if (!configuration) throw new Error("OPEN_SOURCE_PROVIDER_NOT_CONFIGURED");

  const response = await fetch(`${configuration.baseUrl}/v1/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_job_id: input.jobId,
      source_video_url: input.sourceVideoUrl,
      source_audio_url: input.sourceAudioUrl,
      script: input.script,
      language: input.language,
      aspect_ratio: input.aspectRatio,
      background: input.background,
      callback_url: input.callbackUrl,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`OPEN_SOURCE_PROVIDER_${response.status}`);
  return workerResponseSchema.parse(await response.json());
}
