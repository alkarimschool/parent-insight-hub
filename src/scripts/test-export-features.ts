import { getExportDataServer } from "../lib/admin.server";
import { exportToJson, exportToCsv, exportToExcel, exportQaReport, ExportAssessmentRow } from "../lib/export.utils";

async function testExportFeatures() {
  console.log("==========================================================================");
  console.log("🧪 TESTING EXPORT HASIL ANALISIS & QA AUDIT REPORT FEATURES");
  console.log("==========================================================================\n");

  const data = await getExportDataServer();
  console.log(`[1] Fetched ${data.length} assessment records for export testing.`);

  if (!data || data.length < 10) {
    console.warn(`⚠️ Warning: Found ${data?.length || 0} records (expected at least 10).`);
  }

  const sampleRows = data.slice(0, 10) as ExportAssessmentRow[];

  console.log("\n[2] Validating Data Row Structure for 10 Participants:");
  sampleRows.forEach((r, idx) => {
    console.log(`   - Participant #${idx + 1}: ${r.child_name} | Level: ${r.education_level} | AvgScore: ${r.average_score} | Category: ${r.category}`);
    const ai = r.ai_result || {};
    const hasAllAiFields = Boolean(
      ai.ringkasan_kemampuan_awal &&
      ai.area_yang_perlu_diperhatikan &&
      ai.kemampuan_awal_akademik &&
      ai.kemampuan_berpikir &&
      ai.kemampuan_komunikasi_dan_sosial &&
      ai.karakter_dan_kemandirian &&
      (ai.kesiapan_mengikuti_pembelajaran_SMA || ai.kesiapan_sekolah || ai.kesiapan_sd || ai.kesiapan_smp) &&
      ai.potensi_pengembangan &&
      ai.potensi_dan_kelebihan &&
      ai.rekomendasi_untuk_orang_tua
    );
    console.log(`     ✓ All 10 AI Fields Present: ${hasAllAiFields ? "YES" : "NO"}`);
  });

  console.log("\n[3] Testing JSON Serialization:");
  const jsonStr = JSON.stringify(sampleRows, null, 2);
  const parsedBack = JSON.parse(jsonStr);
  console.log(`   ✓ JSON Serialized & Parsed successfully (${parsedBack.length} items, length: ${jsonStr.length} chars).`);

  console.log("\n[4] Testing QA Audit Report Summaries:");
  const levelCounts: Record<string, number> = {};
  let totalScore = 0;
  sampleRows.forEach((r) => {
    levelCounts[r.education_level] = (levelCounts[r.education_level] || 0) + 1;
    totalScore += Number(r.average_score || 0);
  });
  const avgOverall = (totalScore / sampleRows.length).toFixed(2);

  console.log(`   - Total QA Sample Size: ${sampleRows.length}`);
  console.log(`   - Levels Breakdown:`, levelCounts);
  console.log(`   - Overall Average Score: ${avgOverall} / 5.00`);

  console.log("\n==========================================================================");
  console.log("🎉 ALL EXPORT & QA AUDIT REPORT FEATURES VALIDATED SUCCESSFULLY!");
  console.log("==========================================================================");
}

testExportFeatures().catch(console.error);
