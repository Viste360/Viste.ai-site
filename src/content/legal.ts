import type { PageDefinition } from "./types";

const effective = "2 August 2026";
const vigente = "2 de agosto de 2026";

export const legalPages: PageDefinition[] = [
  {
    id: "privacy-en", locale: "en", path: "/privacy", alternatePath: "/es/privacidad",
    eyebrow: `Privacy notice · Effective ${effective}`, title: "Privacy notice",
    description: "How Viste.ai handles information submitted through this website.",
    lead: "This notice covers the public Viste.ai website and enquiries. Client projects have their own documented data arrangements.",
    sections: [
      { title: "Information we collect", paragraphs: ["When you contact us, we may receive your name, work email, company, role, country, phone number and the information you choose to provide about your business need. We also process limited technical and security data needed to operate and protect the website."], bullets: ["Enquiry and correspondence data", "Consent and form-submission records", "Essential security and diagnostic events", "Analytics data only after consent, when analytics is enabled"] },
      { title: "Why we use it", paragraphs: ["We use enquiry data to respond, assess fit, prepare a requested conversation or proposal, keep appropriate business records and protect the service. We do not sell personal information or use public-form data to train AI models."] },
      { title: "Processors, transfers and retention", paragraphs: ["Website hosting is provided through Vercel. Lead storage and email delivery may use Supabase and a configured email provider. These services may process data in other countries under their contractual safeguards. We retain enquiries only as long as reasonably needed for the relationship, legal obligations and security; routine unqualified enquiries should be reviewed for deletion after 24 months."] },
      { title: "Your choices and rights", paragraphs: ["Depending on where you live, you may have rights to access, correct, delete, restrict or object to processing, withdraw consent, or complain to a data-protection authority. Email privacy@viste.ai. We may need to verify your identity before acting."] },
      { title: "Important scope", paragraphs: ["Do not submit passwords, payment-card details, special-category information or confidential client data through the public form. This notice does not claim an unverified corporate registration or office address; contracting-entity details must appear in the relevant commercial agreement."] },
    ], cta: { label: "Ask a privacy question", href: "mailto:privacy@viste.ai", note: "Please do not include sensitive information." },
  },
  {
    id: "privacy-es", locale: "es", path: "/es/privacidad", alternatePath: "/privacy",
    eyebrow: `Privacidad · Vigente desde el ${vigente}`, title: "Aviso de privacidad",
    description: "Cómo gestiona Viste.ai la información enviada mediante este sitio web.",
    lead: "Este aviso cubre el sitio público y las consultas. Los proyectos de cliente tienen sus propios acuerdos documentados de datos.",
    sections: [
      { title: "Información que recopilamos", paragraphs: ["Al contactar, podemos recibir nombre, email profesional, empresa, cargo, país, teléfono y la información que decidas aportar. También tratamos datos técnicos y de seguridad limitados para operar y proteger el sitio."], bullets: ["Datos de consulta y correspondencia", "Registros de consentimiento y envío", "Eventos esenciales de seguridad y diagnóstico", "Analítica solo con consentimiento, cuando esté habilitada"] },
      { title: "Para qué la utilizamos", paragraphs: ["Usamos los datos para responder, evaluar el encaje, preparar una conversación o propuesta solicitada, mantener registros adecuados y proteger el servicio. No vendemos datos personales ni usamos formularios públicos para entrenar modelos de IA."] },
      { title: "Proveedores, transferencias y conservación", paragraphs: ["Vercel aloja el sitio. Supabase y un proveedor de email configurado pueden gestionar registros y mensajes. Pueden tratar datos en otros países con sus garantías contractuales. Conservamos consultas solo mientras sea razonablemente necesario; las no cualificadas deberían revisarse para borrado tras 24 meses."] },
      { title: "Tus opciones y derechos", paragraphs: ["Según tu lugar de residencia, puedes solicitar acceso, rectificación, supresión, limitación u oposición, retirar consentimiento o reclamar ante una autoridad. Escribe a privacy@viste.ai. Podemos verificar tu identidad."] },
      { title: "Alcance importante", paragraphs: ["No envíes contraseñas, tarjetas, categorías especiales ni datos confidenciales de clientes. Este aviso no inventa un registro mercantil o domicilio no verificado; la entidad contratante debe constar en el acuerdo comercial."] },
    ], cta: { label: "Consultar sobre privacidad", href: "mailto:privacy@viste.ai", note: "No incluyas información sensible." },
  },
  {
    id: "terms-en", locale: "en", path: "/terms", alternatePath: "/es/terminos",
    eyebrow: `Website terms · Effective ${effective}`, title: "Website terms",
    description: "Terms for using the public Viste.ai website and its informational materials.",
    lead: "These terms govern this website. They are not a proposal, statement of work, service-level agreement or client contract.",
    sections: [
      { title: "Informational use", paragraphs: ["The site describes capabilities, service approaches and illustrative Solution Blueprints. It does not promise a particular result, technology, territory, price, availability or implementation until agreed in writing after discovery."] },
      { title: "Responsible use", paragraphs: ["You may browse and link to public pages for lawful business purposes. Do not interfere with the site, probe security without written permission, submit malicious material, impersonate another person or misuse content or trademarks."] },
      { title: "Intellectual property", paragraphs: ["Unless otherwise stated, the site design, copy and Viste.ai brand materials are protected. You may quote short portions with attribution, but may not reproduce a substantial part or imply endorsement without permission."] },
      { title: "Third parties and availability", paragraphs: ["Links and references to third-party services do not imply endorsement or partnership. The site is provided on an as-available basis. We may change or withdraw content and do not guarantee uninterrupted or error-free access."] },
      { title: "Liability and contracts", paragraphs: ["To the extent allowed by applicable law, Viste.ai is not responsible for decisions made solely from general website content or for indirect loss arising from website use. Nothing excludes liability that cannot legally be excluded. The applicable contracting entity, law, venue, fees and service responsibilities belong in each signed client agreement."] },
    ], cta: { label: "Discuss an engagement", href: "/contact", note: "Commercial commitments begin only in a signed agreement." },
  },
  {
    id: "terms-es", locale: "es", path: "/es/terminos", alternatePath: "/terms",
    eyebrow: `Términos web · Vigentes desde el ${vigente}`, title: "Términos del sitio web",
    description: "Condiciones de uso del sitio público y sus materiales informativos.",
    lead: "Estos términos regulan el sitio. No son una propuesta, alcance, acuerdo de nivel de servicio ni contrato de cliente.",
    sections: [
      { title: "Uso informativo", paragraphs: ["El sitio describe capacidades, enfoques y Diseños de Solución ilustrativos. No promete resultado, tecnología, territorio, precio o disponibilidad hasta acordarlo por escrito tras el diagnóstico."] },
      { title: "Uso responsable", paragraphs: ["Puedes navegar y enlazar páginas públicas con fines legales. No interfieras, pruebes la seguridad sin permiso escrito, envíes material malicioso, suplantes identidades ni uses indebidamente contenido o marcas."] },
      { title: "Propiedad intelectual", paragraphs: ["Salvo indicación contraria, diseño, textos y marca están protegidos. Puedes citar fragmentos breves con atribución, pero no reproducir una parte sustancial ni sugerir respaldo sin permiso."] },
      { title: "Terceros y disponibilidad", paragraphs: ["Enlaces y referencias no implican respaldo o alianza. El sitio se ofrece según disponibilidad; el contenido puede cambiar y no garantizamos acceso ininterrumpido o sin errores."] },
      { title: "Responsabilidad y contratos", paragraphs: ["En la medida permitida, Viste.ai no responde por decisiones tomadas solo con contenido general ni por pérdidas indirectas derivadas del uso. No se excluye responsabilidad que legalmente no pueda excluirse. Entidad contratante, ley, jurisdicción, honorarios y obligaciones deben figurar en cada contrato firmado."] },
    ], cta: { label: "Hablar sobre un proyecto", href: "/es/contacto", note: "Los compromisos comerciales empiezan en un acuerdo firmado." },
  },
  {
    id: "cookies-en", locale: "en", path: "/cookies", alternatePath: "/es/cookies",
    eyebrow: `Cookie notice · Effective ${effective}`, title: "Cookie notice",
    description: "Essential storage and optional analytics choices on Viste.ai.",
    lead: "The site works without advertising cookies. Optional analytics remain off unless you choose to allow them.",
    sections: [
      { title: "Essential storage", paragraphs: ["We use local browser storage to remember your cookie choice and may use short-lived security mechanisms required for forms and administration. These are necessary for the requested function."] },
      { title: "Optional analytics", paragraphs: ["If analytics is configured and you consent, Google Analytics may collect page and device information to help us understand site use. It stays disabled before consent. You can reject it and still use the site."] },
      { title: "Change your choice", paragraphs: ["Use the Cookie settings control in the footer to reopen the choice. Clearing browser storage also resets the preference."] },
    ], cta: { label: "Privacy questions", href: "mailto:privacy@viste.ai", note: "Contact us if the controls do not behave as described." },
  },
  {
    id: "cookies-es", locale: "es", path: "/es/cookies", alternatePath: "/cookies",
    eyebrow: `Cookies · Vigente desde el ${vigente}`, title: "Aviso de cookies",
    description: "Almacenamiento esencial y analítica opcional en Viste.ai.",
    lead: "El sitio funciona sin cookies publicitarias. La analítica opcional no se activa sin tu permiso.",
    sections: [
      { title: "Almacenamiento esencial", paragraphs: ["Usamos almacenamiento local para recordar tu elección y podemos usar mecanismos breves de seguridad necesarios para formularios y administración."] },
      { title: "Analítica opcional", paragraphs: ["Si se configura y aceptas, Google Analytics puede recoger información de páginas y dispositivo para entender el uso. Permanece desactivado antes del consentimiento. Puedes rechazarlo sin perder acceso."] },
      { title: "Cambiar tu elección", paragraphs: ["Usa Configurar cookies en el pie para abrir de nuevo el control. Borrar el almacenamiento del navegador también restablece la preferencia."] },
    ], cta: { label: "Consultas de privacidad", href: "mailto:privacy@viste.ai", note: "Contacta si los controles no funcionan como se describe." },
  },
];

