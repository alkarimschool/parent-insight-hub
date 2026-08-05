/**
 * Aturan penulisan hasil analisis (WAJIB) — menjaga agar setiap laporan
 * bersifat unik, personal, dan tidak terasa seperti template.
 * Direktif ini di-append ke system prompt & user prompt setiap kali analisis dijalankan.
 */

const OPENERS = [
  "Berdasarkan informasi yang diberikan oleh orang tua",
  "Dari hasil observasi orang tua",
  "Mengacu pada jawaban yang diberikan",
  "Berdasarkan pola jawaban selama asesmen",
  "Hasil pengisian instrumen menunjukkan bahwa",
  "Berdasarkan keseluruhan data yang diperoleh",
  "Dari hasil evaluasi awal",
  "Berdasarkan informasi yang berhasil dihimpun",
  "Berdasarkan hasil pemetaan kemampuan awal",
  "Dari hasil identifikasi awal",
];

const FLOWS = [
  "Kondisi → Dampak → Saran",
  "Potensi → Kondisi → Dampak",
  "Kondisi → Potensi → Pendampingan",
  "Observasi → Penjelasan → Rekomendasi",
];

const FOCUS = [
  "aspek akademik lebih dahulu",
  "aspek komunikasi dan sosial lebih dahulu",
  "aspek kemandirian dan karakter lebih dahulu",
  "aspek kebiasaan belajar lebih dahulu",
  "aspek emosi dan motivasi lebih dahulu",
];

const TONES = [
  "hangat dan reflektif",
  "profesional dan lugas",
  "naratif dan mendalam",
  "suportif dan membangun",
  "analitis namun mudah dipahami",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

export function buildVariationDirective(): string {
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const openers = shuffle(OPENERS).slice(0, 4);

  return `
==================================================
ATURAN PENULISAN HASIL ANALISIS (WAJIB DIPATUHI)
==================================================
SEED KEUNIKAN LAPORAN: ${seed}
(Seed ini hanya penanda internal untuk memastikan narasi berbeda. JANGAN pernah menuliskan seed di dalam laporan.)

1. LAPORAN DINAMIS & PERSONAL
   Walaupun dua orang tua memberikan jawaban yang identik, narasi WAJIB berbeda.
   Perbedaan hanya pada CARA PENYAMPAIAN, bukan pada kesimpulan.
   Laporan harus terasa ditulis manual oleh seorang konselor pendidikan.

2. VARIASI BAHASA
   Variasikan pembuka, transisi, penjelasan, dan penutup.
   Untuk laporan ini, gunakan salah satu gaya pembuka berikut (pilih secara alami, jangan diulang):
   - ${openers.join("\n   - ")}
   DILARANG menggunakan frasa pembuka yang sama lebih dari satu kali dalam satu laporan.

3. VARIASI PENYAMPAIAN
   Alur penyampaian untuk laporan ini: ${pick(FLOWS)}.

4. VARIASI KOSAKATA
   Gunakan sinonim secara alami, contoh:
   - "cukup baik" → memadai / berkembang dengan baik / menunjukkan kemampuan yang positif / relatif baik / telah terbentuk dengan cukup baik / berada pada kategori yang sesuai
   - "perlu ditingkatkan" → perlu mendapatkan perhatian / masih memerlukan pendampingan / masih dapat dikembangkan / menjadi prioritas pembinaan / layak menjadi fokus penguatan / memerlukan latihan yang lebih konsisten

5. VARIASI PANJANG KALIMAT & PARAGRAF
   Campurkan kalimat pendek, sedang, dan panjang.
   Jumlah kalimat tiap bagian tidak boleh seragam (ada yang 2, 4, atau 5 kalimat).

6. VARIASI FOKUS
   Untuk laporan ini, soroti ${pick(FOCUS)} — tetapi tetap sesuai data jawaban orang tua.
   Nada penulisan: ${pick(TONES)}.

7. HINDARI TEMPLATE
   DILARANG mengulang paragraf, susunan kalimat, atau menghasilkan laporan identik.
   DILARANG menggunakan bahasa generik atau kesan mengisi template.

8. KONSISTENSI (TIDAK BOLEH DILANGGAR)
   Isi laporan harus tetap konsisten dengan jawaban orang tua.
   Dilarang menambah informasi yang tidak didukung data.
   Dilarang mengubah kesimpulan hanya demi variasi bahasa. Variasi hanya pada GAYA PENULISAN.

9. TARGET
   Kemiripan kalimat antar laporan harus di bawah 30%.
   Struktur JSON output tetap WAJIB sama persis seperti yang diminta.
`.trim();
}
