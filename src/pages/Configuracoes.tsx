import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useClinic } from "../store/ClinicContext";

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
          {errors.nome && <span className="erro">{t(errors.nome.message!)}</span>}
        </label>
        <label>
          {t("abertura")}
          <input type="time" {...register("abertura", { onChange: () => setSalvo(false) })} />
          {errors.abertura && <span className="erro">{t(errors.abertura.message!)}</span>}
        </label>
        <label>
          {t("fechamento")}
          <input type="time" {...register("fechamento", { onChange: () => setSalvo(false) })} />
          {errors.fechamento && <span className="erro">{t(errors.fechamento.message!)}</span>}
        </label>
        <button type="submit">{t("salvar")}</button>
        {salvo && <span>{t("salvo")}</span>}
      </form>
    </section>
  );
}
