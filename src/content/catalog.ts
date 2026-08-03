import type { CatalogItem, Locale } from "./types";

export const services: CatalogItem[] = [
  {
    id: "opportunity-sprint",
    path: { en: "/services/ai-opportunity-sprint", es: "/es/servicios/sprint-oportunidades-ia" },
    title: { en: "AI Opportunity Sprint", es: "Sprint de Oportunidades de IA" },
    description: {
      en: "A paid discovery engagement that identifies where AI can create measurable operational value before major implementation begins.",
      es: "Un proceso de diagnóstico de pago que identifica dónde puede crear valor operativo la IA antes de iniciar una implementación importante.",
    },
    problem: {
      en: "Teams often begin with a model or vendor before agreeing on the process, data, users, risk and definition of success.",
      es: "Muchas empresas empiezan por un modelo o proveedor antes de definir el proceso, los datos, los usuarios, el riesgo y el criterio de éxito.",
    },
    approach: {
      en: ["Interview process owners and users", "Map systems, data and constraints", "Prioritise use cases by value, feasibility and risk", "Define a controlled pilot and implementation roadmap"],
      es: ["Entrevistar a responsables y usuarios", "Mapear sistemas, datos y restricciones", "Priorizar casos por valor, viabilidad y riesgo", "Definir un piloto controlado y una hoja de ruta"],
    },
    outcomes: {
      en: ["AI opportunity map", "Prioritised business cases", "Solution architecture", "Pilot scope, success measures and commercial proposal"],
      es: ["Mapa de oportunidades de IA", "Casos priorizados", "Arquitectura de solución", "Alcance del piloto, métricas y propuesta comercial"],
    },
    guardrail: {
      en: "The Sprint is a paid engagement, not an open-ended free consultation. Its purpose is to reduce delivery risk and prevent unnecessary technology spend.",
      es: "El Sprint es un servicio de pago, no una consultoría gratuita sin límites. Su objetivo es reducir el riesgo y evitar inversión tecnológica innecesaria.",
    },
    metrics: { en: ["Decision clarity", "Estimated implementation effort", "Risk coverage", "Pilot readiness"], es: ["Claridad de decisión", "Esfuerzo estimado", "Cobertura de riesgos", "Preparación del piloto"] },
  },
  {
    id: "customer-service-whatsapp",
    path: { en: "/services/customer-service-whatsapp", es: "/es/servicios/atencion-cliente-whatsapp" },
    title: { en: "Customer Service and WhatsApp Operations", es: "Atención al Cliente y Operaciones de WhatsApp" },
    description: {
      en: "Turn corporate conversations into an accountable workflow with ownership, response visibility and controlled AI assistance.",
      es: "Convierte conversaciones corporativas en un flujo controlado con responsables, visibilidad de respuesta y asistencia de IA.",
    },
    problem: {
      en: "Customer conversations are fragmented across inboxes, response ownership is unclear and supervisors cannot see who is waiting.",
      es: "Las conversaciones están fragmentadas, la responsabilidad no está clara y los supervisores no saben qué cliente sigue esperando.",
    },
    approach: {
      en: ["Connect an approved corporate channel", "Define queues, assignment and escalation", "Ground drafts in approved knowledge", "Add supervisor views and audit history"],
      es: ["Conectar un canal corporativo aprobado", "Definir colas, asignación y escalado", "Basar borradores en conocimiento aprobado", "Añadir supervisión e historial de auditoría"],
    },
    outcomes: {
      en: ["Shared operational inbox", "Faster, more consistent responses", "Clear ownership and handovers", "Visibility into unanswered conversations"],
      es: ["Bandeja operativa compartida", "Respuestas más rápidas y coherentes", "Responsabilidad y traspasos claros", "Visibilidad de conversaciones sin respuesta"],
    },
    guardrail: {
      en: "Monitoring applies only to conversations handled through the connected corporate platform or shared inbox. Viste.ai does not monitor private employee WhatsApp accounts.",
      es: "La supervisión se limita a conversaciones gestionadas en la plataforma corporativa conectada. Viste.ai no supervisa cuentas privadas de WhatsApp de empleados.",
    },
    metrics: { en: ["Median first-response time", "Answered within target", "Unattended conversations", "Escalation and reopen rate"], es: ["Mediana de primera respuesta", "Respuestas dentro del objetivo", "Conversaciones desatendidas", "Tasa de escalado y reapertura"] },
  },
  {
    id: "knowledge-assistants",
    path: { en: "/services/knowledge-assistants", es: "/es/servicios/asistentes-conocimiento" },
    title: { en: "Internal Knowledge Assistants", es: "Asistentes Internos de Conocimiento" },
    description: {
      en: "Help employees find grounded answers in approved information with sources, permissions and feedback loops.",
      es: "Ayuda a los equipos a encontrar respuestas basadas en información aprobada, con fuentes, permisos y retroalimentación.",
    },
    problem: {
      en: "Policies, procedures and technical knowledge are scattered across documents and tools, making reliable answers slow to find.",
      es: "Políticas, procedimientos y conocimiento técnico están dispersos, lo que dificulta encontrar respuestas fiables.",
    },
    approach: {
      en: ["Inventory trusted sources", "Design permission-aware retrieval", "Require citations and uncertainty handling", "Measure unanswered questions and feedback"],
      es: ["Inventariar fuentes fiables", "Diseñar recuperación respetando permisos", "Exigir citas y gestionar incertidumbre", "Medir preguntas sin respuesta y feedback"],
    },
    outcomes: {
      en: ["Faster knowledge access", "Consistent policy guidance", "Better onboarding support", "A visible knowledge-gap backlog"],
      es: ["Acceso más rápido al conocimiento", "Orientación coherente", "Mejor apoyo a la incorporación", "Lista visible de vacíos de conocimiento"],
    },
    guardrail: {
      en: "The assistant answers only from approved sources and access scopes. High-impact decisions remain with qualified people.",
      es: "El asistente responde solo con fuentes y permisos aprobados. Las decisiones de alto impacto siguen en manos de personas cualificadas.",
    },
    metrics: { en: ["Answer acceptance", "Source coverage", "Escalation rate", "Time to answer"], es: ["Aceptación de respuestas", "Cobertura de fuentes", "Tasa de escalado", "Tiempo de respuesta"] },
  },
  {
    id: "workflow-automation",
    path: { en: "/services/workflow-automation", es: "/es/servicios/automatizacion-flujos" },
    title: { en: "Workflow and Document Automation", es: "Automatización de Flujos y Documentos" },
    description: {
      en: "Reduce repetitive administration with extraction, validation, routing and exception handling built around the real process.",
      es: "Reduce tareas administrativas repetitivas con extracción, validación, enrutamiento y gestión de excepciones.",
    },
    problem: {
      en: "Teams re-key information from emails, PDFs and forms, then chase approvals across disconnected systems.",
      es: "Los equipos vuelven a introducir datos de emails, PDF y formularios y persiguen aprobaciones entre sistemas desconectados.",
    },
    approach: {
      en: ["Map the current process and exceptions", "Classify and extract structured data", "Validate against business rules", "Route approvals and update target systems"],
      es: ["Mapear el proceso y sus excepciones", "Clasificar y extraer datos estructurados", "Validar con reglas de negocio", "Enrutar aprobaciones y actualizar sistemas"],
    },
    outcomes: {
      en: ["Less manual entry", "Faster cycle times", "Consistent validation", "Auditable exception handling"],
      es: ["Menos entrada manual", "Ciclos más rápidos", "Validación coherente", "Excepciones auditables"],
    },
    guardrail: {
      en: "Automation stops or requests review when required fields, confidence or rules are not satisfied.",
      es: "La automatización se detiene o solicita revisión cuando faltan datos, confianza o reglas necesarias.",
    },
    metrics: { en: ["Cycle time", "Manual touches", "Exception rate", "Rework and error rate"], es: ["Tiempo de ciclo", "Intervenciones manuales", "Tasa de excepciones", "Errores y reprocesos"] },
  },
  {
    id: "sales-crm-automation",
    path: { en: "/services/sales-crm-automation", es: "/es/servicios/automatizacion-ventas-crm" },
    title: { en: "Sales and CRM Automation", es: "Automatización de Ventas y CRM" },
    description: {
      en: "Improve lead handling and follow-through while keeping commercial ownership with the sales team.",
      es: "Mejora la gestión y el seguimiento de oportunidades manteniendo la responsabilidad comercial en el equipo de ventas.",
    },
    problem: {
      en: "Context is lost between channels, CRM updates arrive late and valuable follow-up depends on individual memory.",
      es: "El contexto se pierde entre canales, el CRM se actualiza tarde y el seguimiento depende de la memoria individual.",
    },
    approach: {
      en: ["Define qualification and ownership rules", "Summarise approved conversations", "Draft follow-up and next actions", "Synchronise structured CRM fields"],
      es: ["Definir reglas de cualificación y propiedad", "Resumir conversaciones aprobadas", "Preparar seguimiento y próximas acciones", "Sincronizar campos estructurados del CRM"],
    },
    outcomes: {
      en: ["Faster lead response", "Cleaner CRM data", "More consistent follow-up", "Better pipeline visibility"],
      es: ["Respuesta más rápida", "Datos de CRM más limpios", "Seguimiento coherente", "Mejor visibilidad del pipeline"],
    },
    guardrail: {
      en: "AI can prepare and prioritise; salespeople approve commitments, pricing and relationship-sensitive communication.",
      es: "La IA puede preparar y priorizar; el equipo comercial aprueba compromisos, precios y comunicación sensible.",
    },
    metrics: { en: ["Speed to lead", "CRM completeness", "Follow-up completion", "Qualified conversion"], es: ["Velocidad de respuesta", "Completitud del CRM", "Seguimientos completados", "Conversión cualificada"] },
  },
  {
    id: "data-intelligence",
    path: { en: "/services/data-intelligence", es: "/es/servicios/inteligencia-datos" },
    title: { en: "Data and Decision Intelligence", es: "Datos e Inteligencia para Decisiones" },
    description: {
      en: "Turn fragmented operational data into governed metrics, clear management views and useful exception signals.",
      es: "Convierte datos operativos fragmentados en métricas gobernadas, vistas de gestión y señales útiles de excepción.",
    },
    problem: {
      en: "Leaders spend time reconciling spreadsheets and reports yet still lack a trusted view of operational performance.",
      es: "Los responsables dedican tiempo a reconciliar hojas e informes sin obtener una visión fiable del rendimiento.",
    },
    approach: {
      en: ["Agree metric definitions and ownership", "Connect approved sources", "Model quality and lineage", "Deliver views, alerts and narrative summaries"],
      es: ["Acordar definiciones y responsables", "Conectar fuentes aprobadas", "Modelar calidad y trazabilidad", "Crear vistas, alertas y resúmenes"],
    },
    outcomes: {
      en: ["One governed KPI layer", "Faster exception detection", "Less manual reporting", "Clearer planning conversations"],
      es: ["Una capa gobernada de KPI", "Detección más rápida de excepciones", "Menos reporting manual", "Mejor conversación de planificación"],
    },
    guardrail: {
      en: "Natural-language answers are constrained to governed metrics and show definition, period and source context.",
      es: "Las respuestas en lenguaje natural se limitan a métricas gobernadas y muestran definición, periodo y fuente.",
    },
    metrics: { en: ["Reporting effort", "Data freshness", "Exception response time", "Metric reconciliation"], es: ["Esfuerzo de reporting", "Actualización de datos", "Respuesta a excepciones", "Conciliación de métricas"] },
  },
  {
    id: "custom-ai-development",
    path: { en: "/services/custom-ai-development", es: "/es/servicios/desarrollo-ia-medida" },
    title: { en: "Custom AI Products and Integrations", es: "Productos e Integraciones de IA a Medida" },
    description: {
      en: "Design focused applications, agents and integrations when the use case does not fit an off-the-shelf product.",
      es: "Diseñamos aplicaciones, agentes e integraciones específicas cuando el caso no encaja en una solución estándar.",
    },
    problem: {
      en: "Important workflows often cross proprietary systems, permission boundaries and commercial rules that generic tools cannot handle safely.",
      es: "Los procesos importantes cruzan sistemas propios, permisos y reglas comerciales que una herramienta genérica no gestiona bien.",
    },
    approach: {
      en: ["Prototype the riskiest assumption first", "Use existing systems where practical", "Design permissions and observability", "Release in controlled stages"],
      es: ["Probar primero la hipótesis más arriesgada", "Aprovechar sistemas existentes", "Diseñar permisos y observabilidad", "Desplegar por etapas controladas"],
    },
    outcomes: {
      en: ["Fit-for-process capability", "Controlled integration", "Clear ownership and support", "A maintainable path to scale"],
      es: ["Capacidad adaptada al proceso", "Integración controlada", "Responsabilidad y soporte claros", "Camino mantenible para escalar"],
    },
    guardrail: {
      en: "Every integration depends on discovery, API availability, licensing, security review and the client's change-management capacity.",
      es: "Toda integración depende del diagnóstico, disponibilidad de API, licencias, seguridad y capacidad de cambio del cliente.",
    },
    metrics: { en: ["Adoption", "Reliability", "Exception recovery", "Total operating cost"], es: ["Adopción", "Fiabilidad", "Recuperación de excepciones", "Coste operativo total"] },
  },
];

export const solutions: CatalogItem[] = [
  {
    id: "whatsapp-control",
    path: { en: "/solutions/whatsapp-sales-service-control", es: "/es/soluciones/control-ventas-servicio-whatsapp" },
    title: { en: "WhatsApp Sales and Service Control", es: "Control de Ventas y Servicio por WhatsApp" },
    description: { en: "Know who answered, how long it took and which customer is still waiting.", es: "Sabe quién respondió, cuánto tardó y qué cliente sigue esperando." },
    problem: { en: "A company receives valuable conversations through WhatsApp but cannot reliably assign ownership or measure service.", es: "La empresa recibe conversaciones valiosas por WhatsApp, pero no puede asignarlas ni medir el servicio con fiabilidad." },
    approach: { en: ["Corporate WhatsApp Business Platform", "Shared inbox and agent permissions", "Assignment, status and escalation workflow", "Controlled drafts, summaries and CRM handoff"], es: ["Plataforma corporativa de WhatsApp Business", "Bandeja compartida y permisos", "Asignación, estados y escalado", "Borradores controlados, resúmenes y conexión con CRM"] },
    outcomes: { en: ["Operational ownership", "Response-time visibility", "Unanswered-message alerts", "Supervisor reporting"], es: ["Responsabilidad operativa", "Visibilidad de tiempos", "Alertas de mensajes pendientes", "Informes de supervisión"] },
    guardrail: { en: "This blueprint covers the connected corporate platform, never private employee accounts. API access and provider terms must be confirmed.", es: "Este diseño cubre la plataforma corporativa conectada, nunca cuentas privadas. Deben confirmarse API y condiciones del proveedor." },
    metrics: { en: ["Median first response", "Answered within target", "Unattended conversations", "Workload and escalations"], es: ["Mediana de primera respuesta", "Respuesta dentro del objetivo", "Conversaciones pendientes", "Carga y escalados"] },
  },
  {
    id: "support-desk",
    path: { en: "/solutions/ai-support-desk", es: "/es/soluciones/soporte-tecnico-ia" },
    title: { en: "AI Support Desk Copilot", es: "Copiloto de Soporte Técnico con IA" },
    description: { en: "Help support teams classify, investigate and answer with approved knowledge and human ownership.", es: "Ayuda a soporte a clasificar, investigar y responder con conocimiento aprobado y responsabilidad humana." },
    problem: { en: "Support specialists repeatedly search the same systems while SLAs and handovers depend on fragmented context.", es: "Los especialistas buscan repetidamente en los mismos sistemas mientras los SLA y traspasos dependen de contexto fragmentado." },
    approach: { en: ["Classify incoming tickets", "Retrieve relevant approved guidance", "Draft response with sources", "Summarise, hand over and flag SLA risk"], es: ["Clasificar tickets", "Recuperar orientación aprobada", "Redactar con fuentes", "Resumir, transferir y alertar riesgo de SLA"] },
    outcomes: { en: ["Faster investigation", "Consistent troubleshooting", "Better handovers", "Visible support trends"], es: ["Investigación más rápida", "Resolución coherente", "Mejores traspasos", "Tendencias visibles"] },
    guardrail: { en: "The copilot proposes; authorised support staff approve customer-facing answers and irreversible actions.", es: "El copiloto propone; el personal autorizado aprueba respuestas y acciones irreversibles." },
    metrics: { en: ["Time to first useful action", "Resolution time", "Escalation accuracy", "Reopen rate"], es: ["Tiempo hasta primera acción útil", "Tiempo de resolución", "Precisión de escalado", "Reaperturas"] },
  },
  {
    id: "company-knowledge",
    path: { en: "/solutions/company-knowledge-assistant", es: "/es/soluciones/asistente-conocimiento-empresa" },
    title: { en: "Company Knowledge Assistant", es: "Asistente de Conocimiento Empresarial" },
    description: { en: "Answers grounded in approved documents, with citations and permission-aware access.", es: "Respuestas basadas en documentos aprobados, con citas y acceso según permisos." },
    problem: { en: "Employees cannot find the current answer or know which document is authoritative.", es: "Los empleados no encuentran la respuesta vigente ni saben qué documento es la fuente autorizada." },
    approach: { en: ["Curate sources and owners", "Index content with access controls", "Answer with citations and uncertainty", "Capture feedback and unanswered questions"], es: ["Curar fuentes y responsables", "Indexar con controles de acceso", "Responder con citas e incertidumbre", "Recoger feedback y preguntas sin respuesta"] },
    outcomes: { en: ["Faster answers", "Visible sources", "Reduced knowledge duplication", "Improved onboarding"], es: ["Respuestas más rápidas", "Fuentes visibles", "Menos duplicación", "Mejor incorporación"] },
    guardrail: { en: "Permissions follow the source system. The assistant must not use documents a user could not otherwise access.", es: "Los permisos siguen al sistema de origen. El asistente no usa documentos a los que el usuario no tendría acceso." },
    metrics: { en: ["Answer usefulness", "Citation coverage", "No-answer rate", "Knowledge freshness"], es: ["Utilidad", "Cobertura de citas", "Tasa sin respuesta", "Actualización del conocimiento"] },
  },
  {
    id: "document-operations",
    path: { en: "/solutions/document-operations", es: "/es/soluciones/operaciones-documentales" },
    title: { en: "Invoice and Document Operations", es: "Operaciones de Facturas y Documentos" },
    description: { en: "Receive, classify, extract, validate and route documents with an auditable exception path.", es: "Recibe, clasifica, extrae, valida y enruta documentos con un proceso auditable de excepciones." },
    problem: { en: "Document-heavy processes depend on manual entry and invisible email follow-up.", es: "Los procesos documentales dependen de entrada manual y seguimientos invisibles por email." },
    approach: { en: ["Ingest approved files and mailboxes", "Classify and extract required fields", "Validate rules and confidence", "Route approvals and update systems"], es: ["Recibir archivos y buzones aprobados", "Clasificar y extraer campos", "Validar reglas y confianza", "Enrutar aprobación y actualizar sistemas"] },
    outcomes: { en: ["Shorter processing cycles", "Less manual entry", "Clear exceptions", "Complete audit trail"], es: ["Ciclos más cortos", "Menos entrada manual", "Excepciones claras", "Auditoría completa"] },
    guardrail: { en: "Low-confidence or policy-sensitive documents stop for review. Originals and extracted data follow approved retention rules.", es: "Los documentos de baja confianza o sensibles se revisan. Originales y datos siguen la retención aprobada." },
    metrics: { en: ["Straight-through rate", "Exception rate", "Cycle time", "Correction rate"], es: ["Procesamiento automático", "Excepciones", "Tiempo de ciclo", "Correcciones"] },
  },
  {
    id: "hospitality-operations",
    path: { en: "/solutions/hospitality-operations-assistant", es: "/es/soluciones/asistente-operaciones-hospitalidad" },
    title: { en: "Hospitality Operations Assistant", es: "Asistente de Operaciones de Hospitalidad" },
    description: { en: "Multilingual guest support connected to approved property information and staff escalation.", es: "Atención multilingüe conectada a información aprobada de la propiedad y escalado al equipo." },
    problem: { en: "Guests need timely answers while operational teams coordinate arrivals, property information and service issues across locations.", es: "Los huéspedes necesitan respuestas rápidas mientras los equipos coordinan llegadas, información y problemas en varias ubicaciones." },
    approach: { en: ["Connect approved property and stay data", "Automate routine arrival information", "Ground troubleshooting and local guidance", "Escalate service requests to responsible staff"], es: ["Conectar datos aprobados de estancia y propiedad", "Automatizar información de llegada", "Basar ayuda y recomendaciones en fuentes", "Escalar solicitudes al personal responsable"] },
    outcomes: { en: ["Consistent guest information", "Lower repetitive workload", "Clear escalation", "Operational visibility"], es: ["Información coherente", "Menos carga repetitiva", "Escalado claro", "Visibilidad operativa"] },
    guardrail: { en: "Property access, identity, payment and emergency matters require explicit rules, secure systems and human escalation.", es: "Acceso, identidad, pagos y emergencias requieren reglas explícitas, sistemas seguros y escalado humano." },
    metrics: { en: ["Response time", "Containment with approval", "Escalation response", "Guest-request completion"], es: ["Tiempo de respuesta", "Resolución aprobada", "Respuesta a escalados", "Solicitudes completadas"] },
  },
  {
    id: "operations-intelligence",
    path: { en: "/solutions/operations-intelligence", es: "/es/soluciones/inteligencia-operaciones" },
    title: { en: "Operations Intelligence Layer", es: "Capa de Inteligencia Operativa" },
    description: { en: "Combine operational data, standardise KPIs and surface the exceptions leaders need to act on.", es: "Combina datos operativos, estandariza KPI y muestra las excepciones que requieren acción." },
    problem: { en: "Operational information arrives late and each team uses a different definition of performance.", es: "La información llega tarde y cada equipo utiliza una definición distinta del rendimiento." },
    approach: { en: ["Define governed metrics", "Connect and reconcile sources", "Create role-specific views", "Alert and summarise material exceptions"], es: ["Definir métricas gobernadas", "Conectar y conciliar fuentes", "Crear vistas por rol", "Alertar y resumir excepciones relevantes"] },
    outcomes: { en: ["Shared performance language", "Earlier risk visibility", "Faster management follow-up", "Less report preparation"], es: ["Lenguaje común de rendimiento", "Riesgos visibles antes", "Seguimiento más rápido", "Menos preparación de informes"] },
    guardrail: { en: "Every metric keeps a definition, owner, source and freshness indicator. Summaries do not replace the underlying evidence.", es: "Cada métrica conserva definición, responsable, fuente y actualización. Los resúmenes no sustituyen la evidencia." },
    metrics: { en: ["Data freshness", "Reconciliation gaps", "Exception closure", "Reporting effort"], es: ["Actualización", "Diferencias de conciliación", "Cierre de excepciones", "Esfuerzo de reporting"] },
  },
];

export const industries: CatalogItem[] = [
  {
    id: "it-providers",
    path: { en: "/industries/it-providers-resellers", es: "/es/sectores/proveedores-ti-distribuidores" },
    title: { en: "IT Providers and Resellers", es: "Proveedores de TI y Distribuidores" },
    description: { en: "Add practical AI delivery capability while protecting the client relationship and your service model.", es: "Añade capacidad práctica de IA protegiendo la relación con el cliente y tu modelo de servicio." },
    problem: { en: "Trusted providers see demand for AI but may not want to build a full specialist delivery team before the opportunity is proven.", es: "Los proveedores reciben demanda de IA, pero quizá no quieran crear un equipo especialista completo antes de validar la oportunidad." },
    approach: { en: ["Joint qualification and discovery", "Co-branded or white-label architecture", "Defined client ownership and support", "Contracted commercial and territorial terms"], es: ["Cualificación y diagnóstico conjunto", "Arquitectura conjunta o marca blanca", "Propiedad y soporte definidos", "Condiciones comerciales y territoriales por contrato"] },
    outcomes: { en: ["Broader service capability", "Lower hiring risk", "Senior specialist support", "Repeatable delivery patterns"], es: ["Oferta más amplia", "Menor riesgo de contratación", "Apoyo especialista senior", "Patrones repetibles"] },
    guardrail: { en: "No partnership, territory, exclusivity or client-protection term exists until it is agreed in writing.", es: "No existe asociación, territorio, exclusividad o protección de cliente hasta acordarlo por escrito." },
    metrics: { en: ["Qualified opportunities", "Pilot conversion", "Delivery quality", "Partner/client retention"], es: ["Oportunidades cualificadas", "Conversión a piloto", "Calidad de entrega", "Retención de socio/cliente"] },
  },
  {
    id: "hospitality",
    path: { en: "/industries/hospitality-property", es: "/es/sectores/hospitalidad-propiedades" },
    title: { en: "Hospitality and Property Operations", es: "Hospitalidad y Operaciones de Propiedades" },
    description: { en: "Apply Viste.ai’s hospitality background to controlled guest communication and operational coordination.", es: "Aplica la experiencia de Viste.ai en hospitalidad a la comunicación y coordinación operativa controlada." },
    problem: { en: "High message volume, changing property information and time-sensitive service requests place pressure on dispersed teams.", es: "El volumen de mensajes, la información cambiante y las solicitudes urgentes presionan a equipos distribuidos." },
    approach: { en: ["Map guest and staff journeys", "Connect approved stay/property data", "Automate routine information", "Escalate sensitive or physical-world actions"], es: ["Mapear recorridos de huésped y equipo", "Conectar datos aprobados", "Automatizar información rutinaria", "Escalar acciones sensibles o físicas"] },
    outcomes: { en: ["Faster routine answers", "Consistent property guidance", "Clear staff escalation", "Cross-property visibility"], es: ["Respuestas rutinarias más rápidas", "Información coherente", "Escalado claro", "Visibilidad entre propiedades"] },
    guardrail: { en: "Hospitality solutions require local legal, safety, identity, access and data-processing review for each operator and market.", es: "Las soluciones requieren revisión legal, de seguridad, identidad, acceso y datos para cada operador y mercado." },
    metrics: { en: ["Response time", "Escalation completion", "Repeated-question volume", "Operational follow-through"], es: ["Tiempo de respuesta", "Escalados completados", "Preguntas repetidas", "Seguimiento operativo"] },
  },
  {
    id: "professional-services",
    path: { en: "/industries/professional-services", es: "/es/sectores/servicios-profesionales" },
    title: { en: "Professional Services", es: "Servicios Profesionales" },
    description: { en: "Make knowledge, intake and document-heavy workflows easier to operate without weakening professional oversight.", es: "Facilita conocimiento, admisión y flujos documentales sin reducir la supervisión profesional." },
    problem: { en: "Specialists lose time to intake, precedent search, document preparation and internal coordination.", es: "Los especialistas pierden tiempo en admisión, búsqueda, preparación documental y coordinación." },
    approach: { en: ["Define confidentiality and permissions", "Structure intake and document workflows", "Ground assistance in approved sources", "Keep accountable review points"], es: ["Definir confidencialidad y permisos", "Estructurar admisión y documentos", "Basar la asistencia en fuentes aprobadas", "Mantener puntos de revisión responsables"] },
    outcomes: { en: ["Faster preparation", "Consistent intake", "Better knowledge access", "Visible review trail"], es: ["Preparación más rápida", "Admisión coherente", "Mejor acceso al conocimiento", "Revisión visible"] },
    guardrail: { en: "AI support does not replace regulated or professional judgement, client duties or conflict/confidentiality controls.", es: "La IA no sustituye criterio profesional o regulado, deberes con clientes ni controles de conflicto/confidencialidad." },
    metrics: { en: ["Preparation time", "Intake completeness", "Review corrections", "Knowledge reuse"], es: ["Tiempo de preparación", "Completitud de admisión", "Correcciones", "Reutilización del conocimiento"] },
  },
  {
    id: "manufacturing",
    path: { en: "/industries/manufacturing-distribution", es: "/es/sectores/fabricacion-distribucion" },
    title: { en: "Manufacturing and Distribution", es: "Fabricación y Distribución" },
    description: { en: "Connect documents, service workflows and operational data around real production and distribution constraints.", es: "Conecta documentos, servicio y datos operativos alrededor de restricciones reales de producción y distribución." },
    problem: { en: "Orders, quality records, service requests and planning data cross email, ERP, spreadsheets and human handoffs.", es: "Pedidos, calidad, servicio y planificación cruzan email, ERP, hojas y traspasos manuales." },
    approach: { en: ["Prioritise one constrained workflow", "Integrate with existing ERP/CRM where APIs allow", "Automate validation and exceptions", "Measure operational impact before scaling"], es: ["Priorizar un flujo limitado", "Integrar ERP/CRM cuando las API lo permitan", "Automatizar validación y excepciones", "Medir impacto antes de escalar"] },
    outcomes: { en: ["Faster document handling", "Better exception visibility", "More consistent service", "Clearer planning information"], es: ["Gestión documental más rápida", "Mejor visibilidad de excepciones", "Servicio coherente", "Información de planificación clara"] },
    guardrail: { en: "Production, safety and inventory actions need deterministic controls and authorised human approval; generative output is not a safety system.", es: "Producción, seguridad e inventario requieren controles deterministas y aprobación autorizada; la IA generativa no es un sistema de seguridad." },
    metrics: { en: ["Processing cycle", "Exception closure", "Data accuracy", "Service response"], es: ["Ciclo de proceso", "Cierre de excepciones", "Precisión de datos", "Respuesta de servicio"] },
  },
  {
    id: "multi-location",
    path: { en: "/industries/multi-location-businesses", es: "/es/sectores/empresas-multilocal" },
    title: { en: "Multi-location Businesses", es: "Empresas Multilocal" },
    description: { en: "Give distributed teams consistent answers, clearer operating signals and better customer handoffs.", es: "Ofrece a equipos distribuidos respuestas coherentes, señales operativas claras y mejores traspasos." },
    problem: { en: "Locations handle the same questions and exceptions differently while central teams struggle to see patterns.", es: "Cada ubicación gestiona preguntas y excepciones de forma distinta y el equipo central no ve los patrones." },
    approach: { en: ["Standardise approved knowledge", "Connect customer and operational channels", "Route exceptions to accountable teams", "Aggregate comparable site metrics"], es: ["Estandarizar conocimiento aprobado", "Conectar canales de cliente y operación", "Enrutar excepciones", "Agregar métricas comparables por ubicación"] },
    outcomes: { en: ["Consistent service", "Faster issue routing", "Location-level visibility", "Reusable operating guidance"], es: ["Servicio coherente", "Enrutamiento más rápido", "Visibilidad por ubicación", "Guía operativa reutilizable"] },
    guardrail: { en: "Local policy, employment, customer and market differences remain explicit; automation should not erase valid variation.", es: "Las diferencias locales, laborales, de cliente y mercado siguen explícitas; la automatización no debe borrar variaciones válidas." },
    metrics: { en: ["Response consistency", "Exception routing", "Site comparison", "Knowledge adoption"], es: ["Coherencia de respuesta", "Enrutamiento", "Comparación de ubicaciones", "Adopción del conocimiento"] },
  },
];

export function catalogItemToPage(item: CatalogItem, locale: Locale, eyebrow: string): import("./types").PageDefinition {
  const other: Locale = locale === "en" ? "es" : "en";
  const contact = locale === "en" ? "/contact" : "/es/contacto";
  return {
    id: item.id,
    locale,
    path: item.path[locale],
    alternatePath: item.path[other],
    eyebrow,
    title: item.title[locale],
    description: item.description[locale],
    lead: item.problem[locale],
    sections: [
      { title: locale === "en" ? "How we would approach it" : "Cómo lo abordaríamos", paragraphs: [], bullets: item.approach[locale] },
      { title: locale === "en" ? "Designed outcomes" : "Resultados buscados", paragraphs: [], bullets: item.outcomes[locale] },
      { title: locale === "en" ? "Human control and limitations" : "Control humano y límites", paragraphs: [item.guardrail[locale]] },
      { title: locale === "en" ? "Measures that matter" : "Métricas relevantes", paragraphs: [locale === "en" ? "Success measures are agreed during discovery and baselined before automation begins." : "Las métricas se acuerdan durante el diagnóstico y se establece una línea base antes de automatizar."], bullets: item.metrics[locale] },
    ],
    cta: {
      label: locale === "en" ? "Discuss this use case" : "Hablar sobre este caso",
      href: contact,
      note: locale === "en" ? "We will test fit, constraints and a responsible pilot path." : "Evaluaremos encaje, restricciones y un piloto responsable.",
    },
  };
}
