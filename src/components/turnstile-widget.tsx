"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render(container: HTMLElement, options: Record<string, string | ((value?: string) => void)>): string;
      remove(widgetId: string): void;
      reset(widgetId: string): void;
    };
  }
}
export function TurnstileWidget({ siteKey, locale, onToken, action = "viste_opportunity" }: { siteKey?: string; locale: "en" | "es"; onToken: (token: string) => void; action?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const renderWidget = useCallback(() => {
    if (!siteKey || !loaded || !container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      action,
      theme: "dark",
      size: "flexible",
      language: locale,
      callback: (token?: string) => onToken(token || ""),
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
  }, [action, loaded, locale, onToken, siteKey]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [renderWidget]);

  if (!siteKey) return <p className="fine bot-protection-note">{locale === "es" ? "Protección anti-spam activa." : "Anti-spam protection active."}</p>;
  return <div className="turnstile-wrap">
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="lazyOnload" onLoad={() => setLoaded(true)} />
    <div ref={container} aria-label={locale === "es" ? "Verificación anti-bot" : "Anti-bot verification"} />
    <p className="fine">{locale === "es" ? "Completa la verificación antes de enviar." : "Complete verification before submitting."}</p>
  </div>;
}
