import type { Locale } from "./types";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viste.ai";

export const navigation = {
  en: [
    ["Services", "/services"],
    ["Solutions", "/solutions"],
    ["Industries", "/industries"],
    ["Partners", "/partners"],
    ["Process", "/process"],
    ["Insights", "/insights"],
    ["About", "/about"],
  ],
  es: [
    ["Servicios", "/es/servicios"],
    ["Soluciones", "/es/soluciones"],
    ["Sectores", "/es/sectores"],
    ["Socios", "/es/socios"],
    ["Proceso", "/es/proceso"],
    ["Recursos", "/es/recursos"],
    ["Nosotros", "/es/nosotros"],
  ],
} satisfies Record<Locale, [string, string][]>;

export const labels = {
  en: {
    contact: "Discuss your use case",
    explore: "Explore solution blueprints",
    learnMore: "View details",
    home: "Home",
    menu: "Menu",
    close: "Close",
    language: "Español",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    security: "Security",
    copyright: "Practical AI implementation for established businesses.",
    back: "Back to insights",
  },
  es: {
    contact: "Cuéntanos tu caso",
    explore: "Ver diseños de solución",
    learnMore: "Ver detalles",
    home: "Inicio",
    menu: "Menú",
    close: "Cerrar",
    language: "English",
    privacy: "Privacidad",
    terms: "Términos",
    cookies: "Cookies",
    security: "Seguridad",
    copyright: "Implementación práctica de IA para empresas consolidadas.",
    back: "Volver a recursos",
  },
} satisfies Record<Locale, Record<string, string>>;

export const contactPath: Record<Locale, string> = {
  en: "/contact",
  es: "/es/contacto",
};

export const legalPaths: Record<Locale, Record<"privacy" | "terms" | "cookies" | "security", string>> = {
  en: { privacy: "/privacy", terms: "/terms", cookies: "/cookies", security: "/security" },
  es: {
    privacy: "/es/privacidad",
    terms: "/es/terminos",
    cookies: "/es/cookies",
    security: "/es/seguridad",
  },
};
