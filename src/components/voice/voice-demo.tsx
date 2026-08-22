"use client";

import { ConversationProvider, useConversationControls, useConversationStatus } from "@elevenlabs/react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { publicConfig } from "@/lib/public-config";
import { demoConsentVersion } from "@/lib/voice/demo";
import { TurnstileWidget } from "../turnstile-widget";
import styles from "./voice.module.css";

type Locale = "en" | "es";

const copy = {
  en: {
    ready: "Ready when you are",
    disconnected: "Vera is ready",
    connecting: "Connecting securely…",
    connected: "Vera is listening",
    error: "Vera could not connect",
    start: "Start talking to Vera",
    end: "End conversation",
    mic: "Your browser will ask for microphone permission. Vera identifies herself as AI before the conversation begins.",
    unavailable: "The live voice preview is being connected in this Preview environment.",
    callbackTitle: "Let Vera call you",
    callbackIntro: "Request one short, personalised AI demonstration. No cold-call list, no surprise follow-up.",
    business: "Business name",
    website: "Business website",
    firstName: "First name",
    phone: "Telephone number",
    language: "Demo language",
    consent: <>I request this demonstration call from Vera, VISTE’s AI assistant, and agree that VISTE may use these details to provide it under the <Link href="/privacy">privacy notice</Link>.</>,
    submit: "Call me with the demo",
    sending: "Preparing your call…",
    queued: "Your requested demo is saved. Vera will call when the approved line is available.",
    calling: "Vera is calling now. Look for the incoming call and say hello.",
    reference: "Request reference",
    errorForm: "We couldn’t arrange the demo. Check the details or email hello@viste.ai.",
    antiSpam: "Protected demo",
  },
  es: {
    ready: "Cuando quieras",
    disconnected: "Vera está preparada",
    connecting: "Conectando de forma segura…",
    connected: "Vera te escucha",
    error: "Vera no pudo conectarse",
    start: "Hablar con Vera",
    end: "Finalizar conversación",
    mic: "Tu navegador pedirá permiso para usar el micrófono. Vera se identifica como IA antes de empezar la conversación.",
    unavailable: "La prueba de voz en directo se está conectando en este entorno de Preview.",
    callbackTitle: "Deja que Vera te llame",
    callbackIntro: "Solicita una demostración breve y personalizada. Sin listas de llamadas en frío ni seguimientos sorpresa.",
    business: "Nombre del negocio",
    website: "Web del negocio",
    firstName: "Nombre",
    phone: "Número de teléfono",
    language: "Idioma de la demostración",
    consent: <>Solicito esta llamada de demostración de Vera, la asistente de IA de VISTE, y acepto que VISTE use estos datos para realizarla según el <Link href="/es/privacidad">aviso de privacidad</Link>.</>,
    submit: "Quiero que Vera me llame",
    sending: "Preparando tu llamada…",
    queued: "Tu demostración solicitada está guardada. Vera llamará cuando la línea aprobada esté disponible.",
    calling: "Vera te está llamando. Busca la llamada entrante y saluda.",
    reference: "Referencia de solicitud",
    errorForm: "No pudimos organizar la demostración. Revisa los datos o escribe a hello@viste.ai.",
    antiSpam: "Demostración protegida",
  },
} as const;

function VeraControls({ locale, enabled }: { locale: Locale; enabled: boolean }) {
  const text = copy[locale];
  const { startSession, endSession } = useConversationControls();
  const { status, message } = useConversationStatus();
  const [turnstileToken, setTurnstileToken] = useState("");
  const [requestError, setRequestError] = useState("");

  async function start() {
    setRequestError("");
    try {
      const response = await fetch("/api/voice/demo/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, turnstileToken }),
      });
      const result = await response.json().catch(() => null) as { conversationToken?: string; error?: string } | null;
      if (!response.ok || !result?.conversationToken) throw new Error(result?.error || text.error);
      startSession({ conversationToken: result.conversationToken, connectionType: "webrtc" });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : text.error);
    }
  }

  const statusCopy = status === "connected" ? text.connected : status === "connecting" ? text.connecting : status === "error" ? text.error : text.disconnected;
  return <div className={styles.voiceConsole}>
    <div className={styles.orb} data-live={status === "connected"} aria-hidden="true"><span /><i /><b /></div>
    <p className={styles.status}><span data-live={status === "connected"} />{statusCopy}</p>
    <h3>{text.ready}</h3>
    <p>{enabled ? text.mic : text.unavailable}</p>
    {enabled && status === "disconnected" ? <TurnstileWidget siteKey={publicConfig.turnstileSiteKey} locale={locale} action="viste_voice_session" onToken={setTurnstileToken} /> : null}
    {status === "connected" || status === "connecting"
      ? <button className={styles.secondaryButton} type="button" onClick={endSession}>{text.end}</button>
      : <button className={styles.primaryButton} type="button" onClick={start} disabled={!enabled}>{text.start}<span aria-hidden="true">↗</span></button>}
    {requestError || message ? <p className={styles.error} role="alert">{requestError || message}</p> : null}
  </div>;
}

export function VeraVoiceDemo({ locale, enabled }: { locale: Locale; enabled: boolean }) {
  return <ConversationProvider><VeraControls locale={locale} enabled={enabled} /></ConversationProvider>;
}

export function VoiceCallbackForm({ locale, enabled }: { locale: Locale; enabled: boolean }) {
  const text = copy[locale];
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [result, setResult] = useState<{ reference: string; status: string } | null>(null);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const startedAt = useRef(0);
  const onToken = useCallback((token: string) => setTurnstileToken(token), []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setState("sending");
    setError("");
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/voice/demo/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          consent: values.consent === "on",
          consentVersion: demoConsentVersion,
          locale,
          turnstileToken,
          startedAt: startedAt.current || Date.now() - 3_000,
        }),
      });
      const body = await response.json().catch(() => null) as { reference?: string; status?: string; error?: string } | null;
      if (!response.ok || !body?.reference || !body.status) throw new Error(body?.error || text.errorForm);
      setResult({ reference: body.reference, status: body.status });
      setState("success");
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text.errorForm);
      setState("error");
    }
  }

  if (state === "success" && result) return <div className={styles.callbackSuccess} role="status">
    <span aria-hidden="true">✓</span>
    <h3>{result.status === "calling" ? text.calling : text.queued}</h3>
    <p>{text.reference}: {result.reference.slice(0, 8)}</p>
  </div>;

  return <form className={styles.callbackForm} onFocusCapture={() => { if (!startedAt.current) startedAt.current = Date.now(); }} onSubmit={submit} aria-busy={state === "sending"}>
    <div className={styles.formHeading}><div><span>{text.antiSpam}</span><h3>{text.callbackTitle}</h3></div><p>{text.callbackIntro}</p></div>
    <div className={styles.formGrid}>
      <label>{text.business}<input name="businessName" required minLength={2} autoComplete="organization" /></label>
      <label>{text.website}<input name="websiteUrl" type="url" required placeholder="https://" autoComplete="url" /></label>
      <label>{text.firstName}<input name="firstName" required minLength={2} autoComplete="given-name" /></label>
      <label>{text.phone}<input name="phoneE164" type="tel" required placeholder="+34 600 000 000" autoComplete="tel" /></label>
      <label>{text.language}<select name="preferredLanguage" defaultValue={locale}><option value="es">Español</option><option value="en">English</option></select></label>
    </div>
    <TurnstileWidget siteKey={publicConfig.turnstileSiteKey} locale={locale} action="viste_voice_callback" onToken={onToken} />
    <label className={styles.consent}><input name="consent" type="checkbox" required /><span>{text.consent}</span></label>
    <label className={styles.honeypot} aria-hidden="true">Fax<input name="faxNumber" tabIndex={-1} autoComplete="off" /></label>
    {error ? <p className={styles.error} role="alert">{error}</p> : null}
    <button className={styles.primaryButton} type="submit" disabled={!enabled || state === "sending"}>{state === "sending" ? text.sending : text.submit}<span aria-hidden="true">↗</span></button>
  </form>;
}
