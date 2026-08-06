import { supabaseAdmin } from "../integrations/supabase/client.server";

// Jaccard Bigram Similarity Calculation
function calculateBigramSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  const cleanA = textA.toLowerCase().replace(/[^\w\s]/gi, "");
  const cleanB = textB.toLowerCase().replace(/[^\w\s]/gi, "");

  const wordsA = cleanA.split(/\s+/).filter(Boolean);
  const wordsB = cleanB.split(/\s+/).filter(Boolean);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const getBigrams = (words: string[]) => {
    const set = new Set<string>();
    for (let i = 0; i < words.length - 1; i++) {
      set.add(`${words[i]}_${words[i + 1]}`);
    }
    return set;
  };

  const bigramsA = getBigrams(wordsA);
  const bigramsB = getBigrams(wordsB);

  if (bigramsA.size === 0 || bigramsB.size === 0) {
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    let intersection = 0;
    setA.forEach((w) => {
      if (setB.has(w)) intersection++;
    });
    return (intersection / Math.max(setA.size, setB.size)) * 100;
  }

  let intersection = 0;
  bigramsA.forEach((bg) => {
    if (bigramsB.has(bg)) intersection++;
  });

  const union = new Set([...bigramsA, ...bigramsB]).size;
  return (intersection / union) * 100;
}

function fieldToString(fieldVal: any): string {
  if (typeof fieldVal === "string") return fieldVal;
  if (Array.isArray(fieldVal)) return fieldVal.join(" ");
  if (typeof fieldVal === "object" && fieldVal !== null) return JSON.stringify(fieldVal);
  return String(fieldVal || "");
}

async function verify10DbRecords() {
  console.log("==========================================================================");
  console.log("🔍 FETCHING 10 RECENT STUDENT SUBMISSIONS DIRECTLY FROM SUPABASE REMOTE DB");
  console.log("==========================================================================\n");

  const { data: children, error: cErr } = await supabaseAdmin
    .from("children")
    .select("id, name, education_level, created_at")
    .ilike("name", "Siswa Uji %")
    .order("created_at", { ascending: false })
    .limit(10);

  if (cErr || !children || children.length === 0) {
    console.error("No student submissions found in DB:", cErr?.message);
    return;
  }

  console.log(`Found ${children.length} student submissions for 'Siswa Uji XX' in database.`);

  const studentResults: Array<{ name: string; assessmentId: string; json: any }> = [];

  for (const child of children.reverse()) {
    const { data: assessment } = await supabaseAdmin
      .from("assessments")
      .select("id, status")
      .eq("child_id", child.id)
      .maybeSingle();

    if (assessment) {
      const { data: aiRes } = await supabaseAdmin
        .from("ai_results")
        .select("*")
        .eq("assessment_id", assessment.id)
        .maybeSingle();

      const jsonRes = aiRes?.content || (aiRes as any)?.result_json;
      if (aiRes && jsonRes) {
        studentResults.push({
          name: child.name,
          assessmentId: assessment.id,
          json: jsonRes,
        });
      }
    }
  }

  console.log(`Successfully retrieved ${studentResults.length} complete analysis results from Supabase DB.\n`);

  console.log("==========================================================================");
  console.log("📋 10 HASIL ANALISIS REAL DARI DATABASE SUPABASE (TIDAK DIPOTONG)");
  console.log("==========================================================================");

  studentResults.forEach((sr, idx) => {
    console.log(`\n--- [HASIL ANALISIS SISWA #${idx + 1}: ${sr.name} | Assessment ID: ${sr.assessmentId}] ---`);
    console.log(JSON.stringify(sr.json, null, 2));
  });

  if (studentResults.length < 2) {
    console.log("⚠️ Less than 2 results found for direct comparison.");
    return;
  }

  const fieldsToTest = [
    "ringkasan_kemampuan_awal",
    "area_yang_perlu_diperhatikan",
    "kemampuan_awal_akademik",
    "kemampuan_berpikir",
    "kemampuan_komunikasi_dan_sosial",
    "karakter_dan_kemandirian",
    "kesiapan_mengikuti_pembelajaran_SMA",
    "potensi_pengembangan",
    "potensi_dan_kelebihan",
    "rekomendasi_untuk_orang_tua",
  ];

  console.log("\n==========================================================================");
  console.log("📊 HASIL PERHITUNGAN SIMILARITY INDEPENDEN PER FIELD (TARGET < 20%)");
  console.log("==========================================================================");

  const fieldStats: Record<string, { avg: number; min: number; max: number }> = {};
  let overallMin = 100;
  let overallMax = 0;

  fieldsToTest.forEach((fieldName) => {
    const fieldTexts = studentResults.map((sr) => fieldToString(sr.json[fieldName]));

    let totalSim = 0;
    let pairCount = 0;
    let minSim = 100;
    let maxSim = 0;

    for (let i = 0; i < fieldTexts.length; i++) {
      for (let j = i + 1; j < fieldTexts.length; j++) {
        const sim = calculateBigramSimilarity(fieldTexts[i], fieldTexts[j]);
        totalSim += sim;
        pairCount++;
        if (sim < minSim) minSim = sim;
        if (sim > maxSim) maxSim = sim;
      }
    }

    const avgSim = pairCount > 0 ? totalSim / pairCount : 0;
    fieldStats[fieldName] = { avg: avgSim, min: minSim, max: maxSim };

    if (minSim < overallMin) overallMin = minSim;
    if (maxSim > overallMax) overallMax = maxSim;

    const statusIcon = avgSim <= 20.0 ? "🟢 PASSED (<20%)" : (avgSim <= 30.0 ? "🟡 ACCEPTABLE (<30%)" : "🔴 REVISION NEEDED (>30%)");
    console.log(`✓ Field [${fieldName}]:`);
    console.log(`   - Rata-rata Similarity: ${avgSim.toFixed(2)}% | Min: ${minSim.toFixed(2)}% | Max: ${maxSim.toFixed(2)}% | Status: ${statusIcon}`);
  });

  const sortedByAvg = Object.entries(fieldStats).sort((a, b) => b[1].avg - a[1].avg);
  const mostSimilarField = sortedByAvg[0];
  const mostVariedField = sortedByAvg[sortedByAvg.length - 1];

  console.log("\n==========================================================================");
  console.log("📑 LAPORAN AKHIR E2E ACCEPTANCE TEST (DATABASE REAL)");
  console.log("==========================================================================");
  console.log(`1. Rata-Rata Similarity Keseluruhan: ${(Object.values(fieldStats).reduce((a, b) => a + b.avg, 0) / fieldsToTest.length).toFixed(2)}%`);
  console.log(`2. Similarity Tertinggi (Worst Pair): ${overallMax.toFixed(2)}%`);
  console.log(`3. Similarity Terendah (Best Pair): ${overallMin.toFixed(2)}%`);
  console.log(`4. Field yang Paling Sering Mirip: ${mostSimilarField[0]} (${mostSimilarField[1].avg.toFixed(2)}%)`);
  console.log(`5. Field yang Paling Bervariasi: ${mostVariedField[0]} (${mostVariedField[1].avg.toFixed(2)}%)`);
}

verify10DbRecords().catch(console.error);
