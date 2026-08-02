export type Locale = "en" | "es";

export type Section = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type PageDefinition = {
  id: string;
  locale: Locale;
  path: string;
  alternatePath: string;
  eyebrow: string;
  title: string;
  description: string;
  lead: string;
  sections: Section[];
  cta: {
    label: string;
    href: string;
    note: string;
  };
  index?: boolean;
};

export type CatalogItem = {
  id: string;
  path: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  problem: Record<Locale, string>;
  approach: Record<Locale, string[]>;
  outcomes: Record<Locale, string[]>;
  guardrail: Record<Locale, string>;
  metrics: Record<Locale, string[]>;
};

export type Insight = {
  id: string;
  path: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  publishedAt: string;
  readTime: Record<Locale, string>;
  sections: Record<Locale, Section[]>;
};
