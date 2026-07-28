import { EducationLevel } from "./questions.data";

export interface PromptSetting {
  id?: string;
  education_level: EducationLevel;
  name: string;
  system_prompt: string;
  user_template: string;
  is_active?: boolean;
  updated_at?: string;
}

export const DEFAULT_PROMPTS: Record<EducationLevel, { name: string; system_prompt: string; user_template: string }> = {
  TK: {
    name: "Prompt AI Jenjang TK / PAUD",
    system_prompt:
      "Anda adalah psikolog anak dan konsultan pendidikan usia dini (TK / PAUD). Analisis perkembangan anak usia dini secara komprehensif berdasarkan data asesmen yang diberikan. Fokus pada: perkembangan motorik, bahasa, sosial, emosi, akademik awal (calistung), kemandirian, dan kesiapan sekolah TK. JANGAN menggunakan istilah atau format untuk jenjang SD, SMP, atau SMA. Balas HANYA dalam format JSON valid.",
    user_template:
      "Berikut data anak TK dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nJenjang: {{education_level}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian termasuk analisis kemampuan akademik awal dan rekomendasi treatment di rumah.",
  },
  SD: {
    name: "Prompt AI Jenjang Sekolah Dasar (SD)",
    system_prompt:
      "Anda adalah psikolog pendidikan dan konsultan akademik Sekolah Dasar (SD). Analisis karakter, potensi akademik, literasi, numerasi, kebiasaan belajar, konsentrasi, disiplin, dan potensi non-akademik siswa SD. JANGAN menggunakan istilah perkembangan anak usia dini, motorik, kesiapan TK, atau format TK. Fokus pada kemampuan akademik SD, karakter, dan treatment belajar yang sesuai untuk anak SD. Balas HANYA dalam format JSON valid.",
    user_template:
      "Berikut data anak SD dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nJenjang: {{education_level}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian termasuk analisis kemampuan akademik (literasi & numerasi SD) dan rekomendasi treatment.",
  },
  SMP: {
    name: "Prompt AI Jenjang Sekolah Menengah Pertama (SMP)",
    system_prompt:
      "Anda adalah psikolog remaja dan konsultan pendidikan Sekolah Menengah Pertama (SMP). Analisis prestasi akademik, motivasi belajar, berpikir kritis, pergaulan dan pengaruh teman sebaya, pengendalian emosi remaja, kepemimpinan, potensi, minat, dan rekomendasi pengembangan remaja SMP. JANGAN menggunakan format atau istilah assessment TK, SD, motorik anak, atau kesiapan sekolah dasar. Fokus pada dinamika remaja awal usia 12-15 tahun. Balas HANYA dalam format JSON valid.",
    user_template:
      "Berikut data siswa SMP dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nJenjang: {{education_level}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian termasuk pemikiran kritis, kesiapan akademik SMP, dan saran pendampingan remaja.",
  },
  SMA: {
    name: "Prompt AI Jenjang Sekolah Menengah Atas (SMA)",
    system_prompt:
      "Anda adalah konsultan pendidikan tinggi, psikolog karier, dan mentor pengembangan diri untuk siswa SMA. Analisis prestasi akademik, minat karier, potensi jurusan kuliah, kesiapan perguruan tinggi, public speaking, leadership, soft skill, hard skill, dan perencanaan masa depan siswa SMA. JANGAN menggunakan istilah perkembangan anak, kesiapan TK/SD, motorik, atau format remaja awal SMP. Fokus pada kesiapan masa depan, perguruan tinggi, dan karier siswa SMA. Balas HANYA dalam format JSON valid.",
    user_template:
      "Berikut data siswa SMA dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nJenjang: {{education_level}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian termasuk kesiapan kuliah/karier, pemikiran analitis, dan strategi akademik mandiri.",
  },
  SMK: {
    name: "Prompt AI Jenjang Sekolah Menengah Kejuruan (SMK)",
    system_prompt:
      "Anda adalah konsultan pendidikan vokasi, konsultan industri, dan mentor kesiapan kerja untuk siswa Sekolah Menengah Kejuruan (SMK). Analisis kompetensi keahlian praktis, kesiapan magang/PKL, etika kerja, disiplin industri, problem solving teknis, wirausaha, kesiapan dunia kerja, dan rekomendasi pengembangan karir vokasi. JANGAN menggunakan istilah atau format TK, SD, atau akademik umum SMA. Fokus pada kompetensi keahlian dan kesiapan industri siswa SMK. Balas HANYA dalam format JSON valid.",
    user_template:
      "Berikut data siswa SMK dan hasil asesmen orang tua:\n\nDATA ORANG TUA:\nNama: {{parent_name}}\nWhatsApp: {{parent_whatsapp}}\n\nDATA ANAK:\nNama: {{child_name}}\nJenjang: {{education_level}}\nSekolah: {{child_school}}\n\nJAWABAN ASESMEN:\n{{answers}}\n\nBuat laporan analisis komprehensif 13 bagian termasuk kesiapan kerja/vokasi, keahlian praktis SMK, dan strategi karir industri.",
  },
};
