"use client";

import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { contactPath, labels, navigation } from "@/content/site";
import { Logo } from "./logo";
import { LanguageLink } from "./language-link";

type Locale = "en" | "es";

const copy = {
  en: {
    open: "Open menu",
    close: "Close menu",
    navigation: "Navigation",
    explore: "Explore",
    language: "Language",
  },
  es: {
    open: "Abrir menú",
    close: "Cerrar menú",
    navigation: "Navegación",
    explore: "Explorar",
    language: "Idioma",
  },
} satisfies Record<Locale, Record<string, string>>;

const subscribeToClient = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function MobileNavigation({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const mounted = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
  const open = openPath === pathname;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const languageCode = locale === "en" ? "ES" : "EN";

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("mobile-menu-open");
    closeRef.current?.focus();

    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenPath(null);
    };
    const desktop = window.matchMedia("(min-width: 1051px)");
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.classList.remove("mobile-menu-open");
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  const close = (restoreFocus = true) => {
    setOpenPath(null);
    if (restoreFocus) window.setTimeout(() => triggerRef.current?.focus(), 40);
  };

  const trapFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const menu = mounted ? createPortal(
    <div className="mobile-menu-layer" data-open={open} aria-hidden={!open}>
      <button className="mobile-menu-backdrop" type="button" aria-label={copy[locale].close} onClick={() => close()} tabIndex={open ? 0 : -1} />
      <div
        id={`mobile-menu-panel-${locale}`}
        className="mobile-menu-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`mobile-menu-title-${locale}`}
        onKeyDown={trapFocus}
      >
        <div className="mobile-menu-top">
          <Logo locale={locale} />
          <button ref={closeRef} className="mobile-menu-close" type="button" onClick={() => close()} aria-label={copy[locale].close} tabIndex={open ? 0 : -1}>
            <span aria-hidden="true" />
          </button>
        </div>
        <div className="mobile-menu-intro">
          <p className="eyebrow" id={`mobile-menu-title-${locale}`}>{copy[locale].navigation}</p>
          <span>{copy[locale].explore}</span>
        </div>
        <nav className="mobile-menu-links" aria-label={copy[locale].navigation}>
          {navigation[locale].map(([label, href], index) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
            return <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => close(false)}
              tabIndex={open ? 0 : -1}
              style={{ "--menu-index": index } as CSSProperties}
            ><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong></Link>;
          })}
        </nav>
        <div className="mobile-menu-footer">
          <LanguageLink className="mobile-menu-language" locale={locale} onClick={() => close(false)} tabIndex={open ? 0 : -1}>
            <span>{copy[locale].language}</span><strong>{languageCode}</strong>
          </LanguageLink>
          <Link className="button mobile-menu-cta" href={contactPath[locale]} onClick={() => close(false)} tabIndex={open ? 0 : -1}>{labels[locale].contact}<span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </div>,
    document.body,
  ) : null;

  return <div className="mobile-navigation">
    <button
      ref={triggerRef}
      className="mobile-menu-trigger"
      type="button"
      aria-expanded={open}
      aria-controls={`mobile-menu-panel-${locale}`}
      aria-label={copy[locale].open}
      onClick={() => setOpenPath(pathname)}
    >
      <span>{labels[locale].menu}</span>
      <i aria-hidden="true"><b /><b /></i>
    </button>
    {menu}
  </div>;
}
