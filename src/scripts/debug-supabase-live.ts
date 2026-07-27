import { supabaseAdmin } from "../integrations/supabase/client.server";

async function testTablePermissions() {
  console.log("=================================================");
  console.log("🧪 TESTING SUPABASE TABLE RLS PERMISSIONS (ANON KEY)");
  console.log("=================================================\n");

  const testId = crypto.randomUUID();

  // Test 1: parents
  console.log("1. Testing INSERT into 'parents'...");
  const pRes = await supabaseAdmin.from("parents").insert({
    name: "Test Parent RLS",
    whatsapp: "08123" + Math.floor(1000000 + Math.random() * 9000000)
  }).select().single();
  console.log("   Result:", pRes.error ? `❌ RLS Error [${pRes.error.code}]: ${pRes.error.message}` : `✅ SUCCESS (ID: ${pRes.data?.id})`);

  const parentId = pRes.data?.id || testId;

  // Test 2: children
  console.log("\n2. Testing INSERT into 'children'...");
  const cRes = await supabaseAdmin.from("children").insert({
    parent_id: parentId,
    name: "Test Child RLS",
    gender: "L",
    birth_date: "2018-01-01"
  }).select().single();
  console.log("   Result:", cRes.error ? `❌ RLS Error [${cRes.error.code}]: ${cRes.error.message}` : `✅ SUCCESS (ID: ${cRes.data?.id})`);

  const childId = cRes.data?.id || testId;

  // Test 3: assessments minimal payload
  console.log("\n3. Testing INSERT into 'assessments' (minimal columns)...");
  const aRes = await supabaseAdmin.from("assessments").insert({
    parent_id: parentId,
    child_id: childId,
    status: "analyzing"
  }).select().single();
  console.log("   Result:", aRes.error ? `❌ RLS Error [${aRes.error.code}]: ${aRes.error.message}` : `✅ SUCCESS (ID: ${aRes.data?.id})`);

  const assessmentId = aRes.data?.id || testId;

  // Test 4: assessment_answers
  console.log("\n4. Testing INSERT into 'assessment_answers'...");
  const { data: qData } = await supabaseAdmin.from("questions").select("id").limit(1).maybeSingle();
  const qId = qData?.id || testId;

  const ansRes = await supabaseAdmin.from("assessment_answers").insert({
    assessment_id: assessmentId,
    question_id: qId,
    score: 5
  }).select();
  console.log("   Result:", ansRes.error ? `❌ RLS Error [${ansRes.error.code}]: ${ansRes.error.message}` : `✅ SUCCESS (${ansRes.data?.length} rows)`);

  // Test 5: ai_results
  console.log("\n5. Testing INSERT into 'ai_results'...");
  const aiRes = await supabaseAdmin.from("ai_results").insert({
    assessment_id: assessmentId,
    content: { test: true }
  }).select().single();
  console.log("   Result:", aiRes.error ? `❌ RLS Error [${aiRes.error.code}]: ${aiRes.error.message}` : `✅ SUCCESS (ID: ${aiRes.data?.id})`);

  console.log("\n=================================================");
}

testTablePermissions().catch(console.error);
