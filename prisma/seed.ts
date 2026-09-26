import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { imagesFor } from "../src/lib/product-images";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// ---------- Types ----------
interface VariantSeed {
  color: string;
  size: string | null;
  sku: string;
  stock: number;
}

interface ProductSeed {
  name: string;
  slug: string;
  code: string;
  description: string;
  price: string;
  categorySlug: string;
  featured?: boolean;
  imageCount: number;
  variants: VariantSeed[];
}

// ---------- Kategori ----------
const categories = [
  {
    name: "Tudung",
    slug: "tudung",
    description: "Tudung dan hijab moden untuk gaya harian, kerja dan majlis.",
    order: 1,
  },
  {
    name: "Baju Kurung",
    slug: "baju-kurung",
    description: "Baju kurung tradisional dan moden, potongan selesa dan anggun.",
    order: 2,
  },
  {
    name: "Dress",
    slug: "dress",
    description: "Dress kasual hingga formal, sesuai untuk pelbagai acara.",
    order: 3,
  },
  {
    name: "Abaya",
    slug: "abaya",
    description: "Abaya labuh dengan potongan elegan dan kain berkualiti.",
    order: 4,
  },
  {
    name: "Aksesori",
    slug: "aksesori",
    description: "Aksesori pelengkap busana: brooch, magnet, pin dan beg.",
    order: 5,
  },
];

// ---------- Produk ----------
const products: ProductSeed[] = [
  // ----- Tudung -----
  {
    name: "Tudung Bella Voal Premium",
    slug: "tudung-bella-voal",
    code: "BELLA",
    description:
      "Voal premium dengan tekstur lembut, tidak panas dan mudah dibentuk. Sesuai untuk kegunaan harian dan majlis.",
    price: "39.90",
    categorySlug: "tudung",
    featured: true,
    imageCount: 4,
    variants: [
      { color: "Sage", size: null, sku: "MAI-BELLA-SAGE", stock: 42 },
      { color: "Ivory", size: null, sku: "MAI-BELLA-IVORY", stock: 35 },
      { color: "Mocha", size: null, sku: "MAI-BELLA-MOCHA", stock: 3 },
      { color: "Black", size: null, sku: "MAI-BELLA-BLACK", stock: 0 },
    ],
  },
  {
    name: "Tudung Sekolah Arissa",
    slug: "tudung-sekolah-arissa",
    code: "ARISSA",
    description:
      "Tudung sekolah daripada kain cotton yang selesa dan mudah diselenggara. Sesuai untuk pelajar dan kegunaan harian.",
    price: "29.90",
    categorySlug: "tudung",
    imageCount: 2,
    variants: [
      { color: "Navy", size: null, sku: "MAI-ARISSA-NAVY", stock: 80 },
      { color: "Black", size: null, sku: "MAI-ARISSA-BLACK", stock: 64 },
      { color: "Cream", size: null, sku: "MAI-ARISSA-CREAM", stock: 2 },
    ],
  },
  {
    name: "Shawl Silk Premium",
    slug: "shawl-silk-premium",
    code: "SILK",
    description:
      "Shawl sutera premium dengan kemasan mewah dan jatuhan kain yang cantik. Pilihan terbaik untuk majlis rasmi.",
    price: "89.00",
    categorySlug: "tudung",
    featured: true,
    imageCount: 3,
    variants: [
      { color: "Emerald", size: null, sku: "MAI-SILK-EMERALD", stock: 18 },
      { color: "Burgundy", size: null, sku: "MAI-SILK-BURGUNDY", stock: 12 },
      { color: "Gold", size: null, sku: "MAI-SILK-GOLD", stock: 5 },
      { color: "Black", size: null, sku: "MAI-SILK-BLACK", stock: 26 },
    ],
  },
  {
    name: "Tudung Bawal Cotton",
    slug: "tudung-bawal-cotton",
    code: "BAWAL",
    description:
      "Tudung bawal daripada kain cotton lembut yang sejuk dipakai. Sesuai untuk aktiviti harian dan cuaca panas.",
    price: "19.90",
    categorySlug: "tudung",
    imageCount: 2,
    variants: [
      { color: "Ivory", size: null, sku: "MAI-BAWAL-IVORY", stock: 55 },
      { color: "Mocha", size: null, sku: "MAI-BAWAL-MOCHA", stock: 47 },
      { color: "Rose", size: null, sku: "MAI-BAWAL-ROSE", stock: 0 },
    ],
  },
  {
    name: "Tudung Satin Luxe",
    slug: "tudung-satin-luxe",
    code: "SATIN",
    description:
      "Tudung satin dengan kilauan lembut dan tekstur licin. Memberikan sentuhan elegan pada sebarang gaya.",
    price: "59.00",
    categorySlug: "tudung",
    imageCount: 3,
    variants: [
      { color: "Dusty Pink", size: null, sku: "MAI-SATIN-DUSTY-PINK", stock: 22 },
      { color: "Taupe", size: null, sku: "MAI-SATIN-TAUPE", stock: 4 },
      { color: "Black", size: null, sku: "MAI-SATIN-BLACK", stock: 31 },
    ],
  },

  // ----- Baju Kurung -----
  {
    name: "Baju Kurung Moden Cik Puan",
    slug: "baju-kurung-cik-puan",
    code: "CIKPUAN",
    description:
      "Baju kurung moden dengan potongan kontemporari dan kain berkualiti. Sesuai untuk kerja dan majlis santai.",
    price: "159.00",
    categorySlug: "baju-kurung",
    featured: true,
    imageCount: 4,
    variants: [
      { color: "Sage", size: "S", sku: "MAI-CIKPUAN-SAGE-S", stock: 8 },
      { color: "Sage", size: "M", sku: "MAI-CIKPUAN-SAGE-M", stock: 12 },
      { color: "Mocha", size: "S", sku: "MAI-CIKPUAN-MOCHA-S", stock: 6 },
      { color: "Mocha", size: "M", sku: "MAI-CIKPUAN-MOCHA-M", stock: 9 },
    ],
  },
  {
    name: "Baju Kurung Tradisional Melati",
    slug: "baju-kurung-melati",
    code: "MELATI",
    description:
      "Baju kurung tradisional dengan potongan klasik dan selesa. Sesuai untuk majlis rasmi dan kegunaan harian.",
    price: "139.00",
    categorySlug: "baju-kurung",
    imageCount: 3,
    variants: [
      { color: "Ivory", size: "S", sku: "MAI-MELATI-IVORY-S", stock: 15 },
      { color: "Ivory", size: "M", sku: "MAI-MELATI-IVORY-M", stock: 4 },
      { color: "Ivory", size: "L", sku: "MAI-MELATI-IVORY-L", stock: 11 },
    ],
  },
  {
    name: "Baju Kurung Moden Sofea",
    slug: "baju-kurung-sofea",
    code: "SOFEA",
    description:
      "Baju kurung moden dengan butiran lace halus dan potongan yang menyerlahkan siluet. Pilihan untuk majlis.",
    price: "149.00",
    categorySlug: "baju-kurung",
    imageCount: 3,
    variants: [
      { color: "Dusty Pink", size: "S", sku: "MAI-SOFEA-DUSTY-PINK-S", stock: 7 },
      { color: "Dusty Pink", size: "M", sku: "MAI-SOFEA-DUSTY-PINK-M", stock: 13 },
      { color: "Navy", size: "S", sku: "MAI-SOFEA-NAVY-S", stock: 0 },
      { color: "Navy", size: "M", sku: "MAI-SOFEA-NAVY-M", stock: 5 },
    ],
  },
  {
    name: "Baju Kurung Pahang Lace",
    slug: "baju-kurung-pahang-lace",
    code: "PAHANG",
    description:
      "Baju kurung Pahang dengan lace halus di bahagian lengan dan dada. Kemasan kemas untuk majlis rasmi.",
    price: "169.00",
    categorySlug: "baju-kurung",
    imageCount: 2,
    variants: [
      { color: "Cream", size: "M", sku: "MAI-PAHANG-CREAM-M", stock: 10 },
      { color: "Cream", size: "L", sku: "MAI-PAHANG-CREAM-L", stock: 6 },
      { color: "Beige", size: "M", sku: "MAI-PAHANG-BEIGE-M", stock: 2 },
    ],
  },
  {
    name: "Baju Kurung Moden Ameena",
    slug: "baju-kurung-ameena",
    code: "AMEENA",
    description:
      "Baju kurung moden dengan warna pekat dan fabrik tebal yang kemas. Sesuai untuk suasana formal.",
    price: "179.00",
    categorySlug: "baju-kurung",
    imageCount: 3,
    variants: [
      { color: "Emerald", size: "S", sku: "MAI-AMEENA-EMERALD-S", stock: 9 },
      { color: "Emerald", size: "M", sku: "MAI-AMEENA-EMERALD-M", stock: 14 },
      { color: "Emerald", size: "L", sku: "MAI-AMEENA-EMERALD-L", stock: 7 },
      { color: "Black", size: "M", sku: "MAI-AMEENA-BLACK-M", stock: 0 },
    ],
  },

  // ----- Dress -----
  {
    name: "Dress Kasual Dahlia",
    slug: "dress-kasual-dahlia",
    code: "DAHLIA",
    description:
      "Dress kasual dengan potongan A-line yang selesa. Sesuai untuk santai, kerja dan acara separa formal.",
    price: "129.00",
    categorySlug: "dress",
    imageCount: 3,
    variants: [
      { color: "Mocha", size: "S", sku: "MAI-DAHLIA-MOCHA-S", stock: 16 },
      { color: "Mocha", size: "M", sku: "MAI-DAHLIA-MOCHA-M", stock: 21 },
      { color: "Sage", size: "S", sku: "MAI-DAHLIA-SAGE-S", stock: 4 },
      { color: "Sage", size: "M", sku: "MAI-DAHLIA-SAGE-M", stock: 18 },
    ],
  },
  {
    name: "Dress Raya Satin",
    slug: "dress-raya-satin",
    code: "RAYA",
    description:
      "Dress satin mewah dengan kilauan elegan, sesuai untuk Hari Raya dan majlis istimewa. Potongan flattering.",
    price: "199.00",
    categorySlug: "dress",
    featured: true,
    imageCount: 4,
    variants: [
      { color: "Ivory", size: "S", sku: "MAI-RAYA-IVORY-S", stock: 12 },
      { color: "Ivory", size: "M", sku: "MAI-RAYA-IVORY-M", stock: 8 },
      { color: "Ivory", size: "L", sku: "MAI-RAYA-IVORY-L", stock: 5 },
      { color: "Gold", size: "M", sku: "MAI-RAYA-GOLD-M", stock: 3 },
    ],
  },
  {
    name: "Dress Midi Serenity",
    slug: "dress-midi-serenity",
    code: "SERENITY",
    description:
      "Dress midi dengan potongan lembut dan kain yang menyerap peluh. Selesa dipakai sepanjang hari.",
    price: "149.00",
    categorySlug: "dress",
    imageCount: 3,
    variants: [
      { color: "Navy", size: "S", sku: "MAI-SERENITY-NAVY-S", stock: 20 },
      { color: "Navy", size: "M", sku: "MAI-SERENITY-NAVY-M", stock: 15 },
      { color: "Taupe", size: "M", sku: "MAI-SERENITY-TAUPE-M", stock: 1 },
      { color: "Taupe", size: "L", sku: "MAI-SERENITY-TAUPE-L", stock: 0 },
    ],
  },
  {
    name: "Dress Kaftan Zamrud",
    slug: "dress-kaftan-zamrud",
    code: "ZAMRUD",
    description:
      "Kaftan dress longgar dengan warna zamrud yang kaya. Sesuai untuk majlis dan percutian.",
    price: "189.00",
    categorySlug: "dress",
    imageCount: 2,
    variants: [
      { color: "Emerald", size: "M", sku: "MAI-ZAMRUD-EMERALD-M", stock: 13 },
      { color: "Emerald", size: "L", sku: "MAI-ZAMRUD-EMERALD-L", stock: 9 },
      { color: "Black", size: "M", sku: "MAI-ZAMRUD-BLACK-M", stock: 11 },
    ],
  },

  // ----- Abaya -----
  {
    name: "Abaya Basic Naura",
    slug: "abaya-basic-naura",
    code: "NAURA",
    description:
      "Abaya basic dengan potongan lurus dan kemasan kemas. Essential item yang wajib ada untuk gaya harian.",
    price: "249.00",
    categorySlug: "abaya",
    imageCount: 3,
    variants: [
      { color: "Black", size: "S", sku: "MAI-NAURA-BLACK-S", stock: 25 },
      { color: "Black", size: "M", sku: "MAI-NAURA-BLACK-M", stock: 30 },
      { color: "Black", size: "L", sku: "MAI-NAURA-BLACK-L", stock: 18 },
    ],
  },
  {
    name: "Abaya Lace Emma",
    slug: "abaya-lace-emma",
    code: "EMMA",
    description:
      "Abaya dengan lace halus di bahagian tepi dan lengan. Gabungan elegan antara tradisional dan moden.",
    price: "299.00",
    categorySlug: "abaya",
    imageCount: 4,
    variants: [
      { color: "Black", size: "S", sku: "MAI-EMMA-BLACK-S", stock: 6 },
      { color: "Black", size: "M", sku: "MAI-EMMA-BLACK-M", stock: 9 },
      { color: "Navy", size: "S", sku: "MAI-EMMA-NAVY-S", stock: 2 },
      { color: "Navy", size: "M", sku: "MAI-EMMA-NAVY-M", stock: 0 },
    ],
  },
  {
    name: "Abaya Moden Layla",
    slug: "abaya-moden-layla",
    code: "LAYLA",
    description:
      "Abaya moden dengan zip tersembunyi dan potongan yang kemas. Sesuai untuk kerja dan acara rasmi.",
    price: "269.00",
    categorySlug: "abaya",
    imageCount: 3,
    variants: [
      { color: "Mocha", size: "M", sku: "MAI-LAYLA-MOCHA-M", stock: 12 },
      { color: "Mocha", size: "L", sku: "MAI-LAYLA-MOCHA-L", stock: 7 },
      { color: "Black", size: "L", sku: "MAI-LAYLA-BLACK-L", stock: 4 },
    ],
  },
  {
    name: "Abaya Premium Sarah",
    slug: "abaya-premium-sarah",
    code: "SARAH",
    description:
      "Abaya premium daripada fabrik high-twist yang kalis kedut. Kemasan eksklusif untuk penampilan terbaik.",
    price: "399.00",
    categorySlug: "abaya",
    imageCount: 3,
    variants: [
      { color: "Black", size: "S", sku: "MAI-SARAH-BLACK-S", stock: 5 },
      { color: "Black", size: "M", sku: "MAI-SARAH-BLACK-M", stock: 8 },
      { color: "Black", size: "L", sku: "MAI-SARAH-BLACK-L", stock: 3 },
    ],
  },

  // ----- Aksesori -----
  {
    name: "Brooch Emas Gold",
    slug: "brooch-emas-gold",
    code: "BROOCH",
    description:
      "Brooch emas dengan reka bentuk bunga halus. Pelengkap sempurna untuk tudung dan baju kurung.",
    price: "29.90",
    categorySlug: "aksesori",
    imageCount: 2,
    variants: [
      { color: "Gold", size: null, sku: "MAI-BROOCH-GOLD", stock: 40 },
      { color: "Rose Gold", size: null, sku: "MAI-BROOCH-ROSE-GOLD", stock: 2 },
    ],
  },
  {
    name: "Shawl Magnet Set",
    slug: "shawl-magnet-set",
    code: "MAGNET",
    description:
      "Set magnet shawl yang mudah digunakan, tidak perlu pin. Sesuai untuk gaya hijab harian yang cepat.",
    price: "24.90",
    categorySlug: "aksesori",
    imageCount: 2,
    variants: [
      { color: "Ivory", size: null, sku: "MAI-MAGNET-IVORY", stock: 33 },
      { color: "Black", size: null, sku: "MAI-MAGNET-BLACK", stock: 0 },
    ],
  },
  {
    name: "Tudung Pin Set",
    slug: "tudung-pin-set",
    code: "PIN",
    description:
      "Set pin tudung dengan kemasan berkilat dan tahan karat. Datang dalam pek pelbagai reka bentuk.",
    price: "19.90",
    categorySlug: "aksesori",
    imageCount: 2,
    variants: [
      { color: "Gold", size: null, sku: "MAI-PIN-GOLD", stock: 60 },
      { color: "Silver", size: null, sku: "MAI-PIN-SILVER", stock: 28 },
    ],
  },
  {
    name: "Handbag Serut Kecil",
    slug: "handbag-serut-kecil",
    code: "SERUT",
    description:
      "Handbag serut bersaiz kecil dengan tali boleh laras. Sesuai untuk majlis dan kegunaan harian.",
    price: "89.00",
    categorySlug: "aksesori",
    imageCount: 3,
    variants: [
      { color: "Mocha", size: null, sku: "MAI-SERUT-MOCHA", stock: 15 },
      { color: "Black", size: null, sku: "MAI-SERUT-BLACK", stock: 4 },
      { color: "Cream", size: null, sku: "MAI-SERUT-CREAM", stock: 9 },
    ],
  },
];

// ---------- Seed ----------
// Imej produk: satu sumber dengan aplikasi (src/lib/product-images.ts).
// Sebelum ini seed menyimpan peta sendiri yang menunjuk kepada imej stok
// berwatermark; kini kedua-duanya merujuk fotografi jenama yang sama.

async function main() {
  console.log("Mula seeding katalog...");

  // Kategori
  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, order: c.order },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        order: c.order,
      },
    });
  }
  console.log(`Kategori: ${categories.length} siap.`);

  // Produk + variants
  let variantCount = 0;
  for (const p of products) {
    const category = await db.category.findUniqueOrThrow({
      where: { slug: p.categorySlug },
    });

    const product = await db.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: category.id,
        isActive: true,
        featured: p.featured ?? false,
        images: imagesFor(p.slug, p.imageCount),
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        categoryId: category.id,
        isActive: true,
        featured: p.featured ?? false,
        images: imagesFor(p.slug, p.imageCount),
      },
    });

    for (const v of p.variants) {
      await db.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          productId: product.id,
          color: v.color,
          size: v.size,
          stock: v.stock,
        },
        create: {
          productId: product.id,
          color: v.color,
          size: v.size,
          sku: v.sku,
          stock: v.stock,
        },
      });
      variantCount += 1;
    }
  }

  console.log(`Produk: ${products.length} siap.`);
  console.log(`Variants: ${variantCount} siap.`);

  // ---------- Pengguna demo (Better Auth) ----------
  interface SeedUser {
    email: string;
    name: string;
    role: "ADMIN" | "CUSTOMER";
    password: string;
  }

  const seedUsers: SeedUser[] = [
    { email: "admin@maisara.my", name: "Aminah", role: "ADMIN", password: "AdminDemo123!" },
    { email: "nurul@maisara.my", name: "Nurul Aisyah", role: "CUSTOMER", password: "Demo123!" },
    { email: "aina@maisara.my", name: "Aina Sofea", role: "CUSTOMER", password: "Demo123!" },
  ];
  const seedEmails = seedUsers.map((u) => u.email);

  // Padam data sedia ada (idempotent): Review → Payment → OrderItem → Order → Account → User
  const existingUsers = await db.user.findMany({
    where: { email: { in: seedEmails } },
    select: { id: true },
  });
  const existingIds = existingUsers.map((u) => u.id);
  if (existingIds.length > 0) {
    await db.review.deleteMany({ where: { userId: { in: existingIds } } });
    await db.payment.deleteMany({ where: { order: { userId: { in: existingIds } } } });
    await db.orderItem.deleteMany({ where: { order: { userId: { in: existingIds } } } });
    await db.order.deleteMany({ where: { userId: { in: existingIds } } });
    await db.account.deleteMany({ where: { userId: { in: existingIds } } });
    await db.user.deleteMany({ where: { id: { in: existingIds } } });
    console.log(`Pengguna demo sedia ada dipadam: ${existingIds.length}.`);
  }

  const users = new Map<string, string>(); // email -> id
  for (const u of seedUsers) {
    const passwordHash = await hashPassword(u.password);
    const user = await db.user.create({
      data: { name: u.name, email: u.email, emailVerified: true, role: u.role },
    });
    await db.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: passwordHash,
      },
    });
    users.set(u.email, user.id);
  }
  console.log(`Pengguna demo: ${seedUsers.length} siap.`);

  // ---------- Pesanan demo ----------
  interface OrderSeedItem {
    sku: string;
    productName: string;
    color: string | null;
    size: string | null;
    quantity: number;
    unitPrice: string;
  }

  interface OrderSeed {
    userEmail: string;
    status: "PENDING" | "COMPLETED" | "SHIPPED" | "CANCELLED";
    paymentStatus: "PAID" | "FAILED";
    subtotal: string;
    shippingFee: string;
    total: string;
    shippingMethod: "J&T Express" | "Pos Laju";
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      state: string;
      postcode: string;
    };
    items: OrderSeedItem[];
  }

  const orderSeeds: OrderSeed[] = [
    {
      userEmail: "nurul@maisara.my",
      status: "PENDING",
      paymentStatus: "PAID",
      subtotal: "109.70",
      shippingFee: "7.00",
      total: "116.70",
      shippingMethod: "J&T Express",
      shippingAddress: {
        name: "Nurul Aisyah",
        phone: "012-3456789",
        address: "No. 12, Jalan Seri Orkid 3, Taman Seri Orkid",
        state: "Selangor",
        postcode: "40000",
      },
      items: [
        { sku: "MAI-BELLA-SAGE", productName: "Tudung Bella Voal Premium", color: "Sage", size: null, quantity: 2, unitPrice: "39.90" },
        { sku: "MAI-BROOCH-GOLD", productName: "Brooch Emas Gold", color: "Gold", size: null, quantity: 1, unitPrice: "29.90" },
      ],
    },
    {
      userEmail: "nurul@maisara.my",
      status: "COMPLETED",
      paymentStatus: "PAID",
      subtotal: "387.00",
      shippingFee: "10.00",
      total: "397.00",
      shippingMethod: "Pos Laju",
      shippingAddress: {
        name: "Nurul Aisyah",
        phone: "012-3456789",
        address: "No. 12, Jalan Seri Orkid 3, Taman Seri Orkid",
        state: "Selangor",
        postcode: "40000",
      },
      items: [
        { sku: "MAI-CIKPUAN-SAGE-M", productName: "Baju Kurung Moden Cik Puan", color: "Sage", size: "M", quantity: 1, unitPrice: "159.00" },
        { sku: "MAI-MELATI-IVORY-S", productName: "Baju Kurung Tradisional Melati", color: "Ivory", size: "S", quantity: 1, unitPrice: "139.00" },
        { sku: "MAI-SERUT-MOCHA", productName: "Handbag Serut Kecil", color: "Mocha", size: null, quantity: 1, unitPrice: "89.00" },
      ],
    },
    {
      userEmail: "aina@maisara.my",
      status: "SHIPPED",
      paymentStatus: "PAID",
      subtotal: "327.80",
      shippingFee: "7.00",
      total: "334.80",
      shippingMethod: "J&T Express",
      shippingAddress: {
        name: "Aina Sofea",
        phone: "011-2233445",
        address: "Lot 5, Jalan Melor, Kampung Melor",
        state: "Kelantan",
        postcode: "16450",
      },
      items: [
        { sku: "MAI-RAYA-IVORY-M", productName: "Dress Raya Satin", color: "Ivory", size: "M", quantity: 1, unitPrice: "199.00" },
        { sku: "MAI-SILK-EMERALD", productName: "Shawl Silk Premium", color: "Emerald", size: null, quantity: 1, unitPrice: "89.00" },
        { sku: "MAI-PIN-GOLD", productName: "Tudung Pin Set", color: "Gold", size: null, quantity: 2, unitPrice: "19.90" },
      ],
    },
    {
      userEmail: "aina@maisara.my",
      status: "CANCELLED",
      paymentStatus: "FAILED",
      subtotal: "268.90",
      shippingFee: "10.00",
      total: "278.90",
      shippingMethod: "Pos Laju",
      shippingAddress: {
        name: "Aina Sofea",
        phone: "011-2233445",
        address: "Lot 5, Jalan Melor, Kampung Melor",
        state: "Kelantan",
        postcode: "16450",
      },
      items: [
        { sku: "MAI-NAURA-BLACK-M", productName: "Abaya Basic Naura", color: "Black", size: "M", quantity: 1, unitPrice: "249.00" },
        { sku: "MAI-BAWAL-IVORY", productName: "Tudung Bawal Cotton", color: "Ivory", size: null, quantity: 1, unitPrice: "19.90" },
      ],
    },
  ];

  const orderSkus = [...new Set(orderSeeds.flatMap((o) => o.items.map((i) => i.sku)))];
  const orderVariants = await db.productVariant.findMany({
    where: { sku: { in: orderSkus } },
    select: { id: true, sku: true },
  });
  const variantIdBySku = new Map(orderVariants.map((v) => [v.sku, v.id]));

  for (const o of orderSeeds) {
    const userId = users.get(o.userEmail);
    if (!userId) throw new Error(`User tidak wujud: ${o.userEmail}`);

    const order = await db.order.create({
      data: {
        userId,
        status: o.status,
        paymentStatus: o.paymentStatus,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        total: o.total,
        shippingMethod: o.shippingMethod,
        shippingAddress: o.shippingAddress,
        items: {
          create: o.items.map((item) => {
            const variantId = variantIdBySku.get(item.sku);
            if (!variantId) throw new Error(`Variant tidak wujud: ${item.sku}`);
            return {
              variantId,
              productName: item.productName,
              color: item.color,
              size: item.size,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            };
          }),
        },
      },
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "mock",
        reference: `MOCK-${order.id}`,
        status: o.paymentStatus,
        amount: o.total,
        url: `/pembayaran/${order.id}`,
      },
    });

    // Kurangkan stok variants yang digunakan (konsisten dengan order items)
    for (const item of o.items) {
      await db.productVariant.update({
        where: { sku: item.sku },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }
  console.log(`Pesanan demo: ${orderSeeds.length} siap.`);

  // ---------- Ulasan demo ----------
  interface ReviewSeed {
    userEmail: string;
    productSlug: string;
    rating: number;
    comment: string;
    status: "APPROVED" | "PENDING";
  }

  const reviewSeeds: ReviewSeed[] = [
    {
      userEmail: "nurul@maisara.my",
      productSlug: "tudung-bella-voal",
      rating: 5,
      comment: "Kain selesa dan jahitan kemas. Recommended!",
      status: "APPROVED",
    },
    {
      userEmail: "nurul@maisara.my",
      productSlug: "baju-kurung-cik-puan",
      rating: 4,
      comment: "Potongan moden dan kain tebal. Sesuai untuk kerja harian.",
      status: "APPROVED",
    },
    {
      userEmail: "aina@maisara.my",
      productSlug: "dress-raya-satin",
      rating: 5,
      comment: "Material premium dan jatuh kain sangat cantik. Memang sesuai untuk majlis.",
      status: "APPROVED",
    },
    {
      userEmail: "aina@maisara.my",
      productSlug: "shawl-silk-premium",
      rating: 4,
      comment: "Warna emerald sangat cantik. Cuma kain agak nipis, perlukan dalaman.",
      status: "PENDING",
    },
    {
      userEmail: "nurul@maisara.my",
      productSlug: "abaya-basic-naura",
      rating: 5,
      comment: "Abaya selesa dan kemas. Kualiti kain sangat baik untuk harga.",
      status: "PENDING",
    },
  ];

  for (const r of reviewSeeds) {
    const userId = users.get(r.userEmail);
    if (!userId) throw new Error(`User tidak wujud: ${r.userEmail}`);
    const product = await db.product.findUniqueOrThrow({
      where: { slug: r.productSlug },
      select: { id: true },
    });
    await db.review.create({
      data: {
        userId,
        productId: product.id,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
      },
    });
  }
  console.log(`Ulasan demo: ${reviewSeeds.length} siap.`);

  // Pengesahan
  const [catCount, prodCount, varCount, userCount, orderCount, paymentCount, reviewCount, reviewApproved] =
    await Promise.all([
      db.category.count(),
      db.product.count(),
      db.productVariant.count(),
      db.user.count({ where: { email: { in: seedEmails } } }),
      db.order.count({ where: { user: { email: { in: seedEmails } } } }),
      db.payment.count({ where: { order: { user: { email: { in: seedEmails } } } } }),
      db.review.count({ where: { user: { email: { in: seedEmails } } } }),
      db.review.count({ where: { user: { email: { in: seedEmails } }, status: "APPROVED" } }),
    ]);
  console.log(
    `Pengesahan - kategori: ${catCount}, produk: ${prodCount}, variants: ${varCount}, users: ${userCount}, orders: ${orderCount}, payments: ${paymentCount}, reviews: ${reviewCount} (approved: ${reviewApproved})`,
  );
}

main()
  .catch((err) => {
    console.error("Seed gagal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
