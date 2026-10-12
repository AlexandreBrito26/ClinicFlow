import type { Consulta } from "../types";

export const conflitaHorario = (
  consultas: Consulta[],
  profissionalId: string,
  inicio: string,
  fim: string,
  ignorarId?: string,
): boolean =>
  consultas.some(
    (c) =>
      c.id !== ignorarId &&
      c.profissionalId === profissionalId &&
      c.status !== "cancelada" &&
      new Date(c.inicio) < new Date(fim) &&
      new Date(c.fim) > new Date(inicio),
  );

const paraMinutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const minutosDoDia = (iso: string): number => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
};

export const dentroDoHorario = (
  inicio: string,
  fim: string,
  abertura: string,
  fechamento: string,
): boolean => {
  const ini = minutosDoDia(inicio);
  const fi = minutosDoDia(fim);
  return ini >= paraMinutos(abertura) && fi <= paraMinutos(fechamento);
};
