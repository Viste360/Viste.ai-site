import { siteUrl } from "@/content/site";

type Locale = "en" | "es";

const offers = {
  en: [
    ["Local Start", "490", "Fixed project price"],
    ["Local Business", "950", "Starting project price from €950"],
    ["Signature", "1500", "Starting project price from €1,500"],
  ],
  es: [
    ["Local Start", "490", "Precio fijo por proyecto"],
    ["Local Business", "950", "Precio inicial por proyecto desde 950 €"],
    ["Signature", "1500", "Precio inicial por proyecto desde 1.500 €"],
  ],
} as const;

export function LocalBusinessPricingJsonLd({ locale }: { locale: Locale }) {
  const path = locale === "en" ? "/services/websites-for-local-businesses" : "/es/servicios/paginas-web-negocios-locales";
  const url = new URL(path, siteUrl).toString();
  const data = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "@id": `${url}#offer-catalog`,
    name: locale === "en" ? "Viste Local website packages" : "Paquetes web Viste Local",
    url,
    inLanguage: locale,
    itemListElement: offers[locale].map(([name, price, description]) => ({
      "@type": "Offer",
      name,
      price,
      priceCurrency: "EUR",
      description,
      url: `${url}#packages`,
      seller: { "@id": `${siteUrl}/#organization` },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
