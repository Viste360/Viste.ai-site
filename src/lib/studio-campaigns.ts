import { z } from "zod";

export const studioPlatforms = ["linkedin", "instagram", "facebook", "youtube", "tiktok", "x", "manual_export"] as const;

export const hookBriefSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().trim().min(2).max(180),
  objective: z.string().trim().min(8).max(800),
  audience: z.string().trim().min(8).max(800),
  productOrService: z.string().trim().max(500).default(""),
  geographicMarket: z.string().trim().max(160).default(""),
  language: z.enum(["en", "es"]),
  platforms: z.array(z.enum(studioPlatforms)).min(1).max(6),
  desiredCta: z.string().trim().min(2).max(300),
  idea: z.string().trim().min(12).max(1600),
  selectedVoiceId: z.string().uuid().nullable().default(null),
  ttsModelId: z.string().trim().min(3).max(160).nullable().default(null),
});

export const hookConceptSchema = z.object({
  conceptName: z.string().min(1).max(100),
  openingHook: z.string().min(1).max(280),
  openingBeats: z.array(z.object({
    timing: z.enum(["0-3s", "3-7s", "7-12s"]),
    visual: z.string().min(1).max(300),
    spoken: z.string().min(1).max(300),
    onScreenText: z.string().max(140),
  })).length(3),
  mainScript: z.string().min(1).max(5000),
  alternativeCta: z.string().min(1).max(300),
  deliveryNotes: z.string().min(1).max(500),
  sourceClaims: z.array(z.object({ claim: z.string(), sourceStatus: z.enum(["provided", "source_required"]) })).max(20),
});

export const hookResponseSchema = z.object({ concepts: z.array(hookConceptSchema).length(3) });

export const voicePreviewSchema = z.object({
  voiceId: z.string().uuid(),
  text: z.string().trim().min(1).max(900),
  language: z.enum(["en", "es"]),
});

export const voiceRegistrationSchema = z.object({
  brandId: z.string().uuid(),
  providerVoiceId: z.string().trim().min(3).max(160),
  languageCodes: z.array(z.enum(["en", "es"])).min(1).max(2),
  rightsReference: z.string().trim().max(500).default(""),
  modelId: z.string().trim().min(3).max(160),
});

export const studioPreferenceSchema = z.object({
  brandId: z.string().uuid(),
  voiceId: z.string().uuid(),
  modelId: z.string().trim().min(3).max(160),
});

export const schedulePublicationSchema = z.object({
  campaignId: z.string().uuid(),
  platformAccountId: z.string().uuid(),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2200).default(""),
  scheduledFor: z.string().datetime({ offset: true }),
  timezone: z.string().trim().min(1).max(80),
  explicitApproval: z.literal(true),
});

export type HookBrief = z.infer<typeof hookBriefSchema>;
export type HookConcept = z.infer<typeof hookConceptSchema>;

export function canApprovePublication(role: string) {
  return role === "owner" || role === "admin" || role === "reviewer";
}

export function isFutureSchedule(isoDate: string, now = Date.now()) {
  const value = Date.parse(isoDate);
  return Number.isFinite(value) && value >= now + 60_000;
}

export function studioHookJsonSchema() {
  const beat = {
    type: "object",
    additionalProperties: false,
    required: ["timing", "visual", "spoken", "onScreenText"],
    properties: {
      timing: { type: "string", enum: ["0-3s", "3-7s", "7-12s"] },
      visual: { type: "string" },
      spoken: { type: "string" },
      onScreenText: { type: "string" },
    },
  } as const;
  return {
    type: "object",
    additionalProperties: false,
    required: ["concepts"],
    properties: {
      concepts: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["conceptName", "openingHook", "openingBeats", "mainScript", "alternativeCta", "deliveryNotes", "sourceClaims"],
          properties: {
            conceptName: { type: "string" },
            openingHook: { type: "string" },
            openingBeats: { type: "array", minItems: 3, maxItems: 3, items: beat },
            mainScript: { type: "string" },
            alternativeCta: { type: "string" },
            deliveryNotes: { type: "string" },
            sourceClaims: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["claim", "sourceStatus"],
                properties: { claim: { type: "string" }, sourceStatus: { type: "string", enum: ["provided", "source_required"] } },
              },
            },
          },
        },
      },
    },
  } as const;
}

export function readResponsesText(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const response = payload as { output_text?: unknown; output?: unknown };
  if (typeof response.output_text === "string") return response.output_text;
  if (!Array.isArray(response.output)) return null;
  for (const item of response.output) {
    if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) continue;
    for (const content of item.content) {
      if (content && typeof content === "object" && "text" in content && typeof content.text === "string") return content.text;
    }
  }
  return null;
}
