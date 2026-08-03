import { industries, services, solutions, catalogItemToPage } from "./catalog";
import type { Locale, PageDefinition, Section } from "./types";
import { publicConfig } from "@/lib/public-config";

const contact = { en: "/contact", es: "/es/contacto" } as const;

function page(input: PageDefinition): PageDefinition {
  return input;
}

const overviewSections = (locale: Locale, kind: "services" | "solutions" | "industries"): Section[] => {
  const copy = {
    en: {
      services: ["Start with the bottleneck, not the model", "Every engagement begins with the objective, workflow, systems, data, users, risks and budget. We recommend technology only after the operating case is clear."],
      solutions: ["Concrete systems, described honestly", "These Solution Blueprints show what Viste.ai can design and build. They are examples—not claims of completed client work—and every real implementation depends on discovery."],
      industries: ["Built around the operating context", "The same technology behaves differently across teams, regulations, systems and customer journeys. We begin with those differences rather than forcing a generic package."],
    },
    es: {
      services: ["Empieza por el cuello de botella, no por el modelo", "Cada proyecto comienza con el objetivo, el flujo, los sistemas, los datos, los usuarios, los riesgos y el presupuesto. Recomendamos tecnología cuando el caso operativo está claro."],
      solutions: ["Sistemas concretos, explicados con honestidad", "Estos Diseños de Solución muestran lo que Viste.ai puede diseñar y construir. Son ejemplos, no casos de cliente, y cada implementación requiere diagnóstico."],
      industries: ["Diseñado alrededor del contexto operativo", "La misma tecnología se comporta de forma distinta según equipos, regulación, sistemas y recorrido del cliente. Empezamos por esas diferencias, no por un paquete genérico."],
    },
  }[locale][kind];
  return [{ title: copy[0], paragraphs: [copy[1]] }];
};

const staticPages: PageDefinition[] = [
  page({
    id: "services-overview-en",
    locale: "en",
    path: "/services",
    alternatePath: "/es/servicios",
    eyebrow: "Commercial services",
    title: "AI implementation that begins with the business",
    description: "Discover Viste.ai services for opportunity discovery, automation, knowledge, customer operations, data and custom AI delivery.",
    lead: "We study the process, define a controlled pilot and integrate what proves useful. No generic AI package and no uncontrolled chatbot.",
    sections: overviewSections("en", "services"),
    cta: { label: "Start with an Opportunity Sprint", href: "/services/ai-opportunity-sprint", note: "Turn an important bottleneck into a decision-ready pilot." },
  }),
  page({
    id: "services-overview-es",
    locale: "es",
    path: "/es/servicios",
    alternatePath: "/services",
    eyebrow: "Servicios",
    title: "Implementación de IA que empieza por el negocio",
    description: "Servicios de Viste.ai para diagnóstico, automatización, conocimiento, atención al cliente, datos y desarrollo a medida.",
    lead: "Estudiamos el proceso, definimos un piloto controlado e integramos lo que demuestra utilidad. Sin paquetes genéricos ni chatbots sin control.",
    sections: overviewSections("es", "services"),
    cta: { label: "Empezar con un Sprint", href: "/es/servicios/sprint-oportunidades-ia", note: "Convierte un cuello de botella importante en un piloto listo para decidir." },
  }),
  page({
    id: "solutions-overview-en",
    locale: "en",
    path: "/solutions",
    alternatePath: "/es/soluciones",
    eyebrow: "Solution Blueprints",
    title: "See how a controlled AI system could work",
    description: "Explore practical AI system blueprints for WhatsApp, support, knowledge, documents, hospitality and operations intelligence.",
    lead: "Each blueprint begins with the business problem and makes users, systems, human oversight, metrics and limitations visible.",
    sections: overviewSections("en", "solutions"),
    cta: { label: "Discuss your workflow", href: contact.en, note: "We will determine whether the blueprint fits your systems and constraints." },
  }),
  page({
    id: "solutions-overview-es",
    locale: "es",
    path: "/es/soluciones",
    alternatePath: "/solutions",
    eyebrow: "Diseños de Solución",
    title: "Descubre cómo puede funcionar un sistema de IA controlado",
    description: "Diseños prácticos para WhatsApp, soporte, conocimiento, documentos, hospitalidad e inteligencia operativa.",
    lead: "Cada diseño empieza por el problema y hace visibles usuarios, sistemas, supervisión humana, métricas y límites.",
    sections: overviewSections("es", "solutions"),
    cta: { label: "Cuéntanos tu flujo", href: contact.es, note: "Evaluaremos si el diseño encaja con tus sistemas y restricciones." },
  }),
  page({
    id: "industries-overview-en",
    locale: "en",
    path: "/industries",
    alternatePath: "/es/sectores",
    eyebrow: "Operating contexts",
    title: "Solutions for established, operational businesses",
    description: "AI implementation for IT providers, hospitality, professional services, manufacturing, distribution and multi-location teams.",
    lead: "Viste.ai works best with businesses that have real customers, employees, systems and data—but no internal team dedicated to AI delivery.",
    sections: overviewSections("en", "industries"),
    cta: { label: "Discuss your operating context", href: contact.en, note: "Tell us what work gets stuck and what systems are involved." },
  }),
  page({
    id: "industries-overview-es",
    locale: "es",
    path: "/es/sectores",
    alternatePath: "/industries",
    eyebrow: "Contextos operativos",
    title: "Soluciones para empresas consolidadas y operativas",
    description: "Implementación de IA para proveedores TI, hospitalidad, servicios profesionales, fabricación, distribución y empresas multilocal.",
    lead: "Viste.ai trabaja mejor con empresas que tienen clientes, empleados, sistemas y datos reales, pero no un equipo interno dedicado a IA.",
    sections: overviewSections("es", "industries"),
    cta: { label: "Cuéntanos tu contexto", href: contact.es, note: "Explícanos dónde se atasca el trabajo y qué sistemas intervienen." },
  }),
  page({
    id: "partners-en",
    locale: "en",
    path: "/partners",
    alternatePath: "/es/socios",
    eyebrow: "AI partner programme",
    title: "Bring AI services to your customers without building the entire capability alone",
    description: "White-label, co-delivery and referral support for IT providers, resellers and trusted advisers.",
    lead: "You keep the customer relationship. We help qualify the opportunity, design the system and turn it into a controlled implementation.",
    sections: [
      { title: "A flexible delivery model", paragraphs: ["Engagements may be white-label, co-delivered or referral-led. Discovery, client ownership, commercial terms, support obligations and territories are agreed before work begins."], bullets: ["Joint discovery and solution architecture", "Specialist build and integration support", "Local support by the partner where appropriate", "Wholesale, referral, revenue-share or joint-delivery terms"] },
      { title: "Designed to protect trust", paragraphs: ["The model is intended for providers with established client relationships and a serious delivery posture. No franchise, exclusivity or client-protection claim exists until it is contractually agreed."] },
      { title: "A sensible first engagement", paragraphs: ["Start with one qualified customer problem. We define the roles, run paid discovery and use a controlled pilot to test both the solution and the working relationship."] },
    ],
    cta: { label: "Discuss a partner opportunity", href: contact.en, note: "Share the client profile, problem, timeline and your preferred delivery role." },
  }),
  page({
    id: "partners-es",
    locale: "es",
    path: "/es/socios",
    alternatePath: "/partners",
    eyebrow: "Programa de socios de IA",
    title: "Ofrece servicios de IA sin construir toda la capacidad desde cero",
    description: "Modelo de marca blanca, coentrega o referencia para proveedores de TI, distribuidores y asesores de confianza.",
    lead: "Tú mantienes la relación con el cliente. Nosotros ayudamos a cualificar, diseñar y convertir la oportunidad en una implementación controlada.",
    sections: [
      { title: "Un modelo flexible", paragraphs: ["Los proyectos pueden ser marca blanca, coentrega o referencia. Diagnóstico, propiedad del cliente, condiciones comerciales, soporte y territorios se acuerdan antes de empezar."], bullets: ["Diagnóstico y arquitectura conjuntos", "Construcción e integración especializada", "Soporte local por el socio cuando proceda", "Condiciones mayoristas, de referencia, reparto o coentrega"] },
      { title: "Diseñado para proteger la confianza", paragraphs: ["Está pensado para proveedores con relaciones consolidadas y una postura seria de entrega. No existe franquicia, exclusividad ni protección de cliente hasta acordarlo por contrato."] },
      { title: "Un primer proyecto sensato", paragraphs: ["Empezamos con un problema cualificado, definimos roles, realizamos diagnóstico de pago y usamos un piloto controlado para probar la solución y la colaboración."] },
    ],
    cta: { label: "Hablar sobre una oportunidad", href: contact.es, note: "Comparte el perfil de cliente, problema, plazo y papel que prefieres." },
  }),
  page({
    id: "process-en",
    locale: "en",
    path: "/process",
    alternatePath: "/es/proceso",
    eyebrow: "How we work",
    title: "From business bottleneck to measurable system",
    description: "A five-stage AI implementation process built around discovery, controlled pilots, integration, measurement and human oversight.",
    lead: "Every engagement begins with a rigorous study of the process, systems and objective. We scale only what has a clear operational purpose and a measurable path to value.",
    sections: [
      { title: "01 — Discover", paragraphs: ["Understand the objective, current process, systems, data, users, risks, budget and decision owners."] },
      { title: "02 — Design", paragraphs: ["Define the workflow, architecture, permissions, success measures, exception path and pilot boundaries."] },
      { title: "03 — Pilot", paragraphs: ["Build one controlled implementation around a real workflow and a small, accountable group of users."] },
      { title: "04 — Integrate", paragraphs: ["Connect approved systems and embed ownership, handovers, monitoring and support into operations."] },
      { title: "05 — Measure and scale", paragraphs: ["Compare adoption, response, accuracy, exceptions, cost and business value against the baseline before expanding."] },
    ],
    cta: { label: "Scope an Opportunity Sprint", href: "/services/ai-opportunity-sprint", note: "Start with a decision-ready diagnosis, not a generic demo." },
  }),
  page({
    id: "process-es",
    locale: "es",
    path: "/es/proceso",
    alternatePath: "/process",
    eyebrow: "Cómo trabajamos",
    title: "Del cuello de botella a un sistema medible",
    description: "Un proceso de implementación en cinco etapas: diagnóstico, piloto controlado, integración, medición y supervisión humana.",
    lead: "Cada proyecto comienza con un estudio riguroso del proceso, los sistemas y el objetivo. Escalamos solo lo que tiene una utilidad operativa y un camino medible hacia el valor.",
    sections: [
      { title: "01 — Descubrir", paragraphs: ["Entender objetivo, proceso actual, sistemas, datos, usuarios, riesgos, presupuesto y responsables de decisión."] },
      { title: "02 — Diseñar", paragraphs: ["Definir flujo, arquitectura, permisos, métricas, excepciones y límites del piloto."] },
      { title: "03 — Pilotar", paragraphs: ["Construir una implementación controlada sobre un flujo real y un grupo pequeño de usuarios responsables."] },
      { title: "04 — Integrar", paragraphs: ["Conectar sistemas aprobados e incorporar responsables, traspasos, supervisión y soporte."] },
      { title: "05 — Medir y escalar", paragraphs: ["Comparar adopción, respuesta, precisión, excepciones, coste y valor con la línea base antes de ampliar."] },
    ],
    cta: { label: "Definir un Sprint", href: "/es/servicios/sprint-oportunidades-ia", note: "Empieza con un diagnóstico listo para decidir, no con una demo genérica." },
  }),
  page({
    id: "about-en",
    locale: "en",
    path: "/about",
    alternatePath: "/es/nosotros",
    eyebrow: "About Viste.ai",
    title: "Senior-led AI implementation with operational discipline",
    description: "Viste.ai helps established businesses identify, build and operate useful AI systems with measurable outcomes and human control.",
    lead: "Viste.ai is a senior-led AI implementation company that works directly with established businesses to diagnose operational friction, build controlled systems and make those systems work in day-to-day operations.",
    sections: [
      { title: "What we believe", paragraphs: ["The strongest AI work starts with a business process, not a technology shopping list. Good systems make ownership, evidence, permissions and exceptions visible."], bullets: ["Business understanding before technology", "Paid discovery before major implementation", "Human ownership of consequential decisions", "Measurement and improvement after launch"] },
      { title: "How we operate", paragraphs: ["Senior practitioners stay close to discovery, architecture, implementation and operating handover. We work across countries and systems without inflating the team, geography or credentials behind an engagement."] },
      { title: "Proof, handled responsibly", paragraphs: ["We publish client work, testimonials, results and partnerships only when evidence and permission exist. Until then, we explain our capability through transparent Solution Blueprints."] },
    ],
    cta: { label: "Tell us where work gets stuck", href: contact.en, note: "We will be candid about fit, risk and the right first step." },
  }),
  page({
    id: "about-es",
    locale: "es",
    path: "/es/nosotros",
    alternatePath: "/about",
    eyebrow: "Sobre Viste.ai",
    title: "Implementación de IA dirigida por perfiles senior y disciplina operativa",
    description: "Viste.ai ayuda a empresas consolidadas a identificar, construir y operar sistemas de IA útiles, medibles y con control humano.",
    lead: "Viste.ai es una empresa de implementación de IA dirigida por perfiles senior. Trabajamos directamente con empresas consolidadas para diagnosticar fricción operativa, construir sistemas controlados e integrarlos en la operación diaria.",
    sections: [
      { title: "Lo que creemos", paragraphs: ["La mejor IA empieza por un proceso de negocio, no por una lista de tecnologías. Un buen sistema hace visibles responsables, evidencia, permisos y excepciones."], bullets: ["Entender el negocio antes que la tecnología", "Diagnóstico de pago antes de una gran implementación", "Responsabilidad humana en decisiones relevantes", "Medición y mejora después del lanzamiento"] },
      { title: "Cómo operamos", paragraphs: ["Los perfiles senior permanecen cerca del diagnóstico, la arquitectura, la implementación y el traspaso operativo. Trabajamos entre países y sistemas sin exagerar el equipo, la presencia geográfica o las credenciales de un proyecto."] },
      { title: "Pruebas con responsabilidad", paragraphs: ["Publicamos clientes, testimonios, resultados y alianzas solo con evidencia y permiso. Mientras tanto, explicamos nuestras capacidades mediante Diseños de Solución transparentes."] },
    ],
    cta: { label: "Cuéntanos dónde se atasca el trabajo", href: contact.es, note: "Seremos claros sobre encaje, riesgo y el primer paso adecuado." },
  }),
  page({
    id: "security-en",
    locale: "en",
    path: "/security",
    alternatePath: "/es/seguridad",
    eyebrow: "Security and responsible AI",
    title: "Control is part of the design",
    description: "Viste.ai designs permissions, data boundaries, human oversight, monitoring and exception handling into AI implementations.",
    lead: "No technology makes a system automatically secure or responsible. Controls must reflect the workflow, data, people, systems and risk.",
    sections: [
      { title: "Design principles", paragraphs: ["We define who can access what, which sources are approved, what the system may do, when it must stop and how a person takes over."], bullets: ["Least-privilege access", "Approved and traceable sources", "Human review for consequential actions", "Logging, monitoring and exception ownership"] },
      { title: "Data and vendors", paragraphs: ["Every client implementation requires its own data-flow, processor, regional, retention, API and contractual review. Website lead data is handled separately from client-project data."] },
      { title: "Claims and assurance", paragraphs: ["We avoid absolute security claims. Certifications, penetration tests, availability commitments and regulatory statements apply only when specifically documented for the relevant system or engagement."] },
      { title: "Report a concern", paragraphs: [`For a website or security concern, contact ${publicConfig.legalOperator.securityContact}. Do not send credentials, confidential client data or exploit details through the public contact form.`] },
    ],
    cta: { label: "Discuss your requirements", href: contact.en, note: "Security and oversight are scoped during discovery, not added at the end." },
  }),
  page({
    id: "security-es",
    locale: "es",
    path: "/es/seguridad",
    alternatePath: "/security",
    eyebrow: "Seguridad e IA responsable",
    title: "El control forma parte del diseño",
    description: "Viste.ai incorpora permisos, límites de datos, supervisión humana, monitorización y gestión de excepciones.",
    lead: "Ninguna tecnología hace que un sistema sea automáticamente seguro o responsable. Los controles deben reflejar el flujo, los datos, las personas, los sistemas y el riesgo.",
    sections: [
      { title: "Principios", paragraphs: ["Definimos quién accede a qué, qué fuentes están aprobadas, qué puede hacer el sistema, cuándo debe detenerse y cómo interviene una persona."], bullets: ["Acceso de mínimo privilegio", "Fuentes aprobadas y trazables", "Revisión humana en acciones relevantes", "Registro, monitorización y responsables de excepciones"] },
      { title: "Datos y proveedores", paragraphs: ["Cada implementación requiere su propia revisión de flujos, proveedores, regiones, retención, API y contratos. Los datos de contacto web se separan de los datos de proyecto."] },
      { title: "Afirmaciones y garantías", paragraphs: ["Evitamos afirmaciones absolutas. Certificaciones, pruebas, disponibilidad y declaraciones regulatorias solo aplican cuando están documentadas para el sistema o proyecto."] },
      { title: "Comunicar un problema", paragraphs: [`Para cuestiones de seguridad del sitio, escribe a ${publicConfig.legalOperator.securityContact}. No envíes credenciales, datos confidenciales ni detalles de explotación mediante el formulario público.`] },
    ],
    cta: { label: "Hablar sobre requisitos", href: contact.es, note: "Seguridad y supervisión se definen durante el diagnóstico, no al final." },
  }),
];

export const catalogPages: PageDefinition[] = [
  ...services.flatMap((item) => [catalogItemToPage(item, "en", "Service"), catalogItemToPage(item, "es", "Servicio")]),
  ...solutions.flatMap((item) => [catalogItemToPage(item, "en", "Solution Blueprint"), catalogItemToPage(item, "es", "Diseño de Solución")]),
  ...industries.flatMap((item) => [catalogItemToPage(item, "en", "Industry perspective"), catalogItemToPage(item, "es", "Perspectiva sectorial")]),
];

export const allPages = [...staticPages, ...catalogPages];

export function getPage(path: string): PageDefinition | undefined {
  return allPages.find((entry) => entry.path === path);
}

export function getStaticPaths(locale: Locale): string[][] {
  return allPages
    .filter((entry) => entry.locale === locale)
    .map((entry) => {
      const withoutLocale = locale === "es" ? entry.path.replace(/^\/es\/?/, "") : entry.path.replace(/^\//, "");
      return withoutLocale ? withoutLocale.split("/") : [];
    });
}
