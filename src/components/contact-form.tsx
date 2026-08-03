"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useRef, useState } from "react";

type Success = { reference: string; qualified: boolean; bookingUrl?: string };

export function ContactForm({ locale }: { locale: "en" | "es" }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [success, setSuccess] = useState<Success | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const trackedStart = useRef(false);
  const es = locale === "es";

  function startForm() {
    if (!startedAt) setStartedAt(Date.now());
    if (!trackedStart.current) {
      trackedStart.current = true;
      track("Contact Form Started", { locale });
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    const query = new URLSearchParams(location.search);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-contact-request-id": crypto.randomUUID(),
        },
        signal: controller.signal,
        body: JSON.stringify({
          ...payload,
          consent: payload.consent === "on",
          startedAt: startedAt || Date.now() - 3_000,
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
      if (!response.ok) {
        setState("error");
        return;
      }
      const result = await response.json() as Success;
      setSuccess(result);
      setState("success");
      formElement.reset();
      track("Contact Form Submitted", { locale, qualified: result.qualified });
    } catch {
      setState("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  if (state === "success" && success) {
    return <div className="form-success" role="status" aria-live="polite">
      <span>✓</span>
      <p className="eyebrow">{es ? `Referencia ${success.reference.slice(0, 8)}` : `Reference ${success.reference.slice(0, 8)}`}</p>
      <h2>{es ? "Gracias. Tu consulta se ha enviado de forma segura." : "Thank you. Your enquiry was delivered securely."}</h2>
      <p>{success.qualified
        ? (es ? "El contexto encaja con una conversación de alcance. Puedes reservar el siguiente paso ahora." : "Your context fits a scoping conversation. You can book the next step now.")
        : (es ? "Una persona senior revisará el contexto y responderá con el siguiente paso más útil." : "A senior practitioner will review the context and respond with the most useful next step.")}</p>
      {success.qualified && success.bookingUrl
        ? <a className="button" href={success.bookingUrl} target="_blank" rel="noreferrer" onClick={() => track("Qualified Booking Opened", { locale })}>{es ? "Reservar conversación" : "Book the conversation"}</a>
        : <a className="button button-ghost" href="mailto:hello@viste.ai">{es ? "Añadir contexto por email" : "Add context by email"}</a>}
    </div>;
  }

  return <form className="contact-form" aria-busy={state === "sending"} onFocusCapture={startForm} onSubmit={submit}>
    <div className="form-grid">
      <label>{es ? "Nombre" : "Name"}<input name="name" required minLength={2} autoComplete="name" /></label>
      <label>{es ? "Email profesional" : "Work email"}<input name="email" type="email" required autoComplete="email" /></label>
      <label>{es ? "Empresa" : "Company"}<input name="company" required autoComplete="organization" /></label>
      <label>{es ? "Cargo" : "Role"}<input name="role" required minLength={2} autoComplete="organization-title" /></label>
      <label>{es ? "Web de la empresa" : "Company website"}<input name="companyWebsite" type="url" inputMode="url" placeholder="https://" required autoComplete="url" /></label>
      <label>{es ? "País / región" : "Country / region"}<input name="country" required minLength={2} autoComplete="country-name" /></label>
      <label>{es ? "Idioma preferido" : "Preferred language"}<select name="preferredLanguage" required defaultValue={locale}><option value="en">English</option><option value="es">Español</option><option value="other">{es ? "Otro" : "Other"}</option></select></label>
      <label>{es ? "Plazo" : "Timeline"}<select name="timeline" required defaultValue=""><option value="" disabled>{es ? "Seleccionar" : "Select"}</option><option value="now">{es ? "Ahora / 30 días" : "Now / 30 days"}</option><option value="quarter">{es ? "Este trimestre" : "This quarter"}</option><option value="six-months">{es ? "3–6 meses" : "3–6 months"}</option><option value="planning">{es ? "Planificación" : "Planning"}</option></select></label>
    </div>
    <label>{es ? "¿Qué flujo de trabajo quieres mejorar?" : "Which workflow should work better?"}<textarea name="workflow" required minLength={30} maxLength={2500} rows={5} /></label>
    <label>{es ? "¿Qué sistemas y canales intervienen?" : "Which systems and channels are involved?"}<textarea name="systems" required minLength={2} maxLength={1500} rows={4} placeholder={es ? "CRM, ERP, WhatsApp, email, hojas de cálculo…" : "CRM, ERP, WhatsApp, email, spreadsheets…"} /></label>
    <label>{es ? "¿Qué resultado debe cambiar?" : "What outcome needs to change?"}<textarea name="desiredOutcome" required minLength={20} maxLength={2000} rows={4} /></label>
    <div className="form-grid">
      <label>{es ? "Presupuesto orientativo" : "Indicative budget"}<select name="budget" required defaultValue=""><option value="" disabled>{es ? "Seleccionar" : "Select"}</option><option value="exploring">{es ? "Explorando" : "Exploring"}</option><option value="under-10k">€ / $ &lt;10k</option><option value="10k-30k">€ / $ 10–30k</option><option value="30k-75k">€ / $ 30–75k</option><option value="75k-plus">€ / $ 75k+</option><option value="undisclosed">{es ? "Prefiero hablarlo" : "Prefer to discuss"}</option></select></label>
    </div>
    <label className="consent"><input type="checkbox" name="consent" required /><span>{es ? <>Acepto que Viste.ai use estos datos para responder y cualificar mi consulta según el <Link href="/es/privacidad">aviso de privacidad</Link>.</> : <>I agree that Viste.ai may use this information to respond to and qualify my enquiry under the <Link href="/privacy">privacy notice</Link>.</>}</span></label>
    <label className="honeypot" aria-hidden="true">Fax number<input name="faxNumber" tabIndex={-1} autoComplete="off" /></label>
    {state === "error" ? <p className="form-error" role="alert">{es ? "No pudimos entregar la consulta de forma segura. Inténtalo de nuevo o escribe a hello@viste.ai." : "We could not securely deliver the enquiry. Try again or email hello@viste.ai."}</p> : null}
    <button className="button" disabled={state === "sending"}>{state === "sending" ? (es ? "Enviando…" : "Sending…") : (es ? "Enviar consulta segura" : "Send secure enquiry")}</button>
    <p className="fine">{es ? "No envíes contraseñas, datos de pago ni información confidencial de clientes." : "Do not include passwords, payment data or confidential client information."}</p>
  </form>;
}
