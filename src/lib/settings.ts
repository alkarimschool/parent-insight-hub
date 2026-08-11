import { supabase } from "@/integrations/supabase/client";

export interface WebsiteSettingsData {
  site_name: string;
  logo_text: string;
  contact_email: string;
  contact_whatsapp: string;
  copyright: string;
}

export const DEFAULT_WEBSITE_DATA: WebsiteSettingsData = {
  site_name: "Parent Awareness Assessment",
  logo_text: "PAA",
  contact_email: "support@sdalamalkarim.sch.id",
  contact_whatsapp: "6281234567890",
  copyright: "© 2026 Parent Awareness Assessment. All rights reserved.",
};

export async function fetchWebsite(): Promise<WebsiteSettingsData> {
  try {
    const { data } = await supabase.from("website_settings").select("data").eq("id", 1).maybeSingle();
    const raw = (data?.data as any) ?? null;
    if (!raw) return DEFAULT_WEBSITE_DATA;
    return { ...DEFAULT_WEBSITE_DATA, ...(raw?.data ?? raw) };
  } catch {
    return DEFAULT_WEBSITE_DATA;
  }
}

export interface HomepageSettingsData {
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  why_title: string;
  why_subtitle: string;
  why_items: { icon: string; title: string; desc: string }[];
  benefits_title: string;
  benefits_subtitle: string;
  benefits_items: { icon: string; title: string; desc: string }[];
  how_title: string;
  how_subtitle: string;
  how_items: { step: string; title: string; desc: string }[];
  faq_title: string;
  faq_subtitle: string;
  faq_items: { q: string; a: string }[];
  cta_title: string;
  cta_subtitle: string;
  cta_btn_text: string;
  footer_tagline: string;
}

export const DEFAULT_HOMEPAGE_DATA: HomepageSettingsData = {
  hero_badge: "Parent Awareness Assessment",
  hero_title: "Kenali Potensi & Kebutuhan Perkembangan Anak Anda",
  hero_subtitle:
    "Asesmen mandiri berbasis AI untuk membantu orang tua memahami aspek akademik, cara berpikir, komunikasi-sosial, serta karakter anak secara personal.",
  hero_cta: "Mulai Assessment Gratis",
  why_title: "Mengapa Perlu Asesmen Pengenalan Anak?",
  why_subtitle: "Setiap anak memiliki keunikan dan kecepatan berkembang yang berbeda.",
  why_items: [
    { icon: "Sparkles", title: "Rekomendasi Personal AI", desc: "Mendapatkan analisis mendalam dan strategi pendampingan yang disesuaikan." },
    { icon: "ShieldCheck", title: "Praktis & Terstruktur", desc: "Cukup jawab pertanyaan observasi harian tanpa tes berlebihan untuk anak." },
    { icon: "Brain", title: "Fondasi Masa Depan", desc: "Membantu mengarahkan pola belajar, kemandirian, dan minat secara tepat sejak dini." },
  ],
  benefits_title: "Manfaat yang Anda Dapatkan",
  benefits_subtitle: "Panduan praktis untuk mendampingi tumbuh kembang anak di rumah dan sekolah.",
  benefits_items: [
    { icon: "CheckCircle2", title: "Laporan Pemetaan Awal", desc: "Gambaran menyeluruh aspek akademik, sosial, dan emosional anak." },
    { icon: "BookOpen", title: "Strategi Belajar", desc: "Tips konkret membantu anak fokus dan mandiri mengelola waktu." },
    { icon: "Users", title: "Komunikasi Orang Tua", desc: "Saran praktis membangun hubungan hangat dan komunikasi terbuka." },
    { icon: "Target", title: "Pengembangan Potensi", desc: "Identifikasi kelebihan dan area yang memerlukan pembinaan." },
  ],
  how_title: "Cara Kerja Asesmen",
  how_subtitle: "Hanya 3 langkah mudah untuk mendapatkan laporan analisis anak.",
  how_items: [
    { step: "1", title: "Pilih Jenjang", desc: "Tentukan jenjang pendidikan anak (TK, SD, SMP, SMA)." },
    { step: "2", title: "Jawab Pertanyaan", desc: "Isi pertanyaan observasi sesuai kondisi harian anak." },
    { step: "3", title: "Terima Laporan", desc: "Dapatkan analisis AI lengkap dan rekomendasi pendampingan." },
  ],
  faq_title: "Pertanyaan Sering Diajukan",
  faq_subtitle: "Informasi penting seputar pelaksanaan asesmen.",
  faq_items: [
    { q: "Berapa lama waktu yang dibutuhkan?", a: "Sekitar 5–10 menit untuk menyelesaikan 40 pertanyaan." },
    { q: "Apakah asesmen ini aman dan rahasia?", a: "Ya, seluruh data disimpan dengan aman di Supabase Database dan hanya diakses oleh admin/orang tua." },
    { q: "Siapa yang sebaiknya mengisi asesmen?", a: "Orang tua atau wali yang mendampingi aktivitas harian anak di rumah." },
  ],
  cta_title: "Siap memahami perkembangan anak Anda?",
  cta_subtitle: "Selesaikan asesmen dalam 5–10 menit dan dapatkan laporan personal.",
  cta_btn_text: "Mulai Assessment",
  footer_tagline: "Platform Pemetaan & Analisis Pembentukan Karakter Anak Berbasis AI",
};

export async function fetchHomepage(): Promise<HomepageSettingsData> {
  try {
    const { data } = await supabase.from("website_settings").select("data").eq("id", 1).maybeSingle();
    const raw = (data?.data as any) ?? null;
    const hp = raw?.homepage || raw?.data?.homepage;
    if (!hp || typeof hp !== "object") return DEFAULT_HOMEPAGE_DATA;
    return { ...DEFAULT_HOMEPAGE_DATA, ...hp };
  } catch {
    return DEFAULT_HOMEPAGE_DATA;
  }
}

export interface LevelCardSetting {
  title: string;
  desc: string;
  badge_text: string;
  badge_color: string;
  badge_show: boolean;
  icon: string;
  features: string[];
  info_message?: string;
  button_text: string;
  is_locked?: boolean;
}

export type AssessmentCardSettingsData = Record<string, LevelCardSetting>;

export const DEFAULT_CARD_SETTINGS_DATA: AssessmentCardSettingsData = {
  TK: {
    title: "Pendidikan Anak Usia Dini (TK/PAUD)",
    desc: "Hasil analisis kesiapan sekolah, motorik, sosial-emosional, dan pengenalan calistung awal anak usia 3–6 tahun.",
    badge_text: "Usia 3–6 Tahun",
    badge_color: "cyan",
    badge_show: true,
    icon: "Baby",
    features: [
      "Calistung & Angka Awal",
      "Kesiapan Sekolah",
      "Kemampuan Motorik & Emosi"
    ],
    info_message: "Asesmen ini dirancang untuk membantu orang tua mengidentifikasi kesiapan awal masuk sekolah.",
    button_text: "Pilih Jenjang TK",
    is_locked: false,
  },
  SD: {
    title: "Sekolah Dasar (SD)",
    desc: "Hasil analisis kemampuan akademik, literasi, numerasi, kebiasaan belajar, serta disiplin anak usia 7–12 tahun.",
    badge_text: "Usia 7–12 Tahun",
    badge_color: "blue",
    badge_show: true,
    icon: "BookOpen",
    features: [
      "Literasi & Numerasi SD",
      "Kebiasaan & Fokus Belajar",
      "Disiplin & Kontrol Gadget"
    ],
    info_message: "Asesmen ini mengukur fondasi kemampuan belajar mandiri dan karakter anak.",
    button_text: "Pilih Jenjang SD",
    is_locked: false,
  },
  SMP: {
    title: "Sekolah Menengah Pertama (SMP)",
    desc: "Hasil analisis potensi akademik, penalaran kritis, dinamika pergaulan remaja, serta manajemen emosi usia 13–15 tahun.",
    badge_text: "Usia 13–15 Tahun",
    badge_color: "indigo",
    badge_show: true,
    icon: "School",
    features: [
      "Berpikir Kritis & Problem Solving",
      "Pergaulan & Media Sosial",
      "Motivasi & Target Belajar"
    ],
    info_message: "Asesmen ini membantu orang tua memahami tantangan dan dinamika emosi usia remaja SMP.",
    button_text: "Pilih Jenjang SMP",
    is_locked: false,
  },
  SMA: {
    title: "Sekolah Menengah Atas (SMA)",
    desc: "Pemetaan kemampuan awal akademik, berpikir analitis, motivasi, komunikasi, karakter, serta kesiapan pembelajaran SMA.",
    badge_text: "Usia 16–18 Tahun",
    badge_color: "sky",
    badge_show: true,
    icon: "GraduationCap",
    features: [
      "Kesiapan Pembelajaran SMA",
      "Kemampuan Berpikir & Analitis",
      "Komunikasi & Kemandirian Siswa"
    ],
    info_message: "Asesmen ini dirancang untuk memetakan kondisi awal siswa saat menempuh pembelajaran di jenjang SMA.",
    button_text: "Pilih Jenjang SMA",
    is_locked: false,
  },
};

export async function fetchAssessmentCardSettings(): Promise<AssessmentCardSettingsData> {
  try {
    const [{ data: wsData }, { data: lockData }] = await Promise.all([
      supabase.from("website_settings").select("data").eq("id", 1).maybeSingle(),
      supabase.from("assessment_locks").select("education_level, is_locked"),
    ]);

    const raw = (wsData?.data as any) ?? null;
    const cards = raw?.assessment_cards || raw?.data?.assessment_cards || null;

    if (!cards) {
      try {
        const { getAssessmentCardSettingsServer } = await import("./admin.server");
        return await getAssessmentCardSettingsServer();
      } catch {
        // Fallback to default if serverFn import is restricted
      }
    }

    const validCards = cards || {};

    const lockMap: Record<string, boolean> = {};
    if (lockData && Array.isArray(lockData)) {
      for (const row of lockData as any[]) {
        const lvl = String(row.education_level || row.level || "").toUpperCase();
        if (lvl) lockMap[lvl] = !!row.is_locked;
      }
    }

    return {
      TK: { ...DEFAULT_CARD_SETTINGS_DATA.TK, ...(validCards.TK || {}), is_locked: lockMap["TK"] ?? validCards.TK?.is_locked ?? false },
      SD: { ...DEFAULT_CARD_SETTINGS_DATA.SD, ...(validCards.SD || {}), is_locked: lockMap["SD"] ?? validCards.SD?.is_locked ?? false },
      SMP: { ...DEFAULT_CARD_SETTINGS_DATA.SMP, ...(validCards.SMP || {}), is_locked: lockMap["SMP"] ?? validCards.SMP?.is_locked ?? false },
      SMA: { ...DEFAULT_CARD_SETTINGS_DATA.SMA, ...(validCards.SMA || {}), is_locked: lockMap["SMA"] ?? validCards.SMA?.is_locked ?? false },
    };
  } catch (err) {
    console.warn("[fetchAssessmentCardSettings] Error:", err);
    try {
      const { getAssessmentCardSettingsServer } = await import("./admin.server");
      return await getAssessmentCardSettingsServer();
    } catch {
      return DEFAULT_CARD_SETTINGS_DATA;
    }
  }
}