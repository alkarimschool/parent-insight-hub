import { getAssessmentResultServer } from "../lib/assessment.server";
import { supabaseAdmin } from "../integrations/supabase/client.server";

async function compare3LiveReports() {
  const { data: assessments } = await supabaseAdmin
    .from("assessments")
    .select("id, created_at")
    .eq("education_level", "TK")
    .order("created_at", { ascending: false })
    .limit(3);

  if (!assessments || assessments.length < 3) {
    console.log("Kurang dari 3 data asesmen TK ditemukan.");
    return;
  }

  const reports: any[] = [];
  for (const ass of assessments) {
    const res = await getAssessmentResultServer(ass.id, true);
    reports.push(res);
  }

  console.log("==========================================================================");
  console.log("PERBANDINGAN HASIL LAPORAN LIVE 3 SISWA TK AKTUIL DARI DATABASE");
  console.log("==========================================================================");
  reports.forEach((r, idx) => {
    console.log(`\n--------------------------------------------------------------------------`);
    console.log(`📌 SISWA #${idx + 1}: ${r.child_name} (ID: ${r.assessment_id})`);
    console.log(`--------------------------------------------------------------------------`);
    console.log(`🌱 [BAGIAN 1] STATUS PERKEMBANGAN:`);
    console.log(`   ${r.content?.status_perkembangan}`);
    console.log(`\n💡 [BAGIAN 2] HAL/AREA PERHATIAN:`);
    console.log(`   ${JSON.stringify(r.content?.area_yang_perlu_diperhatikan, null, 2)}`);
    console.log(`\n🗣️ [BAGIAN 3] GAMBARAN PERKEMBANGAN (ASPEK BAHASA & KOMUNIKASI):`);
    console.log(`   ${r.content?.gambaran_perkembangan_anak?.bahasa_dan_komunikasi}`);
    console.log(`\n🏃 [BAGIAN 3] GAMBARAN PERKEMBANGAN (ASPEK MOTORIK KASAR):`);
    console.log(`   ${r.content?.gambaran_perkembangan_anak?.motorik_kasar}`);
    console.log(`\n✅ [BAGIAN 4] POTENSI & KELEBIHAN:`);
    console.log(`   ${JSON.stringify(r.content?.potensi_dan_kelebihan, null, 2)}`);
    console.log(`\n👥 [BAGIAN 5] CATATAN UNTUK ORANG TUA:`);
    console.log(`   ${r.content?.catatan_untuk_orang_tua}`);
  });
  console.log("==========================================================================\n");
}

compare3LiveReports().catch(console.error);
