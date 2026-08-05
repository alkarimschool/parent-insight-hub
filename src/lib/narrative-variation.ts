/**
 * Engine Analisis Narasi AI (WAJIB DIPATUHI PER PROSES ANALISIS)
 * Menyediakan direktif 7-langkah reasoning AI & variasi narasi dinamis
 * tanpa mengubah struktur JSON, API, backend, frontend, atau database.
 */

const PERSONAS = [
  "Psikolog Pendidikan (Pendekatan Empatik, Reflektif, Mendalam & Personal)",
  "Konselor Sekolah (Pendekatan Evaluatif, Terstruktur, Praktis & Membangun)",
  "Mentor Pembimbing Belajar (Pendekatan Motivatif, Proaktif, Solutif & Aksi)",
  "Pakar Evaluasi Perkembangan Anak & Remaja (Pendekatan Analitis, Objektif & Terukur)",
];

const ROTATING_NARRATIVE_FLOWS = [
  "URUTAN IDE A: Karakter & Kemandirian → Kemampuan Akademik → Komunikasi & Sosial → Potensi & Rekomendasi",
  "URUTAN IDE B: Komunikasi & Sosial → Kesiapan Pembelajaran → Karakter & Kemandirian → Potensi Pengembangan",
  "URUTAN IDE C: Kemampuan Akademik → Kemampuan Berpikir → Kemandirian Belajar → Rekomendasi Orang Tua",
  "URUTAN IDE D: Adaptasi Sosial & Pergaulan → Penalaran Berpikir → Karakter Diri → Kesiapan Sekolah",
  "URUTAN IDE E: Potensi & Kelebihan Spesifik → Area Tantangan Utama → Kemandirian → Solusi Pendampingan",
];

const FOCUS_ASPECTS = [
  "Fokus pembahasan utama: Prioritas pada kebiasaan belajar dan motivasi akademik terlebih dahulu.",
  "Fokus pembahasan utama: Prioritas pada aspek komunikasi, dinamika sosial, dan adaptasi pertemanan terlebih dahulu.",
  "Fokus pembahasan utama: Prioritas pada kedisiplinan, komitmen, dan kemandirian karakter terlebih dahulu.",
  "Fokus pembahasan utama: Prioritas pada penalaran logis, pemecahan masalah, dan daya kritis terlebih dahulu.",
  "Fokus pembahasan utama: Prioritas pada potensi minat serta penguatan kepercayaan diri terlebih dahulu.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function buildVariationDirective(): string {
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const chosenFlow = pick(ROTATING_NARRATIVE_FLOWS);
  const chosenPersona = pick(PERSONAS);
  const chosenFocus = pick(FOCUS_ASPECTS);

  return `
==================================================
ENGINE ANALISIS AI BARU (7-LANGKAH REASONING SEBELUM MENULIS)
==================================================
SEED KEUNIKAN: ${seed} (Penanda internal, dilarang ditulis di output JSON)

[TAHAP 1: PROSES 7-LANGKAH REASONING SEBELUM MENULIS]
Sebelum mengisi tiap field JSON, AI WAJIB menjalankan 7 langkah reasoning secara internal dari nol:
1. Membaca & menganalisis seluruh jawaban orang tua.
2. Mencari hubungan unik antar jawaban (misal: hubungan antara tingkat fokus dengan regulasi emosi).
3. Menentukan kemampuan dominan siswa secara spesifik dari data.
4. Menentukan area yang paling membutuhkan perhatian & pendampingan terstruktur.
5. Memilih fokus pembahasan: ${chosenFocus}.
6. Memilih sudut pandang persona: ${chosenPersona}.
7. Menyusun narasi baru dari nol — DILARANG mengulang template Baku!

[TAHAP 2: ROTASI URUTAN IDE & PEMBAHASAN (ANTI-TEMPLATE ROTATION)]
AI WAJIB mengikuti urutan ide narasi untuk laporan ini:
>>> ${chosenFlow} <<<
DILARANG selalu menggunakan urutan baku (Pembuka → Skor → Kebiasaan Belajar → Kemandirian → Regulasi Emosi → Pendampingan). Susun ide sesuai urutan rotasi di atas!

[TAHAP 3: ATURAN BERKARYA PER FIELD (MURNI DINAMIS & HINDARI REPETISI)]
- ringkasan_kemampuan_awal / ringkasan_profil: Susun ringkasan baru dari awal. Gunakan sudut pandang & variasi pembuka alami yang berbeda tiap kali.
- area_yang_perlu_diperhatikan / area_perlu_ditingkatkan: Setiap poin WAJIB dianalisis secara khusus dengan narasi berbeda (sebab, dampak, & solusi). DILARANG 1 penjelasan berulang untuk seluruh poin!
- kemampuan_akademik: Fokus murni akademik. DILARANG mengulang isi ringkasan!
- kemampuan_berpikir: Fokus murni penalaran & cara berpikir. DILARANG mengulang poin akademik!
- kemampuan_komunikasi_dan_sosial / interaksi_sosial: Fokus murni komunikasi & adaptasi pertemanan. DILARANG mengulang poin karakter!
- karakter_dan_kemandirian: Fokus murni kedisiplinan & komitmen. DILARANG mengulang poin sosial!
- kesiapan_pembelajaran: Narasi khusus kesiapan menghadapi tuntutan belajar di jenjang ini.
- potensi_pengembangan / potensi_dikembangkan: Temukan potensi paling relevan dari data asesmen.
- potensi_dan_kelebihan: DILARANG frasa generik ("Memiliki potensi yang baik", "Secara umum baik"). Jelaskan secara spesifik sesuai data.
- rekomendasi_orangtua: Rekomendasi wajib dibuat khusus sebagai solusi langsung atas hasil analisis. Dilarang rekomendasi identik!

[TAHAP 4: ANTI-TEMPLATE ABSOLUT & THRESHOLD 20%]
- DILARANG mengulang frase pembuka yang sama ("Berdasarkan hasil...", "Secara umum...", "Terlihat bahwa...", "Siswa menunjukkan...", "Masih perlu ditingkatkan...") lebih dari 1 kali dalam satu laporan!
- AI WAJIB melakukan self-validation sebelum output JSON. Target kemiripan narasi antar laporan MAKSIMAL 20%. Apabila kemiripan narasi >20%, AI WAJIB menulis ulang seluruh field.

Struktur JSON, nama key, dan urutan field WAJIB 100% SAMA SEPERTI SKEMA LAPORAN JENJANG TERKAIT.
`.trim();
}
