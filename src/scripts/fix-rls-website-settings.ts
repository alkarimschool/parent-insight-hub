import { supabaseAdmin } from "../integrations/supabase/client.server";
import { supabase } from "../integrations/supabase/client";

async function checkRlsAndFix() {
  console.log("Checking standard client query with select('*')...");
  const { data: dAll, error: eAll } = await supabase.from("website_settings").select("*").eq("id", 1).maybeSingle();
  console.log("Standard Client select('*'):", dAll, "Error:", eAll);

  console.log("\nChecking standard client query with select('data')...");
  const { data: dData, error: eData } = await supabase.from("website_settings").select("data").eq("id", 1).maybeSingle();
  console.log("Standard Client select('data'):", dData, "Error:", eData);

  console.log("\nChecking Admin Client query...");
  const { data: dAdmin, error: eAdmin } = await supabaseAdmin.from("website_settings").select("*").eq("id", 1).maybeSingle();
  console.log("Admin Client select('*'):", dAdmin ? "ROW EXISTS" : "NULL", "Error:", eAdmin);
}

checkRlsAndFix();
