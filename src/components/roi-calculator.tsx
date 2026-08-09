"use client";

import { useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { calculateRoi, type RoiInputs, type RoiResult } from "@/lib/roi-calculator";

type Locale = "en" | "es";
type Currency = "EUR" | "USD" | "GBP" | "MXN";

const labels = {
  en: {
    people: "People involved in each task",
    minutes: "Minutes per task, per person",
    volume: "Tasks per month",
    hourly: "Loaded hourly cost",
    rework: "Current error or rework rate (%)",
    assisted: "Share of handling that could be assisted (%)",
    implementation: "One-time implementation cost",
    operating: "Monthly operating cost",
    currency: "Currency",
    assumptions: "Time reduction within the assisted share",
    low: "Low",
    base: "Base",
    high: "High",
    calculate: "Calculate planning scenarios",
    error: "Enter valid non-negative values and keep low ≤ base ≤ high.",
    currentEffort: "Current monthly effort",
    currentCost: "Current capacity cost",
    released: "Capacity released",
    remaining: "Assisted scenario effort",
    gross: "Gross capacity value",
    net: "Net monthly planning value",
    breakEven: "Planning break-even",
    noBreakEven: "Not reached with this scenario",
    months: "months",
    hours: "hours",
    print: "Print or save as PDF",
    reset: "Reset",
    disclaimer: "Planning model only—not a guarantee, quotation or promise of savings. Released capacity becomes cash savings only if the operating model and cost base actually change.",
  },
  es: {
    people: "Personas que intervienen en cada tarea",
    minutes: "Minutos por tarea y persona",
    volume: "Tareas al mes",
    hourly: "Coste horario completo",
    rework: "Tasa actual de error o reproceso (%)",
    assisted: "Parte del trabajo que podría recibir asistencia (%)",
    implementation: "Coste único de implementación",
    operating: "Coste operativo mensual",
    currency: "Moneda",
    assumptions: "Reducción de tiempo dentro de la parte asistida",
    low: "Bajo",
    base: "Base",
    high: "Alto",
    calculate: "Calcular escenarios de planificación",
    error: "Introduce valores válidos no negativos y mantén bajo ≤ base ≤ alto.",
    currentEffort: "Esfuerzo mensual actual",
    currentCost: "Coste actual de capacidad",
    released: "Capacidad liberada",
    remaining: "Esfuerzo en el escenario asistido",
    gross: "Valor bruto de capacidad",
    net: "Valor neto mensual de planificación",
    breakEven: "Punto de equilibrio estimado",
    noBreakEven: "No se alcanza en este escenario",
    months: "meses",
    hours: "horas",
    print: "Imprimir o guardar como PDF",
    reset: "Reiniciar",
    disclaimer: "Modelo de planificación, no garantía, presupuesto ni promesa de ahorro. La capacidad liberada solo se convierte en ahorro de caja si cambian realmente el modelo operativo y la base de costes.",
  },
} as const;

const initial = {
  people: "",
  minutesPerTask: "",
  monthlyVolume: "",
  hourlyCost: "",
  reworkRate: "0",
  assistedShare: "",
  implementationCost: "",
  monthlyOperatingCost: "",
  lowEfficiency: "25",
  baseEfficiency: "45",
  highEfficiency: "65",
};

type InputState = typeof initial;

function parsed(values: InputState): RoiInputs | null {
  const result = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Number(value)])) as RoiInputs;
  if (Object.values(result).some((value) => !Number.isFinite(value) || value < 0)) return null;
  if (!result.people || !result.minutesPerTask || !result.monthlyVolume || !result.hourlyCost) return null;
  if (result.assistedShare > 100 || result.reworkRate > 100 || result.highEfficiency > 100) return null;
  if (!(result.lowEfficiency <= result.baseEfficiency && result.baseEfficiency <= result.highEfficiency)) return null;
  return result;
}

export function RoiCalculator({ locale }: { locale: Locale }) {
  const c = labels[locale];
  const [values, setValues] = useState<InputState>(initial);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [result, setResult] = useState<RoiResult | null>(null);
  const [error, setError] = useState("");
  const started = useRef(false);
  const number = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-GB", { maximumFractionDigits: 1 });
  const money = new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-GB", { style: "currency", currency, maximumFractionDigits: 0 });

  function start() {
    if (started.current) return;
    started.current = true;
    trackEvent("roi_tool_started", { locale });
  }

  function update(key: keyof InputState, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const inputs = parsed(values);
    if (!inputs) { setError(c.error); setResult(null); return; }
    setError("");
    setResult(calculateRoi(inputs));
    trackEvent("roi_tool_completed", { locale, scenario: "three_scenarios" });
  }

  function reset() {
    setValues(initial);
    setResult(null);
    setError("");
    started.current = false;
  }

  const inputs = [
    ["people", c.people, "1", "1000"],
    ["minutesPerTask", c.minutes, "0.1", "1440"],
    ["monthlyVolume", c.volume, "1", "1000000"],
    ["hourlyCost", c.hourly, "0.01", "100000"],
    ["reworkRate", c.rework, "0", "100"],
    ["assistedShare", c.assisted, "0", "100"],
    ["implementationCost", c.implementation, "0", "100000000"],
    ["monthlyOperatingCost", c.operating, "0", "10000000"],
  ] as const;

  return <div className="roi-tool">
    <form className="roi-form" onSubmit={submit} onFocusCapture={start}>
      <div className="roi-input-grid">
        {inputs.map(([key, label, min, max]) => <label key={key}>{label}<input type="number" inputMode="decimal" min={min} max={max} step="any" required value={values[key]} onChange={(event) => update(key, event.target.value)} /></label>)}
        <label>{c.currency}<select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}><option>EUR</option><option>USD</option><option>GBP</option><option>MXN</option></select></label>
      </div>
      <fieldset className="scenario-assumptions"><legend>{c.assumptions}</legend><div>{(["lowEfficiency", "baseEfficiency", "highEfficiency"] as const).map((key, index) => <label key={key}>{[c.low, c.base, c.high][index]}<span><input aria-label={[c.low, c.base, c.high][index]} type="number" min="0" max="100" step="1" required value={values[key]} onChange={(event) => update(key, event.target.value)} />%</span></label>)}</div></fieldset>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button" type="submit">{c.calculate}</button>
    </form>

    {result ? <section className="roi-results" aria-live="polite">
      <div className="roi-current"><article><span>{c.currentEffort}</span><strong>{number.format(result.currentMonthlyHours)} {c.hours}</strong></article><article><span>{c.currentCost}</span><strong>{money.format(result.currentMonthlyCost)}</strong></article></div>
      <div className="scenario-grid">{(["low", "base", "high"] as const).map((key, index) => {
        const scenario = result.scenarios[key];
        return <article className={key === "base" ? "featured" : ""} key={key}><p className="eyebrow">{[c.low, c.base, c.high][index]} · {scenario.efficiency}%</p><dl><div><dt>{c.released}</dt><dd>{number.format(scenario.releasedHours)} {c.hours}</dd></div><div><dt>{c.remaining}</dt><dd>{number.format(scenario.remainingHours)} {c.hours}</dd></div><div><dt>{c.gross}</dt><dd>{money.format(scenario.grossCapacityValue)}</dd></div><div><dt>{c.net}</dt><dd>{money.format(scenario.netMonthlyValue)}</dd></div><div><dt>{c.breakEven}</dt><dd>{scenario.breakEvenMonths === null ? c.noBreakEven : `${number.format(scenario.breakEvenMonths)} ${c.months}`}</dd></div></dl></article>;
      })}</div>
      <p className="roi-disclaimer">{c.disclaimer}</p>
      <div className="button-row print-actions"><button className="button button-ghost" type="button" onClick={() => window.print()}>{c.print}</button><button className="text-button" type="button" onClick={reset}>{c.reset}</button></div>
    </section> : null}
  </div>;
}
