import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import type { EventDropArg } from "@fullcalendar/core";
import { useClinic } from "../store/ClinicContext";
import type { Consulta } from "../types";
import { conflitaHorario, dentroDoHorario } from "../lib/agenda";

interface Slot {
  inicio: string;
  fim: string;
}

const OPCOES_DURACAO = [15, 30, 45, 60, 90];

export default function Agenda() {
  const { t, i18n } = useTranslation();
  const { consultas, setConsultas, pacientes, profissionais, clinica } = useClinic();
  const [profId, setProfId] = useState(profissionais[0].id);

  useEffect(() => {
    const atual = profissionais.find((p) => p.id === profId);
    const ativo = profissionais.find((p) => p.ativo);
    if (atual && !atual.ativo && ativo) setProfId(ativo.id);
  }, [profissionais, profId]);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [pacienteId, setPacienteId] = useState(pacientes[0].id);
  const [erro, setErro] = useState("");
  const [duracao, setDuracao] = useState(30);
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<"todos" | Consulta["status"]>("todos");
  const [filtroPaciente, setFiltroPaciente] = useState("todos");

  const eventos = consultas
    .filter((c) => c.profissionalId === profId)
    .filter((c) => filtroStatus === "todos" || c.status === filtroStatus)
    .filter((c) => filtroPaciente === "todos" || c.pacienteId === filtroPaciente)
    .map((c) => ({
      id: c.id,
      title: pacientes.find((p) => p.id === c.pacienteId)?.nome ?? "",
      start: c.inicio,
      end: c.fim,
      backgroundColor: profissionais.find((p) => p.id === c.profissionalId)?.cor,
      classNames: [c.status],
    }));

  const selecionada = consultas.find((c) => c.id === selecionadaId) ?? null;

  const hojeStr = new Date().toDateString();
  const doDia = consultas.filter(
    (c) => c.profissionalId === profId && new Date(c.inicio).toDateString() === hojeStr,
  );
  const contagem = {
    total: doDia.length,
    agendada: doDia.filter((c) => c.status === "agendada").length,
    realizada: doDia.filter((c) => c.status === "realizada").length,
    faltou: doDia.filter((c) => c.status === "faltou").length,
    cancelada: doDia.filter((c) => c.status === "cancelada").length,
  };

  const mudarStatus = (status: Consulta["status"]) => {
    if (!selecionada) return;
    setConsultas((lista) => lista.map((c) => (c.id === selecionada.id ? { ...c, status } : c)));
  };

  const handleEventClick = (info: EventClickArg) => {
    setSlot(null);
    setSelecionadaId(info.event.id);
  };

  const handleDateClick = (info: DateClickArg) => {
    const inicio = info.date;
    // Em visão mensal o clique vem à meia-noite: usa 09:00 como padrão.
    if (info.allDay) inicio.setHours(9, 0, 0, 0);
    setSlot({
      inicio: inicio.toISOString(),
      fim: new Date(inicio.getTime() + duracao * 60 * 1000).toISOString(),
    });
    setErro("");
  };

  const conflita = (inicio: string, fim: string, ignorarId?: string) =>
    conflitaHorario(consultas, profId, inicio, fim, ignorarId);

  const dentroDoAtendimento = (inicio: string, fim: string) => {
    const prof = profissionais.find((p) => p.id === profId);
    return (
      dentroDoHorario(inicio, fim, clinica.abertura, clinica.fechamento) &&
      (!prof || dentroDoHorario(inicio, fim, prof.expediente.inicio, prof.expediente.fim))
    );
  };

  const handleEventDrop = (info: EventDropArg) => {
    const inicio = info.event.start!.toISOString();
    const fim = info.event.end
      ? info.event.end.toISOString()
      : new Date(info.event.start!.getTime() + duracao * 60 * 1000).toISOString();
    if (!dentroDoAtendimento(inicio, fim)) {
      setErro(t("foraExpediente"));
      info.revert();
      return;
    }
    if (conflita(inicio, fim, info.event.id)) {
      setErro(t("horarioOcupado"));
      info.revert();
      return;
    }
    setErro("");
    setConsultas((lista) =>
      lista.map((c) => (c.id === info.event.id ? { ...c, inicio, fim } : c)),
    );
  };

  const agendar = () => {
    if (!slot) return;
    if (!dentroDoAtendimento(slot.inicio, slot.fim)) {
      setErro(t("foraExpediente"));
      return;
    }
    if (conflita(slot.inicio, slot.fim)) {
      setErro(t("horarioOcupado"));
      return;
    }
    const nova: Consulta = {
      id: crypto.randomUUID(),
      pacienteId,
      profissionalId: profId,
      inicio: slot.inicio,
      fim: slot.fim,
      status: "agendada",
    };
    setConsultas((c) => [...c, nova]);
    setSlot(null);
  };

  return (
    <section>
      <div className="resumo-dia">
        <strong>{t("resumoHoje")}:</strong>
        <span>{t("totalConsultas")} {contagem.total}</span>
        <span>{t("statusAgendada")} {contagem.agendada}</span>
        <span>{t("statusRealizada")} {contagem.realizada}</span>
        <span>{t("statusFaltou")} {contagem.faltou}</span>
        <span>{t("statusCancelada")} {contagem.cancelada}</span>
      </div>
      <div className="toolbar">
        <label>
          {t("profissional")}:{" "}
          <select value={profId} onChange={(e) => setProfId(e.target.value)}>
            {profissionais.filter((p) => p.ativo).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — {p.especialidade}
              </option>
            ))}
          </select>
        </label>
        <label>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}>
            <option value="todos">{t("todosStatus")}</option>
            {(["agendada", "realizada", "faltou", "cancelada"] as const).map((s) => (
              <option key={s} value={s}>
                {t(`status${s.charAt(0).toUpperCase()}${s.slice(1)}`)}
              </option>
            ))}
          </select>
        </label>{" "}
        <label>
          <select value={filtroPaciente} onChange={(e) => setFiltroPaciente(e.target.value)}>
            <option value="todos">{t("todosPacientes")}</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selecionada && (
        <div className="agendar detalhe-consulta">
          <strong>{t("detalheConsulta")}:</strong>{" "}
          {pacientes.find((p) => p.id === selecionada.pacienteId)?.nome}
          {" — "}
          {new Date(selecionada.inicio).toLocaleString(i18n.language === "pt" ? "pt-BR" : "en-US", {
            dateStyle: "short",
            timeStyle: "short",
          })}
          <span>{t("status")}:</span>
          {(["agendada", "realizada", "faltou", "cancelada"] as const).map((s) => (
            <button
              key={s}
              className={selecionada.status === s ? "ativo" : ""}
              onClick={() => mudarStatus(s)}
            >
              {t(`status${s.charAt(0).toUpperCase()}${s.slice(1)}`)}
            </button>
          ))}
          <button onClick={() => setSelecionadaId(null)}>{t("fechar")}</button>
        </div>
      )}

      {slot && (
        <div className="agendar">
          <strong>
            {t("novaConsulta")}{" "}
            {new Date(slot.inicio).toLocaleString(i18n.language === "pt" ? "pt-BR" : "en-US", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </strong>
          <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          <select
            value={duracao}
            onChange={(e) => {
              const minutos = Number(e.target.value);
              setDuracao(minutos);
              setSlot((s) =>
                s
                  ? {
                      ...s,
                      fim: new Date(new Date(s.inicio).getTime() + minutos * 60 * 1000).toISOString(),
                    }
                  : s,
              );
            }}
          >
            {OPCOES_DURACAO.map((m) => (
              <option key={m} value={m}>
                {m} {t("minutos")}
              </option>
            ))}
          </select>
          <button onClick={agendar}>{t("agendar")}</button>
          <button onClick={() => setSlot(null)}>{t("cancelar")}</button>
          {erro && <span className="erro">{erro}</span>}
        </div>
      )}

      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridWeek,dayGridMonth" }}
        locale={i18n.language === "pt" ? "pt-br" : "en"}
        events={eventos}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable
        eventDrop={handleEventDrop}
        height="auto"
        slotMinTime={`${clinica.abertura}:00`}
        slotMaxTime={`${clinica.fechamento}:00`}
      />
    </section>
  );
}
