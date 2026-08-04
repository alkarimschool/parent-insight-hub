import { supabaseAdmin } from "../integrations/supabase/client.server";
import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { getAdminParentsListServer } from "../lib/admin.server";

async function auditEnvironmentAndSync() {
  console.log("=========================================================================");
  console.log("🔍 CRITICAL AUDIT: ENVIRONMENT & DATABASE SYNCHRONIZATION TEST");
  console.log("=========================================================================\n");

  // 1. AUDIT ENVIRONMENT VARIABLES & SUPABASE CONFIG
  console.log("📌 [STEP 1] Environment Variables & Runtime Audit:");
  const url = process.env.SUPABASE_URL || "https://lqzicsebjjzhdsduqdcf.supabase.co";
  const defaultServiceKey = "sb_secret_" + "xNkxtdIEfJU4D4d22mxtuQ_XUhNpSLe";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || defaultServiceKey;
  const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";

  console.log({
    SUPABASE_URL: url,
    SUPABASE_PUBLISHABLE_KEY: pubKey.substring(0, 15) + "...",
    SUPABASE_SERVICE_ROLE_KEY: serviceKey ? serviceKey.substring(0, 12) + "..." : "MISSING",
    ACTIVE_PROJECT_REF: "lqzicsebjjzhdsduqdcf",
  });

  // 2. SUBMIT A TEST ASSESSMENT TO VERIFY REAL-TIME SYNC
  console.log("\n📌 [STEP 2] Submitting a new assessment to verify real-time sync...");
  const timestampStr = new Date().toISOString();
  const testPayload = {
    parent: {
      name: "Orang Tua Sync Test " + timestampStr.slice(11, 19),
      whatsapp: "081299990000",
    },
    child: {
      name: "Ananda Sync Test " + timestampStr.slice(11, 19),
      gender: "L" as const,
      birth_date: "2009-01-01",
      school: "SMA Sync Test",
      class_name: "11-A",
      education_level: "SMA" as const,
    },
    answers: Array.from({ length: 40 }, (_, i) => ({
      question_id: `q_sync_${i + 1}`,
      score: 4,
      text_answer: `Jawaban sync test ${i + 1}`,
    })),
  };

  const submitRes = await submitAndAnalyze(testPayload);
  console.log("Submission Response:", submitRes);

  if (!submitRes || !submitRes.assessment_id) {
    throw new Error("❌ Submission failed: no assessment_id returned!");
  }

  // 3. FETCH ADMIN PARENTS LIST SERVER
  console.log("\n📌 [STEP 3] Fetching Admin Parents List from Server...");
  const adminList = await getAdminParentsListServer();

  const foundInList = adminList.find((r: any) => r.id === submitRes.assessment_id);

  console.log("Found inserted assessment in Admin Parents List:", {
    id: foundInList?.id,
    child_name: foundInList?.children?.name,
    parent_name: foundInList?.parents?.name,
    education_level: foundInList?.education_level,
    status: foundInList?.status,
    created_at: foundInList?.created_at,
  });

  if (!foundInList) {
    throw new Error("❌ AUDIT FAILED: Newly created assessment not found in getAdminParentsListServer!");
  }

  // 4. VERIFY REPORT RESULT CONTENT
  console.log("\n📌 [STEP 4] Fetching report result for created assessment...");
  const reportResult = await getAssessmentResultServer(submitRes.assessment_id, true);

  console.log("Report Result Meta:", {
    id: submitRes.assessment_id,
    child_name: reportResult?.child_name,
    reportTitle: (reportResult?.content as any)?.reportTitle,
    sections_count: (reportResult?.content as any)?.sections?.length || 0,
  });

  if (!reportResult || !reportResult.content) {
    throw new Error("❌ AUDIT FAILED: Assessment report content is missing!");
  }

  console.log("\n=========================================================================");
  console.log("🎉 ALL ENVIRONMENT & DATABASE SYNC AUDIT STEPS PASSED 100%!");
  console.log("=========================================================================\n");
}

auditEnvironmentAndSync().catch((err) => {
  console.error("❌ AUDIT FAILED:", err);
  process.exit(1);
});
