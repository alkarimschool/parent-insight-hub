import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { LEVEL_QUESTIONS } from "../lib/questions.data";

async function runLiveHanumTest() {
  console.log("==========================================================================");
  console.log("🌐 LIVE WEB ASSESSMENT AUDIT — NAMA ANAK: HANUM");
  console.log("==========================================================================");

  const tkQuestions = LEVEL_QUESTIONS.TK;

  // Buat profil jawaban realistic untuk Hanum (campuran kekuatan di Bahasa/Sosial & penguatan di Motorik/Kognitif)
  const answers = tkQuestions.map((q, idx) => {
    let score = 4;
    const cat = (q.category_name || "").toLowerCase();

    if (cat.includes("bahasa") || cat.includes("komunikasi")) {
      score = 5; // Sangat kuat di Bahasa & Komunikasi
    } else if (cat.includes("sosial") || cat.includes("emosi")) {
      score = 4; // Baik di Sosial Emosional
    } else if (cat.includes("motorik")) {
      score = (idx % 2 === 0) ? 3 : 2; // Perlu pendampingan di Motorik
    } else if (cat.includes("kognitif")) {
      score = (idx % 3 === 0) ? 2 : 4; // Campuran di Kognitif
    } else {
      score = 4;
    }

    return {
      question_id: q.id,
      score
    };
  });

  const payload = {
    parent: {
      name: "Bunda Hanum",
      whatsapp: "081299887766"
    },
    child: {
      name: "Hanum",
      gender: "P",
      birth_date: "2020-05-15",
      school: "TK Al-Karim",
      class_name: "Kelompok B",
      education_level: "TK"
    },
    answers
  };

  console.log("📌 [STEP 1] Mengirim submission live ke backend web...");
  const submitRes = await submitAndAnalyze(payload as any);
  const assessmentId = submitRes?.assessment_id || (submitRes as any)?.id;

  if (!assessmentId) {
    console.error("❌ Gagal menyimpan asesmen live untuk Hanum.");
    return;
  }

  console.log(`✓ Asesmen Live Berhasil Disimpan di Supabase DB | ID: ${assessmentId}`);

  console.log("📌 [STEP 2] Membaca hasil laporan dari database...");
  const reportRes = await getAssessmentResultServer(assessmentId, true);
  const content = reportRes?.content || (reportRes as any)?.assessment_results?.result_json;

  console.log("\n==========================================================================");
  console.log("📄 HASIL LAPORAN ASESMEN LIVE AKTUIL — ANAK: HANUM");
  console.log("==========================================================================");
  console.log(`nama_anak            : ${reportRes?.child_name || "Hanum"}`);
  console.log(`nama_orang_tua       : ${reportRes?.parent_name || "Bunda Hanum"}`);
  console.log(`jenjang              : ${reportRes?.education_level || "TK"}`);
  console.log(`id_asesmen           : ${assessmentId}`);
  console.log(`status_perkembangan  : ${content?.status_perkembangan}`);
  console.log("\n--- BAGIAN 2: AREA YANG PERLU DIPERHATIKAN ---");
  console.log(JSON.stringify(content?.area_yang_perlu_diperhatikan, null, 2));
  console.log("\n--- BAGIAN 3: GAMBARAN PERKEMBANGAN ANAK ---");
  console.log(`🗣️ Bahasa & Komunikasi: ${content?.gambaran_perkembangan_anak?.bahasa_dan_komunikasi}`);
  console.log(`👥 Sosial & Emosional  : ${content?.gambaran_perkembangan_anak?.sosial_dan_emosional}`);
  console.log(`🏃 Motorik             : ${content?.gambaran_perkembangan_anak?.motorik}`);
  console.log(`🧩 Kognitif            : ${content?.gambaran_perkembangan_anak?.kognitif_dan_cara_berpikir}`);
  console.log("\n--- BAGIAN 4: POTENSI & KELEBIHAN ---");
  console.log(JSON.stringify(content?.potensi_dan_kelebihan, null, 2));
  console.log("\n--- BAGIAN 5: CATATAN UNTUK ORANG TUA ---");
  console.log(content?.catatan_untuk_orang_tua);

  console.log("\n--- PEMERIKSAAN REKOMENDASI STIMULASI DI RUMAH ---");
  const jsonStr = JSON.stringify(content).toLowerCase();
  const hasRecommendation = jsonStr.includes("rekomendasi_stimulasi_di_rumah") || jsonStr.includes("rekomendasi stimulasi di rumah");
  console.log(`Keberadaan Rekomendasi Stimulasi di Rumah: ${hasRecommendation ? "❌ MASIH ADA" : "🟢 TIDAK ADA (SUDAH TERHAPUS TOTAL)"}`);
  console.log("==========================================================================\n");
}

runLiveHanumTest().catch(console.error);
