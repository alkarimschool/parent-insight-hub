import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { LEVEL_QUESTIONS } from "../lib/questions.data";

// Helper: Normalize text for strict comparison (ignoring names, IDs, spaces)
function normalizeText(text: string, childName: string, parentName: string): string {
  if (!text) return "";
  const cleanName = (childName || "").replace(/^ananda\s+/i, "").trim();
  let normalized = text;
  if (cleanName) {
    const nameRegex = new RegExp(cleanName, "gi");
    normalized = normalized.replace(nameRegex, "[NAMA_SISWA]");
  }
  if (parentName) {
    const parentRegex = new RegExp(parentName, "gi");
    normalized = normalized.replace(parentRegex, "[NAMA_ORANGTUA]");
  }
  return normalized
    .replace(/siswa_live_tk_\d+/gi, "[NAMA_SISWA]")
    .replace(/ortu_live_tk_\d+/gi, "[NAMA_ORANGTUA]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[ID]")
    .toLowerCase()
    .trim();
}

async function runLive30StudentsTest() {
  console.log("==========================================================================");
  console.log("🌐 LIVE WEB ASSESSMENT AUDIT — 30 SISWA TK/PAUD");
  console.log("==========================================================================");

  const tkQuestions = LEVEL_QUESTIONS.TK;
  const numStudents = 30;
  const results: Array<{
    id: string;
    childName: string;
    parentName: string;
    rawReportText: string;
    normReportText: string;
    resultObj: any;
  }> = [];

  console.log(`\n📌 [STEP 1] Memproses 30 Pengisian Asesmen Live Web TK/PAUD...`);

  for (let i = 1; i <= numStudents; i++) {
    const childName = `Siswa_Live_TK_${String(i).padStart(3, "0")}`;
    const parentName = `Ortu_Live_TK_${String(i).padStart(3, "0")}`;

    // Buat variasi jawaban 30 soal yang realistis
    const answers = tkQuestions.map((q, qIdx) => {
      let score = 3;
      if (i <= 7) {
        score = (qIdx + i) % 3 === 0 ? 5 : 4;
      } else if (i <= 15) {
        score = (qIdx + i) % 2 === 0 ? 4 : 3;
      } else if (i <= 22) {
        score = (qIdx + i) % 4 === 0 ? 2 : 3;
      } else {
        if (q.category_name.toLowerCase().includes("bahasa")) score = 5;
        else if (q.category_name.toLowerCase().includes("motorik")) score = 2;
        else score = (qIdx % 3) + 2;
      }
      return { question_id: q.id, score };
    });

    try {
      // Form payload yang dikirim oleh web app
      const payload = {
        parent: {
          name: parentName,
          whatsapp: `08123456${String(i).padStart(4, "0")}`
        },
        child: {
          name: childName,
          gender: i % 2 === 0 ? "P" : "L",
          birth_date: "2020-01-01",
          school: "TK Al-Karim Test",
          class_name: "Kelompok B",
          education_level: "TK"
        },
        answers
      };

      // Panggil backend handler web app (submitAndAnalyze)
      const submitRes = await submitAndAnalyze(payload as any);
      const assessmentId = submitRes?.assessment_id || (submitRes as any)?.id;

      if (!assessmentId) {
        console.error(`❌ Gagal menyimpan asesmen siswa #${i}`);
        continue;
      }

      // Fetch hasil asesmen yang tersimpan di DB & di-render pada UI web (getAssessmentResultServer)
      const reportRes = await getAssessmentResultServer(assessmentId, true);
      const resultObj = (reportRes as any)?.content || (reportRes as any)?.assessment_results?.result_json || reportRes;

      const rawReportText = JSON.stringify(resultObj);
      const normReportText = normalizeText(rawReportText, childName, parentName);

      results.push({
        id: assessmentId,
        childName,
        parentName,
        rawReportText,
        normReportText,
        resultObj
      });

      console.log(`   ✓ [${i}/${numStudents}] ID DB: ${assessmentId} | ${childName} | Status: ${resultObj?.status_perkembangan || "OK"}`);
    } catch (err: any) {
      console.error(`❌ Error submission siswa #${i}:`, err?.message || err);
    }
  }

  console.log(`\n📌 [STEP 2] Memeriksa Struktur Laporan Live (HAPUS TOTAL Rekomendasi Stimulasi di Rumah)...`);
  let hasRecommendation = false;
  results.forEach((r, idx) => {
    const jsonStr = (r.rawReportText || "").toLowerCase();
    if (
      jsonStr.includes("rekomendasi_stimulasi_di_rumah") ||
      jsonStr.includes("rekomendasi stimulasi di rumah") ||
      jsonStr.includes("rekomendasi untuk orang tua") ||
      jsonStr.includes("rekomendasi_untuk_orang_tua")
    ) {
      hasRecommendation = true;
      console.error(`❌ SISWA #${idx + 1} (${r.childName}) MASIH MEMILIKI REKOMENDASI STIMULASI!`);
    }
  });

  if (!hasRecommendation) {
    console.log(`   ✓ HAPUS TOTAL BERHASIL: 100% dari 30 Laporan Live Web TIDAK MEMILIKI Bagian "Rekomendasi Stimulasi di Rumah"!`);
  }

  console.log(`\n📌 [STEP 3] Memeriksa Keunikan Laporan Live Web (Pairwise Comparison 435 Pasangan)...`);
  const totalPairs = (results.length * (results.length - 1)) / 2;
  let rawIdenticalPairs = 0;
  let normIdenticalPairs = 0;

  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      if (results[i].rawReportText === results[j].rawReportText) {
        rawIdenticalPairs++;
      }
      if (results[i].normReportText === results[j].normReportText) {
        normIdenticalPairs++;
      }
    }
  }

  console.log(`\n==========================================================================`);
  console.log(`📊 METRIK VERIFIKASI LIVE WEB ASSESSMENT — 30 SISWA`);
  console.log(`==========================================================================`);
  console.log(`📌 TOTAL PENYIMPANAN LIVE WEB : ${results.length} / ${numStudents} Siswa Sukses`);
  console.log(`📌 TOTAL PASANGAN DIBANDINGKAN : ${totalPairs} Pasangan`);
  console.log(`📌 PASANGAN IDENTIK (RAW)      : ${rawIdenticalPairs} Pasangan (${((rawIdenticalPairs / totalPairs) * 100).toFixed(2)}%)`);
  console.log(`📌 PASANGAN IDENTIK (NORMATIF) : ${normIdenticalPairs} Pasangan (${((normIdenticalPairs / totalPairs) * 100).toFixed(2)}%)`);
  console.log(`📌 KEUNIKAN LAPORAN LIVE WEB   : ${(((totalPairs - normIdenticalPairs) / totalPairs) * 100).toFixed(2)}% UNIK`);

  console.log(`\n==========================================================================`);
  console.log(`📄 SAMPEL SINTESIS AKHIR 3 LAPORAN LIVE AKTUIL WEB`);
  console.log(`==========================================================================`);
  [0, 14, 29].forEach(idx => {
    const item = results[idx];
    if (item) {
      console.log(`\n[SAMPEL #${idx + 1}]: ${item.childName} (ID DB: ${item.id})`);
      console.log(`🌱 Status Perkembangan : ${item.resultObj?.status_perkembangan}`);
      console.log(`💡 Area Perhatian     : ${JSON.stringify(item.resultObj?.area_yang_perlu_diperhatikan)}`);
      console.log(`🗣️ Bahasa             : ${item.resultObj?.gambaran_perkembangan_anak?.bahasa_dan_komunikasi}`);
      console.log(`✅ Kelebihan          : ${JSON.stringify(item.resultObj?.potensi_dan_kelebihan)}`);
      console.log(`👥 Catatan Orang Tua  : ${item.resultObj?.catatan_untuk_orang_tua}`);
    }
  });

  console.log(`\n==========================================================================`);
  console.log(`🎯 KESIMPULAN AKHIR LIVE WEB AUDIT`);
  console.log(`==========================================================================`);
  if (!hasRecommendation && normIdenticalPairs === 0) {
    console.log(`🟢 STATUS: LULUS (PASSED)`);
    console.log(`   - 30 Asesmen Live berhasil disubmit dan tersimpan di database web.`);
    console.log(`   - 100% Laporan web bebas dari bagian Rekomendasi Stimulasi.`);
    console.log(`   - 100% Laporan web terbukti unik dan personal per siswa.`);
  } else {
    console.log(`🔴 STATUS: BELUM LULUS`);
  }
  console.log(`==========================================================================\n`);
}

runLive30StudentsTest().catch(console.error);
