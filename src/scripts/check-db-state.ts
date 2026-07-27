import { supabaseAdmin } from "../integrations/supabase/client.server";

async function checkDbState() {
  console.log("=================================================");
  console.log("🔍 CHECKING CURRENT SUPABASE REMOTE DB ROWS");
  console.log("=================================================\n");

  const { data: parents, error: pErr } = await supabaseAdmin.from("parents").select("*").limit(5);
  console.log("1. 'parents' table rows:", pErr ? `Error [${pErr.code}]: ${pErr.message}` : `${parents?.length ?? 0} rows found`);
  if (parents && parents.length > 0) {
    console.log("   Sample Parent:", parents[0]);
  }

  const { data: children, error: cErr } = await supabaseAdmin.from("children").select("*").limit(5);
  console.log("\n2. 'children' table rows:", cErr ? `Error [${cErr.code}]: ${cErr.message}` : `${children?.length ?? 0} rows found`);
  if (children && children.length > 0) {
    console.log("   Sample Child:", children[0]);
  }

  const { data: assessments, error: aErr } = await supabaseAdmin.from("assessments").select("*").limit(5);
  console.log("\n3. 'assessments' table rows:", aErr ? `Error [${aErr.code}]: ${aErr.message}` : `${assessments?.length ?? 0} rows found`);
  if (assessments && assessments.length > 0) {
    console.log("   Sample Assessment:", assessments[0]);
  }

  const { data: aiResults, error: aiErr } = await supabaseAdmin.from("ai_results").select("id, assessment_id, model, created_at").limit(5);
  console.log("\n4. 'ai_results' table rows:", aiErr ? `Error [${aiErr.code}]: ${aiErr.message}` : `${aiResults?.length ?? 0} rows found`);

  console.log("\n=================================================");
}

checkDbState().catch(console.error);
