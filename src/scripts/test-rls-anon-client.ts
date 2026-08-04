import { createClient } from "@supabase/supabase-js";

async function testRlsAnonClient() {
  console.log("=========================================================================");
  console.log("🧪 TESTING RLS READ PERMISSIONS FOR ANON / PUBLISHABLE KEY CLIENT");
  console.log("=========================================================================\n");

  const url = "https://lqzicsebjjzhdsduqdcf.supabase.co";
  const pubKey = "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";

  const anonClient = createClient(url, pubKey, {
    auth: { persistSession: false },
    global: {
      headers: { apikey: pubKey },
    },
  });

  const [{ data: parents, error: pErr }, { data: children, error: cErr }, { data: assessments, error: aErr }] = await Promise.all([
    anonClient.from("parents").select("*").limit(10),
    anonClient.from("children").select("*").limit(10),
    anonClient.from("assessments").select("*").limit(10),
  ]);

  console.log("Anon Client Query Results:");
  console.log("- parents count:", parents?.length || 0, pErr ? `| Error: [${pErr.code}] ${pErr.message}` : "");
  console.log("- children count:", children?.length || 0, cErr ? `| Error: [${cErr.code}] ${cErr.message}` : "");
  console.log("- assessments count:", assessments?.length || 0, aErr ? `| Error: [${aErr.code}] ${aErr.message}` : "");

  if ((!parents || parents.length === 0) || (!children || children.length === 0) || (!assessments || assessments.length === 0)) {
    console.warn("\n⚠️ RLS WARNING: Anon publishable key receives EMPTY data from Supabase!");
    console.warn("This is why static client apps like Lovable display 'Belum ada data di database orang tua'!");
  } else {
    console.log("\n✅ Anon publishable key can read data!");
  }

  console.log("\n=========================================================================");
}

testRlsAnonClient().catch(console.error);
