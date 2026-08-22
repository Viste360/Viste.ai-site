import Link from "next/link";
import { StudioMark } from "./studio-mark";
import { studioCopy, workflowSteps, type StudioLocale } from "./studio-content";
import styles from "./studio.module.css";

export function StudioLanding({ locale }: { locale: StudioLocale }) {
  const c = studioCopy[locale];
  const stageLabels = locale === "en" ? ["Idea", "Script", "Storyboard", "Render", "Publish"] : ["Idea", "Guion", "Storyboard", "Render", "Publicar"];

  return <main className={styles.landing} id="studio-content">
    <header className={styles.landingHeader}>
      <Link href={c.landingPath} aria-label="Viste Studio"><StudioMark /></Link>
      <nav aria-label={locale === "en" ? "Studio navigation" : "Navegación de Studio"}>
        <a href="#workflow">{locale === "en" ? "How it works" : "Cómo funciona"}</a>
        <a href="#control">{locale === "en" ? "Human control" : "Control humano"}</a>
        <Link href={c.alternateLandingPath}>{c.localeName}</Link>
        <Link className={styles.headerCta} href={c.appPath}>{locale === "en" ? "Open Studio" : "Abrir Studio"}</Link>
      </nav>
    </header>

    <section className={styles.hero}>
      <div className={styles.ambientOne} /><div className={styles.ambientTwo} />
      <div className={styles.heroCopy}>
        <p className={styles.kicker}><span />{c.eyebrow}</p>
        <h1>{c.headline}</h1>
        <p>{c.lead}</p>
        <div className={styles.heroActions}>
          <Link className={styles.primaryAction} href={c.appPath}>{c.primary}<span>↗</span></Link>
          <a className={styles.secondaryAction} href="#workflow">{c.secondary}<span>↓</span></a>
        </div>
        <div className={styles.heroTrust}>
          <span>{locale === "en" ? "Private brand workspace" : "Espacio de marca privado"}</span>
          <span>{locale === "en" ? "Source-linked content" : "Contenido con fuentes"}</span>
          <span>{locale === "en" ? "Approval before publishing" : "Aprobación antes de publicar"}</span>
        </div>
      </div>

      <div className={styles.productStage} aria-label={locale === "en" ? "Campaign workspace preview" : "Vista previa del espacio de campaña"}>
        <div className={styles.productTopbar}><StudioMark compact /><span>Launch campaign</span><b>{locale === "en" ? "Draft" : "Borrador"}</b></div>
        <div className={styles.productGrid}>
          <aside className={styles.productRail} tabIndex={0} aria-label={locale === "en" ? "Campaign stages" : "Etapas de campaña"}>{stageLabels.map((label, index) => <div className={index === 2 ? styles.activeStage : ""} key={label}><i>{index + 1}</i><span>{label}</span></div>)}</aside>
          <div className={styles.storyboardPreview}>
            <div className={styles.previewHeading}><div><span>{locale === "en" ? "CAMPAIGN STORYBOARD" : "STORYBOARD DE CAMPAÑA"}</span><strong>{locale === "en" ? "Make the complex feel clear" : "Haz que lo complejo se sienta claro"}</strong></div><button type="button">{locale === "en" ? "Review" : "Revisar"}</button></div>
            <div className={styles.sceneStrip}>
              <article><div className={styles.sceneVisualOne}><span>01</span><i /></div><strong>{locale === "en" ? "Open with tension" : "Abrir con tensión"}</strong><small>00:00—00:04</small></article>
              <article><div className={styles.sceneVisualTwo}><span>02</span><i /><i /><i /></div><strong>{locale === "en" ? "Reveal the system" : "Mostrar el sistema"}</strong><small>00:04—00:12</small></article>
              <article><div className={styles.sceneVisualThree}><span>03</span><i /></div><strong>{locale === "en" ? "Land the value" : "Aterrizar el valor"}</strong><small>00:12—00:18</small></article>
            </div>
            <div className={styles.timeline}><span /><span /><span /><i /></div>
            <div className={styles.sourceBar}><span>{locale === "en" ? "3 approved sources" : "3 fuentes aprobadas"}</span><span>{locale === "en" ? "Brand voice applied" : "Voz de marca aplicada"}</span><b>{locale === "en" ? "Ready for review" : "Listo para revisión"}</b></div>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.trustSection}>
      <p className={styles.sectionIndex}>01 / {locale === "en" ? "BRAND INTELLIGENCE" : "INTELIGENCIA DE MARCA"}</p>
      <div><h2>{c.trusted}</h2><p>{c.trustedText}</p></div>
      <div className={styles.knowledgePanel}>
        <span>{locale === "en" ? "KNOWLEDGE SOURCES" : "FUENTES DE CONOCIMIENTO"}</span>
        {[
          locale === "en" ? "Brand guidelines.pdf" : "Guía de marca.pdf",
          locale === "en" ? "Approved claims" : "Afirmaciones aprobadas",
          locale === "en" ? "Website knowledge" : "Conocimiento web",
        ].map((item, index) => <div key={item}><i>{index === 0 ? "PDF" : index === 1 ? "OK" : "URL"}</i><strong>{item}</strong><span>{locale === "en" ? "Available" : "Disponible"}</span></div>)}
      </div>
    </section>

    <section className={styles.workflowSection} id="workflow">
      <div className={styles.sectionIntro}><p className={styles.sectionIndex}>02 / {locale === "en" ? "WORKFLOW" : "FLUJO"}</p><h2>{c.flowTitle}</h2><p>{c.flowLead}</p></div>
      <div className={styles.workflowList}>{workflowSteps[locale].map(([number, title, description], index) => <article key={number} className={index === 2 ? styles.featuredStep : ""}><span>{number}</span><div className={styles.stepGlyph} data-stage={index} aria-hidden="true"><i /><i /><i /></div><h3>{title}</h3><p>{description}</p></article>)}</div>
    </section>

    <section className={styles.formatSection}>
      <div className={styles.formatCopy}><p className={styles.sectionIndex}>03 / {locale === "en" ? "CAMPAIGN PACKS" : "PACKS DE CAMPAÑA"}</p><h2>{c.formatsTitle}</h2><p>{c.formatsLead}</p></div>
      <div className={styles.formatCanvas} aria-hidden="true">
        <div className={styles.formatLandscape}><span>16:9</span><i /></div>
        <div className={styles.formatVertical}><span>9:16</span><i /></div>
        <div className={styles.formatSquare}><span>1:1</span><i /></div>
        <div className={styles.formatCopyCard}><span>LINKEDIN</span><b>{locale === "en" ? "A sharper way to tell the story." : "Una forma más clara de contar la historia."}</b></div>
      </div>
    </section>

    <section className={styles.controlSection} id="control">
      <div className={styles.controlVisual}>
        <div className={styles.reviewCard}><span>{locale === "en" ? "REVIEW 04" : "REVISIÓN 04"}</span><h3>{locale === "en" ? "Every factual claim stays visible." : "Cada afirmación factual sigue visible."}</h3><div><i>✓</i><p><strong>{locale === "en" ? "Approved source" : "Fuente aprobada"}</strong><small>{locale === "en" ? "Website knowledge · updated recently" : "Conocimiento web · actualizado recientemente"}</small></p></div><button type="button">{locale === "en" ? "Approve for render" : "Aprobar para render"}</button></div>
        <div className={styles.commentCard}><span>MG</span><p>{locale === "en" ? "Keep the opening line. Replace the scene asset before approval." : "Mantén la frase inicial. Cambia el recurso de escena antes de aprobar."}</p></div>
      </div>
      <div className={styles.controlCopy}><p className={styles.sectionIndex}>04 / {locale === "en" ? "REVIEW" : "REVISIÓN"}</p><h2>{c.controlTitle}</h2><p>{c.controlLead}</p><ul><li>{locale === "en" ? "Source provenance beside every claim" : "Procedencia al lado de cada afirmación"}</li><li>{locale === "en" ? "Versioned comments and decisions" : "Comentarios y decisiones versionados"}</li><li>{locale === "en" ? "No publishing without explicit approval" : "Sin publicación sin aprobación explícita"}</li></ul></div>
    </section>

    <section className={styles.finalCta}>
      <StudioMark compact />
      <p className={styles.sectionIndex}>05 / {locale === "en" ? "BEGIN" : "EMPEZAR"}</p>
      <h2>{c.finalTitle}</h2><p>{c.finalLead}</p>
      <Link className={styles.primaryAction} href={c.assetsPath}>{c.upload}<span>↗</span></Link>
      <footer><span>© 2026 Viste Studio</span><span>{locale === "en" ? "Human-approved content systems" : "Sistemas de contenido con aprobación humana"}</span></footer>
    </section>
  </main>;
}
