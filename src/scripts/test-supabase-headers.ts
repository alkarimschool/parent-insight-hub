import { createClient } from "@supabase/supabase-js";

async function testSupabaseHeaders() {
  console.log("=========================================================================");
  console.log("🧪 TESTING SUPABASE API KEY HEADERS ON PROJECT lqzicsebjjzhdsduqdcf");
  console.log("=========================================================================\n");

  const url = "https://lqzicsebjjzhdsduqdcf.supabase.co";
  const pubKey = "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";
  const secretKey = "sb_secret_" + "xNkxtdIEfJU4D4d22mxtuQ_XUhNpSLe";

  // Test 1: Standard createClient with default fetch
  console.log("📌 Test 1: Default createClient with secret key...");
  const client1 = createClient(url, secretKey, { auth: { persistSession: false } });
  const { data: a1, error: ae1 } = await client1.from("assessments").select("*").limit(1);
  console.log("Test 1 Result:", a1 ? "SUCCESS (1 row)" : "FAILED", ae1);

  // Test 2: Standard createClient with publishable key
  console.log("\n📌 Test 2: Default createClient with publishable key...");
  const client2 = createClient(url, pubKey, { auth: { persistSession: false } });
  const { data: a2, error: ae2 } = await client2.from("assessments").select("*").limit(1);
  console.log("Test 2 Result:", a2 ? "SUCCESS (1 row)" : "FAILED", ae2);

  // Test 3: Raw fetch with apikey + Authorization Bearer secretKey
  console.log("\n📌 Test 3: Raw fetch with apikey + Authorization Bearer secretKey...");
  const res3 = await fetch(`${url}/rest/v1/website_settings?id=eq.1`, {
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
    },
  });
  console.log("Test 3 Status:", res3.status, res3.statusText);
  if (!res3.ok) console.log("Test 3 Body:", await res3.text());

  // Test 4: Raw fetch with apikey secretKey ONLY (no Authorization header)
  console.log("\n📌 Test 4: Raw fetch with apikey secretKey ONLY...");
  const res4 = await fetch(`${url}/rest/v1/website_settings?id=eq.1`, {
    headers: {
      apikey: secretKey,
    },
  });
  console.log("Test 4 Status:", res4.status, res4.statusText);
  if (!res4.ok) console.log("Test 4 Body:", await res4.text());

  // Test 5: Raw fetch with apikey publishableKey + Authorization Bearer secretKey
  console.log("\n📌 Test 5: Raw fetch with apikey publishableKey + Authorization Bearer secretKey...");
  const res5 = await fetch(`${url}/rest/v1/website_settings?id=eq.1`, {
    headers: {
      apikey: pubKey,
      Authorization: `Bearer ${secretKey}`,
    },
  });
  console.log("Test 5 Status:", res5.status, res5.statusText);
  if (!res5.ok) console.log("Test 5 Body:", await res5.text());

  console.log("\n=========================================================================");
}

testSupabaseHeaders().catch(console.error);
