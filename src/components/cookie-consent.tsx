"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

type Choice = "accepted" | "rejected" | null;

export function CookieConsent() {
  const es = usePathname().startsWith("/es");
  const [choice, setChoice] = useState<Choice>(null);
  const [open, setOpen] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("viste-cookie-choice") as Choice;
    // Reading the persisted browser preference necessarily hydrates client state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(saved);
    setOpen(!saved);
    const handler = () => setOpen(true);
    document.querySelectorAll("[data-cookie-settings]").forEach((element) => element.addEventListener("click", handler));
    return () => document.querySelectorAll("[data-cookie-settings]").forEach((element) => element.removeEventListener("click", handler));
  }, []);

  useEffect(() => {
    // The advisor can mount first on its dedicated route; mirror that external UI state after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdvisorOpen(document.documentElement.dataset.visteAdvisorOpen === "true");
    const handleAdvisorVisibility = (event: Event) => {
      setAdvisorOpen(Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open));
    };
    window.addEventListener("viste:advisor-visibility", handleAdvisorVisibility);
    return () => window.removeEventListener("viste:advisor-visibility", handleAdvisorVisibility);
  }, []);

  const choose = (next: Exclude<Choice, null>) => {
    localStorage.setItem("viste-cookie-choice", next);
    setChoice(next);
    setOpen(false);
  };
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false";
  const consented = choice === "accepted" && analyticsEnabled;

  return <>
    {consented ? <><Analytics /><SpeedInsights />{gaMeasurementId ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" /><Script id="ga-consented" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaMeasurementId}',{anonymize_ip:true});`}</Script></> : null}</> : null}
    {open && !advisorOpen ? <aside className="cookie-banner" aria-label={es ? "Preferencias de cookies" : "Cookie preferences"}><div><strong>{es ? "Opciones de privacidad" : "Privacy choices"}</strong><p>{es ? "Usamos almacenamiento esencial. La analítica opcional y las métricas de rendimiento solo se activan con tu permiso." : "We use essential storage. Optional analytics and performance metrics run only with your permission."}</p></div><div className="cookie-actions"><button onClick={() => choose("rejected")} className="button button-ghost">{es ? "Solo esenciales" : "Essential only"}</button><button onClick={() => choose("accepted")} className="button">{es ? "Permitir analítica" : "Allow analytics"}</button></div></aside> : null}
  </>;
}
