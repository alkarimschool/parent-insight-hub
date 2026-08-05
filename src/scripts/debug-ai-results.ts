import { supabaseAdmin } from "../integrations/supabase/client.server";

async function debugAiResults() {
  console.log("=== DEBUG ASSESSMENTS TABLE ===");
  const { data: ass, error: aErr } = await supabaseAdmin
    .from("assessments")
    .select("id, child_id, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  console.log(aErr ? aErr.message : ass);

  console.log("\n=== DEBUG AI_RESULTS TABLE ===");
  const { data: aiRes, error: rErr } = await supabaseAdmin
    .from("ai_results")
    .select("id, assessment_id, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  console.log(rErr ? rErr.message : aiRes);
}

debugAiResults().catch(console.error);
