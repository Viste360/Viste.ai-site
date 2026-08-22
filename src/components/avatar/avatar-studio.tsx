"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStudioAuth } from "@/components/studio/use-studio-auth";
import { michaelCoachCues } from "@/lib/avatar/cue-library";
import styles from "./avatar-studio.module.css";

type Locale = "en" | "es";
type Provider = { id: "manual" | "open_source" | "heygen"; configured: boolean; mode: string };
type Talent = { id: string; display_name: string; status: string; default_language: Locale; avatar_consents?: Array<{ status: string; expires_at: string | null }> };
type Asset = { id: string; file_name: string; content_type: string; asset_type: string };
type Job = { id: string; talent_id: string; provider: string; status: string; cue_id: string | null; script: string; language: Locale; aspect_ratio: string; created_at: string };
type Workspace = { talents: Talent[]; jobs: Job[]; assets: Asset[]; providers: Provider[] };

const fallbackProviders: Provider[] = [
  { id: "manual", configured: true, mode: "ingest" },
  { id: "open_source", configured: false, mode: "self_hosted" },
  { id: "heygen", configured: false, mode: "hosted" },
];

const copy = {
  en: {
    title: "One avatar. A reusable video system.",
    intro: "Create consented talent profiles, turn approved scripts into render jobs and review every clip before it reaches a live experience.",
    demo: "Open live coach",
    language: "ES",
    workspace: "Owner workspace",
    signOut: "Sign out",
    pipeline: "Production pipeline",
    pipelineSteps: ["Talent + consent", "Script", "Render", "Review", "Publish"],
    providers: "Render engines",
    providersLead: "The workflow stays the same when the video engine changes.",
    manual: "Manual pilot",
    manualDescription: "Use approved clips produced outside the platform while the generator is connected.",
    open_source: "Open-source worker",
    openSourceDescription: "Self-hosted GPU endpoint for LivePortrait or MuseTalk-style rendering.",
    heygen: "HeyGen connector",
    heygenDescription: "Optional hosted provider. Deliberately not connected or billed yet.",
    ready: "Ready",
    setup: "Needs setup",
    talents: "Talent & consent",
    noTalents: "No approved avatar talent yet.",
    talentLead: "Upload a reference video and consent evidence to private Assets, then register the talent here.",
    assets: "Open private Assets",
    addTalent: "Register talent",
    bootstrap: "Initialize test avatar",
    bootstrapping: "Initializing test avatar…",
    cancel: "Cancel",
    name: "Talent name",
    referenceVideo: "Reference video",
    voiceReference: "Voice reference (optional)",
    consentEvidence: "Consent evidence",
    consentScope: "Approved use",
    consentPlaceholder: "Describe the documented uses this person approved for avatar generation.",
    register: "Save consented talent",
    script: "Script workbench",
    scriptLead: "Start from the real coaching cue library or write a reviewed script.",
    cue: "Cue template",
    custom: "Custom reviewed script",
    talent: "Avatar talent",
    provider: "Render engine",
    languageLabel: "Spoken language",
    aspect: "Output format",
    createJob: "Create render job",
    missingTalent: "Register an approved talent before rendering.",
    queue: "Render queue",
    emptyQueue: "No jobs yet. Your first request will appear here with a review status.",
    pilot: "Current pilot media",
    pilotLead: "These three owner-supplied test clips prove playback and cue timing. They are marked for replacement before launch.",
    idle: "Listening loop",
    shallow: "Depth correction",
    comeback: "Recovery cue",
    temporary: "TEST ONLY",
    loading: "Loading private workspace…",
    migration: "The interface is ready, but the Avatar Studio database migration still needs to be applied to this environment.",
  },
  es: {
    title: "Un avatar. Un sistema de vídeo reutilizable.",
    intro: "Crea perfiles con consentimiento, convierte guiones aprobados en trabajos de renderizado y revisa cada vídeo antes de publicarlo.",
    demo: "Abrir coach en vivo",
    language: "EN",
    workspace: "Espacio del propietario",
    signOut: "Cerrar sesión",
    pipeline: "Flujo de producción",
    pipelineSteps: ["Talento + permiso", "Guion", "Render", "Revisión", "Publicación"],
    providers: "Motores de renderizado",
    providersLead: "El flujo no cambia cuando cambia el motor de vídeo.",
    manual: "Piloto manual",
    manualDescription: "Usa vídeos aprobados creados fuera de la plataforma mientras conectamos el generador.",
    open_source: "Motor open source",
    openSourceDescription: "Endpoint GPU propio para renderizado estilo LivePortrait o MuseTalk.",
    heygen: "Conector HeyGen",
    heygenDescription: "Proveedor alojado opcional. Aún no está conectado ni genera costes.",
    ready: "Listo",
    setup: "Pendiente",
    talents: "Talento y consentimiento",
    noTalents: "Todavía no hay ningún talento aprobado.",
    talentLead: "Sube el vídeo de referencia y la prueba de consentimiento a Recursos privados y registra aquí el talento.",
    assets: "Abrir Recursos privados",
    addTalent: "Registrar talento",
    bootstrap: "Inicializar avatar de prueba",
    bootstrapping: "Inicializando avatar de prueba…",
    cancel: "Cancelar",
    name: "Nombre del talento",
    referenceVideo: "Vídeo de referencia",
    voiceReference: "Referencia de voz (opcional)",
    consentEvidence: "Prueba de consentimiento",
    consentScope: "Uso aprobado",
    consentPlaceholder: "Describe los usos documentados que esta persona aprobó para generar su avatar.",
    register: "Guardar talento autorizado",
    script: "Mesa de guiones",
    scriptLead: "Parte de la biblioteca real de cues o escribe un guion revisado.",
    cue: "Plantilla de cue",
    custom: "Guion personalizado revisado",
    talent: "Talento del avatar",
    provider: "Motor de renderizado",
    languageLabel: "Idioma hablado",
    aspect: "Formato de salida",
    createJob: "Crear trabajo de render",
    missingTalent: "Registra un talento aprobado antes de renderizar.",
    queue: "Cola de renderizado",
    emptyQueue: "Aún no hay trabajos. La primera solicitud aparecerá aquí con su estado de revisión.",
    pilot: "Vídeos piloto actuales",
    pilotLead: "Estos tres vídeos de prueba proporcionados por el propietario validan la reproducción y el timing. Deben sustituirse antes del lanzamiento.",
    idle: "Bucle de escucha",
    shallow: "Corrección de profundidad",
    comeback: "Cue de recuperación",
    temporary: "SOLO PRUEBA",
    loading: "Cargando el espacio privado…",
    migration: "La interfaz está lista, pero todavía falta aplicar la migración de Avatar Studio en este entorno.",
  },
} as const;

function requestHeaders(token?: string) {
  return { Authorization: `Bearer ${token || ""}`, "Content-Type": "application/json" };
}

async function fetchAvatarWorkspace(token: string, migrationMessage: string): Promise<{ workspace: Workspace; message: string }> {
  const response = await fetch("/api/avatar/render-jobs", { headers: requestHeaders(token), cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { workspace: { talents: [], jobs: [], assets: [], providers: fallbackProviders }, message: data.error || migrationMessage };
  return { workspace: data, message: "" };
}

export function AvatarStudio({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const { session, signOut } = useStudioAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showTalentForm, setShowTalentForm] = useState(false);
  const [talentId, setTalentId] = useState("");
  const [provider, setProvider] = useState<"manual" | "open_source">("manual");
  const [language, setLanguage] = useState<Locale>(locale);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const firstCue = michaelCoachCues.find((cue) => cue.id === "squat-depth-shallow-01") || michaelCoachCues[0];
  const [cueId, setCueId] = useState(firstCue.id);
  const [script, setScript] = useState(firstCue.text);
  const [busy, setBusy] = useState(false);
  const [talentForm, setTalentForm] = useState({ displayName: "", referenceVideoAssetId: "", referenceAudioAssetId: "", consentEvidenceAssetId: "", consentScope: "" });
  const accessToken = session?.access_token;

  async function loadWorkspace() {
    if (!accessToken) return;
    setLoading(true);
    const result = await fetchAvatarWorkspace(accessToken, t.migration);
    setMessage(result.message);
    setWorkspace(result.workspace);
    setTalentId((current) => current || result.workspace.talents[0]?.id || "");
    setLoading(false);
  }

  useEffect(() => {
    if (!accessToken) return;
    let active = true;
    void fetchAvatarWorkspace(accessToken, t.migration).then((result) => {
      if (!active) return;
      setMessage(result.message);
      setWorkspace(result.workspace);
      setTalentId((current) => current || result.workspace.talents[0]?.id || "");
      setLoading(false);
    });
    return () => { active = false; };
  }, [accessToken, t.migration]);

  const providers = workspace?.providers || fallbackProviders;
  const assets = workspace?.assets || [];
  const videoAssets = assets.filter((asset) => asset.content_type.startsWith("video/"));
  const audioAssets = assets.filter((asset) => asset.content_type.startsWith("audio/"));
  const evidenceAssets = assets.filter((asset) => !asset.content_type.startsWith("audio/") || asset.asset_type === "document");
  const selectedProvider = providers.find(({ id }) => id === provider);
  const canRender = Boolean(talentId && script.trim().length >= 2 && selectedProvider?.configured);

  const talentNames = useMemo(() => new Map((workspace?.talents || []).map((talent) => [talent.id, talent.display_name])), [workspace?.talents]);

  function selectCue(nextCueId: string) {
    setCueId(nextCueId);
    const cue = michaelCoachCues.find(({ id }) => id === nextCueId);
    if (cue) setScript(cue.text);
  }

  async function createTalent() {
    if (!session?.access_token) return;
    setBusy(true); setMessage("");
    const response = await fetch("/api/avatar/talents", { method: "POST", headers: requestHeaders(session.access_token), body: JSON.stringify({ ...talentForm, referenceAudioAssetId: talentForm.referenceAudioAssetId || null, defaultLanguage: language }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(data.error || "Could not save talent");
    else { setShowTalentForm(false); setTalentId(data.talent.id); await loadWorkspace(); }
    setBusy(false);
  }

  async function bootstrapPilot() {
    if (!session?.access_token) return;
    setBusy(true); setMessage("");
    const response = await fetch("/api/avatar/bootstrap-pilot", { method: "POST", headers: requestHeaders(session.access_token), body: "{}" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(data.error || "Could not initialize the test avatar");
    else await loadWorkspace();
    setBusy(false);
  }

  async function createRenderJob() {
    if (!session?.access_token || !canRender) return;
    setBusy(true); setMessage("");
    const response = await fetch("/api/avatar/render-jobs", { method: "POST", headers: requestHeaders(session.access_token), body: JSON.stringify({ talentId, provider, script, language, cueId: cueId === "custom" ? null : cueId, aspectRatio, background: "studio_dark" }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(data.error || "Could not create render job");
    else await loadWorkspace();
    setBusy(false);
  }

  return <main className={styles.studioShell}>
    <header className={styles.studioHeader}>
      <Link href={locale === "en" ? "/" : "/es"} className={styles.studioBrand}><span>V</span><b>viste.ai</b><i>/ avatar studio</i></Link>
      <div className={styles.headerLinks}><span>{t.workspace}</span><Link href={locale === "en" ? "/avatar" : "/es/avatar"}>{t.demo}</Link><Link href={locale === "en" ? "/es/avatar/studio" : "/avatar/studio"}>{t.language}</Link><button type="button" onClick={() => void signOut()}>{t.signOut}</button></div>
    </header>

    <section className={styles.studioHero}>
      <p className={styles.kicker}>VISTE / GENERATIVE VIDEO OPERATIONS</p>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
    </section>

    <section className={styles.pipeline} aria-label={t.pipeline}>
      <div><small>01</small><strong>{t.pipeline}</strong></div>
      {t.pipelineSteps.map((step, index) => <div key={step}><span>{index + 1}</span>{step}</div>)}
    </section>

    {loading ? <p className={styles.workspaceMessage}>{t.loading}</p> : null}
    {message ? <p className={styles.workspaceMessage} role="status">{message}</p> : null}

    <section className={styles.workspaceGrid}>
      <article className={`${styles.panel} ${styles.providerPanel}`}>
        <div className={styles.panelHeading}><div><span>02 / ENGINES</span><h2>{t.providers}</h2></div><p>{t.providersLead}</p></div>
        <div className={styles.providerList}>{providers.map((item) => <div key={item.id} className={styles.providerCard}>
          <div><i className={item.configured ? styles.readyDot : styles.offDot} /><strong>{t[item.id]}</strong><span>{item.configured ? t.ready : t.setup}</span></div>
          <p>{item.id === "manual" ? t.manualDescription : item.id === "open_source" ? t.openSourceDescription : t.heygenDescription}</p>
        </div>)}</div>
      </article>

      <article className={styles.panel}>
        <div className={styles.panelHeading}><div><span>03 / IDENTITY</span><h2>{t.talents}</h2></div></div>
        {(workspace?.talents || []).length ? <div className={styles.talentList}>{workspace!.talents.map((talent) => <button type="button" key={talent.id} className={talentId === talent.id ? styles.talentSelected : ""} onClick={() => setTalentId(talent.id)}><b>{talent.display_name.slice(0, 2).toUpperCase()}</b><span><strong>{talent.display_name}</strong><small>{talent.status} · consent {talent.avatar_consents?.[0]?.status || "pending"}</small></span></button>)}</div> : <div className={styles.emptyState}><strong>{t.noTalents}</strong><p>{t.talentLead}</p></div>}
        <div className={styles.inlineActions}><Link href={locale === "en" ? "/app/assets" : "/es/app/assets"}>{t.assets}</Link><button type="button" onClick={() => setShowTalentForm(!showTalentForm)}>{showTalentForm ? t.cancel : t.addTalent}</button>{!(workspace?.talents || []).length ? <button type="button" disabled={busy} onClick={() => void bootstrapPilot()}>{busy ? t.bootstrapping : t.bootstrap}</button> : null}</div>
        {showTalentForm ? <div className={styles.talentForm}>
          <label>{t.name}<input value={talentForm.displayName} onChange={(event) => setTalentForm({ ...talentForm, displayName: event.target.value })} /></label>
          <label>{t.referenceVideo}<select value={talentForm.referenceVideoAssetId} onChange={(event) => setTalentForm({ ...talentForm, referenceVideoAssetId: event.target.value })}><option value="">—</option>{videoAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.file_name}</option>)}</select></label>
          <label>{t.voiceReference}<select value={talentForm.referenceAudioAssetId} onChange={(event) => setTalentForm({ ...talentForm, referenceAudioAssetId: event.target.value })}><option value="">—</option>{audioAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.file_name}</option>)}</select></label>
          <label>{t.consentEvidence}<select value={talentForm.consentEvidenceAssetId} onChange={(event) => setTalentForm({ ...talentForm, consentEvidenceAssetId: event.target.value })}><option value="">—</option>{evidenceAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.file_name}</option>)}</select></label>
          <label>{t.consentScope}<textarea placeholder={t.consentPlaceholder} value={talentForm.consentScope} onChange={(event) => setTalentForm({ ...talentForm, consentScope: event.target.value })} /></label>
          <button className={styles.primaryButton} type="button" disabled={busy} onClick={() => void createTalent()}>{t.register}</button>
        </div> : null}
      </article>

      <article className={`${styles.panel} ${styles.scriptPanel}`}>
        <div className={styles.panelHeading}><div><span>04 / CREATE</span><h2>{t.script}</h2></div><p>{t.scriptLead}</p></div>
        <div className={styles.formGrid}>
          <label className={styles.wideField}>{t.cue}<select value={cueId} onChange={(event) => selectCue(event.target.value)}><option value="custom">{t.custom}</option>{michaelCoachCues.map((cue) => <option key={cue.id} value={cue.id}>{cue.id} — {cue.text}</option>)}</select></label>
          <label className={styles.wideField}>Script<textarea value={script} onChange={(event) => { setScript(event.target.value); setCueId("custom"); }} /></label>
          <label>{t.talent}<select value={talentId} onChange={(event) => setTalentId(event.target.value)}><option value="">—</option>{(workspace?.talents || []).map((talent) => <option key={talent.id} value={talent.id}>{talent.display_name}</option>)}</select></label>
          <label>{t.provider}<select value={provider} onChange={(event) => setProvider(event.target.value as "manual" | "open_source")}><option value="manual">{t.manual}</option><option value="open_source" disabled={!providers.find(({ id }) => id === "open_source")?.configured}>{t.open_source}</option></select></label>
          <label>{t.languageLabel}<select value={language} onChange={(event) => setLanguage(event.target.value as Locale)}><option value="en">English</option><option value="es">Español</option></select></label>
          <label>{t.aspect}<select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)}><option value="9:16">9:16 · Vertical</option><option value="16:9">16:9 · Landscape</option><option value="1:1">1:1 · Square</option></select></label>
        </div>
        {!talentId ? <p className={styles.formMessage}>{t.missingTalent}</p> : null}
        <button className={styles.generateButton} type="button" disabled={busy || !canRender} onClick={() => void createRenderJob()}><span>↗</span>{t.createJob}</button>
      </article>

      <article className={styles.panel}>
        <div className={styles.panelHeading}><div><span>05 / OPERATIONS</span><h2>{t.queue}</h2></div><b className={styles.countBadge}>{workspace?.jobs.length || 0}</b></div>
        {(workspace?.jobs || []).length ? <div className={styles.jobList}>{workspace!.jobs.map((job) => <div key={job.id}><span className={styles.jobThumb}>▶</span><p><strong>{talentNames.get(job.talent_id) || "Avatar"}</strong><small>{job.script}</small></p><div><b>{job.status.replace("_", " ")}</b><small>{job.provider} · {job.aspect_ratio}</small></div></div>)}</div> : <div className={styles.emptyState}><strong>{t.emptyQueue}</strong></div>}
      </article>

      <article className={`${styles.panel} ${styles.pilotPanel}`}>
        <div className={styles.panelHeading}><div><span>06 / PROOF</span><h2>{t.pilot}</h2></div><p>{t.pilotLead}</p></div>
        <div className={styles.pilotGrid}>{[
          ["/coach-assets/test-v1/en/phone-pilot-v1/idle-loop.v1.mp4", "/coach-assets/test-v1/en/phone-pilot-v1/idle-loop.v1.jpg", t.idle],
          ["/coach-assets/test-v1/en/phone-pilot-v1/squat-depth-shallow-01.v1.mp4", "/coach-assets/test-v1/en/phone-pilot-v1/squat-depth-shallow-01.v1.jpg", t.shallow],
          ["/coach-assets/test-v1/en/phone-pilot-v1/encourage-comeback-01.v1.mp4", "/coach-assets/test-v1/en/phone-pilot-v1/encourage-comeback-01.v1.jpg", t.comeback],
        ].map(([src, poster, label]) => <div key={src}><video src={src} poster={poster} controls preload="metadata" /><p><strong>{label}</strong><span>{t.temporary}</span></p></div>)}</div>
      </article>
    </section>
  </main>;
}
