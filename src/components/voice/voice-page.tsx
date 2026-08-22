import Link from "next/link";
import { VoiceCallbackForm, VeraVoiceDemo } from "./voice-demo";
import styles from "./voice.module.css";

type Locale = "en" | "es";

const content = {
  en: {
    eyebrow: "VISTE Voice · AI sales concierge",
    title: <>Your business never misses <em>another call.</em></>,
    intro: "A natural Spanish and English AI receptionist and sales agent, trained on approved facts and available around the clock.",
    primary: "Hear Vera",
    secondary: "Let Vera call me",
    disclosure: "Vera always identifies herself as AI.",
    answered: "Every call answered",
    followed: "Every lead followed up",
    booked: "Every appointment booked",
    builtFor: "Built for the moment your customer decides to call",
    builtIntro: "Vera handles the useful first conversation—then books, transfers or records the next action without pretending to be human.",
    capabilities: [
      ["01", "Answer", "Explain approved services, prices, hours and policies in natural Spanish or English."],
      ["02", "Qualify", "Understand the real need with a few relevant questions, not a robotic interrogation."],
      ["03", "Book", "Check approved availability and confirm the critical details before writing anything."],
      ["04", "Transfer", "Bring in a person for valuable, sensitive or uncertain calls, with the context intact."],
    ],
    demoEyebrow: "Meet Vera",
    demoTitle: "Don’t take our word for it. Have the conversation.",
    demoIntro: "Try the website voice experience now, or request the personalised telephone demonstration for your own business.",
    packagesEyebrow: "Launch packages",
    packagesTitle: "Start with the calls that already want an answer.",
    packages: [
      ["Essential", "€149", "200 minutes", "Inbound answers, FAQs, lead capture and summaries", "€390 onboarding", "€0.39/min overage"],
      ["Sales", "€299", "600 minutes", "Qualification, booking, bilingual service and human transfer", "€790 onboarding", "€0.35/min overage"],
      ["Growth", "€599", "1,200 minutes", "Multi-location, requested callbacks, warm follow-up and analytics", "€1,490 onboarding", "€0.30/min overage"],
    ],
    month: "/month",
    beforeVat: "Before VAT where applicable. Final scope follows a human consultation and written proposal.",
    guardrailEyebrow: "Controlled by VISTE",
    guardrailTitle: "Natural speech. Serious guardrails.",
    guardrails: [
      ["AI disclosure", "Spoken at the beginning and impossible for a customer configuration to disable."],
      ["Consent first", "Requested callbacks and documented warm leads only—never scraped cold-call lists."],
      ["Human handoff", "Complaints, uncertainty, billing disputes and sensitive topics leave the AI flow."],
      ["Data boundaries", "Customers, leads, consent, usage and billing stay in VISTE’s tenant-scoped control plane."],
    ],
    finalTitle: "Make every incoming call a useful next step.",
    finalText: "Start with Vera, one approved line and the calls your business already receives.",
    finalCta: "Discuss VISTE Voice",
  },
  es: {
    eyebrow: "VISTE Voice · Asistente comercial con IA",
    title: <>Tu negocio no vuelve a perder <em>ninguna llamada.</em></>,
    intro: "Una recepcionista y agente comercial con IA natural, en español e inglés, entrenada con información aprobada y disponible a cualquier hora.",
    primary: "Escuchar a Vera",
    secondary: "Quiero que Vera me llame",
    disclosure: "Vera siempre se identifica como IA.",
    answered: "Cada llamada atendida",
    followed: "Cada oportunidad acompañada",
    booked: "Cada cita reservada",
    builtFor: "Creado para el momento en que tu cliente decide llamar",
    builtIntro: "Vera mantiene la primera conversación útil y después reserva, transfiere o registra el siguiente paso sin fingir que es humana.",
    capabilities: [
      ["01", "Atender", "Explica servicios, precios, horarios y políticas aprobados en español o inglés natural."],
      ["02", "Cualificar", "Entiende la necesidad real con pocas preguntas relevantes, sin convertir la llamada en un interrogatorio."],
      ["03", "Reservar", "Consulta la disponibilidad aprobada y confirma los datos críticos antes de escribir nada."],
      ["04", "Transferir", "Incorpora a una persona en llamadas valiosas, sensibles o inciertas sin perder el contexto."],
    ],
    demoEyebrow: "Conoce a Vera",
    demoTitle: "No te quedes con la explicación. Mantén la conversación.",
    demoIntro: "Prueba ahora la experiencia de voz en la web o solicita una demostración telefónica personalizada para tu negocio.",
    packagesEyebrow: "Paquetes de lanzamiento",
    packagesTitle: "Empieza por las llamadas que ya quieren una respuesta.",
    packages: [
      ["Essential", "149 €", "200 minutos", "Llamadas entrantes, preguntas, captación y resúmenes", "Alta 390 €", "Exceso 0,39 €/min"],
      ["Sales", "299 €", "600 minutos", "Cualificación, reservas, atención bilingüe y transferencia", "Alta 790 €", "Exceso 0,35 €/min"],
      ["Growth", "599 €", "1.200 minutos", "Varias ubicaciones, callbacks solicitados, seguimiento y analítica", "Alta 1.490 €", "Exceso 0,30 €/min"],
    ],
    month: "/mes",
    beforeVat: "Antes de IVA cuando corresponda. El alcance final requiere una consulta humana y una propuesta escrita.",
    guardrailEyebrow: "Controlado por VISTE",
    guardrailTitle: "Voz natural. Límites serios.",
    guardrails: [
      ["Transparencia IA", "Se comunica al principio y ninguna configuración del cliente puede desactivarla."],
      ["Primero el consentimiento", "Solo callbacks solicitados y oportunidades cálidas documentadas; nunca listas extraídas de internet."],
      ["Transferencia humana", "Quejas, dudas, disputas de facturación y temas sensibles salen del flujo de IA."],
      ["Datos separados", "Clientes, oportunidades, consentimiento, uso y facturación permanecen en el plano de control de VISTE por organización."],
    ],
    finalTitle: "Convierte cada llamada entrante en un siguiente paso útil.",
    finalText: "Empieza con Vera, una línea aprobada y las llamadas que tu negocio ya recibe.",
    finalCta: "Hablar sobre VISTE Voice",
  },
} as const;

export function VoicePage({ locale, demoEnabled, webVoiceEnabled }: { locale: Locale; demoEnabled: boolean; webVoiceEnabled: boolean }) {
  const text = content[locale];
  const contact = locale === "en" ? "/contact" : "/es/contacto";
  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={`shell ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h1>{text.title}</h1>
          <p className={styles.lede}>{text.intro}</p>
          <div className={styles.actions}><a className={styles.primaryButton} href="#hear-vera">{text.primary}<span aria-hidden="true">↗</span></a><a className={styles.secondaryButton} href="#callback">{text.secondary}</a></div>
          <p className={styles.disclosure}><span>AI</span>{text.disclosure}</p>
        </div>
        <div className={styles.heroStage} aria-label={locale === "en" ? "Vera call flow" : "Flujo de llamada de Vera"}>
          <div className={styles.liveCard}><span><i /> VERA · LIVE</span><b>00:42</b></div>
          <div className={styles.wave} aria-hidden="true">{Array.from({ length: 32 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 48)}px` }} />)}</div>
          <div className={styles.transcript}><span>VERA</span><p>{locale === "en" ? "I’m VISTE’s AI voice assistant. What would make the biggest difference to your business right now?" : "Soy la asistente de voz con IA de VISTE. ¿Qué cambio tendría más impacto en tu negocio ahora mismo?"}</p></div>
          <div className={styles.flowSteps}><span>01 {text.answered}</span><span>02 {text.followed}</span><span>03 {text.booked}</span></div>
        </div>
      </div>
    </section>

    <section className={styles.capabilitySection}><div className="shell"><div className={styles.sectionHeading}><h2>{text.builtFor}</h2><p>{text.builtIntro}</p></div><div className={styles.capabilityGrid}>{text.capabilities.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

    <section className={styles.demoSection} id="hear-vera"><div className="shell"><p className={styles.eyebrow}>{text.demoEyebrow}</p><div className={styles.sectionHeading}><h2>{text.demoTitle}</h2><p>{text.demoIntro}</p></div><div className={styles.demoGrid}><VeraVoiceDemo locale={locale} enabled={webVoiceEnabled} /><div id="callback"><VoiceCallbackForm locale={locale} enabled={demoEnabled} /></div></div></div></section>

    <section className={styles.pricingSection}><div className="shell"><p className={styles.eyebrow}>{text.packagesEyebrow}</p><h2>{text.packagesTitle}</h2><div className={styles.pricingGrid}>{text.packages.map(([name, price, minutes, description, onboarding, overage], index) => <article key={name} data-featured={index === 1}><div><span>{String(index + 1).padStart(2, "0")}</span>{index === 1 ? <b>{locale === "en" ? "MOST POPULAR" : "MÁS ELEGIDO"}</b> : null}</div><h3>Voice {name}</h3><p className={styles.price}><strong>{price}</strong>{text.month}</p><p>{description}</p><ul><li>{minutes}</li><li>{onboarding}</li><li>{overage}</li></ul><a href="#callback">{text.secondary}<span>→</span></a></article>)}</div><p className={styles.finePrint}>{text.beforeVat}</p></div></section>

    <section className={styles.guardrailSection}><div className={`shell ${styles.guardrailGrid}`}><div><p className={styles.eyebrow}>{text.guardrailEyebrow}</p><h2>{text.guardrailTitle}</h2></div><div>{text.guardrails.map(([title, description], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></div></section>

    <section className={styles.finalCta}><div className="shell"><div><h2>{text.finalTitle}</h2><p>{text.finalText}</p></div><Link className={styles.primaryButton} href={contact}>{text.finalCta}<span aria-hidden="true">↗</span></Link></div></section>
  </main>;
}
