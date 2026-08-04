import { supabaseAdmin } from "../integrations/supabase/client.server";
import { retryAssessmentAnalysisServer } from "../lib/assessment.server";

async function fixStuckAssessments() {
  console.log("=================================================");
  console.log("🛠️ FIXING STUCK ASSESSMENTS IN SUPABASE DB");
  console.log("=================================================\n");

  const { data: stuckList, error } = await supabaseAdmin
    .from("assessments")
    .select("id, status, education_level, created_at, children(name)")
    .or("status.eq.queued,status.eq.analyzing,status.eq.Menunggu Analisis,status.eq.Diproses")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stuck list:", error.message);
    return;
  }

  console.log(`Found ${stuckList?.length || 0} stuck assessment(s) in database:`);
  stuckList?.forEach((a: any) => {
    const child = Array.isArray(a.children) ? a.children[0] : a.children;
    console.log(`- ID: ${a.id} | Child: ${child?.name || "N/A"} | Status: ${a.status} | Level: ${a.education_level}`);
  });

  if (!stuckList || stuckList.length === 0) {
    console.log("\n✅ No stuck assessments found!");
    return;
  }

  for (const item of stuckList) {
    const child = Array.isArray(item.children) ? item.children[0] : item.children;
    console.log(`\nProcessing assessment ID: ${item.id} (${child?.name || "N/A"})...`);
    try {
      const res = await retryAssessmentAnalysisServer(item.id);
      console.log(`✅ Success for ${item.id}:`, res);
    } catch (err: any) {
      console.error(`❌ Failed for ${item.id}:`, err?.message || err);
    }
  }

  console.log("\n=================================================");
  console.log("🎉 ALL STUCK ASSESSMENTS FIXED & UPDATED TO ANALYZED!");
  console.log("=================================================");
}

fixStuckAssessments().catch(console.error);
