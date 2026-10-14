import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useClinic } from "../store/clinicStore";

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = z
  .object({
    nome: z.string().min(1, "nomeObrigatorio"),
    especialidade: z.string().min(1, "nomeObrigatorio"),
    cor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "corInvalida"),
    expedienteInicio: z.string().regex(HORA, "horaInvalida"),
    expedienteFim: z.string().regex(HORA, "horaInvalida"),
  })
  .refine((d) => d.expedienteInicio < d.expedienteFim, {
    message: "aberturaAntesFechamento",
    path: ["expedienteFim"],
  });
type FormData = z.infer<typeof schema>;

const PADRAO: FormData = {
  nome: "",
  especialidade: "",
  cor: "#0369A1",
  expedienteInicio: "08:00",
  expedienteFim: "18:00",
};

export default function Profissionais() {
  const { t } = useTranslation();
  const { profissionais, setProfissionais, consultas } = useClinic();
  const futurasDe = (id: string) =>
    consultas.filter((c) => c.profissionalId === id && c.status === "agendada" && new Date(c.inicio) > new Date()).length;
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: PADRAO });

  const abrirNovo = () => {
    setEditandoId(null);
    reset(PADRAO);
    setFormAberto(true);
  };

  const abrirEdicao = (id: string) => {
    const p = profissionais.find((x) => x.id === id);
    if (!p) return;
    setEditandoId(id);
    reset({
      nome: p.nome,
      especialidade: p.especialidade,
      cor: p.cor,
      expedienteInicio: p.expediente.inicio,
      expedienteFim: p.expediente.fim,
    });
    setFormAberto(true);
  };

  const fechar = () => {
    setFormAberto(false);
    setEditandoId(null);
    reset(PADRAO);
  };

  const onSubmit = (data: FormData) => {
    const expediente = { inicio: data.expedienteInicio, fim: data.expedienteFim };
    const { expedienteInicio: _i, expedienteFim: _f, ...dados } = data;
    if (editandoId) {
      setProfissionais((lista) =>
        lista.map((p) => (p.id === editandoId ? { ...p, ...dados, expediente } : p)),
      );
    } else {
      setProfissionais((lista) => [
        ...lista,
        { id: crypto.randomUUID(), ativo: true, ...dados, expediente },
      ]);
    }
    fechar();
  };

  const alternarAtivo = (id: string) => {
    setProfissionais((lista) => lista.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)));
  };

  return (
    <section>
      <h2>{t("navProfissionais")}</h2>
      <ul className="lista">
        {profissionais.map((p) => (
          <li key={p.id} className={p.ativo ? "" : "inativo"}>
            <span className="bolinha" style={{ background: p.cor }} /> {p.nome} — {p.especialidade}{" "}
            ({p.expediente.inicio}–{p.expediente.fim})
            {!p.ativo && <em> ({t("inativo")})</em>}{" "}
            {!p.ativo && futurasDe(p.id) > 0 && <em>· {t("consultasFuturas", { n: futurasDe(p.id) })} </em>}
            <button onClick={() => abrirEdicao(p.id)}>{t("editar")}</button>{" "}
            <button onClick={() => alternarAtivo(p.id)}>{p.ativo ? t("desativar") : t("reativar")}</button>
          </li>
        ))}
      </ul>
      {!formAberto ? (
        <button onClick={abrirNovo}>{t("novoProfissional")}</button>
      ) : (
        <form className="novo" onSubmit={handleSubmit(onSubmit)}>
          <label>
            {t("nome")}
            <input {...register("nome")} />
            {errors.nome && <span className="erro" role="alert">{t(errors.nome.message!)}</span>}
          </label>
          <label>
            {t("especialidade")}
            <input {...register("especialidade")} />
            {errors.especialidade && <span className="erro" role="alert">{t(errors.especialidade.message!)}</span>}
          </label>
          <label>
            {t("cor")}
            <input {...register("cor")} />
            {errors.cor && <span className="erro" role="alert">{t(errors.cor.message!)}</span>}
          </label>
          <label>
            {t("expediente")} — {t("abertura")}
            <input type="time" {...register("expedienteInicio")} />
            {errors.expedienteInicio && <span className="erro" role="alert">{t(errors.expedienteInicio.message!)}</span>}
          </label>
          <label>
            {t("expediente")} — {t("fechamento")}
            <input type="time" {...register("expedienteFim")} />
            {errors.expedienteFim && <span className="erro" role="alert">{t(errors.expedienteFim.message!)}</span>}
          </label>
          <div className="acoes">
            <button type="submit">{editandoId ? t("salvarEdicao") : t("salvar")}</button>
            <button type="button" onClick={fechar}>{t("cancelar")}</button>
          </div>
        </form>
      )}
    </section>
  );
}
