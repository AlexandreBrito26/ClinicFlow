import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useClinic } from "../store/clinicStore";
import { lerChaveGroq, salvarChaveGroq } from "../lib/groqKey";
import { gerarDemo } from "../lib/demo";
import { lerBackup, serializarBackup } from "../lib/backup";
import { baixar } from "../lib/download";
import { useToast } from "../store/toast";

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = z
  .object({
    nome: z.string().min(1, "nomeObrigatorio"),
    abertura: z.string().regex(HORA, "horaInvalida"),
    fechamento: z.string().regex(HORA, "horaInvalida"),
  })
  .refine((d) => d.abertura < d.fechamento, {
    message: "aberturaAntesFechamento",
    path: ["fechamento"],
  });
type FormData = z.infer<typeof schema>;

export default function Configuracoes() {
  const { t } = useTranslation();
  const { clinica, setClinica } = useClinic();
  const [salvo, setSalvo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: clinica });

  const onSubmit = (data: FormData) => {
    setClinica(data);
    setSalvo(true);
  };

  return (
    <section>
      <h2>{t("configClinica")}</h2>
      <form className="formulario-clinica" onSubmit={handleSubmit(onSubmit)}>
        <label>
          {t("nomeClinica")}
          <input {...register("nome", { onChange: () => setSalvo(false) })} />
          {errors.nome && <span className="erro" role="alert">{t(errors.nome.message!)}</span>}
        </label>
        <label>
          {t("abertura")}
          <input type="time" {...register("abertura", { onChange: () => setSalvo(false) })} />
          {errors.abertura && <span className="erro" role="alert">{t(errors.abertura.message!)}</span>}
        </label>
        <label>
          {t("fechamento")}
          <input type="time" {...register("fechamento", { onChange: () => setSalvo(false) })} />
          {errors.fechamento && <span className="erro" role="alert">{t(errors.fechamento.message!)}</span>}
        </label>
        <button type="submit">{t("salvar")}</button>
        {salvo && <span>{t("salvo")}</span>}
      </form>

      <ChaveIA />
      <DadosDemo />
      <BackupDados />
    </section>
  );
}

function ChaveIA() {
  const { t } = useTranslation();
  const [chave, setChave] = useState(() => lerChaveGroq() ?? "");
  const [ok, setOk] = useState(false);

  const salvar = () => {
    salvarChaveGroq(chave);
    setOk(true);
  };

  return (
    <div className="bloco-config">
      <h2>{t("chaveIA")}</h2>
      <p className="suave">{t("chaveIAAviso")}</p>
      <label>
        {t("chaveGroq")}
        <input
          type="password"
          autoComplete="off"
          value={chave}
          onChange={(e) => {
            setChave(e.target.value);
            setOk(false);
          }}
        />
      </label>
      <div className="acoes">
        <button type="button" onClick={salvar}>{t("salvar")}</button>
        {ok && <span>{t("salvo")}</span>}
      </div>
    </div>
  );
}

function BackupDados() {
  const { t } = useTranslation();
  const { pacientes, consultas, profissionais, clinica, setPacientes, setConsultas, setProfissionais, setClinica } =
    useClinic();
  const { notificar } = useToast();
  const [erro, setErro] = useState(false);

  const exportar = () => {
    const data = new Date().toISOString().slice(0, 10);
    baixar(
      `clinicflow-backup-${data}.json`,
      serializarBackup({ pacientes, consultas, profissionais, clinica }),
      "application/json",
    );
  };

  const importar = async (arquivo: File) => {
    try {
      const d = lerBackup(await arquivo.text());
      setPacientes(d.pacientes);
      setConsultas(d.consultas);
      setProfissionais(d.profissionais);
      setClinica(d.clinica);
      setErro(false);
      notificar(t("backupRestaurado"));
    } catch {
      setErro(true);
    }
  };

  return (
    <div className="bloco-config">
      <h2>{t("backupTitulo")}</h2>
      <p className="suave">{t("backupAviso")}</p>
      <div className="acoes">
        <button type="button" onClick={exportar}>{t("exportarBackup")}</button>
        <label className="arquivo">
          {t("importarBackup")}
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importar(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {erro && <span className="erro" role="alert">{t("backupInvalido")}</span>}
    </div>
  );
}

function DadosDemo() {
  const { t } = useTranslation();
  const { profissionais, setPacientes, setConsultas } = useClinic();
  const [feito, setFeito] = useState(false);

  const carregar = () => {
    const d = gerarDemo(profissionais);
    setPacientes(d.pacientes);
    setConsultas(d.consultas);
    setFeito(true);
  };

  return (
    <div className="bloco-config">
      <h2>{t("dadosDemo")}</h2>
      <p className="suave">{t("dadosDemoAviso")}</p>
      <div className="acoes">
        <button type="button" onClick={carregar}>{t("carregarDemo")}</button>
        {feito && <span>{t("salvo")}</span>}
      </div>
    </div>
  );
}
