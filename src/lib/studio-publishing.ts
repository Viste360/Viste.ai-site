import type { SupabaseClient } from "@supabase/supabase-js";
import { studioPlatforms } from "./studio-campaigns";

export type StudioPlatform = (typeof studioPlatforms)[number];
export type DuePublication = {
  id: string;
  tenant_id: string;
  platform: StudioPlatform;
  platform_account_id: string;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
};

export type PublishingAdapter = {
  publish(publication: DuePublication): Promise<{ externalPublicationId: string }>;
};

// Adapters are registered only after the business-owned platform account,
// permission scopes and secret storage have been reviewed for that channel.
const adapters: Partial<Record<StudioPlatform, PublishingAdapter>> = {};

export function publishingAdapterFor(platform: StudioPlatform) {
  return adapters[platform] ?? null;
}

export async function dispatchPublication(admin: SupabaseClient, publication: DuePublication) {
  const adapter = publishingAdapterFor(publication.platform);
  if (!adapter) return { status: "skipped" as const, reason: "adapter_not_configured" as const };
  const claim = await admin.from("publications").update({ status: "dispatching", updated_at: new Date().toISOString() }).eq("id", publication.id).eq("status", "scheduled").select("id").maybeSingle();
  if (claim.error || !claim.data) return { status: "skipped" as const, reason: "already_claimed" as const };
  try {
    const result = await adapter.publish(publication);
    await admin.from("publications").update({ status: "published", external_publication_id: result.externalPublicationId, published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", publication.id).eq("status", "dispatching");
    return { status: "published" as const };
  } catch {
    await admin.from("publications").update({ status: "failed", error_code: "provider_dispatch_failed", updated_at: new Date().toISOString() }).eq("id", publication.id).eq("status", "dispatching");
    return { status: "failed" as const };
  }
}
