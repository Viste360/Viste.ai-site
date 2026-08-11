import type { ReactNode } from "react";
import { CookieConsent } from "./cookie-consent";
import { Footer } from "./footer";
import { Header } from "./header";
import { AdvisorLauncher } from "./advisor-launcher";

export function LocaleRoot({ locale, bodyClassName, children }: { locale: "en" | "es"; bodyClassName?: string; children: ReactNode }) {
  return <html lang={locale}><body className={bodyClassName}><a className="skip-link" href="#content">{locale === "en" ? "Skip to content" : "Saltar al contenido"}</a><Header locale={locale} /><div id="content">{children}</div><Footer locale={locale} /><AdvisorLauncher locale={locale} /><CookieConsent /></body></html>;
}
