"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Success = { reference: string; qualified: boolean; bookingUrl?: string };

function contactRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `contact_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function ContactForm({ locale }: { locale: "en" | "es" }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [success, setSuccess] = useState<Success | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const startedAt = useRef(0);
  const trackedStart = useRef(false);
  const es = locale === "es";

  function startForm() {
    if (!startedAt.current) startedAt.current = Date.now();
    if (!trackedStart.current) {
      trackedStart.current = true;
      trackEvent("lead_form_started", { locale });
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;

    setErrorMessage("");
    if (!formElement.checkValidity()) {
      setState("idle");
      setErrorMessage(es
        ? "Revisa los campos marcados. Te llevaremos al primero que necesita atención."
        : "Please review the highlighted fields. We’ll take you to the first one that needs attention.");
      formElement.reportValidity();
      formElement.querySelector<HTMLElement>(":invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setState("sending");
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const query = new URLSearchParams(location.search);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25_000);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-contact-request-id": contactRequestId(),
        },
        signal: controller.signal,
        body: JSON.stringify({
          ...payload,
          consent: payload.consent === "on",
          startedAt: startedAt.current || Date.now() - 3_000,
          locale,
          sourceUrl: location.href,
          referrer: document.referrer,
          utmSource: query.get("utm_source") || "",
          utmMedium: query.get("utm_medium") || "",
          utmCampaign: query.get("utm_campaign") || "",
          utmTerm: query.get("utm_term") || "",
          utmContent: query.get("utm_content") || "",
        }),
      });
      const result = await response.json().catch(() => null) as Success | null;
      if (!response.ok || !result || typeof result.reference !== "string") {
        setErrorMessage(es
          ? "No pudimos entregar la consulta. Inténtalo de nuevo o escribe a hello@viste.ai."
          : "We couldn’t deliver your enquiry. Please try again or email hello@viste.ai.");
        setState("error");
        return;
      }
      setSuccess(result);
      setState("success");
      formElement.reset();
      trackEvent("lead_submitted", { locale, qualified: result.qualified });
    } catch (error) {
      setErrorMessage(error instanceof DOMException && error.name === "AbortError"
        ? (es ? "La conexión tardó demasiado. Inténtalo de nuevo; tus datos no se han duplicado." : "The connection took too long. Please try again; your details have not been duplicated.")
        : (es ? "No pudimos entregar la consulta. Inténtalo de nuevo o escribe a hello@viste.ai." : "We couldn’t deliver your enquiry. Please try again or email hello@viste.ai."));
      setState("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  if (state === "success" && success) {
    return <div className="form-success" role="status" aria-live="polite">
      <span>✓</span>
      <p className="eyebrow">{es ? `Referencia ${success.reference.slice(0, 8)}` : `Reference ${success.reference.slice(0, 8)}`}</p>
      <h2>{es ? "Gracias — hemos recibido tu consulta." : "Thank you — we’ve received your enquiry."}</h2>
      <p>{es ? "La revisaremos y te responderemos en breve." : "We’ll review it and get back to you shortly."}</p>
      {success.qualified ? <p>{es ? "También puedes reservar directamente una conversación de alcance." : "You can also book a scoping conversation directly."}</p> : null}
      {success.qualified && success.bookingUrl
        ? <a className="button" href={success.bookingUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("content_cta_clicked", { locale, source: "qualified_form", destination: "booking_calendar" })}>{es ? "Reservar conversación" : "Book the conversation"}</a>
        : <a className="button button-ghost" href="mailto:hello@viste.ai">{es ? "Añadir contexto por email" : "Add context by email"}</a>}
    </div>;
  }

  return <form className="contact-form" id="contact-form" aria-busy={state === "sending"} noValidate onFocusCapture={startForm} onSubmit={submit}>
    <div className="form-grid">
      <label>{es ? "Nombre" : "Name"}<input name="name" required minLength={2} autoComplete="name" /></label>
      <label>{es ? "Email profesional" : "Work email"}<input name="email" type="email" required autoComplete="email" /></label>
      <label>{es ? "Empresa" : "Company"}<input name="company" required autoComplete="organization" /></label>
      <label>{es ? "Cargo" : "Role"}<input name="role" required minLength={2} autoComplete="organization-title" /></label>
      <label>{es ? "Web actual (si existe)" : "Current website (if any)"}<input name="companyWebsite" type="url" inputMode="url" placeholder="https://" autoComplete="url" /></label>
      <label>{es ? "País / región" : "Country / region"}<input name="country" required minLength={2} autoComplete="country-name" /></label>
      <label>{es ? "Idioma preferido" : "Preferred language"}<select name="preferredLanguage" required defaultValue={locale}><option value="en">English</option><option value="es">Español</option><option value="other">{es ? "Otro" : "Other"}</option></select></label>
      <label>{es ? "Plazo" : "Timeline"}<select name="timeline" required defaultValue=""><option value="" disabled>{es ? "Seleccionar" : "Select"}</option><option value="now">{es ? "Ahora / 30 días" : "Now / 30 days"}</option><option value="quarter">{es ? "Este trimestre" : "This quarter"}</option><option value="six-months">{es ? "3–6 meses" : "3–6 months"}</option><option value="planning">{es ? "Planificación" : "Planning"}</option></select></label>
    </div>
    <label>{es ? "¿Qué quieres que construyamos o mejoremos?" : "What would you like us to build or improve?"}<textarea name="workflow" required minLength={30} maxLength={2500} rows={5} placeholder={es ? "Por ejemplo: una nueva web con un área privada para clientes…" : "For example: a new website with a private client area…"} /></label>
    <label>{es ? "¿Qué sistemas o canales intervienen? (si los conoces)" : "Which systems or channels are involved? (if known)"}<textarea name="systems" maxLength={1500} rows={4} placeholder={es ? "CRM, pagos, WhatsApp, email, hojas de cálculo…" : "CRM, payments, WhatsApp, email, spreadsheets…"} /></label>
    <label>{es ? "¿Qué resultado debe cambiar?" : "What outcome needs to change?"}<textarea name="desiredOutcome" required minLength={20} maxLength={2000} rows={4} /></label>
    <div className="form-grid">
      <label>{es ? "Presupuesto orientativo" : "Indicative budget"}<select name="budget" required defaultValue=""><option value="" disabled>{es ? "Seleccionar" : "Select"}</option><option value="exploring">{es ? "Explorando" : "Exploring"}</option><option value="under-10k">€ / $ &lt;10k</option><option value="10k-30k">€ / $ 10–30k</option><option value="30k-75k">€ / $ 30–75k</option><option value="75k-plus">€ / $ 75k+</option><option value="undisclosed">{es ? "Prefiero hablarlo" : "Prefer to discuss"}</option></select></label>
    </div>
    <label className="consent"><input type="checkbox" name="consent" required /><span>{es ? <>Acepto que Viste.ai use estos datos para responder y cualificar mi consulta según el <Link href="/es/privacidad">aviso de privacidad</Link>.</> : <>I agree that Viste.ai may use this information to respond to and qualify my enquiry under the <Link href="/privacy">privacy notice</Link>.</>}</span></label>
    <label className="honeypot" aria-hidden="true">Fax number<input name="faxNumber" tabIndex={-1} autoComplete="off" /></label>
    {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
    <button className="button" type="submit" disabled={state === "sending"}>{state === "sending" ? (es ? "Enviando de forma segura…" : "Sending securely…") : (es ? "Enviar consulta segura" : "Send secure enquiry")}</button>
    {state === "sending" ? <p className="form-status" role="status" aria-live="polite">{es ? "Guardando tu consulta y notificando al equipo…" : "Saving your enquiry and notifying the team…"}</p> : null}
    <p className="fine">{es ? "No envíes contraseñas, datos de pago ni información confidencial de clientes." : "Do not include passwords, payment data or confidential client information."}</p>
  </form>;
}
