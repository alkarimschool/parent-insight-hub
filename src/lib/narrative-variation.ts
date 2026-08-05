export const FIELD_VARIATION_TEMPLATES: Record<number, Record<string, any>> = {
  1: {
    ringkasan: (pName: string, cName: string, score: string) => `Mempertimbangkan instrumen pengamatan Bapak/Ibu ${pName} (Rata-rata Skor: ${score}/5), Ananda ${cName} memperlihatkan karakter dasar yang disiplin dan penuh rasa tanggung jawab. Pembiasaan di rumah menjadi fondasi kuat yang mendorong konsistensi belajarnya.`,
    areaPerhatian: [
      "Pengelolaan Skala Prioritas Rutinitas: Perlu pendampingan dalam mengimbangi tugas sekolah yang padat dengan waktu istirahat agar tidak kelelahan emosional.",
      "Penguatan Inisiatif Belajar Otonom: Penting dibimbing untuk mulai mengambil keputusan belajar mandiri tanpa menunggu instruksi ulang."
    ],
    akademik: [
      "Kedisiplinan Penyelesaian Tugas: Mampu mengumpulkan tugas sekolah dengan rapi dan konsisten sesuai tenggat waktu.",
      "Konsistensi Pemahaman Materi: Menunjukkan ketekunan yang memadai dalam menyimak dan mempelajari konsep-konsep baru."
    ],
    berpikir: [
      "Penalaran Logis Terstruktur: Terbiasa memikirkan langkah-langkah penyelesaian masalah secara urut dan obyektif.",
      "Keahlian Menganalisis Tugas: Mampu mengurai instruksi soal yang rumit menjadi tahapan pengerjaan yang sistematis."
    ],
    sosialisasi: [
      "Kematangan Tanggung Jawab Sosial: Menunjukkan rasa empati dan menghormati tata krama dalam berinteraksi dengan teman sebaya.",
      "Keterbukaan Berpendapat: Percaya diri dalam menyampaikan gagasan saat berdiskusi di kelompok belajar."
    ],
    karakter: [
      "Kedisiplinan & Komitmen Tinggi: Memiliki keteguhan prinsip dalam menjaga integritas dan aturan yang telah disepakati bersama.",
      "Pengendalian Diri Positif: Mampu mengelola emosi secara matang ketika berhadapan dengan situasi tertekan."
    ],
    kesiapanSma: [
      "Kesiapan Karakter Sekolah: Telah memiliki fondasi mental kedisiplinan yang matang untuk beradaptasi dengan ritme kurikulum SMA."
    ],
    potensi: [
      "Pengembangan Kepemimpinan Mandiri: Peluang besar menjadi teladan kedisiplinan dan pengorganisasian kegiatan siswa.",
      "Eksplorasi Metode Belajar Efektif: Potensi menguasai teknik manajemen waktu lanjutan secara mandiri."
    ],
    kelebihan: [
      "Memiliki etos tanggung jawab pribadi dan integritas karakter yang sangat menonjol."
    ],
    rekomendasi: [
      "Berikan kepercayaan penuh pada anak untuk mengelola jadwal rutinitas mingguannya secara mandiri.",
      "Lakukan sesi evaluasi apresiatif di akhir pekan untuk mendiskusikan pencapaian dan perasaan anak."
    ]
  },
  2: {
    ringkasan: (pName: string, cName: string, score: string) => `Melalui pencermatan lembar asesmen dari Bapak/Ibu ${pName} (Skor Rata-rata: ${score}/5), profil Ananda ${cName} menonjol pada daya serap akademik dan dorongan rasa ingin tahu yang tinggi. Motivasi internalnya menjadi mesin penggerak utama dalam memahami pelajaran.`,
    areaPerhatian: [
      "Kemandirian Eksplorasi Soal Hots: Perlu pendampingan saat berhadapan dengan tingkat kesulitan soal analisis tinggi agar tidak cepat frustrasi.",
      "Pencegahan Kejenuhan Belajar: Penting variasi aktivitas agar dorongan belajar yang tinggi tetap terjaga secara berkelanjutan."
    ],
    akademik: [
      "Kecepatan Memahami Konsep Baru: Mampu menangkap esensi materi pembelajaran baru dengan cepat dan akurat.",
      "Motivasi Belajar Mandiri: Menunjukkan inisiatif tinggi untuk membaca dan mencari referensi tambahan secara mandiri."
    ],
    berpikir: [
      "Daya Kritis & Keterbukaan Ide: Terbiasa mempertanyakan alasan di balik suatu rumus atau teori ilmiah secara mendalam.",
      "Kreativitas Pemecahan Masalah: Mampu menemukan cara alternatif yang efisien dalam menyelesaikan latihan soal."
    ],
    sosialisasi: [
      "Kolaborasi Pembelajaran Kelompok: Mampu menjadi penggerak diskusi dan berbagi pemahaman materi kepada rekan kelompok.",
      "Komunikasi Gagasan Ilmiah: Lancar mengekspresikan pendapat akademis secara lugas dan jelas."
    ],
    karakter: [
      "Ketekunan Belajar Tinggi: Memiliki daya tahan fokus yang kuat saat menyelesaikan tugas-tugas intelektual.",
      "Tanggung Jawab Akademis: Memiliki rasa memiliki (ownership) yang tinggi terhadap target nilai dan prestasi sekolah."
    ],
    kesiapanSma: [
      "Kesiapan Intelektual SMA: Sangat siap menghadapi kedalaman materi spektrum SMA dan jalur akademis perguruan tinggi."
    ],
    potensi: [
      "Eksplorasi Kompetisi Sains/Akademik: Berpotensi dikembangkan dalam ajang olimpiade atau penelitian karya ilmiah remaja.",
      "Penguatan Penalaran Terapan: Peluang mengasah aplikasi teori ke dalam proyek sains nyata."
    ],
    kelebihan: [
      "Memiliki rasa ingin tahu intelektual (intellectual curiosity) dan ketajaman logika belajar yang sangat baik."
    ],
    rekomendasi: [
      "Sediakan bahan bacaan pendukung atau akses sumber belajar digital yang berkualitas di rumah.",
      "Dukung anak mengikuti klub minat atau bimbingan pengayaan sesuai mata pelajaran favoritnya."
    ]
  },
  3: {
    ringkasan: (pName: string, cName: string, score: string) => `Berdasarkan rangkuman observasi Bapak/Ibu ${pName} (Rata-rata Skor: ${score}/5), Ananda ${cName} memiliki keunggulan pada penalaran analitis dan kemampuan berpikir kritis. Cara berpikirnya objektif dalam mengurai persoalan harian.`,
    areaPerhatian: [
      "Keseimbangan Analisis & Eksekusi Praktis: Perlu didampingi agar tidak terlalu lama berada dalam tahap pertimbangan sehingga lupa mengeksekusi tugas tepat waktu.",
      "Pengelolaan Ekspektasi Hasil: Perlu pembinaan agar siap menerima ketidaksempurnaan atau perubahan rencana."
    ],
    akademik: [
      "Penalaran Logis Matematik & Bahasa: Mampu menghubungkan keterkaitan konsep antarpelajaran secara sistematis.",
      "Ketelitian Membaca Informasi: Cermat menganalisis detail data dan instruksi soal sebelum mengerjakan."
    ],
    berpikir: [
      "Ketajaman Berpikir Kritis: Mampu mengidentifikasi inti permasalahan dan mencari sebab-akibat suatu peristiwa.",
      "Pengambilan Keputusan Rasional: Menimbang plus-minus informasi secara objektif sebelum menarik kesimpulan."
    ],
    sosialisasi: [
      "Diskusi Argumentatif Koperatif: Mampu mengemukakan argumen berlandaskan fakta saat berdiskusi tanpa memicu konflik.",
      "Kejujuran Komunikasi: Menyampaikan pendapat secara transparan dan menghargai masukan orang lain."
    ],
    karakter: [
      "Independensi Berpikir: Tidak mudah terpengaruh tren negatif pertemanan karena memiliki pertimbangan rasional.",
      "Integritas Kejujuran: Menjaga komitmen kejujuran dalam pengerjaan tugas dan evaluasi."
    ],
    kesiapanSma: [
      "Kesiapan Kritis SMA: Memiliki bekal penalaran yang memadai untuk menghadapi tantangan pembelajaran berbasis analisis di SMA."
    ],
    potensi: [
      "Pengembangan Riset & Pemecahan Masalah: Peluang besar unggul dalam bidang analisis data, pemrograman, atau sains sosial.",
      "Penguatan Debat & Komunikasi: Potensi diasah dalam forum diskusi riset atau organisasi kepemudaan."
    ],
    kelebihan: [
      "Menunjukkan daya kritis analitis dan independensi pertimbangan pemikiran yang matang."
    ],
    rekomendasi: [
      "Ajak anak berdiskusi isu-isu aktual untuk melatih kedalaman argumentasi logisnya di rumah.",
      "Bantu anak menetapkan batasan waktu pengerjaan tugas agar proses analisis berjalan efisien."
    ]
  },
  4: {
    ringkasan: (pName: string, cName: string, score: string) => `Dari potret asesmen yang disampaikan Bapak/Ibu ${pName} (Skor Rata-rata: ${score}/5), Ananda ${cName} tumbuh dengan kecerdasan interpersonal dan kemampuan sosialisasi yang luwes. Kehangatan komunikasinya membuat anak mudah beradaptasi.`,
    areaPerhatian: [
      "Pengendalian Pengaruh Teman Sebaya: Perlu pembinaan agar kehangatan sosial tidak mengaburkan prioritas tugas belajar pribadi.",
      "Manajemen Screen Time Gadget: Perlu pendampingan batas waktu penggunaan media sosial agar tidak menyita waktu belajar."
    ],
    akademik: [
      "Pembelajaran Kolaboratif: Sangat optimal saat belajar bersama atau dalam metode pembelajaran kelompok (peer learning).",
      "Keterbukaan Bertanya: Tidak ragu bertanya kepada guru atau teman ketika menemui kesulitan materi."
    ],
    berpikir: [
      "Penalaran Empatis: Mampu memahami sudut pandang orang lain dan menyesuaikan strategi komunikasi.",
      "Fleksibilitas Solusi Sosial: Mampu meredakan perbedaan pendapat dalam dinamika kerja kelompok."
    ],
    sosialisasi: [
      "Kemudahan Beradaptasi Lingkungan: Cepat akrab dan membina pertemanan sehat di lingkungan baru.",
      "Keterampilan Komunikasi Dua Arah: Menjadi pendengar yang baik sekaligus pembicara yang percaya diri."
    ],
    karakter: [
      "Kehangatan & Empati Sosial: Memiliki kepedulian tinggi terhadap perasaan teman dan suasana keluarga.",
      "Keterbukaan Diri: Mudah mengekspresikan perasaannya kepada orang tua secara jujur."
    ],
    kesiapanSma: [
      "Kesiapan Pergaulan SMA: Siap beradaptasi dengan iklim sosial SMA yang lebih heterogen dan dinamis."
    ],
    potensi: [
      "Pengembangan Organisasi & Public Speaking: Peluang memegang peran penting dalam OSIS atau kegiatan ekstrakurikuler.",
      "Kecerdasan Diplomasi Remaja: Potensi unggul dalam bidang komunikasi, humas, dan kegiatan sosial."
    ],
    kelebihan: [
      "Memiliki kecerdasan emosional-sosial (EQ) dan keluwesan adaptasi pertemanan yang sangat hangat."
    ],
    rekomendasi: [
      "Ciptakan ruang dialog santai setiap malam untuk mendengarkan cerita pergaulan dan sekolah anak.",
      "Sepakati aturan penggunaan gadget dan waktu kumpul keluarga secara jelas di rumah."
    ]
  },
  5: {
    ringkasan: (pName: string, cName: string, score: string) => `Mengacu pada informasi asesmen Bapak/Ibu ${pName} (Rata-rata Skor: ${score}/5), Ananda ${cName} memperlihatkan kesiapan umum yang seimbang untuk melangkah ke tuntutan ritme pembelajaran SMA yang lebih kompleks.`,
    areaPerhatian: [
      "Penyelarasan Strategi Belajar SMA: Perlu pendampingan transisi agar cara belajar SMP disesuaikan dengan kedalaman SMA.",
      "Penguatan Ketahanan Mental Ujian: Perlu dorongan rasa percaya diri saat menghadapi evaluasi berkala."
    ],
    akademik: [
      "Kesiapan Konsep Dasar: Memiliki pemahaman materi dasar yang cukup solid untuk menerima pelajaran jenjang lanjut.",
      "Kerapian Administrasi Tugas: Teratur dalam mencatat dan mengorganisasi buku pelajaran di rumah."
    ],
    berpikir: [
      "Penerapan Metode Terstruktur: Terbiasa mengerjakan tugas dengan mengikuti petunjuk dan panduan resmi.",
      "Evaluasi Pemahaman Pribadi: Mampu mengenali bab pelajaran mana yang sudah dikuasai atau masih bingung."
    ],
    sosialisasi: [
      "Ker kerja Sama Harmonis: Mampu menyesuaikan diri dalam tugas kelompok tanpa menciptakan kendala pertemanan.",
      "Kepatuhan Aturan Sekolah: Menghormati aturan tata tertib kelas dan panduan guru."
    ],
    karakter: [
      "Kestabilan Sikap Belajar: Memiliki konsistensi yang stabil dalam mengikuti jadwal sekolah harian.",
      "Rasa Tanggung Jawab Standar: Menyelesaikan kewajiban utama sebagai siswa dengan baik."
    ],
    kesiapanSma: [
      "Kesiapan Transisi Pembelajaran: Berada pada koridor kesiapan yang positif untuk mengikuti irama akademik SMA."
    ],
    potensi: [
      "Penguatan Prestasi Bertahap: Berpotensi meningkatkan capaian belajar secara signifikan dengan pendampingan terfokus.",
      "Pengembangan Keterampilan Praktis: Peluang mengasah bakat non-akademik di bidang olah minat."
    ],
    kelebihan: [
      "Menunjukkan sikap kooperatif, stabilitas kebiasaan belajar, dan kesiapan dasar yang seimbang."
    ],
    rekomendasi: [
      "Bantu anak menyusun rencana target belajar per semester agar memiliki arah pencapaian yang jelas.",
      "Berikan apresiasi atas setiap usaha dan peningkatan kecil yang ditunjukkan anak."
    ]
  },
  6: {
    ringkasan: (pName: string, cName: string, score: string) => `Hasil pengamatan Bapak/Ibu ${pName} (Skor Rata-rata: ${score}/5) menunjukkan bahwa Ananda ${cName} memiliki potensi bakat dan keunggulan spesifik yang sangat menonjol jika terus dieksplorasi secara terarah.`,
    areaPerhatian: [
      "Fokus Pembagian Perhatian: Perlu pendampingan agar pengembangan keunggulan minat tidak mengabaikan mata pelajaran umum.",
      "Konsistensi Latihan Rutin: Perlu pembiasaan disiplin agar minat bakat terasah secara profesional."
    ],
    akademik: [
      "Antusiasme Pada Bidang Favorit: Menunjukkan prestasi akademik yang sangat tinggi pada mata pelajaran yang diminati.",
      "Daya Ingat Bidang Spesifik: Mampu menguasai materi khusus dengan cepat dan mendalam."
    ],
    berpikir: [
      "Kreativitas Asosiatif: Mampu menghubungkan topik minatnya dengan aplikasi kehidupan sehari-hari.",
      "Inovasi Pemecahan Masalah: Memiliki ide-ide segar dan unik dalam menyelesaikan proyek."
    ],
    sosialisasi: [
      "Berbagi Keahlian Spesifik: Senang membantu kawan yang membutuhkan penjelasan di bidang keunggulannya.",
      "Kepercayaan Diri Berprestasi: Bangga menunjukkan hasil karya dan capaian positifnya."
    ],
    karakter: [
      "Passi & Dedikasi Tinggi: Menunjukkan ketahanan fokus luar biasa saat mengerjakan hal yang disukai.",
      "Keberanian Tampil: Memiliki rasa percaya diri untuk mengekspresikan potensinya."
    ],
    kesiapanSma: [
      "Kesiapan Penjurusan & Minat: Sangat siap mengarahkan pemfokusan minat untuk persiapan jurusan perguruan tinggi."
    ],
    potensi: [
      "Pengembangan Spesialisasi Bakat: Berpotensi mencapai prestasi puncak pada bidang studi/keterampilan unggulannya.",
      "Penguatan Portofolio Karya: Peluang mengumpulkan karya prestisius untuk beasiswa atau seleksi masuk perguruan tinggi."
    ],
    kelebihan: [
      "Memiliki keunggulan spesifik (special talent) dan motivasi minat yang sangat kuat."
    ],
    rekomendasi: [
      "Fasilitasi wadah eksplorasi minat anak melalui kursus, kompetisi, atau komunitas yang relevan.",
      "Bantu anak membagi waktu secara proporsional antara pendalaman bakat dan tugas sekolah rutin."
    ]
  },
  7: {
    ringkasan: (pName: string, cName: string, score: string) => `Melalui lembar observasi Bapak/Ibu ${pName} (Rata-rata Skor: ${score}/5), Ananda ${cName} memperlihatkan ketahanan regulasi emosi dan ketenangan diri yang positif saat berhadapan dengan dinamika pembelajaran.`,
    areaPerhatian: [
      "Pengungkapan Perasaan Kekecewaan: Perlu dorongan agar anak mau menceritakan kesulitannya secara terbuka tanpa dipendam.",
      "Peningkatan Ambisi Target Belajar: Perlu dorongan untuk berani menetapkan target pencapaian yang lebih tinggi."
    ],
    akademik: [
      "Ketenangan Saat Ujian: Mampu mengerjakan soal evaluasi sekolah tanpa panik berlebihan.",
      "Kestabilan Pengerjaan Tugas: Tidak mudah terganggu oleh suasana bising atau perubahan jadwal mendadak."
    ],
    berpikir: [
      "Pikir Kepala Dingin: Mampu mempertimbangkan solusi secara tenang ketika menghadapi kebuntuan tugas.",
      "Objektivitas Menilai Kegagalan: Memahami bahwa kesalahan pengerjaan adalah bagian dari proses belajar."
    ],
    sosialisasi: [
      "Pengendalian Konflik Pertemanan: Tidak cepat terpancing emosi saat terjadi perselisihan pendapat dengan kawan.",
      "Sikap Remaja yang Dewasa: Menunjukkan kedewasaan emosional dalam menyikapi teguran atau kritik."
    ],
    karakter: [
      "Resiliensi & Ketahanan Mental: Bangkit kembali secara cepat setelah mengalami hasil nilai yang kurang memuaskan.",
      "Pengendalian Impulsif: Tidak terburu-buru mengambil keputusan sebelum memikirkan dampaknya."
    ],
    kesiapanSma: [
      "Kesiapan Ketahanan Tekanan SMA: Memiliki daya tahan emosional yang baik dalam mengarungi iklim SMA yang padat."
    ],
    potensi: [
      "Pengembangan Mediator Sosial: Peluang mengasah peran penengah atau pembimbing sebaya (peer counselor).",
      "Penguatan Manajemen Stres: Berpotensi menjadi pribadi yang sangat tangguh di lingkungan akademik tinggi."
    ],
    kelebihan: [
      "Memiliki stabilitas emosional, kedewasaan diri, dan ketahanan resiliensi mental yang baik."
    ],
    rekomendasi: [
      "Berikan ruang aman di rumah tempat anak merasa diterima tanpa syarat saat ingin mengekspresikan perasaannya.",
      "Diskusikan strategi penanganan stres ringan secara konstruktif bersama anak."
    ]
  },
  8: {
    ringkasan: (pName: string, cName: string, score: string) => `Hasil analisis instrumen dari Bapak/Ibu ${pName} (Rata-rata Skor: ${score}/5) menunjukkan bahwa Ananda ${cName} tumbuh dengan baik berkat dukungan komunikasi terbuka dan iklim positif keluarga di rumah.`,
    areaPerhatian: [
      "Kemandirian Mengatasi Hambatan: Perlu pembiasaan agar anak mencoba menyelesaikan masalah sekolahnya sendiri terlebih dahulu.",
      "Penguatan Inisiatif Tanpa Pengingat: Penting dilatih bergerak mandiri sebelum orang tua memberikan petunjuk."
    ],
    akademik: [
      "Keterbukaan Melaporkan Perkembangan: Rajin berdiskusi dengan orang tua mengenai nilai dan kendala tugas sekolah.",
      "Respon Positif Terhadap Bimbingan: Menerima masukan belajar dari keluarga dengan sikap terbuka."
    ],
    berpikir: [
      "Dialog Penalaran Keluarga: Terbiasa bertukar pikiran dan mendiskusikan topik harian bersama orang tua.",
      "Pertimbangan Nilai Keluarga: Menerapkan prinsip moril keluarga dalam menyikapi persoalan sekolah."
    ],
    sosialisasi: [
      "Keterrampilan Berkomunikasi Santun: Mampu menyampaikan aspirasinya dengan bahasa yang sopan dan lugas.",
      "Kepercayaan Diri Berinteraksi: Nyaman berinteraksi dengan figur dewasa maupun teman sebaya."
    ],
    karakter: [
      "Kejujuran & Transparansi: Menjaga komitmen kejujuran mengenai kegiatan dan penggunaan waktunya.",
      "Rasa Aman Emosional: Memiliki kepercayaan diri yang kokoh karena merasa didukung oleh keluarga."
    ],
    kesiapanSma: [
      "Kesiapan Pendampingan Rumah: Sangat siap melangkah ke SMA dengan dukungan sistem rumah yang solid."
    ],
    potensi: [
      "Pengembangan Kepemimpinan Beretika: Peluang besar tumbuh menjadi pemimpin muda yang jujur dan komunikatif.",
      "Penguatan Kerja Sama Komunitas: Potensi aktif dalam kegiatan sosial dan kemasyarakatan."
    ],
    kelebihan: [
      "Memiliki ikatan komunikasi keluarga yang terbuka, rasa aman emosional, dan kejujuran sikap."
    ],
    rekomendasi: [
      "Pertahankan kebiasaan diskusi meja makan mingguan untuk memantau tumbuh kembang anak secara hangat.",
      "Berikan peran tanggung jawab domestik di rumah untuk makin mematangkan kemandiriannya."
    ]
  },
  9: {
    ringkasan: (pName: string, cName: string, score: string) => `Berdasarkan pengamatan yang diisi Bapak/Ibu ${pName} (Skor Rata-rata: ${score}/5), Ananda ${cName} memiliki kesadaran pengelolaan waktu dan penataan rutinitas harian yang makin matang.`,
    areaPerhatian: [
      "Fleksibilitas Perubahan Perencanaan: Perlu bimbingan agar tidak stres saat jadwal yang disusun terganggu aktivitas mendadak.",
      "Pengesampingan Distraksi Gadget: Perlu konsistensi menjaga komitmen durasi main game/gadget."
    ],
    akademik: [
      "Perencanaan Belajar Terstruktur: Menyusun alokasi waktu khusus untuk pengerjaan PR dan ulangan harian.",
      "Pengumpulan Tugas Tepat Waktu: Sangat jarang terlambat menyelesaikan kewajiban akademis."
    ],
    berpikir: [
      "Penyusunan Skala Prioritas: Mampu membedakan mana tugas yang mendesak-penting dan mana yang bisa ditunda.",
      "Efisiensi Cara Kerja: Mencari langkah pengerjaan yang praktis dan tidak membuang waktu."
    ],
    sosialisasi: [
      "Komitmen Janji Kelompok: Tepat waktu saat menghadiri janji belajar kelompok bersama teman.",
      "Penataan Waktu Bersosialisasi: Mampu membatasi durasi kumpul pertemanan agar tak mengganggu jam istirahat."
    ],
    karakter: [
      "Kedisiplinan Waktu (Punctuality): Menghargai waktu dan memiliki rasa segan jika datang terlambat.",
      "Kemandirian Pembiasaan Harian: Menjalankan rutinitas pribadi tanpa perlu diawasi terus-menerus."
    ],
    kesiapanSma: [
      "Kesiapan Ritme Padat SMA: Siap mengelola padatnya jam belajar SMA dan kegiatan ekstrakurikuler."
    ],
    potensi: [
      "Pengembangan Manajemen Proyek Remaja: Peluang unggul dalam mengelola kepanitiaan acara sekolah.",
      "Penguatan Efisiensi Akademik: Berpotensi mencapai hasil tinggi dengan durasi belajar yang efektif."
    ],
    kelebihan: [
      "Menunjukkan manajemen waktu yang teratur, ketepatan janji, dan kesadaran prioritas yang baik."
    ],
    rekomendasi: [
      "Fasilitasi anak dengan papan jadwal atau aplikasi planner digital untuk mendukung penataan waktunya.",
      "Berikan apresiasi atas keberhasilannya mengelola waktu secara mandiri."
    ]
  },
  10: {
    ringkasan: (pName: string, cName: string, score: string) => `Melalui lembar asesmen dari Bapak/Ibu ${pName} (Rata-rata Skor: ${score}/5), profil Ananda ${cName} mencerminkan pembiasaan positif yang tertanam konsisten dan kesiapan pendampingan terstruktur di rumah.`,
    areaPerhatian: [
      "Peningkatan Daya Saing Mandiri: Perlu pemicu semangat agar anak tidak sekadar berada di zona nyaman.",
      "Pengayaan Pengalaman Baru: Penting dorongan untuk berani mencoba tantangan di luar bidang kebiasaannya."
    ],
    akademik: [
      "Pembiasaan Belajar Rutin: Terbiasa mengulang materi pelajaran setiap malam walau tidak ada ulangan.",
      "Kerapian Catatan Sekolah: Memiliki buku catatan yang lengkap dan tertata rapi."
    ],
    berpikir: [
      "Pemahaman Berbasis Pembiasaan: Mengingat konsep dengan baik melalui latihan soal yang teratur.",
      "Langkah Pengerjaan Sistematis: Mengikuti pola soal standar dengan ketelitian yang tinggi."
    ],
    sosialisasi: [
      "Kepatuhan Etika Bermasyarakat: Bersikap ramah dan sopan dalam interaksi dengan warga sekolah.",
      "Kerja Sama Koperatif: Selalu menjalankan bagian tugas kelompoknya dengan penuh kesadaran."
    ],
    karakter: [
      "Pembiasaan Positif Konsisten: Memiliki kebiasaan bangun pagi, rapi, dan santun yang terjaga baik.",
      "Kepatuhan Komitmen Keluarga: Menjaga kepercayaan orang tua dengan sungguh-sungguh."
    ],
    kesiapanSma: [
      "Kesiapan Pembiasaan SMA: Memiliki dasar modal mental santun dan disiplin yang siap melangkah ke SMA."
    ],
    potensi: [
      "Pengembangan Karakter Teladan: Peluang menjadi figur siswa teladan di sekolah.",
      "Penguatan Prestasi Melalui Ketekunan: Berpotensi sukses jangka panjang berkat modal konsistensi kebiasaan."
    ],
    kelebihan: [
      "Memiliki konsistensi pembiasaan positif harian, kesantunan sikap, dan keteguhan komitmen."
    ],
    rekomendasi: [
      "Pertahankan atmosfer pembiasaan positif di rumah dengan terus memberikan teladan dan apresiasi.",
      "Dorong anak untuk berani mengambil peluang tantangan baru di sekolah untuk menguji potensinya."
    ]
  }
};

export const PERSONA_ENGINE = [
  "Psikolog Pendidikan (Pendekatan Empatik, Reflektif, Mendalam & Personal)",
  "Guru BK / Konselor Sekolah (Pendekatan Evaluatif, Terstruktur, Praktis & Membangun)",
  "Konselor Akademik (Pendekatan Terstruktur, Analitis, Objektif & Solutif)",
  "Konselor Remaja / Mentor Pembimbing (Pendekatan Motivatif, Proaktif, Solutif & Aksi)",
];

export const DYNAMIC_ANALYSIS_STRATEGIES = [
  {
    id: 1,
    name: "Strategi Pola Karakter & Kedisiplinan Awal",
    flow: "Prioritas Pembahasan: Karakter & Kemandirian → Kemampuan Akademik → Komunikasi & Sosial → Potensi → Rekomendasi Orang Tua",
    style: "Gaya Penjelasan: Menekankan aspek kedisiplinan diri, tanggung jawab harian, dan pembiasaan positif di rumah.",
  },
  {
    id: 2,
    name: "Strategi Motivasi & Kemandirian Belajar Akademik",
    flow: "Prioritas Pembahasan: Kemampuan Akademik → Kemampuan Berpikir → Kemandirian Belajar → Kesiapan Sekolah → Solusi Pendampingan",
    style: "Gaya Penjelasan: Fokus pada daya serap materi, konsistensi belajar di rumah, dan dorongan belajar mandiri.",
  },
  {
    id: 3,
    name: "Strategi Dinamika Berpikir Kritis & Penalaran Logis",
    flow: "Prioritas Pembahasan: Kemampuan Berpikir & Analisis → Kesiapan Pembelajaran → Potensi Pengembangan → Karakter → Rekomendasi",
    style: "Gaya Penjelasan: Berfokus pada penalaran logis, kemampuan memecahkan masalah, dan kejelian menganalisis tugas.",
  },
  {
    id: 4,
    name: "Strategi Pergaulan, Sosialisasi & Adaptasi Lingkungan",
    flow: "Prioritas Pembahasan: Komunikasi & Interaksi Sosial → Adaptasi Pertemanan → Regulasi Emosi → Kemandirian → Pembiasaan Rumah",
    style: "Gaya Penjelasan: Menyoroti aspek keterbukaan komunikasi, kepercayaan diri berpendapat, dan dinamika pertemanan.",
  },
  {
    id: 5,
    name: "Strategi Kesiapan Pembelajaran & Tantangan Sekolah",
    flow: "Prioritas Pembahasan: Kesiapan Mengikuti Pembelajaran → Kemampuan Akademik → Fokus Belajar → Potensi → Rekomendasi Khusus",
    style: "Gaya Penjelasan: Menekankan kesiapan siswa menghadapi ritme dan tuntutan kurikulum di jenjang sekolah terkait.",
  },
  {
    id: 6,
    name: "Strategi Potensi Minat & Eksplorasi Keunggulan",
    flow: "Prioritas Pembahasan: Potensi & Kelebihan Spesifik → Area Pengembangan → Kemampuan Akademik → Pendampingan Orang Tua",
    style: "Gaya Penjelasan: Mengangkat keunggulan dominan siswa terlebih dahulu sebagai landasan memotivasi area yang perlu dibina.",
  },
  {
    id: 7,
    name: "Strategi Regulasi Emosi & Pengendalian Diri",
    flow: "Prioritas Pembahasan: Pengendalian Emosi & Kedisiplinan → Komunikasi Sosial → Kebiasaan Belajar → Langkah Praktis Rumah",
    style: "Gaya Penjelasan: Berfokus pada ketahanan emosional saat menghadapi tekanan tugas, kritik, dan regulasi waktu.",
  },
  {
    id: 8,
    name: "Strategi Komunikasi Rumah & Hubungan Orang Tua-Anak",
    flow: "Prioritas Pembahasan: Komunikasi Keluarga → Karakter Mandiri → Motivasi Belajar → Potensi → Rekomendasi Pembiasaan",
    style: "Gaya Penjelasan: Menekankan pola dialog dua arah antara orang tua dan anak serta penciptaan atmosfer belajar hangat.",
  },
  {
    id: 9,
    name: "Strategi Manajemen Waktu & Prioritas Rutinitas",
    flow: "Prioritas Pembahasan: Kedisiplinan Rutinitas Harian → Fokus Belajar → Pergaulan/Gadget → Akademik → Solusi Praktis",
    style: "Gaya Penjelasan: Menyoroti pengelolaan durasi belajar, istirahat, screen time gadget, dan eksekusi tugas tepat waktu.",
  },
  {
    id: 10,
    name: "Strategi Pembiasaan Positif & Pendampingan Terstruktur",
    flow: "Prioritas Pembahasan: Karakter Mandiri → Kesiapan Pembelajaran → Potensi Utama → Area Perhatian → Rekomendasi",
    style: "Gaya Penjelasan: Menekankan pentingnya pendampingan konsisten di rumah berbasis contoh dan apresiasi.",
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function buildVariationDirective(): string {
  const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const chosenStrategy = pick(DYNAMIC_ANALYSIS_STRATEGIES);
  const chosenPersona = pick(PERSONA_ENGINE);

  return `
==================================================
ENGINE ANALISIS AI BARU (ANALYSIS REASONING & DYNAMIC STRATEGY)
==================================================
SEED KEUNIKAN: ${seed} (Penanda internal, dilarang ditulis di output JSON)

[KOMPONEN 1: ANALYSIS REASONING ENGINE (7 LANGKAH PENALARAN INTERNAL)]
Sebelum menyusun setiap field JSON, AI WAJIB mengeksekusi 7 langkah reasoning ini secara internal dari nol:
1. Membaca & menganalisis seluruh jawaban orang tua secara cermat.
2. Identifikasi 3 indikator dominan yang paling menonjol dari temuan observasi orang tua.
3. Identifikasi area yang paling membutuhkan perhatian & pendampingan terstruktur.
4. Temukan hubungan unik antar indikator (misal: korelasi antara ketahanan fokus dengan regulasi emosi).
5. Tentukan prioritas & urutan pembahasan analisis khusus untuk siswa ini.
6. Gunakan sudut pandang persona konselor: ${chosenPersona}.
7. Menyusun narasi baru dari nol — DILARANG sekadar mengganti kata/sinonim pada template baku!

[KOMPONEN 2: DYNAMIC ANALYSIS STRATEGY ENGINE]
AI WAJIB menerapkan strategi analisis berikut untuk laporan ini:
>>> STRATEGI TERPILIH: ${chosenStrategy.name} <<<
>>> URUTAN IDE: ${chosenStrategy.flow} <<<
>>> GAYA PENJELASAN: ${chosenStrategy.style} <<<

DILARANG menggunakan urutan kaku yang sama (Pembuka → Skor → Kebiasaan Belajar → Kemandirian → Regulasi Emosi → Pendampingan). Wajib mengikuti urutan ide strategi di atas!

[KOMPONEN 3: ANTI-REPETITION ENGINE & SELF-VALIDATION]
- DILARANG mengulang frase pembuka yang sama ("Berdasarkan hasil...", "Secara umum...", "Terlihat bahwa...", "Siswa menunjukkan...", "Masih perlu ditingkatkan...") lebih dari 1 kali dalam satu laporan!
- AI WAJIB melakukan self-validation sebelum menghasilkan output JSON.
- Jika kemiripan struktur kalimat, frasa pembuka, atau urutan penjelasan antar laporan masih >20%, AI WAJIB MENULIS ULANG seluruh field dari awal hingga unik tanpa menggeser makna data asesmen.

Struktur JSON, nama key, dan urutan field WAJIB 100% SAMA SEPERTI SKEMA LAPORAN JENJANG TERKAIT.
`.trim();
}
