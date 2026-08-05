import { submitAndAnalyze } from "../lib/assessment.server";
import { supabaseAdmin } from "../integrations/supabase/client.server";

async function testFullSubmit() {
  console.log("=================================================");
  console.log("🚀 TESTING LIVE SUBMIT AND ANALYZE");
  console.log("=================================================\n");

  const testPayload = {
    parent: {
      name: "Orang Tua Test Live",
      whatsapp: "081299887766",
    },
    child: {
      name: "Anak Test Live SMA",
      gender: "L" as const,
      birth_date: "2009-05-15",
      school: "SMA Al Karim",
      class_name: "X-1",
      education_level: "SMA" as const,
    },
    answers: [
      { question_id: "test-q1", score: 4, text_answer: "Sangat baik" },
      { question_id: "test-q2", score: 5, text_answer: "Lancar membaca" },
    ],
  };

  try {
    const result = await submitAndAnalyze(testPayload);
    console.log("✅ submitAndAnalyze completed successfully!");
    console.log("   Assessment ID:", result.assessment_id);
    console.log("   Status:", result.status);
    console.log("   Child Name:", result.child_name);
  } catch (err: any) {
    console.error("❌ submitAndAnalyze failed:", err.message || err);
  }

  console.log("\n-------------------------------------------------");
  console.log("🔍 CHECKING IF ROWS WERE WRITTEN TO SUPABASE:");
  console.log("-------------------------------------------------");

  const { data: parents, error: pErr } = await supabaseAdmin.from("parents").select("*").eq("whatsapp", "081299887766");
  console.log("1. Parents Table:", pErr ? `Error [${pErr.code}]: ${pErr.message}` : `${parents?.length ?? 0} rows found`);
  if (parents && parents.length > 0) {
    console.log("   Parent row:", parents[0]);
  }

  const { data: children, error: cErr } = await supabaseAdmin.from("children").select("*").eq("name", "Anak Test Live");
  console.log("2. Children Table:", cErr ? `Error [${cErr.code}]: ${cErr.message}` : `${children?.length ?? 0} rows found`);

  const { data: assessments, error: aErr } = await supabaseAdmin.from("assessments").select("*").order("created_at", { ascending: false }).limit(3);
  console.log("3. Assessments Table:", aErr ? `Error [${aErr.code}]: ${aErr.message}` : `${assessments?.length ?? 0} rows found`);
  if (assessments && assessments.length > 0) {
    console.log("   Latest Assessment:", assessments[0]);
  }

  console.log("\n=================================================");
}

testFullSubmit().catch(console.error);
