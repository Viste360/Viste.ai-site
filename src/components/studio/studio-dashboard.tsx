import Link from "next/link";
import { studioCopy, type StudioLocale } from "./studio-content";
import styles from "./studio.module.css";

const dashboardCopy = {
  en: {
    overline: "Creative operations",
    title: "Your studio, in motion.",
    intro: "Bring approved knowledge and assets together before shaping the next campaign.",
    newCampaign: "New campaign",
    demo: "Illustrative demo workspace",
    heroLabel: "START WITH YOUR BRAND",
    heroTitle: "One grounded idea can become an entire campaign pack.",
    heroText: "Upload the source material you trust. Viste Studio will carry brand context, rights and approvals through the creative workflow.",
    prepare: "Prepare brand assets",
    health: "Brand readiness",
    healthText: "Concrete gaps to resolve before reliable generation.",
    campaigns: "Example campaign workspace",
    activity: "Studio activity",
  },
  es: {
    overline: "Operaciones creativas",
    title: "Tu estudio, en movimiento.",
    intro: "Reúne el conocimiento y los recursos aprobados antes de dar forma a la próxima campaña.",
    newCampaign: "Nueva campaña",
    demo: "Espacio de demostración ilustrativo",
    heroLabel: "EMPIEZA POR TU MARCA",
    heroTitle: "Una idea con fuentes puede convertirse en todo un pack de campaña.",
    heroText: "Sube el material en el que confías. Viste Studio mantendrá el contexto de marca, los derechos y las aprobaciones durante el flujo creativo.",
    prepare: "Preparar recursos de marca",
    health: "Preparación de marca",
    healthText: "Carencias concretas que resolver antes de generar contenido fiable.",
    campaigns: "Espacio de campañas de ejemplo",
    activity: "Actividad del estudio",
  },
} as const;

export function StudioDashboard({ locale }: { locale: StudioLocale }) {
  const c = dashboardCopy[locale];
  const common = studioCopy[locale];
  const gaps = locale === "en"
    ? [["No preferred narrator selected", "Add a voice for English and Spanish"], ["No campaign footage uploaded", "Start with approved company-owned media"], ["Approval policy needs an owner", "Assign a reviewer before publishing"]]
    : [["No hay narrador preferido", "Añade una voz para español e inglés"], ["No hay vídeos de campaña", "Empieza con material propio aprobado"], ["La política necesita un responsable", "Asigna un revisor antes de publicar"]];
  const examples = locale === "en"
    ? [["Viste.ai", "WhatsApp product walk-through", "Storyboard"], ["Genidi", "Family history education", "Script review"], ["DeepBridge Advisory", "Executive insight series", "Brief"]]
    : [["Viste.ai", "Demostración de producto WhatsApp", "Storyboard"], ["Genidi", "Educación sobre historia familiar", "Revisión de guion"], ["DeepBridge Advisory", "Serie de visión ejecutiva", "Briefing"]];

  return <>
    <header className={styles.appPageHeader}><div><p>{c.overline}</p><h1>{c.title}</h1><span>{c.intro}</span><span className={styles.demoBadge}>{c.demo}</span></div><Link className={styles.createButton} href={common.createPath}><i>+</i><span className={styles.buttonLabel}>{c.newCampaign}</span></Link></header>
    <div className={styles.dashboardGrid}>
      <section className={styles.campaignHero}><span>{c.heroLabel}</span><h2>{c.heroTitle}</h2><p>{c.heroText}</p><Link className={styles.createButton} href={common.createPath}><span>{c.prepare}</span><i>↗</i></Link><div className={styles.campaignOrbit} /></section>
      <section className={styles.brandHealth}><div className={styles.panelLabel}><span>{c.health.toUpperCase()}</span><b>{locale === "en" ? "Needs attention" : "Requiere atención"}</b></div><h3>{c.health}</h3><p>{c.healthText}</p><div className={styles.healthList}>{gaps.map(([title, detail]) => <div key={title}><i /><p><strong>{title}</strong><span>{detail}</span></p></div>)}</div></section>
      <div className={styles.dashboardLower}>
        <section className={styles.panel}><div className={styles.panelHeader}><h2>{c.campaigns}</h2><Link href={common.assetsPath}>{locale === "en" ? "Open library ↗" : "Abrir biblioteca ↗"}</Link></div><div className={styles.campaignRows}>{examples.map(([brand, title, status]) => <article key={title}><span className={styles.campaignThumb} /><div><strong>{title}</strong><span>{brand} · {locale === "en" ? "Example content" : "Contenido de ejemplo"}</span></div><span className={styles.statusPill}>{status}</span></article>)}</div></section>
        <section className={styles.panel}><div className={styles.panelHeader}><h2>{c.activity}</h2><span className={styles.demoBadge}>{locale === "en" ? "No fabricated metrics" : "Sin métricas inventadas"}</span></div><div className={styles.activityList}>{[
          locale === "en" ? ["Workspace created", "Ready for your organisation content"] : ["Espacio creado", "Listo para el contenido de tu organización"],
          locale === "en" ? ["Private asset library available", "Upload requires an authorised account"] : ["Biblioteca privada disponible", "La subida requiere una cuenta autorizada"],
          locale === "en" ? ["Publishing remains approval-gated", "No automatic publishing is enabled"] : ["Publicación sujeta a aprobación", "La publicación automática no está activa"],
        ].map(([title, detail]) => <div key={title}><i /><p><strong>{title}</strong><span>{detail}</span></p><time>—</time></div>)}</div></section>
      </div>
    </div>
  </>;
}
