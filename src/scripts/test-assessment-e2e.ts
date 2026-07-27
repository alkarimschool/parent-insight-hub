import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { EducationLevel } from "../lib/questions.data";

async function runE2ETests() {
  console.log("=================================================");
  console.log("🚀 STARTING E2E AUTOMATED ASSESSMENT VERIFICATION");
  console.log("=================================================\n");

  const levelsToTest: EducationLevel[] = ["TK", "SD", "SMP", "SMA"];
  let passedCount = 0;

  for (const level of levelsToTest) {
    console.log(`-------------------------------------------------`);
    console.log(`▶ TESTING EDUCATION LEVEL: ${level}`);
    console.log(`-------------------------------------------------`);

    const timestamp = Date.now();
    const testData = {
      parent: {
        name: `Orang Tua Test ${level}`,
        whatsapp: `0812345678${Math.floor(Math.random() * 1000)}`,
      },
      child: {
        name: `Anak Test ${level}`,
        gender: "L" as const,
        birth_date: level === "TK" ? "2020-05-15" : level === "SD" ? "2016-08-20" : level === "SMP" ? "2012-03-10" : "2009-11-05",
        school: `Sekolah Test ${level}`,
        class_name: `Kelas ${level}`,
        education_level: level,
      },
      answers: Array.from({ length: 15 }, (_, i) => ({
        question_id: `test-q-${i + 1}`,
        score: Math.floor(Math.random() * 2) + 4, // Scores 4 or 5
      })),
    };

    try {
      console.log(`1. Submitting assessment payload for level ${level}...`);
      const submitRes = await submitAndAnalyze(testData);

      if (!submitRes || !submitRes.assessment_id) {
        throw new Error(`Submit failed: Returned response missing assessment_id`);
      }

      console.log(`✅ Submit Success! Assessment ID: ${submitRes.assessment_id}`);

      console.log(`2. Fetching assessment result for ID: ${submitRes.assessment_id}...`);
      const resultData = await getAssessmentResultServer(submitRes.assessment_id);

      if (!resultData) {
        throw new Error(`Fetch result failed: Null returned for ID ${submitRes.assessment_id}`);
      }

      console.log(`✅ Result Fetched Successfully!`);
      console.log(`   - Status: ${resultData.status}`);
      console.log(`   - Education Level: ${resultData.education_level}`);
      console.log(`   - Report Title: "${resultData.content?.reportTitle}"`);
      console.log(`   - Summary Length: ${resultData.content?.ringkasan?.length ?? 0} chars`);
      console.log(`   - Strengths Count: ${resultData.content?.kelebihan?.length ?? 0}`);
      console.log(`   - Growth Areas Count: ${resultData.content?.area_pengembangan?.length ?? 0}`);

      // Validations
      if (resultData.education_level !== level) {
        throw new Error(`Mismatch education level: expected ${level}, got ${resultData.education_level}`);
      }

      if (!resultData.content?.ringkasan) {
        throw new Error(`Empty summary content for level ${level}`);
      }

      if (level === "TK" && !resultData.content?.reportTitle?.includes("TK")) {
        throw new Error(`Expected TK in report title, got: ${resultData.content?.reportTitle}`);
      }
      if (level === "SD" && !resultData.content?.reportTitle?.includes("SD")) {
        throw new Error(`Expected SD in report title, got: ${resultData.content?.reportTitle}`);
      }
      if (level === "SMP" && !resultData.content?.reportTitle?.includes("SMP")) {
        throw new Error(`Expected SMP in report title, got: ${resultData.content?.reportTitle}`);
      }
      if (level === "SMA" && !resultData.content?.reportTitle?.includes("SMA")) {
        throw new Error(`Expected SMA in report title, got: ${resultData.content?.reportTitle}`);
      }

      console.log(`🎉 VERIFICATION PASSED FOR LEVEL ${level}!\n`);
      passedCount++;
    } catch (err: any) {
      console.error(`❌ VERIFICATION FAILED FOR LEVEL ${level}:`, err?.message || err);
      process.exitCode = 1;
    }
  }

  console.log("=================================================");
  console.log(`RESULTS: ${passedCount}/${levelsToTest.length} Education Levels Passed 100%`);
  console.log("=================================================");
}

runE2ETests().catch((err) => {
  console.error("Fatal E2E test error:", err);
  process.exit(1);
});
