import { useCallback, useRef, useState, type ReactNode } from "react";
import { ToastContext } from "../store/toast";

interface Item {
  id: number;
  texto: string;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<Item[]>([]);
  const seq = useRef(0);

  const notificar = useCallback((texto: string) => {
    const id = ++seq.current;
    setItens((l) => [...l, { id, texto }]);
    window.setTimeout(() => setItens((l) => l.filter((i) => i.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ notificar }}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {itens.map((i) => (
          <div key={i.id} className="toast">{i.texto}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
