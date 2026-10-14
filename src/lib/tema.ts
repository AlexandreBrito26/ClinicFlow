export type Modo = "auto" | "dia" | "noite";
export type Tema = "dia" | "noite";

const CHAVE = "clinicflow:tema";
const MODOS: Modo[] = ["auto", "dia", "noite"];

export const lerModo = (): Modo => {
  try {
    const v = localStorage.getItem(CHAVE);
    return MODOS.includes(v as Modo) ? (v as Modo) : "auto";
  } catch {
    return "auto";
  }
};

export const salvarModo = (m: Modo) => {
  try {
    localStorage.setItem(CHAVE, m);
  } catch {
    // sem armazenamento: o modo vale só para esta sessão
  }
};

export const proximoModo = (m: Modo): Modo => MODOS[(MODOS.indexOf(m) + 1) % MODOS.length];

// Automático: dia entre 6h e 18h, noite no restante.
export const resolverTema = (m: Modo, agora: Date = new Date()): Tema => {
  if (m !== "auto") return m;
  const h = agora.getHours();
  return h >= 6 && h < 18 ? "dia" : "noite";
};

export const aplicarTema = (tema: Tema) => {
  document.documentElement.dataset.theme = tema;
};
