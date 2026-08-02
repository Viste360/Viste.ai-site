"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Choice = "accepted" | "rejected" | null;
export function CookieConsent() {
  const es = usePathname().startsWith("/es");
  const [choice, setChoice] = useState<Choice>(null); const [open, setOpen] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("viste-cookie-choice") as Choice;
    // Reading the persisted browser preference necessarily hydrates client state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(saved); setOpen(!saved); const handler = () => setOpen(true); document.querySelectorAll("[data-cookie-settings]").forEach((el) => el.addEventListener("click", handler)); return () => document.querySelectorAll("[data-cookie-settings]").forEach((el) => el.removeEventListener("click", handler)); }, []);
  const choose = (next: Exclude<Choice, null>) => { localStorage.setItem("viste-cookie-choice", next); setChoice(next); setOpen(false); };
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return <>{choice === "accepted" && id ? <><Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" /><Script id="ga-consented" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}</Script></> : null}{open ? <aside className="cookie-banner" aria-label={es?"Preferencias de cookies":"Cookie preferences"}><div><strong>{es?"Opciones de privacidad":"Privacy choices"}</strong><p>{es?"Usamos almacenamiento esencial. La analítica opcional solo se activa con tu permiso.":"We use essential storage. Optional analytics runs only with your permission."}</p></div><div className="cookie-actions"><button onClick={() => choose("rejected")} className="button button-ghost">{es?"Solo esenciales":"Essential only"}</button><button onClick={() => choose("accepted")} className="button">{es?"Permitir analítica":"Allow analytics"}</button></div></aside> : null}</>;
}
