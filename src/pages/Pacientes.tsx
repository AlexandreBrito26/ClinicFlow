import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useClinic } from "../store/clinicStore";
import { isValidCPF, maskCPF, maskPhone } from "../lib/format";
import { resumirHistorico } from "../lib/groq";
import { chaveStatus } from "../lib/status";
import { useToast } from "../store/toast";
import type { Consulta, Paciente } from "../types";

const schema = z.object({
  nome: z.string().min(1, "nomeObrigatorio"),
  cpf: z.string().refine(isValidCPF, "cpfInvalido"),
  telefone: z.string().refine((v) => v.replace(/\D/g, "").length >= 10, "telefoneInvalido"),
  nascimento: z
    .string()
    .min(1, "dataInvalida")
    .refine((v) => v <= new Date().toISOString().slice(0, 10), "dataInvalida"),
});
type FormData = z.infer<typeof schema>;

export default function Pacientes() {
  const { t, i18n } = useTranslation();
  const { notificar } = useToast();
  const { pacientes: lista, setPacientes: setLista, consultas, setConsultas, profissionais } = useClinic();
  const [anotacao, setAnotacao] = useState("");
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Paciente | null>(null);
  const [resumo, setResumo] = useState("");
  const [editando, setEditando] = useState(false);
  const cacheResumo = useRef(new Map<string, string>());
  const buscaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName)) {
        e.preventDefault();
        buscaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const [editandoAnotacao, setEditandoAnotacao] = useState<number | null>(null);
  const [textoAnotacao, setTextoAnotacao] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [edicao, setEdicao] = useState({ nome: "", telefone: "", observacoes: "" });
  const [erroEdicao, setErroEdicao] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    const cpfLimpo = data.cpf.replace(/\D/g, "");
    if (lista.some((p) => p.cpf === cpfLimpo)) {
      setError("cpf", { type: "duplicate", message: "cpfDuplicado" });
      return;
    }
    const novo: Paciente = {
      id: crypto.randomUUID(),
      nome: data.nome,
      cpf: data.cpf.replace(/\D/g, ""),
      telefone: data.telefone.replace(/\D/g, ""),
      nascimento: data.nascimento,
      observacoes: "",
      historico: [],
    };
    setLista((l) => [...l, novo]);
    notificar(t("toastPacienteNovo"));
    reset();
  };

  const adicionarAnotacao = () => {
    if (!selecionado || !anotacao.trim()) return;
    const hoje = new Date().toISOString().slice(0, 10);
    const atualizado: Paciente = {
      ...selecionado,
      historico: [...selecionado.historico, `${hoje}: ${anotacao.trim()}`],
    };
    setLista((l) => l.map((p) => (p.id === atualizado.id ? atualizado : p)));
    setSelecionado(atualizado);
    setAnotacao("");
  };

  const excluirPaciente = () => {
    if (!selecionado) return;
    setLista((l) => l.filter((p) => p.id !== selecionado.id));
    notificar(t("toastPacienteExcluido"));
    setConsultas((c) => c.filter((x) => x.pacienteId !== selecionado.id));
    setSelecionado(null);
    setConfirmandoExclusao(false);
  };

  const atualizarHistorico = (novo: string[]) => {
    if (!selecionado) return;
    const atualizado = { ...selecionado, historico: novo };
    setLista((l) => l.map((p) => (p.id === atualizado.id ? atualizado : p)));
    setSelecionado(atualizado);
  };

  const salvarAnotacao = (i: number) => {
    const texto = textoAnotacao.trim();
    if (!selecionado || !texto) return;
    atualizarHistorico(selecionado.historico.map((h, idx) => (idx === i ? texto : h)));
    setEditandoAnotacao(null);
  };

  const removerAnotacao = (i: number) => {
    if (!selecionado) return;
    atualizarHistorico(selecionado.historico.filter((_, idx) => idx !== i));
    setEditandoAnotacao(null);
  };

  const iniciarEdicao = () => {
    if (!selecionado) return;
    setEdicao({
      nome: selecionado.nome,
      telefone: maskPhone(selecionado.telefone),
      observacoes: selecionado.observacoes,
    });
    setErroEdicao("");
    setEditando(true);
  };

  const salvarEdicao = () => {
    if (!selecionado) return;
    if (!edicao.nome.trim()) return setErroEdicao(t("nomeObrigatorio"));
    if (edicao.telefone.replace(/\D/g, "").length < 10) return setErroEdicao(t("telefoneInvalido"));
    const atualizado: Paciente = {
      ...selecionado,
      nome: edicao.nome.trim(),
      telefone: edicao.telefone.replace(/\D/g, ""),
      observacoes: edicao.observacoes,
    };
    setLista((l) => l.map((p) => (p.id === atualizado.id ? atualizado : p)));
    setSelecionado(atualizado);
    setEditando(false);
    notificar(t("toastPacienteAtualizado"));
  };

  const abrirResumo = async (p: Paciente) => {
    setSelecionado(p);
    setEditando(false);
    const chave = `${p.id}|${i18n.language}|${p.historico.join("\n")}`;
    const emCache = cacheResumo.current.get(chave);
    if (emCache) {
      setResumo(emCache);
      return;
    }
    setResumo("...");
    try {
      const texto = await resumirHistorico(p.historico, i18n.language === "en" ? "en" : "pt");
      cacheResumo.current.set(chave, texto);
      setResumo(texto);
    } catch {
      setResumo(t("erroResumo"));
    }
  };

  const termo = busca.trim().toLowerCase();
  const digitos = termo.replace(/\D/g, "");
  const listaFiltrada = termo
    ? lista.filter((p) => p.nome.toLowerCase().includes(termo) || (digitos !== "" && p.telefone.includes(digitos)))
    : lista;
  const consultasDoPaciente = consultas
    .filter((c) => c.pacienteId === selecionado?.id)
    .sort((a, b) => b.inicio.localeCompare(a.inicio));
  const rotuloStatus = (s: Consulta["status"]) => t(chaveStatus(s));

  return (
    <section className="pacientes">
      <div>
        <h2>{t("pacientes")}</h2>
        <input
          ref={buscaRef}
          className="busca"
          title={t("atalhoBusca")}
          placeholder={t("buscarPaciente")}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        {!termo && lista.length === 0 && <p className="vazio">{t("pacientesVazio")}</p>}
        {termo && listaFiltrada.length === 0 && <p>{t("nenhumPaciente")}</p>}
        <ul className="lista">
          {listaFiltrada.map((p) => (
            <li key={p.id}>
              <button onClick={() => abrirResumo(p)}>{p.nome}</button>
            </li>
          ))}
        </ul>
        {selecionado && (
          <div className="detalhe">
            <h3>{selecionado.nome}</h3>
            {editando ? (
              <div className="edicao">
                <label>
                  {t("nome")}
                  <input value={edicao.nome} onChange={(e) => setEdicao({ ...edicao, nome: e.target.value })} />
                </label>
                <label>
                  {t("telefone")}
                  <input
                    value={edicao.telefone}
                    onChange={(e) => setEdicao({ ...edicao, telefone: maskPhone(e.target.value) })}
                  />
                </label>
                <label>
                  {t("observacoes")}
                  <textarea
                    value={edicao.observacoes}
                    onChange={(e) => setEdicao({ ...edicao, observacoes: e.target.value })}
                  />
                </label>
                {erroEdicao && <span className="erro" role="alert">{erroEdicao}</span>}
                <div className="acoes">
                  <button onClick={salvarEdicao}>{t("salvarEdicao")}</button>
                  <button onClick={() => setEditando(false)}>{t("cancelar")}</button>
                </div>
              </div>
            ) : (
              <>
                <p>
                  <strong>{t("telefone")}:</strong> {maskPhone(selecionado.telefone)}
                </p>
                {selecionado.observacoes && (
                  <p>
                    <strong>{t("observacoes")}:</strong> {selecionado.observacoes}
                  </p>
                )}
                <button onClick={iniciarEdicao}>{t("editar")}</button>{" "}
                <button type="button" onClick={() => window.print()}>{t("imprimir")}</button>{" "}
                {confirmandoExclusao ? (
                  <div className="confirmacao">
                    <span className="pergunta-cancelar">
                      {t("perguntaExcluirPaciente", {
                        nome: selecionado.nome,
                        n: consultas.filter((c) => c.pacienteId === selecionado.id).length,
                      })}
                    </span>
                    <button className="perigo" onClick={excluirPaciente}>
                      {t("confirmarExcluir")}
                    </button>
                    <button type="button" onClick={() => setConfirmandoExclusao(false)}>
                      {t("voltar")}
                    </button>
                  </div>
                ) : (
                  <button className="perigo-suave" onClick={() => setConfirmandoExclusao(true)}>
                    {t("excluirPaciente")}
                  </button>
                )}
              </>
            )}
            <p>
              <strong>{t("historico")}:</strong>
            </p>
            <ul className="anotacoes">
              {selecionado.historico.map((h, i) => (
                <li key={i}>
                  {editandoAnotacao === i ? (
                    <>
                      <input
                        value={textoAnotacao}
                        onChange={(e) => setTextoAnotacao(e.target.value)}
                        aria-label={t("novaAnotacao")}
                      />
                      <button onClick={() => salvarAnotacao(i)}>{t("salvarEdicao")}</button>
                      <button type="button" onClick={() => setEditandoAnotacao(null)}>
                        {t("cancelar")}
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{h}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditandoAnotacao(i);
                          setTextoAnotacao(h);
                        }}
                      >
                        {t("editar")}
                      </button>
                      <button type="button" className="perigo-suave" onClick={() => removerAnotacao(i)}>
                        {t("excluir")}
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <h4>{t("prontuario")}</h4>
            <h5>{t("consultasPaciente")}</h5>
            {consultasDoPaciente.length === 0 ? (
              <p>{t("semConsultas")}</p>
            ) : (
              <ul>
                {consultasDoPaciente.map((c) => (
                  <li key={c.id}>
                    {new Date(c.inicio).toLocaleString(i18n.language === "pt" ? "pt-BR" : "en-US", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}{" "}
                    — {profissionais.find((p) => p.id === c.profissionalId)?.nome} — {rotuloStatus(c.status)}{profissionais.find((p) => p.id === c.profissionalId)?.ativo === false && <em> ({t("inativo")})</em>}
                  </li>
                ))}
              </ul>
            )}
            <h5>{t("novaAnotacao")}</h5>
            <textarea value={anotacao} onChange={(e) => setAnotacao(e.target.value)} />
            <div>
              <button onClick={adicionarAnotacao}>{t("adicionar")}</button>
            </div>
            <p>
              <strong>{t("resumoIA")}:</strong> {resumo}
            </p>
          </div>
        )}
      </div>

      <form className="novo" onSubmit={handleSubmit(onSubmit)}>
        <h2>{t("novoPaciente")}</h2>
        <label>
          {t("nome")}
          <input {...register("nome")} autoFocus />
          {errors.nome && <span className="erro" role="alert">{t(errors.nome.message!)}</span>}
        </label>
        <label>
          {t("cpf")}
          <input
            {...register("cpf", {
              onChange: (e) => setValue("cpf", maskCPF(e.target.value)),
            })}
            placeholder="000.000.000-00"
          />
          <small className="ajuda">{t("ajudaCpf")}</small>
          {errors.cpf && <span className="erro" role="alert">{t(errors.cpf.message!)}</span>}
        </label>
        <label>
          {t("telefone")}
          <input
            {...register("telefone", {
              onChange: (e) => setValue("telefone", maskPhone(e.target.value)),
            })}
            placeholder="(00) 00000-0000"
          />
          {errors.telefone && <span className="erro" role="alert">{t(errors.telefone.message!)}</span>}
        </label>
        <label>
          {t("nascimento")}
          <input type="date" {...register("nascimento")} />
          {errors.nascimento && <span className="erro" role="alert">{t(errors.nascimento.message!)}</span>}
        </label>
        <button type="submit">{t("salvar")}</button>
      </form>
    </section>
  );
}
