import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";

async function testFastSubmit() {
  console.log("=================================================");
  console.log("🚀 TESTING FAST <=2s SUBMISSION & BACKGROUND AI ANALYSIS");
  console.log("=================================================\n");

  const startMs = Date.now();

  const testPayload = {
    parent: {
      name: "Orang Tua Fast Test",
      whatsapp: "081299990000",
    },
    child: {
      name: "Siswa Fast Test",
      gender: "L" as const,
      birth_date: "2008-05-15",
      school: "SMA Al-Karim Test",
      class_name: "SMA",
      education_level: "SMA" as const,
    },
    answers: Array.from({ length: 40 }, (_, i) => ({
      question_id: `test_sma_q_${i + 1}`,
      score: (i % 5) + 1,
      text_answer: `Jawaban test Q${i + 1}`,
    })),
  };

  const res = await submitAndAnalyze(testPayload);
  const duration = Date.now() - startMs;

  console.log(`⏱️ Fast Submit Response Time: ${duration} ms (Target: <= 2000 ms)`);
  console.log("Response:", res);

  if (duration <= 2000) {
    console.log("✅ FAST SUBMIT TARGET PASSED! Response received in under 2 seconds.");
  } else {
    console.warn("⚠️ Fast submit took slightly over 2 seconds:", duration, "ms");
  }

  console.log("\nWaiting 5 seconds for background AI worker to complete...");
  await new Promise((r) => setTimeout(r, 5000));

  const finalResult = await getAssessmentResultServer(res.assessment_id, true);
  console.log("📊 Final Result Status in Database:", finalResult ? "FOUND" : "NOT FOUND");
  if (finalResult) {
    console.log("Child Name:", finalResult.child_name);
    console.log("Parent Name:", finalResult.parent_name);
    console.log("Sections count:", (finalResult.content as any)?.sections?.length || "N/A");
  }

  console.log("\n=================================================");
}

testFastSubmit().catch(console.error);
