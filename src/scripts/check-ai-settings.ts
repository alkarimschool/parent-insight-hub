import { supabaseAdmin } from "../integrations/supabase/client.server";

async function checkAiSettings() {
  const { data, error } = await supabaseAdmin.from("ai_settings").select("*");
  console.log("ai_settings table data:", error ? error.message : data);
}

checkAiSettings().catch(console.error);
