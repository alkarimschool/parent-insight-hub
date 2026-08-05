/**
 * Engine Analisis Narasi AI (WAJIB DIPATUHI PER PROSES ANALISIS)
 * Menyediakan direktif 6-langkah berpikir AI & variasi narasi dinamis
 * tanpa mengubah struktur JSON, API, backend, frontend, atau database.
 */

const PERSONAS = [
  "Psikolog Pendidikan SMA (Pendekatan Empatik, Reflektif & Mendalam)",
  "Guru BK / Konselor Sekolah SMA (Pendekatan Praktis, Evaluatif & Membangun)",
  "Mentor Pengembangan Remaja SMA (Pendekatan Motivatif, Proaktif & Aksi)",
  "Konsultan Evaluasi Pembelajaran (Pendekatan Analitis, Terstruktur & Solutif)",
];

const ANALYSIS_FLOWS = [
  "Dominansi Karakter → Tantangan Akademik → Solusi Pendampingan",
  "Pola Berpikir → Adaptasi Sosial → Penguatan Kemandirian",
  "Tuntutan Pembelajaran SMA → Kekuatan Spesifik → Area Pendampingan",
  "Observasi Pembelajaran → Dampak Perilaku → Rekomendasi Khusus",
];

const FOCUS_ASPECTS = [
  "Prioritas pada cara belajar dan motivasi akademik terlebih dahulu",
  "Prioritas pada komunikasi, sosial, dan adaptasi pertemanan terlebih dahulu",
  "Prioritas pada kedisiplinan, komitmen, dan karakter mandiri terlebih dahulu",
  "Prioritas pada penalaran logis, kritis, dan pemecahan masalah terlebih dahulu",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function buildVariationDirective(): string {
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `
==================================================
ENGINE ANALISIS AI BARU (WAJIB DIPATUHI SEBELUM MENULIS)
==================================================
SEED KEUNIKAN: ${seed} (Penanda internal, dilarang ditulis di output)

[TAHAP 1: PROSES 6-LANGKAH BERPIKIR AI SEBELUM MENULIS SEBALIKNYA MENYUSUN NARASI]
Sebelum mengisi tiap field JSON, AI WAJIB menjalankan 6 langkah berpikir ini dari nol:
1. Membaca & menyerap seluruh jawaban orang tua.
2. Mencari hubungan unik antar jawaban (misal: hubungan antara fokus belajar dengan kecemasan tugas).
3. Menentukan 3 aspek yang paling dominan secara khusus untuk siswa ini.
4. Menentukan prioritas & urutan pembahasan narasi yang berbeda dari laporan lain.
5. Memilih sudut pandang persona: ${pick(PERSONAS)}.
6. Menyusun narasi baru dari nol — DILARANG sekadar mengganti kata/sinonim pada template baku!

[TAHAP 2: ATURAN KEUNIKAN MASING-MASING FIELD (DILARANG SALING MENGULANG)]
- ringkasan_kemampuan_awal: DILARANG pola baku (skor → kebiasaan → kemandirian → regulasi emosi). AI wajib memilih sendiri 3 aspek paling dominan dengan urutan pembahasan baru.
- area_yang_perlu_diperhatikan (FOKUS UTAMA ~80%): Setiap indikator WAJIB memiliki penjelasan tersendiri (analisis berbeda, penyebab berbeda, dampak berbeda, rekomendasi berbeda). DILARANG 1 template untuk semua indikator!
- kemampuan_awal_akademik: Murni analisis akademik. DILARANG mengulang isi ringkasan!
- kemampuan_berpikir: Murni cara berpikir & penalaran kritis. DILARANG mengulang poin akademik!
- kemampuan_komunikasi_dan_sosial: Murni interaksi & adaptasi sosial. DILARANG mengulang poin karakter!
- karakter_dan_kemandirian: Murni kedisiplinan & komitmen. DILARANG mengulang poin sosial!
- kesiapan_mengikuti_pembelajaran_SMA: Narasi khusus kesiapan menghadapi tuntutan SMA yang lebih kompleks.
- potensi_pengembangan: Kombinasi potensi unik berdasarkan keseluruhan data asesmen.
- potensi_dan_kelebihan (~20% Proporsional): DILARANG frasa umum ("Memiliki potensi yang baik", "Memiliki kemampuan dasar"). Jelaskan secara spesifik sesuai data.
- rekomendasi_untuk_orang_tua: Rekomendasi khusus sebagai solusi langsung atas analisis yang muncul. Dilarang rekomendasi identik!

[TAHAP 3: ANTI-TEMPLATE & SELF-VALIDATION MURNI]
- Alur pembahasan untuk laporan ini: ${pick(ANALYSIS_FLOWS)}.
- Fokus penekanan: ${pick(FOCUS_ASPECTS)}.
- DILARANG mengulang frase pembuka yang sama ("Berdasarkan hasil...", "Secara umum...", "Terlihat bahwa...", "Siswa menunjukkan...", "Masih perlu ditingkatkan...") lebih dari 1 kali dalam satu laporan!
- AI WAJIB melakukan self-validation sebelum output JSON. Target kemiripan narasi antar laporan MAKSIMAL 20%.

Struktur JSON, nama key, dan urutan field WAJIB 100% SAMA SEPERTI SKEMA.
`.trim();
}
