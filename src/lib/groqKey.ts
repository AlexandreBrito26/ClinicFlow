const CHAVE = "clinicflow:groqKey";

export const lerChaveGroq = (): string | null => {
  try {
    return localStorage.getItem(CHAVE) || null;
  } catch {
    return null;
  }
};

export const salvarChaveGroq = (chave: string) => {
  try {
    const limpa = chave.trim();
    if (limpa) localStorage.setItem(CHAVE, limpa);
    else localStorage.removeItem(CHAVE);
  } catch {
    // sem armazenamento: a chave vale só para esta sessão
  }
};
