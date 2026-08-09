import Link from "next/link";
import { contactPath, labels, legalPaths, navigation } from "@/content/site";
import { Logo } from "./logo";

export function Footer({ locale }: { locale: "en" | "es" }) {
  const diagnostic = locale === "en" ? "/ai-for-my-business" : "/es/ia-para-mi-negocio";
  const questions = locale === "en" ? "/questions" : "/es/preguntas";
  return <footer className="site-footer"><div className="shell footer-grid">
    <div><Logo locale={locale} /><p>{labels[locale].copyright}</p><p className="fine">{locale === "en" ? "Global delivery · English & Spanish" : "Entrega global · Inglés y español"}</p></div>
    <div><h2>{locale === "en" ? "Explore" : "Explorar"}</h2>{navigation[locale].slice(0,5).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<Link href={diagnostic}>{locale === "en" ? "Opportunity diagnostic" : "Diagnóstico de oportunidad"}</Link><Link href={questions}>{locale === "en" ? "Practical questions" : "Preguntas prácticas"}</Link></div>
    <div><h2>{locale === "en" ? "Trust" : "Confianza"}</h2><Link href={legalPaths[locale].privacy}>{labels[locale].privacy}</Link><Link href={legalPaths[locale].terms}>{labels[locale].terms}</Link><Link href={legalPaths[locale].cookies}>{labels[locale].cookies}</Link><Link href={legalPaths[locale].security}>{labels[locale].security}</Link><button className="link-button" data-cookie-settings>{locale === "en" ? "Cookie settings" : "Configurar cookies"}</button></div>
    <div><h2>{locale === "en" ? "Start a conversation" : "Empezar una conversación"}</h2><Link href={contactPath[locale]}>hello@viste.ai</Link><a href="https://wa.me/message/5IYX266Z5KPKK1" rel="noreferrer">WhatsApp</a><p className="fine">{locale === "en" ? "Tell us the workflow, not the buzzword." : "Cuéntanos el flujo, no la palabra de moda."}</p></div>
  </div><div className="shell footer-bottom">© {new Date().getFullYear()} Viste.ai. {locale === "en" ? "All rights reserved." : "Todos los derechos reservados."}</div></footer>;
}
