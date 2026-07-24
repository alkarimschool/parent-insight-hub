import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { callLovableAiJson } from "./ai.server";

interface SubmitInput {
  parent: { name: string; whatsapp: string };
  child: { name: string; gender: "L" | "P"; birth_date: string; school?: string; class_name?: string };
  answers: Array<{ question_id: string; score: number }>;
}

function ageFromDate(iso: string): number {
  const b = new Date(iso);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export async function submitAndAnalyze(data: SubmitInput) {
  // 1. Insert parent
  const { data: parent, error: pErr } = await supabaseAdmin
    .from("parents")
    .insert({ name: data.parent.name, whatsapp: data.parent.whatsapp })
    .select()
    .single();
  if (pErr || !parent) throw new Error("Gagal menyimpan data orang tua: " + pErr?.message);

  // 2. Insert child
  const { data: child, error: cErr } = await supabaseAdmin
    .from("children")
    .insert({
      parent_id: parent.id,
      name: data.child.name,
      gender: data.child.gender,
      birth_date: data.child.birth_date,
      school: data.child.school || null,
      class_name: data.child.class_name || null,
    })
    .select()
    .single();
  if (cErr || !child) throw new Error("Gagal menyimpan data anak: " + cErr?.message);

  // 3. Insert assessment
  const { data: assessment, error: aErr } = await supabaseAdmin
    .from("assessments")
    .insert({ parent_id: parent.id, child_id: child.id, status: "analyzing" })
    .select()
    .single();
  if (aErr || !assessment) throw new Error("Gagal membuat assessment: " + aErr?.message);

  // 4. Insert answers
  const answerRows = data.answers.map((a) => ({
    assessment_id: assessment.id,
    question_id: a.question_id,
    score: a.score,
  }));
  const { error: ansErr } = await supabaseAdmin.from("assessment_answers").insert(answerRows);
  if (ansErr) throw new Error("Gagal menyimpan jawaban: " + ansErr.message);

  // 5. Fetch questions for prompt context
  const qIds = data.answers.map((a) => a.question_id);
  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, text, category_id, question_categories(name)")
    .in("id", qIds);

  const answersText = data.answers
    .map((a) => {
      const q = questions?.find((qq) => qq.id === a.question_id);
      const cat = (q as any)?.question_categories?.name ?? "";
      const label = ["Tidak Pernah", "Jarang", "Kadang-kadang", "Sering", "Selalu"][a.score - 1];
      return `[${cat}] ${q?.text ?? ""} → ${a.score} (${label})`;
    })
    .join("\n");

  // 6. Get active prompt + settings
  const [{ data: prompt }, { data: settings }] = await Promise.all([
    supabaseAdmin.from("ai_prompts").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from("ai_settings").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!prompt) throw new Error("Prompt AI belum dikonfigurasi.");

  const age = ageFromDate(data.child.birth_date);
  const filled = prompt.user_template
    .replace(/\{\{parent_name\}\}/g, data.parent.name)
    .replace(/\{\{parent_whatsapp\}\}/g, data.parent.whatsapp)
    .replace(/\{\{child_name\}\}/g, data.child.name)
    .replace(/\{\{child_gender\}\}/g, data.child.gender === "L" ? "Laki-laki" : "Perempuan")
    .replace(/\{\{child_birth_date\}\}/g, data.child.birth_date)
    .replace(/\{\{child_age\}\}/g, String(age))
    .replace(/\{\{child_school\}\}/g, data.child.school || "-")
    .replace(/\{\{child_class\}\}/g, data.child.class_name || "-")
    .replace(/\{\{answers\}\}/g, answersText);

  const schemaHint = `\n\nBalas HANYA sebagai JSON valid dengan struktur:\n{
  "ringkasan": "string",
  "kelebihan": ["string"],
  "area_pengembangan": ["string"],
  "kecerdasan_sosial": "string",
  "kecerdasan_emosional": "string",
  "kemampuan_komunikasi": "string",
  "kemandirian": "string",
  "kemampuan_belajar": "string",
  "potensi": "string",
  "area_stimulasi": ["string"],
  "perhatian_orangtua": ["string"],
  "treatment": [{"kategori": "string", "aktivitas": "string"}],
  "kesimpulan": "string"
}`;

  try {
    const { text, model } = await callLovableAiJson({
      model: settings?.model ?? "google/gemini-3.6-flash",
      systemPrompt: prompt.system_prompt,
      userPrompt: filled + schemaHint,
      temperature: Number(settings?.temperature ?? 0.7),
      maxTokens: settings?.max_tokens ?? 4096,
    });
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { raw: text };
    }
    await supabaseAdmin.from("ai_results").insert({
      assessment_id: assessment.id,
      content: parsed,
      raw_text: text,
      model,
    });
    await supabaseAdmin.from("assessments").update({ status: "analyzed" }).eq("id", assessment.id);

    // Optional: send WhatsApp
    const { data: wa } = await supabaseAdmin.from("whatsapp_settings").select("*").eq("is_active", true).maybeSingle();
    if (wa?.api_url && wa.api_token && wa.template) {
      try {
        const msg = wa.template
          .replace(/\{\{parent_name\}\}/g, data.parent.name)
          .replace(/\{\{child_name\}\}/g, data.child.name);
        await fetch(wa.api_url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${wa.api_token}` },
          body: JSON.stringify({ to: data.parent.whatsapp, from: wa.sender ?? "", message: msg }),
        });
      } catch (e) {
        console.warn("WA send failed", e);
      }
    }

    return { assessment_id: assessment.id, status: "analyzed" as const };
  } catch (e) {
    await supabaseAdmin.from("assessments").update({ status: "failed" }).eq("id", assessment.id);
    throw e;
  }
}

export async function runTestPrompt() {
  const { data: settings } = await supabaseAdmin.from("ai_settings").select("*").eq("is_active", true).maybeSingle();
  const { text } = await callLovableAiJson({
    model: settings?.model ?? "google/gemini-3.6-flash",
    systemPrompt: "Balas ringkas dalam JSON: {\"status\":\"ok\"}",
    userPrompt: "Tes koneksi.",
    temperature: 0,
    maxTokens: 128,
  });
  return { ok: true, sample: text };
}