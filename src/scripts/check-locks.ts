import { supabaseAdmin } from "../integrations/supabase/client.server";

async function checkLocksTable() {
  console.log("=================================================");
  console.log("🔒 CHECKING ASSESSMENT_LOCKS TABLE");
  console.log("=================================================\n");

  const { data, error } = await supabaseAdmin.from("assessment_locks").select("*");
  if (error) {
    console.log("❌ Error fetching assessment_locks:", error);
  } else {
    console.log("✅ assessment_locks data:", data);
  }

  console.log("\n=================================================");
}

checkLocksTable().catch(console.error);
