import { ContactForm } from "./contact-form";
import { BookingCta } from "./booking-cta";
import { TrackedLink } from "./tracked-link";
import { publicConfig } from "@/lib/public-config";

export function ContactPage({ locale }: { locale: "en" | "es" }) {
  const es = locale === "es";
  return <main><section className="page-hero contact-hero"><div className="shell contact-layout"><div><p className="eyebrow">{es ? "Empezar una conversación" : "Start a conversation"}</p><h1>{es ? "Cuéntanos qué trabajo debería funcionar mejor." : "Tell us what work should work better."}</h1><p className="lede">{es ? "Describe el flujo, los sistemas y el resultado. Una persona senior revisará el contexto y responderá con un siguiente paso honesto." : "Describe the workflow, systems and outcome. A senior practitioner will review the context and respond with an honest next step."}</p><div className="contact-options"><a href="mailto:hello@viste.ai"><span>Email</span><strong>hello@viste.ai</strong></a><TrackedLink href="https://wa.me/message/5IYX266Z5KPKK1" event="whatsapp_clicked" properties={{ locale, source: "contact_page" }}><span>WhatsApp</span><strong>{es ? "Abrir conversación" : "Open conversation"}</strong></TrackedLink></div><BookingCta locale={locale} bookingUrl={publicConfig.bookingUrl} source="contact_page" fallbackHref="#contact-form" compact /><p className="fine contact-assurance">{es ? "Validación en servidor · Protección anti-spam · Almacenamiento y notificación del lado del servidor mediante proveedores configurados" : "Server validation · Anti-spam controls · Server-side storage and notification through configured providers"}</p></div><ContactForm locale={locale} /></div></section></main>;
}
