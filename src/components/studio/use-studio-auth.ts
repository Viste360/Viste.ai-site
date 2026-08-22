"use client";

import { createClient, type Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { STUDIO_OWNER_EMAIL, studioUserIsOwner } from "@/lib/studio-auth";

export function useStudioAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const configured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes("example.supabase.co") && !supabaseKey.includes("example"));
  const supabase = useMemo(() => configured ? createClient(supabaseUrl, supabaseKey) : null, [configured, supabaseKey, supabaseUrl]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [supabase]);

  async function signInWithGoogle(returnPath?: string) {
    if (!supabase) return "Studio authentication is not configured.";
    const isSpanish = window.location.pathname.startsWith("/es/");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${returnPath || (isSpanish ? "/es/app" : "/app")}`,
        scopes: "openid email profile",
        queryParams: {
          hd: "viste.ai",
          login_hint: STUDIO_OWNER_EMAIL,
          prompt: "select_account",
        },
      },
    });
    return error?.message || null;
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return { configured, loading, session, supabase, authorised: studioUserIsOwner(session?.user), ownerEmail: STUDIO_OWNER_EMAIL, signInWithGoogle, signOut };
}
