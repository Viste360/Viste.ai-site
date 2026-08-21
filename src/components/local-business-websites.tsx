import Link from "next/link";
import { FaCamera, FaGlobe, FaGoogle, FaInstagram, FaMeta, FaQrcode, FaRegCalendarCheck, FaWhatsapp } from "react-icons/fa6";
import { Breadcrumbs } from "./breadcrumbs";
import { LocalWebsiteForm } from "./local-website-form";
import { LocalBusinessPricingJsonLd } from "./local-business-pricing-json-ld";
import { PageJsonLd } from "./json-ld";
import { getPage } from "@/content/pages";

type Locale = "en" | "es";

const copy = {
  en: {
    path: "/services/websites-for-local-businesses",
    eyebrow: "Viste Local · One-off website projects",
    title: <>Your customers check you online <em>before they walk through the door.</em></>,
    lead: "Viste Local connects your website, Google presence, Instagram, photos, opening hours, reviews, WhatsApp and booking into one credible digital presence.",
    interest: "I'm interested",
    whatsapp: "Ask on WhatsApp",
    oneOff: "One-off project prices — not monthly subscriptions",
    contentsLabel: "On this page",
    contents: [["Why it matters", "why-it-matters"], ["Connected presence", "connected-presence"], ["Website packages", "packages"], ["One-off extras", "extras"], ["Enquire", "website-enquiry"]],
    whyEyebrow: "Why this is necessary",
    whyTitle: "A customer should be able to find you, trust you and act — without piecing the story together.",
    why: [
      ["Can customers find and understand the business?", "Clear services, location, hours and practical information reduce uncertainty."],
      ["Does the online presence create trust?", "A coherent website, current profiles, strong photography and visible reviews help the business look cared for."],
      ["Can customers act immediately?", "Calls, WhatsApp, directions and booking should be obvious on a phone."],
      ["Can the business understand what generates enquiries?", "Clean contact paths and source information provide a foundation for better follow-up."],
    ],
    connectedEyebrow: "One connected presence",
    connectedTitle: "Every channel has a job. Your website brings the story together.",
    connectedLead: "These platforms remain independent services. Their logos identify the channels we can connect and do not imply an official partnership with Viste.ai.",
    connected: [
      ["Website", "Central source of information", FaGlobe], ["Google", "Search, directions and reviews", FaGoogle],
      ["Instagram", "Visual credibility", FaInstagram], ["WhatsApp", "Immediate conversations", FaWhatsapp],
      ["Booking calendar", "Reservations", FaRegCalendarCheck], ["QR codes", "Physical-to-digital connection", FaQrcode],
      ["Photography", "Venue, team, services and products", FaCamera], ["Meta Ads", "Targeted reach", FaMeta],
    ],
    ownership: "You retain ownership of your domain, Google, Meta, booking and advertising accounts.",
    packagesEyebrow: "Website packages",
    packagesTitle: "Choose the right starting point. Pay once for the agreed project.",
    packages: [
      { name: "Local Start", price: "€490", priceType: "Fixed project price", description: "For a small business needing a credible mobile-first website quickly.", bullets: ["Focused mobile-first website", "Essential business information", "Clear contact and WhatsApp actions"] },
      { name: "Local Business", price: "from €950", priceType: "Starting project price", description: "For businesses needing several pages, stronger presentation, reviews, galleries and booking.", bullets: ["Several-page structure", "Reviews and gallery presentation", "Booking connection in the customer journey"] },
      { name: "Signature", price: "from €1,500", priceType: "Starting project price", description: "For a more distinctive brand, custom structure, integrations and conversion journey.", bullets: ["More distinctive visual direction", "Custom information structure", "Agreed integrations and conversion journey"] },
    ],
    extrasEyebrow: "One-off extras",
    extrasTitle: "Add only what the business needs.",
    extras: [["On-site photography visit", "from €99"], ["Booking calendar connection", "€99"], ["QR reservation/contact pack", "from €59"], ["Google and social profile refresh", "from €149"], ["Instagram/Meta advertising campaign setup", "from €300"], ["Defined website change pack", "from €100"]],
    termsTitle: "Clear boundaries before work starts",
    terms: ["Advertising spend is separate.", "Third-party subscriptions are separate.", "Travel, printing, domain and hosting are quoted separately where applicable.", "Ongoing maintenance or advertising is optional and agreed separately."],
    formEyebrow: "Tell us about the business",
    formTitle: "Interested? Choose a package and show us what is missing.",
  },
  es: {
    path: "/es/servicios/paginas-web-negocios-locales",
    eyebrow: "Viste Local · Proyectos web de pago único",
    title: <>Tus clientes te valoran online <em>antes de entrar por la puerta.</em></>,
    lead: "Viste Local conecta tu web, presencia en Google, Instagram, fotos, horarios, reseñas, WhatsApp y reservas en una presencia digital sólida.",
    interest: "Me interesa",
    whatsapp: "Preguntar por WhatsApp",
    oneOff: "Precios por proyecto único — no son cuotas mensuales",
    contentsLabel: "En esta página",
    contents: [["Por qué importa", "why-it-matters"], ["Presencia conectada", "connected-presence"], ["Paquetes web", "packages"], ["Extras opcionales", "extras"], ["Solicitar información", "website-enquiry"]],
    whyEyebrow: "Por qué es necesario",
    whyTitle: "El cliente debe poder encontrarte, confiar y actuar sin tener que reconstruir la historia por su cuenta.",
    why: [
      ["¿Los clientes pueden encontrar y entender el negocio?", "Servicios, ubicación, horarios e información práctica claros reducen la incertidumbre."],
      ["¿La presencia online genera confianza?", "Una web coherente, perfiles actuales, buenas fotografías y reseñas visibles transmiten cuidado."],
      ["¿El cliente puede actuar de inmediato?", "Llamadas, WhatsApp, indicaciones y reservas deben ser evidentes desde el móvil."],
      ["¿El negocio sabe qué genera consultas?", "Vías de contacto limpias e información de origen facilitan un mejor seguimiento."],
    ],
    connectedEyebrow: "Una presencia conectada",
    connectedTitle: "Cada canal tiene una función. La web reúne toda la historia.",
    connectedLead: "Estas plataformas son servicios independientes. Sus logotipos identifican los canales que podemos conectar y no implican una colaboración oficial con Viste.ai.",
    connected: [
      ["Web", "Fuente central de información", FaGlobe], ["Google", "Búsqueda, indicaciones y reseñas", FaGoogle],
      ["Instagram", "Credibilidad visual", FaInstagram], ["WhatsApp", "Conversaciones inmediatas", FaWhatsapp],
      ["Calendario", "Reservas", FaRegCalendarCheck], ["Códigos QR", "Conexión entre lo físico y lo digital", FaQrcode],
      ["Fotografía", "Local, equipo, servicios y productos", FaCamera], ["Meta Ads", "Alcance segmentado", FaMeta],
    ],
    ownership: "Conservas la propiedad de tu dominio y de tus cuentas de Google, Meta, reservas y publicidad.",
    packagesEyebrow: "Paquetes web",
    packagesTitle: "Elige el punto de partida adecuado. Paga una vez por el proyecto acordado.",
    packages: [
      { name: "Local Start", price: "490 €", priceType: "Precio fijo por proyecto", description: "Para un pequeño negocio que necesita rápidamente una web móvil y creíble.", bullets: ["Web enfocada y pensada para móvil", "Información esencial del negocio", "Acciones claras de contacto y WhatsApp"] },
      { name: "Local Business", price: "desde 950 €", priceType: "Precio inicial por proyecto", description: "Para negocios que necesitan varias páginas, mejor presentación, reseñas, galerías y reservas.", bullets: ["Estructura de varias páginas", "Presentación de reseñas y galería", "Conexión de reservas en el recorrido"] },
      { name: "Signature", price: "desde 1.500 €", priceType: "Precio inicial por proyecto", description: "Para una marca más diferenciada, estructura a medida, integraciones y recorrido de conversión.", bullets: ["Dirección visual más distintiva", "Estructura de información a medida", "Integraciones y recorrido de conversión acordados"] },
    ],
    extrasEyebrow: "Extras de pago único",
    extrasTitle: "Añade solo lo que necesita el negocio.",
    extras: [["Visita de fotografía en el negocio", "desde 99 €"], ["Conexión de calendario de reservas", "99 €"], ["Pack QR de reserva/contacto", "desde 59 €"], ["Actualización de perfiles de Google y redes", "desde 149 €"], ["Configuración de campaña en Instagram/Meta", "desde 300 €"], ["Pack definido de cambios web", "desde 100 €"]],
    termsTitle: "Límites claros antes de empezar",
    terms: ["La inversión publicitaria se paga aparte.", "Las suscripciones de terceros se pagan aparte.", "Desplazamientos, impresión, dominio y alojamiento se cotizan aparte cuando corresponda.", "El mantenimiento continuo o la publicidad son opcionales y se acuerdan por separado."],
    formEyebrow: "Cuéntanos sobre el negocio",
    formTitle: "¿Te interesa? Elige un paquete y dinos qué falta.",
  },
} as const;

export function LocalBusinessWebsites({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const definition = getPage(c.path);
  if (!definition) return null;
  return <main className="local-service-page"><PageJsonLd page={definition} /><LocalBusinessPricingJsonLd locale={locale} />
    <section className="local-service-hero"><div className="shell"><Breadcrumbs path={c.path} title={definition.title} locale={locale} /><div className="local-hero-grid"><div><p className="eyebrow">{c.eyebrow}</p><h1>{c.title}</h1><p className="lede">{c.lead}</p><div className="button-row"><Link className="button" href="#website-enquiry">{c.interest}</Link><a className="button button-ghost" href="https://wa.me/message/5IYX266Z5KPKK1" rel="noreferrer">{c.whatsapp}</a></div><p className="local-one-off">{c.oneOff}</p></div><div className="local-price-stack" aria-label={locale === "en" ? "Website package prices" : "Precios de paquetes web"}>{c.packages.map((item, index) => <a href="#packages" key={item.name}><span>0{index + 1}</span><div><strong>{item.name}</strong><small>{item.description}</small></div><span className="local-price-value"><b>{item.price}</b><small>{item.priceType}</small></span></a>)}</div></div></div></section>
    <nav className="shell local-toc" aria-label={c.contentsLabel}><span>{c.contentsLabel}</span><ol>{c.contents.map(([label, id], index) => <li key={id}><a href={`#${id}`}><small>{String(index + 1).padStart(2, "0")}</small>{label}</a></li>)}</ol></nav>
    <section className="shell local-why" id="why-it-matters"><div className="local-section-heading"><p className="eyebrow">{c.whyEyebrow}</p><h2>{c.whyTitle}</h2></div><div className="local-question-grid">{c.why.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="local-connected" id="connected-presence"><div className="shell"><div className="local-section-heading"><p className="eyebrow">{c.connectedEyebrow}</p><h2>{c.connectedTitle}</h2><p>{c.connectedLead}</p></div><div className="presence-grid">{c.connected.map(([label, description, Icon]) => <article key={label}><Icon aria-hidden="true" focusable="false" /><div><h3>{label}</h3><p>{description}</p></div></article>)}</div><p className="ownership-note">{c.ownership}</p></div></section>
    <section className="shell local-packages" id="packages"><div className="local-section-heading"><p className="eyebrow">{c.packagesEyebrow}</p><h2>{c.packagesTitle}</h2></div><div className="package-grid">{c.packages.map((item, index) => <article className={index === 1 ? "featured" : ""} key={item.name}><span>0{index + 1}</span><h3>{item.name}</h3><span className="package-price"><strong>{item.price}</strong><small>{item.priceType}</small></span><p>{item.description}</p><ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul><Link href="#website-enquiry" className={index === 1 ? "button" : "button button-ghost"}>{c.interest}</Link></article>)}</div></section>
    <section className="shell local-extras" id="extras"><div className="local-section-heading"><p className="eyebrow">{c.extrasEyebrow}</p><h2>{c.extrasTitle}</h2></div><div className="extras-list">{c.extras.map(([name, price]) => <div key={name}><span>{name}</span><strong>{price}</strong></div>)}</div><div className="pricing-boundaries"><h3>{c.termsTitle}</h3><ul>{c.terms.map((term) => <li key={term}>{term}</li>)}</ul><strong>{c.oneOff}</strong></div></section>
    <section className="local-form-section"><div className="shell local-form-layout"><div><p className="eyebrow">{c.formEyebrow}</p><h2>{c.formTitle}</h2><p className="lede">{c.ownership}</p><a className="text-link" href="https://wa.me/message/5IYX266Z5KPKK1" rel="noreferrer">{c.whatsapp} →</a></div><LocalWebsiteForm locale={locale} /></div></section>
  </main>;
}
