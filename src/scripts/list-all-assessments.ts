import { supabaseAdmin } from "../integrations/supabase/client.server";

async function listAllAssessments() {
  const { data: list, error } = await supabaseAdmin
    .from("assessments")
    .select("id, status, education_level, created_at, children(name), parents(name, whatsapp)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assessments:", error.message);
    return;
  }

  console.log(`Found ${list?.length || 0} total assessment(s) in Supabase DB:\n`);
  list?.forEach((a: any, i: number) => {
    const c = Array.isArray(a.children) ? a.children[0] : a.children;
    const p = Array.isArray(a.parents) ? a.parents[0] : a.parents;
    console.log(`${i + 1}. ID: ${a.id} | Child: ${c?.name || "-"} | Parent: ${p?.name || "-"} | Status: '${a.status}' | Level: ${a.education_level} | Date: ${a.created_at}`);
  });
}

listAllAssessments().catch(console.error);
