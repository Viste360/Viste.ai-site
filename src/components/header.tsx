import Link from "next/link";
import { contactPath, labels, navigation } from "@/content/site";
import { Logo } from "./logo";
import { LanguageLink } from "./language-link";
import { MobileNavigation } from "./mobile-navigation";

export function Header({ locale }: { locale: "en" | "es" }) {
  return <header className="site-header"><div className="shell header-inner">
    <Logo locale={locale} />
    <nav className="desktop-nav" aria-label={locale === "en" ? "Main navigation" : "Navegación principal"}>
      {navigation[locale].map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
    <div className="header-actions"><LanguageLink className="language" locale={locale}>{labels[locale].language}</LanguageLink><Link className="button button-small" href={contactPath[locale]}>{labels[locale].contact}</Link></div>
    <MobileNavigation locale={locale} />
  </div></header>;
}
