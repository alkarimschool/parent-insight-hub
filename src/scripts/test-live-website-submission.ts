import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";

async function testLiveWebsiteSubmission() {
  console.log("=========================================================================");
  console.log("🧪 RUNTIME AUDIT TEST: WEBSITE SUBMISSION & RESULT GENERATION");
  console.log("=========================================================================\n");

  const startMs = Date.now();

  const testPayload = {
    parent: {
      name: "Bapak Audit Website Test",
      whatsapp: "08999888777",
    },
    child: {
      name: "Ananda Audit Website Test",
      gender: "L" as const,
      birth_date: "2008-05-15",
      school: "SMA Negeri 1 Audit Test",
      class_name: "10-A",
      education_level: "SMA" as const,
    },
    answers: Array.from({ length: 40 }, (_, i) => ({
      question_id: `q_sma_${i + 1}`,
      score: (i % 5) + 1,
      text_answer: `Jawaban audit website SMA aspek ${i + 1}`,
    })),
  };

  console.log("📌 [STEP 1] Invoking submitAndAnalyze server handler (Simulating Website Submission)...");
  const res = await submitAndAnalyze(testPayload);
  const duration = Date.now() - startMs;

  console.log(`⏱️ Submission Duration: ${duration} ms`);
  console.log("Server Response:", res);

  if (!res || !res.assessment_id) {
    throw new Error("❌ STEP 1 FAILED: submitAndAnalyze returned empty response!");
  }
  console.log("✅ STEP 1 PASSED: Submission succeeded!");

  console.log("\n📌 [STEP 2] Fetching Assessment Result (Simulating Admin/User Result Page View)...");
  const resultRes = await getAssessmentResultServer(res.assessment_id, true);

  console.log("Result Page Response:", {
    assessment_id: res.assessment_id,
    child_name: resultRes?.child_name,
    parent_name: resultRes?.parent_name,
    education_level: resultRes?.education_level,
    reportTitle: (resultRes?.content as any)?.reportTitle,
    hasContent: Boolean(resultRes?.content),
  });

  if (!resultRes || !resultRes.content) {
    throw new Error("❌ STEP 2 FAILED: Result report is missing or null!");
  }
  console.log("✅ STEP 2 PASSED: Result page loaded successfully!");

  console.log("\n=========================================================================");
  console.log("🎉 ALL RUNTIME AUDIT STEPS PASSED 100%!");
  console.log("=========================================================================\n");
}

testLiveWebsiteSubmission().catch((err) => {
  console.error("❌ RUNTIME AUDIT FAILED:", err);
  process.exit(1);
});
