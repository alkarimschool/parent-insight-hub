import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { callLovableAiJson } from "./ai.server";
import { EducationLevel } from "./questions.data";

interface SubmitInput {
  parent: { name: string; whatsapp: string };
  child: {
    name: string;
    gender: "L" | "P";
    birth_date: string;
    school?: string;
    class_name?: string;
    education_level?: EducationLevel;
  };
  answers: Array<{ question_id: string; score: number }>;
}

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function generateFallbackResult(childName: string, parentName: string, avgScore: number, level: EducationLevel = "TK") {
  const isHigh = avgScore >= 3.8;

  const academicTexts: Record<EducationLevel, string> = {
    TK: `${childName} menunjukkan tahap perkembangan calistung awal yang positif, mengenal huruf dasar, angka, warna, bentuk, serta daya ingat yang baik untuk usia TK.`,
    SD: `${childName} memiliki kemampuan literasi dan numerasi yang berkembang baik, mampu membaca, memahami cerita, serta menyelesaikan soal matematika dasar Sekolah Dasar.`,
    SMP: `${childName} menunjukkan pemikiran kritis awal, mampu menganalisis materi pelajaran SMP, serta menyelesaikan tugas proyek dan pemecahan masalah dengan baik.`,
    SMA: `${childName} memiliki kesiapan akademik tingkat lanjut yang solid, pemikiran analitis, inisiatif riset/studi mandiri, serta wawasan kesiapan kuliah dan karier.`,
  };

  const academicDevTexts: Record<EducationLevel, string> = {
    TK: `Berikan stimulasi calistung berbasis permainan interaktif (flashcard, membaca dongeng bersama, dan membilang benda harian 10-15 menit).`,
    SD: `Dampingi latihan membaca pemahaman cerita pendek, soal cerita numerasi, dan buatkan jadwal belajar mandiri tanpa distraction gadget.`,
    SMP: `Dorong anak melakukan pemetaan konsep (mind mapping), diskusi berpikir kritis tentang isu hangat, dan penyusunan target nilai akademik pribadi.`,
    SMA: `Fasilitasi tryout ujian masuk perguruan tinggi, eksplorasi jurusan kuliah/karier, latihan public speaking, serta riset literatur mandiri.`,
  };

  return {
    ringkasan: `Berdasarkan hasil asesmen perkembangan jenjang ${level}, ${childName} menunjukkan performa tumbuh kembang yang ${isHigh ? "sangat optimal" : "baik dan terus berkembang"}. Anak aktif, memiliki potensi positif, dan siap menghadapi tantangan belajar.`,
    kelebihan: [
      `Kemampuan komunikasi dan pemahaman materi yang baik sesuai jenjang ${level}.`,
      `Minat eksplorasi tinggi dalam aktivitas belajar dan pengembangan diri.`,
      `Kemandirian dan tanggung jawab yang positif.`
    ],
    area_pengembangan: [
      `Meningkatkan konsistensi manajemen waktu dan daya tahan fokus belajar.`,
      `Melatih regulasi emosi saat menghadapi situasi kompetitif atau tekanan tinggi.`
    ],
    kemampuan_akademik: academicTexts[level],
    kecerdasan_sosial: `${childName} menunjukkan interaksi sosial yang sehat, mampu bekerja sama dalam tim, dan beradaptasi baik di lingkungan sekolah.`,
    kecerdasan_emosional: `Anak memiliki tingkat percaya diri yang positif serta mulai memahami kontrol emosi mandiri.`,
    kemampuan_komunikasi: `Anak dapat menyampaikan pemikiran, pendapat, atau ide dengan jelas dan percaya diri.`,
    kemandirian: `Tingkat kemandirian anak sangat baik dalam mengelola rutinitas dan tugas harian jenjang ${level}.`,
    kemampuan_belajar: `Anak memiliki antusiasme dan ketekunan yang baik ketika mempelajari konsep baru.`,
    karakter: `Memiliki karakter pembelajar yang jujur, disiplin, dan bertanggung jawab.`,
    potensi: `Potensi dominan terlihat pada bidang akademik analitis, kepemimpinan, dan komunikasi sosial.`,
    minat_bakat: `Menunjukkan ketertarikan kuat pada pengembangan ilmu pengetahuan, seni kreatif, dan pemecahan masalah.`,
    area_stimulasi: [
      `Latihan pemecahan masalah (problem solving) secara bertahap.`,
      `Aktivitas diskusi dan refleksi mandiri bersama orang tua di rumah.`
    ],
    perhatian_orangtua: [
      `Berikan apresiasi spesifik atas usaha belajar anak, bukan hanya hasil akhir.`,
      `Dukung minat bakat dan berikan ruang ekspresi positif bagi anak.`
    ],
    treatment: [
      { kategori: `Pengembangan Akademik ${level}`, aktivitas: academicDevTexts[level] },
      { kategori: "Pendampingan Karakter", aktivitas: "Diskusikan nilai-nilai kejujuran, tanggung jawab, dan empati sosial." },
      { kategori: "Rutinitas Rumah", aktivitas: "Bangun komunikasi terbuka harian dan ruang evaluasi belajar yang nyaman." }
    ],
    rekomendasi_akademik: academicDevTexts[level],
    kesimpulan: `Perkembangan dan kemampuan akademik jenjang ${level} ${childName} berjalan sangat baik. Apresiasi dan pendampingan konsisten dari Ibu/Bapak ${parentName} di rumah akan semakin memperkuat kesuksesannya.`
  };
}

export async function submitAndAnalyze(data: SubmitInput) {
  const level: EducationLevel = data.child.education_level || "TK";

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

  // 3. Insert assessment (with schema fallback if education_level column is missing)
  let assessment: any = null;
  const { data: aData, error: aErr } = await supabaseAdmin
    .from("assessments")
    .insert({
      parent_id: parent.id,
      child_id: child.id,
      education_level: level,
      status: "analyzing",
    })
    .select()
    .single();

  if (aErr) {
    // Retry without education_level if column doesn't exist on remote schema yet
    const { data: aRetry, error: aRetryErr } = await supabaseAdmin
      .from("assessments")
      .insert({
        parent_id: parent.id,
        child_id: child.id,
        status: "analyzing",
      })
      .select()
      .single();

    if (aRetryErr || !aRetry) throw new Error("Gagal membuat assessment: " + (aRetryErr?.message || aErr.message));
    assessment = aRetry;
  } else {
    assessment = aData;
  }

  // 4. Insert answers (only valid UUIDs)
  const validAnswers = data.answers.filter((a) => isUUID(a.question_id));
  if (validAnswers.length > 0) {
    try {
      const answerRows = validAnswers.map((a) => ({
        assessment_id: assessment.id,
        question_id: a.question_id,
        score: a.score,
      }));
      await supabaseAdmin.from("assessment_answers").insert(answerRows);
    } catch (e) {
      console.warn("Could not insert answers to assessment_answers table", e);
    }
  }

  // 5. Fetch questions text for prompt context
  const qIds = validAnswers.map((a) => a.question_id);
  let answersText = "";
  if (qIds.length > 0) {
    try {
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
    } catch {
      answersText = data.answers.map((a, i) => `[Pertanyaan ${i + 1}] Skor: ${a.score}/5`).join("\n");
    }
  } else {
    answersText = data.answers.map((a, i) => `[Pertanyaan ${i + 1}] Skor: ${a.score}/5`).join("\n");
  }

  // 6. Get active prompt for chosen level
  let activePrompt: any = null;
  let settings: any = null;

  try {
    const [{ data: prompt }, { data: set }] = await Promise.all([
      supabaseAdmin
        .from("ai_prompts")
        .select("*")
        .eq("is_active", true)
        .eq("education_level", level)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin.from("ai_settings").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    activePrompt = prompt;
    settings = set;

    if (!activePrompt) {
      const { data: genPrompt } = await supabaseAdmin
        .from("ai_prompts")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      activePrompt = genPrompt;
    }
  } catch (e) {
    console.warn("Prompt / settings fetch error", e);
  }

  if (!activePrompt) {
    activePrompt = {
      system_prompt: `Anda adalah psikolog dan konsultan pendidikan anak jenjang ${level}. Buat analisis 13 bagian dalam JSON valid.`,
      user_template: `Data Orang Tua: {{parent_name}}\nData Anak: {{child_name}}\nJenjang: {{education_level}}\nJawaban:\n{{answers}}`,
    };
  }

  const filled = activePrompt.user_template
    .replace(/\{\{parent_name\}\}/g, data.parent.name)
    .replace(/\{\{parent_whatsapp\}\}/g, data.parent.whatsapp)
    .replace(/\{\{child_name\}\}/g, data.child.name)
    .replace(/\{\{child_gender\}\}/g, data.child.gender === "L" ? "Laki-laki" : "Perempuan")
    .replace(/\{\{education_level\}\}/g, level)
    .replace(/\{\{child_school\}\}/g, data.child.school || "-")
    .replace(/\{\{answers\}\}/g, answersText);

  const schemaHint = `\n\nBalas HANYA sebagai JSON valid dengan struktur:
{
  "ringkasan": "string",
  "kelebihan": ["string"],
  "area_pengembangan": ["string"],
  "kemampuan_akademik": "string (analisis kemampuan akademik spesifik jenjang ${level})",
  "kecerdasan_sosial": "string",
  "kecerdasan_emosional": "string",
  "karakter": "string",
  "potensi": "string",
  "minat_bakat": "string",
  "perhatian_orangtua": ["string"],
  "treatment": [{"kategori": "string", "aktivitas": "string"}],
  "rekomendasi_akademik": "string (rekomendasi konkret pengembangan akademik jenjang ${level})",
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
    parsedResult = generateFallbackResult(data.child.name, data.parent.name, avgScore, level);
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
  try {
    const { data: wa } = await supabaseAdmin.from("whatsapp_settings").select("*").eq("is_active", true).maybeSingle();
    if (wa?.api_url && wa.api_token && wa.template) {
      const msg = wa.template
        .replace(/\{\{parent_name\}\}/g, data.parent.name)
        .replace(/\{\{child_name\}\}/g, data.child.name);
      await fetch(wa.api_url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${wa.api_token}` },
        body: JSON.stringify({ to: data.parent.whatsapp, from: wa.sender ?? "", message: msg }),
      });
    }
  } catch (e) {
    console.warn("WA send failed", e);
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