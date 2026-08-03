"use client";

import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

type Lead = { id: string; created_at: string; name: string; email: string; company: string; role: string; company_website: string; country: string; preferred_language: string; workflow: string; systems: string; desired_outcome: string; budget: string; timeline: string; qualified_for_booking: boolean; status: string };

export function Admin() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  async function login(event: React.FormEvent) {
    event.preventDefault();
    if (!url || !key) { setMessage("Supabase is not configured."); return; }
    const supabase = createClient(url, key);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/admin` } });
    setMessage(error ? error.message : "Check your email for the secure sign-in link.");
  }

  async function load() {
    if (!url || !key) return;
    const supabase = createClient(url, key);
    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/admin/leads", { headers: { authorization: `Bearer ${data.session?.access_token}` } });
    if (response.ok) setLeads((await response.json()).leads);
    else setMessage("This account is not authorised.");
  }

  return <main className="admin shell"><p className="eyebrow">Secure workspace</p><h1>Lead inbox</h1><form onSubmit={login} className="admin-login"><label>Authorised email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label><button className="button">Send sign-in link</button><button type="button" className="button button-ghost" onClick={load}>Load leads after sign-in</button></form><p role="status">{message}</p><div className="admin-leads">{leads.map((lead) => <article key={lead.id}><span>{new Date(lead.created_at).toLocaleString()} · {lead.status} {lead.qualified_for_booking ? "· booking qualified" : ""}</span><h2>{lead.company} — {lead.name}</h2><p>{lead.role} · {lead.country} · {lead.preferred_language}</p><a href={`mailto:${lead.email}`}>{lead.email}</a><a href={lead.company_website} target="_blank" rel="noreferrer">{lead.company_website}</a><h3>Workflow</h3><p>{lead.workflow}</p><h3>Systems</h3><p>{lead.systems}</p><h3>Desired outcome</h3><p>{lead.desired_outcome}</p><small>{lead.budget} · {lead.timeline}</small></article>)}</div></main>;
}
