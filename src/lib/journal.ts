/**
 * MAISARA JOURNAL — sumber kandungan editorial.
 *
 * Ini SATU-SATUNYA tempat untuk menulis, menyunting atau menggantikan entri
 * jurnal. Halaman indeks (`/journal`), halaman butiran (`/journal/[slug]`),
 * metadata SEO, structured data dan petikan di halaman lain semuanya membaca
 * modul ini, jadi kandungan tidak pernah disalin ke dalam komponen.
 *
 * Peraturan kandungan:
 * - Bahasa Melayu, nada tenang dan konkrit tentang fabrik, potongan,
 *   penjagaan dan pemakaian harian. Tiada berita rekaan, tiada dakwaan
 *   pihak ketiga, tiada anugerah yang tidak disahkan.
 * - `image` mesti aset sebenar di bawah `public/products/` (lihat
 *   `@/lib/product-images`). Bila tiada imej yang sesuai, gunakan null dan
 *   komponen akan memaparkan placeholder yang disengajakan.
 * - `publishedAt` ialah tarikh ISO (YYYY-MM-DD).
 * - Susunan array ialah susunan paparan: terbaru dahulu.
 */

import { EDITORIAL_IMAGES } from "@/lib/product-images";

export interface JournalEntry {
  slug: string;
  title: string;
  category: "STYLE" | "CRAFT" | "HERITAGE" | "EVERYDAY" | "NOTES";
  excerpt: string;
  readingMinutes: number;
  /** Tarikh ISO (YYYY-MM-DD). */
  publishedAt: string;
  /** Aset sebenar di bawah /products, atau null bila tiada. */
  image: string | null;
  /** Perenggan badan artikel, dipaparkan mengikut urutan. */
  body: string[];
}

/**
 * Kategori jurnal mengikut urutan tetap. Penapis di halaman indeks membaca
 * senarai ini supaya pautan penapis sentiasa sepadan dengan kandungan sebenar.
 */
export const JOURNAL_CATEGORIES = [
  "STYLE",
  "CRAFT",
  "HERITAGE",
  "EVERYDAY",
  "NOTES",
] as const satisfies readonly JournalEntry["category"][];

export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    slug: "lapisan-yang-berfungsi",
    title: "Lapisan yang berfungsi",
    category: "STYLE",
    excerpt:
      "Cuaca Malaysia menuntut lebih daripada satu lapisan. Panduan ringkas memilih lapisan dalam, tengah dan luar yang benar-benar berguna sepanjang hari.",
    readingMinutes: 4,
    publishedAt: "2026-09-12",
    image: EDITORIAL_IMAGES.drape,
    body: [
      "Di Malaysia, lapisan pakaian bukan soal gaya semata-mata. Ia soal suhu: panas di luar, sejuk di dalam bangunan, dan hujan yang datang tanpa amaran.",
      "Mulakan dengan lapisan yang paling dekat dengan badan. Kapas dan voal bernafas dengan baik, menyerap peluh dan kering dengan cepat. Fabrik licin seperti satin terasa sejuk pada kulit tetapi kurang menyerap, jadi ia lebih sesuai sebagai lapisan luar.",
      "Lapisan tengah menentukan bentuk. Baju kurung dengan potongan lurus memberi ruang udara. Dress yang diikat pada pinggang memberi garis yang lebih jelas. Pilih satu sahaja supaya lapisan luar berbual dengan yang di dalam, bukan bertanding.",
      "Untuk lapisan luar, tudung atau selendang yang lebih panjang boleh menutup bahu dan menambah kehangatan pada hari berhawa dingin tanpa menambah banyak berat.",
      "Satu peraturan mudah: jangan tambah lapisan yang perlu anda betulkan sepanjang hari. Jika anda perlu menariknya setiap kali berjalan, ia terlalu ketat. Jika ia bergelembung di belakang, ia terlalu longgar.",
      "Simpan lapisan asas dalam warna yang saling menyamai. Tiga helai biasanya cukup untuk seminggu, dan setiap satu boleh dipadankan dengan semua yang lain.",
    ],
  },
  {
    slug: "jahitan-tepi-yang-rapi",
    title: "Apa yang jahitan tepi beritahu kita",
    category: "CRAFT",
    excerpt:
      "Bahagian dalam pakaian ialah tempat pertama yang kami periksa. Tepi, kelim dan zip menceritakan berapa lama sehelai pakaian akan bertahan.",
    readingMinutes: 6,
    publishedAt: "2026-08-15",
    image: EDITORIAL_IMAGES.stitch,
    body: [
      "Sebelum sehelai pakaian sampai ke tangan anda, tepinya disiapkan beberapa kali. Bahagian dalam ialah tempat pertama yang kami periksa, kerana di situlah kerja yang tergesa-gesa paling mudah kelihatan.",
      "Jahitan tepi yang rapi tidak berbulu dan tidak berkedut apabila kain dibalikkan. Pada fabrik licin, tepi biasanya dikemas dengan jahitan kelim berganda atau zigzag halus supaya benang tidak terurai selepas beberapa kali basuh.",
      "Kelim bawah dibuat dengan jahitan tersembunyi. Apabila anda mengangkat kain ke arah cahaya, anda sepatutnya melihat garis yang halus, bukan benang melintang yang jelas.",
      "Butang dijahit dengan benang yang sama warna kain, dan zip dipasang supaya kepala zip tidak mengganggu kulit. Butiran kecil ini tidak kelihatan pada gambar, tetapi ia terasa setiap kali dipakai.",
      "Kami tidak menyembunyikan bahagian dalam. Jika sesuatu pakaian dibalikkan, ia sepatutnya masih kelihatan kemas.",
      "Apabila pesanan sampai, periksa tepi dan kelim. Jika ada yang tidak kena, beritahu kami dalam tujuh hari dan kami akan uruskan pertukaran.",
    ],
  },
  {
    slug: "kain-yang-disiapkan-perlahan",
    title: "Kain yang disiapkan perlahan",
    category: "HERITAGE",
    excerpt:
      "Batik dan songket ialah kaedah menyiapkan kain, bukan sekadar corak. Memahami prosesnya mengubah cara kita memakainya.",
    readingMinutes: 7,
    publishedAt: "2026-06-27",
    image: EDITORIAL_IMAGES.heritage,
    body: [
      "Batik dan songket bukan sekadar corak. Kedua-duanya kaedah menyiapkan kain, dan keduanya mengambil masa.",
      "Batik dibuat dengan lilin. Lilin diletakkan pada kain, warna disapu, dan bahagian yang berlilin menolak warna itu. Proses ini diulang mengikut bilangan warna yang diingini, jadi kain dengan lima warna melalui lima pusingan.",
      "Songket ditenun dengan benang tambahan. Benang logam dimasukkan antara benang asas supaya coraknya timbul dan tidak rata dengan permukaan kain. Kerja ini dilakukan baris demi baris.",
      "Apabila kain yang disiapkan dengan tangan dipakai setiap hari, ia akan berubah. Benang logam boleh melengkung sedikit dan warna batik menjadi lebih lembut. Itu bukan kerosakan, itu sebahagian daripada sifat bahannya.",
      "Dalam koleksi kami, corak jarang dipakai sepenuhnya. Satu motif kecil pada hujung kain, satu jalur halus, atau sekadar rona yang menyerupai kesan lilin lebih mudah dipakai berulang kali.",
      "Warisan tidak perlu dipamerkan dengan kuat untuk dihargai. Ia boleh hadir sebagai satu butiran yang anda perasan pada kali ketiga anda memakai pakaian itu.",
    ],
  },
  {
    slug: "pakaian-untuk-hari-yang-panjang",
    title: "Pakaian untuk hari yang panjang",
    category: "EVERYDAY",
    excerpt:
      "Perjalanan, kerja, urusan keluarga. Pakaian yang baik untuk hari panjang ialah pakaian yang tidak perlu anda fikirkan.",
    readingMinutes: 5,
    publishedAt: "2026-05-09",
    image: EDITORIAL_IMAGES.everyday,
    body: [
      "Hari biasa di Malaysia bermula awal dan berakhir lewat: perjalanan, kerja, urusan keluarga, dan mungkin satu kunjungan sebelum pulang.",
      "Pakaian yang baik untuk hari seperti ini tidak menarik perhatian. Ia membenarkan anda duduk, memandu, membawa barang dan bersolat tanpa perlu membetulkan apa-apa.",
      "Bahan memainkan peranan besar. Kapas berkedut sedikit selepas duduk lama, dan itu normal. Fabrik campuran yang mengandungi sedikit gentian anjal pula mengekalkan bentuk tetapi kurang bernafas.",
      "Potongan yang longgar sedikit pada bahu dan pinggang memberi ruang untuk bergerak. Jika anda memilih saiz yang tepat pada badan dari awal, duduk berjam-jam akan terasa ketat pada penghujung hari.",
      "Warna yang lebih gelap bertahan lebih lama kerana kesan perjalanan kurang kelihatan. Simpan warna cerah untuk hari yang lebih lapang.",
      "Keselesaan jarang kelihatan pada gambar. Ia terasa pada pukul empat petang, apabila anda masih belum perlu menyesuaikan apa pun.",
    ],
  },
  {
    slug: "membasuh-dan-menyimpan-tudung",
    title: "Membasuh dan menyimpan tudung",
    category: "NOTES",
    excerpt:
      "Tudung paling lama bertahan apabila ia dibasuh dengan lembut dan dikeringkan tanpa haba. Beberapa langkah yang mudah diikuti.",
    readingMinutes: 4,
    publishedAt: "2026-03-21",
    image: EDITORIAL_IMAGES.fold,
    body: [
      "Tudung paling lama bertahan apabila ia dibasuh dengan lembut dan dikeringkan tanpa haba.",
      "Voal dan kapas: basuh dengan tangan dalam air sejuk, atau mesin pada kitaran halus di dalam beg kain. Elakkan putaran yang kuat kerana ia menarik bentuk tudung.",
      "Satin dan fabrik licin: basuh berasingan daripada barang berzip atau berkait supaya permukaannya tidak tercalar.",
      "Sabun yang lembut lebih selamat daripada pencuci beralkali tinggi. Jika ada kotoran setempat, gosok perlahan dengan jari, bukan berus keras.",
      "Keringkan dengan menggantung di tempat berlorek atau mengeringkan pada permukaan rata. Cahaya matahari langsung menjejaskan warna, terutama pada warna gelap.",
      "Simpan tudung yang sudah dilipat di dalam bekas yang kering. Gantung hanya tudung yang berat. Fabrik halus boleh memanjang jika dibiarkan tergantung terlalu lama.",
    ],
  },
  {
    slug: "potongan-yang-mengikut-badan",
    title: "Potongan yang mengikut badan",
    category: "CRAFT",
    excerpt:
      "Tiada satu potongan yang sesuai untuk semua orang. Bahu dan lubang lengan ialah dua bahagian yang paling menentukan selesa.",
    readingMinutes: 5,
    publishedAt: "2026-02-14",
    image: EDITORIAL_IMAGES.atelier,
    body: [
      "Tiada satu potongan yang sesuai untuk semua orang. Kami bekerja dengan beberapa asas dan mengubah suai ukurannya mengikut maklum balas pelanggan.",
      "Bahagian yang paling menentukan selesa ialah bahu dan lubang lengan. Jika dua bahagian ini betul, keseluruhan pakaian jatuh dengan kemas walaupun bahagian lain sedikit longgar.",
      "Panjang lengan diukur semasa tangan dalam keadaan rehat, bukan semasa tangan diluruskan ke hadapan. Inilah sebab lengan kadang-kadang terasa pendek apabila memandu.",
      "Untuk baju kurung dan abaya, lebar badan di bawah dada menentukan berapa banyak ruang udara yang ada. Lebihan kain tidak menjadikannya lebih sopan, ia hanya menambah berat.",
      "Setiap perubahan bentuk dibuat pada pola, bukan pada kain yang sudah siap. Ini mengelakkan garis yang tidak seimbang antara kiri dan kanan.",
      "Jika saiz yang anda terima tidak sesuai, tukar dalam tujuh hari. Saiz yang betul mengubah cara anda memakai pakaian itu setiap kali.",
    ],
  },
];

/** Entri tunggal mengikut slug; null bila slug tidak dikenali. */
export function getJournalEntry(slug: string): JournalEntry | null {
  return JOURNAL_ENTRIES.find((entry) => entry.slug === slug) ?? null;
}

/**
 * Entri dalam satu kategori. Perbandingan tidak sensitif huruf besar kerana
 * kategori datang daripada parameter carian (`?kategori=STYLE`).
 */
export function getJournalByCategory(category: string): JournalEntry[] {
  const wanted = category.trim().toUpperCase();
  return JOURNAL_ENTRIES.filter((entry) => entry.category === wanted);
}