// Camada de IA (Fase 3). A chave vem de VITE_GROQ_API_KEY.
// Atenção: chamar a Groq direto do navegador expõe a chave. Use só para protótipo.
import { lerChaveGroq } from "./groqKey";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function resumirHistorico(historico: string[], idioma: "pt" | "en" = "pt"): Promise<string> {
  const key = lerChaveGroq() ?? import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error("VITE_GROQ_API_KEY ausente");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(GROQ_URL, {
    method: "POST",
    signal: controller.signal,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            idioma === "en"
              ? "Summarize the following clinical history in English, in at most 3 sentences."
              : "Resuma em português, em até 3 frases, o histórico clínico a seguir.",
        },
        { role: "user", content: historico.join("\n") },
      ],
    }),
  });
    if (!res.ok) throw new Error(`Groq respondeu ${res.status}`);
    const data = await res.json();
    const texto = data.choices?.[0]?.message?.content;
    if (typeof texto !== "string" || !texto.trim()) throw new Error("Resposta vazia da Groq");
    return texto.trim();
  } finally {
    clearTimeout(timeout);
  }
}
