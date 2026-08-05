import { createClient } from "@supabase/supabase-js";

async function testPublicAnonRead() {
  const url = "https://lqzicsebjjzhdsduqdcf.supabase.co";
  const key = "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";

  const supabase = createClient(url, key);

  const { data: assessments, error: aErr } = await supabase.from("assessments").select("*").limit(5);
  const { data: parents, error: pErr } = await supabase.from("parents").select("*").limit(5);
  const { data: children, error: cErr } = await supabase.from("children").select("*").limit(5);

  console.log("Assessments count:", assessments?.length || 0, "Error:", aErr?.message || "none");
  console.log("Parents count:", parents?.length || 0, "Error:", pErr?.message || "none");
  console.log("Children count:", children?.length || 0, "Error:", cErr?.message || "none");
}

testPublicAnonRead().catch(console.error);
