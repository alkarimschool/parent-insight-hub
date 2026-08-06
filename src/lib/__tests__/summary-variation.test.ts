import { describe, expect, it } from "vitest";
import { buildSummaryFieldDirective, SUMMARY_FOCUS_POINTS, SUMMARY_OPENERS } from "../narrative-variation";
import { pairwiseSimilarity, textSimilarity } from "../similarity";
import { callLovableAiJson } from "../ai.server";

const SIMILARITY_THRESHOLD = 20; // persen

/** Ambil bagian direktif yang benar-benar bervariasi (pembuka, fokus, jumlah kalimat). */
function extractVariablePart(directive: string): string {
  const opener = directive.match(/Gunakan pembuka bernuansa: "([^"]+)"/)?.[1] ?? "";
  const focus = directive.match(/Mulai pembahasan dari sudut fokus: (.+?), lalu kaitkan dengan (.+?)\./);
  const count = directive.match(/Tulis TEPAT (\d+) kalimat/)?.[1] ?? "";
  return `${opener}|${focus?.[1] ?? ""}|${focus?.[2] ?? ""}|${count}`;
}

describe("similarity util", () => {
  it("mendeteksi teks identik sebagai 100% mirip", () => {
    const t = "Secara umum siswa menunjukkan kesiapan belajar yang baik di rumah";
    expect(textSimilarity(t, t)).toBe(100);
  });

  it("mendeteksi teks berbeda sebagai kemiripan rendah", () => {
    const sim = textSimilarity(
      "Secara umum siswa menunjukkan kesiapan belajar yang baik",
      "Regulasi emosi anak berkembang seiring pendampingan orang tua",
    );
    expect(sim).toBeLessThan(SIMILARITY_THRESHOLD);
  });
});

describe("Ringkasan Kemampuan Awal — variasi direktif saat skor & jawaban identik", () => {
  const SAMPLES = 40;
  const directives = Array.from({ length: SAMPLES }, () => buildSummaryFieldDirective());
  const variableParts = directives.map(extractVariablePart);

  it("menghasilkan kombinasi pembuka/fokus yang beragam", () => {
    const unique = new Set(variableParts);
    expect(unique.size).toBeGreaterThanOrEqual(Math.floor(SAMPLES * 0.6));
  });

  it("tidak mengunci satu pembuka atau satu fokus saja", () => {
    const openers = new Set(variableParts.map((v) => v.split("|")[0]));
    const focuses = new Set(variableParts.flatMap((v) => [v.split("|")[1], v.split("|")[2]]));
    expect(openers.size).toBeGreaterThanOrEqual(Math.min(5, SUMMARY_OPENERS.length));
    expect(focuses.size).toBeGreaterThanOrEqual(Math.min(5, SUMMARY_FOCUS_POINTS.length));
  });

  it("kemiripan rata-rata antar bagian variatif di bawah ambang 20%", () => {
    const stats = pairwiseSimilarity(variableParts);
    expect(stats.avg).toBeLessThan(SIMILARITY_THRESHOLD);
  });

  it("selalu meminta 3-5 kalimat dan aturan anti-template", () => {
    for (const d of directives) {
      const count = Number(d.match(/Tulis TEPAT (\d+) kalimat/)?.[1]);
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(5);
      expect(d).toContain("WAJIB berbeda");
    }
  });
});

// Uji end-to-end opsional: memanggil AI dengan jawaban & skor identik beberapa kali,
// lalu memastikan ringkasan yang dihasilkan berbeda (<20% kemiripan).
// Aktifkan dengan: RUN_AI_SIMILARITY_TEST=1
const runLive = process.env.RUN_AI_SIMILARITY_TEST === "1";

describe.skipIf(!runLive)("Ringkasan Kemampuan Awal — uji AI nyata (jawaban identik)", () => {
  it(
    "menghasilkan ringkasan berbeda untuk input identik",
    async () => {
      const identicalAnswers = [
        "Fokus belajar: sering bertahan lebih dari 20 menit (skor 4)",
        "Komunikasi: mampu menyampaikan pendapat dengan runtut (skor 4)",
        "Kemandirian: menyiapkan perlengkapan sekolah sendiri (skor 3)",
        "Regulasi emosi: cukup stabil saat menghadapi kesulitan (skor 3)",
      ].join("\n");

      const summaries: string[] = [];
      for (let i = 0; i < 3; i++) {
        const { text } = await callLovableAiJson({
          model: "google/gemini-2.5-flash",
          systemPrompt: `Kamu psikolog pendidikan. Balas HANYA JSON {"ringkasan_kemampuan_awal": "..."}\n\n${buildSummaryFieldDirective()}`,
          userPrompt: `Nama siswa: Andi. Jenjang: SMA.\nJawaban orang tua:\n${identicalAnswers}`,
          temperature: 0.95,
          maxTokens: 800,
        });
        summaries.push(String(JSON.parse(text)?.ringkasan_kemampuan_awal ?? ""));
      }

      const stats = pairwiseSimilarity(summaries);
      console.info(`[AI SUMMARY SIMILARITY] avg=${stats.avg.toFixed(2)}% max=${stats.max.toFixed(2)}%`);
      expect(stats.max).toBeLessThan(SIMILARITY_THRESHOLD);
    },
    120_000,
  );
});