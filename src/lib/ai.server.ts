// Server-only helper to call Lovable AI Gateway (JSON mode).
export interface AiCallOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export async function callLovableAiJson(opts: AiCallOptions): Promise<{ text: string; model: string }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY tidak tersedia. Aktifkan Lovable AI.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: opts.model,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("Batas rate AI tercapai. Coba lagi sebentar lagi.");
    if (res.status === 402) throw new Error("Kredit AI habis. Silakan tambah kredit di workspace.");
    throw new Error(`AI error [${res.status}]: ${body}`);
  }
  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
    model?: string;
  };
  return { text: data.choices?.[0]?.message?.content ?? "", model: data.model ?? opts.model };
}