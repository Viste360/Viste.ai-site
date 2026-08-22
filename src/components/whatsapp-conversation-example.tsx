import Link from "next/link";
import type { Locale } from "@/content/types";

const content = {
  en: {
    eyebrow: "A conversation becomes a controlled workflow",
    title: "Show the complicated request—not just the chatbot.",
    lead: "A useful WhatsApp system understands the request, checks the right operational sources and prepares a safe next action. A person remains responsible for exceptions and approval.",
    steps: [
      ["01", "Capture the full context", "Voice notes and messages become one structured request."],
      ["02", "Check systems and policy", "Availability, the CRM record and rate rules are consulted."],
      ["03", "Stop for human approval", "Nothing changes or reaches the customer until an owner reviews it."],
    ],
    cta: "Open the full WhatsApp control demo",
    note: "Illustrative scenario · no client data",
    phoneTitle: "Guest operations",
    phoneStatus: "WhatsApp Business workflow",
    customerLabel: "Incoming voice note · transcribed",
    customer: "A family paid for four nights in Málaga, but their flight moved. They now need Seville tomorrow, Málaga two days later, connecting rooms, the same agreed rate and an invoice split between business and personal costs. Can you check availability, protect the rate, update both bookings and tell me what needs approval?",
    draftLabel: "AI-prepared draft",
    draft: "Availability exists at both properties. Connecting rooms in Seville require an upgrade, and the original rate cannot be carried over automatically. I have prepared two booking changes, a rate-exception request and an invoice split for review. Nothing has been sent or changed yet.",
    sourcesLabel: "Checked sources",
    sources: "PMS availability · CRM record · approved rate policy",
    approval: "Awaiting operations manager approval",
  },
  es: {
    eyebrow: "Una conversación se convierte en un flujo controlado",
    title: "Muestra la petición compleja, no solo el chatbot.",
    lead: "Un sistema útil de WhatsApp entiende la petición, consulta las fuentes operativas adecuadas y prepara una siguiente acción segura. Una persona sigue siendo responsable de las excepciones y la aprobación.",
    steps: [
      ["01", "Capturar todo el contexto", "Notas de voz y mensajes forman una solicitud estructurada."],
      ["02", "Consultar sistemas y políticas", "Se revisan disponibilidad, CRM y reglas de tarifa."],
      ["03", "Detenerse para aprobación humana", "Nada cambia ni llega al cliente hasta que lo revise un responsable."],
    ],
    cta: "Abrir la demo completa de control de WhatsApp",
    note: "Escenario ilustrativo · sin datos de clientes",
    phoneTitle: "Operaciones de huéspedes",
    phoneStatus: "Flujo de WhatsApp Business",
    customerLabel: "Nota de voz recibida · transcrita",
    customer: "Una familia pagó cuatro noches en Málaga, pero su vuelo ha cambiado. Ahora necesita Sevilla mañana, Málaga dos días después, habitaciones comunicadas, la misma tarifa acordada y una factura dividida entre gastos de empresa y personales. ¿Puedes comprobar disponibilidad, proteger la tarifa, actualizar ambas reservas y decirme qué necesita aprobación?",
    draftLabel: "Borrador preparado por IA",
    draft: "Hay disponibilidad en ambos establecimientos. Las habitaciones comunicadas en Sevilla requieren una mejora y la tarifa original no puede trasladarse automáticamente. He preparado dos cambios de reserva, una excepción de tarifa y la división de factura para revisión. Todavía no se ha enviado ni modificado nada.",
    sourcesLabel: "Fuentes consultadas",
    sources: "Disponibilidad PMS · registro CRM · política de tarifas aprobada",
    approval: "Pendiente de aprobación del responsable de operaciones",
  },
} satisfies Record<Locale, {
  eyebrow: string;
  title: string;
  lead: string;
  steps: string[][];
  cta: string;
  note: string;
  phoneTitle: string;
  phoneStatus: string;
  customerLabel: string;
  customer: string;
  draftLabel: string;
  draft: string;
  sourcesLabel: string;
  sources: string;
  approval: string;
}>;

function MessageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.7 18.4 3 21l1.1-4.5A8.6 8.6 0 1 1 6.7 18.4Z" /><path d="M8 9.5h8M8 13h5" /></svg>;
}

function MicrophoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4M9 21h6" /></svg>;
}

export function WhatsAppConversationExample({ locale }: { locale: Locale }) {
  const c = content[locale];
  const headingId = `whatsapp-example-${locale}`;

  return <section className="whatsapp-example-section" aria-labelledby={headingId}>
    <div className="shell whatsapp-example-grid">
      <div className="whatsapp-example-copy">
        <p className="eyebrow">{c.eyebrow}</p>
        <h2 id={headingId}>{c.title}</h2>
        <p>{c.lead}</p>
        <ol className="whatsapp-example-steps">
          {c.steps.map(([number, title, description]) => <li key={number}>
            <span>{number}</span>
            <div><strong>{title}</strong><p>{description}</p></div>
          </li>)}
        </ol>
        <Link className="button button-ghost" href={locale === "en" ? "/solutions/whatsapp-sales-service-control/demo" : "/es/soluciones/control-ventas-servicio-whatsapp/demo"}>{c.cta}</Link>
        <small>{c.note}</small>
      </div>

      <div className="whatsapp-phone-stage">
        <div className="whatsapp-phone" role="group" aria-label={`${c.phoneTitle}. ${c.note}`}>
          <div className="whatsapp-phone-hardware" aria-hidden="true"><span /><i /></div>
          <header className="whatsapp-phone-header">
            <span className="whatsapp-phone-avatar"><MessageIcon /></span>
            <div><strong>{c.phoneTitle}</strong><small>{c.phoneStatus}</small></div>
            <span className="whatsapp-phone-secure" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg></span>
          </header>

          <div className="whatsapp-phone-chat">
            <p className="whatsapp-demo-label">{c.note}</p>
            <article className="whatsapp-message whatsapp-message-incoming">
              <div className="whatsapp-voice-row">
                <span><MicrophoneIcon /></span>
                <i aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <b key={index} />)}</i>
                <time>0:38</time>
              </div>
              <small>{c.customerLabel}</small>
              <p>{c.customer}</p>
              <time>09:41</time>
            </article>

            <article className="whatsapp-message whatsapp-message-draft">
              <small>{c.draftLabel}</small>
              <p>{c.draft}</p>
              <div className="whatsapp-sources"><span>{c.sourcesLabel}</span><strong>{c.sources}</strong></div>
              <time>09:42</time>
            </article>
          </div>

          <footer className="whatsapp-approval-status"><span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg></span><strong>{c.approval}</strong></footer>
        </div>
      </div>
    </div>
  </section>;
}
