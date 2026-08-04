import { supabaseAdmin } from "../integrations/supabase/client.server";

async function checkLocksSchema() {
  console.log("=========================================================================");
  console.log("🔍 CHECKING DATABASE SCHEMA FOR WEBSITE_SETTINGS & ASSESSMENT_LOCKS");
  console.log("=========================================================================\n");

  const { data: wsData, error: wsErr } = await supabaseAdmin.from("website_settings").select("*").eq("id", 1).maybeSingle();
  console.log("website_settings row 1:", wsData ? JSON.stringify(wsData, null, 2) : "NONE", wsErr);

  const { data: lockData, error: lockErr } = await supabaseAdmin.from("assessment_locks").select("*");
  console.log("\nassessment_locks rows:", lockData, lockErr);

  console.log("\n=========================================================================");
}

checkLocksSchema().catch(console.error);
