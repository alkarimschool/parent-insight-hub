import { createClient } from "@supabase/supabase-js";

async function testLqzSupabase() {
  const url = "https://lqzicsebjjzhdsduqdcf.supabase.co";
  const publishableKey = "sb_publishable_qtEDnfJ2uApK1ILNzAXkxw_F0UJAqua";

  console.log("=================================================");
  console.log("🔍 TESTING LQZ SUPABASE PROJECT (lqzicsebjjzhdsduqdcf)");
  console.log("=================================================\n");

  const supabase = createClient(url, publishableKey);

  // Try querying parents, children, assessments, ai_results, homepage_settings, etc.
  const tables = ["parents", "children", "assessments", "ai_results", "homepage_settings", "website_settings", "questions"];

  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select("*", { count: "exact" }).limit(2);
    if (error) {
      console.log(`❌ Table '${table}': [${error.code}] ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': ${count ?? data?.length ?? 0} rows found`);
      if (data && data.length > 0) {
        console.log(`   Sample '${table}':`, JSON.stringify(data[0]).slice(0, 100));
      }
    }
  }

  console.log("\n=================================================");
}

testLqzSupabase().catch(console.error);
