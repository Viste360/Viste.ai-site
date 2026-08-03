"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Locale = "en" | "es";

const conversations = [
  { id: "A-104", customer: "Alba Stores", channel: "WhatsApp", waiting: 14, status: "unanswered", owner: "Unassigned", message: "Can you confirm whether order 4187 can arrive before Friday?", draft: "Thanks for checking. I can see order 4187 is awaiting carrier confirmation. I’ll verify the delivery window with operations before confirming a date." },
  { id: "A-103", customer: "Northline Service", channel: "WhatsApp", waiting: 4, status: "draft", owner: "Maya", message: "The replacement unit arrived, but the serial number is different.", draft: "Thanks for flagging this. I’ll compare the replacement serial against the approved service record and confirm the next step." },
  { id: "A-102", customer: "Central Property", channel: "Web", waiting: 2, status: "assigned", owner: "Leo", message: "We need to update access instructions for tonight’s arrival.", draft: "I can help route this update. For security, an authorised property operator must approve changes to access instructions." },
] as const;

export function WhatsAppDemo({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const [selectedId, setSelectedId] = useState<string>(conversations[0].id);
  const [owner, setOwner] = useState("Unassigned");
  const [approved, setApproved] = useState(false);
  const [crmSent, setCrmSent] = useState(false);
  const selected = useMemo(() => conversations.find((item) => item.id === selectedId) || conversations[0], [selectedId]);

  function select(id: string, nextOwner: string) {
    setSelectedId(id);
    setOwner(nextOwner);
    setApproved(false);
    setCrmSent(false);
  }

  return <main className="demo-page"><section className="page-hero demo-hero"><div className="shell"><p className="eyebrow">{es ? "Demostración operativa" : "Operational demonstration"}</p><h1>{es ? "Control de ventas y servicio por WhatsApp" : "WhatsApp sales and service control"}</h1><p className="lede">{es ? "Todos los nombres, mensajes, tiempos y métricas son datos ilustrativos. Esta demo muestra el diseño del flujo, no un sistema de cliente en producción." : "Every name, message, timer and metric is illustrative. This demo shows the workflow design—not a live client system."}</p><div className="demo-notice" role="note">{es ? "DATOS ILUSTRATIVOS · NO SON RESULTADOS DE CLIENTES" : "ILLUSTRATIVE DATA · NOT CLIENT RESULTS"}</div></div></section>
    <section className="shell demo-workspace" aria-label={es ? "Bandeja compartida ilustrativa" : "Illustrative shared inbox"}>
      <header><div><span className="status-dot" />{es ? "Bandeja operativa compartida" : "Shared operations inbox"}</div><strong>{es ? "3 conversaciones abiertas" : "3 open conversations"}</strong></header>
      <div className="demo-grid">
        <aside className="demo-inbox"><div className="demo-inbox-heading"><h2>{es ? "Cola activa" : "Active queue"}</h2><span>2 SLA</span></div>{conversations.map((conversation) => <button key={conversation.id} className={selected.id === conversation.id ? "active" : ""} onClick={() => select(conversation.id, conversation.owner)}><span className={conversation.status === "unanswered" ? "alert" : ""}>{conversation.waiting}m</span><div><strong>{conversation.customer}</strong><small>{conversation.owner} · {conversation.channel}</small><p>{conversation.message}</p></div></button>)}</aside>
        <article className="demo-conversation">
          <header><div><span>{selected.id}</span><h2>{selected.customer}</h2></div><div className={selected.waiting > 10 ? "response-timer overdue" : "response-timer"}><small>{es ? "Tiempo sin respuesta" : "Waiting for response"}</small><strong>{selected.waiting}:24</strong></div></header>
          {selected.waiting > 10 ? <div className="unanswered-alert" role="alert"><strong>{es ? "Alerta sin respuesta" : "Unanswered alert"}</strong><span>{es ? "Supera el objetivo ilustrativo de 10 minutos." : "Beyond the illustrative 10-minute target."}</span></div> : null}
          <div className="customer-message"><small>{selected.customer} · {selected.channel}</small><p>{selected.message}</p></div>
          <div className="assignment-row"><label>{es ? "Responsable" : "Owner"}<select value={owner} onChange={(event) => setOwner(event.target.value)}><option>Unassigned</option><option>Maya</option><option>Leo</option><option>Supervisor</option></select></label><span>{owner === "Unassigned" ? (es ? "Requiere asignación" : "Assignment required") : `${es ? "Asignado a" : "Assigned to"} ${owner}`}</span></div>
          <section className="ai-draft"><div><p className="eyebrow">{es ? "Borrador de IA" : "AI draft"}</p><span>{es ? "Basado en políticas ilustrativas" : "Grounded in illustrative policy"}</span></div><p>{selected.draft}</p><div className="approval-row"><button className="button button-ghost" onClick={() => setApproved(false)}>{es ? "Editar" : "Edit"}</button><button className="button" disabled={owner === "Unassigned"} onClick={() => setApproved(true)}>{approved ? (es ? "Aprobado por humano ✓" : "Human approved ✓") : (es ? "Revisar y aprobar" : "Review and approve")}</button></div></section>
          <section className="crm-handoff"><div><p className="eyebrow">CRM</p><h3>{es ? "Traspaso estructurado" : "Structured handoff"}</h3><p>{es ? "Contacto, intención, responsable, resumen y siguiente acción." : "Contact, intent, owner, summary and next action."}</p></div><button className="button button-small" disabled={!approved || crmSent} onClick={() => setCrmSent(true)}>{crmSent ? (es ? "Enviado al CRM ✓" : "Sent to CRM ✓") : (es ? "Enviar al CRM" : "Send to CRM")}</button></section>
        </article>
        <aside className="demo-metrics"><h2>{es ? "Vista de supervisor" : "Supervisor view"}</h2><div><span>{es ? "Primera respuesta mediana" : "Median first response"}</span><strong>06:42</strong><small>{es ? "Objetivo ilustrativo: 10m" : "Illustrative target: 10m"}</small></div><div><span>{es ? "Dentro del objetivo" : "Within target"}</span><strong>86%</strong><small>{es ? "Datos ilustrativos" : "Illustrative data"}</small></div><div className="metric-alert"><span>{es ? "Sin responsable" : "Unassigned"}</span><strong>{owner === "Unassigned" ? "1" : "0"}</strong><small>{es ? "Requiere acción" : "Needs action"}</small></div><div><span>{es ? "Pendiente de aprobación" : "Awaiting approval"}</span><strong>{approved ? "0" : "1"}</strong><small>{es ? "Control humano" : "Human control"}</small></div></aside>
      </div>
    </section>
    <section className="shell callout"><div><p className="eyebrow">{es ? "Diseñar alrededor de tu operación" : "Design around your operation"}</p><h2>{es ? "Convierte canales dispersos en un flujo responsable." : "Turn fragmented channels into an accountable workflow."}</h2><p>{es ? "La implementación real depende de tus canales aprobados, permisos, CRM, políticas y objetivos de servicio." : "A real implementation depends on your approved channels, permissions, CRM, policies and service targets."}</p></div><Link className="button" href={es ? "/es/contacto" : "/contact"}>{es ? "Cuéntanos tu caso" : "Discuss your use case"}</Link></section>
  </main>;
}
