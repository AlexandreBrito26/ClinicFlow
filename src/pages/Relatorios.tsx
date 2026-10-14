import { useTranslation } from "react-i18next";
import { useClinic } from "../store/clinicStore";
import { resumoPorProfissional } from "../lib/relatorios";

export default function Relatorios() {
  const { t } = useTranslation();
  const { consultas, profissionais } = useClinic();
  const linhas = resumoPorProfissional(consultas, profissionais);

  return (
    <section>
      <div className="cabecalho-pagina">
        <h2>{t("navRelatorios")}</h2>
        <button type="button" onClick={() => window.print()}>{t("imprimir")}</button>
      </div>
      <div className="tabela-wrap">
        <table className="rel">
          <thead>
            <tr>
              <th>{t("relProfissional")}</th>
              <th>{t("relAgendadas")}</th>
              <th>{t("relRealizadas")}</th>
              <th>{t("relFaltas")}</th>
              <th>{t("relCanceladas")}</th>
              <th>{t("relTaxaFalta")}</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.profissionalId}>
                <td>{l.nome}</td>
                <td>{l.agendadas}</td>
                <td>{l.realizadas}</td>
                <td>{l.faltas}</td>
                <td>{l.canceladas}</td>
                <td>{Math.round(l.taxaFalta * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
