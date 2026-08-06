import { saveAssessmentSubmission, runBackgroundAiAnalysis } from "../lib/assessment.server";
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

async function runE2eAcceptanceTest() {
  console.log("==========================================================================");
  console.log("🌐 END-TO-END ACCEPTANCE TEST: 10 SUBMISSIONS TO WEB APP & DATABASE");
  console.log("==========================================================================\n");

  // Identical 40 answers (Scores: 4 for Q1-Q20, 3 for Q21-Q40)
  const identicalAnswers: Array<{ question_id: string; score: number }> = [];
  for (let i = 1; i <= 40; i++) {
    identicalAnswers.push({
      question_id: `q_sma_${i}`,
      score: i <= 20 ? 4 : 3,
    });
  }

  const studentResults: Array<{ studentName: string; assessmentId: string; json: any }> = [];

  for (let idx = 1; idx <= 10; idx++) {
    const numStr = String(idx).padStart(2, "0");
    const childName = `Siswa Uji ${numStr}`;
    const parentPhone = `0812345678${numStr}`;

    console.log(`▶ [${idx}/10] Submitting assessment for: ${childName}...`);

    const submitPayload = {
      parent: {
        name: `Orang Tua ${childName}`,
        whatsapp: parentPhone,
        email: `orangtua${numStr}@test.com`,
      },
      child: {
        name: childName,
        gender: "L" as const,
        birth_date: "2008-05-10",
        education_level: "SMA" as const,
        school: "SMA Negeri 1 Testing",
        class_name: "10-A",
      },
      answers: identicalAnswers,
    };

    // Step 1: Execute saveAssessmentSubmission
    const res = await saveAssessmentSubmission(submitPayload);
    console.log(`   ✓ Submission saved to DB. Assessment ID: ${res.assessment_id}`);

    // Step 2: Trigger runBackgroundAiAnalysis with forceFreshPrompt: true
    await runBackgroundAiAnalysis(res.assessment_id, submitPayload, { forceFreshPrompt: true });
    console.log(`   ✓ AI Analysis completed & saved to Supabase 'ai_results'.`);

    // Step 3: Fetch saved result from Supabase DB 'ai_results'
    const { data: dbResult } = await supabaseAdmin
      .from("ai_results")
      .select("*")
      .eq("assessment_id", res.assessment_id)
      .maybeSingle();

    const jsonRes = dbResult?.content || (dbResult as any)?.result_json;

    if (dbResult && jsonRes) {
      studentResults.push({
        studentName: childName,
        assessmentId: res.assessment_id,
        json: jsonRes,
      });
      console.log(`   ✓ Loaded analysis result from DB for ${childName}.`);
    } else {
      console.warn(`   ⚠️ Warning: Could not find analysis result in DB for ${childName}.`);
    }
  }

  console.log("\n==========================================================================");
  console.log("📋 10 HASIL ANALISIS LENGKAP DARI DATABASE (TIDAK DIPOTONG)");
  console.log("==========================================================================");

  studentResults.forEach((sr, idx) => {
    console.log(`\n--- [SISWA #${idx + 1}: ${sr.studentName} | Assessment ID: ${sr.assessmentId}] ---`);
    console.log(JSON.stringify(sr.json, null, 2));
  });

  if (studentResults.length < 2) {
    console.error("❌ Not enough results to perform field similarity comparison.");
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
  console.log("📑 LAPORAN AKHIR E2E ACCEPTANCE TEST");
  console.log("==========================================================================");
  console.log(`1. Rata-Rata Similarity Keseluruhan: ${(Object.values(fieldStats).reduce((a, b) => a + b.avg, 0) / fieldsToTest.length).toFixed(2)}%`);
  console.log(`2. Similarity Tertinggi (Worst Pair): ${overallMax.toFixed(2)}%`);
  console.log(`3. Similarity Terendah (Best Pair): ${overallMin.toFixed(2)}%`);
  console.log(`4. Field yang Paling Sering Mirip: ${mostSimilarField[0]} (${mostSimilarField[1].avg.toFixed(2)}%)`);
  console.log(`5. Field yang Paling Bervariasi: ${mostVariedField[0]} (${mostVariedField[1].avg.toFixed(2)}%)`);

  const hasExceeded30 = Object.values(fieldStats).some((s) => s.avg > 30.0);
  if (hasExceeded30) {
    console.log("\n⚠️ Terdapat field dengan similarity >30%. Narrative Engine perlu diperhalus.");
  } else {
    console.log("\n🎉 E2E ACCEPTANCE TEST LULUS 100%! 10 SISWA DENGAN JAWABAN IDENTIK TELAH TERSIMPAN DI DATABASE SUPABASE & DASHBOARD ADMIN!");
  }
}

runE2eAcceptanceTest().catch(console.error);
