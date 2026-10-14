import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import Logo from "./Logo";
import { useTema } from "../lib/useTema";
import { useClinic } from "../store/clinicStore";

export default function Layout() {
  const { t } = useTranslation();
  const { clinica } = useClinic();
  const { modo, ciclar } = useTema();
  const rotuloModo = modo === "auto" ? t("temaAuto") : modo === "dia" ? t("temaDia") : t("temaNoite");
  const icone = modo === "auto" ? "◐" : modo === "dia" ? "☀" : "☾";
  const toggleLang = () => i18n.changeLanguage(i18n.language === "pt" ? "en" : "pt");
  return (
    <div className="app">
      <div className="ceu" aria-hidden="true">
        <div className="astro" />
        <div className="nuvem n1" />
        <div className="nuvem n2" />
        <div className="estrelas" />
      </div>
      <header className="topbar">
        <div className="marca">
          <Logo size={34} />
          <strong className="brand">{clinica.nome}</strong>
          <span className="tagline">{t("tagline")}</span>
        </div>
        <nav>
          <NavLink to="/">{t("agenda")}</NavLink>
          <NavLink to="/pacientes">{t("pacientes")}</NavLink>
          <NavLink to="/profissionais">{t("navProfissionais")}</NavLink>
          <NavLink to="/relatorios">{t("navRelatorios")}</NavLink>
          <NavLink to="/configuracoes">{t("navConfig")}</NavLink>
        </nav>
        <button className="tema" onClick={ciclar} aria-label={`${t("alternarTema")}: ${rotuloModo}`} title={rotuloModo}>
          <span aria-hidden="true">{icone}</span>
        </button>
        <button className="lang" onClick={toggleLang} aria-label={t("trocarIdioma")}>
          {i18n.language === "pt" ? "EN" : "PT"}
        </button>
      </header>
      <a className="pular" href="#conteudo">{t("pularConteudo")}</a>
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
