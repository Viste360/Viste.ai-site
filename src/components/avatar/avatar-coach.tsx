"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cueDefaults, michaelCoachCues } from "@/lib/avatar/cue-library";
import { createCueHistory, recordCue, selectCue, type CoachCue, type CoachEvent } from "@/lib/avatar/coach";
import { idlePilotAsset, pilotAssetForCue, type PilotCoachAsset } from "@/lib/avatar/pilot-assets";
import styles from "./avatar.module.css";

type Locale = "en" | "es";
type CameraState = "idle" | "requesting" | "active" | "blocked" | "unsupported";

const copy = {
  en: {
    product: "Michael Live Coach",
    status: "Private workout preview",
    studio: "Avatar Studio",
    studioHref: "/avatar/studio",
    locale: "ES",
    localeHref: "/es/avatar",
    headline: "Your form.\nMichael’s timing.",
    intro: "A focused squat session where coaching appears only when it can help. Camera frames stay on this device.",
    cameraTitle: "Your movement space",
    cameraIdle: "Camera off",
    cameraActive: "Camera connected",
    cameraBlocked: "Camera access was not granted. The guided simulator still works.",
    cameraUnsupported: "This browser does not support camera access. The guided simulator still works.",
    enableCamera: "Enable camera",
    retryCamera: "Try camera again",
    cameraPrivacy: "On-device preview · no recording or upload",
    coachIdle: "I’m watching your rhythm. Take your time.",
    coachLabel: "Pre-generated coach",
    fallback: "Caption fallback active",
    testMedia: "Temporary test media",
    canonical: "Approved English cue",
    session: "Squat · Set 1",
    target: "6 controlled reps",
    reps: "Reps",
    stageReady: "Ready to begin",
    stageLive: "Set in progress",
    stageDone: "Set complete",
    start: "Start coaching demo",
    restart: "Reset set",
    shallow: "Log a shallow rep",
    strong: "Log a strong rep",
    pain: "I feel pain",
    note: "Demo controls stand in for the on-device pose signal. Two shallow reps are required before Michael corrects depth.",
    timeline: "Coach decisions",
    silence: "Michael stayed quiet — the speech gap and cue rules are working.",
    welcome: "Session ready. Start when you have space to move safely.",
    listening: "Listening",
    live: "Speaking",
    safety: "Safety",
  },
  es: {
    product: "Michael Live Coach",
    status: "Vista previa privada de entrenamiento",
    studio: "Avatar Studio",
    studioHref: "/es/avatar/studio",
    locale: "EN",
    localeHref: "/avatar",
    headline: "Tu técnica.\nEl momento justo.",
    intro: "Una sesión de sentadillas centrada en intervenir solo cuando la ayuda aporta valor. La cámara permanece en este dispositivo.",
    cameraTitle: "Tu espacio de movimiento",
    cameraIdle: "Cámara apagada",
    cameraActive: "Cámara conectada",
    cameraBlocked: "No se concedió acceso a la cámara. El simulador guiado sigue funcionando.",
    cameraUnsupported: "Este navegador no admite acceso a la cámara. El simulador guiado sigue funcionando.",
    enableCamera: "Activar cámara",
    retryCamera: "Probar cámara de nuevo",
    cameraPrivacy: "Vista local · sin grabación ni subida",
    coachIdle: "Observo tu ritmo. Tómate tu tiempo.",
    coachLabel: "Coach pre-generado",
    fallback: "Respaldo por subtítulos activo",
    testMedia: "Vídeo temporal de prueba",
    canonical: "Guion aprobado en inglés",
    session: "Sentadilla · Serie 1",
    target: "6 repeticiones controladas",
    reps: "Reps",
    stageReady: "Listo para empezar",
    stageLive: "Serie en curso",
    stageDone: "Serie completada",
    start: "Iniciar demo de coaching",
    restart: "Reiniciar serie",
    shallow: "Registrar repetición corta",
    strong: "Registrar repetición sólida",
    pain: "Siento dolor",
    note: "Los controles de demo sustituyen la señal de postura local. Se requieren dos repeticiones cortas antes de que Michael corrija la profundidad.",
    timeline: "Decisiones del coach",
    silence: "Michael mantuvo silencio: el intervalo de voz y las reglas están funcionando.",
    welcome: "Sesión preparada. Empieza cuando tengas espacio para moverte con seguridad.",
    listening: "Escuchando",
    live: "Hablando",
    safety: "Seguridad",
  },
} as const;

function buildEvent(type: string, counter: number, repNumber?: number, metrics: CoachEvent["metrics"] = {}): CoachEvent {
  return {
    id: `${type}-${counter}`,
    sessionId: "michael-squat-demo-v1",
    exercise: "squat",
    event: type,
    confidence: type.startsWith("safety.") ? 1 : 0.92,
    repNumber,
    setNumber: 1,
    metrics,
    occurredAt: new Date().toISOString(),
  };
}

function CoachMedia({
  cue,
  fallbackLabel,
  testMediaLabel,
  onCueEnded,
}: {
  cue: CoachCue | null;
  fallbackLabel: string;
  testMediaLabel: string;
  onCueEnded: () => void;
}) {
  const cueAsset = pilotAssetForCue(cue?.id);
  const desiredAsset = cueAsset ?? idlePilotAsset;
  const playerRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeRef = useRef(0);
  const pendingRef = useRef(0);
  const requestedAssetRef = useRef(idlePilotAsset.id);
  const [activePlayer, setActivePlayer] = useState(0);
  const [slots, setSlots] = useState<[PilotCoachAsset, PilotCoachAsset]>([idlePilotAsset, idlePilotAsset]);

  useEffect(() => {
    if (requestedAssetRef.current === desiredAsset.id) return;
    requestedAssetRef.current = desiredAsset.id;
    const nextPlayer = activeRef.current === 0 ? 1 : 0;
    pendingRef.current = nextPlayer;
    setSlots((current) => {
      const next = [...current] as [PilotCoachAsset, PilotCoachAsset];
      next[nextPlayer] = desiredAsset;
      return next;
    });
  }, [desiredAsset]);

  const activatePlayer = (index: number) => {
    if (pendingRef.current !== index && index !== activeRef.current) return;
    const next = playerRefs.current[index];
    if (!next) return;
    next.currentTime = 0;
    next.muted = slots[index].muted;
    void next.play().then(() => {
      const previousIndex = activeRef.current;
      if (previousIndex !== index) {
        const previous = playerRefs.current[previousIndex];
        if (previous) previous.muted = true;
        activeRef.current = index;
        pendingRef.current = -1;
        setActivePlayer(index);
        window.setTimeout(() => {
          previous?.pause();
          if (previous) previous.currentTime = 0;
        }, 180);
      }
    }).catch(() => {
      // The visible transcript remains the guaranteed fallback when a browser
      // blocks audible autoplay or a media file cannot start.
    });
  };

  return (
    <div className={styles.coachVisual} data-asset-key={cue?.assetKey ?? "temporary-owner-test-v1.idle"}>
      <div className={styles.coachGlow} />
      <div className={styles.coachMonogram}>M</div>
      {slots.map((asset, index) => (
        <video
          key={`${index}-${asset.id}`}
          ref={(element) => { playerRefs.current[index] = element; }}
          className={`${styles.coachVideo} ${activePlayer === index ? styles.coachVideoActive : ""}`}
          src={asset.mp4}
          poster={asset.poster}
          loop={asset.loop}
          muted={asset.muted}
          playsInline
          preload="auto"
          aria-label={asset.loop ? "Listening coach video" : cue?.text}
          onCanPlay={() => activatePlayer(index)}
          onEnded={() => {
            if (index === activeRef.current && !asset.loop) onCueEnded();
          }}
        >
          {asset.captions ? <track kind="captions" src={asset.captions} srcLang="en" label="English" /> : null}
        </video>
      ))}
      <div className={styles.soundBars} aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <span className={styles.fallbackBadge}>{cueAsset ? testMediaLabel : fallbackLabel}</span>
    </div>
  );
}

export function AvatarCoach({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cueTimerRef = useRef<number | null>(null);
  const queuedCueTimerRef = useRef<number | null>(null);
  const presentEventsRef = useRef<(events: CoachEvent[]) => void>(() => undefined);
  const eventCounterRef = useRef(0);
  const shallowEvidenceRef = useRef(0);
  const correctionGivenRef = useRef(false);
  const historyRef = useRef(createCueHistory("michael-squat-demo-v1"));
  const [camera, setCamera] = useState<CameraState>("idle");
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [reps, setReps] = useState(0);
  const [currentCue, setCurrentCue] = useState<CoachCue | null>(null);
  const [decisionLog, setDecisionLog] = useState<string[]>([t.welcome]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => {
    stopCamera();
    if (cueTimerRef.current !== null) window.clearTimeout(cueTimerRef.current);
    if (queuedCueTimerRef.current !== null) window.clearTimeout(queuedCueTimerRef.current);
  }, [stopCamera]);

  const requestCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera("unsupported");
      return;
    }
    setCamera("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      stopCamera();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamera("active");
    } catch {
      setCamera("blocked");
    }
  };

  const presentEvents = useCallback((events: CoachEvent[]) => {
    const nowMs = Date.now();
    const decision = selectCue(events, michaelCoachCues, {
      nowMs,
      trackingReady: true,
      minimumSpeechGapMs: cueDefaults.minimumSpeechGapMs,
      recentHistorySize: cueDefaults.recentHistorySize,
      history: historyRef.current,
    });
    if (!decision.cue) {
      const gapOnlyDecision = selectCue(events, michaelCoachCues, {
        nowMs,
        trackingReady: true,
        minimumSpeechGapMs: 0,
        recentHistorySize: cueDefaults.recentHistorySize,
        history: historyRef.current,
      });
      if (gapOnlyDecision.cue && Number.isFinite(historyRef.current.lastSpokenAt)) {
        const waitMs = Math.max(0, cueDefaults.minimumSpeechGapMs - (nowMs - historyRef.current.lastSpokenAt));
        if (queuedCueTimerRef.current !== null) window.clearTimeout(queuedCueTimerRef.current);
        queuedCueTimerRef.current = window.setTimeout(() => presentEventsRef.current(events), waitMs + 25);
      }
      setDecisionLog((items) => [t.silence, ...items].slice(0, 4));
      return;
    }
    if (queuedCueTimerRef.current !== null) {
      window.clearTimeout(queuedCueTimerRef.current);
      queuedCueTimerRef.current = null;
    }
    historyRef.current = recordCue(historyRef.current, decision.cue, nowMs, cueDefaults.recentHistorySize);
    setCurrentCue(decision.cue);
    setDecisionLog((items) => [decision.cue!.text, ...items].slice(0, 4));
    if (cueTimerRef.current !== null) window.clearTimeout(cueTimerRef.current);
    if (!pilotAssetForCue(decision.cue.id)) {
      const visibleMs = Math.max(3_200, decision.cue.text.length * 45);
      cueTimerRef.current = window.setTimeout(() => setCurrentCue(null), visibleMs);
    }
  }, [t.silence]);

  useEffect(() => {
    presentEventsRef.current = presentEvents;
  }, [presentEvents]);

  const eventFor = useCallback((type: string, repNumber?: number, metrics?: CoachEvent["metrics"]) => {
    eventCounterRef.current += 1;
    return buildEvent(type, eventCounterRef.current, repNumber, metrics);
  }, []);

  const startDemo = () => {
    historyRef.current = createCueHistory("michael-squat-demo-v1");
    shallowEvidenceRef.current = 0;
    correctionGivenRef.current = false;
    setRunning(true);
    setComplete(false);
    setReps(0);
    presentEvents([eventFor("session.started")]);
  };

  const registerRep = (quality: "shallow" | "strong") => {
    if (!running || complete) return;
    const nextRep = Math.min(6, reps + 1);
    setReps(nextRep);
    const events: CoachEvent[] = [];

    if (quality === "shallow") {
      shallowEvidenceRef.current += 1;
      if (shallowEvidenceRef.current >= 2) {
        correctionGivenRef.current = true;
        shallowEvidenceRef.current = 0;
        events.push(eventFor("form.depth_shallow", nextRep, { bottomKneeAngle: 118, evidenceReps: 2 }));
      }
    } else {
      shallowEvidenceRef.current = Math.max(0, shallowEvidenceRef.current - 1);
      if (correctionGivenRef.current) {
        correctionGivenRef.current = false;
        events.push(eventFor("form.recovered", nextRep, { bottomKneeAngle: 96 }));
      } else {
        events.push(eventFor("rep.good", nextRep, { bottomKneeAngle: 96 }));
      }
    }

    if (nextRep === 4) events.push(eventFor("set.two_reps_remaining", nextRep));
    if (nextRep === 5) events.push(eventFor("set.last_rep", nextRep));
    if (nextRep === 6) {
      events.push(eventFor("set.completed", nextRep));
      setComplete(true);
      setRunning(false);
    }
    if (events.length > 0) presentEvents(events);
  };

  const reportPain = () => {
    presentEvents([eventFor("safety.pain_reported", reps)]);
    setRunning(false);
  };

  const cameraMessage = camera === "active" ? t.cameraActive : camera === "blocked" ? t.cameraBlocked : camera === "unsupported" ? t.cameraUnsupported : t.cameraIdle;
  const stage = complete ? t.stageDone : running ? t.stageLive : t.stageReady;

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link href={locale === "en" ? "/" : "/es"} className={styles.brand} aria-label="Viste.ai">
          <span className={styles.mark}>V</span><span>viste<span>.ai</span></span>
        </Link>
        <div className={styles.productName}><span className={styles.liveDot} />{t.product}</div>
        <div className={styles.headerActions}>
          <span>{t.status}</span>
          <Link href={t.studioHref} className={styles.studioLink}>{t.studio}</Link>
          <Link href={t.localeHref} className={styles.localeLink}>{t.locale}</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>VISTE / MOVEMENT INTELLIGENCE</p>
          <h1>{t.headline.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
          <p className={styles.intro}>{t.intro}</p>
        </div>

        <div className={styles.experience}>
          <section className={styles.cameraCard} aria-label={t.cameraTitle}>
            <div className={styles.cardTopline}>
              <div><span className={camera === "active" ? styles.activeDot : styles.neutralDot} />{cameraMessage}</div>
              <span>01 / CAMERA</span>
            </div>
            <div className={styles.cameraStage}>
              <video ref={videoRef} muted playsInline className={camera === "active" ? styles.cameraVideoActive : styles.cameraVideo} aria-label={t.cameraTitle} />
              {camera !== "active" && (
                <div className={styles.frameGuide} aria-hidden="true">
                  <i /><i /><i /><i />
                  <div className={styles.bodyGuide}><span /><b /><em /></div>
                </div>
              )}
              <div className={styles.privacyBadge}>{t.cameraPrivacy}</div>
              <button type="button" className={styles.cameraButton} onClick={requestCamera} disabled={camera === "requesting"}>
                {camera === "blocked" ? t.retryCamera : camera === "requesting" ? "…" : t.enableCamera}
              </button>
            </div>
          </section>

          <aside className={`${styles.coachCard} ${currentCue?.tone === "safety" ? styles.coachSafety : ""}`} aria-live="polite">
            <div className={styles.cardTopline}>
              <div><span className={currentCue ? styles.activeDot : styles.neutralDot} />{currentCue ? t.live : t.listening}</div>
              <span>02 / COACH</span>
            </div>
            <CoachMedia cue={currentCue} fallbackLabel={t.fallback} testMediaLabel={t.testMedia} onCueEnded={() => setCurrentCue(null)} />
            <div className={styles.caption}>
              <small>{currentCue?.tone === "safety" ? t.safety : t.coachLabel} · {t.canonical}</small>
              <p>{currentCue?.text ?? t.coachIdle}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.sessionPanel}>
        <div className={styles.sessionHeading}>
          <div><p>03 / LIVE SESSION</p><h2>{t.session}</h2><span>{t.target}</span></div>
          <div className={styles.repCount}><strong>{reps}</strong><span>/ 6 {t.reps}</span></div>
        </div>
        <div className={styles.progressTrack} role="progressbar" aria-label={`${reps} of 6 repetitions`} aria-valuemin={0} aria-valuemax={6} aria-valuenow={reps}>
          {Array.from({ length: 6 }, (_, index) => <i key={index} className={index < reps ? styles.repDone : ""} />)}
        </div>
        <div className={styles.sessionControls}>
          <button type="button" className={styles.primaryAction} onClick={startDemo}>{running || complete ? t.restart : t.start}</button>
          <button type="button" onClick={() => registerRep("shallow")} disabled={!running}>{t.shallow}</button>
          <button type="button" onClick={() => registerRep("strong")} disabled={!running}>{t.strong}</button>
          <button type="button" className={styles.safetyAction} onClick={reportPain} disabled={!running}>{t.pain}</button>
        </div>
        <div className={styles.sessionFoot}>
          <span className={styles.stagePill}>{stage}</span>
          <p>{t.note}</p>
        </div>
      </section>

      <section className={styles.decisions}>
        <div><p>04 / RUNTIME</p><h2>{t.timeline}</h2></div>
        <ol>{decisionLog.map((item, index) => <li key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol>
      </section>
    </main>
  );
}
