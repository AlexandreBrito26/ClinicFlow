import type { Consulta, Paciente, Profissional } from "../types";

const NOMES = ["Ana", "Bruno", "Carla", "Diego", "Elaine", "Fábio", "Gabriela", "Hugo", "Iara", "Karina",
  "Lucas", "Marta", "Nelson", "Olívia", "Paulo", "Rita", "Sérgio", "Tânia", "Vinícius", "Yara"];
const SOBRENOMES = ["Silva", "Souza", "Costa", "Oliveira", "Pereira", "Lima", "Ferreira", "Almeida", "Rocha", "Barbosa"];
const OBSERVACOES = ["", "", "Alergia a penicilina.", "Hipertensa, em acompanhamento.", "Prefere horários da manhã."];

// Gerador determinístico (mesma seed, mesmos dados): útil para testar a agenda com volume.
export function gerarDemo(profissionais: Profissional[], quantidade = 60, seed = 42) {
  let estado = seed;
  const rnd = () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
  const escolher = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];

  const pacientes: Paciente[] = Array.from({ length: quantidade }, (_, i) => ({
    id: `d${i}`,
    nome: `${escolher(NOMES)} ${escolher(SOBRENOMES)}`,
    cpf: String(10000000000 + i * 7919).slice(0, 11),
    telefone: `3499${String(1000000 + i * 37).slice(0, 7)}`,
    nascimento: `${1960 + Math.floor(rnd() * 40)}-0${1 + Math.floor(rnd() * 9)}-1${Math.floor(rnd() * 9)}`,
    observacoes: escolher(OBSERVACOES),
    historico: [],
  }));

  const consultas: Consulta[] = [];
  const agora = new Date();
  for (let dia = -30; dia <= 30; dia++) {
    for (const prof of profissionais) {
      for (let hora = 8; hora < 14; hora++) {
        if (rnd() < 0.35) continue;
        const ini = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + dia, hora, 0, 0, 0);
        const fim = new Date(ini.getTime() + 30 * 60 * 1000);
        const status: Consulta["status"] = ini < agora ? (rnd() < 0.1 ? "faltou" : "realizada") : "agendada";
        consultas.push({
          id: `dc${consultas.length}`,
          pacienteId: escolher(pacientes).id,
          profissionalId: prof.id,
          inicio: ini.toISOString(),
          fim: fim.toISOString(),
          status,
        });
      }
    }
  }
  return { pacientes, consultas };
}
