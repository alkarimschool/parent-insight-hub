import { supabaseAdmin } from "../integrations/supabase/client.server";

async function fetchDbAiResults() {
  console.log("=================================================");
  console.log("🔍 FETCHING EXISTING AI RESULTS FROM SUPABASE");
  console.log("=================================================\n");

  const { data: aiResults, error } = await supabaseAdmin
    .from("ai_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching ai_results:", error.message);
    return;
  }

  console.log(`Found ${aiResults.length} existing AI results in Supabase DB.`);
  aiResults.forEach((res, idx) => {
    console.log(`\n--- Result #${idx + 1} (Model: ${res.model}, ID: ${res.id}) ---`);
    console.log("Keys in payload:", Object.keys(res.result_json || {}));
  });
}

fetchDbAiResults().catch(console.error);
