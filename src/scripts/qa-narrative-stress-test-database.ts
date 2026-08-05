import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

function tokenize(text: string): string[] {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function getNGrams(tokens: string[], n: number = 1): Set<string> {
  const nGrams = new Set<string>();
  for (let i = 0; i <= tokens.length - n; i++) {
    nGrams.add(tokens.slice(i, i + n).join(" "));
  }
  return nGrams;
}

function calculateJaccard(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  if (tokens1.length === 0 && tokens2.length === 0) return 1.0;
  if (tokens1.length === 0 || tokens2.length === 0) return 0.0;

  const set1 = getNGrams(tokens1, 1);
  const set2 = getNGrams(tokens2, 1);

  let intersectionCount = 0;
  for (const item of set1) {
    if (set2.has(item)) intersectionCount++;
  }

  const unionSize = set1.size + set2.size - intersectionCount;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

function calculateCosine(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  if (tokens1.length === 0 && tokens2.length === 0) return 1.0;
  if (tokens1.length === 0 || tokens2.length === 0) return 0.0;

  const tf1: Record<string, number> = {};
  const tf2: Record<string, number> = {};
  const vocab = new Set<string>();

  for (const t of tokens1) {
    tf1[t] = (tf1[t] || 0) + 1;
    vocab.add(t);
  }
  for (const t of tokens2) {
    tf2[t] = (tf2[t] || 0) + 1;
    vocab.add(t);
  }

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (const word of vocab) {
    const v1 = tf1[word] || 0;
    const v2 = tf2[word] || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

function findDuplicateSentences(texts: string[]): { sentence: string; count: number }[] {
  const sentenceMap = new Map<string, number>();

  for (const text of texts) {
    const sentences = String(text || "")
      .split(/[.!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    for (const s of sentences) {
      const norm = s.toLowerCase();
      sentenceMap.set(norm, (sentenceMap.get(norm) || 0) + 1);
    }
  }

  const duplicates: { sentence: string; count: number }[] = [];
  for (const [sentence, count] of sentenceMap.entries()) {
    if (count > 1) {
      duplicates.push({ sentence, count });
    }
  }
  return duplicates.sort((a, b) => b.count - a.count);
}

function normalizeFieldValue(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    return val
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join(" ");
  }
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

async function runQANarrativeStressTestDatabase() {
  const artifactsDir = "C:\\Users\\AZAM\\.gemini\\antigravity-ide\\brain\\0a38a485-06d3-4265-8749-75d2c9e7ce9a";
  console.log("=====================================================");
  console.log("🚀 AUDITING ALL PRODUCTION SMA AI GENERATED ASSESSMENTS");
  console.log("=====================================================\n");

  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();

  const records = await page.evaluate(async () => {
    const PROD_URL = "https://lqzicsebjjzhdsduqdcf.supabase.co";
    const PROD_KEY = "sb_publishable_pu4E46tx3jk_u55S6-vFDg_Bggu_6fv";
    const headers = { "apikey": PROD_KEY, "Authorization": `Bearer ${PROD_KEY}` };

    const aRes = await fetch(`${PROD_URL}/rest/v1/assessments?select=*&limit=100`, { headers });
    const assessments = await aRes.json();

    if (!Array.isArray(assessments)) return [];

    return assessments.map((a: any) => ({
      id: a.id,
      education_level: a.education_level,
      created_at: a.created_at,
      content: a.answers || {},
    }));
  });

  await browser.close();

  console.log(`✓ Retrieved ${records.length} Production Assessments from Supabase.`);

  const targetFields = [
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

  const fieldSimilarityReport: Record<string, { avgJaccard: number; avgCosine: number; maxJaccard: number; maxCosine: number; exceedsTarget: boolean }> = {};

  for (const field of targetFields) {
    let totalJaccard = 0;
    let totalCosine = 0;
    let maxJaccard = 0;
    let maxCosine = 0;
    let pairCount = 0;

    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        const text1 = normalizeFieldValue(records[i].content?.[field]);
        const text2 = normalizeFieldValue(records[j].content?.[field]);

        const jaccard = calculateJaccard(text1, text2);
        const cosine = calculateCosine(text1, text2);

        totalJaccard += jaccard;
        totalCosine += cosine;
        if (jaccard > maxJaccard) maxJaccard = jaccard;
        if (cosine > maxCosine) maxCosine = cosine;
        pairCount++;
      }
    }

    const avgJaccard = pairCount > 0 ? (totalJaccard / pairCount) * 100 : 0;
    const avgCosine = pairCount > 0 ? (totalCosine / pairCount) * 100 : 0;
    const exceedsTarget = avgJaccard > 20 || avgCosine > 20;

    fieldSimilarityReport[field] = {
      avgJaccard: Number(avgJaccard.toFixed(2)),
      avgCosine: Number(avgCosine.toFixed(2)),
      maxJaccard: Number((maxJaccard * 100).toFixed(2)),
      maxCosine: Number((maxCosine * 100).toFixed(2)),
      exceedsTarget,
    };
  }

  const allNarratives: string[] = [];
  for (const res of records) {
    for (const field of targetFields) {
      allNarratives.push(normalizeFieldValue(res.content?.[field]));
    }
  }
  const duplicates = findDuplicateSentences(allNarratives);

  console.table(fieldSimilarityReport);

  const reportPath = path.join(artifactsDir, "qa_narrative_stress_test_audit.json");
  fs.writeFileSync(reportPath, JSON.stringify({ fieldSimilarityReport, duplicates, recordsCount: records.length }, null, 2));

  console.log(`\n🎉 DATABASE AI NARRATIVE AUDIT COMPLETE! Saved to: ${reportPath}`);
}

runQANarrativeStressTestDatabase().catch(console.error);
