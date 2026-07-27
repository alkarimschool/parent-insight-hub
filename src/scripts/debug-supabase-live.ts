import { supabaseAdmin } from "../integrations/supabase/client.server";
import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";

async function debugSupabaseLive() {
  console.log("=================================================");
  console.log("🔍 EVIDENCE-BASED SUPABASE DATABASE AUDIT & DEBUG");
  console.log("=================================================\n");

  // 1. ENVIRONMENT INSPECTION
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://pmdhjmjcalmgixvhcrwk.supabase.co";
  const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_qtEDnfJ2uApK1ILNzAXkxw_F0UJAqua";

  console.log("1. ENVIRONMENT & SUPABASE KEY CONFIGURATION:");
  console.log(`   - SUPABASE_URL       : ${supabaseUrl}`);
  console.log(`   - PROJECT REFERENCE  : pmdhjmjcalmgixvhcrwk`);
  console.log(`   - SERVICE_ROLE_KEY   : ${hasServiceRoleKey ? "PRESENT (Bypasses RLS)" : "MISSING (Using Publishable Key)"}`);
  console.log(`   - KEY MODE IN USE    : ${hasServiceRoleKey ? "SERVICE_ROLE (Admin)" : "ANON_KEY (Subject to RLS)"}`);
  console.log(`   - PUBLISHABLE_KEY    : ${publishableKey.substring(0, 20)}...\n`);

  // 2. LIVE SUBMIT TEST PAYLOAD
  const testPayload = {
    parent: {
      name: "Orang Tua Audit Live",
      whatsapp: "0899" + Math.floor(1000000 + Math.random() * 9000000),
    },
    child: {
      name: "Anak Audit Live",
      gender: "L" as const,
      birth_date: "2017-06-15",
      school: "SD N 1 Audit",
      class_name: "Kelas 3 SD",
      education_level: "SD" as const,
    },
    answers: Array.from({ length: 15 }, (_, i) => ({
      question_id: `test-q-${i + 1}`,
      score: 5,
    })),
  };

  console.log("2. EXECUTING LIVE SUBMIT PROCESS & LOGGING ALL SUPABASE QUERIES:");
  console.log(`   - Test Child Name : "${testPayload.child.name}"`);
  console.log(`   - Test WhatsApp   : "${testPayload.parent.whatsapp}"`);
  console.log(`   - Education Level : "${testPayload.child.education_level}"\n`);

  let submitRes: any = null;
  try {
    submitRes = await submitAndAnalyze(testPayload);
    console.log(`\n✅ Submit Function Completed! Assessment ID: ${submitRes.assessment_id}`);
  } catch (err: any) {
    console.error(`\n❌ Submit Function Threw Error:`, err?.message || err);
  }

  if (!submitRes || !submitRes.assessment_id) {
    console.error("\n❌ AUDIT FAILED: Submit did not return a valid assessment_id.");
    process.exit(1);
  }

  const assessmentId = submitRes.assessment_id;

  // 3. PHYSICAL SUPABASE DATABASE VERIFICATION
  console.log("\n3. PHYSICAL SUPABASE DATABASE RECORD VERIFICATION:");
  console.log(`   Querying Supabase PostgreSQL tables directly for ID: "${assessmentId}"...\n`);

  // A. Check 'assessments' table row
  console.log(`   [QUERY: SELECT assessments] WHERE id = "${assessmentId}"`);
  const { data: dbAss, error: errAss } = await supabaseAdmin
    .from("assessments")
    .select("id, parent_id, child_id, education_level, status, assessment_title, created_at, updated_at")
    .eq("id", assessmentId)
    .maybeSingle();

  console.log(`   - Table      : assessments`);
  console.log(`   - Found Row  :`, dbAss ? "YES" : "NO");
  console.log(`   - Response   :`, JSON.stringify(dbAss, null, 2));
  console.log(`   - DB Error   :`, errAss ? errAss.message : "NONE (Success)");

  // B. Check 'parents' table row
  let dbParent: any = null;
  let errParent: any = null;
  if (dbAss?.parent_id) {
    console.log(`\n   [QUERY: SELECT parents] WHERE id = "${dbAss.parent_id}"`);
    const pRes = await supabaseAdmin.from("parents").select("*").eq("id", dbAss.parent_id).maybeSingle();
    dbParent = pRes.data;
    errParent = pRes.error;
    console.log(`   - Table      : parents`);
    console.log(`   - Found Row  :`, dbParent ? "YES" : "NO");
    console.log(`   - Response   :`, JSON.stringify(dbParent, null, 2));
    console.log(`   - DB Error   :`, errParent ? errParent.message : "NONE (Success)");
  }

  // C. Check 'children' table row
  let dbChild: any = null;
  let errChild: any = null;
  if (dbAss?.child_id) {
    console.log(`\n   [QUERY: SELECT children] WHERE id = "${dbAss.child_id}"`);
    const cRes = await supabaseAdmin.from("children").select("*").eq("id", dbAss.child_id).maybeSingle();
    dbChild = cRes.data;
    errChild = cRes.error;
    console.log(`   - Table      : children`);
    console.log(`   - Found Row  :`, dbChild ? "YES" : "NO");
    console.log(`   - Response   :`, JSON.stringify(dbChild, null, 2));
    console.log(`   - DB Error   :`, errChild ? errChild.message : "NONE (Success)");
  }

  // D. Check 'assessment_answers' table rows
  console.log(`\n   [QUERY: SELECT assessment_answers] WHERE assessment_id = "${assessmentId}"`);
  const { data: dbAns, error: errAns } = await supabaseAdmin
    .from("assessment_answers")
    .select("id, question_id, score, created_at")
    .eq("assessment_id", assessmentId);

  console.log(`   - Table      : assessment_answers`);
  console.log(`   - Rows Count :`, dbAns?.length ?? 0);
  console.log(`   - Sample Row :`, dbAns && dbAns.length > 0 ? JSON.stringify(dbAns[0], null, 2) : "NONE");
  console.log(`   - DB Error   :`, errAns ? errAns.message : "NONE (Success)");

  // E. Check 'ai_results' table row
  console.log(`\n   [QUERY: SELECT ai_results] WHERE assessment_id = "${assessmentId}"`);
  const { data: dbAi, error: errAi } = await supabaseAdmin
    .from("ai_results")
    .select("id, assessment_id, model, created_at")
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  console.log(`   - Table      : ai_results`);
  console.log(`   - Found Row  :`, dbAi ? "YES" : "NO");
  console.log(`   - Response   :`, JSON.stringify(dbAi, null, 2));
  console.log(`   - DB Error   :`, errAi ? errAi.message : "NONE (Success)");

  // 4. SUMMARY AUDIT RESULT
  console.log("\n=================================================");
  console.log("FINAL PHYSICAL DATABASE AUDIT VERDICT:");
  console.log("=================================================");
  console.log(`1. 'parents' record stored            : ${dbParent ? "✅ YES (ID: " + dbParent.id + ")" : "❌ NO"}`);
  console.log(`2. 'children' record stored           : ${dbChild ? "✅ YES (ID: " + dbChild.id + ")" : "❌ NO"}`);
  console.log(`3. 'assessments' record stored        : ${dbAss ? "✅ YES (ID: " + dbAss.id + ")" : "❌ NO"}`);
  console.log(`4. 'assessment_answers' rows stored   : ${dbAns && dbAns.length > 0 ? "✅ YES (" + dbAns.length + " rows)" : "❌ NO"}`);
  console.log(`5. 'ai_results' record stored         : ${dbAi ? "✅ YES (ID: " + dbAi.id + ")" : "❌ NO"}`);
  console.log(`6. 'assessments' status = 'analyzed'  : ${dbAss?.status === "analyzed" ? "✅ YES" : "❌ NO (" + dbAss?.status + ")"}`);
  console.log("=================================================");
}

debugSupabaseLive().catch((err) => {
  console.error("Fatal debug script exception:", err);
  process.exit(1);
});
