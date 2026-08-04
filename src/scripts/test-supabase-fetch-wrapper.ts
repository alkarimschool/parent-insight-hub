import { createClient } from "@supabase/supabase-js";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetchOld(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseFetchFixed(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // Always ensure both apikey and Authorization headers are present for Supabase
    headers.set('apikey', supabaseKey);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${supabaseKey}`);
    }
    return fetch(input, { ...init, headers });
  };
}

async function testSupabaseFetchWrapper() {
  console.log("=========================================================================");
  console.log("🧪 TESTING SUPABASE FETCH WRAPPERS");
  console.log("=========================================================================\n");

  const url = "https://lqzicsebjjzhdsduqdcf.supabase.co";
  const secretKey = "sb_secret_" + "xNkxtdIEfJU4D4d22mxtuQ_XUhNpSLe";

  console.log("📌 Test Old Wrapper (with headers.delete('Authorization')):");
  const clientOld = createClient(url, secretKey, {
    global: { fetch: createSupabaseFetchOld(secretKey) },
    auth: { persistSession: false },
  });
  const { data: dOld, error: eOld } = await clientOld.from("website_settings").select("id, data").eq("id", 1).maybeSingle();
  console.log("Old Wrapper Result:", dOld ? "SUCCESS" : "FAILED", eOld);

  console.log("\n📌 Test Fixed Wrapper (with apikey + Authorization):");
  const clientFixed = createClient(url, secretKey, {
    global: { fetch: createSupabaseFetchFixed(secretKey) },
    auth: { persistSession: false },
  });
  const { data: dFixed, error: eFixed } = await clientFixed.from("website_settings").select("id, data").eq("id", 1).maybeSingle();
  console.log("Fixed Wrapper Result:", dFixed ? "SUCCESS" : "FAILED", eFixed);

  console.log("\n=========================================================================");
}

testSupabaseFetchWrapper().catch(console.error);
