import { submitAndAnalyze, getAssessmentResultServer } from "../lib/assessment.server";
import { LEVEL_QUESTIONS } from "../lib/questions.data";
import { textSimilarity } from "../lib/similarity";

const REQUIRED = [
  "kesimpulan_umum_perkembangan",
  "area_yang_perlu_diperhatikan",
  "motorik",
  "bahasa_dan_kognitif",
  "sosial_emosional_dan_kemandirian",
  "potensi_dan_kelebihan_anak",
  "rekomendasi_stimulasi_untuk_orang_tua",
];

const patterns: Array<{ name: string; scores: number[] }> = [
  { name: "Anak TK A", scores: Array(30).fill(5) },
  { name: "Anak TK B", scores: Array(30).fill(5) },
  { name: "Anak TK C", scores: Array(30).fill(2) },
  { name: "Anak TK D", scores: Array.from({ length: 30 }, (_, i) => (i < 10 ? 2 : 5)) },
  { name: "Anak TK E", scores: Array.from({ length: 30 }, (_, i) => (i >= 10 && i < 20 ? 2 : 4)) },
  { name: "Anak TK F", scores: Array.from({ length: 30 }, (_, i) => (i >= 20 ? 2 : 4)) },
  { name: "Anak TK G", scores: Array.from({ length: 30 }, (_, i) => (i % 3) + 2) },
  { name: "Anak TK H", scores: Array(30).fill(3) },
  { name: "Anak TK I", scores: Array.from({ length: 30 }, (_, i) => (i % 5) + 1) },
  { name: "Anak TK J", scores: Array(30).fill(4) },
];

async function main() {
  const { supabaseAdmin } = await import("../integrations/supabase/client.server");
  const { data: prevLock } = await supabaseAdmin.from("assessment_locks").select("is_locked").eq("education_level", "TK").maybeSingle();
  await supabaseAdmin.from("assessment_locks").update({ is_locked: false }).eq("education_level", "TK");
  console.log("[TEST] TK sementara dibuka untuk pengujian (status awal locked =", prevLock?.is_locked, ")");
  process.on("exit", () => {});
  const restore = async () => {
    await supabaseAdmin.from("assessment_locks").update({ is_locked: prevLock?.is_locked ?? true }).eq("education_level", "TK");
    console.log("[TEST] Status kunci TK dikembalikan ke:", prevLock?.is_locked ?? true);
  };
  try {
  const qs = LEVEL_QUESTIONS.TK;
  const summaries: string[] = [];
  for (const p of patterns) {
    const res: any = await submitAndAnalyze({
      parent: { name: `Ortu ${p.name}`, whatsapp: "08123456789" },
      child: { name: p.name, gender: "L", birth_date: "2021-01-01", school: "TK Harapan", class_name: "B1", education_level: "TK" },
      answers: qs.map((q, i) => ({ question_id: q.id, score: p.scores[i] })),
    } as any);
    const id = res?.assessmentId || res?.id;
    let content: any = null;
    for (let t = 0; t < 30; t++) {
      const r: any = await getAssessmentResultServer(id, true);
      content = r?.content;
      if (content && content.kesimpulan_umum_perkembangan) break;
      await new Promise((r) => setTimeout(r, 2000));
    }
    const missing = REQUIRED.filter((k) => !content?.[k]);
    const areaKeys = Object.keys(content || {});
    console.log(`\n▶ ${p.name} | status: ${content?.status_perkembangan} | missing: ${missing.length ? missing.join(",") : "none"}`);
    console.log(`   area#1: ${(content?.area_yang_perlu_diperhatikan || [])[0]}`);
    console.log(`   ringkasan: ${String(content?.kesimpulan_umum_perkembangan || "").slice(0, 140)}…`);
    summaries.push(String(content?.kesimpulan_umum_perkembangan || ""));
  }
  const sim = textSimilarity(summaries[0], summaries[1]);
  console.log(`\nKemiripan narasi 2 anak dengan skor identik (A vs B): ${sim.toFixed(1)}%`);
  } finally {
    await restore();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
