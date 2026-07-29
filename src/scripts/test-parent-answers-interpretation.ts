import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { EducationLevel, LEVEL_QUESTIONS } from "../lib/questions.data";

async function runTestScenarios() {
  console.log("==================================================================================");
  console.log("🧪 UJI COBA VALIDASI INTERPRETASI JAWABAN ORANG TUA (TEST 1, TEST 2, & TEST 3)");
  console.log("==================================================================================\n");

  const levels: EducationLevel[] = ["TK", "SD", "SMP", "SMA"];

  for (const lvl of levels) {
    console.log(`\n==================================================================================`);
    console.log(`🎓 JENJANG: ${lvl}`);
    console.log(`==================================================================================`);

    // Fetch questions for this level
    const questions = LEVEL_QUESTIONS[lvl] || [];

    // TEST 1: Semua jawaban Sangat Baik (Skor 5)
    console.log(`\n----------------------------------------------------------------------------------`);
    console.log(`🟢 TEST 1 [JENJANG ${lvl}]: SEMUA JAWABAN ORANG TUA = SANGAT BAIK (SKOR 5/5)`);
    console.log(`----------------------------------------------------------------------------------`);
    
    const answersTest1 = Array.from({ length: 15 }, (_, i) => ({
      question_id: questions[i]?.id || `00000000-0000-0000-0000-0000000000${(i % 9) + 1}0`,
      score: 5
    }));

    const sub1 = await submitAndAnalyze({
      child: {
        name: `Budi Agung (${lvl} - Sangat Baik)`,
        birth_date: "2015-05-15",
        gender: "L",
        school: `Sekolah Unggul ${lvl}`,
        education_level: lvl,
      },
      parent: {
        name: "Bpk. Hendro Prajekti",
        whatsapp: "081234567890",
      },
      answers: answersTest1
    });

    const resData1 = await getAssessmentResultServer(sub1.assessment_id);
    const parsed1 = resData1?.content || {};
    const status1 = parsed1.status_perkembangan || parsed1.status_perkembangan_sd || parsed1.status_perkembangan_smp || parsed1.status_kesiapan_sma || "-";
    const ringkasan1 = parsed1.penjelasan_status || parsed1.ringkasan_profil_sd || parsed1.ringkasan_dinamika_smp || parsed1.ringkasan_eksekutif_sma || "-";
    const kekuatan1 = parsed1.kekuatan_anak || parsed1.kelebihan_pembelajaran || parsed1.kekuatan_akademik_smp || parsed1.keunggulan_akademik_sma || [];
    const perbaikan1 = parsed1.area_perlu_ditingkatkan || parsed1.area_belajar_ditingkatkan || parsed1.area_pengembangan_smp || parsed1.area_akademik_perlu_ditingkatkan || [];

    console.log("► Status Perkembangan / Kesiapan:", status1);
    console.log("► Ringkasan / Penjelasan:", ringkasan1);
    console.log("► Daftar Kekuatan (Top 3):", kekuatan1.slice(0, 3));
    console.log("► Area Ditingkatkan / Pengembangan:", perbaikan1);


    // TEST 2: Semua jawaban Kurang / Tidak Pernah (Skor 1)
    console.log(`\n----------------------------------------------------------------------------------`);
    console.log(`🔴 TEST 2 [JENJANG ${lvl}]: SEMUA JAWABAN ORANG TUA = KURANG / TIDAK PERNAH (SKOR 1/5)`);
    console.log(`----------------------------------------------------------------------------------`);

    const answersTest2 = Array.from({ length: 15 }, (_, i) => ({
      question_id: questions[i]?.id || `00000000-0000-0000-0000-0000000000${(i % 9) + 1}0`,
      score: 1
    }));

    const sub2 = await submitAndAnalyze({
      child: {
        name: `Dina Rindu (${lvl} - Perlu Perhatian)`,
        birth_date: "2015-05-15",
        gender: "P",
        school: `Sekolah Harapan ${lvl}`,
        education_level: lvl,
      },
      parent: {
        name: "Ibu Rina Lestari",
        whatsapp: "081987654321",
      },
      answers: answersTest2
    });

    const resData2 = await getAssessmentResultServer(sub2.assessment_id);
    const parsed2 = resData2?.content || {};
    const status2 = parsed2.status_perkembangan || parsed2.status_perkembangan_sd || parsed2.status_perkembangan_smp || parsed2.status_kesiapan_sma || "-";
    const ringkasan2 = parsed2.penjelasan_status || parsed2.ringkasan_profil_sd || parsed2.ringkasan_dinamika_smp || parsed2.ringkasan_eksekutif_sma || "-";
    const kekuatan2 = parsed2.kekuatan_anak || parsed2.kelebihan_pembelajaran || parsed2.kekuatan_akademik_smp || parsed2.keunggulan_akademik_sma || [];
    const perbaikan2 = parsed2.area_perlu_ditingkatkan || parsed2.area_belajar_ditingkatkan || parsed2.area_pengembangan_smp || parsed2.area_akademik_perlu_ditingkatkan || [];
    const treatment2 = parsed2.rekomendasi_orangtua || parsed2.rekomendasi_treatment_rumah || parsed2.rekomendasi_pendampingan_remaja || parsed2.rekomendasi_strategi_masa_depan || [];

    console.log("► Status Perkembangan / Kesiapan:", status2);
    console.log("► Ringkasan / Penjelasan:", ringkasan2);
    console.log("► Daftar Kekuatan (Top 2):", kekuatan2.slice(0, 2));
    console.log("► Area Ditingkatkan / Pengembangan (Top 3):", perbaikan2.slice(0, 3));
    console.log("► Rekomendasi Treatment Rumah (Intensif):", treatment2);


    // TEST 3: Jawaban Campuran (Skor 1, 3, 5)
    console.log(`\n----------------------------------------------------------------------------------`);
    console.log(`🟡 TEST 3 [JENJANG ${lvl}]: JAWABAN CAMPURAN (SKOR 1, 3, DAN 5)`);
    console.log(`----------------------------------------------------------------------------------`);

    const answersTest3 = Array.from({ length: 15 }, (_, i) => ({
      question_id: questions[i]?.id || `00000000-0000-0000-0000-0000000000${(i % 9) + 1}0`,
      score: i % 3 === 0 ? 5 : i % 3 === 1 ? 1 : 3
    }));

    const sub3 = await submitAndAnalyze({
      child: {
        name: `Coki Seimbang (${lvl} - Campuran)`,
        birth_date: "2015-05-15",
        gender: "L",
        school: `Sekolah Bakti ${lvl}`,
        education_level: lvl,
      },
      parent: {
        name: "Bpk. Surya",
        whatsapp: "085611223344",
      },
      answers: answersTest3
    });

    const resData3 = await getAssessmentResultServer(sub3.assessment_id);
    const parsed3 = resData3?.content || {};
    const status3 = parsed3.status_perkembangan || parsed3.status_perkembangan_sd || parsed3.status_perkembangan_smp || parsed3.status_kesiapan_sma || "-";
    const ringkasan3 = parsed3.penjelasan_status || parsed3.ringkasan_profil_sd || parsed3.ringkasan_dinamika_smp || parsed3.ringkasan_eksekutif_sma || "-";

    console.log("► Status Perkembangan / Kesiapan:", status3);
    console.log("► Ringkasan / Penjelasan:", ringkasan3);

    // Validasi Kunci
    const isDifferent = (status1 !== status2) && (ringkasan1 !== ringkasan2) && (JSON.stringify(kekuatan1) !== JSON.stringify(kekuatan2));
    console.log(`\n🔒 HASIL VALIDASI [${lvl}]: TEST 1 vs TEST 2 Berbeda Signifikan? ${isDifferent ? "✅ YA (LULUS / AKURAT)" : "❌ TIDAK (GAGAL / STATIS)"}`);
    if (!isDifferent) {
      console.warn(`   [WARNING] Perbedaan tidak cukup signifikan antara Test 1 (${status1}) dan Test 2 (${status2})`);
    }
  }

  console.log("\n==================================================================================");
  console.log("✅ SELURUH UJI COBA TEST 1, TEST 2, DAN TEST 3 BERHASIL DI EKSEKUSI!");
  console.log("==================================================================================");
}

runTestScenarios().catch(console.error);
