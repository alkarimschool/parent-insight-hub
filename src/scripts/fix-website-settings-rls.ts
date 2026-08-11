import { supabaseAdmin } from "../integrations/supabase/client.server";

async function fixWebsiteSettingsRls() {
  console.log("Fixing RLS policies on website_settings and assessment_locks...");

  // Enable RLS and grant public select permission
  try {
    const { error: err1 } = await (supabaseAdmin as any).rpc("exec_sql", {
      sql: `
        GRANT SELECT ON public.website_settings TO anon, authenticated;
        GRANT SELECT ON public.assessment_locks TO anon, authenticated;
        DROP POLICY IF EXISTS "public read website" ON public.website_settings;
        CREATE POLICY "public read website" ON public.website_settings FOR SELECT TO anon, authenticated USING (true);
        DROP POLICY IF EXISTS "public read locks" ON public.assessment_locks;
        CREATE POLICY "public read locks" ON public.assessment_locks FOR SELECT TO anon, authenticated USING (true);
      `
    });
    console.log("RPC Result:", err1);
  } catch (e: any) {
    console.log("RPC Error:", e?.message || e);
  }
}

fixWebsiteSettingsRls();
