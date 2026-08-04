import { createClient } from "@supabase/supabase-js";

async function testLocksAnonRead() {
  console.log("=========================================================================");
  console.log("🧪 TESTING PUBLIC READ OF ASSESSMENT_LOCKS TABLE WITH ANON CLIENT");
  console.log("=========================================================================\n");

  const url = "https://lqzicsebjjzhdsduqdcf.supabase.co";
  const pubKey = "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";

  const anonClient = createClient(url, pubKey, {
    auth: { persistSession: false },
    global: { headers: { apikey: pubKey } },
  });

  const { data, error } = await anonClient.from("assessment_locks").select("education_level, is_locked");

  console.log("Anon query result for assessment_locks:", data, error);

  if (error || !data) {
    console.error("❌ Anon query failed!", error);
  } else {
    console.log("✅ Anon query succeeded! Rows count:", data.length);
    data.forEach((r) => console.log(`  - ${r.education_level}: is_locked = ${r.is_locked}`));
  }

  console.log("\n=========================================================================");
}

testLocksAnonRead().catch(console.error);
