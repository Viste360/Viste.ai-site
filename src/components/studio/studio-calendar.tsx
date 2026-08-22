"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StudioLocale } from "./studio-content";
import { useStudioAuth } from "./use-studio-auth";
import styles from "./studio-workflows.module.css";

type Campaign = { id: string; brand_id: string; name: string; status: string };
type Account = { id: string; brand_id: string; platform: string; account_label: string; status: string };
type Publication = { id: string; campaign_id: string; platform: string; title: string; scheduled_for: string; timezone: string; status: string };

const copy = {
  en: {
    overline: "Publishing control", title: "Calendar", intro: "Approve a channel, choose the exact moment, and keep every publish decision auditable.", badge: "No silent auto-posting",
    schedule: "Schedule approved content", campaign: "Campaign", account: "Publishing account", titleField: "Post title", caption: "Caption / description", date: "Date and time", timezone: "Timezone", confirm: "I approve this campaign for publishing on the selected account and time.", action: "Approve & schedule", access: "Sign in to view your private publishing calendar.", unavailable: "Connect Supabase Preview variables to enable the private calendar.", sent: "Check your email for the secure sign-in link.", email: "Work email", send: "Send secure link", noCampaign: "No campaign ready for scheduling", noAccount: "No authorised publishing account for this brand", queue: "Publishing queue", empty: "Nothing is scheduled yet. Items appear here only after explicit human approval.", connect: "Channel connections are added per platform. Until an approved adapter is configured, due items remain safely queued.", scheduled: "Approved and scheduled.", approvalRole: "Your workspace role cannot approve publishing.",
  },
  es: {
    overline: "Control de publicación", title: "Calendario", intro: "Aprueba un canal, elige el momento exacto y conserva una auditoría de cada publicación.", badge: "Sin publicaciones automáticas silenciosas",
    schedule: "Programar contenido aprobado", campaign: "Campaña", account: "Cuenta de publicación", titleField: "Título de la publicación", caption: "Texto / descripción", date: "Fecha y hora", timezone: "Zona horaria", confirm: "Apruebo esta campaña para publicarla en la cuenta y hora seleccionadas.", action: "Aprobar y programar", access: "Accede para ver tu calendario privado de publicación.", unavailable: "Conecta las variables Preview de Supabase para activar el calendario privado.", sent: "Revisa tu email para abrir el enlace seguro.", email: "Email de trabajo", send: "Enviar enlace seguro", noCampaign: "No hay campañas listas para programar", noAccount: "No hay una cuenta autorizada para esta marca", queue: "Cola de publicación", empty: "Todavía no hay nada programado. Los elementos aparecen solo tras aprobación humana explícita.", connect: "Las conexiones se añaden por plataforma. Hasta configurar un adaptador aprobado, los elementos vencidos permanecen en cola de forma segura.", scheduled: "Aprobado y programado.", approvalRole: "Tu rol no permite aprobar publicaciones.",
  },
} as const;

function defaultLocalDate() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export function StudioCalendar({ locale }: { locale: StudioLocale }) {
  const c = copy[locale];
  const { configured, loading, session } = useStudioAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [canApprove, setCanApprove] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ campaignId: "", platformAccountId: "", title: "", description: "", scheduledFor: defaultLocalDate(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", explicitApproval: false });

  const loadCalendar = useCallback(async () => {
    if (!session) return;
    const response = await fetch("/api/studio/calendar", { headers: { authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not load the calendar");
    setCampaigns(data.campaigns || []); setAccounts(data.accounts || []); setPublications(data.publications || []); setCanApprove(Boolean(data.canApprove));
    setForm((current) => current.campaignId || !data.campaigns?.[0] ? current : { ...current, campaignId: data.campaigns[0].id, title: data.campaigns[0].name });
  }, [session]);
  useEffect(() => {
    if (!session) return;
    let active = true;
    void fetch("/api/studio/calendar", { headers: { authorization: `Bearer ${session.access_token}` }, cache: "no-store" })
      .then(async (response) => { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Could not load the calendar"); return data; })
      .then((data) => { if (!active) return; setCampaigns(data.campaigns || []); setAccounts(data.accounts || []); setPublications(data.publications || []); setCanApprove(Boolean(data.canApprove)); setForm((current) => current.campaignId || !data.campaigns?.[0] ? current : { ...current, campaignId: data.campaigns[0].id, title: data.campaigns[0].name }); })
      .catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [session]);

  const campaign = campaigns.find((item) => item.id === form.campaignId);
  const availableAccounts = useMemo(() => accounts.filter((account) => account.brand_id === campaign?.brand_id && account.status === "authorised"), [accounts, campaign?.brand_id]);
  const activeAccount = availableAccounts.some((account) => account.id === form.platformAccountId) ? form.platformAccountId : (availableAccounts[0]?.id || "");

  async function schedule(event: React.FormEvent) {
    event.preventDefault(); if (!session) return; setBusy(true); setMessage("");
    const response = await fetch("/api/studio/calendar", { method: "POST", headers: { authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...form, platformAccountId: activeAccount, scheduledFor: new Date(form.scheduledFor).toISOString(), explicitApproval: form.explicitApproval }) });
    const data = await response.json().catch(() => ({})); setBusy(false);
    if (!response.ok) return setMessage(data.error || "Could not schedule this campaign");
    setMessage(c.scheduled); setForm((current) => ({ ...current, explicitApproval: false })); await loadCalendar();
  }

  return <>
    <header className={styles.pageHeader}><div><p>{c.overline}</p><h1>{c.title}</h1><span>{c.intro}</span></div><b>{c.badge}</b></header>
    {!configured ? <div className={styles.notice}>{c.unavailable}</div> : !loading && !session ? <div className={styles.notice}>{c.access}</div> : null}
    {message ? <p className={styles.message} role="status">{message}</p> : null}
    <div className={styles.calendarGrid}>
      <form className={styles.schedulePanel} onSubmit={schedule}>
        <div className={styles.panelHeading}><span>01</span><div><h2>{c.schedule}</h2><p>{c.connect}</p></div></div>
        <label><span>{c.campaign}</span><select value={form.campaignId} onChange={(event) => { const selected = campaigns.find((item) => item.id === event.target.value); setForm((current) => ({ ...current, campaignId: event.target.value, title: selected?.name || current.title })); }} required><option value="">{c.noCampaign}</option>{campaigns.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.status}</option>)}</select></label>
        <label><span>{c.account}</span><select value={activeAccount} onChange={(event) => setForm((current) => ({ ...current, platformAccountId: event.target.value }))} required><option value="">{c.noAccount}</option>{availableAccounts.map((account) => <option value={account.id} key={account.id}>{account.platform} · {account.account_label}</option>)}</select></label>
        <label><span>{c.titleField}</span><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></label>
        <label><span>{c.caption}</span><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
        <div className={styles.splitFields}><label><span>{c.date}</span><input type="datetime-local" value={form.scheduledFor} onChange={(event) => setForm((current) => ({ ...current, scheduledFor: event.target.value }))} required /></label><label><span>{c.timezone}</span><input value={form.timezone} onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))} required /></label></div>
        <label className={styles.approvalCheck}><input type="checkbox" checked={form.explicitApproval} onChange={(event) => setForm((current) => ({ ...current, explicitApproval: event.target.checked }))} /><span>{c.confirm}</span></label>
        {!canApprove && session ? <p className={styles.roleWarning}>{c.approvalRole}</p> : null}
        <button className={styles.primaryButton} disabled={!session || !canApprove || !form.explicitApproval || !activeAccount || busy}>{c.action}<i>↗</i></button>
      </form>
      <section className={styles.queuePanel}>
        <div className={styles.panelHeading}><span>02</span><div><h2>{c.queue}</h2><p>{publications.length}</p></div></div>
        {publications.length ? <div className={styles.publicationList}>{publications.map((item) => <article key={item.id}><time dateTime={item.scheduled_for}><b>{new Date(item.scheduled_for).toLocaleDateString(locale, { day: "2-digit", month: "short" })}</b><span>{new Date(item.scheduled_for).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</span></time><div><strong>{item.title}</strong><span>{item.platform} · {item.timezone}</span></div><em data-status={item.status}>{item.status.replaceAll("_", " ")}</em></article>)}</div> : <div className={styles.conceptEmpty}><i>＋</i><p>{c.empty}</p></div>}
      </section>
    </div>
  </>;
}
