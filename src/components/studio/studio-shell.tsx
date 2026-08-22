"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { navItems, studioCopy, type StudioLocale } from "./studio-content";
import { StudioMark } from "./studio-mark";
import { useStudioAuth } from "./use-studio-auth";
import styles from "./studio.module.css";

type NavIconName = "home" | "create" | "assets" | "calendar";

const activeNavItems = [
  { index: 0, icon: "home" as const },
  { index: 3, icon: "create" as const },
  { index: 5, icon: "assets" as const },
  { index: 6, icon: "calendar" as const },
];

function NavIcon({ name }: { name: NavIconName }) {
  if (name === "home") return <svg className={styles.navGlyph} viewBox="0 0 24 24" aria-hidden="true"><path d="M3.75 10.5 12 3.75l8.25 6.75v8.25a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-4.5v6h-4.5a1.5 1.5 0 0 1-1.5-1.5Z" /></svg>;
  if (name === "create") return <svg className={styles.navGlyph} viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.25v13.5M5.25 12h13.5" /><rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" /></svg>;
  if (name === "assets") return <svg className={styles.navGlyph} viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="3" /><circle cx="9" cy="9.5" r="1.5" /><path d="m5.5 17 4.25-4 3.25 2.75 2.75-2.5L18.5 16" /></svg>;
  return <svg className={styles.navGlyph} viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.25" width="17" height="15" rx="3" /><path d="M7.5 3.5v3.25m9-3.25v3.25M3.75 9.5h16.5M8 13h.01m4 0h.01m4 0h.01M8 17h.01m4 0h.01" /></svg>;
}

export function StudioShell({ locale, children }: { locale: StudioLocale; children: ReactNode }) {
  const pathname = usePathname();
  const c = studioCopy[locale];
  const { session, signOut } = useStudioAuth();
  const assetsActive = pathname.endsWith("/assets");
  const createActive = pathname.endsWith("/create");
  const calendarActive = pathname.endsWith("/calendar");

  return <div className={styles.appShell}>
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}><Link href={c.landingPath} aria-label={locale === "en" ? "Viste Studio home" : "Inicio de Viste Studio"}><StudioMark /></Link></div>
      <div className={styles.workspaceSwitch}><span>{locale === "en" ? "WORKSPACE" : "ESPACIO"}</span><div><b className={styles.workspaceAvatar}>VS</b><strong>Viste Studio</strong><i>⌄</i></div></div>
      <nav className={styles.appNav} aria-label={locale === "en" ? "Studio workspace" : "Espacio de Studio"}>
        {activeNavItems.map(({ index, icon }) => {
          const label = navItems[locale][index];
          const href = index === 3 ? c.createPath : index === 5 ? c.assetsPath : index === 6 ? c.calendarPath : c.appPath;
          const active = index === 3 ? createActive : index === 5 ? assetsActive : index === 6 ? calendarActive : index === 0 && !assetsActive && !createActive && !calendarActive;
          return <Link aria-current={active ? "page" : undefined} aria-label={label} className={active ? styles.navActive : ""} href={href} key={label}><span className={styles.navIconShell}><NavIcon name={icon} /></span><span className={styles.navLabel}>{label}</span></Link>;
        })}
      </nav>
      <div className={styles.sidebarFoot}>
        <div className={styles.buildState}><span>{locale === "en" ? "Private preview" : "Vista privada"}</span><p>{locale === "en" ? "Uploads use your organisation workspace when storage is configured." : "Las subidas usan el espacio de tu organización cuando el almacenamiento está configurado."}</p></div>
        <div className={styles.sidebarLocale}><Link href={c.alternateAppPath}>{c.localeName}</Link><Link href={c.landingPath}>viste.ai ↗</Link></div>
      </div>
    </aside>
    <section className={styles.appMain}>
      <header className={styles.appTopbar}><span>VISTE CONTENT ENGINE / STUDIO</span><div className={styles.appTopbarActions}><div className={styles.topButton}><i />{locale === "en" ? "Private owner workspace" : "Espacio privado del propietario"}</div><button className={styles.profileButton} type="button" title={session?.user.email || undefined} aria-label={locale === "en" ? "Sign out" : "Cerrar sesión"} onClick={() => void signOut()}>YW</button></div></header>
      <div className={styles.appContent}>{children}</div>
    </section>
  </div>;
}
