# DATABASE — Maisara (PostgreSQL + Prisma)

**Tarikh:** 13 Ogos 2026

---

## 1. Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- Better Auth ----------
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  passwordHash  String?
  role          Role      @default(CUSTOMER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  reviews       Review[]
  wishlistItems WishlistItem[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  provider          String
  providerAccountId String
  refreshToken      String? @db.Text
  accessToken       String? @db.Text
  expiresAt         Int?
  tokenType         String?
  scope             String?
  idToken           String? @db.Text

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ---------- Katalog ----------
enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
}

enum ReviewStatus {
  PENDING
  APPROVED
  HIDDEN
}

model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  image       String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())

  products Product[]

  @@index([order])
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  categoryId  String
  isActive    Boolean  @default(true)
  featured    Boolean  @default(false)
  images      Json     @default("[]") // array of image URLs
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  variants ProductVariant[]
  reviews  Review[]

  @@index([categoryId, isActive])
  @@index([featured, isActive])
  @@index([slug])
}

model ProductVariant {
  id        String  @id @default(cuid())
  productId String
  color     String? // nama warna (cth. "Sage")
  size      String? // saiz (cth. "S", "M", "L") atau null untuk tudung
  sku       String  @unique
  stock     Int     @default(0)

  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems CartItem[]
  orderItems OrderItem[]

  @@index([productId])
  @@index([sku])
}

// ---------- Cart ----------
model CartItem {
  id        String @id @default(cuid())
  sessionId String? // guest cookie token (anonymous)
  userId    String? // user berdaftar
  variantId String
  quantity  Int    @default(1)

  variant ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  user    User?          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([userId])
  // Satu item sama (session+user+variant) tidak boleh duplicate
  @@unique([sessionId, variantId])
  @@unique([userId, variantId])
}

// ---------- Order ----------
model Order {
  id              String        @id @default(cuid())
  userId          String
  status          OrderStatus   @default(PENDING)
  subtotal        Decimal       @db.Decimal(10, 2)
  shippingFee     Decimal       @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  shippingMethod  String        // "J&T Express" | "Pos Laju"
  shippingAddress Json          // { name, phone, address, state, postcode }
  paymentStatus   PaymentStatus @default(PENDING)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user   User        @relation(fields: [userId], references: [id], onDelete: Restrict)
  items  OrderItem[]
  payment Payment?

  @@index([userId, createdAt])
  @@index([status])
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  variantId String
  productName String // snapshot nama produk pada masa order
  color     String?
  size      String?
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2) // snapshot harga

  order   Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)

  @@index([orderId])
}

model Payment {
  id        String        @id @default(cuid())
  orderId   String        @unique
  provider  String        @default("mock")
  reference String        @unique
  status    PaymentStatus @default(PENDING)
  amount    Decimal       @db.Decimal(10, 2)
  url       String?       // redirect URL mock
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

// ---------- Review & Wishlist ----------
model Review {
  id        String       @id @default(cuid())
  productId String
  userId    String
  rating    Int          // 1-5
  comment   String       @db.Text
  status    ReviewStatus @default(PENDING)
  createdAt DateTime     @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([productId, userId]) // satu review per produk per user
  @@index([productId, status])
}

model WishlistItem {
  id        String @id @default(cuid())
  userId    String
  productId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}
```

## 2. Relationships (ringkasan)

```
Category 1─N Product
Product 1─N ProductVariant
Product 1─N Review
Product 1─N WishlistItem (melalui User)
User 1─N Order / Review / WishlistItem / CartItem
Order 1─N OrderItem
Order 1─1 Payment
OrderItem N─1 ProductVariant (snapshot disimpan)
```

## 3. Design Notes

- **Snapshot dalam OrderItem** (productName, unitPrice, color, size): harga dan nama produk boleh berubah; order mesti kekal seperti masa beli. Ini penting untuk integrity rekod jualan.
- **CartItem guna nullable sessionId + userId** dengan unique constraint berasingan: guest cart (cookie) dan user cart. Merge dilakukan pada login (pindah sessionId → userId, gabung kuantiti).
- **Product.images** disimpan sebagai JSON array string (URL). Untuk skala kecil, JSON cukup; elak jadual imej berasingan tanpa keperluan.
- **Decimal untuk wang** (`@db.Decimal(10,2)`), bukan Float (precision issues).
- **Enums Prisma** untuk status: konsisten dan type-safe.
- **Delete behaviour:** Cascade untuk anak (variants, items, payment, review); Restrict untuk rujukan yang mesti kekal (category, product dalam order item).
- **Unique sku** pada variant: wajib untuk inventory tracking.

## 4. Indexes

| Index | Tujuan |
|---|---|
| `Product[categoryId, isActive]` | Katalog filter |
| `Product[featured, isActive]` | Homepage featured |
| `Product[slug]` | PDP lookup |
| `CartItem[sessionId]` / `[userId]` | Cart lookup |
| `Order[userId, createdAt]` | Sejarah order |
| `Order[status]` | Admin senarai mengikut status |
| `Payment[reference]` | Callback lookup |
| `Review[productId, status]` | PDP review + moderasi |

## 5. Seed Data

- 5 kategori: Tudung, Baju Kurung, Dress, Abaya, Aksesori.
- 20-30 produk, setiap satu 2-4 variants (warna/saiz) dengan SKU unik dan stok realistik (termasuk beberapa stok rendah ≤ 5 dan beberapa habis).
- 1 admin demo (Aminah) + 1-2 customer demo (Nurul, Aina).
- 3-5 order contoh dalam pelbagai status + payment.
- 3-5 review: campuran approved/pending (untuk demo moderasi).

**Akaun demo (untuk README):**
- Admin: `admin@maisara.my` / kata laluan demo (jangan guna password sebenar; nyata dalam README sebagai demo sahaja)
- Customer: `nurul@maisara.my` / kata laluan demo

**Nota keselamatan:** jangan letak secrets dalam seed. Password demo hashed via Better Auth.
