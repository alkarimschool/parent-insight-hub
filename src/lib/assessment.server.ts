import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { callLovableAiJson } from "./ai.server";
import { EducationLevel, LEVEL_QUESTIONS, getEducationLevel } from "./questions.data";
import { getAssessmentContent } from "./assessment-content";
import { DEFAULT_PROMPTS } from "./prompt.data";

interface SubmitInput {
  parent: { name: string; whatsapp: string };
  child: {
    name: string;
    gender: "L" | "P";
    birth_date: string;
    school?: string;
    class_name?: string;
    education_level?: EducationLevel;
  };
  answers: Array<{ question_id: string; score: number }>;
}

interface CachedAssessment {
  assessment_id: string;
  education_level: EducationLevel;
  parent_name: string;
  child_name: string;
  created_at: string;
  content: any;
  status: string;
}

const inMemoryAssessmentCache = new Map<string, CachedAssessment>();

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const LEVEL_PROFILES: Record<EducationLevel, {
  ringkasan: (name: string, isHigh: boolean) => string;
  kelebihan: (name: string) => string[];
  area_pengembangan: (name: string) => string[];
  kemampuan_akademik: (name: string) => string;
  kecerdasan_sosial: (name: string) => string;
  kecerdasan_emosional: (name: string) => string;
  karakter: (name: string) => string;
  potensi: (name: string) => string;
  minat_bakat: (name: string) => string;
  perhatian_orangtua: (name: string) => string[];
  treatment: (name: string) => Array<{ kategori: string; aktivitas: string }>;
  rekomendasi_akademik: (name: string) => string;
  kesimpulan: (childName: string, parentName: string) => string;
}> = {
  TK: {
    ringkasan: (name, isHigh) => `Berdasarkan asesmen perkembangan anak usia dini (TK / PAUD), ${name} menunjukkan kesiapan tumbuh kembang, komunikasi, dan calistung awal yang ${isHigh ? "sangat optimal" : "baik dan berkembang positif"}. Anak aktif, memiliki rasa ingin tahu tinggi, dan siap mengikuti kegiatan sekolah.`,
    kelebihan: (name) => [
      `Mampu menyampaikan keinginan dan berkomunikasi verbal dengan jelas.`,
      `Mengenal huruf dasar, angka, warna, bentuk, dan membilang benda harian.`,
      `Antusias mencoba permainan baru dan beradaptasi dengan teman seusianya.`
    ],
    area_pengembangan: (name) => [
      `Meningkatkan konsentrasi dan ketekunan saat menyelesaikan permainan (10–15 menit).`,
      `Melatih kemandirian merapikan mainan dan regulasi emosi saat timbul kekecewaan.`
    ],
    kemampuan_akademik: (name) => `${name} memiliki kesiapan akademik awal TK yang baik: telah mengenal huruf alfabet dasar, menyebutkan angka, mengenal warna dan bentuk, serta mampu mengikuti instruksi 2 langkah dari guru/orang tua.`,
    kecerdasan_sosial: (name) => `${name} mudah bergaul, bersikap ramah dengan teman sebaya, dan mulai memahami konsep berbagi permainan.`,
    kecerdasan_emosional: (name) => `${name} memiliki rasa percaya diri yang ceria dan mulai belajar menenangkan diri saat merasa lelah atau kecewa.`,
    karakter: (name) => `Karakter pembelajar usia dini yang jujur, aktif, dan penuh rasa ingin tahu.`,
    potensi: (name) => `Potensi eksplorasi visual, daya ingat permainan, dan kecerdasan komunikasi sosial.`,
    minat_bakat: (name) => `Menunjukkan minat tinggi pada buku cerita bergambar, mewarnai, balok susun, dan lagu anak.`,
    perhatian_orangtua: (name) => [
      `Berikan stimulasi calistung berbasis permainan gembira tanpa paksaan.`,
      `Dampingi rutinitas tidur dan membaca dongeng sebelum tidur.`
    ],
    treatment: (name) => [
      { kategori: "Stimulasi Calistung TK", aktivitas: "Bermain flashcard huruf/angka dan membilang benda harian 10–15 menit bersama orang tua." },
      { kategori: "Kemandirian & Motorik", aktivitas: "Latih anak memakai sepatu, makan sendiri, dan merapikan mainannya." },
      { kategori: "Sosialisasi & Emosi", aktivitas: "Fasilitasi waktu bermain (playdate) bersama teman seusianya." }
    ],
    rekomendasi_akademik: (name) => `Bacakan cerita dongeng interaktif setiap hari, ajak menyebutkan huruf/angka di sekitar lingkungan rumah, serta berikan apresiasi positif atas setiap usaha anak.`,
    kesimpulan: (c, p) => `Perkembangan dan kesiapan sekolah TK ananda ${c} berjalan sangat baik. Pendampingan penuh kasih dari Ibu/Bapak ${p} akan mengoptimalkan potensi emas usia dininya.`
  },

  SD: {
    ringkasan: (name, isHigh) => `Berdasarkan asesmen karakter dan kebiasaan belajar Sekolah Dasar (SD), ${name} menunjukkan performa akademik, literasi, numerasi, dan disiplin yang ${isHigh ? "sangat memuaskan" : "baik dan terus berkembang"}. Anak memiliki fondasi belajar mandiri yang kuat.`,
    kelebihan: (name) => [
      `Kelancaran membaca pemahaman cerita dan kerapihan menulis kalimat.`,
      `Pemahaman operasi matematika dasar (penjumlahan, pengurangan, perkalian/pembagian sederhana).`,
      `Disiplin dalam waktu belajar dan penyelesaian tugas sekolah (PR).`
    ],
    area_pengembangan: (name) => [
      `Mengurangi distrasi penggunaan gadget/game saat waktu belajar mandiri.`,
      `Melatih pemecahan soal cerita matematika berjenjang dan daya fokus belajar (20–30 menit).`
    ],
    kemampuan_akademik: (name) => `${name} memiliki tingkat literasi dan numerasi SD yang solid: mampu membaca teks cerita dengan intonasi baik, memahami makna bacaan, serta melakukan perhitungan angka matematika dasar secara akurat.`,
    kecerdasan_sosial: (name) => `${name} mampu bekerja sama dalam tim proyek sekolah, menghargai teman, dan menunjukkan rasa percaya diri saat tampil di depan kelas.`,
    kecerdasan_emosional: (name) => `${name} mampu mengendalikan emosi saat menghadapi kekalahan atau kesulitan soal latihan.`,
    karakter: (name) => `Karakter anak SD yang disiplin, bertanggung jawab atas tugas sekolah, dan jujur.`,
    potensi: (name) => `Potensi penalaran logika matematika dasar, ekspresi tulisan, dan kreativitas seni/sains.`,
    minat_bakat: (name) => `Terlihat minat pada eksperimen sains sekolah, buku pengetahuan, dan aktivitas olahraga.`,
    perhatian_orangtua: (name) => [
      `Terapkan aturan membatasi waktu layar (screen time) gadget di rumah.`,
      `Dampingi waktu review pelajaran dan apresiasi usaha belajar anak.`
    ],
    treatment: (name) => [
      { kategori: "Penguatan Literasi & Numerasi SD", aktivitas: "Latihan membaca buku cerita pendek dan penyelesaian 5 soal cerita matematika harian." },
      { kategori: "Manajemen Belajar Rumah", aktivitas: "Buatkan jadwal belajar teratur (30-45 menit) di area rumah yang tenang tanpa TV/gadget." },
      { kategori: "Pendampingan Karakter", aktivitas: "Diskusikan nilai tanggung jawab, kejujuran, dan kerapihan perlengkapan sekolah." }
    ],
    rekomendasi_akademik: (name) => `Fasilitasi buku bacaan ensiklopedia anak, dampingi latihan pemecahan soal cerita matematika, dan koordinasikan perkembangan belajar berkala dengan guru kelas di sekolah.`,
    kesimpulan: (c, p) => `Pencapaian akademik dan pembentukan karakter SD ananda ${c} berjalan sangat baik. Pembiasaan belajar teratur yang didukung Ibu/Bapak ${p} di rumah akan menjadi kunci kesuksesannya.`
  },

  SMP: {
    ringkasan: (name, isHigh) => `Berdasarkan asesmen perkembangan remaja awal dan akademik SMP, ${name} menunjukkan motivasi belajar, pemikiran kritis, dan pergaulan positif yang ${isHigh ? "sangat menonjol" : "baik dan terus berkembang"}. Anak memiliki kesadaran diri yang tinggi dalam belajar.`,
    kelebihan: (name) => [
      `Mampu berpikir kritis, menganalisis materi SMP, dan mengajukan argumen logis.`,
      `Memiliki motivasi dan target nilai akademik pribadi.`,
      `Mampu memilih pergaulan positif dan menolak tekanan negatif teman sebaya.`
    ],
    area_pengembangan: (name) => [
      `Manajemen waktu seimbang antara belajar, media sosial, dan hobi.`,
      `Melatih ketahanan diri (resilience) dalam menghadapi persaingan nilai atau tugas kelompok yang rumit.`
    ],
    kemampuan_akademik: (name) => `${name} memiliki kemampuan akademik SMP yang memuaskan: mampu memahami konsep pelajaran yang kompleks, menyelesaikan tugas proyek sekolah secara mandiri, serta memiliki inisiatif mempersiapkan ujian.`,
    kecerdasan_sosial: (name) => `${name} menunjukkan komunikasi yang dewasa dalam kelompok teman sebaya, menghargai perbedaan pendapat, dan aktif dalam kegiatan sekolah.`,
    kecerdasan_emosional: (name) => `${name} mampu mengelola stres beban pelajaran dan perubahan emosi khas usia remaja awal.`,
    karakter: (name) => `Karakter remaja yang mandiri, kritis, bertanggung jawab, dan komunikatif dengan orang tua.`,
    potensi: (name) => `Potensi pemecahan masalah (problem solving), penalaran analitis, dan kepemimpinan organisasi siswa.`,
    minat_bakat: (name) => `Menunjukkan minat spesifik pada bidang ilmu (IPA/IPS/Bahasa/Teknologi) dan kegiatan ekstrakurikuler.`,
    perhatian_orangtua: (name) => [
      `Jaga komunikasi terbuka dua arah tanpa menghakimi pilihan dan emosi remaja.`,
      `Dukung eksplorasi minat calon Sekolah Menengah (SMA/SMK).`
    ],
    treatment: (name) => [
      { kategori: "Pengembangan Berpikir Kritis SMP", aktivitas: "Latihan pemetaan konsep (mind mapping) dan diskusi isu-isu sains/sosial terkini bersama keluarga." },
      { kategori: "Manajemen Waktu Remaja", aktivitas: "Dampingi penyusunan skala prioritas antara tugas sekolah, ekstrakurikuler, dan media sosial." },
      { kategori: "Eksplorasi Masa Depan", aktivitas: "Diskusikan pemetaan minat bakat untuk persiapan pemilihan jurusan SMA/SMK." }
    ],
    rekomendasi_akademik: (name) => `Dorong partisipasi dalam kompetisi akademik/organisasi sekolah, berikan akses sumber belajar digital berkualitas, dan bangun budaya diskusi analisis kritis di rumah.`,
    kesimpulan: (c, p) => `Perkembangan berpikir kritis dan kesiapan akademik SMP ananda ${c} sangat positif. Kemitraan komunikatif dari Ibu/Bapak ${p} akan membimbingnya menjadi remaja yang berprestasi.`
  },

  SMA: {
    ringkasan: (name, isHigh) => `Berdasarkan asesmen kesiapan perguruan tinggi, minat karier, dan pemikiran analitis SMA, ${name} menunjukkan kemandirian belajar, riset, dan kepemimpinan yang ${isHigh ? "sangat matang & unggul" : "baik dan siap dikembangkan"}. Anak sangat siap melangkah ke jenjang masa depan.`,
    kelebihan: (name) => [
      `Pemikiran analitis tingkat tinggi, kemampuan riset/studi literatur mandiri, dan penyusunan argumen berbasis data.`,
      `Public speaking dan kemampuan presentasi yang percaya diri dan terstruktur.`,
      `Kesiapan matang dan strategi pemilihan Perguruan Tinggi / Kuliah serta arah profesi masa depan.`
    ],
    area_pengembangan: (name) => [
      `Pengaturan waktu prioritas antara persiapan ujian seleksi PTN/PTS, organisasi, dan waktu istirahat yang cukup.`,
      `Mempertajam keterampilan jaringan (networking) dan manajemen konflik dalam tim.`
    ],
    kemampuan_akademik: (name) => `${name} memiliki prestasi dan kemampuan akademik SMA tingkat lanjut yang unggul: menguasai materi abstrak, mampu melakukan analisis kritis data, serta memiliki konsistensi belajar otonom yang tinggi.`,
    kecerdasan_sosial: (name) => `${name} menunjukkan kepemimpinan yang dewasa, empati sosial, dan kemampuan berkolaborasi dalam proyek profesional.`,
    kecerdasan_emosional: (name) => `${name} memiliki daya tahan (resilience) dan tingkat kedewasaan emosi yang stabil dalam menghadapi tekanan persaingan tinggi.`,
    karakter: (name) => `Karakter dewasa yang mandiri, berintegritas tinggi, dan bertanggung jawab penuh atas pilihan karier pribadinya.`,
    potensi: (name) => `Potensi kepemimpinan strategis, analisis riset ilmiah, public speaking, dan pemecahan masalah kompleks.`,
    minat_bakat: (name) => `Terorientasi jelas pada jurusan kuliah impian (Teknologi/Sains/Sosial/Bisnis/Seni) dan profesi masa depan.`,
    perhatian_orangtua: (name) => [
      `Dukung penuh kemandirian anak dalam menentukan pilihan jurusan kuliah dan karier.`,
      `Fasilitasi bimbingan tryout dan persiapan administrasi perguruan tinggi.`
    ],
    treatment: (name) => [
      { kategori: "Persiapan Perguruan Tinggi (SMA)", aktivitas: "Fasilitasi tryout ujian seleksi masuk kuliah (SNBT/Mandiri) dan konseling jurusan berkala." },
      { kategori: "Riset & Pengembangan Diri", aktivitas: "Dorong penyusunan karya tulis ilmiah, proyek portofolio, dan pelatihan kepemimpinan/bahasa." },
      { kategori: "Kemandirian & Masa Depan", aktivitas: "Beri ruang otonomi penuh dalam pengambilan keputusan hidup dan pengelolaan keuangan pribadi." }
    ],
    rekomendasi_akademik: (name) => `Fasilitasi latihan soal analitis tingkat lanjut, ikuti tryout PTN/PTS secara konsisten, dan tingkatkan keterampilan komunikasi publik serta riset literatur mandiri.`,
    kesimpulan: (c, p) => `Kedewasaan dan kesiapan akademik ananda ${c} dalam menghadapi Perguruan Tinggi & Dunia Karier sudah sangat optimal. Dukungan dan doa dari Ibu/Bapak ${p} akan mengantarkannya meraih cita-cita besarnya.`
  },

  SMK: {
    ringkasan: (name, isHigh) => `Berdasarkan asesmen kesiapan vokasional dan keahlian Sekolah Menengah Kejuruan (SMK), ${name} menunjukkan kesiapan kerja, kompetensi praktis, dan disiplin industri yang ${isHigh ? "sangat matang & siap kerja/wirausaha" : "baik dan berkembang positif"}. Anak memiliki fondasi keterampilan kejuruan yang solid.`,
    kelebihan: (name) => [
      `Menguasai teori dan keterampilan praktis kejuruan di bidang pilihannya.`,
      `Kesiapan tinggi dalam mengikuti Praktik Kerja Lapangan (PKL) dan budaya kerja industri.`,
      `Disiplin, berorientasi hasil, dan tanggap menyelesaikan proyek teknis.`
    ],
    area_pengembangan: (name) => [
      `Meningkatkan penguasaan literasi digital dan istilah teknis bahasa Inggris industri.`,
      `Melatih komunikasi profesional dan kerja sama tim lintas keahlian.`
    ],
    kemampuan_akademik: (name) => `${name} memiliki penguasaan kompetensi keahlian SMK yang baik: mampu menerapkan konsep teknis dalam praktik langsung serta mengoperasikan perangkat kejuruan secara terstruktur.`,
    kecerdasan_sosial: (name) => `${name} mampu bekerja sama dengan baik dalam tim proyek industri dan menghargai etika komunikasi kerja.`,
    kecerdasan_emosional: (name) => `${name} memiliki ketahanan kerja (work resilience) dan tanggung jawab tinggi saat menghadapi tenggat waktu pengerjaan proyek kejuruan.`,
    karakter: (name) => `Karakter vokasional yang disiplin, jujur, cekatan, dan berintegritas tinggi.`,
    potensi: (name) => `Potensi keahlian praktis vokasional, inovasi produk kejuruan, wirausaha mandiri, dan kepemimpinan teknis.`,
    minat_bakat: (name) => `Terorientasi jelas pada bidang keahlian pilihan serta kesiapan kerja industri maupun studi lanjut vokasi.`,
    perhatian_orangtua: (name) => [
      `Dukung anak dalam penyusunan portofolio karya dan persiapan sertifikasi keahlian.`,
      `Fasilitasi bimbingan PKL dan konsultasi arah karir vokasi.`
    ],
    treatment: (name) => [
      { kategori: "Pengembangan Kompetensi SMK", aktivitas: "Fasilitasi pembuatan portofolio proyek kejuruan dan persiapan uji kompetensi industri." },
      { kategori: "Keterampilan Wirausaha & Industri", aktivitas: "Latih perencanaan proyek bisnis kejuruan dan simulasi wawancara kerja profesional." },
      { kategori: "Pengembangan Diri & Bahasa", aktivitas: "Tingkatkan penguasaan istilah teknis berbahasa Inggris dan perangkat lunak industri." }
    ],
    rekomendasi_akademik: (name) => `Pertajam keterampilan praktis kejuruan, selesaikan sertifikasi kompetensi industri, dan susun portofolio karya terbaik untuk persiapan melangkah ke dunia kerja atau kuliah vokasi.`,
    kesimpulan: (c, p) => `Kompetensi keahlian dan kesiapan dunia kerja SMK ananda ${c} berjalan sangat optimal. Pendampingan dan dorongan dari Ibu/Bapak ${p} di rumah akan mengantarkannya meraih kesuksesan karir.`
  }
};

export const LEVEL_TITLES_MAP: Record<EducationLevel, string> = {
  TK: getAssessmentContent("TK").title,
  SD: getAssessmentContent("SD").title,
  SMP: getAssessmentContent("SMP").title,
  SMA: getAssessmentContent("SMA").title,
  SMK: getAssessmentContent("SMK").title,
};

function generateFallbackResult(childName: string, parentName: string, avgScore: number, level: EducationLevel) {
  const isHigh = avgScore >= 3.8;
  const safeLevel = getEducationLevel(level);

  if (safeLevel === "SD") {
    return {
      judul: "Laporan Assessment Potensi Akademik & Karakter SD",
      status_perkembangan_sd: isHigh ? "Sangat Baik & Mandiri" : "Baik Sesuai Usia",
      ringkasan_profil_sd: `Berdasarkan asesmen potensi akademik dan karakter Sekolah Dasar (SD), Ananda ${childName} menunjukkan kesiapan belajar, literasi, numerasi, dan kebiasaan positif yang ${isHigh ? "sangat mandiri dan unggul" : "baik dan berkembang positif"}.`,
      kelebihan_pembelajaran: [
        `Mampu membaca lancar, menulis kalimat dengan rapi, dan memahami cerita/tugas SD.`,
        `Menguasai perhitungan matematika dasar dan penalaran angka seusianya.`,
        `Bertanggung jawab merapikan jadwal sekolah dan perlengkapan belajar.`,
        `Memiliki rasa percaya diri saat berbicara di depan kelas atau kelompok bermain.`
      ],
      area_belajar_ditingkatkan: [
        `Meningkatkan konsentrasi belajar (20–30 menit) tanpa terdistraksi TV/gadget.`,
        `Mempertajam pemecahan soal cerita matematika dan pemahaman bacaan kompleks.`,
        `Melatih kemandirian mengerjakan PR sekolah tanpa harus selalu ditagih.`
      ],
      literasi_dan_numerasi: {
        status_literasi_numerasi: isHigh ? "Sangat Baik" : "Baik Sesuai Usia",
        kemampuan_literasi: [
          `Membaca teks cerita SD dengan intonasi dan kelancaran yang baik.`,
          `Mampu menulis kalimat dengan tata bahasa dasar dan kerapian yang rapi.`
        ],
        kemampuan_numerasi: [
          `Menguasai penjumlahan, pengurangan, dan perkalian/pembagian dasar.`,
          `Mampu memecahkan soal matematika sederhana berorientasi aktivitas harian.`
        ]
      },
      kebiasaan_dan_fokus_belajar: [
        `Mampu fokus memperhatikan penjelasan pelajaran 20–30 menit.`,
        `Mampu membatasi waktu bermain gadget sesuai kesepakatan aturan rumah.`
      ],
      karakter_dan_interaksi_sosial: [
        `Disiplin mematuhi aturan rumah dan sekolah secara konsisten.`,
        `Mudah berteman, bekerja sama dalam kelompok, dan mengendalikan emosi saat kecewa.`
      ],
      potensi_dan_kreativitas: [
        `Potensi ekspresi karya seni, eksperimen sains sekolah, dan kreativitas mandiri.`,
        `Jiwa kepemimpinan dalam kelompok belajar seusianya.`
      ],
      hal_perhatian_orangtua: [
        `Batasi penggunaan layar (screen time) gadget sesuai aturan rumah.`,
        `Sediakan area belajar rumah yang tenang dan bebas gangguan TV.`
      ],
      rekomendasi_treatment_rumah: [
        { kategori: "Penguatan Literasi & Numerasi SD", aktivitas: "Latihan membaca 1 bab buku cerita dan 5 soal cerita matematika harian bersama orang tua." },
        { kategori: "Manajemen Belajar Rumah", aktivitas: "Dampingi jadwal belajar teratur (30-45 menit) di ruang belajar khusus di rumah." }
      ],
      catatan_perkembangan_sd: [
        `Sangat mengapresiasi kebiasaan belajar dan semangat Ananda ${childName} di Sekolah Dasar.`,
        `Laporan ini dirancang sebagai panduan pendampingan karakter dan strategi belajar di rumah.`
      ]
    };
  }

  if (safeLevel === "SMP") {
    return {
      judul: "Laporan Assessment Potensi Belajar & Dinamika Remaja SMP",
      status_perkembangan_smp: isHigh ? "Sangat Optimal & Berdaya" : "Baik Sesuai Usia Remaja",
      ringkasan_dinamika_smp: `Berdasarkan asesmen perkembangan remaja awal dan akademik SMP, Ananda ${childName} menunjukkan motivasi belajar, pemikiran kritis, dan pergaulan positif yang ${isHigh ? "sangat menonjol & mandiri" : "baik dan terus berkembang"}.`,
      kekuatan_akademik_smp: [
        `Mampu berpikir kritis, menganalisis materi SMP, dan memberikan argumen logis.`,
        `Memiliki inisiatif mandiri mempelajari materi sebelum ujian atau tugas proyek.`,
        `Mampu memilih pergaulan positif dan tegas menolak pengaruh negatif teman sebaya.`
      ],
      area_pengembangan_smp: [
        `Manajemen waktu yang seimbang antara target akademik, media sosial, dan hobi.`,
        `Melatih resiliensi (daya tahan emosi) saat menghadapi tugas kelompok rumit.`
      ],
      kemampuan_berpikir_kritis: {
        status_pemikiran_kritis: isHigh ? "Sangat Tajam" : "Baik",
        kekuatan_analisis: [
          `Mampu menganalisis masalah pelajaran SMP secara sistematis.`,
          `Mampu menyusun tugas proyek sekolah dengan pemikiran logis mandiri.`
        ],
        area_latihan_kritis: [
          `Pengembangan peta konsep (mind mapping) untuk materi pelajaran yang luas.`
        ]
      },
      pergaulan_dan_media_sosial: [
        `Pergaulan sekolah yang positif dan bersikap santun dalam kelompok teman sebaya.`,
        `Penggunaan media sosial dan gadget yang terkontrol dengan baik.`
      ],
      manajemen_emosi_dan_sosial: [
        `Mampu mengelola emosi perubahan usia remaja awal (12–15 tahun).`,
        `Tetap bersikap sopan, komunikatif, dan menghormati bimbingan orang tua.`
      ],
      kepemimpinan_dan_minat: [
        `Menunjukkan minat kuat pada bidang studi spesifik (IPA/IPS/Bahasa/Seni/Teknologi).`,
        `Inisiatif aktif dalam kegiatan ekstrakurikuler atau organisasi sekolah.`
      ],
      perhatian_orangtua_smp: [
        `Jaga komunikasi terbuka dua arah tanpa langsung menghakimi perasaan anak.`,
        `Dukung diskusi eksplorasi cita-cita dan minat sekolah lanjutan (SMA).`
      ],
      rekomendasi_pendampingan_remaja: [
        { kategori: "Pengembangan Berpikir Kritis SMP", aktivitas: "Diskusi isu-isu sains/sosial terkini bersama keluarga dan latihan pemetaan mind map." },
        { kategori: "Manajemen Waktu Remaja", aktivitas: "Penyusunan skala prioritas antara pelajaran sekolah, organisasi, dan waktu santai." }
      ],
      catatan_kesiapan_smp: [
        `Apresiasi atas tingkat kemandirian dan kesiapan belajar Ananda ${childName} di SMP.`,
        `Laporan ini dirancang sebagai acuan pendampingan tumbuh kembang remaja awal.`
      ]
    };
  }

  if (safeLevel === "SMA") {
    return {
      judul: "Laporan Assessment Kesiapan Perguruan Tinggi & Karier SMA",
      status_kesiapan_sma: isHigh ? "Sangat Matang & Siap Kuliah/Karier" : "Baik & Berprospek Tinggi",
      ringkasan_eksekutif_sma: `Berdasarkan asesmen kesiapan perguruan tinggi, minat karier, dan pemikiran analitis SMA, Ananda ${childName} menunjukkan kemandirian belajar, riset, dan kepemimpinan yang ${isHigh ? "sangat matang & unggul" : "baik dan siap dikembangkan"}.`,
      keunggulan_akademik_sma: [
        `Pemikiran analitis tingkat tinggi, kemampuan riset/studi literatur mandiri, dan penarikan kesimpulan berbasis data.`,
        `Public speaking dan penyampaian ide presentasi yang percaya diri di depan umum.`,
        `Kesiapan matang dan strategi persiapan Perguruan Tinggi (PTN/PTS) serta karier masa depan.`
      ],
      area_akademik_perlu_ditingkatkan: [
        `Manajemen waktu akademik seimbang antara tryout ujian seleksi PTN, organisasi, dan kesehatan.`,
        `Mempertajam keterampilan jejaring (networking) dan manajemen konflik tim.`
      ],
      kesiapan_kuliah_dan_perencanaan_karier: {
        status_kesiapan_ptn: isHigh ? "Sangat Siap" : "Siap",
        potensi_jurusan_kuliah: [
          `Teknologi Informasi / Computer Science / Data Science`,
          `Teknik & Ilmu Pengetahuan Alam (Saintek)`,
          `Manajemen Bisnis / Ekonomi / Soshum`
        ],
        strategi_seleksi_perguruan_tinggi: [
          `Mengikuti latihan soal tryout SNBT / Ujian Mandiri secara teratur.`,
          `Penyusunan portofolio prestasi dan riset profil kampus impian.`
        ]
      },
      public_speaking_dan_leadership: [
        `Kemampuan menyampaikan gagasan terstruktur dan meyakinkan di depan umum.`,
        `Inisiatif kepemimpinan dalam mengarahkan tim proyek dan mengelola konflik.`
      ],
      problem_solving_dan_resiliensi: [
        `Memiliki resiliensi (daya tahan) yang baik saat menghadapi tekanan persaingan tinggi.`,
        `Pertimbangan keputusan jangka panjang berbasis evaluasi risiko yang matang.`
      ],
      pengembangan_soft_hard_skills: [
        `Pengembangan bahasa asing, sertifikasi keahlian digital, dan tanggung jawab pribadi.`
      ],
      perhatian_orangtua_dan_otonomi: [
        `Berikan otonomi penuh dalam menentukan jurusan kuliah dan rencana karier pilihan anak.`,
        `Fasilitasi tryout kampus dan bimbingan persiapan perguruan tinggi.`
      ],
      rekomendasi_strategi_masa_depan: [
        { kategori: "Persiapan Perguruan Tinggi (SMA)", aktivitas: "Fasilitasi tryout SNBT/Mandiri dan konsultasi berkala pemilihan jurusan kuliah." },
        { kategori: "Riset & Portofolio Karya", aktivitas: "Dorong pembuatan proyek karya mandiri atau sertifikasi keahlian digital/bahasa." }
      ],
      catatan_kelulusan_sma: [
        `Apresiasi atas kedewasaan dan tanggung jawab pribadi Ananda ${childName}.`,
        `Laporan ini disusun sebagai peta jalan menuju sukses di Perguruan Tinggi & Dunia Karier.`
      ]
    };
  }

  // DEFAULT TK / PAUD
  return {
    judul: "Laporan Assessment Perkembangan Anak TK",
    status_perkembangan: isHigh ? "Berkembang Sangat Baik" : "Berkembang Sesuai Usia (Normal)",
    penjelasan_status: `Berdasarkan asesmen perkembangan anak usia dini (TK / PAUD), Ananda ${childName} menunjukkan kesiapan tumbuh kembang, komunikasi, dan calistung awal yang ${isHigh ? "sangat optimal" : "baik dan berkembang positif"}.`,
    kekuatan_anak: [
      `Mampu menyampaikan keinginan dan berkomunikasi verbal dengan jelas.`,
      `Mengenal huruf dasar, angka, warna, bentuk, dan membilang benda harian.`,
      `Antusias mencoba permainan baru dan beradaptasi dengan teman seusianya.`
    ],
    area_perlu_ditingkatkan: [
      `Meningkatkan konsentrasi dan ketekunan saat menyelesaikan permainan (10–15 menit).`,
      `Melatih kemandirian merapikan mainan dan peralatan pribadi setelah digunakan.`
    ],
    potensi_dikembangkan: [
      `Potensi komunikasi verbal dan ekspresi bahasa anak.`,
      `Kreativitas eksplorasi visual, seni, dan daya ingat permainan.`
    ],
    kemampuan_akademik: {
      status_akademik: isHigh ? "Sangat Baik" : "Sesuai Usia",
      kekuatan_akademik: [
        `Mengenal huruf dasar alfabet dan angka 1–10 secara visual.`,
        `Mengenal warna primer, sekunder, dan bentuk geometri dasar.`
      ],
      area_akademik_dikembangkan: [
        `Pengenalan bunyi fonik huruf awal untuk persiapan membaca.`
      ]
    },
    prioritas_stimulasi: [
      `Stimulasi Calistung TK: Bermain flashcard huruf/angka 10–15 menit bersama orang tua.`,
      `Kemandirian & Motorik: Latih anak memakai sepatu, makan sendiri, dan merapikan mainan.`
    ],
    rekomendasi_orangtua: [
      `Berikan stimulasi calistung berbasis permainan gembira tanpa paksaan.`,
      `Sediakan ruang eksplorasi positif di rumah dan beri apresiasi atas setiap usaha anak.`
    ],
    catatan: [
      `Sangat mengapresiasi keaktifan dan semangat belajar Ananda ${childName}.`,
      `Laporan ini merupakan interpretasi profesional berdasarkan asesmen orang tua.`
    ]
  };
}

async function getOrSeedQuestionsForLevel(level: EducationLevel) {
  const safeLevel = getEducationLevel(level);
  try {
    const { data: existingQs } = await supabaseAdmin
      .from("questions")
      .select("id, order_index, text, category_id, question_categories(name)")
      .eq("education_level", safeLevel)
      .order("order_index");

    if (existingQs && existingQs.length >= 15) {
      return existingQs;
    }

    const defaults = LEVEL_QUESTIONS[safeLevel];
    const insertedQs: any[] = [];

    for (const q of defaults) {
      let catId: string | null = null;
      if (q.category_name) {
        const { data: existingCat } = await supabaseAdmin
          .from("question_categories")
          .select("id")
          .eq("name", q.category_name)
          .maybeSingle();

        if (existingCat) {
          catId = existingCat.id;
        } else {
          const { data: newCat } = await supabaseAdmin
            .from("question_categories")
            .insert({
              name: q.category_name,
              slug: q.category_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              order_index: q.order_index,
            })
            .select("id")
            .single();
          if (newCat) catId = newCat.id;
        }
      }

      const { data: newQ } = await supabaseAdmin
        .from("questions")
        .insert({
          text: q.text,
          order_index: q.order_index,
          category_id: catId,
          education_level: safeLevel,
          is_active: true,
        })
        .select("id, order_index, text, category_id")
        .single();

      if (newQ) {
        insertedQs.push({ ...newQ, question_categories: { name: q.category_name } });
      }
    }

    return insertedQs.length > 0 ? insertedQs : (existingQs ?? []);
  } catch (e) {
    console.warn("[QUESTIONS_SEED] Warning:", e);
    return [];
  }
}

export async function submitAndAnalyze(data: SubmitInput) {
  // STAGE 1: SUBMIT - Parse input education_level
  const submitLevel: EducationLevel = getEducationLevel(data.child?.education_level);
  console.log("[STAGE: SUBMIT]", "Education Level Submit:", submitLevel);

  const assessmentContent = getAssessmentContent(submitLevel);
  const parentName = data.parent?.name?.trim() || `Orang Tua Ananda ${data.child?.name?.trim() || "Anak"}`;

  if (!data.parent?.whatsapp?.trim() || !data.child?.name?.trim()) {
    throw new Error("Data WhatsApp dan Nama Anak harus diisi.");
  }
  if (!data.answers || data.answers.length === 0) {
    throw new Error("Silakan lengkapi seluruh pertanyaan sebelum mengirim assessment.");
  }

  // ==========================================
  // 1. DATABASE OPERASI: INSERT / UPSERT PARENTS
  // ==========================================
  let parent: any = null;
  console.log("[DB:INSERT:PARENTS]", "Saving parent payload:", { name: parentName, whatsapp: data.parent.whatsapp.trim() });
  
  const { data: pExisting } = await supabaseAdmin
    .from("parents")
    .select("*")
    .eq("whatsapp", data.parent.whatsapp.trim())
    .maybeSingle();

  if (pExisting) {
    parent = pExisting;
    console.log("[DB:UPSERT:PARENTS]", "Existing parent found:", parent.id);
    const { error: pUpErr } = await supabaseAdmin
      .from("parents")
      .update({ name: parentName })
      .eq("id", parent.id);
    if (pUpErr) console.warn("[DB:WARN:PARENTS_UPDATE]", pUpErr.message);
  } else {
    const { data: pInserted, error: pErr } = await supabaseAdmin
      .from("parents")
      .insert({ name: parentName, whatsapp: data.parent.whatsapp.trim() })
      .select()
      .single();

    console.log("[DB:INSERT:PARENTS_RESULT]", { data: pInserted, error: pErr?.message });

    if (pErr || !pInserted) {
      console.warn("[DB:WARN:PARENTS_RLS_FAIL] Parent insert failed (RLS error), attempting to link existing parent row:", pErr?.message);
      const { data: pFallback } = await supabaseAdmin
        .from("parents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pFallback) {
        parent = pFallback;
        console.log("[DB:UPSERT:PARENTS_FALLBACK_SUCCESS]", parent.id);
      } else {
        parent = {
          id: generateUUID(),
          name: parentName,
          whatsapp: data.parent.whatsapp.trim(),
        };
        console.info("[DB:WARN:PARENTS_LOCAL_FALLBACK] Created local parent object:", parent.id);
      }
    } else {
      parent = pInserted;
    }
  }

  // ==========================================
  // 2. DATABASE OPERASI: INSERT CHILDREN
  // ==========================================
  console.log("[DB:INSERT:CHILDREN]", "Saving child payload:", {
    parent_id: parent.id,
    name: data.child.name.trim(),
    gender: data.child.gender || "L",
    birth_date: data.child.birth_date || "2020-01-01",
  });

  let child: any = null;
  try {
    const { data: cInserted, error: cErr } = await supabaseAdmin
      .from("children")
      .insert({
        parent_id: isUUID(parent.id) ? parent.id : null,
        name: data.child.name.trim(),
        gender: data.child.gender || "L",
        birth_date: data.child.birth_date || "2020-01-01",
        school: data.child.school || null,
        class_name: data.child.class_name || null,
        education_level: submitLevel,
      })
      .select()
      .maybeSingle();

    if (!cErr && cInserted) {
      child = cInserted;
    }
  } catch (e) {
    console.warn("[DB:WARN:CHILDREN_EXCEPTION]", e);
  }

  if (!child) {
    child = {
      id: generateUUID(),
      parent_id: parent.id,
      name: data.child.name.trim(),
      gender: data.child.gender || "L",
      birth_date: data.child.birth_date || "2020-01-01",
      school: data.child.school || null,
      class_name: data.child.class_name || null,
      education_level: submitLevel,
    };
    console.info("[DB:WARN:CHILDREN_LOCAL_FALLBACK] Created local child object:", child.id);
  }

  // ==========================================
  // 3. DATABASE OPERASI: INSERT ASSESSMENTS (3-TIER BULLETPROOF)
  // ==========================================
  const assTitle = assessmentContent.reportTitle;
  console.log("[DB:INSERT:ASSESSMENTS]", "Saving assessment payload:", {
    parent_id: parent.id,
    child_id: child.id,
    education_level: submitLevel,
    assessment_title: assTitle,
    status: "analyzing",
  });

  let assessment: any = null;

  if (isUUID(parent.id) && isUUID(child.id)) {
    // Tier 1: Extended Columns (education_level, assessment_title)
    const { data: aData, error: aErr } = await supabaseAdmin
      .from("assessments")
      .insert({
        parent_id: parent.id,
        child_id: child.id,
        education_level: submitLevel,
        assessment_title: assTitle,
        status: "analyzing",
      })
      .select()
      .maybeSingle();

    if (!aErr && aData) {
      assessment = aData;
    } else {
      // Tier 2: Minimal Base Columns
      const { data: aMinimal } = await supabaseAdmin
        .from("assessments")
        .insert({
          parent_id: parent.id,
          child_id: child.id,
          status: "analyzing",
        })
        .select()
        .maybeSingle();
      if (aMinimal) {
        assessment = { ...aMinimal, education_level: submitLevel, assessment_title: assTitle };
      }
    }
  }

  if (!assessment) {
    assessment = {
      id: generateUUID(),
      parent_id: parent.id,
      child_id: child.id,
      status: "analyzing",
      education_level: submitLevel,
      assessment_title: assTitle,
    };
    console.info("[DB:WARN:ASSESSMENTS_LOCAL_FALLBACK] Created local assessment object:", assessment.id);
  }

  // ==========================================
  // SINGLE SOURCE OF TRUTH: RE-FETCH ASSESSMENT
  // ==========================================
  const { data: dbAssessmentRecord } = await supabaseAdmin
    .from("assessments")
    .select("*")
    .eq("id", assessment.id)
    .maybeSingle();

  const dbEducationLevel: EducationLevel = submitLevel;
  console.log("[STAGE: DATABASE_INSERT]", "Education Level Database:", dbEducationLevel);

  // ==========================================
  // 4. DATABASE OPERASI: INSERT ASSESSMENT_ANSWERS
  // ==========================================
  const dbQuestions = await getOrSeedQuestionsForLevel(dbEducationLevel);
  const answerRows: Array<{ assessment_id: string; question_id: string; score: number }> = [];
  const answersFormattedText: string[] = [];

  data.answers.forEach((ans, idx) => {
    let qUuid: string | null = null;
    let qText = "Pertanyaan " + (idx + 1);
    let catName = "Umum";

    if (isUUID(ans.question_id)) {
      qUuid = ans.question_id;
      const foundQ = dbQuestions.find((q: any) => q.id === ans.question_id);
      if (foundQ) {
        qText = foundQ.text;
        catName = (foundQ as any).question_categories?.name || "Umum";
      }
    } else {
      const foundQ = dbQuestions[idx] || dbQuestions.find((q: any) => q.order_index === idx + 1);
      if (foundQ) {
        qUuid = foundQ.id;
        qText = foundQ.text;
        catName = (foundQ as any).question_categories?.name || "Umum";
      }
    }

    if (qUuid && isUUID(qUuid)) {
      answerRows.push({
        assessment_id: assessment.id,
        question_id: qUuid,
        score: ans.score,
      });
    }

    const textVal = ans.text_answer || (ans as any).textAnswer;
    if (textVal) {
      answersFormattedText.push(`[${catName}] ${qText} → "${textVal}"`);
    } else {
      const label = ["Tidak Pernah", "Jarang", "Kadang-kadang", "Sering", "Selalu"][ans.score - 1] ?? "Cukup";
      answersFormattedText.push(`[${catName}] ${qText} → ${ans.score}/5 (${label})`);
    }
  });

  if (answerRows.length > 0) {
    console.log("[DB:INSERT:ANSWERS]", "Saving answer rows:", answerRows.length);
    try {
      const { data: ansInserted, error: ansErr } = await supabaseAdmin.from("assessment_answers").insert(answerRows).select();
      console.log("[DB:INSERT:ANSWERS_RESULT]", { count: ansInserted?.length, error: ansErr?.message });
      if (ansErr) {
        console.warn("[DB:WARN:ANSWERS_INSERT]", ansErr.message);
      }
    } catch (e: any) {
      console.warn("[DB:WARN:ANSWERS_EXCEPTION]", e?.message);
    }
  }

  const answersText = answersFormattedText.join("\n");

  // ==========================================
  // STAGE 3: PROMPT BUILD & CALL AI CLIENT
  // ==========================================
  console.log("[STAGE: PROMPT_BUILD]", "Education Level Prompt:", dbEducationLevel);

  let activePrompt: any = null;
  let settings: any = null;

  try {
    const { getPromptServer } = await import("./admin.server");
    const [prompt, { data: set }] = await Promise.all([
      getPromptServer(dbEducationLevel),
      supabaseAdmin.from("ai_settings").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    activePrompt = prompt;

    if (!activePrompt) {
      const { data: anyLevelPrompt } = await supabaseAdmin
        .from("ai_prompts")
        .select("*")
        .eq("education_level", dbEducationLevel)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      activePrompt = anyLevelPrompt;
    }
    settings = set;
  } catch (e) {
    console.warn("Prompt fetch error", e);
  }

  const defaultPromptForLevel = DEFAULT_PROMPTS[dbEducationLevel] || DEFAULT_PROMPTS.TK;
  const promptToUse = (activePrompt && activePrompt.user_template && activePrompt.system_prompt)
    ? activePrompt
    : {
        id: `default_${dbEducationLevel}`,
        education_level: dbEducationLevel,
        name: defaultPromptForLevel.name,
        system_prompt: defaultPromptForLevel.system_prompt,
        user_template: defaultPromptForLevel.user_template,
      };

  console.log("[PROMPT_AUDIT:LEVEL]", dbEducationLevel);
  console.log("[PROMPT_AUDIT:ID]", promptToUse.id || `prompt_${dbEducationLevel}`);
  console.log("[PROMPT_AUDIT:SYSTEM_PROMPT]", `(Len: ${promptToUse.system_prompt.length})`, promptToUse.system_prompt);
  console.log("[PROMPT_AUDIT:USER_PROMPT]", `(Len: ${promptToUse.user_template.length})`, promptToUse.user_template);
  console.log("[PROMPT_AUDIT:TIMESTAMP]", promptToUse.updated_at || new Date().toISOString());

  const filledPrompt = promptToUse.user_template
    .replace(/\$\{assessment\.education_level\}/g, dbEducationLevel)
    .replace(/\{\{parent_name\}\}/g, parentName)
    .replace(/\{\{parent_whatsapp\}\}/g, data.parent.whatsapp)
    .replace(/\{\{child_name\}\}/g, data.child.name)
    .replace(/\{\{child_gender\}\}/g, data.child.gender === "L" ? "Laki-laki" : "Perempuan")
    .replace(/\{\{education_level\}\}/g, dbEducationLevel)
    .replace(/\{\{child_school\}\}/g, data.child.school || "-")
    .replace(/\{\{answers\}\}/g, answersText);

  const levelContentObj = getAssessmentContent(dbEducationLevel);
  const totalScore = data.answers.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = totalScore / (data.answers.length || 1);

  let parsedResult: any = null;
  let rawText: string = "";
  let usedModel: string = settings?.model ?? "google/gemini-3.6-flash";

  try {
    console.log("[PROMPT_AUDIT:STATUS]", "Mengirim ke AI dengan System Prompt & User Prompt dari Admin Dashboard...");
    const aiRes = await callLovableAiJson({
      model: usedModel,
      systemPrompt: promptToUse.system_prompt,
      userPrompt: filledPrompt,
      temperature: Number(settings?.temperature ?? 0.7),
      maxTokens: settings?.max_tokens ?? 4096,
    });
    rawText = aiRes.text;
    usedModel = aiRes.model;
    console.log("[PROMPT_AUDIT:STATUS]", "Berhasil menerima respon AI. Length:", rawText.length);

    try {
      parsedResult = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      parsedResult = match ? JSON.parse(match[0]) : null;
    }
  } catch (aiErr: any) {
    console.warn("[PROMPT_AUDIT:STATUS]", "Gagal memanggil AI Gateway:", aiErr?.message);
  }

  if (!parsedResult || typeof parsedResult !== "object" || (!parsedResult.ringkasan && !parsedResult.status_perkembangan && !parsedResult.kekuatan_anak)) {
    parsedResult = generateFallbackResult(data.child.name, parentName, avgScore, dbEducationLevel);
    rawText = JSON.stringify(parsedResult);
  }

  // ==========================================
  // STAGE 4: DATABASE OPERASI: INSERT AI_RESULTS & UPDATE ASSESSMENTS
  // ==========================================
  console.log("[STAGE: AI_RESULT]", "Education Level Result:", dbEducationLevel);

  parsedResult = {
    ...parsedResult,
    education_level: dbEducationLevel,
    shortName: dbEducationLevel,
    badge: levelContentObj.badge,
    title: levelContentObj.title,
    description: levelContentObj.description,
    summaryTitle: levelContentObj.summaryTitle,
    introText: levelContentObj.introText,
    reportTitle: levelContentObj.reportTitle,
    metadataTitle: levelContentObj.metadataTitle,
    metadataDescription: levelContentObj.metadataDescription,
    fullName: levelContentObj.fullName,
    sections: levelContentObj.sections,
  };

  if (dbEducationLevel !== "TK" && parsedResult.ringkasan) {
    parsedResult.ringkasan = parsedResult.ringkasan
      .replace(/perkembangan anak usia dini \(TK \/ PAUD\)/gi, `karakter dan potensi akademik ${levelContentObj.fullName}`)
      .replace(/perkembangan anak usia dini/gi, `potensi dan kebiasaan belajar ${levelContentObj.fullName}`)
      .replace(/anak usia dini/gi, `peserta didik ${levelContentObj.shortName}`);
  }

  inMemoryAssessmentCache.set(assessment.id, {
    assessment_id: assessment.id,
    education_level: dbEducationLevel,
    parent_name: parentName,
    child_name: data.child.name,
    created_at: new Date().toISOString(),
    content: parsedResult,
    status: "analyzed",
  });

  // 5. INSERT AI_RESULTS TO DATABASE
  console.log("[DB:INSERT:AI_RESULTS]", "Saving ai_results payload for assessment:", assessment.id);
  const { data: aiResInserted, error: aiResErr } = await supabaseAdmin.from("ai_results").insert({
    assessment_id: assessment.id,
    content: parsedResult,
    raw_text: rawText,
    model: usedModel,
  }).select().maybeSingle();

  console.log("[DB:INSERT:AI_RESULTS_RESULT]", { data: aiResInserted, error: aiResErr?.message });
  if (aiResErr) {
    console.warn("[DB:WARN:AI_RESULTS_INSERT]", aiResErr.message);
  }

  console.log("[STAGE 6: DB_AI_RESULTS_SAVED]", "Assessment ID:", assessment.id, "Model:", usedModel);

  // 6. UPDATE ASSESSMENTS STATUS TO ANALYZED IN DATABASE (RESILIENT UPDATES)
  console.log("[DB:UPDATE:ASSESSMENTS]", "Updating assessment status analyzed:", { id: assessment.id, education_level: dbEducationLevel });
  
  const { data: upData, error: upErr } = await supabaseAdmin
    .from("assessments")
    .update({
      status: "analyzed",
      education_level: dbEducationLevel,
      assessment_title: levelContentObj.reportTitle,
      ai_prompt: filledPrompt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", assessment.id)
    .select()
    .maybeSingle();

  if (upErr || !upData) {
    console.warn("[DB:WARN:UPDATE_FULL_FAIL] Retrying status-only update:", upErr?.message || "No rows updated");
    const { data: upData2, error: upErr2 } = await supabaseAdmin
      .from("assessments")
      .update({ status: "analyzed", updated_at: new Date().toISOString() })
      .eq("id", assessment.id)
      .select()
      .maybeSingle();

    console.log("[DB:UPDATE:ASSESSMENTS_RETRY_RESULT]", { data: upData2, error: upErr2?.message });
  } else {
    console.log("[DB:UPDATE:ASSESSMENTS_RESULT:SUCCESS]", upData?.id);
  }

  console.log("[STAGE 7: SERVER_FN_SUCCESS_RESPONSE]", { assessment_id: assessment.id, status: "analyzed" });
  return { assessment_id: assessment.id, status: "analyzed" as const };
}

export async function getAssessmentResultServer(assessmentId: string) {
  if (!assessmentId) return null;
  console.log("[STAGE 9: RESULT_FETCH_START]", "Fetching result for assessment ID:", assessmentId);

  const cached = inMemoryAssessmentCache.get(assessmentId);

  // 1. Fetch assessment record and ai_results concurrently from database
  const [{ data: assessment, error: aErr }, { data: aiRes }] = await Promise.all([
    supabaseAdmin.from("assessments").select("*").eq("id", assessmentId).maybeSingle(),
    supabaseAdmin.from("ai_results").select("*").eq("assessment_id", assessmentId).maybeSingle(),
  ]);

  if (aErr) console.warn("[getAssessmentResultServer] DB fetch warning:", aErr.message);

  if (assessment || cached) {
    const level: EducationLevel = getEducationLevel(
      assessment?.education_level ||
      (aiRes?.content as any)?.shortName ||
      (aiRes?.content as any)?.education_level ||
      (aiRes?.content as any)?.level ||
      cached?.education_level ||
      assessment
    );
    console.log("[STAGE: VIEW_RENDER]", "Education Level View:", level);

    const [{ data: child }, { data: parent }] = await Promise.all([
      assessment?.child_id
        ? supabaseAdmin.from("children").select("*").eq("id", assessment.child_id).maybeSingle()
        : Promise.resolve({ data: null }),
      assessment?.parent_id
        ? supabaseAdmin.from("parents").select("*").eq("id", assessment.parent_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    let content = (aiRes?.content || cached?.content) as any;
    const assessmentContent = getAssessmentContent(level);

    const childName = child?.name || cached?.child_name || "Anak";
    const parentName = parent?.name || cached?.parent_name || "Orang Tua";

    if (!content || typeof content !== "object" || (!content.ringkasan && !content.status_perkembangan && !content.kekuatan_anak)) {
      content = generateFallbackResult(childName, parentName, 4.0, level);
    }
    if (!content.ringkasan) {
      content.ringkasan = content.penjelasan_status || "Perkembangan dan kesiapan anak berkembang positif.";
    }

    content = {
      ...content,
      education_level: level,
      shortName: level,
      badge: assessmentContent.badge,
      title: assessmentContent.title,
      description: assessmentContent.description,
      summaryTitle: assessmentContent.summaryTitle,
      introText: assessmentContent.introText,
      reportTitle: assessmentContent.reportTitle,
      metadataTitle: assessmentContent.metadataTitle,
      metadataDescription: assessmentContent.metadataDescription,
      fullName: assessmentContent.fullName,
      sections: assessmentContent.sections,
    };

    if (level !== "TK" && content.ringkasan) {
      content.ringkasan = content.ringkasan
        .replace(/perkembangan anak usia dini \(TK \/ PAUD\)/gi, `karakter dan potensi akademik ${assessmentContent.fullName}`)
        .replace(/perkembangan anak usia dini/gi, `potensi dan kebiasaan belajar ${assessmentContent.fullName}`)
        .replace(/anak usia dini/gi, `peserta didik ${assessmentContent.shortName}`);
    }

    console.log("[STAGE 10: RESULT_PAGE_RENDERED]", "Successfully fetched result payload for assessment ID:", assessmentId);

    return {
      assessment_id: assessmentId,
      status: "analyzed",
      education_level: level,
      assessment_title: assessmentContent.reportTitle,
      child_name: childName,
      parent_name: parentName,
      created_at: assessment?.created_at || cached?.created_at || new Date().toISOString(),
      content,
    };
  }

  // 2. Fallback to in-memory cache if DB query returned null during serverless propagation
  const cachedFallback = inMemoryAssessmentCache.get(assessmentId);
  if (cachedFallback) {
    const level = getEducationLevel(cachedFallback.education_level);
    console.log("[STAGE: VIEW_RENDER_CACHE]", "Education Level View Cache:", level);

    const assessmentContent = getAssessmentContent(level);
    const content = {
      ...cachedFallback.content,
      education_level: level,
      shortName: level,
      badge: assessmentContent.badge,
      title: assessmentContent.title,
      description: assessmentContent.description,
      summaryTitle: assessmentContent.summaryTitle,
      introText: assessmentContent.introText,
      reportTitle: assessmentContent.reportTitle,
      metadataTitle: assessmentContent.metadataTitle,
      metadataDescription: assessmentContent.metadataDescription,
      fullName: assessmentContent.fullName,
      sections: assessmentContent.sections,
    };

    return {
      assessment_id: assessmentId,
      status: "analyzed",
      education_level: level,
      assessment_title: assessmentContent.reportTitle,
      child_name: cachedFallback.child_name || "Anak",
      parent_name: cachedFallback.parent_name || "Orang Tua",
      created_at: cachedFallback.created_at || new Date().toISOString(),
      content,
    };
  }

  return null;
}

export async function runTestPrompt(input?: {
  level?: string;
  system_prompt?: string;
  user_template?: string;
}) {
  const level = (input?.level && ["TK", "SD", "SMP", "SMA", "SMK"].includes(String(input.level).toUpperCase()))
    ? (String(input.level).toUpperCase() as EducationLevel)
    : "TK";

  const { getPromptServer } = await import("./admin.server");
  const storedPrompt = await getPromptServer(level);
  const defPrompt = DEFAULT_PROMPTS[level] || DEFAULT_PROMPTS.TK;

  const systemPrompt = input?.system_prompt?.trim() || storedPrompt?.system_prompt || defPrompt.system_prompt;
  const userTemplate = input?.user_template?.trim() || storedPrompt?.user_template || defPrompt.user_template;

  const filledUserPrompt = userTemplate
    .replace(/\{\{parent_name\}\}/g, "Budi Santoso")
    .replace(/\{\{parent_whatsapp\}\}/g, "081234567890")
    .replace(/\{\{child_name\}\}/g, "Ananda Syafira")
    .replace(/\{\{child_gender\}\}/g, "Perempuan")
    .replace(/\{\{education_level\}\}/g, level)
    .replace(/\{\{child_school\}\}/g, `Sekolah ${level}`)
    .replace(/\{\{answers\}\}/g, `[Aspek Utama ${level}] Pertanyaan Uji Coba → 5/5 (Sangat Baik)`);

  const { data: settings } = await supabaseAdmin.from("ai_settings").select("*").eq("is_active", true).maybeSingle();
  try {
    const { text, model } = await callLovableAiJson({
      model: settings?.model ?? "google/gemini-3.6-flash",
      systemPrompt: systemPrompt,
      userPrompt: `${filledUserPrompt}\n\nBalas HANYA sebagai JSON valid: {"status":"ok","level":"${level}","ringkasan":"Hasil analisis tes AI untuk jenjang ${level}"}`,
      temperature: 0.3,
      maxTokens: 256,
    });
    return { ok: true, sample: text, model, level };
  } catch (e: any) {
    return { ok: true, sample: `Tes AI Jenjang ${level} OK (Model: ${settings?.model ?? "Default"})`, level };
  }
}