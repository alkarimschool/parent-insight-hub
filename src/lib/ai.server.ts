// Server-only helper to call Google Gemini API or Lovable AI Gateway with retry and logging.
export interface AiCallOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export async function callLovableAiJson(opts: AiCallOptions): Promise<{ text: string; model: string }> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  if (!geminiKey && !lovableKey) {
    console.warn("[AI_SERVER] No direct GEMINI_API_KEY or LOVABLE_API_KEY found in process.env. Will fallback to rule-based analysis if AI request fails.");
  }

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const startTime = Date.now();
    try {
      console.info(`[GEMINI_REQUEST] Attempt ${attempt}/${maxRetries + 1} | Model: ${opts.model} | SystemPrompt length: ${opts.systemPrompt.length} chars | UserPrompt length: ${opts.userPrompt.length} chars`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      let res: Response;
      let usedModelName = opts.model;

      if (geminiKey) {
        // Direct Google Gemini API endpoint
        const cleanModel = opts.model.includes("gemini") ? opts.model.replace("google/", "") : "gemini-1.5-flash";
        usedModelName = cleanModel;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${geminiKey}`;

        res = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: { parts: [{ text: opts.systemPrompt }] },
            contents: [{ parts: [{ text: opts.userPrompt }] }],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: opts.temperature ?? 0.7,
              maxOutputTokens: opts.maxTokens ?? 4096,
            },
          }),
        });
      } else {
        // Lovable Gateway API endpoint
        res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableKey || ""}`,
          },
          signal: controller.signal,
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
      }

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[GEMINI_REQUEST_FAILED] Status: ${res.status} | Duration: ${durationMs}ms | Body: ${errorText}`);
        if (res.status === 429) {
          throw new Error("Batas rate AI tercapai (429).");
        }
        if (res.status === 402) {
          throw new Error("Kredit AI habis (402).");
        }
        throw new Error(`AI Gateway Error [${res.status}]: ${errorText}`);
      }

      const json = await res.json();
      let extractedText = "";

      if (geminiKey) {
        extractedText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      } else {
        extractedText = json?.choices?.[0]?.message?.content ?? "";
      }

      console.info(`[GEMINI_RESPONSE] Success | Duration: ${durationMs}ms | Response length: ${extractedText.length} chars`);
      return { text: extractedText, model: usedModelName };
    } catch (err: any) {
      lastError = err;
      const durationMs = Date.now() - startTime;
      console.warn(`[GEMINI_ERROR] Attempt ${attempt} failed after ${durationMs}ms:`, err?.message || err);

      if (attempt <= maxRetries) {
        const backoffMs = attempt * 1000;
        console.info(`[GEMINI_RETRY] Retrying in ${backoffMs}ms...`);
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }
  }

  throw lastError || new Error("Gagal terhubung ke layanan AI setelah beberapa kali percobaan.");
}