import { supabaseAdmin } from "../integrations/supabase/client.server";

async function testPermissions() {
  console.log("=================================================");
  console.log("🛠️ TESTING DIRECT TABLE INSERTS ON SUPABASE");
  console.log("=================================================\n");

  // 1. Test parent insert
  const { data: pData, error: pErr } = await supabaseAdmin
    .from("parents")
    .insert({ name: "Direct Insert Test Parent", whatsapp: "089911223344" })
    .select()
    .single();

  console.log("1. Parent Insert Result:", pErr ? `❌ [${pErr.code}] ${pErr.message}` : `✅ Success: ID ${pData?.id}`);

  // 2. Test child insert
  let childId = null;
  if (pData?.id) {
    const { data: cData, error: cErr } = await supabaseAdmin
      .from("children")
      .insert({ parent_id: pData.id, name: "Direct Insert Test Child", gender: "L", birth_date: "2018-01-01", education_level: "SMA" })
      .select()
      .single();
    console.log("2. Child Insert Result:", cErr ? `❌ [${cErr.code}] ${cErr.message}` : `✅ Success: ID ${cData?.id}`);
    childId = cData?.id;
  }

  // 3. Test assessment insert
  if (pData?.id && childId) {
    const { data: aData, error: aErr } = await supabaseAdmin
      .from("assessments")
      .insert({ parent_id: pData.id, child_id: childId, education_level: "SMA", status: "analyzed" })
      .select()
      .single();
    console.log("3. Assessment Insert Result:", aErr ? `❌ [${aErr.code}] ${aErr.message}` : `✅ Success: ID ${aData?.id}`);
  }

  console.log("\n=================================================");
}

testPermissions().catch(console.error);
