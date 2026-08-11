export type EducationLevel = "TK" | "SD" | "SMP" | "SMA";

export interface SectionTitles {
  s1: string;
  s2: string;
  s3: string;
  s4: string;
  s5: string;
  s6: string;
  s7: string;
  s8: string;
  s9: string;
  s10: string;
  s11: string;
  s12: string;
  s13: string;
}

export interface AssessmentLevelConfig {
  badge: string;
  title: string;
  description: string;
  summaryTitle: string;
  introText: string;
  reportTitle: string;
  metadataTitle: string;
  metadataDescription: string;
  fullName: string;
  shortName: EducationLevel;
  icon: string;
  sections: SectionTitles;
}

export interface AssessmentContent extends AssessmentLevelConfig {
  getHeader: (childName?: string) => string;
  getMetaTitle: (childName?: string) => string;
}

export const ASSESSMENT_CONTENT_MAP: Record<EducationLevel, AssessmentLevelConfig> = {
  TK: {
    badge: "Pemetaan Awal Tumbuh Kembang Anak TK",
    title: "Pemetaan Awal Tumbuh Kembang Anak TK",
    description: "Gambaran awal tumbuh kembang anak usia dini berdasarkan observasi orang tua sebagai panduan stimulasi di rumah.",
    summaryTitle: "1. Kesimpulan Umum Perkembangan",
    introText: "Gambaran awal tumbuh kembang anak usia dini berdasarkan observasi orang tua sebagai panduan stimulasi di rumah.",
    reportTitle: "Pemetaan Awal Tumbuh Kembang Anak TK",
    metadataTitle: "Pemetaan Awal Tumbuh Kembang Anak TK",
    metadataDescription: "Gambaran awal tumbuh kembang anak usia dini berdasarkan observasi orang tua sebagai panduan stimulasi di rumah.",
    fullName: "Pendidikan Anak Usia Dini (TK / PAUD)",
    shortName: "TK",
    icon: "\u{1F476}",
    sections: {
      s1: "1. Kesimpulan Umum Perkembangan",
      s2: "2. Area yang Perlu Diperhatikan",
      s3: "3. Motorik (Kasar & Halus)",
      s4: "4. Bahasa & Kognitif",
      s5: "5. Sosial-Emosional & Kemandirian",
      s6: "6. Potensi & Kelebihan Anak",
      s7: "7. Rekomendasi Stimulasi untuk Orang Tua",
      s8: "7. Rekomendasi Stimulasi untuk Orang Tua",
      s9: "7. Rekomendasi Stimulasi untuk Orang Tua",
      s10: "2. Area yang Perlu Diperhatikan",
      s11: "7. Rekomendasi Stimulasi untuk Orang Tua",
      s12: "7. Rekomendasi Stimulasi untuk Orang Tua",
      s13: "1. Kesimpulan Umum Perkembangan",
    },
  },
  SD: {
    badge: "Laporan Assessment Potensi Akademik & Karakter SD",
    title: "Assessment Potensi Akademik & Karakter SD",
    description: "Hasil analisis kemampuan akademik, literasi, numerasi, dan karakter peserta didik Sekolah Dasar sebagai dasar strategi belajar.",
    summaryTitle: "1. Ringkasan Assessment Potensi Akademik & Karakter SD",
    introText: "Hasil analisis kemampuan akademik, literasi, numerasi, dan karakter peserta didik Sekolah Dasar sebagai dasar strategi belajar.",
    reportTitle: "Laporan Assessment Potensi Akademik & Karakter SD",
    metadataTitle: "Laporan Assessment Potensi Akademik & Karakter SD",
    metadataDescription: "Hasil analisis kemampuan akademik, literasi, numerasi, dan karakter peserta didik Sekolah Dasar sebagai dasar strategi belajar.",
    fullName: "Sekolah Dasar (SD)",
    shortName: "SD",
    icon: "📘",
    sections: {
      s1: "1. Ringkasan Assessment Potensi Akademik & Karakter SD",
      s2: "2. Kelebihan Pembelajaran Siswa SD",
      s3: "3. Area Belajar yang Perlu Ditingkatkan",
      s4: "4. Kemampuan Akademik (Literasi & Numerasi SD)",
      s5: "5. Kemampuan Interaksi Sosial di Sekolah",
      s6: "6. Pengelolaan Emosi & Fokus Belajar",
      s7: "7. Pembentukan Karakter & Disiplin Belajar",
      s8: "8. Potensi Akademik & Non-Akademik",
      s9: "9. Minat dan Bakat Belajar Siswa SD",
      s10: "10. Hal yang Perlu Menjadi Perhatian Orang Tua",
      s11: "11. Rekomendasi Pendampingan & Treatment Rumah",
      s12: "12. Rekomendasi Penguatan Literasi & Numerasi SD",
      s13: "13. Kesimpulan Perkembangan Belajar Sekolah Dasar",
    },
  },
  SMP: {
    badge: "Laporan Assessment Potensi Belajar SMP",
    title: "Assessment Potensi Belajar SMP",
    description: "Hasil analisis prestasi akademik, motivasi belajar, berpikir kritis, dan pergaulan positif peserta didik Sekolah Menengah Pertama.",
    summaryTitle: "1. Ringkasan Assessment Potensi Belajar SMP",
    introText: "Hasil analisis prestasi akademik, motivasi belajar, berpikir kritis, dan pergaulan positif peserta didik Sekolah Menengah Pertama.",
    reportTitle: "Laporan Assessment Potensi Belajar SMP",
    metadataTitle: "Laporan Assessment Potensi Belajar SMP",
    metadataDescription: "Hasil analisis prestasi akademik, motivasi belajar, berpikir kritis, dan pergaulan positif peserta didik Sekolah Menengah Pertama.",
    fullName: "Sekolah Menengah Pertama (SMP)",
    shortName: "SMP",
    icon: "📗",
    sections: {
      s1: "1. Ringkasan Assessment Potensi Belajar SMP",
      s2: "2. Kelebihan & Kekuatan Remaja SMP",
      s3: "3. Area Keterampilan yang Perlu Ditingkatkan",
      s4: "4. Kemampuan Akademik & Berpikir Kritis SMP",
      s5: "5. Kemampuan Sosial & Pergaulan Remaja",
      s6: "6. Pengelolaan Emosi & Regulasi Diri",
      s7: "7. Pembentukan Karakter & Tanggung Jawab",
      s8: "8. Potensi Leadership & Problem Solving",
      s9: "9. Minat Eksplorasi Bidang Studi & Hobi",
      s10: "10. Hal yang Perlu Diperhatikan Orang Tua",
      s11: "11. Rekomendasi Treatment & Pendampingan Remaja",
      s12: "12. Rekomendasi Pengembangan Akademik & Remaja SMP",
      s13: "13. Kesimpulan Perkembangan Belajar Remaja SMP",
    },
  },
  SMA: {
    badge: "Laporan Pemetaan Kemampuan Awal Siswa SMA",
    title: "Pemetaan Kemampuan Awal Siswa SMA",
    description: "Hasil analisis pemetaan kondisi awal, potensi, karakter, dan area pendampingan siswa saat memasuki jenjang SMA berdasarkan observasi orang tua.",
    summaryTitle: "1. Ringkasan Kemampuan Awal",
    introText: "Hasil analisis pemetaan kondisi awal, potensi, karakter, dan area pendampingan siswa saat memasuki jenjang SMA berdasarkan observasi orang tua.",
    reportTitle: "Laporan Pemetaan Kemampuan Awal Siswa SMA",
    metadataTitle: "Laporan Pemetaan Kemampuan Awal Siswa SMA",
    metadataDescription: "Hasil analisis pemetaan kondisi awal, potensi, karakter, dan area pendampingan siswa saat memasuki jenjang SMA berdasarkan observasi orang tua.",
    fullName: "Sekolah Menengah Atas (SMA)",
    shortName: "SMA",
    icon: "🎓",
    sections: {
      s1: "1. Ringkasan Kemampuan Awal",
      s2: "2. Area yang Perlu Diperhatikan (Fokus Utama)",
      s3: "3. Kemampuan Awal Akademik",
      s4: "4. Kemampuan Berpikir",
      s5: "5. Kemampuan Komunikasi dan Sosial",
      s6: "6. Karakter dan Kemandirian",
      s7: "7. Kesiapan Mengikuti Pembelajaran SMA",
      s8: "8. Potensi Pengembangan",
      s9: "9. Potensi dan Kelebihan (Penguatan Singkat)",
      s10: "10. Rekomendasi untuk Orang Tua",
      s11: "11. Rekomendasi Tambahan Orang Tua",
      s12: "12. Catatan Pemetaan Pembelajaran SMA",
      s13: "13. Kesimpulan Pemetaan Kemampuan Awal SMA",
    },
  },
};

export function getAssessmentContent(jenjang?: string | null): AssessmentContent {
  const raw = (jenjang?.trim() || "TK").toUpperCase();
  const normalized = (["TK", "SD", "SMP", "SMA"].includes(raw) ? raw : "TK") as EducationLevel;
  const data = ASSESSMENT_CONTENT_MAP[normalized] || ASSESSMENT_CONTENT_MAP.TK;

  return {
    ...data,
    getHeader: (childName?: string) => `${data.title} ${childName ? `Ananda ${childName}` : ""}`.trim(),
    getMetaTitle: (childName?: string) => `${data.badge}${childName ? ` - ${childName}` : ""}`.trim(),
  };
}
