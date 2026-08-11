import { fetchAssessmentCardSettings } from "../lib/settings";
import { supabase } from "../integrations/supabase/client";

async function debugFetchSettings() {
  console.log("1. Direct Supabase query:");
  const { data, error } = await supabase.from("website_settings").select("data").eq("id", 1).maybeSingle();
  console.log("Direct Query Data:", JSON.stringify(data, null, 2), "Error:", error);

  console.log("\n2. fetchAssessmentCardSettings():");
  const res = await fetchAssessmentCardSettings();
  console.log("fetchAssessmentCardSettings Result:", JSON.stringify(res, null, 2));
}

debugFetchSettings();
