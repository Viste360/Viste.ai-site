"use client";

import { trackEvent } from "@/lib/analytics";

export function BookingCta({
  locale,
  bookingUrl,
  source,
  fallbackHref,
  compact = false,
}: {
  locale: "en" | "es";
  bookingUrl?: string;
  source: string;
  fallbackHref: string;
  compact?: boolean;
}) {
  const es = locale === "es";
  const href = bookingUrl || fallbackHref;
  const external = Boolean(bookingUrl);

  return <aside className={`booking-cta${compact ? " booking-cta-compact" : ""}`}>
    <div className="booking-icon" aria-hidden="true"><span>12</span></div>
    <div>
      <p className="eyebrow">{es ? "Sesión de descubrimiento" : "Discovery session"}</p>
      <h2>{es ? "Elige un siguiente paso concreto." : "Choose a concrete next step."}</h2>
      <p>{external
        ? (es ? "Consulta la disponibilidad y reserva una conversación en el calendario." : "See live availability and book a conversation in the calendar.")
        : (es ? "Comparte primero el contexto y te propondremos la sesión adecuada." : "Share the context first and we’ll propose the right session.")}</p>
    </div>
    <a
      className="button"
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      onClick={() => trackEvent("content_cta_clicked", { locale, source, destination: external ? "booking_calendar" : "contact_form" })}
    >{external ? (es ? "Ver calendario" : "View calendar") : (es ? "Solicitar una sesión" : "Request a session")}</a>
  </aside>;
}
