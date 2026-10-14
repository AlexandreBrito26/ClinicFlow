import { createContext, useContext, type Dispatch, type SetStateAction } from "react";
import type { Clinica, Consulta, Paciente, Profissional } from "../types";

export interface ClinicState {
  pacientes: Paciente[];
  setPacientes: Dispatch<SetStateAction<Paciente[]>>;
  consultas: Consulta[];
  setConsultas: Dispatch<SetStateAction<Consulta[]>>;
  profissionais: Profissional[];
  setProfissionais: Dispatch<SetStateAction<Profissional[]>>;
  clinica: Clinica;
  setClinica: Dispatch<SetStateAction<Clinica>>;
}

export const ClinicContext = createContext<ClinicState | null>(null);

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic precisa estar dentro de ClinicProvider");
  return ctx;
}
