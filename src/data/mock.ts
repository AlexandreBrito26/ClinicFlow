import type { Consulta, Paciente, Profissional } from "../types";

export const profissionais: Profissional[] = [
  { id: "p1", nome: "Dra. Ana Lima", especialidade: "Clínica geral", cor: "#0369A1", ativo: true, expediente: { inicio: "08:00", fim: "18:00" } },
  { id: "p2", nome: "Dr. Bruno Teles", especialidade: "Dermatologia", cor: "#2DD4BF", ativo: true, expediente: { inicio: "09:00", fim: "17:00" } },
];

export const pacientes: Paciente[] = [
  {
    id: "c1",
    nome: "Maria Souza",
    cpf: "12345678909",
    telefone: "34999990000",
    nascimento: "1985-03-12",
    observacoes: "Alérgica a dipirona.",
    historico: ["2026-05-02: consulta de rotina", "2026-08-14: retorno"],
  },
  {
    id: "c2",
    nome: "João Pereira",
    cpf: "98765432100",
    telefone: "34988887777",
    nascimento: "1972-11-30",
    observacoes: "",
    historico: ["2026-07-20: avaliação de pele"],
  },
];

const hoje = new Date();
const dia = (h: number, m = 0) => {
  const d = new Date(hoje);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const consultas: Consulta[] = [
  { id: "a1", pacienteId: "c1", profissionalId: "p1", inicio: dia(9), fim: dia(9, 30), status: "agendada" },
  { id: "a2", pacienteId: "c2", profissionalId: "p2", inicio: dia(10), fim: dia(11), status: "agendada" },
];
