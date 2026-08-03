"use client";

import Link from "next/link";
import { useState } from "react";

export function ContactForm({ locale }: { locale: "en" | "es" }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [startedAt, setStartedAt] = useState(0);
  const es = locale === "es";

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
        }),
      });
      setState(response.ok ? "success" : "error");
      if (response.ok) formElement.reset();
    } catch {
      setState("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  if (state === "success") {
    return <div className="form-success" role="status"><span>✓</span><h2>{es ? "Gracias. Ya tenemos el contexto." : "Thank you. We have the context."}</h2><p>{es ? "Te responderemos personalmente. Si es urgente, también puedes escribir a hello@viste.ai." : "We will respond personally. If it is time-sensitive, you can also email hello@viste.ai."}</p></div>;
  }

  return <form className="contact-form" aria-busy={state === "sending"} onFocusCapture={() => { if (!startedAt) setStartedAt(Date.now()); }} onSubmit={submit}><div className="form-grid"><label>{es ? "Nombre" : "Name"}<input name="name" required minLength={2} autoComplete="name" /></label><label>{es ? "Email profesional" : "Work email"}<input name="email" type="email" required autoComplete="email" /></label><label>{es ? "Empresa" : "Company"}<input name="company" required autoComplete="organization" /></label><label>{es ? "Cargo" : "Role"}<input name="role" autoComplete="organization-title" /></label><label>{es ? "País / región" : "Country / region"}<input name="country" autoComplete="country-name" /></label><label>{es ? "Teléfono (opcional)" : "Phone (optional)"}<input name="phone" type="tel" autoComplete="tel" /></label></div><label>{es ? "¿Dónde se atasca el trabajo y qué resultado buscas?" : "Where does the work get stuck, and what outcome matters?"}<textarea name="challenge" required minLength={30} rows={7} /></label><div className="form-grid"><label>{es ? "Presupuesto orientativo" : "Indicative budget"}<select name="budget" required defaultValue=""><option value="" disabled>{es ? "Seleccionar" : "Select"}</option><option value="exploring">{es ? "Explorando" : "Exploring"}</option><option value="under-10k">€ / $ &lt;10k</option><option value="10k-30k">€ / $ 10–30k</option><option value="30k-75k">€ / $ 30–75k</option><option value="75k-plus">€ / $ 75k+</option><option value="undisclosed">{es ? "Prefiero hablarlo" : "Prefer to discuss"}</option></select></label><label>{es ? "Plazo" : "Timeline"}<select name="timeline" required defaultValue=""><option value="" disabled>{es ? "Seleccionar" : "Select"}</option><option value="now">{es ? "Ahora / 30 días" : "Now / 30 days"}</option><option value="quarter">{es ? "Este trimestre" : "This quarter"}</option><option value="six-months">{es ? "3–6 meses" : "3–6 months"}</option><option value="planning">{es ? "Planificación" : "Planning"}</option></select></label></div><label className="consent"><input type="checkbox" name="consent" required /><span>{es ? <>Acepto que Viste.ai use estos datos para responder a mi consulta según el <Link href="/es/privacidad">aviso de privacidad</Link>.</> : <>I agree that Viste.ai may use this information to respond under the <Link href="/privacy">privacy notice</Link>.</>}</span></label><label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>{state === "error" ? <p className="form-error" role="alert">{es ? "No se pudo enviar. Escríbenos a hello@viste.ai." : "We could not send this. Please email hello@viste.ai."}</p> : null}<button className="button" disabled={state === "sending"}>{state === "sending" ? (es ? "Enviando…" : "Sending…") : (es ? "Enviar contexto" : "Send the context")}</button><p className="fine">{es ? "No envíes contraseñas ni datos confidenciales." : "Do not include passwords or confidential client data."}</p></form>;
}
