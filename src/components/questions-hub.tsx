import Link from "next/link";
import type { GrowthPage } from "@/content/growth";
import { publicConfig } from "@/lib/public-config";
import { BookingCta } from "./booking-cta";
import { Breadcrumbs } from "./breadcrumbs";
import { GrowthPageJsonLd } from "./json-ld";

const guides = {
  en: [
    {
      number: "01",
      title: "Start and identify the use case",
      answer: "Begin with one workflow where friction, ownership and a measurable result can be described. Do not begin with a model, a vendor or a mandate to “use AI.”",
      changes: "The right first case changes with volume, source quality, reversibility, process ownership and access to the systems involved.",
      goesWrong: "Teams select a visible demo rather than an operating problem, then discover late that nobody owns the data, exceptions or adoption.",
      checklist: ["Name the workflow and process owner", "Describe the current exception path", "Choose one baseline measure", "Confirm the source information and system access"],
      links: [["Run the 7-step diagnostic", "/ai-for-my-business"], ["Explore the Opportunity Sprint", "/services/ai-opportunity-sprint"]],
    },
    {
      number: "02",
      title: "Cost, timing and return",
      answer: "A credible estimate follows a bounded scope. Integration, permissions, data preparation, testing, exception handling, change management and support usually matter more than the visible interface.",
      changes: "Cost and timing move with the number of systems, source quality, security obligations, decision risk, stakeholder availability and the evidence needed before release.",
      goesWrong: "Capacity released is presented as guaranteed cash savings, ongoing operating cost is omitted, or a pilot is expanded before the baseline result is known.",
      checklist: ["Enter your own operating assumptions", "Separate one-time and monthly cost", "Model low, base and high scenarios", "Define the decision gate for a pilot"],
      links: [["Use the ROI planning calculator", "/tools/ai-automation-roi-calculator"], ["See the implementation process", "/process"]],
    },
    {
      number: "03",
      title: "Data, security and human control",
      answer: "Use only the approved information and access needed for the workflow. Define what the system may do, when it must stop and which person owns a consequential decision or exception.",
      changes: "The design changes with data sensitivity, geography, retention, provider terms, user permissions, reversibility and the consequences of a wrong output.",
      goesWrong: "Broad access is granted for convenience, unapproved documents are treated as truth, or human review exists in policy but not in the actual workflow.",
      checklist: ["Map purpose, sources and data movement", "Apply least-privilege permissions", "Define validation and stop rules", "Log material actions and handovers"],
      links: [["Review security and responsible AI", "/security"], ["Read about knowledge assistants", "/services/knowledge-assistants"]],
    },
    {
      number: "04",
      title: "Customer service and WhatsApp",
      answer: "A corporate WhatsApp workflow can create shared ownership, assignment, response visibility, escalation and controlled assistance. It cannot legitimately monitor private employee accounts.",
      changes: "Feasibility depends on an approved corporate channel, Meta/provider access, templates, consent, routing, service targets, CRM requirements and the handover model.",
      goesWrong: "A chatbot is added before queue ownership, unanswered-message handling and human escalation are designed.",
      checklist: ["Confirm the corporate number and provider route", "Define queues, owners and response targets", "Set human approval for sensitive replies", "Measure unanswered, response and reopen rates"],
      links: [["See the WhatsApp control blueprint", "/solutions/whatsapp-sales-service-control"], ["Open the illustrative demo", "/solutions/whatsapp-sales-service-control/demo"]],
    },
    {
      number: "05",
      title: "Automation, tools and custom development",
      answer: "Use ordinary rules or existing software when they solve the problem reliably. Add AI where inputs are variable, knowledge is unstructured or assistance needs context; build custom capability only when workflow and integration needs justify it.",
      changes: "The choice depends on process stability, API availability, permissions, exception rate, licensing, maintainability and whether the capability differentiates the operation.",
      goesWrong: "A custom product is commissioned before the workflow is stable, or a generic tool is forced across proprietary rules it cannot safely handle.",
      checklist: ["Test the simplest viable approach first", "Identify the riskiest assumption", "Confirm APIs and licensing", "Define support, monitoring and rollback ownership"],
      links: [["Compare implementation services", "/services"], ["Explore custom AI development", "/services/custom-ai-development"]],
    },
  ],
  es: [
    {
      number: "01",
      title: "Empezar e identificar el caso de uso",
      answer: "Empieza por un flujo donde puedan describirse la fricción, el responsable y un resultado medible. No empieces por un modelo, un proveedor o el mandato de “usar IA”.",
      changes: "El primer caso cambia según volumen, calidad de fuentes, reversibilidad, responsabilidad del proceso y acceso a los sistemas.",
      goesWrong: "Se elige una demo visible en vez de un problema operativo y se descubre tarde que nadie es responsable de datos, excepciones o adopción.",
      checklist: ["Nombrar el flujo y su responsable", "Describir la ruta actual de excepciones", "Elegir una medida de línea base", "Confirmar información fuente y acceso a sistemas"],
      links: [["Realizar el diagnóstico de 7 pasos", "/es/ia-para-mi-negocio"], ["Explorar el Sprint de Oportunidades", "/es/servicios/sprint-oportunidades-ia"]],
    },
    {
      number: "02",
      title: "Coste, plazo y retorno",
      answer: "Una estimación creíble parte de un alcance acotado. Integración, permisos, preparación de datos, pruebas, excepciones, gestión del cambio y soporte suelen importar más que la interfaz visible.",
      changes: "Coste y plazo cambian con número de sistemas, calidad de fuentes, seguridad, riesgo de decisión, disponibilidad de responsables y evidencia necesaria antes de publicar.",
      goesWrong: "La capacidad liberada se presenta como ahorro de caja garantizado, se omite el coste operativo o se amplía un piloto antes de conocer el resultado base.",
      checklist: ["Introducir supuestos operativos propios", "Separar coste único y mensual", "Modelar escenarios bajo, base y alto", "Definir la puerta de decisión del piloto"],
      links: [["Usar la calculadora de ROI", "/es/herramientas/calculadora-roi-automatizacion-ia"], ["Ver el proceso de implementación", "/es/proceso"]],
    },
    {
      number: "03",
      title: "Datos, seguridad y control humano",
      answer: "Utiliza solo la información y el acceso aprobados que necesita el flujo. Define qué puede hacer el sistema, cuándo debe detenerse y qué persona es responsable de una decisión relevante o excepción.",
      changes: "El diseño cambia con sensibilidad, geografía, retención, condiciones del proveedor, permisos, reversibilidad y consecuencias de una salida errónea.",
      goesWrong: "Se concede acceso amplio por comodidad, documentos no aprobados se tratan como verdad o la revisión humana existe en la política pero no en el flujo real.",
      checklist: ["Mapear finalidad, fuentes y movimiento de datos", "Aplicar permisos de mínimo privilegio", "Definir validación y reglas de parada", "Registrar acciones materiales y traspasos"],
      links: [["Revisar seguridad e IA responsable", "/es/seguridad"], ["Conocer los asistentes de conocimiento", "/es/servicios/asistentes-conocimiento"]],
    },
    {
      number: "04",
      title: "Atención al cliente y WhatsApp",
      answer: "Un flujo corporativo de WhatsApp puede aportar responsabilidad compartida, asignación, visibilidad de respuesta, escalado y asistencia controlada. No puede supervisar legítimamente cuentas privadas de empleados.",
      changes: "La viabilidad depende del canal corporativo aprobado, acceso de Meta/proveedor, plantillas, consentimiento, enrutamiento, objetivos de servicio, CRM y modelo de traspaso.",
      goesWrong: "Se añade un chatbot antes de diseñar responsables de cola, mensajes sin respuesta y escalado humano.",
      checklist: ["Confirmar número corporativo y ruta del proveedor", "Definir colas, responsables y objetivos", "Establecer aprobación humana en respuestas sensibles", "Medir pendientes, respuesta y reaperturas"],
      links: [["Ver el diseño de control de WhatsApp", "/es/soluciones/control-ventas-servicio-whatsapp"], ["Abrir la demo ilustrativa", "/es/soluciones/control-ventas-servicio-whatsapp/demo"]],
    },
    {
      number: "05",
      title: "Automatización, herramientas y desarrollo a medida",
      answer: "Utiliza reglas o software existente cuando resuelvan bien el problema. Añade IA cuando las entradas varían, el conocimiento no está estructurado o la asistencia necesita contexto; desarrolla a medida solo si flujo e integración lo justifican.",
      changes: "La elección depende de estabilidad, API, permisos, excepciones, licencias, mantenimiento y de si la capacidad diferencia la operación.",
      goesWrong: "Se encarga un producto a medida antes de estabilizar el flujo o se fuerza una herramienta genérica sobre reglas propias que no puede gestionar con seguridad.",
      checklist: ["Probar primero el enfoque viable más simple", "Identificar la hipótesis más arriesgada", "Confirmar API y licencias", "Definir responsables de soporte, monitorización y reversión"],
      links: [["Comparar servicios de implementación", "/es/servicios"], ["Explorar desarrollo de IA a medida", "/es/servicios/desarrollo-ia-medida"]],
    },
  ],
} as const;

const copy = {
  en: {
    eyebrow: "Questions and decisions",
    title: "The questions to resolve before choosing an AI tool.",
    lead: "This hub groups the decisions that repeatedly shape a useful implementation: where to start, what changes cost and return, how to control data and actions, and when a simple automation is the better answer.",
    review: "Preview draft · Human publication approval required",
    point: "Viste.ai point of view",
    pointText: "The purpose of decision content is not to persuade every visitor to buy AI. It is to help an established business identify a controlled, measurable workflow—or decide that it is not ready yet.",
    changes: "What changes the answer",
    wrong: "What commonly goes wrong",
    checklist: "Decision checklist",
    related: "Useful next step",
    maintained: "Maintained by Viste.ai",
    final: "Have one real workflow in mind?",
    finalText: "Run the preliminary diagnostic or share the process, systems and outcome with us. A senior practitioner will respond with an honest next step.",
    diagnostic: "Evaluate the workflow",
  },
  es: {
    eyebrow: "Preguntas y decisiones",
    title: "Las preguntas que conviene resolver antes de elegir una herramienta de IA.",
    lead: "Este centro agrupa las decisiones que condicionan una implementación útil: por dónde empezar, qué cambia coste y retorno, cómo controlar datos y acciones y cuándo una automatización simple es mejor.",
    review: "Borrador de preview · Requiere aprobación humana para publicación",
    point: "Punto de vista de Viste.ai",
    pointText: "El objetivo del contenido de decisión no es convencer a todos de comprar IA. Es ayudar a una empresa consolidada a identificar un flujo controlado y medible, o a decidir que todavía no está preparada.",
    changes: "Qué hace cambiar la respuesta",
    wrong: "Qué suele salir mal",
    checklist: "Lista de decisión",
    related: "Siguiente paso útil",
    maintained: "Mantenido por Viste.ai",
    final: "¿Tienes un flujo real en mente?",
    finalText: "Realiza el diagnóstico preliminar o comparte proceso, sistemas y resultado. Una persona senior responderá con un siguiente paso honesto.",
    diagnostic: "Evaluar el flujo",
  },
} as const;

export function QuestionsHub({ page }: { page: GrowthPage }) {
  const locale = page.locale;
  const c = copy[locale];
  const diagnosticPath = locale === "es" ? "/es/ia-para-mi-negocio" : "/ai-for-my-business";
  const contactPath = locale === "es" ? "/es/contacto" : "/contact";

  return <main className="growth-page"><GrowthPageJsonLd page={page} />
    <section className="page-hero growth-hero"><div className="shell narrow"><Breadcrumbs path={page.path} title={page.title} locale={locale} /><p className="eyebrow">{c.eyebrow}</p><h1>{c.title}</h1><p className="lede growth-answer">{c.lead}</p><p className="editorial-status">{c.review} · {page.lastReviewed}</p></div></section>
    <section className="shell viewpoint"><p className="eyebrow">{c.point}</p><blockquote>{c.pointText}</blockquote><p>{c.maintained} · {page.lastReviewed}</p></section>
    <section className="shell section guide-list">{guides[locale].map((guide) => <article key={guide.number} className="question-guide"><header><span>{guide.number}</span><div><h2>{guide.title}</h2><p>{guide.answer}</p></div></header><div className="guide-detail"><div><h3>{c.changes}</h3><p>{guide.changes}</p></div><div><h3>{c.wrong}</h3><p>{guide.goesWrong}</p></div><div><h3>{c.checklist}</h3><ul>{guide.checklist.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>{c.related}</h3>{guide.links.map(([label, href]) => <Link className="text-link" href={href} key={href}>{label} →</Link>)}</div></div></article>)}</section>
    <section className="shell callout callout-large growth-final"><div><p className="eyebrow">{c.eyebrow}</p><h2>{c.final}</h2><p>{c.finalText}</p></div><Link className="button" href={diagnosticPath}>{c.diagnostic}</Link></section>
    <BookingCta locale={locale} bookingUrl={publicConfig.bookingUrl} source="questions_hub" fallbackHref={`${contactPath}#contact-form`} />
  </main>;
}
