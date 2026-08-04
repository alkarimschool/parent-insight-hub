import { createClient } from "@supabase/supabase-js";

async function testHeaders() {
  const url = process.env.SUPABASE_URL || "https://pmdhjmjcalmgixvhcrwk.supabase.co";
  const pubKey = "sb_publishable_qtEDnfJ2uApK1ILNzAXkxw_F0UJAqua";

  console.log("=================================================");
  console.log("🔬 TESTING SUPABASE CLIENT HEADER BEHAVIOR");
  console.log("=================================================\n");

  // Test 1: Standard client with pubKey
  const client1 = createClient(url, pubKey);
  const { data: d1, error: e1 } = await client1.from("parents").select("*").limit(1);
  console.log("Test 1 (Standard pubKey client):");
  console.log("  - Rows returned:", d1?.length ?? 0);
  console.log("  - Error:", e1 ? `[${e1.code}] ${e1.message}` : "None");

  const { data: a1, error: ae1 } = await client1.from("assessments").select("*").limit(1);
  console.log("Test 1 (Assessments table query):");
  console.log("  - Rows returned:", a1?.length ?? 0);
  console.log("  - Error:", ae1 ? `[${ae1.code}] ${ae1.message}` : "None");

  console.log("\n=================================================");
}

testHeaders().catch(console.error);
