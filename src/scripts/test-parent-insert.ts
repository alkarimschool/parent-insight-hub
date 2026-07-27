import { supabaseAdmin } from "../integrations/supabase/client.server";

async function testParentInsertProof() {
  console.log("=================================================");
  console.log("📊 PARENTS TABLE INSERT EVIDENCE & RLS AUDIT");
  console.log("=================================================\n");

  // 1. SUPABASE CLIENT & ENVIRONMENT INSPECTION
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://pmdhjmjcalmgixvhcrwk.supabase.co";
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_qtEDnfJ2uApK1ILNzAXkxw_F0UJAqua";

  console.log("1. ENVIRONMENT & SUPABASE KEY IN USE:");
  console.log(`   - SUPABASE_URL             : ${supabaseUrl}`);
  console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${hasServiceRoleKey ? "PRESENT (Bypasses RLS)" : "MISSING in process.env"}`);
  console.log(`   - CLIENT IN USE            : ${hasServiceRoleKey ? "Service Role Client (Admin)" : "Publishable Key (Anon Role - Subject to RLS)"}`);
  console.log(`   - ACTIVE API KEY           : ${hasServiceRoleKey ? "[SECRET_SERVICE_ROLE_KEY]" : publishableKey.substring(0, 25) + "..."}\n`);

  // 2. QUERY RLS POLICIES FOR 'parents' TABLE VIA RPC / METADATA
  console.log("2. AUDITING RLS POLICIES ON 'parents' TABLE:");
  try {
    const { data: policies, error: polErr } = await supabaseAdmin.rpc("exec_sql", {
      sql_query: "SELECT policyname, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'parents';"
    });
    if (!polErr && policies) {
      console.log("   Active RLS Policies:", JSON.stringify(policies, null, 2));
    } else {
      console.log("   (Direct pg_policies query via RPC not enabled, testing direct operations instead)\n");
    }
  } catch (e) {
    console.log("   (RPC pg_policies inspection skipped)\n");
  }

  // 3. EXECUTE DIRECT TEST INSERT INTO 'parents'
  const testPayload = {
    name: "Parents Test Proof " + new Date().toISOString().substring(11, 19),
    whatsapp: "0812" + Math.floor(10000000 + Math.random() * 90000000),
  };

  console.log("3. EXECUTING LIVE INSERT INTO 'parents':");
  console.log("   Payload:", JSON.stringify(testPayload, null, 2));

  const { data: pInserted, error: pErr } = await supabaseAdmin
    .from("parents")
    .insert(testPayload)
    .select()
    .single();

  console.log("\n4. SUPABASE INSERT RESPONSE:");
  console.log("   - Data Returned :", pInserted ? JSON.stringify(pInserted, null, 2) : "NULL");
  console.log("   - Error Returned:", pErr ? JSON.stringify(pErr, null, 2) : "NULL (SUCCESS)");

  console.log("\n=================================================");
  console.log("VERDICT FOR INSERT TO 'parents':");
  console.log("=================================================");

  if (pErr) {
    console.log(`❌ INSERT FAILED! Alasan dari Supabase PostgreSQL:`);
    console.log(`   - Code   : ${pErr.code}`);
    console.log(`   - Message: ${pErr.message}`);
    console.log(`   - Details: ${pErr.details ?? "None"}`);
    console.log(`   - Hint   : ${pErr.hint ?? "None"}`);
    if (pErr.code === "42501") {
      console.log("\n   PENYEBAB UTAMA: Kebijakan RLS (Row Level Security) pada tabel 'parents' di database remote Supabase menolak INSERT untuk role anon.");
      console.log("   CARA MENGATASI (Pilih Salah Satu):");
      console.log("   1. Jalankan script SQL 20260727230000_secure_public_assessment_rls.sql di Supabase SQL Editor (https://supabase.com/dashboard/project/pmdhjmjcalmgixvhcrwk/sql).");
      console.log("   2. Masukkan SUPABASE_SERVICE_ROLE_KEY di .env atau Cloudflare Environment Variables.");
    }
  } else {
    console.log(`✅ INSERT BERHASIL 100%! Data orang tua berhasil tersimpan di Supabase DB.`);
    console.log(`   - Record ID: ${pInserted.id}`);
    console.log(`   - Name     : ${pInserted.name}`);
    console.log(`   - WhatsApp : ${pInserted.whatsapp}`);
    console.log(`   - Created  : ${pInserted.created_at}`);

    // Verify row by re-selecting from DB
    const { data: pSelect } = await supabaseAdmin.from("parents").select("*").eq("id", pInserted.id).single();
    console.log(`\n   Re-select Proof from Database: ${pSelect ? "FOUND (ID: " + pSelect.id + ")" : "NOT FOUND"}`);
  }
  console.log("=================================================\n");
}

testParentInsertProof().catch(console.error);
