import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ToastProvider from "./components/ToastProvider";
import { ClinicProvider } from "./store/ClinicContext";
import "./i18n";

const Agenda = lazy(() => import("./pages/Agenda"));
const Pacientes = lazy(() => import("./pages/Pacientes"));
const Profissionais = lazy(() => import("./pages/Profissionais"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Relatorios = lazy(() => import("./pages/Relatorios"));

export default function App() {
  return (
    <ClinicProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="esqueleto" aria-busy="true" />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Agenda />} />
                <Route path="/pacientes" element={<Pacientes />} />
                <Route path="/profissionais" element={<Profissionais />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ClinicProvider>
  );
}
