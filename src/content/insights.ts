import type { Insight, Locale } from "./types";

export const insights: Insight[] = [
  {
    id: "first-use-case",
    path: { en: "/insights/choose-first-ai-use-case", es: "/es/recursos/elegir-primer-caso-uso-ia" },
    title: { en: "How to choose the first AI use case in an established business", es: "Cómo elegir el primer caso de uso de IA en una empresa consolidada" },
    description: { en: "A practical filter for finding a useful, feasible and measurable first AI implementation.", es: "Un filtro práctico para encontrar una primera implementación útil, viable y medible." },
    publishedAt: "2026-08-02",
    readTime: { en: "7 min read", es: "7 min de lectura" },
    sections: {
      en: [
        { title: "Start with repeated friction", paragraphs: ["The best first use case is rarely the most futuristic. Look for work that happens frequently, consumes skilled time, follows recognisable patterns and has an accountable owner. A useful candidate also has enough historical examples to understand normal cases and exceptions.", "Interview the people doing the work. Ask where they wait, re-key information, search for answers, chase approvals or recover from avoidable mistakes. These observations are more valuable than a list of AI features."] },
        { title: "Score value, feasibility and risk together", paragraphs: ["A high-value idea can still be a poor pilot when data is inaccessible, APIs are unavailable or errors could create unacceptable consequences. Score potential use cases on frequency, time/cost impact, customer effect, data readiness, integration effort, exception complexity and control requirements."], bullets: ["Prefer a bounded workflow with a clear start and finish", "Choose measures that exist before the pilot", "Make a human owner responsible for exceptions", "Avoid irreversible actions in the first release"] },
        { title: "Design the smallest credible pilot", paragraphs: ["A pilot should prove whether the operating system works, not just whether a model can produce an impressive answer. Use real but controlled inputs, a small user group and an explicit comparison with the current process.", "If the pilot improves the agreed measures without creating hidden work or unacceptable risk, scale in stages. If it does not, stop or redesign. A disciplined no is a valuable result."] },
      ],
      es: [
        { title: "Empieza por una fricción repetida", paragraphs: ["El mejor primer caso rara vez es el más futurista. Busca trabajo frecuente, que consume tiempo cualificado, sigue patrones reconocibles y tiene un responsable claro. También debe haber suficientes ejemplos históricos para entender casos normales y excepciones.", "Habla con quienes realizan el trabajo. Pregunta dónde esperan, vuelven a introducir datos, buscan respuestas, persiguen aprobaciones o corrigen errores evitables. Estas observaciones valen más que una lista de funciones de IA."] },
        { title: "Valora a la vez utilidad, viabilidad y riesgo", paragraphs: ["Una idea valiosa puede ser un mal piloto si los datos no están disponibles, las API no existen o los errores tendrían consecuencias inaceptables. Evalúa frecuencia, impacto, efecto en clientes, preparación de datos, integración, excepciones y controles."], bullets: ["Prefiere un flujo limitado con inicio y fin claros", "Usa métricas que ya existan antes del piloto", "Asigna un responsable humano de las excepciones", "Evita acciones irreversibles en la primera versión"] },
        { title: "Diseña el piloto creíble más pequeño", paragraphs: ["Un piloto debe demostrar que funciona el sistema operativo, no solo que un modelo produce una respuesta llamativa. Usa entradas reales pero controladas, un grupo pequeño y una comparación explícita con el proceso actual.", "Si mejora las métricas sin crear trabajo oculto o riesgo inaceptable, escala por etapas. Si no, detén o rediseña. Un no disciplinado también aporta valor."] },
      ],
    },
  },
  {
    id: "whatsapp-monitoring",
    path: { en: "/insights/shared-whatsapp-inbox-monitoring", es: "/es/recursos/bandeja-whatsapp-compartida-supervision" },
    title: { en: "What a shared WhatsApp inbox can and cannot monitor", es: "Qué puede y qué no puede supervisar una bandeja compartida de WhatsApp" },
    description: { en: "The operational visibility a corporate WhatsApp workflow can provide—and the boundaries it must respect.", es: "La visibilidad operativa que puede ofrecer un flujo corporativo de WhatsApp y los límites que debe respetar." },
    publishedAt: "2026-08-02",
    readTime: { en: "6 min read", es: "6 min de lectura" },
    sections: {
      en: [
        { title: "Visibility comes from the corporate channel", paragraphs: ["A shared inbox can reliably measure conversations only when messages pass through the connected WhatsApp Business Platform and agents work inside the approved interface. That creates events for receipt, assignment, first response, status changes, handovers and closure.", "It does not provide a legitimate or technically reliable way to inspect employees’ private WhatsApp accounts. A responsible design separates corporate work from personal communication."] },
        { title: "Useful measures need definitions", paragraphs: ["First-response time sounds simple until working hours, bot acknowledgements, reopened conversations and transfers are considered. Define when the clock starts, what counts as a meaningful response, when it pauses and who owns a conversation after handover."], bullets: ["Median first response by queue and period", "Percentage answered within a target", "Unattended conversations and ageing", "Workload, handovers, reopens and escalations"] },
        { title: "AI should assist an accountable workflow", paragraphs: ["AI can classify, retrieve approved information, draft replies and summarise context. It should not conceal who approved a message or take sensitive commercial, identity, payment or safety actions without explicit controls.", "The supervisor view should make automation visible, capture overrides and reveal unanswered questions. That is how the system improves without turning into invisible surveillance or uncontrolled customer communication."] },
      ],
      es: [
        { title: "La visibilidad nace del canal corporativo", paragraphs: ["Una bandeja compartida mide conversaciones de forma fiable cuando pasan por la Plataforma de WhatsApp Business y los agentes trabajan en la interfaz aprobada. Así se registran recepción, asignación, primera respuesta, estados, traspasos y cierre.", "No ofrece una forma legítima ni fiable de inspeccionar cuentas privadas de empleados. Un diseño responsable separa trabajo corporativo y comunicación personal."] },
        { title: "Las métricas necesitan definición", paragraphs: ["El tiempo de primera respuesta parece sencillo hasta considerar horarios, acuses automáticos, reaperturas y transferencias. Hay que definir cuándo empieza el reloj, qué respuesta cuenta, cuándo se pausa y quién es responsable tras un traspaso."], bullets: ["Mediana de primera respuesta por cola", "Porcentaje dentro del objetivo", "Conversaciones desatendidas y antigüedad", "Carga, traspasos, reaperturas y escalados"] },
        { title: "La IA debe asistir a un flujo responsable", paragraphs: ["La IA puede clasificar, recuperar información aprobada, preparar respuestas y resumir contexto. No debe ocultar quién aprueba ni ejecutar acciones sensibles de precio, identidad, pago o seguridad sin controles.", "La supervisión debe mostrar la automatización, registrar cambios y revelar preguntas sin respuesta. Así mejora el sistema sin convertirse en vigilancia invisible ni comunicación sin control."] },
      ],
    },
  },
  {
    id: "knowledge-permissions",
    path: { en: "/insights/knowledge-assistant-permissions-sources", es: "/es/recursos/asistente-conocimiento-permisos-fuentes" },
    title: { en: "How an internal knowledge assistant should handle permissions and sources", es: "Cómo debe gestionar permisos y fuentes un asistente interno de conocimiento" },
    description: { en: "Why citations, access controls and content ownership matter more than a polished chat interface.", es: "Por qué las citas, el control de acceso y la propiedad del contenido importan más que una interfaz llamativa." },
    publishedAt: "2026-08-02",
    readTime: { en: "7 min read", es: "7 min de lectura" },
    sections: {
      en: [
        { title: "Retrieval must respect the source system", paragraphs: ["An employee should not gain access to a restricted policy, client file or board document merely because it was indexed for AI search. Permission-aware retrieval carries identity and access context into every query and filters results before the model sees them.", "Copying everything into one unrestricted index is operationally convenient and often unacceptable. Source owners, access groups and deletion/update behaviour need to be part of the architecture."] },
        { title: "An answer needs evidence", paragraphs: ["Citations let the user inspect where an answer came from, how current it is and whether the source applies to their situation. The system should distinguish quotation, summary, inference and uncertainty rather than presenting every response with equal confidence."], bullets: ["Show title, owner and last-updated context", "Link to the accessible source", "Prefer no answer over unsupported invention", "Capture feedback without exposing sensitive prompts"] },
        { title: "Operate the knowledge, not only the assistant", paragraphs: ["Unanswered questions reveal missing, conflicting or outdated documentation. Assign those gaps to content owners and measure how quickly they are resolved.", "A useful knowledge assistant is therefore partly a governance programme: approved sources, review cycles, permissions, ownership and feedback. The conversational interface is the visible layer, not the whole system."] },
      ],
      es: [
        { title: "La recuperación debe respetar el sistema de origen", paragraphs: ["Un empleado no debe acceder a una política restringida, archivo de cliente o documento del consejo solo porque se indexó para búsqueda con IA. La recuperación consciente de permisos usa identidad y acceso en cada consulta y filtra antes de que el modelo vea el contenido.", "Copiar todo a un índice sin restricciones es cómodo y a menudo inaceptable. Responsables, grupos de acceso y comportamiento de actualización o borrado forman parte de la arquitectura."] },
        { title: "Una respuesta necesita evidencia", paragraphs: ["Las citas permiten revisar de dónde viene una respuesta, su vigencia y si la fuente aplica. El sistema debe distinguir cita, resumen, inferencia e incertidumbre en vez de mostrar todo con la misma confianza."], bullets: ["Mostrar título, responsable y fecha", "Enlazar a la fuente accesible", "Preferir no responder antes que inventar", "Recoger feedback sin exponer preguntas sensibles"] },
        { title: "Opera el conocimiento, no solo el asistente", paragraphs: ["Las preguntas sin respuesta revelan documentación ausente, contradictoria o anticuada. Esos vacíos deben asignarse a responsables y medirse.", "Un asistente útil es también un programa de gobierno: fuentes, revisiones, permisos, propiedad y feedback. La conversación es la capa visible, no todo el sistema."] },
      ],
    },
  },
  {
    id: "pilot-production",
    path: { en: "/insights/why-ai-pilots-fail-production", es: "/es/recursos/por-que-fallan-pilotos-ia-produccion" },
    title: { en: "Why AI pilots fail between prototype and production", es: "Por qué los pilotos de IA fallan entre el prototipo y producción" },
    description: { en: "The operational work that separates an impressive demo from a dependable business system.", es: "El trabajo operativo que separa una demo impresionante de un sistema empresarial fiable." },
    publishedAt: "2026-08-02",
    readTime: { en: "8 min read", es: "8 min de lectura" },
    sections: {
      en: [
        { title: "The demo proves the easy part", paragraphs: ["A prototype usually demonstrates that a model can respond to a curated example. Production must handle identity, permissions, bad input, unavailable systems, latency, cost, version changes, monitoring, support and exceptions every day.", "When the pilot ignores those conditions, its apparent accuracy is not the same as operational reliability."] },
        { title: "Ownership and integration are common gaps", paragraphs: ["A useful output still fails if nobody owns the queue, source documents are outdated, CRM fields are ambiguous or staff continue working outside the new process. Integration is as much about operating roles and incentives as APIs."], bullets: ["Name a business owner and technical owner", "Baseline the old process", "Design exception and rollback paths", "Budget for training, monitoring and improvement"] },
        { title: "Scale evidence, not enthusiasm", paragraphs: ["Use a controlled group, real workflow and pre-agreed measures. Track hidden manual work as well as visible speed. Review failure modes with the people affected.", "Production readiness means the system can be operated, supported, audited and stopped—not simply that stakeholders liked the demonstration."] },
      ],
      es: [
        { title: "La demo demuestra la parte fácil", paragraphs: ["Un prototipo suele demostrar que el modelo responde a un ejemplo preparado. Producción debe gestionar identidad, permisos, entradas defectuosas, sistemas caídos, latencia, coste, cambios, monitorización, soporte y excepciones cada día.", "Si el piloto ignora esas condiciones, su precisión aparente no equivale a fiabilidad operativa."] },
        { title: "Propiedad e integración suelen fallar", paragraphs: ["Una buena salida no sirve si nadie gestiona la cola, las fuentes están anticuadas, los campos del CRM son ambiguos o el equipo sigue fuera del nuevo proceso. Integrar también implica roles e incentivos, no solo API."], bullets: ["Nombrar responsable de negocio y técnico", "Medir el proceso anterior", "Diseñar excepciones y reversión", "Presupuestar formación, monitorización y mejora"] },
        { title: "Escala la evidencia, no el entusiasmo", paragraphs: ["Usa un grupo controlado, un flujo real y métricas acordadas. Mide también el trabajo manual oculto y revisa fallos con las personas afectadas.", "Estar listo para producción significa poder operar, mantener, auditar y detener el sistema, no solo gustar en una demo."] },
      ],
    },
  },
  {
    id: "white-label",
    path: { en: "/insights/white-label-ai-it-providers", es: "/es/recursos/ia-marca-blanca-proveedores-ti" },
    title: { en: "White-label AI delivery for IT providers and resellers", es: "Entrega de IA de marca blanca para proveedores de TI" },
    description: { en: "A practical model for adding AI capability while protecting client relationships and delivery quality.", es: "Un modelo práctico para añadir capacidad de IA protegiendo relaciones y calidad." },
    publishedAt: "2026-08-02",
    readTime: { en: "6 min read", es: "6 min de lectura" },
    sections: {
      en: [
        { title: "Start with role clarity", paragraphs: ["A partner model works when customer ownership, discovery, architecture, build, support and commercial responsibility are explicit. Ambiguity creates duplicated communication and leaves critical issues unowned.", "Decide whether the specialist is invisible, co-branded or introduced directly. Then make escalation and change-control routes match that promise."] },
        { title: "Protect the client and the partner", paragraphs: ["Client protection, confidentiality, territories, reuse of intellectual property, support response and exit arrangements belong in a written agreement. Calling an informal relationship a partnership does not create those protections."], bullets: ["Shared qualification criteria", "Named commercial and delivery owners", "Transparent dependencies and limitations", "Agreed support and handover model"] },
        { title: "Prove the model with one project", paragraphs: ["A paid Opportunity Sprint creates a low-risk way to test how both organisations work. It produces a pilot scope and exposes gaps in data, systems, budget or decision-making before a large commitment.", "After successful delivery, convert what was learned into reusable playbooks without pretending every customer has the same process."] },
      ],
      es: [
        { title: "Empieza por roles claros", paragraphs: ["Un modelo de socios funciona cuando propiedad del cliente, diagnóstico, arquitectura, construcción, soporte y responsabilidad comercial son explícitos. La ambigüedad duplica comunicación y deja problemas sin dueño.", "Decide si el especialista es invisible, compartido o presentado directamente y alinea escalado y cambios con esa promesa."] },
        { title: "Protege al cliente y al socio", paragraphs: ["Protección de cliente, confidencialidad, territorios, propiedad intelectual, soporte y salida deben estar por escrito. Llamar alianza a una relación informal no crea esas protecciones."], bullets: ["Criterios compartidos de cualificación", "Responsables comerciales y de entrega", "Dependencias y límites transparentes", "Modelo de soporte y traspaso acordado"] },
        { title: "Prueba el modelo con un proyecto", paragraphs: ["Un Sprint de pago permite probar cómo colaboran ambas organizaciones. Produce el alcance del piloto y descubre carencias de datos, sistemas, presupuesto o decisión antes de un compromiso grande.", "Tras entregar bien, convierte el aprendizaje en guías reutilizables sin asumir que todos los clientes tienen el mismo proceso."] },
      ],
    },
  },
  {
    id: "hospitality-automation",
    path: { en: "/insights/ai-hospitality-property-operations", es: "/es/recursos/ia-hospitalidad-operaciones-propiedades" },
    title: { en: "AI automation in hospitality and property operations", es: "Automatización con IA en hospitalidad y operaciones de propiedades" },
    description: { en: "Where automation can help guest and property teams—and where operational control remains essential.", es: "Dónde puede ayudar la automatización y dónde sigue siendo esencial el control operativo." },
    publishedAt: "2026-08-02",
    readTime: { en: "7 min read", es: "7 min de lectura" },
    sections: {
      en: [
        { title: "Routine information is a strong starting point", paragraphs: ["Arrival instructions, approved property information, common troubleshooting and service-request capture are frequent and structured enough to benefit from assistance. Multilingual delivery can improve consistency when the source content is controlled.", "The system must know which property, reservation stage and approved information apply. A generic answer that is right for another location can still create a serious failure."] },
        { title: "Physical-world actions change the risk", paragraphs: ["Access codes, identity checks, payments, safety issues and emergency responses require deterministic rules, secure integrations and accountable escalation. A generative response is not a substitute for an access-control or emergency system."], bullets: ["Separate information from action", "Confirm identity and stay context", "Route sensitive requests to staff", "Log handovers and completion"] },
        { title: "Measure the operation end to end", paragraphs: ["Do not judge the system only by conversations contained by AI. Measure response time, repeated contacts, escalation completion, staff effort, guest outcomes and any new failure modes.", "Hospitality automation works when it reduces repetitive load while making accountability clearer—not when it hides unresolved service behind a chatbot."] },
      ],
      es: [
        { title: "La información rutinaria es un buen comienzo", paragraphs: ["Instrucciones de llegada, información aprobada, ayuda común y registro de solicitudes son frecuentes y estructurados. La atención multilingüe mejora coherencia si la fuente está controlada.", "El sistema debe conocer propiedad, etapa de reserva e información aplicable. Una respuesta correcta para otro alojamiento puede causar un fallo serio."] },
        { title: "Las acciones físicas cambian el riesgo", paragraphs: ["Códigos de acceso, identidad, pagos, seguridad y emergencias requieren reglas deterministas, integraciones seguras y escalado responsable. Una respuesta generativa no sustituye un sistema de acceso o emergencia."], bullets: ["Separar información y acción", "Confirmar identidad y estancia", "Escalar solicitudes sensibles", "Registrar traspaso y resolución"] },
        { title: "Mide toda la operación", paragraphs: ["No evalúes solo conversaciones resueltas por IA. Mide respuesta, contactos repetidos, escalados, esfuerzo, resultado para el huésped y nuevos fallos.", "La automatización funciona cuando reduce carga y aclara responsabilidad, no cuando oculta servicio pendiente detrás de un chatbot."] },
      ],
    },
  },
  {
    id: "measure-value",
    path: { en: "/insights/measure-ai-implementation-value", es: "/es/recursos/medir-valor-implementacion-ia" },
    title: { en: "A practical framework for measuring AI implementation value", es: "Un marco práctico para medir el valor de una implementación de IA" },
    description: { en: "Measure operational value without relying on invented ROI or vanity model metrics.", es: "Mide valor operativo sin depender de ROI inventado o métricas superficiales del modelo." },
    publishedAt: "2026-08-02",
    readTime: { en: "7 min read", es: "7 min de lectura" },
    sections: {
      en: [
        { title: "Build a baseline first", paragraphs: ["Value cannot be demonstrated when the current process is unknown. Before changing it, measure volume, cycle time, waiting, manual touches, error/rework, escalation, customer effect and operating cost over a representative period.", "A baseline also reveals normal variation. Without it, a busy or quiet month can be mistaken for the effect of AI."] },
        { title: "Use a balanced scorecard", paragraphs: ["Speed alone can hide lower quality, extra review or frustrated customers. Combine efficiency, quality, adoption, risk and economic measures so improvement in one area is not purchased with invisible damage elsewhere."], bullets: ["Efficiency: time, touches and throughput", "Quality: accuracy, rework and outcome", "Adoption: active use and override patterns", "Risk: exceptions, incidents and control performance", "Economics: total cost and capacity released"] },
        { title: "Attribute conservatively", paragraphs: ["Compare a controlled group or period where practical, record other process changes and include the cost of integration, supervision, support and model usage. Capacity released is not automatically cash saved unless the business can redeploy it.", "The most credible result may be faster service, better visibility or lower risk rather than a dramatic ROI percentage. Report what the evidence supports."] },
      ],
      es: [
        { title: "Crea primero una línea base", paragraphs: ["No se puede demostrar valor si se desconoce el proceso actual. Mide volumen, ciclo, espera, intervenciones, errores, escalados, efecto en clientes y coste durante un periodo representativo.", "La línea base muestra variación normal. Sin ella, un mes intenso o tranquilo puede confundirse con el efecto de la IA."] },
        { title: "Usa un cuadro equilibrado", paragraphs: ["La velocidad puede ocultar menor calidad, más revisión o clientes frustrados. Combina eficiencia, calidad, adopción, riesgo y economía para no comprar una mejora con daño invisible."], bullets: ["Eficiencia: tiempo, intervenciones y volumen", "Calidad: precisión, reproceso y resultado", "Adopción: uso y correcciones", "Riesgo: excepciones, incidentes y controles", "Economía: coste total y capacidad liberada"] },
        { title: "Atribuye con prudencia", paragraphs: ["Compara grupos o periodos controlados, registra otros cambios e incluye integración, supervisión, soporte y uso del modelo. Capacidad liberada no equivale automáticamente a ahorro en efectivo.", "El resultado más creíble puede ser mejor servicio, visibilidad o menor riesgo en lugar de un porcentaje espectacular. Informa solo lo que respalda la evidencia."] },
      ],
    },
  },
  {
    id: "human-oversight",
    path: { en: "/insights/human-oversight-customer-service-automation", es: "/es/recursos/supervision-humana-automatizacion-atencion" },
    title: { en: "Human oversight in customer-service automation", es: "Supervisión humana en la automatización de atención al cliente" },
    description: { en: "Design escalation, approval and accountability as part of the workflow—not as a disclaimer.", es: "Diseña escalado, aprobación y responsabilidad como parte del flujo, no como una nota legal." },
    publishedAt: "2026-08-02",
    readTime: { en: "6 min read", es: "6 min de lectura" },
    sections: {
      en: [
        { title: "Oversight needs an operating design", paragraphs: ["Saying that a human is ‘in the loop’ is not enough. Define which cases require approval, who receives them, what context they see, how quickly they must respond and what happens when nobody is available.", "The system should make automated and human actions distinguishable and retain the information needed to review them."] },
        { title: "Escalate by consequence, not only confidence", paragraphs: ["A confident model can still be wrong, and a low-confidence answer can be harmless. Escalation should consider the action’s consequence, customer vulnerability, policy sensitivity, financial impact, safety and reversibility as well as model confidence."], bullets: ["Never automate commitments outside approved policy", "Require review for identity, payment, safety and legal matters", "Let staff correct sources and classifications", "Monitor overrides and repeated escalation causes"] },
        { title: "Give people authority and time", paragraphs: ["Oversight fails when staff are accountable but cannot see context, change the answer, pause automation or correct the underlying knowledge. It also fails when queues exceed available capacity.", "Design workload and service targets with the human path included. Responsible automation makes good judgement easier to exercise; it does not merely transfer liability to an overwhelmed agent."] },
      ],
      es: [
        { title: "La supervisión necesita diseño operativo", paragraphs: ["Decir que hay una persona ‘en el circuito’ no basta. Define qué casos requieren aprobación, quién los recibe, qué contexto ve, cuánto tiempo tiene y qué ocurre si nadie está disponible.", "El sistema debe diferenciar acciones automáticas y humanas y conservar información para revisarlas."] },
        { title: "Escala por consecuencia, no solo por confianza", paragraphs: ["Un modelo seguro de sí mismo puede equivocarse y una respuesta de baja confianza puede ser inocua. El escalado considera consecuencia, vulnerabilidad, política, impacto financiero, seguridad y reversibilidad además de la confianza."], bullets: ["No automatizar compromisos fuera de política", "Revisar identidad, pagos, seguridad y asuntos legales", "Permitir corregir fuentes y clasificaciones", "Supervisar cambios y causas repetidas"] },
        { title: "Da autoridad y tiempo a las personas", paragraphs: ["La supervisión falla si el equipo es responsable pero no ve contexto, no puede cambiar la respuesta, detener la automatización o corregir el conocimiento. También falla si la cola supera la capacidad.", "Diseña carga y objetivos incluyendo el camino humano. La automatización responsable facilita el buen criterio; no transfiere responsabilidad a un agente saturado."] },
      ],
    },
  },
];

export function getInsight(path: string): { insight: Insight; locale: Locale } | undefined {
  for (const insight of insights) {
    if (insight.path.en === path) return { insight, locale: "en" };
    if (insight.path.es === path) return { insight, locale: "es" };
  }
  return undefined;
}
