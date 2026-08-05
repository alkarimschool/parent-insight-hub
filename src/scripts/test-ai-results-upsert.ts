import { supabaseAdmin } from "../integrations/supabase/client.server";

async function testAiResultsUpsert() {
  const { data: ass } = await supabaseAdmin
    .from("assessments")
    .select("id")
    .limit(1)
    .single();

  if (!ass) return;

  console.log("Testing insert into ai_results for assessment:", ass.id);

  const { data, error } = await supabaseAdmin.from("ai_results").insert({
    assessment_id: ass.id,
    content: { test: true },
    raw_text: "test",
    model: "google/gemini-3.6-flash",
  }).select();

  if (error) {
    console.error("ai_results insert error:", error.code, error.message);
  } else {
    console.log("ai_results insert SUCCESS:", data);
  }
}

testAiResultsUpsert().catch(console.error);
