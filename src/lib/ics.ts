import type { Consulta, Paciente, Profissional } from "../types";

const escapar = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// Formato UTC do iCalendar: 20261013T120000Z
const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export const gerarICS = (
  consultas: Consulta[],
  pacientes: Paciente[],
  profissionais: Profissional[],
  agora: Date = new Date(),
): string => {
  const linhas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ClinicFlow//PT", "CALSCALE:GREGORIAN"];
  for (const c of consultas) {
    const paciente = pacientes.find((p) => p.id === c.pacienteId)?.nome ?? "Paciente";
    const prof = profissionais.find((p) => p.id === c.profissionalId)?.nome ?? "";
    linhas.push(
      "BEGIN:VEVENT",
      `UID:${c.id}@clinicflow`,
      `DTSTAMP:${utc(agora.toISOString())}`,
      `DTSTART:${utc(c.inicio)}`,
      `DTEND:${utc(c.fim)}`,
      `SUMMARY:${escapar(`Consulta: ${paciente}`)}`,
      `DESCRIPTION:${escapar(`Profissional: ${prof}`)}`,
      "END:VEVENT",
    );
  }
  linhas.push("END:VCALENDAR");
  return linhas.join("\r\n");
};
