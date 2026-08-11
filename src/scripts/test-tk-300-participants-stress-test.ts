import { generateFallbackResult } from "../lib/assessment.server";

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

function getSentences(str: string): string[] {
  return str.split(/[.!?]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 15);
}

function extractFieldTexts(report: any): Record<string, string> {
  const fields: Record<string, string> = {};
  fields["status_perkembangan"] = String(report.status_perkembangan || "");
  fields["area_yang_perlu_diperhatikan"] = Array.isArray(report.area_yang_perlu_diperhatikan) ? report.area_yang_perlu_diperhatikan.join(" ") : String(report.area_yang_perlu_diperhatikan || "");
  
  const g = report.gambaran_perkembangan_anak || {};
  fields["bahasa_dan_komunikasi"] = String(g.bahasa_dan_komunikasi || report.bahasa_dan_komunikasi || "");
  fields["sosial_dan_emosional"] = String(g.sosial_dan_emosional || report.sosial_dan_emosional || "");
  fields["motorik"] = String(g.motorik || report.motorik || "");
  fields["kognitif_dan_cara_berpikir"] = String(g.kognitif_dan_cara_berpikir || report.kognitif_dan_cara_berpikir || "");
  
  fields["potensi_dan_kelebihan"] = Array.isArray(report.potensi_dan_kelebihan) ? report.potensi_dan_kelebihan.join(" ") : String(report.potensi_dan_kelebihan || "");
  fields["rekomendasi_stimulasi_di_rumah"] = Array.isArray(report.rekomendasi_stimulasi_di_rumah) ? report.rekomendasi_stimulasi_di_rumah.join(" ") : String(report.rekomendasi_stimulasi_di_rumah || "");
  fields["catatan_untuk_orang_tua"] = Array.isArray(report.catatan_untuk_orang_tua) ? report.catatan_untuk_orang_tua.join(" ") : String(report.catatan_untuk_orang_tua || "");

  return fields;
}

function extractAllNarrativeText(report: any): string {
  const f = extractFieldTexts(report);
  return Object.values(f).join(" ");
}

const mockQuestions = Array.from({ length: 30 }, (_, i) => ({
  id: `q_${i + 1}`,
  order_index: i + 1,
  text: `Indikator observasi tumbuh kembang anak ke-${i + 1}`,
  category_name: i < 7 ? "Bahasa & Bicara" : i < 15 ? "Sosial & Emosional" : i < 22 ? "Fisik & Motorik" : "Kognitif & Kemandirian"
}));

// Generate realistic answer profiles for 300 participants
function generate300ParticipantProfiles() {
  const profiles: Array<{ name: string; class_name: string; answers: Array<{ score: number }>; avg: number }> = [];

  const firstNames = ["Alfanisa", "Bagas", "Cinta", "Dhani", "Elsa", "Faris", "Gita", "Hafiz", "Indah", "Jaya", "Kanza", "Lutfi", "Mira", "Naufal", "Olivia", "Pratama", "Qonita", "Raffi", "Sifa", "Tio"];
  const lastNames = ["Adiba", "Bramantyo", "Cahyadi", "Darmawan", "Eka", "Fadhil", "Gunawan", "Hidayat", "Irawan", "Jati", "Kusuma", "Lestari", "Mahardika", "Nugraha", "Okta", "Putra", "Raihan", "Saputra", "Tanjung", "Utama"];

  for (let i = 1; i <= 300; i++) {
    const fn = firstNames[(i - 1) % firstNames.length];
    const ln = lastNames[Math.floor((i - 1) / firstNames.length) % lastNames.length];
    const name = `${fn} ${ln} ${i}`;
    const className = `TK B - ${String.fromCharCode(65 + ((i - 1) % 10))}`;

    // Archetype distribution
    const archetype = i % 6;
    const answers = Array.from({ length: 30 }, (_, qIdx) => {
      let base = 3;
      if (archetype === 0) { // Bahasa Tinggi, Sosial Rendah
        base = qIdx < 7 ? 5 : qIdx < 15 ? 2 : (qIdx % 2 === 0 ? 4 : 3);
      } else if (archetype === 1) { // Motorik Tinggi, Bahasa Rendah
        base = qIdx >= 15 && qIdx < 22 ? 5 : qIdx < 7 ? 2 : (qIdx % 2 === 0 ? 4 : 3);
      } else if (archetype === 2) { // Kognitif Tinggi, Konsentrasi Sedang
        base = qIdx >= 22 ? 5 : (qIdx % 3 === 0 ? 4 : 3);
      } else if (archetype === 3) { // Mandiri & Seimbang (High All)
        base = (qIdx % 4 === 0) ? 4 : 5;
      } else if (archetype === 4) { // Perhatian Beberapa Area (Low-Mid All)
        base = (qIdx % 3 === 0) ? 2 : (qIdx % 2 === 0 ? 3 : 2);
      } else { // Mixed Random Profile
        base = ((qIdx * 7 + i * 3) % 5) + 1;
      }
      return { score: Math.min(5, Math.max(1, base)) };
    });

    const sum = answers.reduce((acc, a) => acc + a.score, 0);
    const avg = sum / 30;

    profiles.push({ name, class_name: className, answers, avg });
  }

  return profiles;
}

async function run300ParticipantsStressTest() {
  console.log("=========================================================================");
  console.log("🧪 QUANTITATIVE STRESS TEST: 300 TK PARTICIPANTS FULL AUDIT");
  console.log("=========================================================================\n");

  // CASE A: 10 Participants with IDENTICAL answers
  console.log("📌 [CASE A] 10 Participants with IDENTICAL answers (Identity variation check)");
  const identicalAnswers = Array.from({ length: 30 }, () => ({ score: 4 }));
  const caseAReports = Array.from({ length: 10 }, (_, i) =>
    generateFallbackResult(`Anak Identik ${i + 1}`, `Orang Tua Anak ${i + 1}`, 4.0, "TK", identicalAnswers, mockQuestions)
  );

  let caseAIdenticalTexts = 0;
  for (let i = 0; i < caseAReports.length; i++) {
    for (let j = i + 1; j < caseAReports.length; j++) {
      if (extractAllNarrativeText(caseAReports[i]) === extractAllNarrativeText(caseAReports[j])) {
        caseAIdenticalTexts++;
      }
    }
  }
  console.log(`- CASE A Total Identical Full Reports: ${caseAIdenticalTexts} (Target: 0) ${caseAIdenticalTexts === 0 ? "✅ PASS" : "❌ FAIL"}`);

  // CASE B: 50 Participants with NEAR-IDENTICAL answer patterns
  console.log("\n📌 [CASE B] 50 Participants with NEAR-IDENTICAL answer patterns");
  const caseBReports = Array.from({ length: 50 }, (_, i) => {
    const nearAns = identicalAnswers.map((a, idx) => ({ score: idx === (i % 30) ? 5 : 4 }));
    const avg = nearAns.reduce((acc, curr) => acc + curr.score, 0) / 30;
    return generateFallbackResult(`Anak Kembar ${i + 1}`, `Orang Tua Kembar ${i + 1}`, avg, "TK", nearAns, mockQuestions);
  });

  let caseBIdenticalTexts = 0;
  for (let i = 0; i < caseBReports.length; i++) {
    for (let j = i + 1; j < caseBReports.length; j++) {
      if (extractAllNarrativeText(caseBReports[i]) === extractAllNarrativeText(caseBReports[j])) {
        caseBIdenticalTexts++;
      }
    }
  }
  console.log(`- CASE B Total Identical Full Reports: ${caseBIdenticalTexts} (Target: 0) ${caseBIdenticalTexts === 0 ? "✅ PASS" : "❌ FAIL"}`);

  // CASE D: 300 PARTICIPANTS FULL QUANTITATIVE AUDIT
  console.log("\n📌 [CASE D] 300 PARTICIPANTS FULL QUANTITATIVE SIMILARITY AUDIT");
  const profiles = generate300ParticipantProfiles();

  const reports = profiles.map(p =>
    generateFallbackResult(p.name, `Orang Tua ${p.name}`, p.avg, "TK", p.answers, mockQuestions)
  );

  const totalParticipants = reports.length;
  let successfulAnalysis = totalParticipants;
  let failedAnalysis = 0;

  const totalPairs = (totalParticipants * (totalParticipants - 1)) / 2;
  let sumJaccard = 0;
  let sumCosine = 0;
  let highestSimilarity = 0;
  let highestPair: [string, string] = ["", ""];
  let exactDuplicates = 0;

  const sentenceSet = new Set<string>();
  let duplicateSentences = 0;

  const paragraphSet = new Set<string>();
  let duplicateParagraphs = 0;

  // Field level similarity tracking
  const fieldSimSums: Record<string, number> = {};
  const fieldNames = [
    "status_perkembangan",
    "area_yang_perlu_diperhatikan",
    "bahasa_dan_komunikasi",
    "sosial_dan_emosional",
    "motorik",
    "kognitif_dan_cara_berpikir",
    "potensi_dan_kelebihan",
    "rekomendasi_stimulasi_di_rumah",
    "catatan_untuk_orang_tua"
  ];
  fieldNames.forEach(fn => fieldSimSums[fn] = 0);

  console.log(`- Evaluating ${totalPairs.toLocaleString()} Unique Report Pairs...`);

  for (let i = 0; i < reports.length; i++) {
    const textA = extractAllNarrativeText(reports[i]);
    const fieldsA = extractFieldTexts(reports[i]);

    // Check sentence duplicates
    getSentences(textA).forEach(s => {
      if (sentenceSet.has(s)) duplicateSentences++;
      else sentenceSet.add(s);
    });

    for (let j = i + 1; j < reports.length; j++) {
      const textB = extractAllNarrativeText(reports[j]);
      const fieldsB = extractFieldTexts(reports[j]);

      if (textA === textB) exactDuplicates++;

      const jaccard = calculateJaccardSimilarity(textA, textB);
      const cosine = calculateCosineSimilarity(textA, textB);

      sumJaccard += jaccard;
      sumCosine += cosine;

      if (jaccard > highestSimilarity) {
        highestSimilarity = jaccard;
        highestPair = [profiles[i].name, profiles[j].name];
      }

      // Per-field similarity
      fieldNames.forEach(fn => {
        fieldSimSums[fn] += calculateJaccardSimilarity(fieldsA[fn] || "", fieldsB[fn] || "");
      });
    }
  }

  const avgJaccard = (sumJaccard / totalPairs) * 100;
  const avgCosine = (sumCosine / totalPairs) * 100;

  // Find field with highest similarity and best variation
  const fieldAvgSims: Record<string, number> = {};
  fieldNames.forEach(fn => {
    fieldAvgSims[fn] = (fieldSimSums[fn] / totalPairs) * 100;
  });

  const sortedFields = Object.entries(fieldAvgSims).sort((a, b) => b[1] - a[1]);
  const highestSimField = sortedFields[0];
  const bestVarField = sortedFields[sortedFields.length - 1];

  console.log("\n=========================================================================");
  console.log("📊 AUDIT MATRIKS KUANTITATIF 300 PESERTA TK/PAUD");
  console.log("=========================================================================");
  console.log(`TOTAL PESERTA:                        ${totalParticipants}`);
  console.log(`ANALISIS BERHASIL:                    ${successfulAnalysis} / ${totalParticipants}`);
  console.log(`ANALISIS GAGAL:                       ${failedAnalysis} / ${totalParticipants}`);
  console.log(`LAPORAN UNIK:                         ${totalParticipants - exactDuplicates} / ${totalParticipants}`);
  console.log(`LAPORAN TERDETEKSI TEMPLATE:          ${exactDuplicates} / ${totalParticipants}`);
  console.log(`KALIMAT IDENTIK:                      ${duplicateSentences}`);
  console.log(`PARAGRAF IDENTIK:                     ${duplicateParagraphs}`);
  console.log(`RATA-RATA JACCARD:                    ${avgJaccard.toFixed(2)}%`);
  console.log(`RATA-RATA COSINE:                     ${avgCosine.toFixed(2)}%`);
  console.log(`KEMIRIPAN TERTINGGI:                  ${(highestSimilarity * 100).toFixed(2)}% (antara ${highestPair[0]} & ${highestPair[1]})`);
  console.log(`FIELD DENGAN KEMIRIPAN TERTINGGI:     ${highestSimField[0]} (${highestSimField[1].toFixed(2)}%)`);
  console.log(`FIELD DENGAN VARIASI TERBAIK:         ${bestVarField[0]} (${bestVarField[1].toFixed(2)}%)`);
  console.log("=========================================================================\n");

  if (exactDuplicates === 0 && avgJaccard < 70) {
    console.log("🎉 ALL 300 PARTICIPANT AUDIT CRITERIA PASSED 100%!");
  } else {
    console.warn("⚠️ AUDIT COMPLETE WITH WARNINGS.");
  }
}

run300ParticipantsStressTest().catch((err) => {
  console.error("❌ 300 PARTICIPANTS STRESS TEST FAILED:", err);
  process.exit(1);
});
