import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { consultas as consultasIniciais, pacientes as pacientesIniciais, profissionais as profissionaisIniciais } from "../data/mock";
import type { Clinica, Consulta, Paciente, Profissional } from "../types";

interface ClinicState {
  pacientes: Paciente[];
  setPacientes: Dispatch<SetStateAction<Paciente[]>>;
  consultas: Consulta[];
  setConsultas: Dispatch<SetStateAction<Consulta[]>>;
  profissionais: Profissional[];
  setProfissionais: Dispatch<SetStateAction<Profissional[]>>;
  clinica: Clinica;
  setClinica: Dispatch<SetStateAction<Clinica>>;
}

const ClinicContext = createContext<ClinicState | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [pacientes, setPacientes] = useState<Paciente[]>(pacientesIniciais);
  const [consultas, setConsultas] = useState<Consulta[]>(consultasIniciais);
  const [profissionais, setProfissionais] = useState<Profissional[]>(profissionaisIniciais);
  const [clinica, setClinica] = useState<Clinica>({ nome: "ClinicFlow", abertura: "07:00", fechamento: "20:00" });

  return (
    <ClinicContext.Provider value={{ pacientes, setPacientes, consultas, setConsultas, profissionais, setProfissionais, clinica, setClinica }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic precisa estar dentro de ClinicProvider");
  return ctx;
}
