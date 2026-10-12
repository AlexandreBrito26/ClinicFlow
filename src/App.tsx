import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Agenda from "./pages/Agenda";
import Pacientes from "./pages/Pacientes";
import Profissionais from "./pages/Profissionais";
import Configuracoes from "./pages/Configuracoes";
import "./i18n";
import { ClinicProvider } from "./store/ClinicContext";

export default function App() {
  return (
    <ClinicProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Agenda />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/profissionais" element={<Profissionais />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ClinicProvider>
  );
}
