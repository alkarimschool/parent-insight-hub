import { supabaseAdmin } from "../integrations/supabase/client.server";
import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";

async function testSubmitResilience() {
  console.log("=================================================");
  console.log("🧪 TESTING FULL SUBMIT RESILIENCE FLOW");
  console.log("=================================================\n");

  const testPayload = {
    parent: {
      name: "Orang Tua Test Resilient",
      whatsapp: "08129" + Math.floor(1000000 + Math.random() * 9000000),
    },
    child: {
      name: "Anak Test Resilient",
      gender: "L" as const,
      birth_date: "2017-06-15",
      school: "SD N 1 Resilient",
      class_name: "Kelas 3 SD",
      education_level: "SD" as const,
    },
    answers: Array.from({ length: 15 }, (_, i) => ({
      question_id: `test-q-${i + 1}`,
      score: 5,
    })),
  };

  try {
    console.log("Submitting test payload...");
    const res = await submitAndAnalyze(testPayload);
    console.log("\n✅ Submit Completed! Response:", res);

    if (res && res.assessment_id) {
      console.log(`\nVerifying DB rows for assessment_id: "${res.assessment_id}"...`);
      const { data: aRow } = await supabaseAdmin.from("assessments").select("*").eq("id", res.assessment_id).single();
      console.log("   - Physical 'assessments' row in DB:", aRow);

      const { data: ansRows } = await supabaseAdmin.from("assessment_answers").select("id").eq("assessment_id", res.assessment_id);
      console.log(`   - Physical 'assessment_answers' rows in DB: ${ansRows?.length ?? 0} answers`);

      const { data: aiRow } = await supabaseAdmin.from("ai_results").select("id, model").eq("assessment_id", res.assessment_id).maybeSingle();
      console.log("   - Physical 'ai_results' row in DB:", aiRow);
    }
  } catch (e: any) {
    console.error("❌ Submit Test Threw Exception:", e?.message || e);
  }

  console.log("\n=================================================");
}

testSubmitResilience().catch(console.error);
