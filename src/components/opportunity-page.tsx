import Link from "next/link";
import type { GrowthPage } from "@/content/growth";
import { publicConfig } from "@/lib/public-config";
import { BookingCta } from "./booking-cta";
import { Breadcrumbs } from "./breadcrumbs";
import { GrowthPageJsonLd } from "./json-ld";
import { OpportunityDiagnostic } from "./opportunity-diagnostic";

const content = {
  en: {
    eyebrow: "Opportunity diagnostic",
    title: "Do I need AI for my business? Start with the problem, not the tool.",
    opening: "You probably do not need “AI” in the abstract. You need to resolve a specific bottleneck: unanswered requests, repetitive administration, hard-to-find information, inconsistent commercial follow-up or decisions made with fragmented data. AI is worth the investment only when it improves that process in a measurable and controllable way.",
    diagnosticCta: "Start the 7-step diagnostic",
    orientationEyebrow: "Fast orientation",
    orientationTitle: "Five signals worth investigating",
    signals: [
      ["Repeated demand", "The same task, request or decision appears often enough to establish a baseline."],
      ["Visible friction", "Waiting, re-keying, searching, handoffs or errors consume material operating time."],
      ["Usable evidence", "Approved records, documents or conversations can support the task."],
      ["Clear ownership", "A person owns the process, its exceptions and the decision to change it."],
      ["Measurable change", "Response, time, accuracy, follow-through or visibility can be compared before and after."],
    ],
    avoidEyebrow: "Where to pause",
    avoidTitle: "What AI should not be used for",
    avoidLead: "A weak process does not become a strong one because a model is added. Define the work first when any of these conditions applies.",
    avoid: [
      "Consequential decisions with no qualified human review",
      "An undefined workflow with no process owner",
      "Poor or unapproved source information",
      "Low-volume one-off work with no repeatable pattern",
      "Unsafe actions that cannot be stopped or reversed",
      "A problem ordinary rules or existing software solve more simply",
    ],
    diagnosticEyebrow: "Useful before contact details",
    diagnosticTitle: "Turn a broad ambition into a testable first hypothesis.",
    diagnosticLead: "Choose short, non-confidential answers. The recommendation is rule-based and shows its assumptions. It does not send your selections to analytics or ask for an email before showing value.",
    matrixEyebrow: "Decision matrix",
    matrixTitle: "Match the bottleneck to the operating pattern",
    matrixHeaders: ["Pattern", "When it may fit", "First design question"],
    matrix: [
      ["Automation", "Repeatable steps, structured inputs and predictable exceptions", "Can rules and handoffs be stated before a model is involved?"],
      ["Knowledge assistant", "People repeatedly search approved policies, procedures or technical material", "Which sources and permissions define an acceptable answer?"],
      ["Customer / WhatsApp operations", "Incoming conversations lack ownership, response visibility or escalation", "Which corporate channel, queue and service target should govern the work?"],
      ["Sales / CRM", "Qualification, notes or follow-up depend on individual memory", "Who owns the relationship and which CRM fields are authoritative?"],
      ["Document operations", "Teams read, extract, validate or route similar documents", "What confidence, validation and exception path is required?"],
      ["Data intelligence", "Operational decisions depend on reconciling fragmented reports", "Who owns each metric definition and source?"],
      ["Not ready yet", "Volume, workflow, data or ownership is still unclear", "What needs to be mapped and measured before choosing technology?"],
    ],
    readinessEyebrow: "Readiness requirements",
    readinessTitle: "A pilot needs more than a promising idea.",
    readiness: ["A specific objective", "A named process owner", "Enough volume to observe", "Approved source data", "Access to the relevant systems", "A human exception path", "Security and privacy constraints", "A current measurable baseline"],
    costEyebrow: "Cost and timing",
    costTitle: "The price follows the workflow and the control burden.",
    costParagraphs: [
      "Cost changes with the number and quality of sources, required integrations, identity and permissions, exception handling, testing, security review, change management and ongoing support. A chat interface alone says very little about the implementation effort behind it.",
      "Timing normally moves through diagnosis, a bounded pilot, controlled integration and measurement. Each phase should have a decision gate. A narrow workflow with accessible systems can move faster than a cross-company process with regulated data, but no responsible estimate exists before the dependencies are known.",
    ],
    costLink: "Model your own planning assumptions",
    controlEyebrow: "Risk and control",
    controlTitle: "Design what the system may do—and when it must stop.",
    controls: [
      ["Permissions", "Use least-privilege access for people, systems and sources."],
      ["Approved sources", "Ground outputs in defined information and expose uncertainty."],
      ["Human review", "Keep qualified people responsible for consequential actions."],
      ["Logging", "Record material actions, approvals, failures and handovers."],
      ["Exception ownership", "Name who receives work the system cannot safely complete."],
      ["Data boundaries", "Minimise collection, retention and unnecessary movement of data."],
    ],
    processEyebrow: "How Viste.ai works",
    processTitle: "Decision before deployment. Evidence before scale.",
    process: [["01", "Opportunity Sprint", "Map the workflow, evidence, controls, value and viable first scope."], ["02", "Controlled pilot", "Test the riskiest assumptions with a bounded group and real operating cases."], ["03", "Integration", "Connect approved systems and make ownership, exceptions and support operational."], ["04", "Measurement", "Compare the result with the baseline and scale only what proves useful."]],
    questionsEyebrow: "Ten practical questions",
    questionsTitle: "What changes the answer",
    questions: [
      ["How do I know whether a process is a good AI candidate?", "Look for repeated volume, visible friction, usable evidence, a process owner and a measurable outcome. If the workflow or exception path is unclear, map it before selecting AI.", "/services/ai-opportunity-sprint", "See the Opportunity Sprint"],
      ["What should I automate first?", "Choose a bounded process where failure is observable and reversible. The best first step is often not the largest process; it is the one that can prove value without creating uncontrolled risk.", "/services/workflow-automation", "Explore workflow automation"],
      ["How much does business AI implementation cost?", "There is no credible universal figure. Integrations, source quality, permissions, testing, controls, adoption and support drive effort. Ask for a scoped diagnosis and phased commercial proposal."],
      ["How long does a first pilot take?", "It depends on access to systems and data, stakeholder availability, security review and the number of exceptions. Define a bounded pilot and decision gates before committing to a date."],
      ["What data does an AI system need?", "Only the approved information needed for the task: governed records, documents or conversations with clear access, quality, retention and ownership. More data is not automatically better."],
      ["Can it connect to our CRM, ERP, email, documents or WhatsApp?", "Often, if supported APIs, licences, permissions and provider terms allow it. Feasibility must be confirmed per system; private employee WhatsApp accounts are outside the corporate workflow."],
      ["Which processes should not be automated?", "Avoid undefined, unsafe or consequential work without review, and one-off tasks where a simple tool is better. Human judgment remains necessary where context or accountability is material."],
      ["How do we reduce errors and invented answers?", "Constrain sources and actions, require citations where useful, validate structured outputs, use confidence and stop rules, test representative cases and make escalation easy."],
      ["How do privacy, GDPR and human control affect the design?", "They shape purpose, data minimisation, lawful access, retention, vendor review, rights, security and the decisions that require a person. Each workflow needs its own review.", "/security", "Review Viste.ai's control principles"],
      ["How is return measured?", "Establish a current baseline for time, response, errors, follow-through or visibility; include operating cost and exceptions; then compare the same measure during the pilot. Released capacity is not automatically cash savings.", "/tools/ai-automation-roi-calculator", "Open the ROI planning calculator"],
    ],
    finalEyebrow: "A sensible next step",
    finalTitle: "Bring one workflow, not an AI shopping list.",
    finalText: "Use the diagnostic to frame the opportunity, then share the process, systems and outcome. We will be candid about fit, dependencies and whether a paid Opportunity Sprint is warranted.",
    contact: "Discuss the workflow",
    review: "Preview draft · Human publication approval required",
  },
  es: {
    eyebrow: "Diagnóstico de oportunidad",
    title: "¿Necesito IA para mi negocio? Empieza por el problema, no por la herramienta.",
    opening: "Probablemente no necesitas “IA” en abstracto. Necesitas resolver un cuello de botella concreto: solicitudes sin atender, trabajo administrativo repetitivo, información difícil de encontrar, seguimiento comercial irregular o decisiones tomadas con datos fragmentados. La IA solo merece la inversión cuando mejora ese proceso de forma medible y controlable.",
    diagnosticCta: "Empezar el diagnóstico de 7 pasos",
    orientationEyebrow: "Orientación rápida",
    orientationTitle: "Cinco señales que merece la pena investigar",
    signals: [
      ["Demanda repetida", "La misma tarea, solicitud o decisión ocurre con frecuencia suficiente para establecer una línea base."],
      ["Fricción visible", "Esperas, búsquedas, traspasos, entradas repetidas o errores consumen tiempo operativo relevante."],
      ["Evidencia utilizable", "Hay registros, documentos o conversaciones aprobados que pueden sostener la tarea."],
      ["Responsabilidad clara", "Una persona es responsable del proceso, sus excepciones y la decisión de cambiarlo."],
      ["Cambio medible", "Respuesta, tiempo, precisión, seguimiento o visibilidad pueden compararse antes y después."],
    ],
    avoidEyebrow: "Cuándo detenerse",
    avoidTitle: "Para qué no conviene utilizar IA",
    avoidLead: "Un proceso débil no se vuelve sólido por añadir un modelo. Primero define el trabajo cuando se dé alguna de estas condiciones.",
    avoid: [
      "Decisiones relevantes sin revisión humana cualificada",
      "Un flujo indefinido sin responsable del proceso",
      "Información fuente deficiente o no aprobada",
      "Tareas puntuales de poco volumen sin patrón repetible",
      "Acciones inseguras que no puedan detenerse o revertirse",
      "Un problema que reglas o software existente resuelven de forma más simple",
    ],
    diagnosticEyebrow: "Valor antes de pedir datos",
    diagnosticTitle: "Convierte una ambición amplia en una primera hipótesis comprobable.",
    diagnosticLead: "Elige respuestas breves y no confidenciales. La recomendación se basa en reglas y muestra sus supuestos. No envía tus selecciones a analítica ni pide un email antes de aportar valor.",
    matrixEyebrow: "Matriz de decisión",
    matrixTitle: "Relaciona el cuello de botella con el patrón operativo",
    matrixHeaders: ["Patrón", "Cuándo puede encajar", "Primera pregunta de diseño"],
    matrix: [
      ["Automatización", "Pasos repetibles, entradas estructuradas y excepciones previsibles", "¿Pueden expresarse reglas y traspasos antes de introducir un modelo?"],
      ["Asistente de conocimiento", "Las personas buscan repetidamente políticas, procedimientos o material técnico aprobado", "¿Qué fuentes y permisos definen una respuesta aceptable?"],
      ["Operaciones de cliente / WhatsApp", "Las conversaciones carecen de responsable, visibilidad de respuesta o escalado", "¿Qué canal corporativo, cola y objetivo de servicio deben gobernar el trabajo?"],
      ["Ventas / CRM", "La cualificación, las notas o el seguimiento dependen de la memoria individual", "¿Quién es responsable de la relación y qué campos del CRM son autoritativos?"],
      ["Operaciones documentales", "El equipo lee, extrae, valida o enruta documentos similares", "¿Qué confianza, validación y ruta de excepción hacen falta?"],
      ["Inteligencia de datos", "Las decisiones dependen de reconciliar informes fragmentados", "¿Quién es responsable de cada definición y fuente?"],
      ["Todavía no preparado", "Volumen, flujo, datos o responsabilidad no están claros", "¿Qué debe mapearse y medirse antes de elegir tecnología?"],
    ],
    readinessEyebrow: "Requisitos de preparación",
    readinessTitle: "Un piloto necesita más que una idea prometedora.",
    readiness: ["Un objetivo específico", "Un responsable del proceso", "Volumen suficiente para observar", "Datos fuente aprobados", "Acceso a los sistemas relevantes", "Una ruta humana para excepciones", "Restricciones de seguridad y privacidad", "Una línea base medible"],
    costEyebrow: "Coste y plazo",
    costTitle: "El precio sigue al flujo y a la carga de control.",
    costParagraphs: [
      "El coste cambia según el número y la calidad de las fuentes, las integraciones, la identidad y los permisos, la gestión de excepciones, las pruebas, la revisión de seguridad, la adopción y el soporte continuo. Una interfaz de chat dice muy poco sobre el esfuerzo real de implementación.",
      "El plazo suele recorrer diagnóstico, piloto acotado, integración controlada y medición. Cada fase debe tener una puerta de decisión. Un flujo estrecho con sistemas accesibles puede avanzar más rápido que un proceso transversal con datos regulados, pero no existe una estimación responsable antes de conocer las dependencias.",
    ],
    costLink: "Modelar mis propios supuestos",
    controlEyebrow: "Riesgo y control",
    controlTitle: "Diseña qué puede hacer el sistema y cuándo debe detenerse.",
    controls: [
      ["Permisos", "Aplica acceso de mínimo privilegio a personas, sistemas y fuentes."],
      ["Fuentes aprobadas", "Basa los resultados en información definida y muestra la incertidumbre."],
      ["Revisión humana", "Mantén a personas cualificadas responsables de acciones relevantes."],
      ["Registro", "Registra acciones materiales, aprobaciones, fallos y traspasos."],
      ["Responsable de excepciones", "Define quién recibe el trabajo que el sistema no puede completar con seguridad."],
      ["Límites de datos", "Minimiza la recopilación, retención y movimiento innecesario de datos."],
    ],
    processEyebrow: "Cómo trabaja Viste.ai",
    processTitle: "Decisión antes del despliegue. Evidencia antes de escalar.",
    process: [["01", "Sprint de Oportunidades", "Mapear flujo, evidencia, controles, valor y un primer alcance viable."], ["02", "Piloto controlado", "Probar las hipótesis más arriesgadas con un grupo acotado y casos operativos reales."], ["03", "Integración", "Conectar sistemas aprobados y hacer operativos responsables, excepciones y soporte."], ["04", "Medición", "Comparar con la línea base y ampliar solo lo que demuestra utilidad."]],
    questionsEyebrow: "Diez preguntas prácticas",
    questionsTitle: "Qué hace cambiar la respuesta",
    questions: [
      ["¿Cómo sé si un proceso es buen candidato para IA?", "Busca volumen repetido, fricción visible, evidencia utilizable, un responsable y un resultado medible. Si el flujo o las excepciones no están claros, conviene mapearlos antes de elegir IA.", "/es/servicios/sprint-oportunidades-ia", "Ver el Sprint de Oportunidades"],
      ["¿Qué debería automatizar primero en mi empresa?", "Elige un proceso acotado donde el fallo sea visible y reversible. El mejor primer paso no siempre es el proceso más grande, sino el que puede demostrar valor sin crear riesgo descontrolado.", "/es/servicios/automatizacion-flujos", "Explorar automatización de flujos"],
      ["¿Cuánto cuesta implementar IA en una empresa?", "No existe una cifra universal creíble. Integraciones, calidad de fuentes, permisos, pruebas, controles, adopción y soporte determinan el esfuerzo. Solicita un diagnóstico acotado y una propuesta por fases."],
      ["¿Cuánto tarda un primer piloto?", "Depende del acceso a sistemas y datos, disponibilidad de responsables, revisión de seguridad y número de excepciones. Define un piloto limitado y puertas de decisión antes de comprometer una fecha."],
      ["¿Qué datos necesita un sistema de IA?", "Solo la información aprobada necesaria para la tarea: registros, documentos o conversaciones gobernados con acceso, calidad, retención y responsables claros. Más datos no significa automáticamente mejor."],
      ["¿Puede conectarse con mi CRM, ERP, email, documentos o WhatsApp?", "A menudo sí, si las API, licencias, permisos y condiciones del proveedor lo permiten. Hay que confirmar cada sistema; las cuentas privadas de WhatsApp de empleados quedan fuera del flujo corporativo."],
      ["¿Qué procesos no debería automatizar?", "Evita trabajo indefinido, inseguro o relevante sin revisión, y tareas puntuales donde una herramienta simple sea mejor. El juicio humano sigue siendo necesario cuando el contexto o la responsabilidad importan."],
      ["¿Cómo se reducen errores y respuestas inventadas?", "Limita fuentes y acciones, exige citas cuando ayuden, valida salidas estructuradas, utiliza reglas de confianza y parada, prueba casos representativos y facilita el escalado."],
      ["¿Cómo afectan la privacidad, el RGPD y el control humano?", "Condicionan finalidad, minimización, acceso legítimo, retención, proveedores, derechos, seguridad y decisiones que requieren una persona. Cada flujo necesita su propia revisión.", "/es/seguridad", "Revisar los principios de control"],
      ["¿Cómo se mide el retorno de una implementación?", "Establece una línea base de tiempo, respuesta, errores, seguimiento o visibilidad; incluye coste operativo y excepciones; y compara la misma medida durante el piloto. La capacidad liberada no es automáticamente ahorro de caja.", "/es/herramientas/calculadora-roi-automatizacion-ia", "Abrir la calculadora de planificación"],
    ],
    finalEyebrow: "Un siguiente paso sensato",
    finalTitle: "Trae un flujo, no una lista de herramientas de IA.",
    finalText: "Utiliza el diagnóstico para formular la oportunidad y después comparte proceso, sistemas y resultado. Seremos claros sobre encaje, dependencias y si procede un Sprint de Oportunidades de pago.",
    contact: "Hablar sobre el flujo",
    review: "Borrador de preview · Requiere aprobación humana para publicación",
  },
} as const;

export function OpportunityPage({ page }: { page: GrowthPage }) {
  const locale = page.locale;
  const c = content[locale];
  const diagnosticId = `diagnostic-${locale}`;
  const roiPath = locale === "es" ? "/es/herramientas/calculadora-roi-automatizacion-ia" : "/tools/ai-automation-roi-calculator";
  const contactPath = locale === "es" ? "/es/contacto" : "/contact";

  return <main className="growth-page"><GrowthPageJsonLd page={page} />
    <section className="page-hero growth-hero"><div className="shell narrow"><Breadcrumbs path={page.path} title={page.title} locale={locale} /><p className="eyebrow">{c.eyebrow}</p><h1>{c.title}</h1><p className="lede growth-answer">{c.opening}</p><a className="button" href={`#${diagnosticId}`}>{c.diagnosticCta}</a><p className="editorial-status">{c.review} · {page.lastReviewed}</p></div></section>

    <section className="shell section growth-section"><p className="eyebrow">{c.orientationEyebrow}</p><h2 className="display-two">{c.orientationTitle}</h2><div className="signal-grid">{c.signals.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="growth-contrast"><div className="shell split"><div><p className="eyebrow">{c.avoidEyebrow}</p><h2>{c.avoidTitle}</h2><p>{c.avoidLead}</p></div><ul className="avoid-list">{c.avoid.map((item) => <li key={item}><span aria-hidden="true">×</span>{item}</li>)}</ul></div></section>

    <section className="shell section diagnostic-section" id={diagnosticId}><div className="section-heading"><div><p className="eyebrow">{c.diagnosticEyebrow}</p><h2 className="display-two">{c.diagnosticTitle}</h2></div><p>{c.diagnosticLead}</p></div><OpportunityDiagnostic locale={locale} bookingUrl={publicConfig.bookingUrl} /></section>

    <section className="shell section growth-section"><p className="eyebrow">{c.matrixEyebrow}</p><h2 className="display-two">{c.matrixTitle}</h2><div className="decision-table-wrap" tabIndex={0} role="region" aria-label={c.matrixTitle}><table className="decision-table"><thead><tr>{c.matrixHeaders.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{c.matrix.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></section>

    <section className="shell section growth-section readiness-section"><div><p className="eyebrow">{c.readinessEyebrow}</p><h2 className="display-two">{c.readinessTitle}</h2></div><ol>{c.readiness.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></section>

    <section className="growth-contrast"><div className="shell cost-layout"><div><p className="eyebrow">{c.costEyebrow}</p><h2>{c.costTitle}</h2></div><div>{c.costParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<Link className="text-link" href={roiPath}>{c.costLink} →</Link></div></div></section>

    <section className="shell section growth-section"><p className="eyebrow">{c.controlEyebrow}</p><h2 className="display-two">{c.controlTitle}</h2><div className="control-grid">{c.controls.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="shell section growth-section"><p className="eyebrow">{c.processEyebrow}</p><h2 className="display-two">{c.processTitle}</h2><div className="growth-process">{c.process.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="shell section question-section"><p className="eyebrow">{c.questionsEyebrow}</p><h2 className="display-two">{c.questionsTitle}</h2><div className="question-list">{c.questions.map(([question, answer, href, label], index) => <details key={question} open={index === 0}><summary><span>{String(index + 1).padStart(2, "0")}</span>{question}<i aria-hidden="true">+</i></summary><div><p>{answer}</p>{href && label ? <Link className="text-link" href={href}>{label} →</Link> : null}</div></details>)}</div></section>

    <section className="shell callout callout-large growth-final"><div><p className="eyebrow">{c.finalEyebrow}</p><h2>{c.finalTitle}</h2><p>{c.finalText}</p></div><Link className="button" href={contactPath}>{c.contact}</Link></section>
    <BookingCta locale={locale} bookingUrl={publicConfig.bookingUrl} source="opportunity_page" fallbackHref={`${contactPath}#contact-form`} />
  </main>;
}
