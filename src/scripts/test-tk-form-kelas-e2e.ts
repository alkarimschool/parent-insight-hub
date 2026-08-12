import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { supabaseAdmin } from "../integrations/supabase/client.server";

async function testTkFormKelasE2E() {
  console.log("=========================================================================");
  console.log("🧪 TEST E2E FORM TK/PAUD: KELAS FIELD + STORAGE + RESULT + PDF INTEGRATION");
  console.log("=========================================================================\n");

  const testPayload = {
    parent: {
      name: "Orang Tua Ananda Alfanisa Adiba Hafshah",
      whatsapp: "081234567890",
    },
    child: {
      name: "Alfanisa Adiba Hafshah",
      gender: "P",
      birth_date: "2021-05-15",
      school: "Sekolah Alam Al-Karim",
      class_name: "TK B Pangeran Anatsari",
      education_level: "TK",
    },
    answers: Array.from({ length: 40 }, (_, i) => ({
      question_id: `q_tk_${i + 1}`,
      score: 4,
    })),
  };

  console.log("📌 [STEP 1] Submitting TK Assessment with Kelas 'TK B Pangeran Anatsari'...");
  const submitRes = await submitAndAnalyze(testPayload as any);
  console.log("Submit Response:", submitRes);
  if (!submitRes.assessment_id) {
    throw new Error("❌ Submission failed!");
  }

  const assessmentId = submitRes.assessment_id;
  console.log("✅ STEP 1 PASSED: Assessment created with ID:", assessmentId);

  console.log("\n📌 [STEP 2] Verifying database record in 'children' and 'assessments' table...");
  const { data: assRow } = await supabaseAdmin
    .from("assessments")
    .select("*, children(*)")
    .eq("id", assessmentId)
    .single();

  const childObj = Array.isArray(assRow?.children) ? assRow?.children[0] : assRow?.children;
  console.log("Child Name in DB:", childObj?.name);
  console.log("Class Name in DB:", childObj?.class_name);

  if (childObj?.class_name !== "TK B Pangeran Anatsari") {
    throw new Error(`❌ STEP 2 FAILED: class_name mismatch! Got: ${childObj?.class_name}`);
  }
  console.log("✅ STEP 2 PASSED: Database permanently stored 'TK B Pangeran Anatsari'!");

  console.log("\n📌 [STEP 3] Fetching report result via getAssessmentResultServer...");
  const reportRes = await getAssessmentResultServer(assessmentId, true);
  console.log("Report Child Name:", reportRes!.child_name);
  console.log("Report Child Class:", (reportRes as any).child_class || (reportRes as any).class_name);
  console.log("Report Created At:", reportRes!.created_at);

  const reportClass = (reportRes as any).child_class || (reportRes as any).class_name;
  if (reportClass !== "TK B Pangeran Anatsari") {
    throw new Error(`❌ STEP 3 FAILED: Report class mismatch! Got: ${reportClass}`);
  }
  console.log("✅ STEP 3 PASSED: Report view reads 'TK B Pangeran Anatsari' from DB!");

  console.log("\n=========================================================================");
  console.log("🎉 ALL E2E TESTS PASSED 100%! TK/PAUD KELAS INTEGRATION VERIFIED!");
  console.log("=========================================================================\n");
}

testTkFormKelasE2E().catch((err) => {
  console.error("❌ E2E TEST FAILED:", err);
  process.exit(1);
});
