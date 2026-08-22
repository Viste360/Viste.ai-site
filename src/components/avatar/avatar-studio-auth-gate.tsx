"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useStudioAuth } from "@/components/studio/use-studio-auth";
import styles from "./avatar-studio.module.css";

const copy = {
  en: {
    eyebrow: "Private creation workspace",
    title: "Build your avatar library.",
    lead: "Sign in with the authorised Viste Google account. Talent consent, source media and generated clips stay inside your private workspace.",
    action: "Continue with Google",
    loading: "Checking secure access…",
    owner: "Only yon.wallace@viste.ai is authorised.",
    wrong: "This Google account is not authorised.",
    retry: "Choose another Google account",
    missing: "Private sign-in is being configured.",
  },
  es: {
    eyebrow: "Espacio privado de creación",
    title: "Crea tu biblioteca de avatares.",
    lead: "Accede con la cuenta autorizada de Google de Viste. El consentimiento, los archivos fuente y los vídeos generados permanecen en tu espacio privado.",
    action: "Continuar con Google",
    loading: "Comprobando el acceso seguro…",
    owner: "Solo yon.wallace@viste.ai tiene autorización.",
    wrong: "Esta cuenta de Google no tiene autorización.",
    retry: "Elegir otra cuenta de Google",
    missing: "Estamos configurando el acceso privado.",
  },
} as const;

export function AvatarStudioAuthGate({ locale, children }: { locale: "en" | "es"; children: ReactNode }) {
  const t = copy[locale];
  const { configured, loading, session, authorised, signInWithGoogle, signOut } = useStudioAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (loading) return <main className={styles.authPage}><section className={styles.authCard}><span className={styles.authMark}>V</span><p>{t.loading}</p></section></main>;
  if (session && authorised) return children;

  async function signIn() {
    setBusy(true);
    setMessage("");
    const error = await signInWithGoogle(locale === "es" ? "/es/avatar/studio" : "/avatar/studio");
    if (error) { setMessage(error); setBusy(false); }
  }

  return <main className={styles.authPage}>
    <section className={styles.authCard} aria-labelledby="avatar-auth-title">
      <div className={styles.authBrand}><span className={styles.authMark}>V</span><span>VISTE / AVATAR STUDIO</span></div>
      <p className={styles.kicker}>{t.eyebrow}</p>
      <h1 id="avatar-auth-title">{t.title}</h1>
      <p className={styles.authLead}>{t.lead}</p>
      <div className={styles.ownerNotice}><b>G</b><span>{t.owner}<small>Google OAuth · no public registration</small></span></div>
      {!configured ? <p className={styles.formMessage}>{t.missing}</p> : session ? <>
        <p className={styles.formMessage}>{t.wrong}</p>
        <button type="button" className={styles.primaryButton} onClick={() => void signOut()}>{t.retry}</button>
      </> : <button type="button" className={styles.primaryButton} disabled={busy} onClick={() => void signIn()}>{busy ? t.loading : t.action}</button>}
      {message ? <p className={styles.formMessage} role="status">{message}</p> : null}
    </section>
  </main>;
}
