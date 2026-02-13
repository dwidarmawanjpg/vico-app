
export type ContentBlock = 
  | { type: 'paragraph'; content: string }
  | { type: 'heading'; content: string; level: 2 | 3 }
  | { type: 'image'; src: string; caption?: string; alt?: string }
  | { type: 'list'; items: string[]; style: 'bullet' | 'number' }
  | { type: 'quote'; content: string; author?: string }
  | { type: 'callout'; content: string; title?: string; variant: 'info' | 'warning' | 'tip' };

export interface Reference {
  title: string;
  url?: string;
}

export interface EducationModule {
  id: number;
  category: 'Persiapan' | 'Proses' | 'Kualitas' | 'Pemasaran';
  title: string;
  excerpt: string; // Deskripsi singkat untuk kartu
  thumbnail: string; // Gambar utama untuk kartu
  readTime: string; // Estimasi waktu baca, misal: "5 min baca"
  author: string;
  date: string;
  content: ContentBlock[]; // Array blok konten fleksibel
  references?: Reference[];
}

export const educationModules: EducationModule[] = [
  {
    id: 1,
    category: 'Persiapan',
    title: 'Memilih Kelapa yang Tepat',
    excerpt: 'Panduan ciri fisik kelapa tua (Grade A) agar fermentasi berhasil dan minyak keluar banyak.',
    thumbnail: '/src/assets/thumbnail/modul1.png',
    readTime: '8 min baca',
    author: 'Tim Teknis Vico',
    date: '10 Feb 2026',
    content: [
      {
        type: 'heading',
        content: '1. Pendahuluan: Mengapa Harus Dipilih?',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Banyak pemula gagal membuat VCO bukan karena salah cara fermentasi, melainkan karena menggunakan kelapa yang kurang tua. Menggunakan bahan baku yang tepat adalah kunci agar santan bisa "pecah" menjadi minyak secara alami.'
      },
      {
        type: 'callout',
        variant: 'info',
        title: '📊 Perkiraan Hasil (Rendemen):',
        content: 'Jika Ibu/Bapak mengolah 10 butir kelapa tua Grade A (berat daging total 4–5 kg) dengan benar, estimasi minyak VCO yang didapat adalah 600 ml hingga 800 ml.'
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Dasar Ilmiah:',
        content: '"Angka ini didasarkan pada rendemen optimal metode fermentasi sebesar 18% – 23%, sebagaimana dibuktikan dalam penelitian terbaru oleh Nuraisyah dkk. (2025). Jika menggunakan kelapa muda, hasilnya bisa di bawah 10%."'
      },
      {
        type: 'heading',
        content: '2. Ciri Fisik Kelapa yang Baik',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Saat membeli kelapa atau memanen di kebun, perhatikan 3 tanda berikut:'
      },
      {
        type: 'heading',
        content: 'A. Warna Sabut (Kulit Luar)',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Panduan: Pilih kelapa yang sabutnya berwarna cokelat tua atau keabu-abuan dan kering merata. Hindari yang masih hijau atau kuning cerah.',
          'Alasan: Menurut APCC (Asian and Pacific Coconut Community), warna cokelat menandakan kelapa sudah matang penuh (usia 12 bulan) dan aliran nutrisi dari pohon sudah berhenti.'
        ]
      },
      {
        type: 'heading',
        content: 'B. Bunyi Air (Uji Guncang)',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Panduan: Guncangkan kelapa di dekat telinga. Pastikan terdengar bunyi air yang nyaring (kencang). Jangan pilih jika bunyinya berat atau seperti penuh air.',
          'Alasan: "Bunyi nyaring menandakan air sudah berkurang karena terserap daging buah yang tebal dan padat, sesuai temuan riset Sulastry (2008)."'
        ]
      },
      {
        type: 'heading',
        content: 'C. Kondisi Daging Buah',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Panduan: Saat dibelah, pastikan tebal daging 10–15 mm, keras, dan berwarna putih bersih.',
          'Alasan: "Ketebalan dan warna putih bersih diperlukan untuk memenuhi syarat SNI 7381:2008 agar produk akhir jernih dan tidak cepat tengik."'
        ]
      },
      {
        type: 'heading',
        content: '3. Mengapa Kelapa Muda Tidak Boleh Dipakai?',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Seringkali ada yang mencampur kelapa muda (sayur) karena harganya lebih murah. Hal ini sebaiknya dihindari karena:'
      },
      {
        type: 'list',
        style: 'number',
        items: [
          'Minyak Sedikit (Rendemen Rendah): Kelapa muda mengandung minyak <10%, sedangkan kelapa tua 30-35%. Menurut Yulviani dkk. (2015), menggunakan kelapa muda berarti Anda hanya memeras air, bukan minyak.',
          'Kadar Air Terlalu Tinggi: Kelapa muda memiliki kadar air hingga 90%. Air yang berlebih akan mengencerkan santan sehingga minyak sulit terpisah dari air/blondo.',
          'Kualitas Asam Laurat Menurun: Menurut Hayati (2009), zat penting VCO (Asam Laurat) baru terbentuk sempurna pada kelapa tua (usia 11-12 bulan).'
        ]
      },
      {
        type: 'heading',
        content: '4. Pantangan (Jangan Dipilih)',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Hindari buah dengan kondisi berikut agar hasil minyak tidak rusak:'
      },
      {
        type: 'list',
        style: 'number',
        items: [
          'Berkecambah (Ada Tombong): Risiko: Enzim alami (Lipase) sudah aktif memecah minyak, menyebabkan VCO berbau tengik dan Asam Lemak Bebas tinggi (tidak lolos SNI).',
          'Tempurung Retak/Pecah: Risiko: Daging buah sudah terkontaminasi udara dan kotoran, menyebabkan minyak berwarna keruh atau kekuningan.'
        ]
      }
    ],
    references: [
      { title: 'Asian and Pacific Coconut Community (APCC). (2009). Quality Standards for Virgin Coconut Oil.' },
      { title: 'Badan Standardisasi Nasional. (2008). SNI 7381:2008: Syarat Mutu Virgin Coconut Oil.' },
      { title: 'Nuraisyah, A., Fatimah, T., & Mastuti, L. (2025). Lama Penyimpanan Buah Kelapa terhadap Rendemen dan Mutu VCO.' },
      { title: 'Polosakan, R., & Alamsyah, A. (2016). Pengaruh Metode Pengolahan dan Umur Panen Terhadap Kualitas VCO.' },
      { title: 'Hayati, R., dkk. (2009). Perbandingan Asam Lemak Kelapa Muda dan Tua.' }
    ]
  },
  {
    id: 2,
    category: 'Proses',
    title: 'Teknik Ekstraksi Santan',
    excerpt: 'Rahasia rasio 1:1 dan teknik peras cepat (5 menit) agar santan kental dan minyak melimpah.',
    thumbnail: '/src/assets/thumbnail/modul3.png',
    readTime: '7 min baca',
    author: 'Tim Teknis Vico',
    date: '12 Feb 2026',
    content: [
      {
        type: 'paragraph',
        content: 'Topik: Rasio Emas 1:1'
      },
      {
        type: 'heading',
        content: '1. Pendahuluan: Santan Pekat = Minyak Cepat Naik',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Lupakan cara memeras santan untuk masakan lodeh atau sayur. Dalam pembuatan VCO, kita memiliki hukum fisika yang berbeda.'
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Prinsip Utama',
        content: '"Semakin sedikit air yang Anda pakai, semakin cepat minyak akan terpisah."'
      },
      {
        type: 'paragraph',
        content: 'Aplikasi VICO menggunakan rumus khusus untuk menjamin keberhasilan fermentasi Anda.'
      },
      {
        type: 'heading',
        content: '2. Rasio Air (Hukum 1:1)',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Ini adalah aturan paling penting. Jangan menambah air sembarangan.'
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Instruksi',
        content: 'Gunakan timbangan! Rumus wajibnya adalah 1 Kg Kelapa Parut : 1 Liter Air.'
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Contoh: Jika memeras 5 Kg kelapa, airnya maksimal 5 Liter. Jangan lebih!',
          'Alasan Ilmiah: "Riset Kerala Agricultural University (2016) membuktikan bahwa rasio 1:1 menghasilkan rendemen minyak tertinggi. Air yang terlalu banyak akan mengencerkan \'makanan\' (gula) bagi bakteri fermentasi, sehingga proses pemisahan minyak menjadi lambat dan gagal."'
        ]
      },
      {
        type: 'heading',
        content: '3. Suhu Air (Wajib Hangat Kuku)',
        level: 3
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Instruksi',
        content: 'Gunakan air hangat suam-suam kuku (35°C - 40°C).'
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Caranya: Campur air panas dan biasa. Celupkan jari, jika hangat nyaman (tidak melepuh), itu pas. DILARANG pakai air dingin atau air mendidih!',
          'Alasan Ilmiah: "Minyak kelapa membeku di bawah 24°C. Menurut CPCRI, suhu 40°C diperlukan untuk mencairkan lemak agar mudah keluar dari ampas tanpa membunuh bakteri alami. Air mendidih (>60°C) justru akan mematikan bakteri fermentasi."'
        ]
      },
      {
        type: 'heading',
        content: '4. Teknik Peras (Kuat & Cepat)',
        level: 3
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Instruksi',
        content: 'Uleni/remas parutan dengan KUAT tapi CEPAT. Batasi waktu meremas maksimal 5 Menit. Segera saring!'
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Alasan Ilmiah: "Menurut protokol Oseni et al. (2017), jika diperas terlalu lama (>10 menit), butiran minyak akan pecah menjadi sangat kecil (micro-emulsion) yang sulit terpisah. Selain itu, riset Putri dkk. (2025) menunjukkan kontak udara terlalu lama memicu oksidasi dini (tengik)."'
        ]
      }
    ],
    references: [
      { title: 'Oseni, N. T., et al. (2017). Effect of extraction techniques on the quality of coconut oil. African Journal of Food Science.' },
      { title: 'Putri, N., dkk. (2025). Analisis Pengaruh Waktu terhadap Kualitas VCO. Jurnal Mikroba.' },
      { title: 'Thanuja, T. T., et al. (2016). Isolation of microorganism from fermented coconut milk. Kerala Agricultural University.' },
      { title: 'ICAR-CPCRI. (2016). Virgin Coconut Oil: Hot and Fermentation Process. Central Plantation Crops Research Institute.' }
    ]
  },

  {
    id: 4,
    category: 'Proses',
    title: 'Standar Kebersihan & Alat',
    excerpt: 'Panduan sterilisasi murah dan aturan wajib masker untuk mencegah kegagalan fermentasi.',
    thumbnail: '/src/assets/thumbnail/modul2.png',
    readTime: '10 min baca',
    author: 'Tim Teknis Vico',
    date: '11 Feb 2026',
    content: [
      {
        type: 'paragraph',
        content: 'Topik: Mencegah Kegagalan Fermentasi'
      },
      {
        type: 'heading',
        content: '1. Pendahuluan: Musuh Tak Terlihat',
        level: 3
      },
      {
        type: 'paragraph',
        content: '90% kegagalan dalam membuat VCO (minyak tidak keluar, bau tengik, atau berjamur) bukan karena kelapanya salah, tapi karena "Pasukan Musuh Tak Terlihat", yaitu Enzim Perusak (dari air liur) dan Bakteri Jahat (dari sisa sabun).'
      },
      {
        type: 'paragraph',
        content: 'Modul ini berisi cara murah dan mudah untuk membasmi mereka tanpa alat laboratorium mahal.'
      },
      {
        type: 'heading',
        content: '2. Aturan Tubuh (Higiene Personil)',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Tubuh manusia adalah sumber bakteri terbesar. Sebelum menyentuh santan, patuhi aturan ini:'
      },
      {
        type: 'heading',
        content: 'A. Wajib Masker & "Puasa Bicara"',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Instruksi: Saat memeras atau mengaduk santan, WAJIB pakai masker. Jika tidak ada masker, DILARANG KERAS MENGOBROL di depan wadah santan.',
          'Alasan Ilmiah: "Air liur manusia mengandung enzim Lipase Lingual yang aktif memecah lemak. Riset Mennella dkk. (2014) membuktikan bahwa percikan ludah (droplets) sekecil apapun dapat memicu ketengikan dini pada produk."'
        ]
      },
      {
        type: 'heading',
        content: 'B. Tutup Kepala & Rambut',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Instruksi: Rambut tidak boleh terbuka (gunakan topi/kerudung/hairnet). Pastikan tidak ada kelombet atau rambut rontok yang jatuh ke santan.',
          'Alasan Ilmiah: "Riset Adawiyah (2019) mengonfirmasi bahwa rambut dan kulit kepala adalah sarang bakteri Staphylococcus aureus. Bakteri ini memproduksi enzim yang merusak struktur minyak, menyebabkan kegagalan pembentukan lapisan krim (kanil)."'
        ]
      },
      {
        type: 'heading',
        content: '3. Cara Mencuci Alat (Bahaya Sisa Sabun)',
        level: 3
      },
      {
        type: 'callout',
        variant: 'warning',
        title: '🚫 Instruksi',
        content: 'Gunakan sabun cuci piring sesedikit mungkin. Bilas air mengalir minimal 3 kali. Tes Raba: Jika permukaan alat masih licin, ULANGI BILAS. Alat harus kesat (berdecit) saat disentuh.'
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Alasan Ilmiah: "Sabun mengandung Surfaktan Anionik. Riset membuktikan bahwa sisa sabun dapat mematikan bakteri Lactobacillus (starter fermentasi), sehingga minyak tidak mau memisah dari air."'
        ]
      },
      {
        type: 'heading',
        content: '4. Standar Wadah (Plastik vs Logam)',
        level: 3
      },
      {
        type: 'heading',
        content: '🚫 Logam (Musuh Karat)',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Instruksi: Buang parutan berkarat! Jangan pakai panci aluminium hitam atau kuningan. Gunakan pisau dan saringan dari Stainless Steel.',
          'Alasan Ilmiah: "Logam berkarat (Besi/Tembaga) memicu reaksi oksidasi radikal bebas. Hal ini melanggar SNI 7381:2022 yang menetapkan batas cemaran logam sangat rendah pada VCO."'
        ]
      },
      {
        type: 'heading',
        content: '📦 Plastik (Pilih yang Aman)',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Instruksi: DILARANG pakai ember bekas cat atau plastik hitam/merah. Gunakan wadah plastik Putih Susu atau Bening dengan kode daur ulang 5 (PP) atau 2 (HDPE).',
          'Alasan Ilmiah: "Wadah non-pangan mengandung Ftalat (karsinogenik) yang mudah larut dalam minyak kelapa. Gunakan plastik Food Grade untuk mencegah migrasi kimia."'
        ]
      },
      {
        type: 'heading',
        content: '5. Sterilisasi Murah (Solusi Desa)',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Tidak butuh mesin mahal. Gunakan panas dan matahari:'
      },
      {
        type: 'heading',
        content: 'A. Teknik Siram Air Hangat (60-70°C)',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Masalah: Air mendidih (100°C) bisa melelehkan ember plastik petani.',
          'Solusi: Masak air sampai panas (muncul asap tipis, sekitar 60-70°C). Siramkan ke dalam ember, balik merata, lalu buang.',
          'Alasan Ilmiah: "Studi inaktivasi termal membuktikan suhu 60°C selama 1-5 menit cukup untuk mematikan bakteri E. coli dan Salmonella tanpa merusak struktur plastik."'
        ]
      },
      {
        type: 'heading',
        content: 'B. Penjemuran (Metode SODIS)',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Solusi: Setelah dicuci, jemur ember terbalik di bawah terik matahari sampai kering total.',
          'Alasan Ilmiah: "Sinar matahari mengandung UV-A (germisidal). Kombinasi panas dan UV efektif membunuh sisa mikroba di pori-pori plastik (Metode Solar Disinfection)."'
        ]
      },
      {
        type: 'heading',
        content: '6. Kualitas Air',
        level: 3
      },
      {
        type: 'list',
        style: 'bullet',
        items: [
          'Instruksi: Hanya gunakan Air Matang atau Air Minum Isi Ulang untuk memeras kelapa. Jangan pakai air sumur mentah!',
          'Alasan Ilmiah: "Air mentah mengandung bakteri Coliform. Peraturan BPOM No. 13 Tahun 2019 menetapkan batas ketat cemaran mikroba agar santan tidak menjadi busuk."'
        ]
      }
    ],
    references: [
      { title: 'Badan Standardisasi Nasional. (2022). SNI 7381:2022 Minyak Kelapa Virgin (VCO).' },
      { title: 'Mennella, I., dkk. (2014). Salivary lipase and alpha-amylase activities. Food Research International.' },
      { title: 'Adawiyah, R., dkk. (2019). Rancidity of traditional coconut oil: microbial contaminant. Jurnal Penelitian Teknologi.' },
      { title: 'Widiyanti, R. (2021). Pengaruh Residu Deterjen Terhadap Viabilitas Bakteri Asam Laktat. Jurnal Bioteknologi & Biosains Indonesia.' },
      { title: 'Ubomba-Jaswa, E., dkk. (2010). Solar Water Disinfection (SODIS). Journal of Water and Health.' }
    ]
  },
  {
    id: 5,
    category: 'Proses',
    title: 'Proses Fermentasi (Rahasia 24 Jam)',
    excerpt: 'Teknik settling 2 jam, pengadukan mekanis 30 menit, dan waktu emas fermentasi agar minyak terpisah sempurna tanpa tengik.',
    thumbnail: '/src/assets/thumbnail/modul4.png',
    readTime: '12 min baca',
    author: 'Tim Teknis Vico',
    date: '13 Feb 2026',
    content: [
      {
        type: 'heading',
        content: 'Rahasia 24 Jam: Seni Fermentasi VCO',
        level: 2
      },
      {
        type: 'paragraph',
        content: 'Fermentasi adalah "jantung" dari pembuatan VCO. Di fase inilah santan cair akan bertransformasi secara ajaib menjadi minyak murni sebening kristal. Banyak orang gagal di sini karena tidak sabar, namun sains membuktikan bahwa ketepatan waktu adalah segalanya.'
      },
      {
        type: 'paragraph',
        content: 'Berikut adalah panduan langkah demi langkah berdasarkan standar ilmiah terbaru untuk menjamin keberhasilan produksi Anda.'
      },
      {
        type: 'heading',
        content: '1. Fase Settling (Pendiaman Awal)',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Langkah pertama setelah pemerasan bukanlah langsung fermentasi, melainkan pendiaman (settling). Tuang santan ke wadah transparan dan biarkan istirahat total selama 2 jam.'
      },
      {
        type: 'callout',
        variant: 'info',
        title: 'Mengapa ini wajib?',
        content: 'Berdasarkan prinsip Hukum Stokes yang dijelaskan oleh Wong (2014), pendiaman ini memberikan waktu bagi gravitasi untuk menarik air yang berat ke dasar wadah, sementara krim minyak yang ringan akan naik ke atas. Setelah 2 jam, Anda wajib memisahkan krim dari lapisan air keruh (skim) di bagian bawah. Polosakan & Alamsyah (2016) menegaskan bahwa membuang air ini akan memekatkan nutrisi pada krim, membuat bakteri bekerja jauh lebih agresif dan efisien.'
      },
      {
        type: 'heading',
        content: '2. Teknik Pengadukan (Mechanical Demulsification)',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Setelah air dibuang, lakukan pengadukan pada krim dengan pola kiri-kanan secara konstan selama 30 menit. Ini bukan sekadar mencampur, tapi sebuah teknik yang disebut Demulsifikasi Mekanis.'
      },
      {
        type: 'paragraph',
        content: 'Menurut riset Mandei (2019), butiran minyak dalam santan dilindungi oleh lapisan protein yang kuat. Energi gesekan dari pengadukan selama 30 menit ini berfungsi untuk "melemahkan" dan merenggangkan kulit pelindung tersebut. Dengan pertahanan protein yang sudah lemah, bakteri fermentasi nantinya tidak perlu membuang banyak energi untuk menembus dinding sel, sehingga minyak bisa keluar lebih cepat.'
      },
      {
        type: 'heading',
        content: '3. Waktu Emas: Tepat 24 Jam',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Simpan wadah di suhu ruang hangat (30-40°C) dan biarkan fermentasi bekerja selama tepat 24 jam.'
      },
      {
        type: 'paragraph',
        content: 'Ini adalah angka mati. Studi Raghavendra (2010) menunjukkan bahwa pada jam ke-24, pH santan akan turun mencapai titik ideal (Titik Isoelektrik pH 4.5), di mana protein pecah total dan melepaskan minyak murni.'
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Jangan Tergiur Menunggu Lebih Lama!',
        content: 'Nuraisyah dkk. (2025) memperingatkan bahwa jika fermentasi melewati 24 jam, bakteri yang kelaparan akan mulai memproduksi enzim Lipase. Enzim ini akan memakan minyak Anda dan mengubahnya menjadi Asam Lemak Bebas (FFA), penyebab utama bau tengik dan rasa gatal di tenggorokan.'
      },
      {
        type: 'heading',
        content: '4. Pemanenan (The Art of Harvesting)',
        level: 3
      },
      {
        type: 'paragraph',
        content: 'Saat panen, Anda akan melihat tiga lapisan jelas: Minyak (atas), Blondo (tengah), dan Air (bawah). Ambil minyak menggunakan sendok sayur (ladle) stainless secara perlahan.'
      },
      {
        type: 'paragraph',
        content: 'Berkat perbedaan Tegangan Antarmuka (Interfacial Tension), minyak dan air yang sudah terpisah tidak akan mudah bercampur kembali. Minyak akan mengapung stabil di atas blondo, memudahkan Anda mengambilnya hingga tetes terakhir tanpa takut kotor.'
      }
    ],
    references: [
      { title: 'Mandei, J. (2019). Metode Pemecahan Emulsi Krim Santan. Jurnal Riset Teknologi Industri.' },
      { title: 'Nuraisyah, A., dkk. (2025). Lama Penyimpanan Buah Kelapa terhadap Mutu VCO. Jurnal Agroplantae.' },
      { title: 'Polosakan, R., & Alamsyah, A. (2016). Pengaruh Metode Pengolahan Terhadap Kualitas VCO.' },
      { title: 'Raghavendra, S.N., et al. (2010). Aqueous extraction of coconut oil. Food and Bioprocess Technology.' },
      { title: 'Wong, P. W. (2014). Demulsification of Coconut Milk Emulsion. Universiti Malaysia Pahang.' }
    ]
  }
];
