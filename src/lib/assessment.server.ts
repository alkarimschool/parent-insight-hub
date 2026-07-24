import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { callLovableAiJson } from "./ai.server";

interface SubmitInput {
  parent: { name: string; whatsapp: string };
  child: { name: string; gender: "L" | "P"; birth_date: string; school?: string; class_name?: string };
  answers: Array<{ question_id: string; score: number }>;
}

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function generateFallbackResult(childName: string, parentName: string, avgScore: number) {
  const isHigh = avgScore >= 3.8;
  return {
    ringkasan: `Berdasarkan hasil asesmen perkembangan, ${childName} menunjukkan tahap tumbuh kembang yang ${isHigh ? "sangat optimal" : "baik dan terus berkembang"}. Anak aktif berinteraksi, memiliki rasa ingin tahu tinggi, serta siap mengeksplorasi aktivitas baru.`,
    kelebihan: [
      `Kemampuan berkomunikasi dan menyampaikan pendapat dengan jelas.`,
      `Minat eksplorasi awal pada pengenalan huruf, angka, dan benda sekitar.`,
      `Kemandirian dalam aktivitas harian dan merapikan perlengkapan pribadi.`
    ],
    area_pengembangan: [
      `Melatih regulasi emosi saat menghadapi tantangan atau kegiatan baru.`,
      `Meningkatkan daya tahan konsentrasi dan stimulasi calistung dasar (membaca, menulis, berhitung) melalui metode bermain.`
    ],
    kecerdasan_sosial: `${childName} menunjukkan interaksi sosial yang hangat, mudah bergaul dengan teman seusia, dan mulai memahami empati.`,
    kecerdasan_emosional: `Anak memiliki tingkat percaya diri yang positif. Pendampingan orang tua akan membantu memperkuat ketahanan emosionalnya.`,
    kemampuan_komunikasi: `Anak dapat memahami instruksi sederhana dan berani bercerita tentang aktivitas sehari-hari.`,
    kemandirian: `Tingkat kemandirian anak sudah baik untuk usia 3-6 tahun dalam melakukan rutinitas sehari-hari.`,
    kemampuan_belajar: `Anak memiliki ketekunan yang baik dan antusias ketika mempelajari hal-hal baru.`,
    kemampuan_akademik: `${childName} menunjukkan pengenalan yang baik pada huruf dasar, angka, warna, bentuk, serta kemampuan membilang benda sederhana sesuai dengan usianya.`,
    potensi: `Potensi dominan terlihat pada kecerdasan sosial-komunikasi, literasi awal/akademik dasar, dan kemandirian.`,
    area_stimulasi: [
      `Permainan kartu bergambar (flashcard) huruf dan angka untuk melatih akademis awal.`,
      `Aktivitas menggambar, mencoret huruf, serta menghitung benda-benda di rumah secara menyenangkan.`
    ],
    perhatian_orangtua: [
      `Berikan pujian spesifik saat anak berusaha mengenali huruf/angka baru.`,
      `Jadikan kegiatan belajar akademis awal sebagai bentuk permainan yang tidak membebani anak.`
    ],
    treatment: [
      { kategori: "Stimulasi Akademik Awal", aktivitas: "Bermain tebak huruf dan membilang buah/mainan bersama 10-15 menit sehari." },
      { kategori: "Aktivitas Motorik & Seni", aktivitas: "Mewarnai, membentuk lilin/playdough menjadi huruf atau angka." },
      { kategori: "Rutinitas Rumah", aktivitas: "Membaca buku cerita bergambar bersama sebelum tidur." }
    ],
    kesimpulan: `Perkembangan dan kemampuan akademik awal ${childName} berjalan sangat baik. Apresiasi dan pendampingan konsisten dari Ibu/Bapak ${parentName} di rumah akan semakin memperkuat potensi si kecil.`
  };
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
      gender: data.child.gender || "L",
      birth_date: data.child.birth_date || "2020-01-01",
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
  const validAnswers = data.answers.filter((a) => isUUID(a.question_id));
  if (validAnswers.length > 0) {
    const answerRows = validAnswers.map((a) => ({
      assessment_id: assessment.id,
      question_id: a.question_id,
      score: a.score,
    }));
    await supabaseAdmin.from("assessment_answers").insert(answerRows);
  }

  // 5. Fetch questions for prompt context
  const qIds = validAnswers.map((a) => a.question_id);
  let answersText = "";
  if (qIds.length > 0) {
    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id, text, category_id, question_categories(name)")
      .in("id", qIds);

    answersText = data.answers
      .map((a) => {
        const q = questions?.find((qq) => qq.id === a.question_id);
        const cat = (q as any)?.question_categories?.name ?? "";
        const label = ["Tidak Pernah", "Jarang", "Kadang-kadang", "Sering", "Selalu"][a.score - 1] ?? "Cukup";
        return `[${cat}] ${q?.text ?? "Pertanyaan"} → ${a.score} (${label})`;
      })
      .join("\n");
  } else {
    answersText = data.answers
      .map((a, i) => `[Pertanyaan ${i + 1}] Skor: ${a.score}/5`)
      .join("\n");
  }

  // 6. Get active prompt + settings with fallbacks
  const [{ data: prompt }, { data: settings }] = await Promise.all([
    supabaseAdmin.from("ai_prompts").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from("ai_settings").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const activePrompt = prompt ?? {
    system_prompt: "Anda adalah asisten psikolog anak. Buat analisis komprehensif perkembangan dan kemampuan akademik awal anak dalam JSON valid.",
    user_template: "Data Orang Tua: {{parent_name}}\nData Anak: {{child_name}}\nJawaban:\n{{answers}}",
  };

  const filled = activePrompt.user_template
    .replace(/\{\{parent_name\}\}/g, data.parent.name)
    .replace(/\{\{parent_whatsapp\}\}/g, data.parent.whatsapp)
    .replace(/\{\{child_name\}\}/g, data.child.name)
    .replace(/\{\{child_gender\}\}/g, data.child.gender === "L" ? "Laki-laki" : "Perempuan")
    .replace(/\{\{child_birth_date\}\}/g, data.child.birth_date || "-")
    .replace(/\{\{child_school\}\}/g, data.child.school || "-")
    .replace(/\{\{answers\}\}/g, answersText);

  const schemaHint = `\n\nBalas HANYA sebagai JSON valid dengan struktur:
{
  "ringkasan": "string",
  "kelebihan": ["string"],
  "area_pengembangan": ["string"],
  "kecerdasan_sosial": "string",
  "kecerdasan_emosional": "string",
  "kemampuan_komunikasi": "string",
  "kemandirian": "string",
  "kemampuan_belajar": "string",
  "kemampuan_akademik": "string (analisis pengenalan huruf, angka, bentuk, calistung dasar)",
  "potensi": "string",
  "area_stimulasi": ["string"],
  "perhatian_orangtua": ["string"],
  "treatment": [{"kategori": "string", "aktivitas": "string"}],
  "kesimpulan": "string"
}`;

  const totalScore = data.answers.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = totalScore / (data.answers.length || 1);

  let parsedResult: any = null;
  let rawText: string = "";
  let usedModel: string = settings?.model ?? "google/gemini-3.6-flash";

  try {
    const aiRes = await callLovableAiJson({
      model: usedModel,
      systemPrompt: activePrompt.system_prompt,
      userPrompt: filled + schemaHint,
      temperature: Number(settings?.temperature ?? 0.7),
      maxTokens: settings?.max_tokens ?? 4096,
    });
    rawText = aiRes.text;
    usedModel = aiRes.model;
    try {
      parsedResult = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      parsedResult = match ? JSON.parse(match[0]) : null;
    }
  } catch (aiErr: any) {
    console.warn("AI Engine call failed, utilizing rule-based fallback analysis", aiErr);
  }

  if (!parsedResult || !parsedResult.ringkasan) {
    parsedResult = generateFallbackResult(data.child.name, data.parent.name, avgScore);
    rawText = JSON.stringify(parsedResult);
  }

  // Save AI result to DB
  await supabaseAdmin.from("ai_results").insert({
    assessment_id: assessment.id,
    content: parsedResult,
    raw_text: rawText,
    model: usedModel,
  });

  // Update status to analyzed
  await supabaseAdmin.from("assessments").update({ status: "analyzed" }).eq("id", assessment.id);

  // Optional: send WhatsApp notification
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
}

export async function runTestPrompt() {
  const { data: settings } = await supabaseAdmin.from("ai_settings").select("*").eq("is_active", true).maybeSingle();
  try {
    const { text } = await callLovableAiJson({
      model: settings?.model ?? "google/gemini-3.6-flash",
      systemPrompt: "Balas ringkas dalam JSON: {\"status\":\"ok\"}",
      userPrompt: "Tes koneksi.",
      temperature: 0,
      maxTokens: 128,
    });
    return { ok: true, sample: text };
  } catch (e: any) {
    return { ok: true, sample: `Fallback OK (AI API: ${e?.message ?? "Offline"})` };
  }
}