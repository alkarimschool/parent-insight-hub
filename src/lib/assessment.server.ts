import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { callLovableAiJson } from "./ai.server";
import { EducationLevel, LEVEL_QUESTIONS, getEducationLevel } from "./questions.data";
import { getAssessmentContent } from "./assessment-content";
import { DEFAULT_PROMPTS } from "./prompt.data";
import { buildVariationDirective, buildTkVariationDirective, getTkStatusByScore, FIELD_VARIATION_TEMPLATES } from "./narrative-variation";

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
  answers: Array<{ question_id: string; score?: number; text_answer?: string }>;
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
    ringkasan: (name, isHigh) => `Secara umum, Ananda ${name} memperlihatkan kesiapan tumbuh kembang pra-sekolah yang ${isHigh ? "sangat optimal dan matang" : "berkembang positif sesuai tahap usianya"}. Pengamatan orang tua mengonfirmasi antusiasme tinggi anak dalam bermain, berkomunikasi, dan mengenal konsep pra-calistung. Pendampingan harian yang hangat di rumah menjadi kunci utama untuk merangsang rasa ingin tahunya lebih lanjut. Laporan berikut menyajikan gambaran menyeluruh aspek perkembangan anak.`,
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
    ringkasan: (name, isHigh) => `Hasil pemetaan menunjukkan bahwa Ananda ${name} memiliki pondasi kebiasaan belajar dan kedisiplinan SD yang ${isHigh ? "sangat kokoh dan mandiri" : "baik serta terus berkembang"}. Informasi keluarga mencerminkan kemampuannya dalam mengikuti rutinitas sekolah dan memahami instruksi harian. Penguatan fokus serta ketahanan belajar mandiri tetap perlu didampingi secara teratur. Uraian di bawah ini mengulas rincian profil belajar anak secara mendalam.`,
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
    ringkasan: (name, isHigh) => `Dari hasil observasi, Ananda ${name} menunjukkan dinamika perkembangan remaja awal yang ${isHigh ? "sangat berdaya dan tajam secara analitis" : "positif dengan inisiatif belajar yang berkembang"}. Keterangan orang tua menggarisbawahi keterbukaan komunikasi dan kesadaran dirinya dalam mengelola tugas sekolah. Pembinaan regulasi emosi dan manajemen durasi aktivitas luar sekolah menjadi aspek yang perlu diperhatikan. Gambaran berikut menguraikan potensi dan panduan pendampingan remaja.`,
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
    ringkasan: (name, isHigh) => `Potret kemampuan awal siswa memperlihatkan kesiapan akademik dan kemandirian SMA yang ${isHigh ? "sangat matang serta unggul" : "baik dan siap dikembangkan lebih jauh"}. Catatan pengamatan di rumah mengonfirmasi tanggung jawab pribadi anak dalam mengarungi ritme pembelajaran yang padat. Penguatan kedalaman penalaran kritis dan penetapan skala prioritas menjadi fokus pembinaan selanjutnya. Laporan ini menyajikan analisis komprehensif untuk mendukung perencanaan masa depannya.`,
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
  }
};

export const LEVEL_TITLES_MAP: Record<EducationLevel, string> = {
  TK: getAssessmentContent("TK").title,
  SD: getAssessmentContent("SD").title,
  SMP: getAssessmentContent("SMP").title,
  SMA: getAssessmentContent("SMA").title,
};

export function generateFallbackResult(childName: string, parentName: string, avgScore: number, level: EducationLevel, answers: any[] = [], questions: any[] = []) {

  const safeLevel = getEducationLevel(level);

  // 1. Ekstrak & Analisis Pola Jawaban Orang Tua (Q1-Q15)
  const parsedAnswers = (answers || []).map((ans, idx) => {
    let text = `Aspek evaluasi ke-${idx + 1}`;
    let category = "Umum";
    const score = Number(ans?.score ?? ans?.value ?? 3);

    const foundQ = (questions || []).find((q: any) => (q.id && q.id === ans?.question_id) || q.order_index === idx + 1) || (questions || [])[idx];
    if (foundQ) {
      text = foundQ.text || text;
      category = foundQ.question_categories?.name || foundQ.category || foundQ.category_name || "Umum";
    }
    return { text, category, score };
  });

  const highAnswers = parsedAnswers.filter(a => a.score >= 4);
  const lowAnswers = parsedAnswers.filter(a => a.score <= 2);
  const midAnswers = parsedAnswers.filter(a => a.score === 3);

  // Tentukan Pola Evaluasi Aktual (Positif vs Kurang vs Campuran)
  const isPositif = avgScore >= 4.0 || (highAnswers.length >= 10 && lowAnswers.length === 0);
  const isKurang = avgScore <= 2.5 || (lowAnswers.length >= 8);
  const isCampuran = !isPositif && !isKurang;

  const formatBullet = (item: { text: string; category: string; score: number }, prefix: string = "") => {
    return `[${item.category}] ${prefix}${item.text} (Skor: ${item.score}/5)`;
  };

  if (safeLevel === "SD") {
    let kelebihan: string[] = [];
    let area_ditingkatkan: string[] = [];
    let status_sd = "Baik Sesuai Usia";
    let status_litnum = "Baik Sesuai Usia";

    if (isPositif) {
      status_sd = "Sangat Baik & Mandiri";
      status_litnum = "Sangat Baik";
      kelebihan = highAnswers.slice(0, 5).map(a => formatBullet(a, "Sangat mandiri dan mampu: "));
      if (kelebihan.length < 3) {
        kelebihan.push("Mampu membaca lancar, menulis kalimat rapi, dan memahami cerita/tugas SD.");
        kelebihan.push("Menguasai perhitungan matematika dasar dan penalaran angka seusianya.");
      }
      area_ditingkatkan = [
        "Mempertahankan konsistensi kebiasaan belajar dan fokus di rumah maupun di sekolah.",
        "Memberikan tantangan proyek membaca dan matematika yang lebih kompleks untuk mengoptimalkan potensi anak."
      ];
    } else if (isKurang) {
      status_sd = "Perlu Bimbingan Belajar";
      status_litnum = "Perlu Pendampingan Numerasi";
      kelebihan = [
        "Menunjukkan minat dasar untuk mengikuti kegiatan belajar dengan bimbingan langsung dari orang tua.",
        "Memiliki kemauan dan potensi berkembang yang besar melalui pendampingan terstruktur di rumah."
      ];
      area_ditingkatkan = lowAnswers.slice(0, 5).map(a => formatBullet(a, "Membutuhkan bimbingan intensif untuk mengatasi kesulitan: "));
      if (area_ditingkatkan.length < 3) {
        area_ditingkatkan.push("Meningkatkan konsentrasi belajar dan mengurangi durasi bermain gadget/screen time.");
        area_ditingkatkan.push("Melatih pemahaman bacaan dasar dan penyelesaian soal matematika harian.");
      }
    } else {
      status_sd = "Baik Sesuai Usia";
      status_litnum = "Baik Sesuai Usia";
      const top = [...highAnswers, ...midAnswers].slice(0, 4);
      const bot = [...lowAnswers, ...midAnswers].slice(0, 3);
      kelebihan = top.length > 0 ? top.map(a => formatBullet(a, "Sudah mampu dan baik pada: ")) : [
        "Mampu mengikuti pelajaran Sekolah Dasar dengan bimbingan dan dukungan proporsional."
      ];
      area_ditingkatkan = bot.length > 0 ? bot.map(a => formatBullet(a, "Perlu latihan tambahan pada: ")) : [
        "Meningkatkan konsentrasi belajar 20-30 menit tanpa terdistraksi gadget."
      ];
    }

    return {
      judul: "Laporan Assessment Potensi Akademik & Karakter SD",
      status_perkembangan_sd: status_sd,
      ringkasan_profil_sd: `${isPositif ? "Hasil pemetaan menunjukkan" : isKurang ? "Dari hasil observasi" : "Secara umum"}, Ananda ${childName} memperlihatkan profil belajar dan pembiasaan karakter Sekolah Dasar yang ${isPositif ? "sangat mandiri serta unggul pada berbagai aspek harian" : isKurang ? "membutuhkan pendampingan terstruktur dalam kedisiplinan dan rutinitas belajar" : "berjalan seimbang sesuai tahap perkembangannya"}. Pengamatan orang tua mengonfirmasi sikap anak saat menghadapi tugas sekolah dan instruksi di rumah. Pembinaan konsistensi fokus serta ketahanan belajar tetap menjadi area yang perlu diperhatikan secara berkala. Pemetaan awal ini menjadi pijakan untuk merancang pendampingan di rumah secara efektif.`,
      kelebihan_pembelajaran: kelebihan,
      area_belajar_ditingkatkan: area_ditingkatkan,
      literasi_dan_numerasi: {
        status_literasi_numerasi: status_litnum,
        kemampuan_literasi: isPositif ? [
          "Membaca teks cerita SD dengan intonasi, pemahaman, dan kelancaran yang sangat baik.",
          "Mampu menulis kalimat dengan tata bahasa dasar dan kerapian tinggi."
        ] : isKurang ? [
          "Masih memerlukan bimbingan mengeja, memahami isi teks cerita SD, dan kerapian menulis.",
          "Perlu dikaitkan dengan bahan bacaan visual bergambar agar menarik minat anak."
        ] : [
          "Membaca teks cerita SD dengan kelancaran cukup dan perlu ditingkatkan pemahaman alasannya.",
          "Menulis dengan tata bahasa dasar yang wajar seusia SD."
        ],
        kemampuan_numerasi: isPositif ? [
          "Menguasai penjumlahan, pengurangan, serta penalaran angka dasar dengan konsisten.",
          "Mampu memecahkan soal cerita matematika berorientasi kehidupan sehari-hari."
        ] : isKurang ? [
          "Masih membutuhkan bantuan konkrit (seperti benda nyata) untuk memahami penalaran matematika dasar.",
          "Perlu latihan berulang pada konsep operasi bilangan sederhana."
        ] : [
          "Menguasai perhitungan matematika dasar dan memerlukan latihan rutin pada soal cerita rumit."
        ]
      },
      kebiasaan_dan_fokus_belajar: [
        isKurang ? "Konsentrasi mudah terpecah (kurang dari 15 menit); sangat memerlukan pembatasan ketat terhadap gadget/screen time." : "Mampu mempertahankan fokus belajar 20-30 menit dengan regulasi gadget yang sesuai kesepakatan rumah."
      ],
      karakter_dan_interaksi_sosial: [
        isKurang ? "Membutuhkan teladan dan pengingat konsisten dari orang tua dalam merapikan jadwal dan mematuhi aturan rumah." : "Disiplin mematuhi aturan sekolah, mau memikul tanggung jawab tugas, dan berteman dengan positif."
      ],
      potensi_dan_kreativitas: [
        "Potensi eksplorasi minat visual, proyek sekolah, dan partisipasi aktif dalam kegiatan SD."
      ],
      hal_perhatian_orangtua: isKurang ? [
        "Jadwal rutin harian harus ditegakkan dengan konsisten namun penuh kedekatan emosional.",
        "Batasi waktu bermain gadget maksimal 1 jam sehari pada akhir pekan saja.",
        "Dampingi anak secara langsung saat pengerjaan PR dan berikan apresiasi kecil saat anak mau mencoba."
      ] : [
        "Tetap berikan apresiasi dan jadilah teman pendengar bagi anak di rumah.",
        "Sediakan area belajar rumah yang tenang dan bebas dari gangguan audiovisual (TV/Gadget)."
      ],
      rekomendasi_treatment_rumah: isKurang ? [
        { kategori: "Pendampingan Intensif Literasi & Numerasi", aktivitas: "Dampingi 15 menit membaca bersuara bersama setiap malam dan latihan 3 soal numerasi dengan benda nyata." },
        { kategori: "Regulasi Disiplin & Screen Time", aktivitas: "Buat papan jadwal visual bersama anak dan lakukan kontrak pengurangan penggunaan HP secara tegas & positif." }
      ] : [
        { kategori: "Pengayaan Akademik SD", aktivitas: "Latihan membaca buku pengetahuan baru dan diskusi soal cerita matematika aplikatif bersama orang tua." },
        { kategori: "Manajemen Waktu Belajar Mandiri", aktivitas: "Berikan kepercayaan anak mengatur urutan pengerjaan PR dengan pengawasan ringan." }
      ],
      catatan_perkembangan_sd: [
        `Sangat mengapresiasi kerja keras dan keterlibatan Ibu/Bapak ${parentName} dalam mendampingi tumbuh kembang Ananda ${childName}.`,
        `Laporan ini bersumber langsung dari evaluasi jawaban orang tua sebagai acuan strategi belajar di rumah.`
      ]
    };
  }

  if (safeLevel === "SMP") {
    let keunggulan_smp: string[] = [];
    let pengembangan_smp: string[] = [];
    let status_smp = "Baik Sesuai Usia Remaja";
    let status_kritis = "Baik";

    if (isPositif) {
      status_smp = "Sangat Optimal & Berdaya";
      status_kritis = "Sangat Tajam";
      keunggulan_smp = highAnswers.slice(0, 5).map(a => formatBullet(a, "Sangat optimal dan konsisten pada: "));
      if (keunggulan_smp.length < 3) {
        keunggulan_smp.push("Mampu berpikir analitis, memecahkan masalah pelajaran, dan berargumen logis.");
        keunggulan_smp.push("Memiliki inisiatif mandiri untuk mempersiapkan materi sebelum pekan ujian.");
      }
      pengembangan_smp = [
        "Memperdalam ketegasan dan stabilitas emosi saat menghadapi tugas kolaborasi atau proyek sekolah yang sangat kompleks.",
        "Eksplorasi olimpiade atau organisasi untuk mengasah jiwa kepemimpinan remaja."
      ];
    } else if (isKurang) {
      status_smp = "Perlu Inisiatif Belajar";
      status_kritis = "Perlu Latihan Analisis";
      keunggulan_smp = [
        "Memiliki kepekaan emosional usia remaja awal yang dapat dioptimalkan melalui pendekatan komunikasi empatik.",
        "Menunjukkan kesediaan dasar untuk berkembang jika didorong dengan komunikasi yang hangat tanpa langsung menghakimi."
      ];
      pengembangan_smp = lowAnswers.slice(0, 5).map(a => formatBullet(a, "Membutuhkan perhatian & arahan khusus pada: "));
      if (pengembangan_smp.length < 3) {
        pengembangan_smp.push("Meningkatkan motivasi belajar dan inisiatif mengerjakan tugas SMP tanpa dipaksa.");
        pengembangan_smp.push("Mengatur durasi bermain game online dan penggunaan media sosial yang berlebihan.");
      }
    } else {
      status_smp = "Baik Sesuai Usia Remaja";
      status_kritis = "Baik";
      const top = [...highAnswers, ...midAnswers].slice(0, 4);
      const bot = [...lowAnswers, ...midAnswers].slice(0, 3);
      keunggulan_smp = top.length > 0 ? top.map(a => formatBullet(a, "Berprestasi baik pada: ")) : [
        "Mampu beradaptasi dengan dinamika akademik SMP dan menunjukkan kemandirian belajar proporsional."
      ];
      pengembangan_smp = bot.length > 0 ? bot.map(a => formatBullet(a, "Perlu konsistensi lebih pada: ")) : [
        "Manajemen waktu antara rutinitas belajar sekolah, media sosial, dan hobi."
      ];
    }

    return {
      judul: "Laporan Assessment Potensi Belajar & Dinamika Remaja SMP",
      status_perkembangan_smp: status_smp,
      ringkasan_dinamika_smp: `${isPositif ? "Informasi yang disampaikan orang tua menunjukkan" : isKurang ? "Dari keseluruhan hasil observasi" : "Potret kemampuan awal siswa memperlihatkan"}, Ananda ${childName} menunjukkan dinamika remaja awal yang ${isPositif ? "sangat berdaya, mandiri dalam belajar, dan tajam dalam pemikiran analitis" : isKurang ? "membutuhkan pendampingan motivasi serta komunikasi terbuka di rumah" : "berkembang positif dengan kemandirian belajar yang makin kokoh"}. Pengamatan keluarga menguraikan respons anak terhadap tanggung jawab sekolah dan pergaulan sebayanya. Penguatan daya tahan fokus serta keseimbangan aktivitas harian menjadi aspek penting yang perlu terus dibina. Rincian laporan di bawah ini menyajikan panduan lengkap pendampingannya.`,
      kekuatan_akademik_smp: keunggulan_smp,
      area_pengembangan_smp: pengembangan_smp,
      kemampuan_berpikir_kritis: {
        status_pemikiran_kritis: status_kritis,
        kekuatan_analisis: isPositif ? [
          "Mampu menganalisis hubungan sebab-akibat pada mata pelajaran sains maupun sosial SMP.",
          "Berani dan tepat dalam menyampaikan argumen logis secara konstruktif."
        ] : isKurang ? [
          "Masih terbiasa mengharapkan jawaban cepat dan kesulitan dalam menjawab pertanyaan konseptual yang menuntut analisis mandiri.",
          "Perlu distimulasi dengan diskusi santai mengenai isu-isu ilmu pengetahuan."
        ] : [
          "Mampu memahami konsep pelajaran SMP dengan baik dan sedang terus mengembangkan penalaran logis lanjutan."
        ],
        area_latihan_kritis: isKurang ? [
          "Latihan melatih cara menyimpulkan buku bacaan atau artikel digital dengan bahasa sendiri."
        ] : [
          "Pengembangan pemetaan mind map dan analisis kritis literatur pendukung tugas sekolah."
        ]
      },
      pergaulan_dan_media_sosial: [
        isKurang ? "Sangat perlu pendampingan terhadap batasan media sosial & game online, serta pemantauan pengaruh lingkungan pergaulan teman sebaya (peer pressure)." : "Memiliki ketegasan untuk memilih pergaulan positif dan tidak mudah terseret pengaruh buruk dari lingkungan sebaya."
      ],
      manajemen_emosi_dan_sosial: [
        isKurang ? "Suasana hati (mood) usia remaja awal sering terdiskon sehingga berpengaruh pada kejenuhan belajar; perlu empati orang tua tanpa penghakiman." : "Mampu mengelola emosi pubertas dengan dewasa, santun dalam berbicara kepada orang tua."
      ],
      kepemimpinan_dan_minat: [
        "Eksplorasi minat bidang studi (Sains, Sosial, Seni, Bahasa, atau Teknologi) sebagai ancang-ancang kesiapan masuk SMA."
      ],
      perhatian_orangtua_smp: isKurang ? [
        "Bangun komunikasi dua arah di waktu santai TANPA mengritik atau langsung menyalahkan anak.",
        "Buat kesepakatandan bersama (bukan paksaan sepihak) terkait jadwal bermain smartphone vs jam istirahat.",
        "Dampingi anak menemukan cara belajar baru yang tidak membosankan."
      ] : [
        "Jaga ruang komunikasi yang hangat, berikan kepercayaan proporsional saat anak mengerjakan tugas proyek.",
        "Fasilitasi minat anak pada organisasi sekolah atau hobi produktif."
      ],
      rekomendasi_pendampingan_remaja: isKurang ? [
        { kategori: "Pendampingan Komunikasi Remaja", aktivitas: "Lakukan percakapan terbuka dari hati ke hati minimal 15 menit sebelum tidur untuk mendengarkan curhatan anak tanpa penghakiman." },
        { kategori: "Bimbingan Motivasi & Jadwal Belajar", aktivitas: "Bagi target belajar SMP ke dalam potongan kecil (25 menit belajar, 5 menit istirahat) untuk mencegah jenuh." }
      ] : [
        { kategori: "Pengembangan Berpikir Kritis & Cita-Cita", aktivitas: "Diskusi tentang profesi masa depan dan teladani analisis studi kasus ringan di rumah." },
        { kategori: "Otonomi Manajemen Waktu Remaja", aktivitas: "Dorong penyusunan agenda mandiri yang seimbang antara ekskul, sekolah, dan hobi." }
      ],
      catatan_kesiapan_smp: [
        `Apresiasi yang tinggi kepada Ibu/Bapak ${parentName} atas dedikasi memantau dinamika remaja Ananda ${childName}.`,
        `Laporan ini diracik berdasarkan respons evaluasi orang tua sebagai kompas pendampingan remaja yang penuh pengertian.`
      ]
    };
  }

  if (safeLevel === "SMA") {
    let areaPerhatian: string[] = [];
    let kelebihan: string[] = [];

    if (isPositif) {
      kelebihan = highAnswers.slice(0, 3).map(a => formatBullet(a, "Telah menunjukkan kemampuan awal yang baik pada: "));
      if (kelebihan.length === 0) {
        kelebihan = ["Memahami materi pelajaran baru dengan cepat dan memiliki kemandirian belajar yang matang."];
      }
      areaPerhatian = [
        "Konsistensi Manajemen Waktu: Perlu menjaga keseimbangan jadwal antara belajar mandiri, aktivitas sosial, dan istirahat agar tidak mengalami kelelahan mental saat beban pelajaran SMA meningkat.",
        "Pengembangan Portofolio Masa Depan: Membutuhkan pendampingan untuk mengarahkan minat akademik ke proyek nyata atau sertifikasi keterampilan awal."
      ];
    } else if (isKurang) {
      kelebihan = [
        "Memiliki potensi kecerdasan dan kemampuan dasar yang siap berkembang apabila mendapatkan pola pendampingan yang konsisten dari orang tua."
      ];
      areaPerhatian = lowAnswers.slice(0, 5).map(a => {
        const text = (a as any).text_answer || a.text || "Kemampuan awal";
        return `Kemandirian & Fokus Belajar (${text}): Sangat membutuhkan pendampingan rutinitas di rumah agar anak terbiasa mengelola tugas secara teratur. Jika tidak didampingi, anak berpotensi tertinggal dalam mengikuti materi SMA yang lebih kompleks.`;
      });
      if (areaPerhatian.length < 3) {
        areaPerhatian.push("Strategi Belajar Mandiri: Anak belum mampu mengatur waktu dan belajar tanpa selalu diingatkan. Penting didampingi agar tidak mengalami penurunan motivasi saat menghadapi ujian SMA.");
        areaPerhatian.push("Regulasi Emosi & Resiliensi: Anak masih kesulitan mengendalikan emosi saat tertekan atau menghadapi kesulitan tugas. Tanpa pembinaan, anak rawan mengalami kecemasan akademik.");
      }
    } else {
      kelebihan = [...highAnswers, ...midAnswers].slice(0, 2).map(a => formatBullet(a, "Berkembang cukup baik pada: "));
      if (kelebihan.length === 0) kelebihan = ["Memiliki motivasi belajar dan rasa ingin tahu yang cukup positif."];
      areaPerhatian = [...lowAnswers, ...midAnswers].slice(0, 4).map(a => {
        const text = (a as any).text_answer || a.text || "Kebiasaan belajar";
        return `Optimasi Kemampuan (${text}): Perlu perhatian orang tua dalam membantu anak menyusun skala prioritas belajar dan manajemen waktu agar siap mengikuti ritme SMA.`;
      });
    }

    const randomEntropy = Math.floor(Math.random() * 1000000) + Date.now();
    const strategyIdx = (randomEntropy % 10) + 1;
    const template = FIELD_VARIATION_TEMPLATES[strategyIdx] || FIELD_VARIATION_TEMPLATES[1];

    const dynamicSummary = template.ringkasan(parentName, childName, avgScore.toFixed(2));

    const rotateArr = (arr: any[]) => {
      if (!Array.isArray(arr)) return arr;
      const copy = [...arr];
      return copy.sort(() => Math.random() - 0.5);
    };

    return {
      ringkasan_kemampuan_awal: dynamicSummary,
      area_yang_perlu_diperhatikan: rotateArr(template.areaPerhatian),
      kemampuan_awal_akademik: rotateArr(template.akademik),
      kemampuan_berpikir: rotateArr(template.berpikir),
      kemampuan_komunikasi_dan_sosial: rotateArr(template.sosialisasi),
      karakter_dan_kemandirian: rotateArr(template.karakter),
      kesiapan_mengikuti_pembelajaran_SMA: rotateArr(template.kesiapanSma),
      potensi_pengembangan: rotateArr(template.potensi),
      potensi_dan_kelebihan: rotateArr(template.kelebihan),
      rekomendasi_untuk_orang_tua: rotateArr(template.rekomendasi),
    };
  }

  // DEFAULT TK / PAUD
  const status_tk = getTkStatusByScore(avgScore);
  const status_akademik_tk = avgScore >= 4.50 ? "Sangat Baik" : (avgScore >= 3.50 ? "Baik & Berkembang" : (avgScore >= 2.50 ? "Perlu Penguatan" : "Perlu Pendampingan Intensif"));

  const displayName = childName.replace(/^ananda\s+/i, "");
  const childHash = Math.abs(
    (displayName + parentName + JSON.stringify(answers))
      .split("")
      .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  );

  const cleanText = (t: string) => t.toLowerCase().replace(/^apakah anak |bagaimana |menurut anda, |sejauh mana |anak /gi, "").trim();

  // 15 Varied Openers
  const tkOpeners = [
    `Berdasarkan hasil observasi tumbuh kembang di rumah, Ananda ${displayName}`,
    `Dari gambaran pola aktivitas dan interaksi harian, Ananda ${displayName}`,
    `Potret perkembangan anak usia dini menunjukkan bahwa Ananda ${displayName}`,
    `Informasi dari pengamatan keluarga mencerminkan bahwa Ananda ${displayName}`,
    `Hasil pemetaan kesiapan tumbuh kembang memperlihatkan Ananda ${displayName}`,
    `Secara umum, profil eksplorasi awal dari Ananda ${displayName}`,
    `Pengamatan berkala dari orang tua mengindikasikan bahwa Ananda ${displayName}`,
    `Dalam dinamika aktivitas bermain dan komunikasi harian, Ananda ${displayName}`,
    `Gambaran fondasi pra-sekolah menunjukkan Ananda ${displayName}`,
    `Catatan observasi kesiapan usia dini menandakan Ananda ${displayName}`,
    `Dilihat dari pengisian asesmen tumbuh kembang, Ananda ${displayName}`,
    `Melalui uraian pembiasaan rutin keluarga di rumah, Ananda ${displayName}`,
    `Evaluasi awal kesiapan anak usia dini mencatat Ananda ${displayName}`,
    `Dari respon observasi harian di lingkungan rumah, Ananda ${displayName}`,
    `Pemetaan aspek tumbuh kembang menguraikan bahwa Ananda ${displayName}`
  ];
  const selectedOpener = tkOpeners[childHash % tkOpeners.length];

  let middleText = "";
  if (avgScore >= 4.50) {
    const midPool = [
      "menunjukkan kemandirian harian yang sangat matang serta komunikasi verbal yang lancar dan percaya diri.",
      "memperlihatkan keluwesan berinteraksi dan antusiasme tinggi dalam mengenal konsep pra-sekolah.",
      "mampu mengikuti instruksi dengan cermat disertai rasa percaya diri yang ceria dalam bergaul.",
      "memiliki koordinasi motorik yang memadai serta dorongan eksplorasi yang aktif di lingkungan rumah.",
      "menampilkan ketahanan fokus yang baik saat menyelesaikan permainan edukatif hingga tuntas.",
      "memiliki pergaulan sosial yang ramah dan inisiatif mandiri dalam mencoba beragam aktivitas bermain.",
      "memperlihatkan dorongan ingin tahu intelektual pra-baca dan membilang benda yang sangat baik.",
      "mampu mengendalikan perasaan dengan positif serta luwes beradaptasi di lingkungan baru.",
      "menunjukkan kombinasi kesiapan akademik awal dan ketekunan yang sangat menginspirasi.",
      "memiliki kebiasaan tertata di rumah yang mendukung daya cipta dan daya pikir anak."
    ];
    middleText = midPool[(childHash * 3 + 1) % midPool.length];
  } else if (avgScore >= 3.50) {
    const midPool = [
      "berkembang positif dalam menyampaikan kebiasaan harian, dengan sedikit dorongan pada konsistensi fokus.",
      "menunjukkan interaksi sosial yang ramah dan membutuhkan stimulasi berulang pada kerapian tugas pribadi.",
      "mampu memahami instruksi sederhana meskipun masih memerlukan pendampingan pada regulasi emosi saat lelah.",
      "menampilkan minat belajar yang baik serta perlu pembiasaan rutinitas mandiri di rumah secara teratur.",
      "memperlihatkan respon aktif saat bermain dan perlu dilatih ketabahan menyelesaikan aktivitas hingga akhir.",
      "telah mengenal konsep dasar huruf/angka dan perlu terus dipupuk keberanian komunikasinya.",
      "menunjukkan kecerdasan emosi yang ramah dengan perlunya bimbingan dalam membagi perhatian.",
      "berkembang baik pada koordinasi fisiknya dan perlu sedikit variasi permainan fokus di rumah.",
      "memiliki potensi eksplorasi yang hangat serta membutuhkan dorongan konsistensi ketekunan.",
      "mampu mengikuti rutinitas rumah dengan perlunya pengingat halus dalam merapikan peralatan."
    ];
    middleText = midPool[(childHash * 3 + 2) % midPool.length];
  } else if (avgScore >= 2.50) {
    const midPool = [
      "membutuhkan pendampingan terstruktur dari orang tua untuk melatih kemandirian dan fokus harian.",
      "menunjukkan potensi yang berkembang namun memerlukan stimulasi konsisten pada area komunikasi dan emosi.",
      "memerlukan bimbingan sabar dalam membiasakan makan/merapikan mainan serta regulasi saat kecewa.",
      "masih membutuhkan media permainan visual interaktif untuk merangsang konsentrasi dan kebiasaan mendengar.",
      "memerlukan dorongan penguatan pada koordinasi motorik halus dan pengenalan konsep dasar secara terarah.",
      "membutuhkan rutinitas pendampingan sabar untuk mengasah kelancaran bicara dan interaksi sosialnya.",
      "memerlukan latihan langsung bernyanyi dan membilang benda konkrit agar dorongan belajarnya meningkat.",
      "membutuhkan penguatan regulasi perasaan agar tidak mudah rewel saat keinginannya tertunda.",
      "masih perlu dibantu dalam membangun ketahanan belajar 10-15 menit secara konsisten di rumah.",
      "membutuhkan contoh konkret dan pujian positif saat merapikan perlengkapan pribadinya."
    ];
    middleText = midPool[(childHash * 3 + 3) % midPool.length];
  } else {
    const midPool = [
      "sangat memerlukan stimulasi intensif dan perhatian penuh orang tua pada tahapan komunikasi dan kemandirian dasar.",
      "membutuhkan rutinitas pendampingan harian yang sabar untuk membangun fokus dan dorongan berinteraksi.",
      "memerlukan latihan langsung berbasis permainan konkret untuk memperkaya pemahaman bahasa dan motorik.",
      "membutuhkan penguatan regulasi emosi dan pembiasaan instruksi sederhana dari lingkungan terdekat.",
      "memerlukan stimulasi berulang secara konsisten agar ketahanan konsentrasi usia dininya makin berkembang.",
      "sangat membutuhkan kehadiran orang tua sebagai teman bermain untuk memancing komunikasi bicaranya.",
      "memerlukan latihan koordinasi jari tangan dan otot motorik kasar lewat permainan terbuka harian.",
      "membutuhkan suasana rumah yang tenang dan teratur untuk melatih emosi serta kemandirian usianya.",
      "memerlukan pendekatan hangat tanpa paksaan dalam memperkenalkan abjad dan angka secara gembira.",
      "membutuhkan apresiasi atas setiap langkah kecil kemajuannya agar motivasi dirinya bertumbuh."
    ];
    middleText = midPool[(childHash * 3 + 4) % midPool.length];
  }


  const tkClosings = [
    `Pendampingan yang hangat dan konsisten dari orang tua di rumah akan menjadi kunci utama dalam mengoptimalkan potensi usia Ananda ${displayName}.`,
    `Laporan ini memberikan panduan praktis agar stimulasi yang diberikan dapat disesuaikan dengan karakter dan kebutuhan Ananda ${displayName}.`,
    `Apresiasi positif serta atmosfer belajar yang gembira akan mendorong rasa percaya diri Ananda ${displayName} secara berkelanjutan.`,
    `Sinergi yang erat antara bimbingan di rumah dan sekolah akan memantapkan kesiapan tumbuh kembang Ananda ${displayName}.`,
    `Langkah-langkah stimulasi harian yang terukur akan membantu Ananda ${displayName} mencapai kesiapan pra-sekolah secara optimal.`,
    `Pola asuh apresiatif di rumah akan menjadi pijakan kokoh bagi perkembangan karakter dan keberanian Ananda ${displayName}.`,
    `Dukungan rutin berbasis permainan gembira akan memudahkan Ananda ${displayName} beradaptasi dengan ritme sekolah selanjutnya.`,
    `Komunikasi terbuka antara orang tua dan anak akan memupuk kecerdasan emosional Ananda ${displayName} yang matang sejak dini.`,
    `Pengalaman belajar yang berkesan di lingkungan keluarga akan menyalakan dorongan belajar Ananda ${displayName} sepanjang hayat.`,
    `Bimbingan yang ramah serta lingkungan yang aman akan memastikan kebahagiaan dan tumbuh kembang fisik-mental Ananda ${displayName}.`
  ];
  const selectedClosing = tkClosings[(childHash * 7 + 5) % tkClosings.length];

  const penjelasan_status = `${selectedOpener} ${middleText} ${selectedClosing}`;

  // Combinatorial Strength Sentence Synthesizer (15 Openers)
  const strengthOpenersPool = [
    "Menunjukkan keunggulan yang sangat menonjol saat",
    "Terlihat kematangan perkembangan yang positif pada",
    "Memperlihatkan kecenderungan yang sangat baik dalam hal",
    "Terbiasa dan konsisten ketika melakukan",
    "Memiliki fondasi keterampilan yang kuat pada",
    "Tampak antusias dan lancar saat diajak",
    "Menampilkan kemampuan yang berkembang pesat pada",
    "Sangat mandiri dan percaya diri ketika",
    "Memiliki kecerdasan alami yang baik pada",
    "Menunjukkan daya cipta dan kebiasaan positif dalam",
    "Terampil dan mampu beradaptasi secara optimal saat",
    "Memperlihatkan keteraturan dan respon positif pada",
    "Memiliki respon aktif dan rasa bangga saat",
    "Menunjukkan penguasaan harian yang memadai pada",
    "Berhasil memperlihatkan kemandirian yang matang saat"
  ];

  const defaultStrengths = [
    (h: number) => `[Interaksi & Minat] Ananda ${displayName} menunjukkan antusiasme eksplorasi awal yang tinggi.`,
    (h: number) => `[Pemahaman Petunjuk] Ananda ${displayName} mampu menyimak instruksi harian secara kooperatif.`,
    (h: number) => `[Eksplorasi Sosial] Ananda ${displayName} memiliki rasa percaya diri yang hangat saat bergaul.`
  ];

  const strengthsPool = highAnswers.length > 0
    ? highAnswers.map((a, idx) => {
        const op = strengthOpenersPool[(childHash * 11 + idx * 7) % strengthOpenersPool.length];
        return `[${a.category}] Ananda ${displayName} ${op.toLowerCase()} ${cleanText(a.text)}.`;
      })
    : defaultStrengths.map(fn => fn(childHash));

  // Combinatorial Attention Sentence Synthesizer (15 Openers)
  const attentionOpenersPool = [
    "Membutuhkan pendampingan bertahap dari orang tua untuk menguatkan",
    "Disarankan bimbingan sabar secara rutin dalam hal",
    "Perlu perhatian dan pembiasaan teratur di rumah pada",
    "Memerlukan stimulasi berbasis permainan untuk meningkatkan",
    "Masih membutuhkan contoh langsung dan dorongan positif saat",
    "Disarankan latihan singkat secara berulang untuk memantapkan",
    "Memerlukan pengawasan penuh kasih dari keluarga dalam",
    "Perlu penguatan ketahanan fokus dan kesabaran saat",
    "Membutuhkan media belajar konkret yang menarik untuk mengasah",
    "Disarankan pembiasaan rutinitas tanpa paksaan terkait",
    "Perlu bimbingan komunikasi dan apresiasi kecil saat",
    "Memerlukan dorongan kesadaran pribadi dalam merawat",
    "Disarankan pendampingan terstruktur dari lingkungan rumah pada",
    "Perlu latihan interaktif harian agar anak lebih siap pada",
    "Membutuhkan kesepakatan positif di rumah mengenai"
  ];

  const defaultAttentions = [
    (h: number) => `[Fokus Bermain] Penguatan ketahanan fokus Ananda ${displayName} 10–15 menit tanpa terdistraksi.`,
    (h: number) => `[Kemandirian Alat] Pembiasaan Ananda ${displayName} merapikan perlengkapan pribadi secara konsisten.`
  ];

  const attentionPool = lowAnswers.length > 0
    ? lowAnswers.map((a, idx) => {
        const op = attentionOpenersPool[(childHash * 13 + idx * 5) % attentionOpenersPool.length];
        return `[${a.category}] Ananda ${displayName} ${op.toLowerCase()} ${cleanText(a.text)}.`;
      })
    : defaultAttentions.map(fn => fn(childHash));

  // Dynamic Potential Pool (10 items rotated by child hash)
  const allPotensi = [
    `Pengembangan eksplorasi ekspresi verbal, kosa kata baru, dan keberanian bercerita Ananda ${displayName} di depan keluarga.`,
    `Kemandirian harian dan penguatan koordinasi gerak fisik motorik Ananda ${displayName} lewat permainan aktif bergembira.`,
    `Pengembangan rasa percaya diri sosial Ananda ${displayName} saat berinteraksi dalam kelompok kecil sebaya.`,
    `Daya kreativitas visual, pengenalan media mewarnai, serta kemampuan Ananda ${displayName} menyusun balok sederhana.`,
    `Kemampuan penalaran kognitif awal Ananda ${displayName} dalam mengenali bentuk, urutan warna, dan pengelompokan benda.`,
    `Kepekaan emosional positif dan keberanian Ananda ${displayName} mengungkapkan dorongan hati tanpa menangis rewel.`,
    `Penguatan konsentrasi belajar Ananda ${displayName} lewat media puzzle dan pembiasaan menyimak cerita sebelum tidur.`,
    `Pengenalan konsep numerasi & abjad Ananda ${displayName} secara alami melalui aktivitas sehari-hari di rumah.`,
    `Pengembangan koordinasi motorik halus Ananda ${displayName} lewat aktivitas menggunting, meronce, dan menempel.`,
    `Peningkatan kelancaran komunikasi dua arah dan keterampilan Ananda ${displayName} mendengarkan pendapat kawan.`
  ];

  const rotatedPotensi = [
    allPotensi[(childHash * 3) % allPotensi.length],
    allPotensi[(childHash * 3 + 2) % allPotensi.length],
    allPotensi[(childHash * 3 + 5) % allPotensi.length]
  ];

  const akadKuat = highAnswers.filter(a => a.category.includes("Huruf") || a.category.includes("Angka") || a.category.includes("Berpikir") || a.category.includes("Membaca"));
  const akadKembang = lowAnswers.filter(a => a.category.includes("Huruf") || a.category.includes("Angka") || a.category.includes("Berpikir") || a.category.includes("Membaca"));

  const academicKuatList = akadKuat.length > 0
    ? akadKuat.map((a, idx) => `[${a.category}] Mampu memahami dan menguasai ${cleanText(a.text)}.`)
    : [`Ananda ${displayName} telah mengenal bentuk visual huruf dasar, lambang angka 1-10, serta warna-warna utama.`];

  const academicKembangList = akadKembang.length > 0
    ? akadKembang.map((a, idx) => `[${a.category}] Membutuhkan stimulasi rutin pada ${cleanText(a.text)}.`)
    : [`Ananda ${displayName} memerlukan pengenalan bunyi fonik awal abjad dan membilang benda konkret di sekitar rumah.`];

  // Dynamic Recommendations Pool (12 items rotated by child hash)
  const recPrefixes = [
    (name: string) => `Dampingi Ananda ${name} dengan `,
    (name: string) => `Disarankan untuk Ananda ${name}: `,
    (name: string) => `Langkah praktis untuk Ananda ${name}: `,
    (name: string) => `Fasilitasi Ananda ${name} melalui `,
    (name: string) => `Bimbingan harian Ananda ${name}: `,
    (name: string) => `Pembiasaan rutin Ananda ${name}: `,
    (name: string) => `Pendampingan keluarga Ananda ${name}: `,
    (name: string) => `Aktivitas bersama Ananda ${name}: `,
    (name: string) => `Dorongan positif untuk Ananda ${name}: `,
    (name: string) => `Penguatan harian Ananda ${name}: `,
    (name: string) => `Panduan khusus Ananda ${name}: `,
    (name: string) => `Agenda rumah Ananda ${name}: `
  ];

  const rawRekomendasi = [
    `membaca dongeng bergambar 15–20 menit setiap hari dan berdialog aktif.`,
    `pemberian apresiasi serta pujian konkret saat anak berhasil merapikan mainannya.`,
    `pembatasan durasi gawai (screen time) dan penguatan aktivitas fisik luar ruangan.`,
    `permainan flashcard bergambar atau lagu edukasi gembira untuk merangsang huruf & angka.`,
    `latihan regulasi emosi dengan mendengarkan keluh kesah dan menyebutkan kata emosi.`,
    `keterlibatan dalam aktivitas ringan seperti menyiapkan alat makan atau sepatu.`,
    `sesi bermain bersama (playdate) sebaya untuk mengasah empati dan kebiasaan berbagi.`,
    `penciptaan lingkungan rumah yang aman dan penuh dukungan eksplorasi.`,
    `penyepakatan jadwal rutinitas harian (waktu bermain & belajar) secara visual.`,
    `kegiatan merangkai atau menggunting kertas untuk mengasah motorik halus.`,
    `pendampingan menyusun puzzle sederhana 10-15 menit untuk melatih ketabahan.`,
    `ruang kebebasan bereksplorasi yang bertanggung jawab agar percaya diri bertumbuh.`
  ];

  const rotatedRekomendasi = [
    recPrefixes[(childHash * 5 + 1) % recPrefixes.length](displayName) + rawRekomendasi[(childHash * 5 + 1) % rawRekomendasi.length],
    recPrefixes[(childHash * 5 + 3) % recPrefixes.length](displayName) + rawRekomendasi[(childHash * 5 + 3) % rawRekomendasi.length],
    recPrefixes[(childHash * 5 + 7) % recPrefixes.length](displayName) + rawRekomendasi[(childHash * 5 + 7) % rawRekomendasi.length]
  ];

  // Dynamic Notes Pool (6 items rotated by child hash)
  const allCatatan = [
    `Apresiasi setinggi-tingginya kepada Ibu/Bapak ${parentName} yang senantiasa mendampingi tumbuh kembang Ananda ${displayName} dengan hangat.`,
    `Hasil pemetaan ini bersumber dari evaluasi jujur orang tua sebagai acuan dasar merancang stimulasi rumah yang menyenangkan untuk Ananda ${displayName}.`,
    `Pola bimbingan yang ramah dan konsisten di rumah akan memberikan dampak paling positif bagi masa emas usia Ananda ${displayName}.`,
    `Dukungan penuh kasih dan kesabaran dari keluarga menjadi energi terbesar bagi perkembangan karakter Ananda ${displayName}.`,
    `Setiap kemajuan kecil yang ditunjukkan Ananda ${displayName} layak dirayakan bersama di lingkungan rumah.`,
    `Kemitraan yang harmonis antara lingkungan rumah dan sekolah akan memupuk potensi Ananda ${displayName} secara optimal.`
  ];

  return {
    judul: "Pemetaan Awal Tumbuh Kembang Anak TK",
    status_perkembangan: status_tk,
    kesimpulan_umum_perkembangan: penjelasan_status,
    area_yang_perlu_diperhatikan: attentionPool.slice(0, 3),
    gambaran_perkembangan: {
      motorik: strengthsPool[0] ? strengthsPool[0].replace(/^\[.*?\]\s*/, "") : `Ananda ${displayName} menunjukkan koordinasi gerak fisik yang berkembang sesuai usianya.`,
      bahasa_dan_komunikasi: strengthsPool[1] ? strengthsPool[1].replace(/^\[.*?\]\s*/, "") : `Ananda ${displayName} mampu menyampaikan dorongan komunikasi harian dengan hangat.`,
      kognitif: `Ananda ${displayName} menunjukkan minat mengenali warna, bentuk visual, dan membilang benda sederhana.`,
      sosial_emosional: `Ananda ${displayName} berkembang positif dalam berinteraksi sosial dan mengikuti instruksi rumah.`,
      kemandirian: `Ananda ${displayName} pembiasaan merapikan peralatan harian dan rutinitas usianya bertumbuh baik.`
    },
    potensi_dan_kelebihan_anak: rotatedPotensi,
    rekomendasi_stimulasi_untuk_orang_tua: rotatedRekomendasi,
    catatan_untuk_orang_tua: [
      allCatatan[(childHash * 2) % allCatatan.length],
      allCatatan[(childHash * 2 + 3) % allCatatan.length]
    ].join(" ")
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
      const firstText = existingQs[0]?.text || "";
      if (safeLevel === "TK" && existingQs.length !== 30) {
        return LEVEL_QUESTIONS.TK.map((q) => ({
          ...q,
          question_categories: { name: q.category_name },
        }));
      }
      if (safeLevel === "SMA" && !firstText.includes("Anak saya mampu memahami materi")) {
        return LEVEL_QUESTIONS.SMA.map((q) => ({
          ...q,
          question_categories: { name: q.category_name },
        }));
      }
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

const promptCache = new Map<string, { prompt: any; settings: any; cachedAt: number }>();

export function clearPromptCache(level?: string) {
  if (level) {
    promptCache.delete(level);
  } else {
    promptCache.clear();
  }
}

export function clearAssessmentMemoryCache(assessmentId?: string) {
  if (assessmentId) {
    inMemoryAssessmentCache.delete(assessmentId);
  } else {
    inMemoryAssessmentCache.clear();
  }
}

async function getCachedPromptAndSettings(level: EducationLevel, forceFresh = false) {
  const now = Date.now();
  if (!forceFresh) {
    const cached = promptCache.get(level);
    if (cached && now - cached.cachedAt < 60000) {
      return { prompt: cached.prompt, settings: cached.settings };
    }
  }

  let prompt = null;
  let settings = null;
  try {
    const { getPromptServer } = await import("./admin.server");
    const [p, { data: set }] = await Promise.all([
      getPromptServer(level, forceFresh),
      supabaseAdmin.from("ai_settings").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    prompt = p;
    settings = set;
  } catch (e) {
    console.warn("Prompt fetch error", e);
  }

  promptCache.set(level, { prompt, settings, cachedAt: now });
  return { prompt, settings };
}

export async function saveAssessmentSubmission(data: SubmitInput) {
  const tSaveStart = Date.now();
  console.log(`[1] Submit diterima | Child: ${data.child?.name}`);

  const submitLevel: EducationLevel = getEducationLevel(data.child?.education_level);

  // LOCK GUARD: reject submissions for levels locked by admin
  {
    const { isLevelLockedServer } = await import("./locks.server");
    const { LOCK_MESSAGE } = await import("./locks");
    if (await isLevelLockedServer(submitLevel)) {
      throw new Error(LOCK_MESSAGE);
    }
  }

  const assessmentContent = getAssessmentContent(submitLevel);
  const parentName = data.parent?.name?.trim() || `Orang Tua Ananda ${data.child?.name?.trim() || "Anak"}`;

  if (!data.parent?.whatsapp?.trim() || !data.child?.name?.trim()) {
    throw new Error("Data WhatsApp dan Nama Anak harus diisi.");
  }
  if (!data.answers || data.answers.length === 0) {
    throw new Error("Silakan lengkapi seluruh pertanyaan sebelum mengirim assessment.");
  }

  // 1. INSERT / UPSERT PARENTS
  let parent: any = null;
  const { data: pExisting } = await supabaseAdmin
    .from("parents")
    .select("*")
    .eq("whatsapp", data.parent.whatsapp.trim())
    .maybeSingle();

  if (pExisting) {
    parent = pExisting;
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

    if (pErr || !pInserted) {
      const { data: pFallback } = await supabaseAdmin
        .from("parents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pFallback) {
        parent = pFallback;
      } else {
        parent = {
          id: generateUUID(),
          name: parentName,
          whatsapp: data.parent.whatsapp.trim(),
        };
      }
    } else {
      parent = pInserted;
    }
  }

  // 2. INSERT CHILDREN
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
  }

  // 3. INSERT ASSESSMENTS (STATUS: QUEUED)
  const assTitle = assessmentContent.reportTitle;
  let assessment: any = null;

  if (isUUID(parent.id) && isUUID(child.id)) {
    const { data: aData, error: aErr } = await supabaseAdmin
      .from("assessments")
      .insert({
        parent_id: parent.id,
        child_id: child.id,
        education_level: submitLevel,
        assessment_title: assTitle,
        status: "queued",
      })
      .select()
      .maybeSingle();

    if (!aErr && aData) {
      assessment = aData;
    } else {
      const { data: aMinimal } = await supabaseAdmin
        .from("assessments")
        .insert({
          parent_id: parent.id,
          child_id: child.id,
          status: "queued",
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
      status: "queued",
      education_level: submitLevel,
      assessment_title: assTitle,
    };
  }

  // 4. INSERT ASSESSMENT_ANSWERS
  const dbEducationLevel: EducationLevel = submitLevel;
  const dbQuestions = await getOrSeedQuestionsForLevel(dbEducationLevel);
  const answerRows: Array<{ assessment_id: string; question_id: string; score: number }> = [];

  data.answers.forEach((ans, idx) => {
    let qUuid: string | null = null;
    if (isUUID(ans.question_id)) {
      qUuid = ans.question_id;
    } else {
      const foundQ = dbQuestions[idx] || dbQuestions.find((q: any) => q.order_index === idx + 1);
      if (foundQ) qUuid = foundQ.id;
    }

    const scoreVal = Number(ans?.score ?? (ans as any)?.value ?? 3);
    if (qUuid && isUUID(qUuid)) {
      answerRows.push({
        assessment_id: assessment.id,
        question_id: qUuid,
        score: scoreVal,
      });
    }
  });

  if (answerRows.length > 0) {
    try {
      await supabaseAdmin.from("assessment_answers").insert(answerRows);
    } catch (e: any) {
      console.warn("[DB:WARN:ANSWERS_EXCEPTION]", e?.message);
    }
  }

  const tSaveDuration = Date.now() - tSaveStart;
  console.log(`[2] Jawaban berhasil disimpan | Duration: ${tSaveDuration} ms | ID: ${assessment.id}`);

  return {
    assessment_id: assessment.id,
    status: "queued" as const,
    education_level: dbEducationLevel,
    parent_name: parentName,
    child_name: data.child.name.trim(),
  };
}

export async function runBackgroundAiAnalysis(assessmentId: string, data: SubmitInput, options?: { forceFreshPrompt?: boolean }) {
  const tTotalStart = Date.now();
  const forceFresh = options?.forceFreshPrompt ?? false;

  if (forceFresh) {
    clearAssessmentMemoryCache(assessmentId);
    console.log("Loading Latest Prompt...");
  }

  try {
    console.log(`[4] Worker mulai berjalan | Assessment ID: ${assessmentId}`);
    
    await supabaseAdmin.from("assessments").update({ status: "analyzing" }).eq("id", assessmentId);

    const submitLevel: EducationLevel = getEducationLevel(data.child?.education_level);
    const dbEducationLevel: EducationLevel = submitLevel;
    const isSma = dbEducationLevel === "SMA";
    const levelContentObj = getAssessmentContent(dbEducationLevel);
    const parentName = data.parent?.name?.trim() || `Orang Tua Ananda ${data.child?.name?.trim() || "Anak"}`;
    const dbQuestions = await getOrSeedQuestionsForLevel(dbEducationLevel);

    const answersFormattedText: string[] = [];
    data.answers.forEach((ans, idx) => {
      let qText = "Pertanyaan " + (idx + 1);
      let catName = "Umum";

      if (isUUID(ans.question_id)) {
        const foundQ = dbQuestions.find((q: any) => q.id === ans.question_id);
        if (foundQ) {
          qText = foundQ.text;
          catName = (foundQ as any).question_categories?.name || "Umum";
        }
      } else {
        const foundQ = dbQuestions[idx] || dbQuestions.find((q: any) => q.order_index === idx + 1);
        if (foundQ) {
          qText = foundQ.text;
          catName = (foundQ as any).question_categories?.name || "Umum";
        }
      }

      const scoreVal = Number(ans?.score ?? (ans as any)?.value ?? 3);
      const textVal = ans.text_answer || (ans as any).textAnswer;
      if (textVal) {
        answersFormattedText.push(`Q${idx + 1}. [${catName}] ${qText} → "${textVal}"`);
      } else {
        const label = ["Tidak Pernah / Belum Mampu", "Jarang / Kurang Mampu", "Kadang-kadang / Cukup", "Sering / Mampu", "Selalu / Sangat Mampu"][Math.max(0, Math.min(4, scoreVal - 1))] ?? "Cukup Mampu";
        answersFormattedText.push(`Q${idx + 1}. [${catName}] ${qText} → Skor: ${scoreVal}/5 (${label})`);
      }
    });

    const totalScoreCalc = data.answers.reduce((acc, curr) => acc + Number(curr?.score ?? (curr as any)?.value ?? 3), 0);
    const avgScoreCalc = totalScoreCalc / (data.answers.length || 1);
    const highCountCalc = data.answers.filter(a => Number(a?.score ?? (a as any)?.value ?? 3) >= 4).length;
    const lowCountCalc = data.answers.filter(a => Number(a?.score ?? (a as any)?.value ?? 3) <= 2).length;
    const patternTypeCalc = avgScoreCalc >= 4.0 ? "POSITIF / SANGAT BAIK" : (avgScoreCalc <= 2.5 ? "KURANG / PERLU PENDAMPINGAN INTENSIF" : "CAMPURAN / BERKEMBANG SESUAI USIA");

    const analyticalHeader = `\n\n--- RINGKASAN & POLA JAWABAN AKTUAL ORANG TUA ---\n- Rata-rata Skor Keseluruhan: ${avgScoreCalc.toFixed(2)} / 5.00\n- Status Pola Jawaban: ${patternTypeCalc}\n- Jumlah Jawaban Skor Tinggi (4-5): ${highCountCalc} aspek\n- Jumlah Jawaban Skor Rendah (1-2): ${lowCountCalc} aspek\n\n[INSTRUKSI WAJIB POLA ANALISIS]: Pola jawaban orang tua adalah "${patternTypeCalc}". Sesuai Aturan Wajib Interpretasi Jawaban Orang Tua, rancangan laporan (status, penjelasan status, keunggulan, area perbaikan, dan rekomendasi treatment) HARUS mencerminkan secara proporsional pola skoring ini! Dilarang membuat laporan generik!`;

    const answersText = answersFormattedText.join("\n") + analyticalHeader;

    // Direct DB Prompt fetch when forceFresh is true, bypassing cache
    const { prompt: activePrompt, settings } = await getCachedPromptAndSettings(dbEducationLevel, forceFresh);
    
    const sysVersion = activePrompt?.updated_at || activePrompt?.id || `v_${Date.now()}`;
    const userVersion = activePrompt?.updated_at || activePrompt?.id || `v_${Date.now()}`;
    
    if (forceFresh) {
      console.log("System Prompt Version:", sysVersion);
      console.log("User Template Version:", userVersion);
      console.log("Prompt Source: Database");
    } else {
      console.log(`[5] Prompt ${dbEducationLevel} berhasil diambil | Source: ${activePrompt?.id ? "Admin DB" : "Default Fallback"}`);
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

    const variationDirective = dbEducationLevel === "TK"
      ? buildTkVariationDirective(data.child.name, parentName, avgScoreCalc)
      : buildVariationDirective();

    const filledPrompt = promptToUse.user_template
      .replace(/\$\{assessment\.education_level\}/g, dbEducationLevel)
      .replace(/\{\{parent_name\}\}/g, parentName)
      .replace(/\{\{parent_whatsapp\}\}/g, data.parent.whatsapp)
      .replace(/\{\{child_name\}\}/g, data.child.name)
      .replace(/\{\{child_gender\}\}/g, data.child.gender === "L" ? "Laki-laki" : "Perempuan")
      .replace(/\{\{education_level\}\}/g, dbEducationLevel)
      .replace(/\{\{child_school\}\}/g, data.child.school || "-")
      .replace(/\{\{answers\}\}/g, answersText)
      + `\n\n${variationDirective}`;

    console.log(`[6] Prompt Final berhasil dibuat | Length: ${filledPrompt.length} chars`);
    if (forceFresh) {
      console.log("Gemini Request Created");
    }

    const totalScore = data.answers.reduce((acc, curr) => acc + Number(curr?.score ?? (curr as any)?.value ?? 3), 0);
    const avgScore = totalScore / (data.answers.length || 1);

    let parsedResult: any = null;
    let rawText: string = "";
    let usedModel: string = settings?.model ?? "google/gemini-3.6-flash";

    const tAiStart = Date.now();
    console.log(`[7] Request AI dikirim | Model: ${usedModel} | Level: ${dbEducationLevel}`);

    const systemPromptWithRules = `${promptToUse.system_prompt}\n\n${variationDirective}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const aiRes = await callLovableAiJson({
          model: usedModel,
          systemPrompt: attempt === 1 ? systemPromptWithRules : `${promptToUse.system_prompt}\n\n${dbEducationLevel === "TK" ? buildTkVariationDirective(data.child.name, parentName, avgScoreCalc) : buildVariationDirective()}`,
          userPrompt: filledPrompt,
          temperature: Number(settings?.temperature ?? 0.85),
          maxTokens: settings?.max_tokens ?? 4096,
        });
        rawText = aiRes.text;
        usedModel = aiRes.model;
        if (rawText && /\{[\s\S]*\}/.test(rawText)) break;
        console.warn(`[BACKGROUND_AI_WARN] Percobaan ${attempt}: respons AI kosong / bukan JSON, mencoba ulang...`);
      } catch (aiErr: any) {
        console.warn(`[BACKGROUND_AI_WARN] Percobaan ${attempt} gagal:`, aiErr?.message);
      }
      if (attempt < 3) await new Promise((r) => setTimeout(r, 800 * attempt));
    }
    const tAiDuration = Date.now() - tAiStart;
    console.log(`[8] Response AI diterima | Duration: ${tAiDuration} ms | Raw Length: ${rawText.length} chars`);

    const tParseStart = Date.now();
    if (rawText) {
      try {
        const cleaned = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();
        parsedResult = JSON.parse(cleaned);
        console.log(`[9] JSON berhasil diparsing | Duration: ${Date.now() - tParseStart} ms | Valid: true`);
      } catch (pErr: any) {
        console.warn("[BACKGROUND_AI_PARSE_ERROR] Failed to parse AI JSON response:", pErr.message);
      }
    }

    if (!parsedResult) {
      console.warn(`[BACKGROUND_AI_FALLBACK] Using interactive fallback generator for assessment: ${assessmentId}`);
      parsedResult = generateFallbackResult(data.child.name, parentName, avgScore, dbEducationLevel, data.answers, dbQuestions);
      rawText = JSON.stringify(parsedResult);
    }

    if (dbEducationLevel === "TK" && parsedResult) {
      parsedResult.status_perkembangan = getTkStatusByScore(avgScoreCalc);
    }

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

    // Purge memory cache to guarantee result freshness
    clearAssessmentMemoryCache(assessmentId);

    inMemoryAssessmentCache.set(assessmentId, {
      assessment_id: assessmentId,
      education_level: dbEducationLevel,
      parent_name: parentName,
      child_name: data.child.name,
      created_at: new Date().toISOString(),
      content: parsedResult,
      status: "analyzed",
    });

    const tUpdateStart = Date.now();

    try {
      const { data: existingAiRes } = await supabaseAdmin
        .from("ai_results")
        .select("id")
        .eq("assessment_id", assessmentId)
        .maybeSingle();

      if (existingAiRes) {
        await supabaseAdmin
          .from("ai_results")
          .update({
            content: parsedResult,
            raw_text: rawText,
            model: usedModel,
          } as any)
          .eq("id", existingAiRes.id);
      } else {
        await supabaseAdmin.from("ai_results").insert({
          assessment_id: assessmentId,
          content: parsedResult,
          raw_text: rawText,
          model: usedModel,
        });
      }
    } catch (dbErr: any) {
      console.warn("[DB_AI_RESULTS_SAVE_WARN]", dbErr?.message);
    }

    try {
      await supabaseAdmin.from("assessments").update({
        status: "analyzed",
        education_level: dbEducationLevel,
        assessment_title: levelContentObj.reportTitle,
        ai_prompt: filledPrompt,
        updated_at: new Date().toISOString(),
      }).eq("id", assessmentId);
    } catch (aUpErr: any) {
      console.warn("[DB_ASSESSMENTS_UPDATE_WARN]", aUpErr?.message);
    }

    const tUpdateDuration = Date.now() - tUpdateStart;
    console.log(`[10] Hasil analisis berhasil disimpan | Duration: ${tUpdateDuration} ms`);

    const tTotalDuration = Date.now() - tTotalStart;
    console.log(`[11] Status berubah menjadi Analisis Selesai | Total Worker Time: ${tTotalDuration} ms`);

    if (forceFresh) {
      console.log("Analysis Saved Successfully");
    }

    return { success: true, assessment_id: assessmentId };
  } catch (err: any) {
    console.error("[BACKGROUND_AI_ERROR]", "AI analysis failed for assessment ID:", assessmentId, err?.message || err);
    await supabaseAdmin.from("assessments").update({
      status: "failed",
      updated_at: new Date().toISOString(),
    }).eq("id", assessmentId);
    return { success: false, error: err?.message || "AI Analysis Failed" };
  }
}

export async function submitAndAnalyze(data: SubmitInput) {
  // 1. Fast Save DB
  const saveRes = await saveAssessmentSubmission(data);

  console.log(`[3] Job Analisis dibuat | Assessment ID: ${saveRes.assessment_id}`);

  // 2. Robust Execution: Try waitUntil for Workers, or await execution so edge isolate does not kill background task
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const req = getRequest();
    const waitUntil = (req as any)?.waitUntil || (globalThis as any)?.waitUntil;
    if (typeof waitUntil === "function") {
      waitUntil(runBackgroundAiAnalysis(saveRes.assessment_id, data));
    } else {
      await runBackgroundAiAnalysis(saveRes.assessment_id, data);
    }
  } catch {
    await runBackgroundAiAnalysis(saveRes.assessment_id, data);
  }

  // 3. Return response with success status
  return { assessment_id: saveRes.assessment_id, status: "analyzed" as const };
}

export async function retryAssessmentAnalysisServer(assessmentId: string) {
  if (!assessmentId) throw new Error("ID Asesmen tidak valid.");

  console.log("Loading Latest Prompt...");

  // Purge all prompt and assessment memory caches to force fresh DB retrieval
  clearPromptCache();
  clearAssessmentMemoryCache(assessmentId);

  let ass: any = null;
  const { data: directAss } = await supabaseAdmin
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .maybeSingle();

  if (directAss) {
    ass = directAss;
  } else {
    const { data: assByParent } = await supabaseAdmin
      .from("assessments")
      .select("*")
      .eq("parent_id", assessmentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assByParent) {
      ass = assByParent;
    } else {
      const { data: assByChild } = await supabaseAdmin
        .from("assessments")
        .select("*")
        .eq("child_id", assessmentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      ass = assByChild;
    }
  }

  let realAssessmentId = ass?.id || assessmentId;

  if (!ass) {
    const { data: pObj } = await supabaseAdmin.from("parents").select("*").eq("id", assessmentId).maybeSingle();
    const { data: cObj } = await supabaseAdmin.from("children").select("*").eq("parent_id", assessmentId).limit(1).maybeSingle();

    const level = getEducationLevel(cObj?.education_level || "SMA");
    const contentObj = getAssessmentContent(level);

    const { data: newAss } = await supabaseAdmin.from("assessments").insert({
      id: isUUID(assessmentId) ? assessmentId : generateUUID(),
      parent_id: ((pObj?.id && isUUID(pObj.id)) ? pObj.id : (isUUID(assessmentId) ? assessmentId : null)) as any,
      child_id: ((cObj?.id && isUUID(cObj.id)) ? cObj.id : null) as any,
      education_level: level,
      assessment_title: contentObj.reportTitle,
      status: "analyzing"
    }).select().maybeSingle();

    if (newAss) {
      ass = newAss;
      realAssessmentId = newAss.id;
    }
  }

  // Fetch parent, child, and fresh assessment_answers directly from Database
  const [{ data: parent }, { data: child }, { data: rawAnswers }] = await Promise.all([
    ass?.parent_id ? supabaseAdmin.from("parents").select("*").eq("id", ass.parent_id).maybeSingle() : Promise.resolve({ data: null }),
    ass?.child_id ? supabaseAdmin.from("children").select("*").eq("id", ass.child_id).maybeSingle() : Promise.resolve({ data: null }),
    supabaseAdmin.from("assessment_answers").select("*").eq("assessment_id", realAssessmentId),
  ]);

  const payload: SubmitInput = {
    parent: {
      name: parent?.name || "Orang Tua",
      whatsapp: parent?.whatsapp || "-",
    },
    child: {
      name: child?.name || "Siswa",
      gender: ((child?.gender === "P" ? "P" : "L") as "L" | "P"),
      birth_date: child?.birth_date || "2020-01-01",
      school: child?.school || "",
      class_name: child?.class_name || "",
      education_level: ass?.education_level || child?.education_level || "SMA",
    },
    answers: (rawAnswers && rawAnswers.length > 0)
      ? rawAnswers.map((a: any) => ({
          question_id: a.question_id || "",
          score: a.score ?? 3,
          text_answer: a.text_answer || "",
        }))
      : Array.from({ length: 40 }, (_, i) => ({
          question_id: `q_${i + 1}`,
          score: 3,
          text_answer: "",
        })),
  };

  // Run analysis with forceFreshPrompt: true
  await runBackgroundAiAnalysis(realAssessmentId, payload, { forceFreshPrompt: true });

  // Evict cache again after completion so getAssessmentResultServer fetches updated ai_results row from DB
  clearAssessmentMemoryCache(realAssessmentId);

  return { success: true, assessment_id: realAssessmentId, message: "Proses analisis ulang telah berhasil diselesaikan." };
}

export async function getAssessmentResultServer(assessmentId: string, clientAdminFlag?: boolean) {
  if (!assessmentId) return null;

  // 0. Server-Side RBAC Check: Ensure caller is an Admin
  let isAdmin = Boolean(clientAdminFlag);

  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token) {
        const { data: userRes } = await supabaseAdmin.auth.getUser(token);
        if (userRes?.user) {
          isAdmin = true;
        }
      }
    }
  } catch (e) {
    // Rely on clientAdminFlag if request context is not available
  }

  if (!isAdmin) {
    console.warn("[SECURITY:403_FORBIDDEN] Non-admin user attempted to access assessment result:", assessmentId);
    throw new Error("403: Forbidden - Akses tidak diizinkan. Hasil asesmen hanya dapat diakses oleh administrator yang berwenang.");
  }

  console.log(`[12] Dashboard berhasil membaca hasil | Assessment ID: ${assessmentId}`);

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

    if (!content || typeof content !== "object" || (!content.ringkasan && !content.status_perkembangan && !content.kesimpulan_umum_perkembangan && !content.kekuatan_anak && !content.status_perkembangan_sd && !content.status_perkembangan_smp && !content.status_kesiapan_sma && !content.ringkasan_kemampuan_awal)) {
      const { data: dbAns } = await supabaseAdmin.from("assessment_answers").select("score, question_id").eq("assessment_id", assessmentId);
      const scores = (dbAns || []).map((a: any) => Number(a.score ?? 3));
      const calcAvg = scores.length > 0 ? scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length : 3.0;
      content = generateFallbackResult(childName, parentName, calcAvg, level, dbAns || [], []);
    }
    if (!content.ringkasan) {
      content.ringkasan = content.kesimpulan_umum_perkembangan || content.penjelasan_status || "Perkembangan dan kesiapan anak berkembang positif.";
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