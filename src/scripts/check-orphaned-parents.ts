import { supabaseAdmin } from "../integrations/supabase/client.server";

async function checkOrphanedParents() {
  const [{ data: parents }, { data: children }, { data: assessments }] = await Promise.all([
    supabaseAdmin.from("parents").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("children").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("assessments").select("*").order("created_at", { ascending: false }),
  ]);

  console.log(`Parents count: ${parents?.length || 0}`);
  console.log(`Children count: ${children?.length || 0}`);
  console.log(`Assessments count: ${assessments?.length || 0}\n`);

  const parentIdsInAssessments = new Set((assessments || []).map((a: any) => a.parent_id));

  const orphaned = (parents || []).filter((p: any) => !parentIdsInAssessments.has(p.id));

  console.log(`Found ${orphaned.length} orphaned parent(s) in database (not linked to any assessment):`);
  orphaned.forEach((p: any) => {
    const child = (children || []).find((c: any) => c.parent_id === p.id);
    console.log(`- Parent ID: ${p.id} | Parent Name: ${p.name} | WA: ${p.whatsapp} | Child Name: ${child?.name || "-"} | Level: ${child?.education_level || "N/A"}`);
  });
}

checkOrphanedParents().catch(console.error);
