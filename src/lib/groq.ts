// Camada de IA (Fase 3). A chave vem de VITE_GROQ_API_KEY.
// Atenção: chamar a Groq direto do navegador expõe a chave. Use só para protótipo.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function resumirHistorico(historico: string[]): Promise<string> {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) return "Configure VITE_GROQ_API_KEY para usar o resumo com IA.";
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: "Resuma em português, em até 3 frases, o histórico clínico a seguir." },
        { role: "user", content: historico.join("\n") },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Não foi possível gerar o resumo.";
}
