"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Locale = "en" | "es";
type Success = { reference: string };

const addOns = {
  en: [
    ["photography", "On-site photography visit"],
    ["booking", "Booking calendar connection"],
    ["qr", "QR reservation/contact pack"],
    ["profiles", "Google and social profile refresh"],
    ["meta-ads", "Instagram/Meta advertising campaign setup"],
    ["change-pack", "Defined website change pack"],
  ],
  es: [
    ["photography", "Visita de fotografía en el negocio"],
    ["booking", "Conexión de calendario de reservas"],
    ["qr", "Pack QR de reserva/contacto"],
    ["profiles", "Actualización de perfiles de Google y redes"],
    ["meta-ads", "Configuración de campaña en Instagram/Meta"],
    ["change-pack", "Pack definido de cambios web"],
  ],
} satisfies Record<Locale, [string, string][]>;

function requestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `website_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function LocalWebsiteForm({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [success, setSuccess] = useState<Success | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const startedAt = useRef(0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setErrorMessage("");
    if (!formElement.checkValidity()) {
      setState("idle");
      setErrorMessage(es ? "Revisa los campos marcados." : "Please review the highlighted fields.");
      formElement.reportValidity();
      formElement.querySelector<HTMLElement>(":invalid")?.focus();
      return;
    }

    const form = new FormData(formElement);
    const query = new URLSearchParams(location.search);
    const goal = String(form.get("desiredOutcome") || "");
    const onlinePresence = String(form.get("onlinePresence") || "");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    setState("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json", "x-contact-request-id": requestId() },
        signal: controller.signal,
        body: JSON.stringify({
          enquiryType: "website",
          name: form.get("name"),
          company: form.get("company"),
          email: form.get("email"),
          telephone: form.get("telephone"),
          onlinePresence,
          companyWebsite: "",
          preferredPackage: form.get("preferredPackage"),
          addOns: form.getAll("addOns"),
          desiredOutcome: goal,
          workflow: goal,
          systems: onlinePresence,
          marketingSource: form.get("marketingSource"),
          role: "",
          country: "",
          preferredLanguage: locale,
          budget: "exploring",
          timeline: "planning",
          consent: form.get("consent") === "on",
          faxNumber: form.get("faxNumber"),
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
      if (!response.ok || !result?.reference) throw new Error("delivery_failed");
      setSuccess(result);
      setState("success");
      trackEvent("lead_submitted", { locale, enquiryType: "website", package: String(form.get("preferredPackage")) });
      formElement.reset();
    } catch (error) {
      setErrorMessage(error instanceof DOMException && error.name === "AbortError"
        ? (es ? "La conexión tardó demasiado. Inténtalo de nuevo." : "The connection took too long. Please try again.")
        : (es ? "No pudimos entregar la consulta. Inténtalo de nuevo o escribe a hello@viste.ai." : "We couldn’t deliver your enquiry. Please try again or email hello@viste.ai."));
      setState("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }

  if (state === "success" && success) return <div className="form-success local-form-success" role="status" aria-live="polite">
    <span>✓</span><p className="eyebrow">{es ? `Referencia ${success.reference.slice(0, 8)}` : `Reference ${success.reference.slice(0, 8)}`}</p>
    <h2>{es ? "Gracias — hemos recibido tu consulta." : "Thank you — your enquiry has been received."}</h2>
    <p>{es ? "Un representante de Viste se pondrá en contacto contigo en breve." : "A Viste representative will get back to you shortly."}</p>
    <a className="button" href="https://wa.me/message/5IYX266Z5KPKK1" rel="noreferrer">{es ? "Continuar por WhatsApp" : "Continue on WhatsApp"}</a>
  </div>;

  return <form className="contact-form local-enquiry-form" id="website-enquiry" noValidate aria-busy={state === "sending"} onFocusCapture={() => { if (!startedAt.current) startedAt.current = Date.now(); }} onSubmit={submit}>
    <div className="local-form-heading"><p className="eyebrow">{es ? "Consulta Viste Local" : "Viste Local enquiry"}</p><h2>{es ? "Sí, me interesa." : "Yes, I’m interested."}</h2><p>{es ? "Cuéntanos lo esencial. No necesitas tener una web para enviar el formulario." : "Tell us the essentials. You do not need an existing website to submit."}</p></div>
    <div className="form-grid">
      <label>{es ? "Nombre de contacto" : "Contact name"}<input name="name" required minLength={2} autoComplete="name" /></label>
      <label>{es ? "Nombre del negocio" : "Business name"}<input name="company" required minLength={2} autoComplete="organization" /></label>
      <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      <label>{es ? "Teléfono / WhatsApp" : "Telephone / WhatsApp"}<input name="telephone" type="tel" required minLength={5} autoComplete="tel" /></label>
    </div>
    <label>{es ? "Web actual o enlaces de redes (si existen)" : "Existing website or social links (if any)"}<textarea name="onlinePresence" rows={3} maxLength={1200} placeholder={es ? "Déjalo vacío si todavía no tienes web o perfiles" : "Leave blank if you do not have a website or profiles yet"} /></label>
    <div className="form-grid">
      <label>{es ? "Paquete preferido" : "Preferred package"}<select name="preferredPackage" required defaultValue=""><option value="" disabled>{es ? "Seleccionar" : "Select"}</option><option value="local-start">Local Start — €490</option><option value="local-business">Local Business — {es ? "desde" : "from"} €950</option><option value="signature">Signature — {es ? "desde" : "from"} €1,500</option><option value="not-sure">{es ? "No estoy seguro todavía" : "Not sure yet"}</option></select></label>
      <label>{es ? "¿Cómo nos conociste?" : "How did you hear about us?"}<select name="marketingSource" defaultValue=""><option value="">{es ? "Prefiero no indicarlo" : "Prefer not to say"}</option><option value="google">Google</option><option value="instagram">Instagram</option><option value="referral">{es ? "Recomendación" : "Referral"}</option><option value="whatsapp">WhatsApp</option><option value="event">{es ? "Evento o networking" : "Event or networking"}</option><option value="other">{es ? "Otro" : "Other"}</option></select></label>
    </div>
    <fieldset className="addon-fieldset"><legend>{es ? "Extras que te interesan" : "Add-ons you’re interested in"}</legend><div className="addon-options">{addOns[locale].map(([value, label]) => <label key={value}><input type="checkbox" name="addOns" value={value} /><span>{label}</span></label>)}</div></fieldset>
    <label>{es ? "Objetivos del negocio o funciones que faltan" : "Business goals or missing features"}<textarea name="desiredOutcome" required minLength={20} maxLength={2500} rows={5} placeholder={es ? "Por ejemplo: explicar mejor los servicios, recibir reservas y facilitar el contacto por WhatsApp…" : "For example: explain our services clearly, receive bookings and make WhatsApp contact easier…"} /></label>
    <label className="consent"><input type="checkbox" name="consent" required /><span>{es ? <>Acepto que Viste.ai use estos datos para responder y cualificar mi consulta según el <Link href="/es/privacidad">aviso de privacidad</Link>.</> : <>I agree that Viste.ai may use this information to respond to and qualify my enquiry under the <Link href="/privacy">privacy notice</Link>.</>}</span></label>
    <label className="honeypot" aria-hidden="true">Fax number<input name="faxNumber" tabIndex={-1} autoComplete="off" /></label>
    {errorMessage ? <p className="form-error" role="alert">{errorMessage}</p> : null}
    <button className="button" type="submit" disabled={state === "sending"}>{state === "sending" ? (es ? "Enviando…" : "Sending…") : (es ? "Enviar — me interesa" : "Send — I’m interested")}</button>
    <p className="fine">{es ? "Consulta sin compromiso. No envíes contraseñas ni datos confidenciales de clientes." : "No-obligation enquiry. Do not send passwords or confidential customer data."}</p>
  </form>;
}
