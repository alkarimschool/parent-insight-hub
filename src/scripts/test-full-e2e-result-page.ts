import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { supabaseAdmin } from "../integrations/supabase/client.server";

async function runFullResultPageTest() {
  console.log("=========================================================================");
  console.log("🧪 LIVE END-TO-END TEST: VERIFYING FULL SMA ASSESSMENT RESULT REPORT");
  console.log("=========================================================================\n");

  const startMs = Date.now();

  const testPayload = {
    parent: {
      name: "Bapak Test Result Page",
      whatsapp: "081234567890",
    },
    child: {
      name: "Ananda SMA Report Test",
      gender: "L" as const,
      birth_date: "2008-08-15",
      school: "SMA Negeri 1 Live Test",
      class_name: "SMA",
      education_level: "SMA" as const,
    },
    answers: Array.from({ length: 40 }, (_, i) => ({
      question_id: `q_sma_report_${i + 1}`,
      score: (i % 5) + 1,
      text_answer: `Jawaban pengujian laporan SMA indikator ${i + 1}`,
    })),
  };

  // STEP 1: SUBMIT ASSESSMENT
  console.log("📌 [STEP 1] Submitting SMA Assessment Payload...");
  const submitRes = await submitAndAnalyze(testPayload);
  const submitDuration = Date.now() - startMs;

  console.log(`⏱️ Fast Submit Duration: ${submitDuration} ms`);
  console.log("Submit Result Payload:", submitRes);

  if (!submitRes || !submitRes.assessment_id) {
    throw new Error("❌ STEP 1 FAILED: No assessment_id returned!");
  }
  console.log("✅ STEP 1 PASSED: Submission succeeded!");

  // STEP 2: VERIFY DB STATUS IN SUPABASE
  console.log("\n📌 [STEP 2] Verifying status in Supabase Database...");
  const { data: dbAss } = await supabaseAdmin
    .from("assessments")
    .select("*")
    .eq("id", submitRes.assessment_id)
    .single();

  console.log("Assessment DB Row Status:", dbAss?.status);

  if (dbAss?.status !== "analyzed" && dbAss?.status !== "completed") {
    throw new Error(`❌ STEP 2 FAILED: DB status is '${dbAss?.status}' instead of 'analyzed'!`);
  }
  console.log("✅ STEP 2 PASSED: Assessment status is 'analyzed'!");

  // STEP 3: FETCH RESULT REPORT PAYLOAD VIA getAssessmentResultServer
  console.log("\n📌 [STEP 3] Fetching full report payload (getAssessmentResultServer)...");
  const reportPayload = await getAssessmentResultServer(submitRes.assessment_id, true);

  if (!reportPayload || !reportPayload.content) {
    throw new Error("❌ STEP 3 FAILED: Report payload or content is missing!");
  }

  const c = reportPayload.content as any;

  console.log("\n=========================================================================");
  console.log("📋 REPORT PAYLOAD METADATA:");
  console.log("- Child Name    :", reportPayload.child_name);
  console.log("- Parent Name   :", reportPayload.parent_name);
  console.log("- Level         :", reportPayload.education_level);
  console.log("- Report Title  :", c.reportTitle || "Laporan Hasil Asesmen Kemampuan Awal Siswa SMA");
  console.log("=========================================================================\n");

  // STEP 4: VERIFY ALL 10 MANDATORY SMA REPORT SECTIONS
  console.log("📌 [STEP 4] Auditing 10 Mandatory SMA Report Sections:\n");

  const smaSections = [
    { title: "1. Ringkasan Kemampuan Awal", val: c.ringkasan_kemampuan_awal || c.ringkasan_eksekutif_sma || c.ringkasan },
    { title: "2. Area yang Perlu Diperhatikan", val: c.area_yang_perlu_diperhatikan || c.area_akademik_perlu_ditingkatkan || c.area_pengembangan },
    { title: "3. Kemampuan Awal Akademik", val: c.kemampuan_awal_akademik || c.keunggulan_akademik_sma || c.kelebihan },
    { title: "4. Kemampuan Berpikir", val: c.kemampuan_berpikir || c.problem_solving_dan_resiliensi },
    { title: "5. Kemampuan Komunikasi dan Sosial", val: c.kemampuan_komunikasi_dan_sosial || c.public_speaking_dan_leadership },
    { title: "6. Karakter dan Kemandirian", val: c.karakter_dan_kemandirian || c.pengembangan_soft_hard_skills },
    { title: "7. Kesiapan Mengikuti Pembelajaran SMA", val: c.kesiapan_mengikuti_pembelajaran_SMA || c.kesiapan_mengikuti_pembelajaran_sma },
    { title: "8. Potensi Pengembangan", val: c.potensi_pengembangan || c.potensi },
    { title: "9. Potensi dan Kelebihan", val: c.potensi_dan_kelebihan || c.keunggulan_akademik_sma },
    { title: "10. Rekomendasi untuk Orang Tua", val: c.rekomendasi_untuk_orang_tua || c.rekomendasi_strategi_masa_depan },
  ];

  let missingCount = 0;
  smaSections.forEach((sec, idx) => {
    const isPresent = Boolean(sec.val && (Array.isArray(sec.val) ? sec.val.length > 0 : String(sec.val).trim().length > 0));
    console.log(`  Section ${idx + 1}: ${sec.title.padEnd(42)} -> ${isPresent ? "✅ VALID & NON-EMPTY" : "❌ MISSING"}`);
    if (!isPresent) missingCount++;
  });

  if (missingCount > 0) {
    throw new Error(`❌ STEP 4 FAILED: ${missingCount} section(s) missing or empty!`);
  }

  console.log("\n✅ STEP 4 PASSED: Report contains ALL 10 mandatory SMA sections!");

  console.log("\n=========================================================================");
  console.log("🎉 ALL END-TO-END TEST STEPS PASSED 100%! RESULT REPORT SUCCESSFULLY GENERATED!");
  console.log(`🔗 Report URL: /assessment/result/${submitRes.assessment_id}`);
  console.log("=========================================================================\n");
}

runFullResultPageTest().catch((err) => {
  console.error("❌ RESULT PAGE TEST FAILED:", err);
  process.exit(1);
});
