import { supabaseAdmin } from "../integrations/supabase/client.server";

async function listTables() {
  const { data: prompts } = await supabaseAdmin.from("ai_prompts").select("id, education_level, updated_at");
  console.log("ai_prompts count:", prompts?.length);

  const { data: appSettings, error: sErr } = await supabaseAdmin.from("app_settings" as any).select("*");
  console.log("app_settings:", sErr ? sErr.message : appSettings);

  const { data: systemSettings, error: sysErr } = await supabaseAdmin.from("system_settings" as any).select("*");
  console.log("system_settings:", sysErr ? sysErr.message : systemSettings);
}

listTables().catch(console.error);
