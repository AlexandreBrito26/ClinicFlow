export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  cor: string;
  ativo: boolean;
  expediente: { inicio: string; fim: string };
}

export interface Clinica {
  nome: string;
  abertura: string;
  fechamento: string;
}

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  nascimento: string;
  observacoes: string;
  historico: string[];
}

export interface Consulta {
  id: string;
  pacienteId: string;
  profissionalId: string;
  inicio: string;
  fim: string;
  status: "agendada" | "realizada" | "faltou" | "cancelada";
}
