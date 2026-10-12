import { describe, expect, it } from "vitest";
import { conflitaHorario, dentroDoHorario } from "./agenda";
import type { Consulta } from "../types";

const base: Consulta = {
  id: "a1",
  pacienteId: "c1",
  profissionalId: "p1",
  inicio: "2026-10-09T09:00:00.000Z",
  fim: "2026-10-09T09:30:00.000Z",
  status: "agendada",
};

describe("conflitaHorario", () => {
  it("detecta sobreposição no mesmo profissional", () => {
    expect(
      conflitaHorario([base], "p1", "2026-10-09T09:15:00.000Z", "2026-10-09T09:45:00.000Z"),
    ).toBe(true);
  });
  it("não conflita em horário encostado", () => {
    expect(
      conflitaHorario([base], "p1", "2026-10-09T09:30:00.000Z", "2026-10-09T10:00:00.000Z"),
    ).toBe(false);
  });
  it("não conflita com outro profissional", () => {
    expect(
      conflitaHorario([base], "p2", "2026-10-09T09:00:00.000Z", "2026-10-09T09:30:00.000Z"),
    ).toBe(false);
  });
  it("ignora consultas canceladas", () => {
    expect(
      conflitaHorario([{ ...base, status: "cancelada" }], "p1", "2026-10-09T09:00:00.000Z", "2026-10-09T09:30:00.000Z"),
    ).toBe(false);
  });
  it("ignora a própria consulta ao mover", () => {
    expect(
      conflitaHorario([base], "p1", "2026-10-09T09:00:00.000Z", "2026-10-09T09:30:00.000Z", "a1"),
    ).toBe(false);
  });
});

describe("dentroDoHorario", () => {
  const local = (h: number, m = 0) => {
    const d = new Date(2026, 9, 9, h, m, 0, 0);
    return d.toISOString();
  };
  it("aceita consulta dentro do expediente", () => {
    expect(dentroDoHorario(local(9), local(10), "08:00", "18:00")).toBe(true);
  });
  it("rejeita consulta que começa antes da abertura", () => {
    expect(dentroDoHorario(local(7), local(8), "08:00", "18:00")).toBe(false);
  });
  it("rejeita consulta que termina depois do fechamento", () => {
    expect(dentroDoHorario(local(17, 45), local(18, 15), "08:00", "18:00")).toBe(false);
  });
  it("aceita consulta que termina exatamente no fechamento", () => {
    expect(dentroDoHorario(local(17, 30), local(18), "08:00", "18:00")).toBe(true);
  });
});
