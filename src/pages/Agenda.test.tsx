// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "../i18n";
import { ClinicProvider } from "../store/ClinicContext";
import Agenda from "./Agenda";

// O FullCalendar não roda bem no jsdom. Trocamos por uma lista de botões
// que representa os eventos e dispara o mesmo eventClick.
vi.mock("@fullcalendar/react", async () => {
  const React = await import("react");
  interface Evento { id: string; title: string }
  interface Props {
    events: Evento[];
    eventClick: (arg: { event: { id: string } }) => void;
  }
  return {
    default: (props: Props) =>
      React.createElement(
        "div",
        null,
        props.events.map((e) =>
          React.createElement(
            "button",
            { key: e.id, onClick: () => props.eventClick({ event: { id: e.id } }) },
            e.title,
          ),
        ),
      ),
  };
});

const amanha10h = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T10:00`;
};

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(cleanup);

const renderizar = () =>
  render(
    <ClinicProvider>
      <Agenda />
    </ClinicProvider>,
  );

describe("agenda", () => {
  it("cria uma consulta nova e ela aparece no calendário", () => {
    renderizar();
    fireEvent.click(screen.getByRole("button", { name: "Novo agendamento" }));
    fireEvent.change(screen.getByLabelText("Início da consulta"), { target: { value: amanha10h() } });
    fireEvent.change(screen.getByLabelText("Paciente"), { target: { value: "c2" } });
    fireEvent.click(screen.getByRole("button", { name: "Agendar" }));
    expect(screen.getByRole("button", { name: "João Pereira" })).toBeTruthy();
  });

  it("pede confirmação antes de cancelar", () => {
    renderizar();
    fireEvent.click(screen.getByRole("button", { name: "Maria Souza" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelada" }));
    expect(screen.getByText("Cancelar esta consulta?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.queryByText("Cancelar esta consulta?")).toBeNull();
  });

  it("exclui a consulta depois de confirmar", () => {
    renderizar();
    fireEvent.click(screen.getByRole("button", { name: "Maria Souza" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "Sim, excluir" }));
    expect(screen.queryByRole("button", { name: "Maria Souza" })).toBeNull();
  });
});
