import { supabaseAdmin } from "../integrations/supabase/client.server";

async function testRpc() {
  console.log("Testing RPC functions on Supabase remote...");
  const rpcs = ["exec_sql", "execute_sql", "run_sql", "query", "sql"];

  for (const rpcName of rpcs) {
    const { data, error } = await (supabaseAdmin as any).rpc(rpcName, { sql: "SELECT 1" });
    console.log(`RPC '${rpcName}':`, error ? error.message : "AVAILABLE!");
  }
}

testRpc().catch(console.error);
