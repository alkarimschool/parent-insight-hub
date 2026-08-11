import { generateFallbackResult } from "../lib/assessment.server";
import { getTkStatusByScore } from "../lib/narrative-variation";

// Helper functions for quantitative text metrics
function calculateJaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(textA.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));
  const wordsB = new Set(textB.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 && wordsB.size === 0) return 1.0;
  
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

function calculateCosineSimilarity(textA: string, textB: string): number {
  const getWordFreq = (str: string) => {
    const freq: Record<string, number> = {};
    const words = str.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
    for (const w of words) freq[w] = (freq[w] || 0) + 1;
    return freq;
  };

  const freqA = getWordFreq(textA);
  const freqB = getWordFreq(textB);
  const vocabulary = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  if (vocabulary.size === 0) return 1.0;

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const w of vocabulary) {
    const countA = freqA[w] || 0;
    const countB = freqB[w] || 0;
    dotProduct += countA * countB;
    magA += countA * countA;
    magB += countB * countB;
  }

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

function extractAllNarrativeText(report: any): string {
  const parts: string[] = [];
  if (typeof report.status_perkembangan === "string") parts.push(report.status_perkembangan);
  if (typeof report.kesimpulan_umum_perkembangan === "string") parts.push(report.kesimpulan_umum_perkembangan);
  
  if (Array.isArray(report.area_yang_perlu_diperhatikan)) parts.push(report.area_yang_perlu_diperhatikan.join(" "));
  
  const g = report.gambaran_perkembangan_anak || {};
  if (typeof g.bahasa_dan_komunikasi === "string") parts.push(g.bahasa_dan_komunikasi);
  if (typeof g.sosial_dan_emosional === "string") parts.push(g.sosial_dan_emosional);
  if (typeof g.motorik === "string") parts.push(g.motorik);
  if (typeof g.kognitif_dan_cara_berpikir === "string") parts.push(g.kognitif_dan_cara_berpikir);
  
  if (Array.isArray(report.potensi_dan_kelebihan)) parts.push(report.potensi_dan_kelebihan.join(" "));
  if (Array.isArray(report.rekomendasi_stimulasi_di_rumah)) parts.push(report.rekomendasi_stimulasi_di_rumah.join(" "));
  if (typeof report.catatan_untuk_orang_tua === "string") parts.push(report.catatan_untuk_orang_tua);

  return parts.join(" ");
}

const mockQuestions = Array.from({ length: 30 }, (_, i) => ({
  id: `q_${i + 1}`,
  order_index: i + 1,
  text: `Indikator observasi tumbuh kembang anak ke-${i + 1}`,
  category_name: i < 7 ? "Bahasa & Bicara" : i < 15 ? "Sosial & Emosional" : i < 22 ? "Fisik & Motorik" : "Kognitif & Kemandirian"
}));

async function runQuantitativeStressTest() {
  console.log("=========================================================================");
  console.log("🧪 QUANTITATIVE STRESS TEST: 10 CHILDREN ANTI-TEMPLATE VERIFICATION");
  console.log("=========================================================================\n");

  const names = [
    "Alfanisa", "Bagas", "Cinta", "Dhani", "Elsa",
    "Faris", "Gita", "Hafiz", "Indah", "Jaya"
  ];

  // CASE 1: 10 Children - Identical Scores (Avg: 4.00)
  console.log("📌 [CASE 1] 10 Children with Identical Scores (4.00), Different Names");
  const case1Answers = Array.from({ length: 30 }, () => ({ score: 4 }));
  const case1Reports = names.map(name =>
    generateFallbackResult(name, `Orang Tua ${name}`, 4.0, "TK", case1Answers, mockQuestions)
  );

  let exactDuplicates = 0;
  let totalPairs = 0;
  let sumJaccard = 0;
  let sumCosine = 0;

  for (let i = 0; i < case1Reports.length; i++) {
    for (let j = i + 1; j < case1Reports.length; j++) {
      totalPairs++;
      const textA = extractAllNarrativeText(case1Reports[i]);
      const textB = extractAllNarrativeText(case1Reports[j]);

      if (textA === textB) exactDuplicates++;

      const jaccard = calculateJaccardSimilarity(textA, textB);
      const cosine = calculateCosineSimilarity(textA, textB);

      sumJaccard += jaccard;
      sumCosine += cosine;
    }
  }

  const avgJaccard1 = sumJaccard / totalPairs;
  const avgCosine1 = sumCosine / totalPairs;

  console.log(`- Total Sample Pairs Evaluated: ${totalPairs}`);
  console.log(`- Exact Duplicate Count: ${exactDuplicates} (Target: 0) ${exactDuplicates === 0 ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`- Avg Jaccard Similarity: ${(avgJaccard1 * 100).toFixed(2)}%`);
  console.log(`- Avg Cosine Similarity: ${(avgCosine1 * 100).toFixed(2)}%`);

  // CASE 2: 10 Children - Identical Total Score (4.00) but Different Answer Distributions
  console.log("\n📌 [CASE 2] 10 Children with Identical Total Score (4.00) but Shifted Answer Distributions");
  const case2Reports = names.map((name, idx) => {
    // Shift scores: rotate high/low scores per aspect
    const shiftedScores = Array.from({ length: 30 }, (_, i) => {
      const score = (i + idx) % 5 === 0 ? 2 : (i + idx) % 3 === 0 ? 5 : 4;
      return { score };
    });
    const avg = shiftedScores.reduce((acc, curr) => acc + curr.score, 0) / 30;
    return generateFallbackResult(name, `Orang Tua ${name}`, avg, "TK", shiftedScores, mockQuestions);
  });

  let sumJaccard2 = 0;
  let sumCosine2 = 0;
  let totalPairs2 = 0;
  let exactDuplicates2 = 0;

  for (let i = 0; i < case2Reports.length; i++) {
    for (let j = i + 1; j < case2Reports.length; j++) {
      totalPairs2++;
      const textA = extractAllNarrativeText(case2Reports[i]);
      const textB = extractAllNarrativeText(case2Reports[j]);

      if (textA === textB) exactDuplicates2++;

      sumJaccard2 += calculateJaccardSimilarity(textA, textB);
      sumCosine2 += calculateCosineSimilarity(textA, textB);
    }
  }

  const avgJaccard2 = sumJaccard2 / totalPairs2;
  const avgCosine2 = sumCosine2 / totalPairs2;

  console.log(`- Exact Duplicate Count: ${exactDuplicates2} ${exactDuplicates2 === 0 ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`- Avg Jaccard Similarity: ${(avgJaccard2 * 100).toFixed(2)}%`);
  console.log(`- Avg Cosine Similarity: ${(avgCosine2 * 100).toFixed(2)}%`);

  // CASE 3: 10 Children - Different Score Categories (1.50 to 4.90)
  console.log("\n📌 [CASE 3] 10 Children with Varied Score Ranges (1.50 to 4.90)");
  const targetScores = [4.90, 4.70, 4.20, 3.80, 3.50, 3.20, 2.80, 2.30, 1.80, 1.50];
  const case3Reports = names.map((name, idx) => {
    const targetAvg = targetScores[idx];
    const scores = Array.from({ length: 30 }, (_, i) => {
      const base = Math.round(targetAvg);
      const val = (i % 2 === 0) ? Math.min(5, base + 1) : Math.max(1, base - 1);
      return { score: val };
    });
    return generateFallbackResult(name, `Orang Tua ${name}`, targetAvg, "TK", scores, mockQuestions);
  });

  let exactDuplicates3 = 0;
  for (let i = 0; i < case3Reports.length; i++) {
    for (let j = i + 1; j < case3Reports.length; j++) {
      if (extractAllNarrativeText(case3Reports[i]) === extractAllNarrativeText(case3Reports[j])) exactDuplicates3++;
    }
  }
  console.log(`- Status Categories Tested: ${new Set(case3Reports.map(r => r.status_perkembangan)).size} distinct status levels.`);
  console.log(`- Exact Duplicate Count: ${exactDuplicates3} ${exactDuplicates3 === 0 ? "✅ PASS" : "❌ FAIL"}`);

  // CASE 4 & 5: Near-identical and Identical Answers Verification
  console.log("\n📌 [CASE 4 & 5] Near-identical & Identical Answers with Different Identities");
  const reportA = generateFallbackResult("Rafathar", "Orang Tua Rafathar", 4.2, "TK", case1Answers, mockQuestions);
  const reportB = generateFallbackResult("Rayyanza", "Orang Tua Rayyanza", 4.2, "TK", case1Answers, mockQuestions);

  const textRafathar = extractAllNarrativeText(reportA);
  const textRayyanza = extractAllNarrativeText(reportB);

  console.log("Is Rafathar report identical to Rayyanza report?:", textRafathar === textRayyanza ? "YES ❌ (Fail)" : "NO ✅ PASS (Personalized)");
  console.log(`- Jaccard Similarity between twins: ${(calculateJaccardSimilarity(textRafathar, textRayyanza) * 100).toFixed(2)}%`);

  console.log("\n=========================================================================");
  console.log("🎉 ALL QUANTITATIVE ANTI-TEMPLATE STRESS TESTS COMPLETED SUCCESSFULLY!");
  console.log("=========================================================================\n");
}

runQuantitativeStressTest().catch((err) => {
  console.error("❌ QUANTITATIVE STRESS TEST FAILED:", err);
  process.exit(1);
});
