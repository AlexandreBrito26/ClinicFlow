import type { Clinica, Consulta, Paciente, Profissional } from "../types";

export interface Dados {
  pacientes: Paciente[];
  consultas: Consulta[];
  profissionais: Profissional[];
  clinica: Clinica;
}

export const serializarBackup = (dados: Dados, agora: Date = new Date()): string =>
  JSON.stringify({ app: "clinicflow", versao: 2, geradoEm: agora.toISOString(), dados }, null, 2);

// Valida a forma mínima do arquivo antes de substituir os dados atuais.
export const lerBackup = (texto: string): Dados => {
  const obj = JSON.parse(texto);
  const d = obj?.dados;
  if (obj?.app !== "clinicflow" || !d) throw new Error("formato inválido");
  if (
    !Array.isArray(d.pacientes) ||
    !Array.isArray(d.consultas) ||
    !Array.isArray(d.profissionais) ||
    typeof d.clinica?.nome !== "string"
  ) {
    throw new Error("formato inválido");
  }
  return d as Dados;
};
