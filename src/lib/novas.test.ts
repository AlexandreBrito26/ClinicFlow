import { describe, expect, it } from "vitest";
import { gerarICS } from "./ics";
import { lerBackup, serializarBackup } from "./backup";
import { resumoPorProfissional } from "./relatorios";
import type { Consulta, Paciente, Profissional } from "../types";

const pacientes: Paciente[] = [
  { id: "c1", nome: "Maria, Souza", cpf: "", telefone: "", nascimento: "", observacoes: "", historico: [] },
];
const profissionais: Profissional[] = [
  { id: "p1", nome: "Dra. Ana", especialidade: "", cor: "#000000", ativo: true, expediente: { inicio: "08:00", fim: "18:00" } },
  { id: "p2", nome: "Dr. Bruno", especialidade: "", cor: "#000000", ativo: true, expediente: { inicio: "08:00", fim: "18:00" } },
];

describe("gerarICS", () => {
  it("gera evento com escape de vírgula e formato UTC", () => {
    const consultas: Consulta[] = [
      { id: "a1", pacienteId: "c1", profissionalId: "p1", inicio: "2026-10-13T12:00:00.000Z", fim: "2026-10-13T12:30:00.000Z", status: "agendada" },
    ];
    const ics = gerarICS(consultas, pacientes, profissionais, new Date("2026-10-01T00:00:00Z"));
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART:20261013T120000Z");
    expect(ics).toContain("SUMMARY:Consulta: Maria\\, Souza");
    expect(ics).toContain("END:VCALENDAR");
  });
});

describe("backup", () => {
  it("ida e volta preserva os dados", () => {
    const dados = { pacientes, consultas: [], profissionais, clinica: { nome: "X", abertura: "08:00", fechamento: "18:00" } };
    const restaurado = lerBackup(serializarBackup(dados));
    expect(restaurado.pacientes[0].nome).toBe("Maria, Souza");
    expect(restaurado.clinica.nome).toBe("X");
  });
  it("rejeita arquivo de outro formato", () => {
    expect(() => lerBackup(JSON.stringify({ app: "outro", dados: {} }))).toThrow();
    expect(() => lerBackup("não é json")).toThrow();
  });
});

describe("resumoPorProfissional", () => {
  it("calcula taxa de faltas sobre realizadas + faltas", () => {
    const consultas: Consulta[] = [
      { id: "1", pacienteId: "c1", profissionalId: "p1", inicio: "", fim: "", status: "realizada" },
      { id: "2", pacienteId: "c1", profissionalId: "p1", inicio: "", fim: "", status: "realizada" },
      { id: "3", pacienteId: "c1", profissionalId: "p1", inicio: "", fim: "", status: "realizada" },
      { id: "4", pacienteId: "c1", profissionalId: "p1", inicio: "", fim: "", status: "faltou" },
      { id: "5", pacienteId: "c1", profissionalId: "p1", inicio: "", fim: "", status: "cancelada" },
    ];
    const [ana, bruno] = resumoPorProfissional(consultas, profissionais);
    expect(ana.taxaFalta).toBeCloseTo(0.25);
    expect(ana.canceladas).toBe(1);
    expect(bruno.taxaFalta).toBe(0);
  });
});
