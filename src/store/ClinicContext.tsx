import { useEffect, useState, type ReactNode } from "react";
import { ClinicContext } from "./clinicStore";
import { consultas as consultasIniciais, pacientes as pacientesIniciais, profissionais as profissionaisIniciais } from "../data/mock";
import type { Clinica, Consulta, Paciente, Profissional } from "../types";

const STORAGE_KEY = "clinicflow:v1";
const CLINICA_PADRAO: Clinica = { nome: "ClinicFlow", abertura: "07:00", fechamento: "20:00" };

interface Persistido {
  pacientes: Paciente[];
  consultas: Consulta[];
  profissionais: Profissional[];
  clinica: Clinica;
}

const carregar = (): Partial<Persistido> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Persistido>) : null;
  } catch {
    return null;
  }
};


export function ClinicProvider({ children }: { children: ReactNode }) {
  const [pacientes, setPacientes] = useState<Paciente[]>(() => carregar()?.pacientes ?? pacientesIniciais);
  const [consultas, setConsultas] = useState<Consulta[]>(() => carregar()?.consultas ?? consultasIniciais);
  const [profissionais, setProfissionais] = useState<Profissional[]>(
    () => carregar()?.profissionais ?? profissionaisIniciais,
  );
  const [clinica, setClinica] = useState<Clinica>(() => carregar()?.clinica ?? CLINICA_PADRAO);

  useEffect(() => {
    try {
      const dados: Persistido = { pacientes, consultas, profissionais, clinica };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } catch {
      // armazenamento cheio ou indisponível: segue só em memória
    }
  }, [pacientes, consultas, profissionais, clinica]);

  return (
    <ClinicContext.Provider
      value={{ pacientes, setPacientes, consultas, setConsultas, profissionais, setProfissionais, clinica, setClinica }}
    >
      {children}
    </ClinicContext.Provider>
  );
}
