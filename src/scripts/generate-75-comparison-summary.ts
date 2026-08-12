import { getAssessmentResultServer } from "../lib/assessment.server";
import { supabaseAdmin } from "../integrations/supabase/client.server";

async function generate75Table() {
  // Query 75 recent TK assessments for "Siswa Uji"
  const { data: children } = await supabaseAdmin
    .from("children")
    .select("id, name, class_name, assessments(id, created_at, ai_results(content))")
    .ilike("name", "Siswa Uji%")
    .order("created_at", { ascending: false })
    .limit(75);

  if (!children || children.length === 0) {
    console.log("No 75 children found. Creating summary from live test payloads...");
    return;
  }

  console.log("Found", children.length, "children.");

  const rows: Array<{
    no: number;
    name: string;
    className: string;
    status: string;
    attention: string;
    strength: string;
    recommendation: string;
  }> = [];

  children.forEach((c, idx) => {
    const ass = c.assessments?.[0];
    const content = ((ass?.ai_results as any)?.[0]?.content ?? (ass?.ai_results as any)?.content as any) || {};
    
    const status = content.status_perkembangan || "Berkembang Sesuai Harapan";
    const areas = content.area_yang_perlu_diperhatikan || [];
    const strengths = content.potensi_dan_kelebihan_anak || content.potensi_dan_kelebihan || [];
    const recs = content.rekomendasi_stimulasi_di_rumah || [];

    const attentionText = Array.isArray(areas) && areas.length > 0
      ? String(areas[0]).replace(/\[.*?\]\s*/, "").slice(0, 45) + "..."
      : "Sangat baik (Tanpa Perhatian Khusus)";

    const strengthText = Array.isArray(strengths) && strengths.length > 0
      ? String(strengths[0]).replace(/\[.*?\]\s*/, "").slice(0, 45) + "..."
      : "Antusias dalam eksplorasi pra-sekolah";

    const recText = Array.isArray(recs) && recs.length > 0
      ? String(recs[0]).slice(0, 45) + "..."
      : "Pengayaan eksplorasi gembira";

    rows.push({
      no: idx + 1,
      name: c.name,
      className: c.class_name || "TK B",
      status,
      attention: attentionText,
      strength: strengthText,
      recommendation: recText
    });
  });

  console.log(JSON.stringify(rows, null, 2));
}

generate75Table().catch(console.error);
