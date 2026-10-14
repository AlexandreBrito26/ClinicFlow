import { createContext, useContext } from "react";

export interface ToastApi {
  notificar: (mensagem: string) => void;
}

export const ToastContext = createContext<ToastApi>({ notificar: () => {} });
export const useToast = () => useContext(ToastContext);
