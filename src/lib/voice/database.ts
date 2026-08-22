import { createClient } from "@supabase/supabase-js";

export function voiceAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secret || url.includes("example.supabase.co") || secret.includes("example")) return null;
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
