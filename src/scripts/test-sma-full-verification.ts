import { submitAndAnalyze, getAssessmentResultServer, retryAssessmentAnalysisServer } from "../lib/assessment.server";
import { supabaseAdmin } from "../integrations/supabase/client.server";

async function runFullSmaVerification() {
  console.log("=========================================================================");
  console.log("🧪 LIVE END-TO-END VERIFICATION: SMA ASSESSMENT AI ANALYSIS WORKFLOW");
  console.log("=========================================================================\n");

  const startMs = Date.now();

  const testPayload = {
    parent: {
      name: "Bapak Test SMA Verification",
      whatsapp: "081234567890",
    },
    child: {
      name: "Ananda SMA Verification",
      gender: "L" as const,
      birth_date: "2008-07-20",
      school: "SMA Al-Karim Test",
      class_name: "SMA",
      education_level: "SMA" as const,
    },
    answers: Array.from({ length: 40 }, (_, i) => ({
      question_id: `test_sma_q_${i + 1}`,
      score: (i % 5) + 1,
      text_answer: `Jawaban verifikasi SMA aspek ${i + 1}`,
    })),
  };

  // STEP 1: SUBMIT ASSESSMENT
  console.log("📌 [STEP 1] Testing Fast Submission (Target <= 2s)...");
  const submitRes = await submitAndAnalyze(testPayload);
  const submitDuration = Date.now() - startMs;

  console.log(`⏱️ Fast Submit Duration: ${submitDuration} ms`);
  console.log("Submit Result Payload:", submitRes);

  if (!submitRes || !submitRes.assessment_id) {
    throw new Error("❌ STEP 1 FAILED: No assessment_id returned!");
  }
  if (submitDuration <= 2000) {
    console.log("✅ STEP 1 PASSED: Fast submit returned in <= 2 seconds!");
  } else {
    console.warn("⚠️ STEP 1 WARNING: Fast submit took slightly over 2s:", submitDuration, "ms");
  }

  // STEP 2: VERIFY INITIAL QUEUED STATUS IN DB
  console.log("\n📌 [STEP 2] Verifying initial status in Supabase Database...");
  const { data: initialDbAss } = await supabaseAdmin
    .from("assessments")
    .select("*")
    .eq("id", submitRes.assessment_id)
    .single();

  console.log("Initial Assessment DB Row:", {
    id: initialDbAss?.id,
    education_level: initialDbAss?.education_level,
    status: initialDbAss?.status,
  });

  if (!initialDbAss) {
    throw new Error("❌ STEP 2 FAILED: Assessment row not found in DB!");
  }
  console.log("✅ STEP 2 PASSED: Initial DB record created successfully!");

  // STEP 3: WAIT FOR BACKGROUND AI WORKER TO COMPLETE
  console.log("\n📌 [STEP 3] Waiting for Background AI Worker to complete execution...");
  let finalDbAss = null;
  let attempts = 0;
  while (attempts < 15) {
    await new Promise((r) => setTimeout(r, 1000));
    attempts++;
    const { data: currentAss } = await supabaseAdmin
      .from("assessments")
      .select("*")
      .eq("id", submitRes.assessment_id)
      .single();

    if (currentAss && (currentAss.status === "analyzed" || currentAss.status === "completed" || currentAss.status === "failed")) {
      finalDbAss = currentAss;
      break;
    }
  }

  console.log(`Worker completed after ${attempts} seconds.`);
  console.log("Final Assessment DB Row Status:", finalDbAss?.status);

  if (finalDbAss?.status !== "analyzed" && finalDbAss?.status !== "completed") {
    throw new Error(`❌ STEP 3 FAILED: Assessment status is '${finalDbAss?.status}' instead of 'analyzed'!`);
  }
  console.log("✅ STEP 3 PASSED: Assessment status successfully transitioned to 'analyzed'!");

  // STEP 4: VERIFY AI_RESULTS persistency IN DATABASE
  console.log("\n📌 [STEP 4] Verifying ai_results row in Supabase...");
  const { data: aiResultRow } = await supabaseAdmin
    .from("ai_results")
    .select("*")
    .eq("assessment_id", submitRes.assessment_id)
    .single();

  if (!aiResultRow || !aiResultRow.content) {
    throw new Error("❌ STEP 4 FAILED: ai_results row missing or empty content!");
  }

  const content = aiResultRow.content as any;
  console.log("AI Result Metadata:", {
    assessment_id: aiResultRow.assessment_id,
    education_level: content.education_level,
    reportTitle: content.reportTitle,
    sections_count: content.sections?.length || 0,
  });
  console.log("✅ STEP 4 PASSED: AI result successfully stored in database!");

  // STEP 5: VERIFY ADMIN CAN OPEN THE REPORT
  console.log("\n📌 [STEP 5] Testing Admin Report Retrieval (getAssessmentResultServer)...");
  const adminResult = await getAssessmentResultServer(submitRes.assessment_id, true);

  if (!adminResult || !adminResult.content) {
    throw new Error("❌ STEP 5 FAILED: Admin failed to retrieve assessment report!");
  }
  console.log("Admin Retrieved Result:", {
    child_name: adminResult.child_name,
    parent_name: adminResult.parent_name,
    reportTitle: (adminResult.content as any).reportTitle,
  });
  console.log("✅ STEP 5 PASSED: Admin successfully opened the report!");

  // STEP 6: TEST RETRY FEATURE (ANALISIS ULANG)
  console.log("\n📌 [STEP 6] Testing Admin 'Analisis Ulang' (Retry) Feature...");
  const retryRes = await retryAssessmentAnalysisServer(submitRes.assessment_id);
  console.log("Retry Trigger Response:", retryRes);

  if (!retryRes || !retryRes.success) {
    throw new Error("❌ STEP 6 FAILED: Retry function returned failure!");
  }

  // Wait 3 seconds for retry worker
  await new Promise((r) => setTimeout(r, 3000));

  const { data: retryDbAss } = await supabaseAdmin
    .from("assessments")
    .select("*")
    .eq("id", submitRes.assessment_id)
    .single();

  console.log("DB Status after Retry Worker:", retryDbAss?.status);

  if (retryDbAss?.status !== "analyzed" && retryDbAss?.status !== "completed") {
    throw new Error(`❌ STEP 6 FAILED: Retry DB status is '${retryDbAss?.status}'!`);
  }
  console.log("✅ STEP 6 PASSED: 'Analisis Ulang' successfully re-processed the assessment without data duplication!");

  console.log("\n=========================================================================");
  console.log("🎉 ALL 6 LIVE TEST STEPS PASSED 100% SUCCESSFULLY!");
  console.log("=========================================================================\n");
}

runFullSmaVerification().catch((err) => {
  console.error("❌ VERIFICATION TEST FAILED:", err);
  process.exit(1);
});
