import { publicConfig } from "@/lib/public-config";

export function OperatorDetails({ locale }: { locale: "en" | "es" }) {
  const operator = publicConfig.legalOperator;
  const verified = [operator.companyName, operator.companyNumber, operator.registeredAddress, operator.taxVat].filter(Boolean);
  if (!verified.length) return null;

  const rows = [
    [locale === "en" ? "Legal company name" : "Razón social", operator.companyName],
    [locale === "en" ? "Company number" : "Número de empresa", operator.companyNumber],
    [locale === "en" ? "Registered address" : "Domicilio social", operator.registeredAddress],
    [locale === "en" ? "Tax / VAT" : "Identificación fiscal / IVA", operator.taxVat],
    [locale === "en" ? "Privacy contact" : "Contacto de privacidad", operator.privacyContact],
    [locale === "en" ? "Security contact" : "Contacto de seguridad", operator.securityContact],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return <section className="shell operator-details" aria-labelledby="operator-title"><p className="eyebrow">{locale === "en" ? "Verified operator information" : "Información verificada del operador"}</p><h2 id="operator-title">{locale === "en" ? "Website operator" : "Operador del sitio"}</h2><dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value.includes("@") ? <a href={`mailto:${value}`}>{value}</a> : value}</dd></div>)}</dl></section>;
}
