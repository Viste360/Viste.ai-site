import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { z } from "zod";
import { studioUserIsOwner } from "./studio-auth";

export const STUDIO_ASSET_BUCKET = "studio-assets";
export const MAX_STUDIO_ASSET_BYTES = 500 * 1024 * 1024;

const allowedMimePrefixes = ["image/", "video/", "audio/"];
const allowedDocumentTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
]);

export const assetUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(240),
  size: z.number().int().positive().max(MAX_STUDIO_ASSET_BYTES),
  contentType: z.string().trim().min(1).max(160),
  brandId: z.string().uuid().nullable().optional(),
  assetType: z.enum(["logo", "image", "video", "audio", "document", "template", "export"]),
  source: z.string().trim().min(2).max(160),
  licence: z.string().trim().min(2).max(220),
  permittedUse: z.string().trim().min(2).max(500),
  aiGenerated: z.boolean().default(false),
});

export const completeUploadSchema = z.object({ assetId: z.string().uuid() });

export function isAllowedStudioMime(contentType: string) {
  return allowedMimePrefixes.some((prefix) => contentType.startsWith(prefix)) || allowedDocumentTypes.has(contentType);
}

export function safeStudioFileName(fileName: string) {
  const normalised = fileName.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^[-.]+|[-.]+$/g, "");
  return (normalised || "asset").slice(0, 160);
}

export function studioAssetKind(contentType: string) {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  return "document";
}

export type StudioAuthorisation = {
  admin: SupabaseClient;
  user: User;
  tenantId: string;
  role: string;
};

export function studioAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret || url.includes("example.supabase.co") || secret.includes("example")) return null;
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function authoriseStudioRequest(request: NextRequest): Promise<StudioAuthorisation | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const admin = studioAdmin();
  if (!token || !admin) return null;

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user || !studioUserIsOwner(userData.user)) return null;
  const { data: membership, error: membershipError } = await admin
    .from("memberships")
    .select("tenant_id, role")
    .eq("user_id", userData.user.id)
    .limit(1)
    .maybeSingle();
  if (membershipError || !membership) return null;
  return { admin, user: userData.user, tenantId: membership.tenant_id, role: membership.role };
}
