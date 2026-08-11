"use client";

import { createClient } from "@supabase/supabase-js";
import { useMemo, useState } from "react";
import { opportunityStages } from "@/lib/opportunity-engine";

type Lead = { id: string; created_at: string; name: string; email: string; company: string; role: string; workflow: string; systems: string; desired_outcome: string; status: string };
type Opportunity = {
  id: string; title: string; intent: string; stage: string; priority: string; risk: string; score: number; qualification_confidence: number;
  recommended_service: { label: string; href: string }; recommended_next_action: string; brief: Record<string, unknown>; source_url?: string;
  created_at: string; contacts: { name: string; email: string; company: string; region: string } | null;
  opportunity_scores: Array<{ components: Array<{ key: string; score: number; maximum: number; evidence: string }>; algorithm_version: string }>;
};
type Approval = { id: string; opportunity_id: string; action_type: string; status: string; requested_by: string; created_at: string; payload: Record<string, unknown> };
type Reporting = {
  periodDays: number;
  funnel: { viewed: number; started: number; briefViewed: number; handoffStarted: number; submitted: number };
  funnelRates: { viewToStart: number; startToBrief: number; briefToHandoff: number; handoffToSubmission: null };
  byIntent: Array<{ label: string; value: number }>;
  bySource: Array<{ label: string; value: number }>;
  byLocale: Array<{ label: string; value: number }>;
  security: Array<{ label: string; value: number }>;
  blockedTotal: number;
  daily: Array<{ day: string; opportunities: number; advisorStarts: number }>;
  consentNote: string;
};
type Dashboard = { tenant: { name: string }; kpis: Record<string, number | null>; opportunities: Opportunity[]; approvals: Approval[]; reporting: Reporting };

const kpiLabels: Record<string, string> = {
  newOpportunities: "New opportunities",
  medianSpeedToLeadMinutes: "Median speed to lead",
  diagnosticCompletionPercent: "Diagnostic completion",
  qualifiedOpportunities: "Qualified opportunities",
  discoverySessionsBooked: "Discovery sessions booked",
  opportunitySprintConversionPercent: "Opportunity Sprint conversion",
};

export function Admin() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const pipeline = useMemo(() => Object.fromEntries(opportunityStages.map((stage) => [stage, dashboard?.opportunities.filter((item) => item.stage === stage) || []])) as Record<string, Opportunity[]>, [dashboard]);
  const dailyMaximum = useMemo(() => Math.max(1, ...(dashboard?.reporting.daily.flatMap((day) => [day.opportunities, day.advisorStarts]) || [1])), [dashboard]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    if (!url || !key) { setMessage("Supabase is not configured."); return; }
    const supabase = createClient(url, key);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/admin` } });
    setMessage(error ? error.message : "Check your email for the secure sign-in link.");
  }

  async function load() {
    if (!url || !key) { setMessage("Supabase is not configured."); return; }
    const supabase = createClient(url, key);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setMessage("Sign in before loading Opportunity Control."); return; }
    const headers = { authorization: `Bearer ${token}` };
    const [opportunityResponse, leadResponse] = await Promise.all([fetch("/api/admin/opportunities", { headers }), fetch("/api/admin/leads", { headers })]);
    if (opportunityResponse.ok) {
      const payload = await opportunityResponse.json() as Dashboard;
      setDashboard(payload);
      setSelected(payload.opportunities[0] || null);
      setMessage("");
    } else setMessage(opportunityResponse.status === 503 ? "Apply the VIS_010 Supabase migration to enable Opportunity Control." : "This account is not authorised.");
    if (leadResponse.ok) setLeads((await leadResponse.json()).leads || []);
  }

  return <main className="admin opportunity-control shell">
    <header className="control-header"><div><p className="eyebrow">VIS_010 · Secure workspace</p><h1>Viste Opportunity Control</h1><p>{dashboard ? `${dashboard.tenant.name} · live tenant data` : "Sign in with an authorised Viste.ai account."}</p></div><form onSubmit={login} className="admin-login"><label>Authorised email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label><button className="button">Send sign-in link</button><button type="button" className="button button-ghost" onClick={load}>Load control</button></form></header><p role="status">{message}</p>

    {dashboard ? <>
      <section className="control-kpis" aria-label="Opportunity KPIs">{Object.entries(dashboard.kpis).map(([keyName, value]) => <article key={keyName}><span>{kpiLabels[keyName]}</span><strong>{value ?? "—"}{keyName.includes("Percent") ? "%" : keyName === "medianSpeedToLeadMinutes" && value !== null ? "m" : ""}</strong></article>)}</section>
      <section className="control-section reporting-section"><div className="control-section-heading"><div><p className="eyebrow">Reporting analytics · {dashboard.reporting.periodDays} days</p><h2>Opportunity funnel</h2></div><p>Privacy-safe operational reporting with consented pre-submission interactions and explicit-consent opportunity records.</p></div>
        <div className="funnel-report">
          {([['Viewed', dashboard.reporting.funnel.viewed, dashboard.reporting.funnelRates.viewToStart], ['Started', dashboard.reporting.funnel.started, dashboard.reporting.funnelRates.startToBrief], ['Brief viewed', dashboard.reporting.funnel.briefViewed, dashboard.reporting.funnelRates.briefToHandoff], ['Handoff started', dashboard.reporting.funnel.handoffStarted, dashboard.reporting.funnelRates.handoffToSubmission], ['Submitted', dashboard.reporting.funnel.submitted, null]] as Array<[string, number, number | null]>).map(([label, value, rate]) => <article key={label}><span>{label}</span><strong>{value}</strong>{rate !== null ? <small>{rate}% to next stage</small> : <small>Operational records</small>}</article>)}
        </div>
        <div className="reporting-grid">
          <article className="activity-chart"><header><div><p className="eyebrow">Daily activity</p><h3>Starts and opportunities</h3></div><div className="chart-legend"><span>Advisor starts</span><span>Opportunities</span></div></header><div className="chart-bars" role="img" aria-label="Advisor starts and submitted opportunities over fourteen days">{dashboard.reporting.daily.map((day) => <div key={day.day} title={`${day.day}: ${day.advisorStarts} starts, ${day.opportunities} opportunities`}><div className="bar-pair"><i style={{ height: `${Math.max(3, day.advisorStarts / dailyMaximum * 100)}%` }} /><i style={{ height: `${Math.max(3, day.opportunities / dailyMaximum * 100)}%` }} /></div><span>{day.day.slice(5)}</span></div>)}</div></article>
          <article className="security-report"><p className="eyebrow">Cost protection</p><h3>Blocked submissions</h3><strong>{dashboard.reporting.blockedTotal}</strong><p>Rejected before any future model or sending provider can run.</p>{dashboard.reporting.security.map((item) => <div key={item.label}><span>{item.label.replaceAll("_", " ")}</span><b>{item.value}</b></div>)}</article>
        </div>
        <div className="breakdown-grid"><ReportBreakdown title="Intent mix" items={dashboard.reporting.byIntent} /><ReportBreakdown title="Acquisition source" items={dashboard.reporting.bySource} /><ReportBreakdown title="Advisor language" items={dashboard.reporting.byLocale} /></div>
        <p className="fine reporting-note">{dashboard.reporting.consentNote}</p>
      </section>
      <section className="control-section"><div className="control-section-heading"><div><p className="eyebrow">Commercial flow</p><h2>Pipeline</h2></div><p>Stage changes remain human-owned. This view does not write to the CRM.</p></div><div className="pipeline-board">{opportunityStages.map((stage) => <section key={stage} className="pipeline-column"><header><strong>{stage.replaceAll("_", " ")}</strong><span>{pipeline[stage].length}</span></header>{pipeline[stage].map((item) => <button key={item.id} onClick={() => setSelected(item)} className={selected?.id === item.id ? "selected" : ""}><small>{item.priority.replaceAll("_", " ")} · {item.risk}</small><b>{item.contacts?.company || item.title}</b><span>{item.score}/100 · {item.intent.replaceAll("_", " ")}</span></button>)}</section>)}</div></section>

      <section className="control-detail-grid"><article className="control-detail"><p className="eyebrow">Opportunity detail</p>{selected ? <><h2>{selected.contacts?.company || selected.title}</h2><p>{selected.contacts?.name} · <a href={`mailto:${selected.contacts?.email}`}>{selected.contacts?.email}</a> · {selected.contacts?.region}</p><div className="detail-score"><strong>{selected.score}/100</strong><span>{selected.priority.replaceAll("_", " ")}<br />{Math.round(selected.qualification_confidence * 100)}% qualification confidence</span></div><h3>Opportunity Brief</h3><dl className="brief-definition">{Object.entries(selected.brief).filter(([, value]) => typeof value === "string").map(([keyName, value]) => <div key={keyName}><dt>{keyName.replaceAll(/([A-Z])/g, " $1")}</dt><dd>{String(value)}</dd></div>)}</dl><h3>Scoring evidence</h3>{selected.opportunity_scores?.[0]?.components?.map((item) => <details key={item.key}><summary>{item.key.replaceAll("_", " ")} <b>{item.score}/{item.maximum}</b></summary><p>{item.evidence}</p></details>)}</> : <p>Select an opportunity from the pipeline.</p>}</article>
      <aside className="approval-queue"><p className="eyebrow">Human control</p><h2>Approval queue</h2>{dashboard.approvals.length ? dashboard.approvals.map((approval) => <article key={approval.id}><span>Pending · {new Date(approval.created_at).toLocaleString()}</span><h3>{approval.action_type.replaceAll("_", " ")}</h3><p>Requested by {approval.requested_by}. Approval actions are deliberately not enabled until the outbound provider and audit workflow are configured.</p></article>) : <p>No pending approvals.</p>}<h2>Legacy lead inbox</h2><p>{leads.length} enquiries remain in the existing fallback form.</p></aside></section>
    </> : null}
  </main>;
}

function ReportBreakdown({ title, items }: { title: string; items: Array<{ label: string; value: number }> }) {
  const maximum = Math.max(1, ...items.map(({ value }) => value));
  return <article><p className="eyebrow">Breakdown</p><h3>{title}</h3>{items.length ? items.slice(0, 6).map((item) => <div key={item.label}><span>{item.label.replaceAll("_", " ")}</span><i><b style={{ width: `${item.value / maximum * 100}%` }} /></i><strong>{item.value}</strong></div>) : <p className="fine">No data in this period.</p>}</article>;
}
