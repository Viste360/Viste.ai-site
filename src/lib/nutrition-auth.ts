import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

export type NutritionAuthorisation = {
  admin: SupabaseClient;
  scoped: SupabaseClient;
  user: User;
};

export function nutritionAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret || url.includes("example.supabase.co") || secret.includes("example")) return null;
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function authoriseNutritionRequest(request: NextRequest): Promise<NutritionAuthorisation | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const admin = nutritionAdmin();
  if (!token || !url || !publishable || !admin || url.includes("example.supabase.co") || publishable.includes("example")) return null;
  const scoped = createClient(url, publishable, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await scoped.auth.getUser(token);
  if (error || !data.user) return null;
  return { admin, scoped, user: data.user };
}
