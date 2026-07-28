export type EducationLevel = "TK" | "SD" | "SMP" | "SMA" | "SMK";

export function getEducationLevel(input: any): EducationLevel {
  if (!input) return "TK";

  if (typeof input === "string") {
    const str = input.trim().toUpperCase();
    if (["TK", "SD", "SMP", "SMA", "SMK"].includes(str)) {
      return str as EducationLevel;
    }
  }

  if (typeof input === "object") {
    const directLvl = input.education_level || input.shortName || input.level || input.educationLevel;
    if (directLvl && ["TK", "SD", "SMP", "SMA", "SMK"].includes(String(directLvl).trim().toUpperCase())) {
      return String(directLvl).trim().toUpperCase() as EducationLevel;
    }

    if (input.ai_result && typeof input.ai_result === "object") {
      const resLvl = (input.ai_result.shortName || input.ai_result.education_level || input.ai_result.level) as string;
      if (resLvl && ["TK", "SD", "SMP", "SMA", "SMK"].includes(String(resLvl).trim().toUpperCase())) {
        return String(resLvl).trim().toUpperCase() as EducationLevel;
      }
    }

    if (input.content && typeof input.content === "object") {
      const cntLvl = (input.content.shortName || input.content.education_level || input.content.level) as string;
      if (cntLvl && ["TK", "SD", "SMP", "SMA", "SMK"].includes(String(cntLvl).trim().toUpperCase())) {
        return String(cntLvl).trim().toUpperCase() as EducationLevel;
      }
    }

    if (input.assessment_title) {
      const t = String(input.assessment_title).toUpperCase();
      if (t.includes("SMK")) return "SMK";
      if (t.includes("SMA")) return "SMA";
      if (t.includes("SMP")) return "SMP";
      if (t.includes("SD")) return "SD";
      if (t.includes("TK")) return "TK";
    }

    if (input.ai_prompt) {
      const p = String(input.ai_prompt);
      if (p.includes("Sekolah Menengah Kejuruan (SMK)") || p.includes("Jenjang: SMK") || p.includes("SMK")) return "SMK";
      if (p.includes("Sekolah Menengah Atas (SMA)") || p.includes("Jenjang: SMA") || p.includes("SMA")) return "SMA";
      if (p.includes("Sekolah Menengah Pertama (SMP)") || p.includes("Jenjang: SMP") || p.includes("SMP")) return "SMP";
      if (p.includes("Sekolah Dasar (SD)") || p.includes("Jenjang: SD") || p.includes("SD")) return "SD";
      if (p.includes("TK / PAUD") || p.includes("Jenjang: TK") || p.includes("TK")) return "TK";
    }
  }

  return "TK";
}

export interface QuestionData {
  id: string;
  education_level: EducationLevel;
  category_name: string;
  text: string;
  order_index: number;
}

export const LEVEL_QUESTIONS: Record<EducationLevel, QuestionData[]> = {
  TK: [
    { id: "tk-q1", education_level: "TK", category_name: "Motorik & Fisik", text: "Apakah anak aktif bergerak, mampu melompat, serta lihai memegang pensil/sendok atau menggunting kertas?", order_index: 1 },
    { id: "tk-q2", education_level: "TK", category_name: "Bahasa & Komunikasi", text: "Apakah anak mampu mengungkapkan keinginan, menceritakan pengalaman harian, atau menjawab pertanyaan dengan jelas?", order_index: 2 },
    { id: "tk-q3", education_level: "TK", category_name: "Sosial & Emosional", text: "Apakah anak mudah berbaur dengan teman seusianya dan bersedia berbagi mainan atau bergantian?", order_index: 3 },
    { id: "tk-q4", education_level: "TK", category_name: "Regulasi Emosi", text: "Saat merasa kecewa atau lelah, apakah anak dapat ditenangkan dan mulai belajar mengendalikan emosi?", order_index: 4 },
    { id: "tk-q5", education_level: "TK", category_name: "Kemandirian Harian", text: "Apakah anak terbiasa melakukan aktivitas mandiri seperti makan, memakai sepatu, dan merapikan mainannya?", order_index: 5 },
    { id: "tk-q6", education_level: "TK", category_name: "Daya Fokus & Konsentrasi", text: "Apakah anak mampu fokus mendengarkan cerita atau menyelesaikan aktivitas permainan selama 10–15 menit?", order_index: 6 },
    { id: "tk-q7", education_level: "TK", category_name: "Eksplorasi & Ingin Tahu", text: "Apakah anak sering bertanya tentang hal-hal baru di sekitarnya dan antusias mencoba permainan baru?", order_index: 7 },
    { id: "tk-q8", education_level: "TK", category_name: "Kemampuan Akademik Awal", text: "Apakah anak sudah mampu mengenali huruf dasar, menyebutkan angka, serta mengenal warna dan bentuk geometri?", order_index: 8 },
    { id: "tk-q9", education_level: "TK", category_name: "Keterampilan Pra-Membaca", text: "Apakah anak tertarik membaca buku cerita bergambar, mencoret/menulis huruf, atau membilang benda?", order_index: 9 },
    { id: "tk-q10", education_level: "TK", category_name: "Ketahanan Belajar", text: "Apakah anak tetap berusaha mencoba menyelesaikan tugas atau permainan meskipun mengalami sedikit kesulitan?", order_index: 10 },
    { id: "tk-q11", education_level: "TK", category_name: "Kepatuhan Instruksi", text: "Apakah anak dapat memahami dan mengikuti instruksi sederhana dari guru di sekolah atau orang tua di rumah?", order_index: 11 },
    { id: "tk-q12", education_level: "TK", category_name: "Kesiapan Tumbuh Kembang", text: "Secara umum, apakah perkembangan dan kesiapan sekolah TK anak saat ini berkembang sesuai usianya?", order_index: 12 },
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
    { id: "smp-q14", education_level: "SMP", category_name: "Minat Masa Depan", text: "Apakah anak mulai mendiskusikan cita-cita atau pilihan Sekolah Menengah (SMA/SMK) untuk masa depannya?", order_index: 14 },
    { id: "smp-q15", education_level: "SMP", category_name: "Evaluasi Perkembangan SMP", text: "Menurut Anda, apakah tingkat kemandirian dan kesiapan belajar anak sudah sesuai dengan tingkatannya di SMP?", order_index: 15 },
  ],

  SMA: [
    { id: "sma-q1", education_level: "SMA", category_name: "Kemampuan Akademik", text: "Apakah anak memiliki konsistensi belajar tinggi dan mampu menguasai materi pelajaran tingkat lanjut?", order_index: 1 },
    { id: "sma-q2", education_level: "SMA", category_name: "Berpikir Analitis & Riset", text: "Apakah anak mampu berpikir analitis, melakukan riset/studi literatur sederhana, serta menarik kesimpulan berbasis data?", order_index: 2 },
    { id: "sma-q3", education_level: "SMA", category_name: "Public Speaking & Presentasi", text: "Apakah anak mampu menyampaikan ide, gagasan, atau presentasi di depan umum dengan percaya diri dan tertata?", order_index: 3 },
    { id: "sma-q4", education_level: "SMA", category_name: "Kesiapan Masuk Perguruan Tinggi", text: "Apakah anak memiliki strategi dan persiapan matang untuk seleksi masuk Perguruan Tinggi / Kuliah?", order_index: 4 },
    { id: "sma-q5", education_level: "SMA", category_name: "Persiapan Karier", text: "Apakah anak telah mengenali minat bakat dan gambaran profesi/karier yang ingin ditekuni masa depan?", order_index: 5 },
    { id: "sma-q6", education_level: "SMA", category_name: "Kemandirian Belajar", text: "Apakah anak mampu belajar mandiri, mencari sumber referensi tambahan, dan mengevaluasi hasil belajarnya secara otonom?", order_index: 6 },
    { id: "sma-q7", education_level: "SMA", category_name: "Manajemen Waktu Akademik", text: "Apakah anak mampu membagi prioritas secara seimbang antara target pelajaran, persiapan ujian, dan aktivitas fisik/sosial?", order_index: 7 },
    { id: "sma-q8", education_level: "SMA", category_name: "Kepemimpinan", text: "Apakah anak mampu mengambil inisiatif kepemimpinan, mengelola konflik, dan mengarahkan tim dalam mencapai tujuan?", order_index: 8 },
    { id: "sma-q9", education_level: "SMA", category_name: "Pengambilan Keputusan", text: "Apakah anak mempertimbangkan risiko dan konsekuensi jangka panjang sebelum mengambil keputusan penting?", order_index: 9 },
    { id: "sma-q10", education_level: "SMA", category_name: "Problem Solving", text: "Apakah anak mampu menghadapi persoalan rumit dengan kepala dingin dan menemukan solusi pragmatis?", order_index: 10 },
    { id: "sma-q11", education_level: "SMA", category_name: "Pengembangan Diri", text: "Apakah anak aktif mengasah keterampilan diri baru (bahasa asing, coding, sertifikasi, seni, atau kepemimpinan)?", order_index: 11 },
    { id: "sma-q12", education_level: "SMA", category_name: "Hubungan Sosial & Networking", text: "Apakah anak mampu membangun jejaring pertemanan positif dan menjaga komunikasi yang sehat?", order_index: 12 },
    { id: "sma-q13", education_level: "SMA", category_name: "Tanggung Jawab Pribadi", text: "Apakah anak bersikap dewasa dan bertanggung jawab penuh atas segala tindakan dan pencapaian pribadinya?", order_index: 13 },
    { id: "sma-q14", education_level: "SMA", category_name: "Motivasi & Resiliensi", text: "Apakah anak memiliki daya tahan (*resilience*) yang tinggi saat menghadapi tekanan, persaingan, atau kegagalan?", order_index: 14 },
    { id: "sma-q15", education_level: "SMA", category_name: "Evaluasi Perkembangan SMA", text: "Menurut Anda, apakah kesiapan akademik dan kedewasaan anak saat ini sudah optimal untuk melangkah ke jenjang kuliah/karier?", order_index: 15 },
  ],

  SMK: [
    { id: "smk-q1", education_level: "SMK", category_name: "Kompetensi Keahlian", text: "Apakah anak memiliki penguasaan teori dan keterampilan praktis kejuruan yang kuat di bidang pilihannya?", order_index: 1 },
    { id: "smk-q2", education_level: "SMK", category_name: "Kesiapan Kerja & Magang (PKL)", text: "Apakah anak siap mengikuti Praktik Kerja Lapangan (PKL) dan mampu beradaptasi dengan budaya dunia kerja/industri?", order_index: 2 },
    { id: "smk-q3", education_level: "SMK", category_name: "Problem Solving Vokasional", text: "Apakah anak mampu memecahkan masalah teknis/praktis dalam proyek kejuruan secara mandiri dan sistematis?", order_index: 3 },
    { id: "smk-q4", education_level: "SMK", category_name: "Disiplin & Etika Kerja", text: "Apakah anak terbiasa disiplin terhadap waktu, instruksi kerja, serta menerapkan Keselamatan dan Kesehatan Kerja (K3)?", order_index: 4 },
    { id: "smk-q5", education_level: "SMK", category_name: "Portofolio & Karya Kejuruan", text: "Apakah anak aktif membuat produk, proyek praktis, atau portofolio karya sesuai bidang keahliannya?", order_index: 5 },
    { id: "smk-q6", education_level: "SMK", category_name: "Kerja Sama Tim & Industri", text: "Apakah anak mampu bekerja sama dengan baik dalam tim proyek industri dan berkomunikasi secara profesional?", order_index: 6 },
    { id: "smk-q7", education_level: "SMK", category_name: "Kreativitas & Inovasi", text: "Apakah anak mampu mengusulkan inovasi atau solusi kreatif dalam pengerjaan produk/jasa kejuruan?", order_index: 7 },
    { id: "smk-q8", education_level: "SMK", category_name: "Minat Wirausaha", text: "Apakah anak tertarik dan memiliki potensi dasar untuk mengembangkan usaha mandiri di bidang keahliannya?", order_index: 8 },
    { id: "smk-q9", education_level: "SMK", category_name: "Manajemen Waktu & Tenggat Proyek", text: "Apakah anak mampu mengelola waktu pengerjaan tugas/proyek kejuruan sesuai tenggat waktu yang ditentukan?", order_index: 9 },
    { id: "smk-q10", education_level: "SMK", category_name: "Sertifikasi & Uji Kompetensi", text: "Apakah anak bersemangat mengikuti uji kompetensi dan sertifikasi keahlian industri?", order_index: 10 },
    { id: "smk-q11", education_level: "SMK", category_name: "Literasi Digital & Teknologi Vokasi", text: "Apakah anak menguasai penggunaan perangkat lunak atau teknologi pendukung bidang keahliannya?", order_index: 11 },
    { id: "smk-q12", education_level: "SMK", category_name: "Kemampuan Berbahasa Inggris Teknis", text: "Apakah anak berusaha menguasai istilah teknis/bahasa Inggris yang dibutuhkan dalam bidang keahliannya?", order_index: 12 },
    { id: "smk-q13", education_level: "SMK", category_name: "Ketahanan Kerja (Work Resilience)", text: "Apakah anak memiliki daya tahan fisik dan mental yang kuat saat menghadapi tantangan pengerjaan proyek kejuruan?", order_index: 13 },
    { id: "smk-q14", education_level: "SMK", category_name: "Kesiapan Karir Masa Depan", text: "Apakah anak sudah memiliki target karir jelas (bekerja di industri, wirausaha, atau kuliah vokasi)?", order_index: 14 },
    { id: "smk-q15", education_level: "SMK", category_name: "Evaluasi Perkembangan SMK", text: "Menurut Anda, apakah kompetensi dan kesiapan dunia kerja anak saat ini sudah sesuai dengan tingkatannya di SMK?", order_index: 15 },
  ],
};

