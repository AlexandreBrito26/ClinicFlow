import type { Consulta, Profissional } from "../types";

export interface LinhaRelatorio {
  profissionalId: string;
  nome: string;
  agendadas: number;
  realizadas: number;
  faltas: number;
  canceladas: number;
  taxaFalta: number;
}

// Taxa de faltas = faltas / (realizadas + faltas). Consultas agendadas e canceladas não entram no cálculo.
export const resumoPorProfissional = (consultas: Consulta[], profissionais: Profissional[]): LinhaRelatorio[] =>
  profissionais.map((p) => {
    const cs = consultas.filter((c) => c.profissionalId === p.id);
    const realizadas = cs.filter((c) => c.status === "realizada").length;
    const faltas = cs.filter((c) => c.status === "faltou").length;
    const base = realizadas + faltas;
    return {
      profissionalId: p.id,
      nome: p.nome,
      agendadas: cs.filter((c) => c.status === "agendada").length,
      realizadas,
      faltas,
      canceladas: cs.filter((c) => c.status === "cancelada").length,
      taxaFalta: base ? faltas / base : 0,
    };
  });
