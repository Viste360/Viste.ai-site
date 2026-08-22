import styles from "./studio.module.css";

export function StudioMark({ compact = false }: { compact?: boolean }) {
  return <span className={styles.brandLockup} role="img" aria-label="Viste Studio">
    <span className={styles.studioMark} aria-hidden="true"><i /><i /><i /><i /><i /></span>
    {!compact ? <span className={styles.brandWords}><strong>viste</strong><span>studio</span></span> : null}
  </span>;
}
