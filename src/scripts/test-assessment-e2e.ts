import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { EducationLevel } from "../lib/questions.data";
import { supabaseAdmin } from "../integrations/supabase/client.server";

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
        birth_date: level === "TK" ? "2020-05-15" : level === "SD" ? "2016-08-20" : level === "SMP" ? "2012-03-10" : "2008-11-05",
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

      // 2. PHYSICAL SUPABASE DATABASE RECORD VERIFICATION
      console.log(`2. Verifying physical DB rows in Supabase for ID: ${submitRes.assessment_id}...`);
      const [{ data: dbAss, error: assErr }, { data: dbAns, error: ansErr }, { data: dbAi, error: aiErr }] = await Promise.all([
        supabaseAdmin.from("assessments").select("*").eq("id", submitRes.assessment_id).single(),
        supabaseAdmin.from("assessment_answers").select("id").eq("assessment_id", submitRes.assessment_id),
        supabaseAdmin.from("ai_results").select("*").eq("assessment_id", submitRes.assessment_id).maybeSingle(),
      ]);

      if (assErr || !dbAss) {
        throw new Error(`Physical DB Verification Failed! Assessment row missing in Supabase: ${assErr?.message}`);
      }

      console.log(`   - Physical DB 'assessments' row: EXISTS | status="${dbAss.status}" | level="${dbAss.education_level}"`);
      console.log(`   - Physical DB 'assessment_answers' rows: ${dbAns?.length ?? 0} answers stored`);
      console.log(`   - Physical DB 'ai_results' row: ${dbAi ? "EXISTS" : "NONE"}`);

      if (dbAss.status !== "analyzed") {
        throw new Error(`Expected DB status 'analyzed', got '${dbAss.status}'`);
      }

      // 3. Fetch result via server query
      console.log(`3. Fetching assessment result for ID: ${submitRes.assessment_id}...`);
      const resultData = await getAssessmentResultServer(submitRes.assessment_id);

      if (!resultData) {
        throw new Error(`Fetch result failed: Null returned for ID ${submitRes.assessment_id}`);
      }

      console.log(`✅ Result Fetched Successfully!`);
      console.log(`   - Status: ${resultData.status}`);
      console.log(`   - Education Level: ${resultData.education_level}`);
      console.log(`   - Report Title: "${resultData.content?.reportTitle}"`);

      // Validations
      if (resultData.education_level !== level) {
        throw new Error(`Mismatch education level: expected ${level}, got ${resultData.education_level}`);
      }

      if (!resultData.content?.ringkasan) {
        throw new Error(`Empty summary content for level ${level}`);
      }

      console.log(`🎉 PHYSICAL SUPABASE DB & API VERIFICATION PASSED FOR LEVEL ${level}!\n`);
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
