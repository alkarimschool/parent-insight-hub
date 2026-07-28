import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";

async function testSubmitAndGetResult() {
  console.log("=== TESTING SUBMIT & FETCH ASSESSMENT RESULT ===");

  try {
    const submitRes = await submitAndAnalyze({
      parent: {
        name: "Ibu Nurul",
        whatsapp: "081234567891",
      },
      child: {
        name: "Ananda Rayyan",
        gender: "L",
        birth_date: "2021-05-10",
        school: "TK Al-Karim",
        class_name: "TK B",
        education_level: "TK",
      },
      answers: [
        { question_id: "q1", score: 4 },
        { question_id: "q2", score: 5 },
        { question_id: "q3", score: 4 },
      ],
    });

    console.log("✅ Submit Success! Result:", submitRes);

    if (submitRes.assessment_id) {
      const reportData = await getAssessmentResultServer(submitRes.assessment_id);
      console.log("=== REPORT DATA RECEIVED ===");
      console.log("Assessment ID:", reportData?.assessment_id);
      console.log("Child Name:", reportData?.child_name);
      console.log("Status Perkembangan:", reportData?.content?.status_perkembangan);
      console.log("Kekuatan:", reportData?.content?.kekuatan);
      console.log("Area yang Perlu Ditingkatkan:", reportData?.content?.area_perlu_ditingkatkan);
      console.log("Potensi yang Dapat Dikembangkan:", reportData?.content?.potensi_dikembangkan);
      console.log("Analisis per Aspek:", reportData?.content?.analisis_per_aspek);
      console.log("Prioritas Stimulasi:", reportData?.content?.prioritas_stimulasi);
      console.log("Rekomendasi untuk Orang Tua:", reportData?.content?.rekomendasi_orangtua);
      console.log("Rekomendasi untuk Guru:", reportData?.content?.rekomendasi_guru);
    }
  } catch (err: any) {
    console.error("❌ SUBMIT ERROR:", err);
  }
}

testSubmitAndGetResult().catch(console.error);
