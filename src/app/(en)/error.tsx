"use client";
import Link from "next/link";
import { useEffect } from "react";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { void fetch("/api/monitor/error", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ digest: error.digest, route: location.pathname, locale: "en" }) }); }, [error]);
  return <main className="not-found shell"><p className="eyebrow">Something went wrong</p><h1>We could not load this page.</h1><p>Try again, return home, or email hello@viste.ai if the problem continues.</p><div className="button-row"><button className="button" onClick={reset}>Try again</button><Link className="button button-ghost" href="/">Go home</Link></div></main>;
}
