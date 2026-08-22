"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { StudioLocale } from "./studio-content";
import { StudioMark } from "./studio-mark";
import { useStudioAuth } from "./use-studio-auth";
import styles from "./studio.module.css";

const copy = {
  en: {
    eyebrow: "Private workspace",
    title: "Your Studio. Your access only.",
    lead: "Sign in with your Viste Google account to create campaigns, upload content and manage publishing.",
    action: "Continue with Google",
    loading: "Checking your secure session…",
    allowed: "Only yon.wallace@viste.ai is authorised.",
    wrong: "That Google account is not authorised for this Studio.",
    retry: "Choose another Google account",
    missing: "Studio sign-in is being configured. Please try again shortly.",
    privacy: "Private by default · no public registration",
  },
  es: {
    eyebrow: "Espacio privado",
    title: "Tu Studio. Solo tu acceso.",
    lead: "Accede con tu cuenta de Google de Viste para crear campañas, subir contenido y gestionar publicaciones.",
    action: "Continuar con Google",
    loading: "Comprobando tu sesión segura…",
    allowed: "Solo yon.wallace@viste.ai tiene autorización.",
    wrong: "Esa cuenta de Google no tiene autorización para este Studio.",
    retry: "Elegir otra cuenta de Google",
    missing: "Estamos configurando el acceso a Studio. Inténtalo de nuevo en unos minutos.",
    privacy: "Privado por defecto · sin registro público",
  },
} as const;

export function StudioAuthGate({ locale, children }: { locale: StudioLocale; children: ReactNode }) {
  const c = copy[locale];
  const { configured, loading, session, authorised, signInWithGoogle, signOut } = useStudioAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function beginGoogleSignIn() {
    setBusy(true);
    setMessage("");
    const error = await signInWithGoogle();
    if (error) { setMessage(error); setBusy(false); }
  }

  if (loading) return <main className={styles.authGate}><div className={styles.authCard}><StudioMark /><p className={styles.authLoading}>{c.loading}</p></div></main>;
  if (session && authorised) return children;

  return <main className={styles.authGate}>
    <section className={styles.authCard} aria-labelledby="studio-private-heading">
      <div className={styles.authBrand}><StudioMark /><span>{c.privacy}</span></div>
      <p className={styles.authEyebrow}>{c.eyebrow}</p>
      <h1 id="studio-private-heading">{c.title}</h1>
      <p className={styles.authLead}>{c.lead}</p>
      <div className={styles.authOwner}><span>G</span><div><strong>{c.allowed}</strong><small>Google OAuth · email + basic profile only</small></div></div>
      {!configured ? <p className={styles.authMessage}>{c.missing}</p> : session ? <>
        <p className={styles.authMessage}>{c.wrong}</p>
        <button className={styles.googleButton} type="button" onClick={() => void signOut()}>{c.retry}</button>
      </> : <button className={styles.googleButton} type="button" disabled={busy} onClick={() => void beginGoogleSignIn()}><span>G</span>{busy ? c.loading : c.action}</button>}
      {message ? <p className={styles.authMessage} role="status">{message}</p> : null}
    </section>
  </main>;
}
