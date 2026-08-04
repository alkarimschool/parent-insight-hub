import { deleteAssessmentServer } from "../lib/admin.server";
import { submitAndAnalyze } from "../lib/assessment.server";
import { supabaseAdmin } from "../integrations/supabase/client.server";

async function testDeleteAssessment() {
  console.log("=========================================================================");
  console.log("🧪 TESTING DELETE ASSESSMENT FUNCTIONALITY IN SUPABASE");
  console.log("=========================================================================\n");

  // 1. Create a dummy assessment to delete
  console.log("📌 [STEP 1] Creating a test assessment row to delete...");
  const submitRes = await submitAndAnalyze({
    parent: { name: "Orang Tua Test Delete", whatsapp: "089999999999" },
    child: { name: "Anak Test Delete", gender: "L", birth_date: "2010-01-01", school: "Test Delete School", class_name: "10-B", education_level: "SMA" },
    answers: Array.from({ length: 10 }, (_, i) => ({ question_id: `q_del_${i + 1}`, score: 3, text_answer: "test delete" })),
  });

  console.log("Created test assessment ID:", submitRes.assessment_id);

  // 2. Call deleteAssessmentServer
  console.log("\n📌 [STEP 2] Calling deleteAssessmentServer...");
  const delRes = await deleteAssessmentServer(submitRes.assessment_id);
  console.log("Delete Response:", delRes);

  // 3. Verify deletion in Supabase DB
  console.log("\n📌 [STEP 3] Verifying deletion in Supabase DB...");
  const { data: checkAss } = await supabaseAdmin.from("assessments").select("*").eq("id", submitRes.assessment_id).maybeSingle();
  console.log("Assessment row in DB after delete:", checkAss);

  if (checkAss) {
    throw new Error("❌ DELETE FAILED: Assessment row still exists in DB!");
  }

  console.log("✅ DELETE SUCCESSFUL: Assessment row completely deleted from Supabase Database!");
  console.log("\n=========================================================================");
  console.log("🎉 DELETE ASSESSMENT TEST PASSED 100%!");
  console.log("=========================================================================\n");
}

testDeleteAssessment().catch(console.error);
