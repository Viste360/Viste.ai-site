"use client";

import { useEffect, useMemo, useState } from "react";
import type { HookConcept } from "@/lib/studio-campaigns";
import type { StudioLocale } from "./studio-content";
import { useStudioAuth } from "./use-studio-auth";
import styles from "./studio-workflows.module.css";

type Brand = { id: string; name: string; default_language: string; default_voice_id: string | null; default_tts_model_id: string };
type Voice = { id: string; brand_id: string; name: string; provider: string; provider_voice_id: string; voice_type: string; language_codes: string[]; model_id: string };
type CatalogVoice = { voiceId: string; name: string; category: string; description: string; previewUrl: string; labels: Record<string, string>; languages: string[]; highQualityModelIds: string[] };
type CatalogModel = { modelId: string; name: string; description: string; languages: string[] };

const copy = {
  en: {
    overline: "Campaign lab", title: "Create", intro: "Give Studio one clear idea. It will write three 12-second openings and save the complete scripts.", badge: "Real generation · automatically saved",
    brief: "Tell us what to create", briefLead: "Only five essentials are required. Everything else is optional.", brand: "Creating for", campaign: "Campaign name", objective: "What should this achieve?", audience: "Who is it for?", cta: "What should viewers do next?", idea: "Your core idea", generate: "Create 3 openings", generating: "Creating and saving…",
    advanced: "Optional targeting details", offer: "Product or service", market: "Market", language: "Script language", channels: "Channels",
    opening: "Your first 12 seconds", full: "Full script", delivery: "Voice direction", source: "Source review", sourceRequired: "Needs a source", empty: "Your three openings will appear here with timed beats, a complete spoken script and source checks.",
    voiceSetup: "Natural voice", voiceLead: "Choose a voice, hear its sample, then save it once for future campaigns.", actual: "ElevenLabs", loadingVoices: "Checking your ElevenLabs connection…", retry: "Try again", chooseVoice: "Choose a voice", chooseModel: "Choose a speech model", voicePlaceholder: "Select a voice", modelPlaceholder: "Select a model", consent: "Consent reference", consentHelp: "Required only for cloned and professional voices.", saveVoice: "Save voice & model", savingVoice: "Saving…", voiceSaved: "Voice and model saved as the default for this brand.", noCatalog: "No voices were returned by this ElevenLabs account.", hearSample: "Listen to voice sample", savedVoice: "Saved Studio voice", noSavedVoice: "No voice saved yet", preview: "Create spoken preview", previewing: "Creating audio…", voiceWaiting: "Finish loading your private workspace before connecting a voice.", keyIdHelp: "The number shown in ElevenLabs is a key ID. Studio needs the secret shown once at creation or rotation; it begins with sk_.",
    noBrand: "Studio is preparing your Viste.ai brand workspace.", contextFailed: "Studio could not open your private workspace.", retryWorkspace: "Reload workspace", buttonNeedsBrand: "The button will activate as soon as the Viste.ai workspace is ready.", buttonReady: "Ready — this uses OpenAI and saves the campaign automatically.", unavailable: "Studio is not connected to Supabase in this environment.", access: "Complete Google sign-in to create and save private campaigns.", manageVoice: "Owner access is required to save a voice.", ready: "Ready",
  },
  es: {
    overline: "Laboratorio de campañas", title: "Crear", intro: "Dale a Studio una idea clara. Redactará tres aperturas de 12 segundos y guardará los guiones completos.", badge: "Generación real · guardado automático",
    brief: "Cuéntanos qué crear", briefLead: "Solo hacen falta cinco datos esenciales. El resto es opcional.", brand: "Creando para", campaign: "Nombre de campaña", objective: "¿Qué debe conseguir?", audience: "¿Para quién es?", cta: "¿Qué debe hacer la audiencia?", idea: "Tu idea central", generate: "Crear 3 aperturas", generating: "Creando y guardando…",
    advanced: "Datos opcionales de segmentación", offer: "Producto o servicio", market: "Mercado", language: "Idioma del guion", channels: "Canales",
    opening: "Tus primeros 12 segundos", full: "Guion completo", delivery: "Dirección de voz", source: "Revisión de fuentes", sourceRequired: "Necesita una fuente", empty: "Aquí aparecerán tres aperturas con tiempos, guion hablado completo y revisión de fuentes.",
    voiceSetup: "Voz natural", voiceLead: "Elige una voz, escucha su muestra y guárdala una vez para futuras campañas.", actual: "ElevenLabs", loadingVoices: "Comprobando tu conexión con ElevenLabs…", retry: "Intentar de nuevo", chooseVoice: "Elige una voz", chooseModel: "Elige un modelo de voz", voicePlaceholder: "Selecciona una voz", modelPlaceholder: "Selecciona un modelo", consent: "Referencia de consentimiento", consentHelp: "Solo es obligatoria para voces clonadas y profesionales.", saveVoice: "Guardar voz y modelo", savingVoice: "Guardando…", voiceSaved: "Voz y modelo guardados como predeterminados para esta marca.", noCatalog: "Esta cuenta de ElevenLabs no devolvió voces.", hearSample: "Escuchar muestra de voz", savedVoice: "Voz guardada en Studio", noSavedVoice: "Todavía no hay una voz guardada", preview: "Crear prueba hablada", previewing: "Creando audio…", voiceWaiting: "Termina de cargar tu espacio privado antes de conectar una voz.", keyIdHelp: "El número que muestra ElevenLabs es el ID de la clave. Studio necesita el secreto que aparece una sola vez al crearla o rotarla; empieza por sk_.",
    noBrand: "Studio está preparando tu espacio de marca Viste.ai.", contextFailed: "Studio no ha podido abrir tu espacio privado.", retryWorkspace: "Recargar espacio", buttonNeedsBrand: "El botón se activará cuando el espacio Viste.ai esté listo.", buttonReady: "Listo: usa OpenAI y guarda la campaña automáticamente.", unavailable: "Studio no está conectado a Supabase en este entorno.", access: "Completa el acceso con Google para crear y guardar campañas privadas.", manageVoice: "Hace falta acceso de propietario para guardar una voz.", ready: "Listo",
  },
} as const;

const channelOptions = ["linkedin", "instagram", "facebook", "youtube", "tiktok", "x"] as const;

export function StudioComposer({ locale }: { locale: StudioLocale }) {
  const c = copy[locale];
  const { configured, loading, session } = useStudioAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [catalogVoices, setCatalogVoices] = useState<CatalogVoice[]>([]);
  const [catalogModels, setCatalogModels] = useState<CatalogModel[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [catalogVoiceId, setCatalogVoiceId] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [consentReference, setConsentReference] = useState("");
  const [canManageVoices, setCanManageVoices] = useState(false);
  const [savingVoice, setSavingVoice] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [concepts, setConcepts] = useState<HookConcept[]>([]);
  const [audioUrl, setAudioUrl] = useState("");
  const [catalogAudioUrl, setCatalogAudioUrl] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [previewingSample, setPreviewingSample] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState("");
  const [contextVersion, setContextVersion] = useState(0);
  const [form, setForm] = useState({ brandId: "", name: "", objective: "", audience: "", productOrService: "", geographicMarket: "", language: locale, platforms: ["linkedin"], desiredCta: "", idea: "" });

  useEffect(() => {
    if (!session) return;
    let active = true;
    void Promise.resolve()
      .then(() => { if (active) { setContextLoading(true); setContextError(""); } return fetch("/api/studio/campaigns", { headers: { authorization: `Bearer ${session.access_token}` }, cache: "no-store" }); })
      .then(async (response) => { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Could not open campaign context"); return data; })
      .then((data) => {
        if (!active) return;
        const nextBrands = (data.brands || []) as Brand[];
        const nextVoices = (data.voices || []) as Voice[];
        const firstBrand = nextBrands[0];
        setBrands(nextBrands);
        setVoices(nextVoices);
        setCanManageVoices(Boolean(data.canManageVoices));
        if (firstBrand) {
          setForm((current) => current.brandId ? current : ({ ...current, brandId: firstBrand.id }));
          setSelectedVoice(firstBrand.default_voice_id || nextVoices.find((voice) => voice.brand_id === firstBrand.id)?.id || "");
          setSelectedModel(firstBrand.default_tts_model_id || "eleven_multilingual_v2");
        }
      })
      .catch((error) => { if (active) setContextError(error instanceof Error ? error.message : c.contextFailed); })
      .finally(() => { if (active) setContextLoading(false); });
    return () => { active = false; };
  }, [c.contextFailed, contextVersion, session]);

  useEffect(() => {
    if (!session || !form.brandId || catalogLoaded) return;
    let active = true;
    void Promise.resolve()
      .then(() => { if (active) setCatalogLoading(true); return fetch("/api/studio/elevenlabs/catalog", { headers: { authorization: `Bearer ${session.access_token}` }, cache: "no-store" }); })
      .then(async (response) => { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "ElevenLabs is unavailable"); return data; })
      .then((data) => {
        if (!active) return;
        const nextVoices = (data.voices || []) as CatalogVoice[];
        const nextModels = (data.models || []) as CatalogModel[];
        setCatalogVoices(nextVoices);
        setCatalogModels(nextModels);
        setCatalogVoiceId((current) => current || nextVoices[0]?.voiceId || "");
        setSelectedModel((current) => current && nextModels.some((model) => model.modelId === current) ? current : (nextModels.find((model) => model.modelId === "eleven_multilingual_v2")?.modelId || nextModels[0]?.modelId || ""));
        setCatalogLoaded(true);
        setCatalogError("");
      })
      .catch((error) => { if (active) setCatalogError(error instanceof Error ? error.message : "ElevenLabs is unavailable"); })
      .finally(() => { if (active) setCatalogLoading(false); });
    return () => { active = false; };
  }, [catalogLoaded, form.brandId, session]);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);
  useEffect(() => () => { if (catalogAudioUrl) URL.revokeObjectURL(catalogAudioUrl); }, [catalogAudioUrl]);

  const activeBrand = brands.find((brand) => brand.id === form.brandId);
  const savedVoices = useMemo(() => voices.filter((voice) => voice.brand_id === form.brandId && voice.language_codes.includes(form.language)), [form.brandId, form.language, voices]);
  const activeVoice = savedVoices.some((voice) => voice.id === selectedVoice) ? selectedVoice : (savedVoices[0]?.id || "");
  const catalogVoice = catalogVoices.find((voice) => voice.voiceId === catalogVoiceId);
  const needsConsent = catalogVoice?.category === "professional" || catalogVoice?.category === "cloned";
  const compatibleModels = catalogVoice?.highQualityModelIds.length ? catalogModels.filter((model) => catalogVoice.highQualityModelIds.includes(model.modelId)) : catalogModels;
  const modelOptions = compatibleModels.length ? compatibleModels : catalogModels;

  function update(name: string, value: string) { setForm((current) => ({ ...current, [name]: value })); }
  function toggleChannel(channel: string) { setForm((current) => ({ ...current, platforms: current.platforms.includes(channel) ? current.platforms.filter((item) => item !== channel) : [...current.platforms, channel] })); }
  function loadCatalogAgain() { setCatalogLoaded(false); setCatalogError(""); }
  function reloadContext() { setContextVersion((current) => current + 1); }

  async function savePreference(voiceId: string, modelId: string) {
    if (!session || !form.brandId) return false;
    const response = await fetch("/api/studio/campaigns", { method: "PATCH", headers: { authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ brandId: form.brandId, voiceId, modelId }) });
    if (!response.ok) { const data = await response.json().catch(() => ({})); setMessage(data.error || "Could not save the preferred voice"); return false; }
    setBrands((current) => current.map((brand) => brand.id === form.brandId ? { ...brand, default_voice_id: voiceId, default_tts_model_id: modelId } : brand));
    return true;
  }

  async function chooseSavedVoice(voiceId: string) {
    setSelectedVoice(voiceId);
    const voice = voices.find((item) => item.id === voiceId);
    if (!voice) return;
    setSelectedModel(voice.model_id);
    await savePreference(voice.id, voice.model_id);
  }

  async function saveCatalogVoice() {
    if (!session || !form.brandId || !catalogVoice || !selectedModel || !canManageVoices) return;
    setSavingVoice(true);
    setMessage("");
    const verified = catalogVoice.languages.filter((language): language is StudioLocale => language === "en" || language === "es");
    const languageCodes = verified.length ? verified : [form.language as StudioLocale];
    const response = await fetch("/api/studio/voices", { method: "POST", headers: { authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ brandId: form.brandId, providerVoiceId: catalogVoice.voiceId, languageCodes, rightsReference: consentReference, modelId: selectedModel }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(data.error || "Could not save the voice"); setSavingVoice(false); return; }
    const saved = data.voice as Voice;
    setVoices((current) => [...current.filter((voice) => voice.id !== saved.id && voice.provider_voice_id !== saved.provider_voice_id), saved]);
    setSelectedVoice(saved.id);
    const preferred = await savePreference(saved.id, selectedModel);
    setSavingVoice(false);
    if (preferred) setMessage(c.voiceSaved);
  }

  async function previewCatalogVoice() {
    if (!session || !catalogVoice) return;
    setPreviewingSample(true);
    setMessage("");
    const response = await fetch("/api/studio/elevenlabs/catalog", { method: "POST", headers: { authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ voiceId: catalogVoice.voiceId }) });
    if (!response.ok) { const data = await response.json().catch(() => ({})); setMessage(data.error || "The voice sample is unavailable"); setPreviewingSample(false); return; }
    if (catalogAudioUrl) URL.revokeObjectURL(catalogAudioUrl);
    setCatalogAudioUrl(URL.createObjectURL(await response.blob()));
    setPreviewingSample(false);
  }

  async function generate(event: React.FormEvent) {
    event.preventDefault();
    if (!session || !form.brandId) return;
    setBusy(true);
    setMessage("");
    setConcepts([]);
    const response = await fetch("/api/studio/campaigns/hooks", { method: "POST", headers: { authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ ...form, selectedVoiceId: activeVoice || null, ttsModelId: activeVoice ? selectedModel || null : null }) });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setMessage(data.error || "Generation failed");
    setConcepts(data.concepts || []);
  }

  async function previewVoice(concept: HookConcept) {
    if (!session || !activeVoice) return;
    setPreviewing(true);
    setMessage("");
    const text = `${concept.openingHook}\n${concept.openingBeats.map((beat) => beat.spoken).join(" ")} ${concept.mainScript}`.slice(0, 900);
    const response = await fetch("/api/studio/voice/preview", { method: "POST", headers: { authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ voiceId: activeVoice, text, language: form.language }) });
    if (!response.ok) { const data = await response.json().catch(() => ({})); setMessage(data.error || "Voice preview failed"); setPreviewing(false); return; }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(await response.blob()));
    setPreviewing(false);
  }

  const generateHelp = !session ? c.access : !form.brandId ? c.buttonNeedsBrand : c.buttonReady;

  return <>
    <header className={styles.pageHeader}><div><p>{c.overline}</p><h1>{c.title}</h1><span>{c.intro}</span></div><b>{c.badge}</b></header>
    {!configured ? <div className={styles.notice}>{c.unavailable}</div> : !loading && !session ? <div className={styles.notice}>{c.access}</div> : null}
    {message ? <p className={styles.message} role="status">{message}</p> : null}
    <div className={styles.composerGrid}>
      <form className={styles.briefPanel} onSubmit={generate}>
        <div className={styles.panelHeading}><span>01</span><div><h2>{c.brief}</h2><p>{c.briefLead}</p></div></div>
        {contextError ? <div className={styles.contextError} role="alert"><div><strong>{c.contextFailed}</strong><span>{contextError}</span></div><button type="button" onClick={reloadContext}>{c.retryWorkspace}</button></div> : activeBrand ? <div className={styles.brandPill}><span>{c.brand}</span><strong>{activeBrand.name}</strong><i>{c.ready}</i></div> : <p className={styles.setupHint} data-loading={contextLoading ? "true" : undefined}>{c.noBrand}</p>}
        {brands.length > 1 ? <label><span>{c.brand}</span><select value={form.brandId} onChange={(event) => update("brandId", event.target.value)} required>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label> : null}
        <label><span>{c.campaign}</span><input value={form.name} onChange={(event) => update("name", event.target.value)} required minLength={2} /></label>
        <label><span>{c.idea}</span><textarea className={styles.ideaField} value={form.idea} onChange={(event) => update("idea", event.target.value)} required minLength={12} /></label>
        <label><span>{c.objective}</span><textarea value={form.objective} onChange={(event) => update("objective", event.target.value)} required minLength={8} /></label>
        <label><span>{c.audience}</span><textarea value={form.audience} onChange={(event) => update("audience", event.target.value)} required minLength={8} /></label>
        <label><span>{c.cta}</span><input value={form.desiredCta} onChange={(event) => update("desiredCta", event.target.value)} required minLength={2} /></label>
        <details className={styles.advancedFields}><summary>{c.advanced}</summary><div>
          <div className={styles.splitFields}><label><span>{c.offer}</span><input value={form.productOrService} onChange={(event) => update("productOrService", event.target.value)} /></label><label><span>{c.market}</span><input value={form.geographicMarket} onChange={(event) => update("geographicMarket", event.target.value)} /></label></div>
          <label><span>{c.language}</span><select value={form.language} onChange={(event) => update("language", event.target.value)}><option value="en">English</option><option value="es">Español</option></select></label>
          <fieldset><legend>{c.channels}</legend><div className={styles.channelRow}>{channelOptions.map((channel) => <button type="button" data-active={form.platforms.includes(channel)} onClick={() => toggleChannel(channel)} key={channel}>{channel}</button>)}</div></fieldset>
        </div></details>
        <section className={styles.voiceSetup} aria-labelledby="voice-setup-title">
          <div className={styles.voiceSetupHeading}><div><span>{c.actual}</span><h3 id="voice-setup-title">{c.voiceSetup}</h3><p>{c.voiceLead}</p></div><i data-state={catalogError ? "error" : catalogLoaded ? "ready" : "waiting"}>{catalogLoading ? "···" : catalogError ? "!" : catalogLoaded ? catalogVoices.length : "—"}</i></div>
          {!session || !form.brandId ? <div className={styles.connectionState}><span aria-hidden="true" /> <p>{c.voiceWaiting}</p></div> : catalogLoading || (!catalogLoaded && !catalogError) ? <div className={styles.connectionState} data-loading="true"><span aria-hidden="true" /><p>{c.loadingVoices}</p></div> : catalogError ? <><div className={styles.inlineError}><span>{catalogError}</span><button type="button" onClick={loadCatalogAgain}>{c.retry}</button></div><p className={styles.keyIdHelp}>{c.keyIdHelp}</p></> : !catalogVoices.length ? <p className={styles.setupHint}>{c.noCatalog}</p> : <>
            <div className={styles.catalogSummary}><span>{catalogVoices.length} {locale === "en" ? "voices" : "voces"}</span><span>{catalogModels.length} {locale === "en" ? "models" : "modelos"}</span></div>
            <label><span>{c.chooseVoice}</span><select value={catalogVoiceId} onChange={(event) => setCatalogVoiceId(event.target.value)}><option value="" disabled>{c.voicePlaceholder}</option>{catalogVoices.map((voice) => <option value={voice.voiceId} key={voice.voiceId}>{voice.name} · {voice.labels.accent || voice.category}</option>)}</select></label>
            {catalogVoice?.description ? <p className={styles.voiceDescription}>{catalogVoice.description}</p> : null}
            {catalogVoice?.previewUrl ? <button className={styles.sampleButton} type="button" disabled={previewingSample} onClick={() => void previewCatalogVoice()}>{previewingSample ? c.previewing : c.hearSample}</button> : null}
            {catalogAudioUrl ? <audio className={styles.catalogAudio} controls autoPlay src={catalogAudioUrl}>{c.hearSample}</audio> : null}
            <label><span>{c.chooseModel}</span><select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}><option value="" disabled>{c.modelPlaceholder}</option>{modelOptions.map((model) => <option value={model.modelId} key={model.modelId}>{model.name}</option>)}</select></label>
            {needsConsent ? <label><span>{c.consent}</span><input value={consentReference} onChange={(event) => setConsentReference(event.target.value)} required={needsConsent} /><small>{c.consentHelp}</small></label> : null}
            <button className={styles.secondaryButton} type="button" disabled={!canManageVoices || !catalogVoice || !selectedModel || (needsConsent && consentReference.trim().length < 3) || savingVoice} onClick={saveCatalogVoice}>{savingVoice ? c.savingVoice : c.saveVoice}</button>
            {!canManageVoices ? <p className={styles.setupHint}>{c.manageVoice}</p> : null}
          </>}
          {savedVoices.length ? <label className={styles.savedVoice}><span>{c.savedVoice}</span><select value={activeVoice} onChange={(event) => void chooseSavedVoice(event.target.value)}>{savedVoices.map((voice) => <option value={voice.id} key={voice.id}>{voice.name} · {voice.model_id}</option>)}</select></label> : <p className={styles.setupHint}>{c.noSavedVoice}</p>}
        </section>
        <button className={styles.primaryButton} type="submit" disabled={!session || !form.brandId || !form.platforms.length || busy} aria-describedby="generate-help">{busy ? c.generating : c.generate}<i>↗</i></button>
        <p className={styles.buttonHelp} id="generate-help">{generateHelp}</p>
      </form>
      <section className={styles.conceptPanel} aria-live="polite">
        <div className={styles.panelHeading}><span>02</span><div><h2>{c.opening}</h2><p>{concepts.length ? `${concepts.length} / 3` : "0 / 3"}</p></div></div>
        {!concepts.length ? <div className={styles.conceptEmpty}><i>12s</i><p>{c.empty}</p></div> : concepts.map((concept, index) => <article className={styles.conceptCard} key={concept.conceptName}>
          <div className={styles.conceptTop}><span>0{index + 1}</span><div><h3>{concept.conceptName}</h3><strong>{concept.openingHook}</strong></div></div>
          <div className={styles.beatGrid}>{concept.openingBeats.map((beat) => <div key={beat.timing}><b>{beat.timing}</b><strong>{beat.spoken}</strong><span>{beat.visual}</span><em>{beat.onScreenText}</em></div>)}</div>
          <details><summary>{c.full}</summary><p>{concept.mainScript}</p></details>
          <div className={styles.notes}><div><span>{c.delivery}</span><p>{concept.deliveryNotes}</p></div><div><span>{c.source}</span><p>{concept.sourceClaims.length ? concept.sourceClaims.map((claim) => <small data-required={claim.sourceStatus === "source_required"} key={claim.claim}>{claim.sourceStatus === "source_required" ? `${c.sourceRequired}: ` : "✓ "}{claim.claim}</small>) : "✓"}</p></div></div>
          {activeVoice ? <div className={styles.voiceRow}><label><span>{c.savedVoice}</span><select value={activeVoice} onChange={(event) => void chooseSavedVoice(event.target.value)}>{savedVoices.map((voice) => <option value={voice.id} key={voice.id}>{voice.name}</option>)}</select></label><button type="button" disabled={previewing} onClick={() => previewVoice(concept)}>{previewing ? c.previewing : c.preview}</button></div> : null}
        </article>)}
        {audioUrl ? <audio className={styles.audioPlayer} controls src={audioUrl}>{c.preview}</audio> : null}
      </section>
    </div>
  </>;
}
