"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { OpportunityChat } from "./opportunity-chat";

export function AdvisorLauncher({ locale }: { locale: "en" | "es" }) {
  const pathname = usePathname();
  const advisorPath = locale === "es" ? "/es/asesor" : "/advisor";
  const [open, setOpen] = useState(pathname === advisorPath);
  const [hasOpened, setHasOpened] = useState(pathname === advisorPath);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  if (pathname.startsWith("/admin")) return null;
  const label = locale === "es" ? "Habla con Viste" : "Talk to Viste";
  return <div className={`advisor-widget${open ? " is-open" : ""}`}>
    {hasOpened ? <aside id={dialogId} className="advisor-panel" role="dialog" aria-modal="false" aria-label={locale === "es" ? "Asesor de oportunidades de Viste" : "Viste Opportunity Advisor"} hidden={!open}>
      <header><div><span aria-hidden="true">✦</span><div><strong>{locale === "es" ? "Asesor de Viste" : "Viste Advisor"}</strong><small>{locale === "es" ? "Asesor IA · seguimiento humano" : "AI advisor · human follow-up"}</small></div></div><button type="button" onClick={() => setOpen(false)} aria-label={locale === "es" ? "Cerrar asesor" : "Close advisor"}>×</button></header>
      <OpportunityChat locale={locale} />
    </aside> : null}
    <button className="advisor-launcher" type="button" aria-expanded={open} aria-controls={dialogId} onClick={() => { setHasOpened(true); setOpen((value) => !value); }}>
      <span aria-hidden="true">✦</span><b>{label}</b>
    </button>
  </div>;
}
