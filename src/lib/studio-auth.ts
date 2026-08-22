export const STUDIO_OWNER_EMAIL = "yon.wallace@viste.ai";

type StudioIdentity = {
  email?: string | null;
  app_metadata?: {
    provider?: unknown;
    providers?: unknown;
  };
};

export function studioUserIsOwner(user: StudioIdentity | null | undefined) {
  if (user?.email?.trim().toLowerCase() !== STUDIO_OWNER_EMAIL) return false;
  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers.filter((provider): provider is string => typeof provider === "string")
    : [];
  return user.app_metadata?.provider === "google" || providers.includes("google");
}
