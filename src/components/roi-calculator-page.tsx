import Link from "next/link";
import type { GrowthPage } from "@/content/growth";
import { publicConfig } from "@/lib/public-config";
import { BookingCta } from "./booking-cta";
import { Breadcrumbs } from "./breadcrumbs";
import { GrowthPageJsonLd } from "./json-ld";
import { RoiCalculator } from "./roi-calculator";

const copy = {
  en: {
    eyebrow: "Planning tool",
    title: "Model automation value without inflating the savings.",
    lead: "Use your own operating assumptions to estimate current effort, assisted capacity, operating cost and a planning break-even. The formula remains visible and the result appears without an email gate.",
    review: "Preview draft · Human publication approval required",
    formulaEyebrow: "Visible formula",
    formulaTitle: "Every result follows the same transparent steps.",
    formula: [
      "Current hours = people × minutes per task × monthly volume ÷ 60 × (1 + rework rate)",
      "Assisted hours = current hours × share of handling that could be assisted",
      "Released hours = assisted hours × scenario time reduction",
      "Gross capacity value = released hours × loaded hourly cost",
      "Net monthly planning value = gross capacity value − monthly operating cost",
      "Planning break-even = implementation cost ÷ positive net monthly planning value",
    ],
    interpretEyebrow: "Interpretation",
    interpretTitle: "Capacity is not the same as cash.",
    interpret: [
      "Released hours may improve service, absorb growth or reduce backlog without reducing payroll.",
      "A pilot should verify handling share, time reduction, exception rate and adoption before the base scenario is used commercially.",
      "Include review time, integration maintenance, licences, monitoring and support in the operating cost.",
      "A result that does not reach break-even can still reveal that the process needs redesign—or that automation is the wrong answer.",
    ],
    nextEyebrow: "From model to evidence",
    nextTitle: "Validate the assumptions in one real workflow.",
    nextText: "The free calculator is a planning aid. A paid Opportunity Sprint maps the actual process, dependencies, risks and measurable pilot scope.",
    diagnostic: "Run the opportunity diagnostic",
  },
  es: {
    eyebrow: "Herramienta de planificación",
    title: "Modela el valor de una automatización sin inflar el ahorro.",
    lead: "Utiliza tus propios supuestos operativos para estimar esfuerzo actual, capacidad asistida, coste operativo y punto de equilibrio. La fórmula es visible y el resultado aparece sin pedir un email.",
    review: "Borrador de preview · Requiere aprobación humana para publicación",
    formulaEyebrow: "Fórmula visible",
    formulaTitle: "Todos los resultados siguen los mismos pasos transparentes.",
    formula: [
      "Horas actuales = personas × minutos por tarea × volumen mensual ÷ 60 × (1 + tasa de reproceso)",
      "Horas asistidas = horas actuales × parte del trabajo que podría recibir asistencia",
      "Horas liberadas = horas asistidas × reducción de tiempo del escenario",
      "Valor bruto de capacidad = horas liberadas × coste horario completo",
      "Valor neto mensual = valor bruto de capacidad − coste operativo mensual",
      "Punto de equilibrio = coste de implementación ÷ valor neto mensual positivo",
    ],
    interpretEyebrow: "Interpretación",
    interpretTitle: "La capacidad no equivale a caja.",
    interpret: [
      "Las horas liberadas pueden mejorar el servicio, absorber crecimiento o reducir atrasos sin reducir nómina.",
      "Un piloto debe comprobar parte asistible, reducción de tiempo, excepciones y adopción antes de utilizar comercialmente el escenario base.",
      "Incluye revisión, mantenimiento de integraciones, licencias, monitorización y soporte en el coste operativo.",
      "Un resultado sin punto de equilibrio también puede revelar que el proceso necesita rediseño o que automatizar no es la respuesta.",
    ],
    nextEyebrow: "Del modelo a la evidencia",
    nextTitle: "Valida los supuestos en un flujo real.",
    nextText: "La calculadora gratuita es una ayuda de planificación. Un Sprint de Oportunidades de pago mapea el proceso, las dependencias, los riesgos y un alcance de piloto medible.",
    diagnostic: "Realizar el diagnóstico de oportunidad",
  },
} as const;

export function RoiCalculatorPage({ page }: { page: GrowthPage }) {
  const locale = page.locale;
  const c = copy[locale];
  const diagnosticPath = locale === "es" ? "/es/ia-para-mi-negocio" : "/ai-for-my-business";
  const contactPath = locale === "es" ? "/es/contacto" : "/contact";

  return <main className="growth-page"><GrowthPageJsonLd page={page} />
    <section className="page-hero growth-hero"><div className="shell narrow"><Breadcrumbs path={page.path} title={page.title} locale={locale} /><p className="eyebrow">{c.eyebrow}</p><h1>{c.title}</h1><p className="lede growth-answer">{c.lead}</p><p className="editorial-status">{c.review} · {page.lastReviewed}</p></div></section>
    <section className="shell section roi-section"><RoiCalculator locale={locale} /></section>
    <section className="growth-contrast"><div className="shell formula-layout"><div><p className="eyebrow">{c.formulaEyebrow}</p><h2>{c.formulaTitle}</h2></div><ol>{c.formula.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><code>{item}</code></li>)}</ol></div></section>
    <section className="shell section growth-section"><p className="eyebrow">{c.interpretEyebrow}</p><h2 className="display-two">{c.interpretTitle}</h2><div className="interpret-grid">{c.interpret.map((item, index) => <article key={item}><span>0{index + 1}</span><p>{item}</p></article>)}</div></section>
    <section className="shell callout callout-large growth-final"><div><p className="eyebrow">{c.nextEyebrow}</p><h2>{c.nextTitle}</h2><p>{c.nextText}</p><Link className="text-link" href={diagnosticPath}>{c.diagnostic} →</Link></div></section>
    <BookingCta locale={locale} bookingUrl={publicConfig.bookingUrl} source="roi_calculator" fallbackHref={`${contactPath}#contact-form`} />
  </main>;
}
