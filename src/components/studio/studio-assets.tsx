"use client";

import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import type { StudioLocale } from "./studio-content";
import { useStudioAuth } from "./use-studio-auth";
import styles from "./studio.module.css";

type Asset = {
  id: string;
  brand_id: string | null;
  file_name: string;
  content_type: string;
  bytes: number;
  asset_type: string;
  source: string;
  licence: string;
  permitted_use: string;
  ai_generated: boolean;
  status: string;
  created_at: string;
};
type Brand = { id: string; name: string };

const copy = {
  en: {
    overline: "Brand library",
    title: "Assets",
    intro: "Private, rights-aware source material for every campaign.",
    upload: "Upload content",
    all: "All assets",
    images: "Images",
    video: "Video",
    documents: "Documents",
    audio: "Audio",
    uploadTitle: "Add approved content",
    uploadLead: "Files remain private. Add provenance and usage rights before they enter a campaign.",
    signInTitle: "Sign in to your Studio workspace",
    signInLead: "We will send a secure sign-in link to an authorised organisation account.",
    email: "Work email",
    sendLink: "Send secure link",
    signedOut: "A sign-in link has been sent. Return here after signing in.",
    file: "Choose a file",
    drop: "Images, video, audio, PDF, Word or PowerPoint · up to 500 MB",
    brand: "Brand",
    organisation: "Organisation library",
    type: "Asset type",
    source: "Source / owner",
    licence: "Licence",
    use: "Permitted use",
    ai: "AI-generated content",
    confirm: "I confirm that this organisation may use this file",
    start: "Start private upload",
    uploading: "Uploading securely…",
    complete: "Upload complete",
    emptyTitle: "Your approved library starts here.",
    emptyLead: "Upload company-owned brand guides, footage, images, documents and music. Nothing is published automatically.",
    storageMissing: "Studio storage is not connected in this preview. Add the Supabase Preview variables and apply the Studio migration to enable sign-in and uploads.",
    close: "Close",
    noBrand: "No brand workspace yet",
  },
  es: {
    overline: "Biblioteca de marca",
    title: "Recursos",
    intro: "Material privado y con derechos claros para cada campaña.",
    upload: "Subir contenido",
    all: "Todos",
    images: "Imágenes",
    video: "Vídeo",
    documents: "Documentos",
    audio: "Audio",
    uploadTitle: "Añadir contenido aprobado",
    uploadLead: "Los archivos son privados. Añade su procedencia y derechos antes de usarlos en una campaña.",
    signInTitle: "Accede a tu espacio Studio",
    signInLead: "Enviaremos un enlace seguro a una cuenta autorizada de la organización.",
    email: "Email de trabajo",
    sendLink: "Enviar enlace seguro",
    signedOut: "Hemos enviado el enlace. Vuelve aquí después de iniciar sesión.",
    file: "Elegir archivo",
    drop: "Imágenes, vídeo, audio, PDF, Word o PowerPoint · hasta 500 MB",
    brand: "Marca",
    organisation: "Biblioteca de la organización",
    type: "Tipo de recurso",
    source: "Fuente / propietario",
    licence: "Licencia",
    use: "Uso permitido",
    ai: "Contenido generado con IA",
    confirm: "Confirmo que esta organización puede usar el archivo",
    start: "Iniciar subida privada",
    uploading: "Subiendo de forma segura…",
    complete: "Subida completada",
    emptyTitle: "Tu biblioteca aprobada empieza aquí.",
    emptyLead: "Sube guías de marca, vídeos, imágenes, documentos y música propios. Nada se publica automáticamente.",
    storageMissing: "El almacenamiento de Studio no está conectado en esta vista previa. Añade las variables de Supabase para Preview y aplica la migración de Studio para activar el acceso y las subidas.",
    close: "Cerrar",
    noBrand: "Todavía no hay un espacio de marca",
  },
} as const;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function inferAssetType(file: File) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "document";
}

function studioAssetKind(contentType: string) {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  if (contentType.startsWith("audio/")) return "audio";
  return "document";
}

export function StudioAssets({ locale }: { locale: StudioLocale }) {
  const c = copy[locale];
  const { configured, loading, session, supabase } = useStudioAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filter, setFilter] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [brandId, setBrandId] = useState("");
  const [assetType, setAssetType] = useState("document");
  const [source, setSource] = useState(locale === "en" ? "Company owned" : "Propiedad de la empresa");
  const [licence, setLicence] = useState(locale === "en" ? "Company owned" : "Propiedad de la empresa");
  const [permittedUse, setPermittedUse] = useState(locale === "en" ? "Approved company marketing and campaign use" : "Uso aprobado en marketing y campañas de la empresa");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadAssets = useCallback(async (activeSession: Session) => {
    const response = await fetch("/api/studio/assets", { headers: { authorization: `Bearer ${activeSession.access_token}` }, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Could not load the asset library");
    setAssets(payload.assets || []);
    setBrands(payload.brands || []);
  }, []);

  useEffect(() => {
    if (!session) return;
    let active = true;
    void Promise.resolve().then(() => loadAssets(session)).catch((caught) => { if (active) { setMessage(caught instanceof Error ? caught.message : "Could not load the asset library"); setError(true); } });
    return () => { active = false; };
  }, [loadAssets, session]);

  async function uploadAsset(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !session || !file || !confirmed) return;
    setUploading(true); setProgress(10); setError(false); setMessage(c.uploading);
    try {
      const prepare = await fetch("/api/studio/assets/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ fileName: file.name, size: file.size, contentType: file.type || "application/octet-stream", brandId: brandId || null, assetType, source, licence, permittedUse, aiGenerated }),
      });
      const prepared = await prepare.json().catch(() => ({}));
      if (!prepare.ok) throw new Error(prepared.error || "Could not prepare the upload");
      setProgress(35);
      const { error: storageError } = await supabase.storage.from(prepared.bucket).uploadToSignedUrl(prepared.path, prepared.token, file, { contentType: file.type, upsert: false });
      if (storageError) throw storageError;
      setProgress(85);
      const complete = await fetch("/api/studio/assets/complete", { method: "POST", headers: { "Content-Type": "application/json", authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ assetId: prepared.assetId }) });
      const completed = await complete.json().catch(() => ({}));
      if (!complete.ok) throw new Error(completed.error || "Could not confirm the upload");
      setProgress(100); setMessage(c.complete); setFile(null); setConfirmed(false);
      await loadAssets(session);
    } catch (caught) {
      setError(true); setMessage(caught instanceof Error ? caught.message : "Upload failed"); setProgress(0);
    } finally { setUploading(false); }
  }

  const visibleAssets = assets.filter((asset) => filter === "all" || studioAssetKind(asset.content_type) === filter);
  const categories = [["all", c.all], ["image", c.images], ["video", c.video], ["document", c.documents], ["audio", c.audio]];

  return <>
    <header className={styles.appPageHeader}><div><p>{c.overline}</p><h1>{c.title}</h1><span>{c.intro}</span></div><button className={styles.createButton} type="button" onClick={() => setPanelOpen(true)}><i>+</i><span className={styles.buttonLabel}>{c.upload}</span></button></header>

    {panelOpen ? <section className={styles.uploadPanel} aria-labelledby="upload-heading">
      <div className={styles.uploadPanelHeader}><div><h2 id="upload-heading">{session ? c.uploadTitle : c.signInTitle}</h2><p>{session ? c.uploadLead : c.signInLead}</p></div><button type="button" className={styles.closeButton} aria-label={c.close} onClick={() => setPanelOpen(false)}>×</button></div>
      {!configured ? <p className={styles.statusMessage} data-error="true">{c.storageMissing}</p> : !session ? <p className={styles.statusMessage}>{c.signInLead}</p> : <form className={styles.uploadForm} onSubmit={uploadAsset}>
        <label className={styles.dropZone}><input type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.csv" onChange={(event) => { const selected = event.target.files?.[0] || null; setFile(selected); if (selected) setAssetType(inferAssetType(selected)); }} /><span><i>↑</i><strong>{file ? file.name : c.file}</strong><span>{file ? formatBytes(file.size) : c.drop}</span></span></label>
        <div className={styles.metadataFields}>
          <label><span className={styles.fieldLabel}>{c.brand}</span><select className={styles.selectInput} value={brandId} onChange={(event) => setBrandId(event.target.value)}><option value="">{brands.length ? c.organisation : c.noBrand}</option>{brands.map((brand) => <option value={brand.id} key={brand.id}>{brand.name}</option>)}</select></label>
          <label><span className={styles.fieldLabel}>{c.type}</span><select className={styles.selectInput} value={assetType} onChange={(event) => setAssetType(event.target.value)}>{["logo", "image", "video", "audio", "document", "template"].map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
          <label><span className={styles.fieldLabel}>{c.source}</span><input className={styles.textInput} value={source} onChange={(event) => setSource(event.target.value)} required /></label>
          <label><span className={styles.fieldLabel}>{c.licence}</span><input className={styles.textInput} value={licence} onChange={(event) => setLicence(event.target.value)} required /></label>
          <label><span className={styles.fieldLabel}>{c.use}</span><input className={styles.textInput} value={permittedUse} onChange={(event) => setPermittedUse(event.target.value)} required /></label>
          <label><span className={styles.fieldLabel}>{c.ai}</span><select className={styles.selectInput} value={aiGenerated ? "yes" : "no"} onChange={(event) => setAiGenerated(event.target.value === "yes")}><option value="no">{locale === "en" ? "No" : "No"}</option><option value="yes">{locale === "en" ? "Yes" : "Sí"}</option></select></label>
        </div>
        <div className={styles.uploadActions}><label><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> <span className={styles.fieldLabel} style={{ display: "inline" }}>{c.confirm}</span></label>{uploading ? <div className={styles.progressTrack}><i style={{ width: `${progress}%` }} /></div> : null}<button className={styles.inlineButton} disabled={!file || !confirmed || uploading} type="submit">{uploading ? c.uploading : c.start}</button></div>
      </form>}
      {message ? <p className={styles.statusMessage} data-error={error ? "true" : "false"} role="status">{message}</p> : null}
    </section> : null}

    <div className={styles.assetToolbar}>{categories.map(([key, label]) => <button className={styles.filterButton} data-active={filter === key ? "true" : "false"} type="button" onClick={() => setFilter(key)} key={key}>{label}</button>)}<button className={styles.viewButton} type="button" aria-label={locale === "en" ? "Grid view" : "Vista de cuadrícula"}>▦</button><button className={styles.viewButton} type="button" aria-label={locale === "en" ? "List view" : "Vista de lista"}>☷</button></div>

    {loading ? <div className={styles.loadingState}>{locale === "en" ? "Opening your private library…" : "Abriendo tu biblioteca privada…"}</div> : <section className={styles.assetGrid} aria-label={c.title}>
      {visibleAssets.map((asset) => <article className={styles.assetCard} key={asset.id}><div className={styles.assetPreview} data-type={studioAssetKind(asset.content_type)}><span>{asset.asset_type.toUpperCase()}</span></div><div className={styles.assetMeta}><strong title={asset.file_name}>{asset.file_name}</strong><span>{formatBytes(asset.bytes)} · {new Date(asset.created_at).toLocaleDateString(locale)}</span><div className={styles.assetTags}><span>{asset.source}</span><span>{asset.ai_generated ? "AI" : asset.licence}</span></div></div></article>)}
      {!visibleAssets.length ? <div className={styles.emptyAssets}><div><i>＋</i><h2>{c.emptyTitle}</h2><p>{configured ? c.emptyLead : c.storageMissing}</p><button type="button" className={styles.createButton} onClick={() => setPanelOpen(true)}><i>+</i><span>{c.upload}</span></button></div></div> : null}
    </section>}
  </>;
}
