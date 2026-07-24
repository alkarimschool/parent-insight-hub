export type EducationLevel = "TK" | "SD" | "SMP" | "SMA" | "SMK";

export interface AssessmentContent {
  badge: string;
  title: string;
  description: string;
  fullName: string;
  shortName: EducationLevel;
  icon: string;
  sec4Title: string;
  sec12Title: string;
  getHeader: (childName?: string) => string;
  getMetaTitle: (childName?: string) => string;
}

export const ASSESSMENT_CONTENT_MAP: Record<EducationLevel, Omit<AssessmentContent, "getHeader" | "getMetaTitle">> = {
  TK: {
    badge: "Laporan Assessment Perkembangan Anak Usia Dini",
    title: "Assessment Perkembangan Anak Usia Dini",
    description: "Hasil analisis perkembangan anak usia dini sebagai panduan stimulasi, kesiapan sekolah, dan kemampuan akademik awal.",
    fullName: "Pendidikan Anak Usia Dini (TK / PAUD)",
    shortName: "TK",
    icon: "👶",
    sec4Title: "4. Kemampuan Akademik Awal & Calistung TK",
    sec12Title: "12. Rekomendasi Stimulasi Calistung & Kesiapan Sekolah",
  },
  SD: {
    badge: "Laporan Assessment Sekolah Dasar",
    title: "Assessment Sekolah Dasar",
    description: "Hasil analisis kemampuan akademik dan perkembangan peserta didik Sekolah Dasar sebagai dasar penyusunan strategi pembelajaran yang tepat.",
    fullName: "Sekolah Dasar (SD)",
    shortName: "SD",
    icon: "📘",
    sec4Title: "4. Kemampuan Akademik (Literasi & Numerasi SD)",
    sec12Title: "12. Rekomendasi Penguatan Literasi & Numerasi SD",
  },
  SMP: {
    badge: "Laporan Assessment Sekolah Menengah Pertama",
    title: "Assessment Sekolah Menengah Pertama",
    description: "Hasil analisis kemampuan akademik dan profil belajar peserta didik Sekolah Menengah Pertama sebagai dasar pengembangan potensi dan strategi belajar.",
    fullName: "Sekolah Menengah Pertama (SMP)",
    shortName: "SMP",
    icon: "📗",
    sec4Title: "4. Kemampuan Akademik & Berpikir Kritis SMP",
    sec12Title: "12. Rekomendasi Pengembangan Akademik & Remaja SMP",
  },
  SMA: {
    badge: "Laporan Assessment Sekolah Menengah Atas",
    title: "Assessment Sekolah Menengah Atas",
    description: "Hasil analisis kemampuan akademik, minat, dan kesiapan peserta didik Sekolah Menengah Atas untuk mendukung perencanaan studi lanjutan dan pengembangan potensi.",
    fullName: "Sekolah Menengah Atas (SMA)",
    shortName: "SMA",
    icon: "🎓",
    sec4Title: "4. Kemampuan Analitis & Kesiapan Perguruan Tinggi",
    sec12Title: "12. Rekomendasi Strategi Kuliah & Dunia Karier",
  },
  SMK: {
    badge: "Laporan Assessment Sekolah Menengah Kejuruan",
    title: "Assessment Sekolah Menengah Kejuruan",
    description: "Hasil analisis kompetensi, minat, dan kesiapan peserta didik Sekolah Menengah Kejuruan sebagai dasar pengembangan kompetensi sesuai bidang keahlian.",
    fullName: "Sekolah Menengah Kejuruan (SMK)",
    shortName: "SMK",
    icon: "🛠️",
    sec4Title: "4. Kesiapan Vokasional & Keahlian Praktis SMK",
    sec12Title: "12. Rekomendasi Pengembangan Kompetensi & Dunia Kerja",
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
