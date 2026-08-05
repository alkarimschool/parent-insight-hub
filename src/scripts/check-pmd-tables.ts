import { createClient } from "@supabase/supabase-js";

async function checkPmdTables() {
  const url = "https://pmdhjmjcalmgixvhcrwk.supabase.co";
  const publishableKey = "sb_publishable_qtEDnfJ2uApK1ILNzAXkxw_F0UJAqua";

  console.log("=================================================");
  console.log("🔍 TESTING PMD SUPABASE PROJECT (pmdhjmjcalmgixvhcrwk)");
  console.log("=================================================\n");

  const supabase = createClient(url, publishableKey);
  const tables = ["parents", "children", "assessments", "ai_results", "homepage_settings", "website_settings", "questions"];

  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select("*", { count: "exact" }).limit(5);
    if (error) {
      console.log(`❌ Table '${table}': [${error.code}] ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': ${count ?? data?.length ?? 0} total rows found`);
      if (data && data.length > 0) {
        console.log(`   Sample '${table}':`, JSON.stringify(data[0]).slice(0, 120));
      }
    }
  }

  console.log("\n=================================================");
}

checkPmdTables().catch(console.error);
