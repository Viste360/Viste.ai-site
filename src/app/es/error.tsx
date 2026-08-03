"use client";
import Link from "next/link";
import { useEffect } from "react";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { void fetch("/api/monitor/error", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ digest: error.digest, route: location.pathname, locale: "es" }) }); }, [error]);
  return <main className="not-found shell"><p className="eyebrow">Se ha producido un error</p><h1>No pudimos cargar esta página.</h1><p>Inténtalo de nuevo, vuelve al inicio o escribe a hello@viste.ai.</p><div className="button-row"><button className="button" onClick={reset}>Intentar de nuevo</button><Link className="button button-ghost" href="/es">Ir al inicio</Link></div></main>;
}
