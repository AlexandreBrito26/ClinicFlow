import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useClinic } from "../store/ClinicContext";

export default function Layout() {
  const { t } = useTranslation();
  const { clinica } = useClinic();
  const toggleLang = () => i18n.changeLanguage(i18n.language === "pt" ? "en" : "pt");
  return (
    <div className="app">
      <header className="topbar">
        <strong className="brand">{clinica.nome}</strong>
        <nav>
          <NavLink to="/">{t("agenda")}</NavLink>
          <NavLink to="/pacientes">{t("pacientes")}</NavLink>
          <NavLink to="/profissionais">{t("navProfissionais")}</NavLink>
          <NavLink to="/configuracoes">{t("navConfig")}</NavLink>
        </nav>
        <button className="lang" onClick={toggleLang}>
          {i18n.language === "pt" ? "EN" : "PT"}
        </button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
