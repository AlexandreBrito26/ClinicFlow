import { useEffect, useState } from "react";
import { aplicarTema, lerModo, proximoModo, resolverTema, salvarModo, type Modo, type Tema } from "./tema";

export function useTema() {
  const [modo, setModo] = useState<Modo>(lerModo);
  const [tema, setTema] = useState<Tema>(() => resolverTema(lerModo()));

  useEffect(() => {
    const atualizar = () => setTema(resolverTema(modo));
    atualizar();
    // no modo automático, reavalia a cada minuto para acompanhar a virada do dia
    const id = modo === "auto" ? window.setInterval(atualizar, 60_000) : undefined;
    return () => {
      if (id) window.clearInterval(id);
    };
  }, [modo]);

  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  const ciclar = () => {
    const proximo = proximoModo(modo);
    salvarModo(proximo);
    setModo(proximo);
  };

  return { modo, tema, ciclar };
}
