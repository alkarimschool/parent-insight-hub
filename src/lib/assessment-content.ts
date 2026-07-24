export type EducationLevel = "TK" | "SD" | "SMP" | "SMA" | "SMK";

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
    badge: "Laporan Assessment Perkembangan Anak Usia Dini",
    title: "Assessment Perkembangan Anak Usia Dini",
    description: "Hasil analisis perkembangan anak usia dini sebagai panduan stimulasi, kesiapan sekolah, dan kemampuan akademik awal.",
    summaryTitle: "1. Ringkasan Assessment Perkembangan Anak Usia Dini",
    introText: "Hasil analisis perkembangan anak usia dini sebagai panduan stimulasi, kesiapan sekolah, dan kemampuan akademik awal.",
    reportTitle: "Laporan Assessment Perkembangan Anak Usia Dini",
    metadataTitle: "Laporan Assessment Perkembangan Anak Usia Dini",
    metadataDescription: "Hasil analisis perkembangan anak usia dini sebagai panduan stimulasi, kesiapan sekolah, dan kemampuan akademik awal.",
    fullName: "Pendidikan Anak Usia Dini (TK / PAUD)",
    shortName: "TK",
    icon: "👶",
    sections: {
      s1: "1. Ringkasan Assessment Perkembangan Anak Usia Dini",
      s2: "2. Kelebihan Anak Usia Dini",
      s3: "3. Area Perkembangan yang Perlu Ditingkatkan",
      s4: "4. Kemampuan Akademik Awal & Calistung TK",
      s5: "5. Kemampuan Interaksi Sosial",
      s6: "6. Pengelolaan Emosional Anak",
      s7: "7. Pembentukan Karakter Usia Dini",
      s8: "8. Potensi Tumbuh Kembang Anak",
      s9: "9. Minat dan Eksplorasi Anak",
      s10: "10. Hal yang Perlu Diberikan Perhatian Orang Tua",
      s11: "11. Rekomendasi Kegiatan & Treatment di Rumah",
      s12: "12. Rekomendasi Stimulasi Calistung & Kesiapan Sekolah",
      s13: "13. Kesimpulan Kesiapan Sekolah Usia Dini",
    },
  },
  SD: {
    badge: "Laporan Assessment Sekolah Dasar",
    title: "Assessment Sekolah Dasar",
    description: "Hasil analisis kemampuan akademik dan perkembangan peserta didik Sekolah Dasar sebagai dasar penyusunan strategi pembelajaran yang tepat.",
    summaryTitle: "1. Ringkasan Assessment Sekolah Dasar",
    introText: "Hasil analisis kemampuan akademik dan perkembangan peserta didik Sekolah Dasar sebagai dasar penyusunan strategi pembelajaran yang tepat.",
    reportTitle: "Laporan Assessment Sekolah Dasar",
    metadataTitle: "Laporan Assessment Sekolah Dasar",
    metadataDescription: "Hasil analisis kemampuan akademik dan perkembangan peserta didik Sekolah Dasar sebagai dasar penyusunan strategi pembelajaran yang tepat.",
    fullName: "Sekolah Dasar (SD)",
    shortName: "SD",
    icon: "📘",
    sections: {
      s1: "1. Ringkasan Assessment Sekolah Dasar",
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
    badge: "Laporan Assessment Sekolah Menengah Pertama",
    title: "Assessment Sekolah Menengah Pertama",
    description: "Hasil analisis kemampuan akademik dan profil belajar peserta didik Sekolah Menengah Pertama.",
    summaryTitle: "1. Ringkasan Assessment Sekolah Menengah Pertama",
    introText: "Hasil analisis kemampuan akademik dan profil belajar peserta didik Sekolah Menengah Pertama.",
    reportTitle: "Laporan Assessment Sekolah Menengah Pertama",
    metadataTitle: "Laporan Assessment Sekolah Menengah Pertama",
    metadataDescription: "Hasil analisis kemampuan akademik dan profil belajar peserta didik Sekolah Menengah Pertama.",
    fullName: "Sekolah Menengah Pertama (SMP)",
    shortName: "SMP",
    icon: "📗",
    sections: {
      s1: "1. Ringkasan Assessment Sekolah Menengah Pertama",
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
    badge: "Laporan Assessment Sekolah Menengah Atas",
    title: "Assessment Sekolah Menengah Atas",
    description: "Hasil analisis kemampuan akademik, minat, bakat, dan kesiapan studi lanjut peserta didik Sekolah Menengah Atas.",
    summaryTitle: "1. Ringkasan Assessment Sekolah Menengah Atas",
    introText: "Hasil analisis kemampuan akademik, minat, bakat, dan kesiapan studi lanjut peserta didik Sekolah Menengah Atas.",
    reportTitle: "Laporan Assessment Sekolah Menengah Atas",
    metadataTitle: "Laporan Assessment Sekolah Menengah Atas",
    metadataDescription: "Hasil analisis kemampuan akademik, minat, bakat, dan kesiapan studi lanjut peserta didik Sekolah Menengah Atas.",
    fullName: "Sekolah Menengah Atas (SMA)",
    shortName: "SMA",
    icon: "🎓",
    sections: {
      s1: "1. Ringkasan Assessment Sekolah Menengah Atas",
      s2: "2. Kelebihan & Kompetensi Utama Siswa SMA",
      s3: "3. Area Kesiapan Akademik yang Perlu Dioptimalkan",
      s4: "4. Kemampuan Analitis & Kesiapan Perguruan Tinggi",
      s5: "5. Kemampuan Kolaborasi & Kepemimpinan Sosial",
      s6: "6. Pengelolaan Stres & Kedewasaan Emosional",
      s7: "7. Karakter Mandiri & Integritas Akademik",
      s8: "8. Potensi Riset & Pemecahan Masalah Kompleks",
      s9: "9. Minat Bakat & Orientasi Jurusan Kuliah",
      s10: "10. Hal yang Perlu Menjadi Perhatian Pertumbuhan Siswa",
      s11: "11. Rekomendasi Treatment & Strategi Pengembangan Diri",
      s12: "12. Rekomendasi Strategi Kuliah & Dunia Karier",
      s13: "13. Kesimpulan Kesiapan Perguruan Tinggi & Masa Depan",
    },
  },
  SMK: {
    badge: "Laporan Assessment Sekolah Menengah Kejuruan",
    title: "Assessment Sekolah Menengah Kejuruan",
    description: "Hasil analisis kompetensi, minat, dan kesiapan karier peserta didik Sekolah Menengah Kejuruan.",
    summaryTitle: "1. Ringkasan Assessment Sekolah Menengah Kejuruan",
    introText: "Hasil analisis kompetensi, minat, dan kesiapan karier peserta didik Sekolah Menengah Kejuruan.",
    reportTitle: "Laporan Assessment Sekolah Menengah Kejuruan",
    metadataTitle: "Laporan Assessment Sekolah Menengah Kejuruan",
    metadataDescription: "Hasil analisis kompetensi, minat, dan kesiapan karier peserta didik Sekolah Menengah Kejuruan.",
    fullName: "Sekolah Menengah Kejuruan (SMK)",
    shortName: "SMK",
    icon: "🛠️",
    sections: {
      s1: "1. Ringkasan Assessment Sekolah Menengah Kejuruan",
      s2: "2. Kelebihan & Keahlian Vokasional Siswa SMK",
      s3: "3. Area Kompetensi Praktis yang Perlu Ditingkatkan",
      s4: "4. Kesiapan Vokasional & Keahlian Praktis SMK",
      s5: "5. Kemampuan Kerja Sama Tim & Komunikasi Industri",
      s6: "6. Ketahanan Kerja & Kedewasaan Mental (Work Resilience)",
      s7: "7. Etika Kerja, Disiplin, & Penerapan K3",
      s8: "8. Potensi Keahlian & Inovasi Industri",
      s9: "9. Minat Keahlian & Wirausaha Kejuruan",
      s10: "10. Hal yang Perlu Diperhatikan dalam Persiapan PKL/Kerja",
      s11: "11. Rekomendasi Development & Sertifikasi Industri",
      s12: "12. Rekomendasi Pengembangan Kompetensi & Dunia Kerja",
      s13: "13. Kesimpulan Kesiapan Kerja & Karir Vokasi",
    },
  },
};

export function getAssessmentContent(jenjang?: string | null): AssessmentContent {
  const raw = (jenjang?.trim() || "TK").toUpperCase();
  const normalized = (["TK", "SD", "SMP", "SMA", "SMK"].includes(raw) ? raw : "TK") as EducationLevel;
  const data = ASSESSMENT_CONTENT_MAP[normalized] || ASSESSMENT_CONTENT_MAP.TK;

  return {
    ...data,
    getHeader: (childName?: string) => `${data.title} ${childName ? `Ananda ${childName}` : ""}`.trim(),
    getMetaTitle: (childName?: string) => `${data.badge}${childName ? ` - ${childName}` : ""}`.trim(),
  };
}
