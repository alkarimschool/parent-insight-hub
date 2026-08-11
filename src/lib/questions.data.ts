export type EducationLevel = "TK" | "SD" | "SMP" | "SMA";

export function getEducationLevel(input: any): EducationLevel {
  if (!input) return "TK";

  if (typeof input === "string") {
    const str = input.trim().toUpperCase();
    if (["TK", "SD", "SMP", "SMA"].includes(str)) {
      return str as EducationLevel;
    }
  }

  if (typeof input === "object") {
    const directLvl = input.education_level || input.shortName || input.level || input.educationLevel;
    if (directLvl && ["TK", "SD", "SMP", "SMA"].includes(String(directLvl).trim().toUpperCase())) {
      return String(directLvl).trim().toUpperCase() as EducationLevel;
    }

    if (input.ai_result && typeof input.ai_result === "object") {
      const resLvl = (input.ai_result.shortName || input.ai_result.education_level || input.ai_result.level) as string;
      if (resLvl && ["TK", "SD", "SMP", "SMA"].includes(String(resLvl).trim().toUpperCase())) {
        return String(resLvl).trim().toUpperCase() as EducationLevel;
      }
    }

    if (input.content && typeof input.content === "object") {
      const cntLvl = (input.content.shortName || input.content.education_level || input.content.level) as string;
      if (cntLvl && ["TK", "SD", "SMP", "SMA"].includes(String(cntLvl).trim().toUpperCase())) {
        return String(cntLvl).trim().toUpperCase() as EducationLevel;
      }
    }

    if (input.assessment_title) {
      const t = String(input.assessment_title).toUpperCase();
      if (t.includes("SMA")) return "SMA";
      if (t.includes("SMP")) return "SMP";
      if (t.includes("SD")) return "SD";
      if (t.includes("TK")) return "TK";
    }

    if (input.ai_prompt) {
      const p = String(input.ai_prompt);
      if (p.includes("Sekolah Menengah Atas (SMA)") || p.includes("Jenjang: SMA") || p.includes("SMA")) return "SMA";
      if (p.includes("Sekolah Menengah Pertama (SMP)") || p.includes("Jenjang: SMP") || p.includes("SMP")) return "SMP";
      if (p.includes("Sekolah Dasar (SD)") || p.includes("Jenjang: SD") || p.includes("SD")) return "SD";
      if (p.includes("TK / PAUD") || p.includes("Jenjang: TK") || p.includes("TK")) return "TK";
    }
  }

  return "TK";
}

export interface QuestionOption {
  label: string;
  v: number;
}

export interface QuestionData {
  id: string;
  education_level: EducationLevel;
  category_name: string;
  text: string;
  order_index: number;
  type?: "scale" | "options" | "textarea";
  options?: QuestionOption[];
}

export const LEVEL_QUESTIONS: Record<EducationLevel, QuestionData[]> = {
  TK: [
    {
      id: "tk-q1",
      education_level: "TK",
      category_name: "Motorik Kasar",
      text: "Anak mampu berlari, berhenti, dan mengubah arah gerakan tanpa sering kehilangan keseimbangan.",
      order_index: 1,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q2",
      education_level: "TK",
      category_name: "Motorik Kasar",
      text: "Anak mampu melompat dengan kedua kaki dan melakukan gerakan sederhana sesuai contoh.",
      order_index: 2,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q3",
      education_level: "TK",
      category_name: "Motorik Kasar",
      text: "Anak mampu menaiki dan menuruni tangga dengan koordinasi gerakan yang cukup baik.",
      order_index: 3,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q4",
      education_level: "TK",
      category_name: "Motorik Kasar",
      text: "Anak mampu mengikuti permainan yang melibatkan berlari, melempar, menangkap, atau menendang bola.",
      order_index: 4,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q5",
      education_level: "TK",
      category_name: "Motorik Kasar",
      text: "Anak mampu mengoordinasikan gerakan tubuh dengan baik saat bermain atau melakukan aktivitas sehari-hari.",
      order_index: 5,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q6",
      education_level: "TK",
      category_name: "Motorik Halus",
      text: "Anak mampu menggunakan pensil atau krayon untuk menggambar atau membuat bentuk sederhana.",
      order_index: 6,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q7",
      education_level: "TK",
      category_name: "Motorik Halus",
      text: "Anak mampu meniru atau menggambar bentuk sederhana sesuai kemampuannya.",
      order_index: 7,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q8",
      education_level: "TK",
      category_name: "Motorik Halus",
      text: "Anak mampu menyusun balok, puzzle, atau permainan yang membutuhkan koordinasi tangan dan mata.",
      order_index: 8,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q9",
      education_level: "TK",
      category_name: "Motorik Halus",
      text: "Anak mampu menggunakan alat sederhana seperti sendok, gunting anak, atau alat permainan dengan cukup baik.",
      order_index: 9,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q10",
      education_level: "TK",
      category_name: "Motorik Halus",
      text: "Anak mampu melakukan kegiatan yang membutuhkan ketelitian tangan seperti meronce, melipat, atau menyusun benda kecil.",
      order_index: 10,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q11",
      education_level: "TK",
      category_name: "Bahasa & Komunikasi",
      text: "Anak mampu menyampaikan keinginan, kebutuhan, atau perasaannya melalui kata-kata yang dapat dipahami.",
      order_index: 11,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q12",
      education_level: "TK",
      category_name: "Bahasa & Komunikasi",
      text: "Anak mampu memahami dan mengikuti instruksi sederhana.",
      order_index: 12,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q13",
      education_level: "TK",
      category_name: "Bahasa & Komunikasi",
      text: "Anak mampu menjawab pertanyaan sederhana mengenai pengalaman atau kegiatan yang dilakukan.",
      order_index: 13,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q14",
      education_level: "TK",
      category_name: "Bahasa & Komunikasi",
      text: "Anak mampu menceritakan kembali pengalaman atau cerita sederhana menggunakan bahasanya sendiri.",
      order_index: 14,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q15",
      education_level: "TK",
      category_name: "Bahasa & Komunikasi",
      text: "Anak menunjukkan minat untuk berbicara, bertanya, dan berkomunikasi dengan orang di sekitarnya.",
      order_index: 15,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q16",
      education_level: "TK",
      category_name: "Kognitif",
      text: "Anak mampu mengenali konsep sederhana seperti warna, bentuk, ukuran, jumlah, atau posisi benda.",
      order_index: 16,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q17",
      education_level: "TK",
      category_name: "Kognitif",
      text: "Anak mampu mengelompokkan benda berdasarkan warna, bentuk, ukuran, jenis, atau karakteristik tertentu.",
      order_index: 17,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q18",
      education_level: "TK",
      category_name: "Kognitif",
      text: "Anak mampu mengingat dan menyampaikan kembali informasi sederhana yang baru dipelajari.",
      order_index: 18,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q19",
      education_level: "TK",
      category_name: "Kognitif",
      text: "Anak berusaha mencari cara atau solusi ketika menghadapi masalah sederhana.",
      order_index: 19,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q20",
      education_level: "TK",
      category_name: "Kognitif",
      text: "Anak menunjukkan rasa ingin tahu dan tertarik mengetahui alasan atau cara kerja sesuatu.",
      order_index: 20,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q21",
      education_level: "TK",
      category_name: "Sosial-Emosional",
      text: "Anak mampu bermain atau beraktivitas bersama anak lain tanpa selalu bergantung pada orang dewasa.",
      order_index: 21,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q22",
      education_level: "TK",
      category_name: "Sosial-Emosional",
      text: "Anak mulai mampu berbagi, bergantian, dan bekerja sama dengan anak lain.",
      order_index: 22,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q23",
      education_level: "TK",
      category_name: "Sosial-Emosional",
      text: "Anak mampu mengenali dan mengungkapkan perasaan seperti senang, sedih, marah, takut, atau kecewa.",
      order_index: 23,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q24",
      education_level: "TK",
      category_name: "Sosial-Emosional",
      text: "Anak mulai mampu menenangkan diri setelah mengalami kekecewaan.",
      order_index: 24,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q25",
      education_level: "TK",
      category_name: "Sosial-Emosional",
      text: "Anak mampu mengikuti aturan sederhana dalam permainan atau kegiatan sehari-hari.",
      order_index: 25,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q26",
      education_level: "TK",
      category_name: "Kemandirian & Kesiapan Belajar",
      text: "Anak mampu melakukan aktivitas perawatan diri sederhana sesuai kemampuannya.",
      order_index: 26,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q27",
      education_level: "TK",
      category_name: "Kemandirian & Kesiapan Belajar",
      text: "Anak mampu mempertahankan perhatian pada suatu kegiatan sesuai dengan karakter aktivitasnya.",
      order_index: 27,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q28",
      education_level: "TK",
      category_name: "Kemandirian & Kesiapan Belajar",
      text: "Anak mulai mampu menyelesaikan tugas sederhana tanpa selalu meminta bantuan orang dewasa.",
      order_index: 28,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q29",
      education_level: "TK",
      category_name: "Kemandirian & Kesiapan Belajar",
      text: "Anak mampu mengikuti rutinitas sederhana dalam kegiatan sehari-hari.",
      order_index: 29,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
    {
      id: "tk-q30",
      education_level: "TK",
      category_name: "Kemandirian & Kesiapan Belajar",
      text: "Anak menunjukkan kesiapan belajar melalui rasa ingin tahu, kemauan mencoba, dan kemampuan mengikuti kegiatan.",
      order_index: 30,
      type: "options",
      options: [
        { label: "Selalu", v: 5 },
        { label: "Sering", v: 4 },
        { label: "Kadang-kadang", v: 3 },
        { label: "Jarang", v: 2 },
        { label: "Belum", v: 1 },
      ],
    },
  ],

  SD: [
    { id: "sd-q1", education_level: "SD", category_name: "Karakter dan Disiplin", text: "Apakah anak terbiasa disiplin dalam waktu belajar dan merapikan jadwal/perlengkapan sekolahnya?", order_index: 1 },
    { id: "sd-q2", education_level: "SD", category_name: "Karakter dan Disiplin", text: "Apakah anak bertanggung jawab menyelesaikan tugas sekolah (PR) secara mandiri tanpa harus selalu ditagih?", order_index: 2 },
    { id: "sd-q3", education_level: "SD", category_name: "Kebiasaan Belajar", text: "Apakah anak memiliki kebiasaan belajar teratur di rumah tanpa perlu dipaksa?", order_index: 3 },
    { id: "sd-q4", education_level: "SD", category_name: "Kemampuan Akademik (Literasi)", text: "Apakah anak mampu membaca dengan lancar dan memahami isi cerita atau pelajaran seusianya?", order_index: 4 },
    { id: "sd-q5", education_level: "SD", category_name: "Kemampuan Akademik (Menulis)", text: "Apakah anak mampu menulis kalimat dengan rapi, jelas, dan tata bahasa dasar yang baik?", order_index: 5 },
    { id: "sd-q6", education_level: "SD", category_name: "Kemampuan Akademik (Numerasi)", text: "Apakah anak mampu melakukan perhitungan matematika dasar (penjumlahan, pengurangan, perkalian/pembagian sederhana) dengan baik?", order_index: 6 },
    { id: "sd-q7", education_level: "SD", category_name: "Kemampuan Akademik (Problem Solving)", text: "Apakah anak mampu menyelesaikan soal cerita matematika atau soal latihan pelajaran dengan pemahaman mandiri?", order_index: 7 },
    { id: "sd-q8", education_level: "SD", category_name: "Konsentrasi Belajar", text: "Apakah anak mampu fokus memperhatikan pelajaran atau saat mendengarkan penjelasan selama 20–30 menit?", order_index: 8 },
    { id: "sd-q9", education_level: "SD", category_name: "Kreativitas", text: "Apakah anak suka membuat karya seni, proyek sekolah, atau gagasan kreatif secara mandiri?", order_index: 9 },
    { id: "sd-q10", education_level: "SD", category_name: "Percaya Diri & Kepemimpinan", text: "Apakah anak berani tampil berbicara di depan kelas atau menjadi pemimpin kelompok bermain/belajar?", order_index: 10 },
    { id: "sd-q11", education_level: "SD", category_name: "Interaksi Sosial", text: "Apakah anak mudah berteman, bekerja sama dalam tim, serta menghargai perbedaan dengan teman sekolahnya?", order_index: 11 },
    { id: "sd-q12", education_level: "SD", category_name: "Penggunaan Gadget", text: "Apakah anak mampu membatasi waktu bermain gadget/game sesuai kesepakatan aturan rumah?", order_index: 12 },
    { id: "sd-q13", education_level: "SD", category_name: "Pengendalian Emosi", text: "Apakah anak mampu mengendalikan amarah atau kekecewaan saat mengalami kesulitan/kekalahan?", order_index: 13 },
    { id: "sd-q14", education_level: "SD", category_name: "Hubungan Keluarga", text: "Apakah anak bersikap terbuka menceritakan kegiatan dan pengalamannya di sekolah kepada orang tua?", order_index: 14 },
    { id: "sd-q15", education_level: "SD", category_name: "Evaluasi Perkembangan SD", text: "Menurut Anda, apakah pencapaian akademik dan karakter anak saat ini sudah sesuai dengan tingkat kelasnya di SD?", order_index: 15 },
  ],

  SMP: [
    { id: "smp-q1", education_level: "SMP", category_name: "Kemampuan Akademik", text: "Apakah anak mampu menguasai materi pelajaran SMP dan mempertahankan prestasi belajar yang baik?", order_index: 1 },
    { id: "smp-q2", education_level: "SMP", category_name: "Kebiasaan Belajar", text: "Apakah anak memiliki inisiatif sendiri untuk mempersiapkan ujian atau mempelajari materi sebelum diajarkan?", order_index: 2 },
    { id: "smp-q3", education_level: "SMP", category_name: "Kemampuan Berpikir Kritis", text: "Apakah anak mampu berpikir kritis, menganalisis masalah, dan memberikan argumen logis saat berdiskusi?", order_index: 3 },
    { id: "smp-q4", education_level: "SMP", category_name: "Problem Solving Akademik", text: "Apakah anak mampu menyelesaikan tugas proyek sekolah yang kompleks atau pemecahan masalah secara mandiri?", order_index: 4 },
    { id: "smp-q5", education_level: "SMP", category_name: "Motivasi Belajar", text: "Apakah anak memiliki motivasi dan target pribadi untuk meraih prestasi akademik yang lebih baik?", order_index: 5 },
    { id: "smp-q6", education_level: "SMP", category_name: "Manajemen Waktu & Gadget", text: "Apakah anak mampu mengatur waktu belajar dan membatasi pengaruh media sosial/game di ponselnya?", order_index: 6 },
    { id: "smp-q7", education_level: "SMP", category_name: "Pergaulan & Pengaruh Teman", text: "Apakah anak mampu memilih pergaulan yang positif dan tegas menolak tekanan negatif dari teman sebaya?", order_index: 7 },
    { id: "smp-q8", education_level: "SMP", category_name: "Disiplin & Tanggung Jawab", text: "Apakah anak disiplin mematuhi tata tertib sekolah dan bertanggung jawab atas konsekuensi pilihannya?", order_index: 8 },
    { id: "smp-q9", education_level: "SMP", category_name: "Kepemimpinan & Organisasi", text: "Apakah anak aktif atau mampu menunjukkan jiwa kepemimpinan dalam kegiatan ekstrakurikuler/organisasi?", order_index: 9 },
    { id: "smp-q10", education_level: "SMP", category_name: "Percaya Diri", text: "Apakah anak memiliki rasa percaya diri yang sehat dan mengenali potensi/kelebihan dirinya?", order_index: 10 },
    { id: "smp-q11", education_level: "SMP", category_name: "Manajemen Emosi Remaja", text: "Apakah anak mampu mengelola ketegangan, beban pikiran, atau emosi perubahan usia remaja secara bijak?", order_index: 11 },
    { id: "smp-q12", education_level: "SMP", category_name: "Hubungan dengan Orang Tua", text: "Apakah anak tetap bersikap sopan, komunikatif, dan menghormati bimbingan orang tua di rumah?", order_index: 12 },
    { id: "smp-q13", education_level: "SMP", category_name: "Potensi & Minat", text: "Apakah anak sudah menunjukkan minat kuat pada bidang studi tertentu (IPA, IPS, Bahasa, Seni, atau Teknologi)?", order_index: 13 },
    { id: "smp-q14", education_level: "SMP", category_name: "Minat Masa Depan", text: "Apakah anak mulai mendiskusikan cita-cita atau pilihan Sekolah Menengah (SMA) untuk masa depannya?", order_index: 14 },
    { id: "smp-q15", education_level: "SMP", category_name: "Evaluasi Perkembangan SMP", text: "Menurut Anda, apakah tingkat kemandirian dan kesiapan belajar anak sudah sesuai dengan tingkatannya di SMP?", order_index: 15 },
  ],

  SMA: [
    // A. Kemampuan Awal Akademik (8 Pertanyaan)
    { id: "sma-q1", education_level: "SMA", category_name: "Kemampuan Awal Akademik", text: "Anak saya mampu memahami materi pelajaran baru di sekolah dengan cepat dan tepat.", order_index: 1 },
    { id: "sma-q2", education_level: "SMA", category_name: "Kemampuan Awal Akademik", text: "Anak saya menunjukkan kecepatan belajar yang memadai untuk mengikuti ritme pelajaran.", order_index: 2 },
    { id: "sma-q3", education_level: "SMA", category_name: "Kemampuan Awal Akademik", text: "Anak saya memiliki rasa ingin tahu yang tinggi terhadap hal-hal baru atau pelajaran yang sedang dipelajari.", order_index: 3 },
    { id: "sma-q4", education_level: "SMA", category_name: "Kemampuan Awal Akademik", text: "Anak saya terbiasa belajar secara mandiri di rumah tanpa harus selalu diminta.", order_index: 4 },
    { id: "sma-q5", education_level: "SMA", category_name: "Kemampuan Awal Akademik", text: "Anak saya konsisten dalam menjaga jadwal dan kebiasaan belajar harian.", order_index: 5 },
    { id: "sma-q6", education_level: "SMA", category_name: "Kemampuan Awal Akademik", text: "Anak saya selalu menyelesaikan tugas sekolah atau pekerjaan rumah (PR) secara tuntas dan tepat waktu.", order_index: 6 },
    { id: "sma-q7", education_level: "SMA", category_name: "Kemampuan Awal Akademik", text: "Anak saya mampu memahami dan mengikuti instruksi atau petunjuk tugas dengan cermat.", order_index: 7 },
    { id: "sma-q8", education_level: "SMA", category_name: "Kemampuan Awal Akademik", text: "Anak saya siap dan percaya diri dalam mempelajari materi yang lebih kompleks atau abstrak.", order_index: 8 },

    // B. Motivasi dan Kebiasaan Belajar (6 Pertanyaan)
    { id: "sma-q9", education_level: "SMA", category_name: "Motivasi dan Kebiasaan Belajar", text: "Anak saya menunjukkan semangat dan antusiasme yang tinggi dalam kegiatan belajar harian.", order_index: 9 },
    { id: "sma-q10", education_level: "SMA", category_name: "Motivasi dan Kebiasaan Belajar", text: "Anak saya tekun dan tidak mudah menyerah ketika menemui soal atau materi pelajaran yang sulit.", order_index: 10 },
    { id: "sma-q11", education_level: "SMA", category_name: "Motivasi dan Kebiasaan Belajar", text: "Anak saya mampu mengatur dan mengelola waktu belajar, istirahat, hobi, dan aktivitas lain dengan seimbang.", order_index: 11 },
    { id: "sma-q12", education_level: "SMA", category_name: "Motivasi dan Kebiasaan Belajar", text: "Anak saya memiliki kebiasaan membaca buku, artikel, atau materi pengetahuan secara teratur.", order_index: 12 },
    { id: "sma-q13", education_level: "SMA", category_name: "Motivasi dan Kebiasaan Belajar", text: "Anak saya mampu menjaga fokus dan konsentrasi saat belajar tanpa mudah terdistraksi ponsel atau lingkungan.", order_index: 13 },
    { id: "sma-q14", education_level: "SMA", category_name: "Motivasi dan Kebiasaan Belajar", text: "Anak saya menyadari dan bertanggung jawab penuh atas proses serta hasil belajarnya sendiri.", order_index: 14 },

    // C. Kemampuan Berpikir (6 Pertanyaan)
    { id: "sma-q15", education_level: "SMA", category_name: "Kemampuan Berpikir", text: "Anak saya mampu menggunakan penalaran yang logis dalam memahami suatu permasalahan.", order_index: 15 },
    { id: "sma-q16", education_level: "SMA", category_name: "Kemampuan Berpikir", text: "Anak saya terbiasa berpikir kritis dan tidak menelan mentah-mentah informasi yang diterima.", order_index: 16 },
    { id: "sma-q17", education_level: "SMA", category_name: "Kemampuan Berpikir", text: "Anak saya mampu menganalisis informasi atau masalah rumit menjadi bagian-bagian yang lebih sederhana.", order_index: 17 },
    { id: "sma-q18", education_level: "SMA", category_name: "Kemampuan Berpikir", text: "Anak saya dapat menemukan alternatif solusi yang efektif saat menghadapi kendala atau tantangan.", order_index: 18 },
    { id: "sma-q19", education_level: "SMA", category_name: "Kemampuan Berpikir", text: "Anak saya mampu mengambil keputusan secara bijak setelah mempertimbangkan alasan dan alasannya.", order_index: 19 },
    { id: "sma-q20", education_level: "SMA", category_name: "Kemampuan Berpikir", text: "Anak saya mampu menghubungkan konsep pelajaran dengan situasi atau kejadian nyata di kehidupan sehari-hari.", order_index: 20 },

    // D. Komunikasi dan Sosial (5 Pertanyaan)
    { id: "sma-q21", education_level: "SMA", category_name: "Komunikasi dan Sosial", text: "Anak saya mampu menyampaikan pikiran, ide, atau perasaannya secara jelas dan sopan.", order_index: 21 },
    { id: "sma-q22", education_level: "SMA", category_name: "Komunikasi dan Sosial", text: "Anak saya berani menyampaikan pandangan atau bertanya di hadapan orang lain atau kelompok.", order_index: 22 },
    { id: "sma-q23", education_level: "SMA", category_name: "Komunikasi dan Sosial", text: "Anak saya mampu bekerja sama, berbagi peran, dan berkontribusi aktif dalam kegiatan kelompok.", order_index: 23 },
    { id: "sma-q24", education_level: "SMA", category_name: "Komunikasi dan Sosial", text: "Anak saya dapat beradaptasi dengan cepat saat memasuki lingkungan, suasana, atau kelompok baru.", order_index: 24 },
    { id: "sma-q25", education_level: "SMA", category_name: "Komunikasi dan Sosial", text: "Anak saya mampu menjalin hubungan pertemanan yang positif, sehat, dan saling menghargai.", order_index: 25 },

    // E. Karakter dan Kemandirian (6 Pertanyaan)
    { id: "sma-q26", education_level: "SMA", category_name: "Karakter dan Kemandirian", text: "Anak saya terbiasa disiplin dalam menaati aturan di rumah maupun di sekolah.", order_index: 26 },
    { id: "sma-q27", education_level: "SMA", category_name: "Karakter dan Kemandirian", text: "Anak saya siap menerima dan menanggung konsekuensi atas tindakan atau keputusan yang diambilnya.", order_index: 27 },
    { id: "sma-q28", education_level: "SMA", category_name: "Karakter dan Kemandirian", text: "Anak saya mengutamakan kejujuran dalam bertindak, berkata, maupun mengerjakan tugas-tugasnya.", order_index: 28 },
    { id: "sma-q29", education_level: "SMA", category_name: "Karakter dan Kemandirian", text: "Anak saya mampu mengendalikan emosi dengan baik saat menghadapi tekanan, kritik, atau kekecewaan.", order_index: 29 },
    { id: "sma-q30", education_level: "SMA", category_name: "Karakter dan Kemandirian", text: "Anak saya mandiri dalam menyiapkan kebutuhan sekolah dan mengurus keperluan pribadinya.", order_index: 30 },
    { id: "sma-q31", education_level: "SMA", category_name: "Karakter dan Kemandirian", text: "Anak saya konsisten dan memegang teguh janji atau komitmen yang telah disepakati bersama.", order_index: 31 },

    // F. Kesiapan Mengikuti Pembelajaran SMA (5 Pertanyaan)
    { id: "sma-q32", education_level: "SMA", category_name: "Kesiapan Mengikuti Pembelajaran SMA", text: "Anak saya menunjukkan kesiapan mental dan fisik untuk mengikuti tuntutan pembelajaran jenjang SMA.", order_index: 32 },
    { id: "sma-q33", education_level: "SMA", category_name: "Kesiapan Mengikuti Pembelajaran SMA", text: "Anak saya siap menghadapi peningkatan beban dan tingkat kesulitan pelajaran di SMA.", order_index: 33 },
    { id: "sma-q34", education_level: "SMA", category_name: "Kesiapan Mengikuti Pembelajaran SMA", text: "Anak saya siap mengemban peran dan tanggung jawab yang lebih besar sebagai siswa SMA.", order_index: 34 },
    { id: "sma-q35", education_level: "SMA", category_name: "Kesiapan Mengikuti Pembelajaran SMA", text: "Anak saya antusias mengikuti kegiatan sekolah untuk mengeksplorasi dan mengembangkan potensinya.", order_index: 35 },
    { id: "sma-q36", education_level: "SMA", category_name: "Kesiapan Mengikuti Pembelajaran SMA", text: "Anak saya mulai memikirkan dan mendiskusikan cita-cita serta rencana jurusan masa depannya.", order_index: 36 },

    // G. Potensi Pengembangan (4 Pertanyaan)
    { id: "sma-q37", education_level: "SMA", category_name: "Potensi Pengembangan", text: "Anak saya memiliki potensi akademik yang kuat dan siap dikembangkan lebih jauh.", order_index: 37 },
    { id: "sma-q38", education_level: "SMA", category_name: "Potensi Pengembangan", text: "Anak saya menunjukkan potensi kepemimpinan dan kemampuan mengarahkan atau memimpin kawan.", order_index: 38 },
    { id: "sma-q39", education_level: "SMA", category_name: "Potensi Pengembangan", text: "Anak saya memiliki potensi komunikasi yang baik dalam menyampaikan presentasi atau pandangan.", order_index: 39 },
    { id: "sma-q40", education_level: "SMA", category_name: "Potensi Pengembangan", text: "Anak saya terbuka menerima masukan dan memiliki kemauan tinggi untuk terus mengembangkan diri.", order_index: 40 },
  ],
};
