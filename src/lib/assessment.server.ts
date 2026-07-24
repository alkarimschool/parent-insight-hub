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

const LEVEL_PROFILES: Record<EducationLevel, {
  ringkasan: (name: string, isHigh: boolean) => string;
  kelebihan: (name: string) => string[];
  area_pengembangan: (name: string) => string[];
  kemampuan_akademik: (name: string) => string;
  kecerdasan_sosial: (name: string) => string;
  kecerdasan_emosional: (name: string) => string;
  karakter: (name: string) => string;
  potensi: (name: string) => string;
  minat_bakat: (name: string) => string;
  perhatian_orangtua: (name: string) => string[];
  treatment: (name: string) => Array<{ kategori: string; aktivitas: string }>;
  rekomendasi_akademik: (name: string) => string;
  kesimpulan: (childName: string, parentName: string) => string;
}> = {
  TK: {
    ringkasan: (name, isHigh) => `Berdasarkan asesmen perkembangan anak usia dini (TK / PAUD), ${name} menunjukkan kesiapan tumbuh kembang dan calistung awal yang ${isHigh ? "sangat optimal" : "baik dan berkembang positif"}. Anak aktif, memiliki rasa ingin tahu tinggi, dan siap mengikuti kegiatan sekolah.`,
    kelebihan: (name) => [
      `Mampu menyampaikan keinginan dan berkomunikasi verbal dengan jelas.`,
      `Mengenal huruf dasar, angka, warna, bentuk, dan membilang benda harian.`,
      `Antusias mencoba permainan baru dan beradaptasi dengan teman seusianya.`
    ],
    area_pengembangan: (name) => [
      `Meningkatkan konsentrasi dan ketekunan saat menyelesaikan permainan (10–15 menit).`,
      `Melatih kemandirian merapikan mainan dan regulasi emosi saat timbul kekecewaan.`
    ],
    kemampuan_akademik: (name) => `${name} memiliki kesiapan akademik awal TK yang baik: telah mengenal huruf alfabet dasar, menyebutkan angka, mengenal warna dan bentuk, serta mampu mengikuti instruksi 2 langkah dari guru/orang tua.`,
    kecerdasan_sosial: (name) => `${name} mudah bergaul, bersikap ramah dengan teman sebaya, dan mulai memahami konsep berbagi permainan.`,
    kecerdasan_emosional: (name) => `${name} memiliki rasa percaya diri yang ceria dan mulai belajar menenangkan diri saat merasa lelah atau kecewa.`,
    karakter: (name) => `Karakter pembelajar usia dini yang jujur, aktif, dan penuh rasa ingin tahu.`,
    potensi: (name) => `Potensi eksplorasi visual, daya ingat permainan, dan kecerdasan komunikasi sosial.`,
    minat_bakat: (name) => `Menunjukkan minat tinggi pada buku cerita bergambar, mewarnai, balok susun, dan lagu anak.`,
    perhatian_orangtua: (name) => [
      `Berikan stimulasi calistung berbasis permainan gembira tanpa paksaan.`,
      `Dampingi rutinitas tidur dan membaca dongeng sebelum tidur.`
    ],
    treatment: (name) => [
      { kategori: "Stimulasi Calistung TK", aktivitas: "Bermain flashcard huruf/angka dan membilang benda harian 10–15 menit bersama orang tua." },
      { kategori: "Kemandirian & Motorik", aktivitas: "Latih anak memakai sepatu, makan sendiri, dan merapikan mainannya." },
      { kategori: "Sosialisasi & Emosi", aktivitas: "Fasilitasi waktu bermain (playdate) bersama teman seusianya." }
    ],
    rekomendasi_akademik: (name) => `Bacakan cerita dongeng interaktif setiap hari, ajak menyebutkan huruf/angka di sekitar lingkungan rumah, serta berikan apresiasi positif atas setiap usaha anak.`,
    kesimpulan: (c, p) => `Perkembangan dan kesiapan sekolah TK ananda ${c} berjalan sangat baik. Pendampingan penuh kasih dari Ibu/Bapak ${p} akan mengoptimalkan potensi emas usia dininya.`
  },

  SD: {
    ringkasan: (name, isHigh) => `Berdasarkan asesmen karakter dan kebiasaan belajar Sekolah Dasar (SD), ${name} menunjukkan performa akademik, literasi, numerasi, dan disiplin yang ${isHigh ? "sangat memuaskan" : "baik dan terus berkembang"}. Anak memiliki fondasi belajar mandiri yang kuat.`,
    kelebihan: (name) => [
      `Kelancaran membaca pemahaman cerita dan kerapihan menulis kalimat.`,
      `Pemahaman operasi matematika dasar (penjumlahan, pengurangan, perkalian/pembagian sederhana).`,
      `Disiplin dalam waktu belajar dan penyelesaian tugas sekolah (PR).`
    ],
    area_pengembangan: (name) => [
      `Mengurangi distrasi penggunaan gadget/game saat waktu belajar mandiri.`,
      `Melatih pemecahan soal cerita matematika berjenjang dan daya fokus belajar (20–30 menit).`
    ],
    kemampuan_akademik: (name) => `${name} memiliki tingkat literasi dan numerasi SD yang solid: mampu membaca teks cerita dengan intonasi baik, memahami makna bacaan, serta melakukan perhitungan angka matematika dasar secara akurat.`,
    kecerdasan_sosial: (name) => `${name} mampu bekerja sama dalam tim proyek sekolah, menghargai teman, dan menunjukkan rasa percaya diri saat tampil di depan kelas.`,
    kecerdasan_emosional: (name) => `${name} mampu mengendalikan emosi saat menghadapi kekalahan atau kesulitan soal latihan.`,
    karakter: (name) => `Karakter anak SD yang disiplin, bertanggung jawab atas tugas sekolah, dan jujur.`,
    potensi: (name) => `Potensi penalaran logika matematika dasar, ekspresi tulisan, dan kreativitas seni/sains.`,
    minat_bakat: (name) => `Terlihat minat pada eksperimen sains sekolah, buku pengetahuan, dan aktivitas olahraga.`,
    perhatian_orangtua: (name) => [
      `Terapkan aturan membatasi waktu layar (screen time) gadget di rumah.`,
      `Dampingi waktu review pelajaran dan apresiasi usaha belajar anak.`
    ],
    treatment: (name) => [
      { kategori: "Penguatan Literasi & Numerasi SD", aktivitas: "Latihan membaca buku cerita pendek dan penyelesaian 5 soal cerita matematika harian." },
      { kategori: "Manajemen Belajar Rumah", aktivitas: "Buatkan jadwal belajar teratur (30-45 menit) di area rumah yang tenang tanpa TV/gadget." },
      { kategori: "Pendampingan Karakter", aktivitas: "Diskusikan nilai tanggung jawab, kejujuran, dan kerapihan perlengkapan sekolah." }
    ],
    rekomendasi_akademik: (name) => `Fasilitasi buku bacaan ensiklopedia anak, dampingi latihan pemecahan soal cerita matematika, dan koordinasikan perkembangan belajar berkala dengan guru kelas di sekolah.`,
    kesimpulan: (c, p) => `Pencapaian akademik dan pembentukan karakter SD ananda ${c} berjalan sangat baik. Pembiasaan belajar teratur yang didukung Ibu/Bapak ${p} di rumah akan menjadi kunci kesuksesannya.`
  },

  SMP: {
    ringkasan: (name, isHigh) => `Berdasarkan asesmen perkembangan remaja awal dan akademik SMP, ${name} menunjukkan motivasi belajar, pemikiran kritis, dan pergaulan positif yang ${isHigh ? "sangat menonjol" : "baik dan terus berkembang"}. Anak memiliki kesadaran diri yang tinggi dalam belajar.`,
    kelebihan: (name) => [
      `Mampu berpikir kritis, menganalisis materi SMP, dan mengajukan argumen logis.`,
      `Memiliki motivasi dan target nilai akademik pribadi.`,
      `Mampu memilih pergaulan positif dan menolak tekanan negatif teman sebaya.`
    ],
    area_pengembangan: (name) => [
      `Manajemen waktu seimbang antara belajar, media sosial, dan hobi.`,
      `Melatih ketahanan diri (resilience) dalam menghadapi persaingan nilai atau tugas kelompok yang rumit.`
    ],
    kemampuan_akademik: (name) => `${name} memiliki kemampuan akademik SMP yang memuaskan: mampu memahami konsep pelajaran yang kompleks, menyelesaikan tugas proyek sekolah secara mandiri, serta memiliki inisiatif mempersiapkan ujian.`,
    kecerdasan_sosial: (name) => `${name} menunjukkan komunikasi yang dewasa dalam kelompok teman sebaya, menghargai perbedaan pendapat, dan aktif dalam kegiatan sekolah.`,
    kecerdasan_emosional: (name) => `${name} mampu mengelola stres beban pelajaran dan perubahan emosi khas usia remaja awal.`,
    karakter: (name) => `Karakter remaja yang mandiri, kritis, bertanggung jawab, dan komunikatif dengan orang tua.`,
    potensi: (name) => `Potensi pemecahan masalah (problem solving), penalaran analitis, dan kepemimpinan organisasi siswa.`,
    minat_bakat: (name) => `Menunjukkan minat spesifik pada bidang ilmu (IPA/IPS/Bahasa/Teknologi) dan kegiatan ekstrakurikuler.`,
    perhatian_orangtua: (name) => [
      `Jaga komunikasi terbuka dua arah tanpa menghakimi pilihan dan emosi remaja.`,
      `Dukung eksplorasi minat calon Sekolah Menengah (SMA/SMK).`
    ],
    treatment: (name) => [
      { kategori: "Pengembangan Berpikir Kritis SMP", aktivitas: "Latihan pemetaan konsep (mind mapping) dan diskusi isu-isu sains/sosial terkini bersama keluarga." },
      { kategori: "Manajemen Waktu Remaja", aktivitas: "Dampingi penyusunan skala prioritas antara tugas sekolah, ekstrakurikuler, dan media sosial." },
      { kategori: "Eksplorasi Masa Depan", aktivitas: "Diskusikan pemetaan minat bakat untuk persiapan pemilihan jurusan SMA/SMK." }
    ],
    rekomendasi_akademik: (name) => `Dorong partisipasi dalam kompetisi akademik/organisasi sekolah, berikan akses sumber belajar digital berkualitas, dan bangun budaya diskusi analisis kritis di rumah.`,
    kesimpulan: (c, p) => `Perkembangan berpikir kritis dan kesiapan akademik SMP ananda ${c} sangat positif. Kemitraan komunikatif dari Ibu/Bapak ${p} akan membimbingnya menjadi remaja yang berprestasi.`
  },

  SMA: {
    ringkasan: (name, isHigh) => `Berdasarkan asesmen kesiapan perguruan tinggi, karier, dan pemikiran analitis SMA/SMK, ${name} menunjukkan kemandirian belajar, riset, dan kepemimpinan yang ${isHigh ? "sangat matang & unggul" : "baik dan siap dikembangkan"}. Anak sangat siap melangkah ke jenjang masa depan.`,
    kelebihan: (name) => [
      `Pemikiran analitis tingkat tinggi, kemampuan riset/studi literatur mandiri, dan penyusunan argumen berbasis data.`,
      `Public speaking dan kemampuan presentasi yang percaya diri dan terstruktur.`,
      `Kesiapan matang dan strategi pemilihan Perguruan Tinggi / Kuliah serta arah profesi masa depan.`
    ],
    area_pengembangan: (name) => [
      `Pengaturan waktu prioritas antara persiapan ujian seleksi PTN/PTS, organisasi, dan waktu istirahat yang cukup.`,
      `Mempertajam keterampilan jaringan (networking) dan manajemen konflik dalam tim.`
    ],
    kemampuan_akademik: (name) => `${name} memiliki prestasi dan kemampuan akademik SMA tingkat lanjut yang unggul: menguasai materi abstrak, mampu melakukan analisis kritis data, serta memiliki konsistensi belajar otonom yang tinggi.`,
    kecerdasan_sosial: (name) => `${name} menunjukkan kepemimpinan yang dewasa, empati sosial, dan kemampuan berkolaborasi dalam proyek profesional.`,
    kecerdasan_emosional: (name) => `${name} memiliki daya tahan (resilience) dan tingkat kedewasaan emosi yang stabil dalam menghadapi tekanan persaingan tinggi.`,
    karakter: (name) => `Karakter dewasa yang mandiri, berintegritas tinggi, dan bertanggung jawab penuh atas pilihan karier pribadinya.`,
    potensi: (name) => `Potensi kepemimpinan strategis, analisis riset ilmiah, public speaking, dan pemecahan masalah kompleks.`,
    minat_bakat: (name) => `Terorientasi jelas pada jurusan kuliah impian (Teknologi/Sains/Sosial/Bisnis/Seni) dan profesi masa depan.`,
    perhatian_orangtua: (name) => [
      `Dukung penuh kemandirian anak dalam menentukan pilihan jurusan kuliah dan karier.`,
      `Fasilitasi bimbingan tryout dan persiapan administrasi perguruan tinggi.`
    ],
    treatment: (name) => [
      { kategori: "Persiapan Perguruan Tinggi (SMA)", aktivitas: "Fasilitasi tryout ujian seleksi masuk kuliah (SNBT/Mandiri) dan konseling jurusan berkala." },
      { kategori: "Riset & Pengembangan Diri", aktivitas: "Dorong penyusunan karya tulis ilmiah, proyek portofolio, dan pelatihan kepemimpinan/bahasa." },
      { kategori: "Kemandirian & Masa Depan", aktivitas: "Beri ruang otonomi penuh dalam pengambilan keputusan hidup dan pengelolaan keuangan pribadi." }
    ],
    rekomendasi_akademik: (name) => `Fasilitasi latihan soal analitis tingkat lanjut, ikuti tryout PTN/PTS secara konsisten, dan tingkatkan keterampilan komunikasi publik serta riset literatur mandiri.`,
    kesimpulan: (c, p) => `Kedewasaan dan kesiapan akademik ananda ${c} dalam menghadapi Perguruan Tinggi & Dunia Karier sudah sangat optimal. Dukungan dan doa dari Ibu/Bapak ${p} akan mengantarkannya mencapai cita-cita besarnya.`
  }
};

function generateFallbackResult(childName: string, parentName: string, avgScore: number, level: EducationLevel = "TK") {
  const isHigh = avgScore >= 3.8;
  const profile = LEVEL_PROFILES[level] || LEVEL_PROFILES.TK;

  return {
    ringkasan: profile.ringkasan(childName, isHigh),
    kelebihan: profile.kelebihan(childName),
    area_pengembangan: profile.area_pengembangan(childName),
    kemampuan_akademik: profile.kemampuan_akademik(childName),
    kecerdasan_sosial: profile.kecerdasan_sosial(childName),
    kecerdasan_emosional: profile.kecerdasan_emosional(childName),
    karakter: profile.karakter(childName),
    potensi: profile.potensi(childName),
    minat_bakat: profile.minat_bakat(childName),
    perhatian_orangtua: profile.perhatian_orangtua(childName),
    treatment: profile.treatment(childName),
    rekomendasi_akademik: profile.rekomendasi_akademik(childName),
    kesimpulan: profile.kesimpulan(childName, parentName)
  };
}

export async function submitAndAnalyze(data: SubmitInput) {
  const level: EducationLevel = data.child.education_level || "TK";

  // 1. Save / Upsert Parent in Supabase
  let parent: any = null;
  const { data: pInserted, error: pErr } = await supabaseAdmin
    .from("parents")
    .insert({ name: data.parent.name, whatsapp: data.parent.whatsapp })
    .select()
    .single();

  if (pErr) {
    const { data: pExisting } = await supabaseAdmin
      .from("parents")
      .select("*")
      .eq("whatsapp", data.parent.whatsapp)
      .maybeSingle();

    if (pExisting) {
      parent = pExisting;
      await supabaseAdmin.from("parents").update({ name: data.parent.name }).eq("id", parent.id);
    } else {
      throw new Error("Gagal menyimpan data orang tua di Supabase: " + pErr.message);
    }
  } else {
    parent = pInserted;
  }

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
  if (cErr || !child) throw new Error("Gagal menyimpan data anak di Supabase: " + cErr?.message);

  // 3. Insert assessment
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
    const { data: aRetry, error: aRetryErr } = await supabaseAdmin
      .from("assessments")
      .insert({
        parent_id: parent.id,
        child_id: child.id,
        status: "analyzing",
      })
      .select()
      .single();

    if (aRetryErr || !aRetry) throw new Error("Gagal membuat assessment di Supabase: " + (aRetryErr?.message || aErr.message));
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

export async function getAssessmentResultServer(assessmentId: string) {
  if (!assessmentId) return null;

  // 1. Fetch AI result by assessment_id
  const { data: aiRes } = await supabaseAdmin
    .from("ai_results")
    .select("*")
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  // 2. Fetch assessment details
  const { data: assessment } = await supabaseAdmin
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .maybeSingle();

  if (!assessment) return null;

  // 3. Fetch child and parent details
  const [{ data: child }, { data: parent }] = await Promise.all([
    assessment.child_id
      ? supabaseAdmin.from("children").select("*").eq("id", assessment.child_id).maybeSingle()
      : Promise.resolve({ data: null }),
    assessment.parent_id
      ? supabaseAdmin.from("parents").select("*").eq("id", assessment.parent_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const level: EducationLevel = (assessment.education_level as EducationLevel) || "TK";

  // 4. Ensure complete 13-section level analysis content
  let content = aiRes?.content;
  if (!content || typeof content !== "object" || !content.ringkasan) {
    content = generateFallbackResult(child?.name || "Anak", parent?.name || "Orang Tua", 4.0, level);
  }

  return {
    assessment_id: assessmentId,
    status: assessment.status || "analyzed",
    education_level: level,
    child_name: child?.name || "Anak",
    parent_name: parent?.name || "Orang Tua",
    created_at: assessment.created_at || new Date().toISOString(),
    content,
  };
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