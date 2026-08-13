import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import type { CartContext } from "@/lib/cart-context";

/**
 * Service cart (API.md section 3).
 * Layer bebas transport: dipanggil oleh route handler /api/cart.
 * Context (sessionId/userId) datang dari lib/cart-context.ts.
 */

export interface CartItemDetail {
  id: string;
  variantId: string;
  quantity: number;
  product: { id: string; name: string; slug: string };
  variant: { color: string | null; size: string | null; sku: string; stock: number };
  unitPrice: string;
  lineTotal: string;
  image: string;
}

export interface CartResult {
  items: CartItemDetail[];
  subtotal: string;
  itemCount: number;
}

/** Include penuh untuk satu baris CartItem (variant + produk untuk harga/imej). */
const CART_ITEM_INCLUDE = {
  variant: {
    include: {
      product: {
        select: { id: true, name: true, slug: true, price: true, images: true, isActive: true },
      },
    },
  },
} satisfies Prisma.CartItemInclude;

type CartItemRow = Prisma.CartItemGetPayload<{ include: typeof CART_ITEM_INCLUDE }>;

/** Images disimpan sebagai Json (array URL, kadang-kala string JSON). */
function parseImages(images: unknown): string[] {
  const raw = Array.isArray(images) ? images : typeof images === "string" ? tryParse(images) : [];
  return raw.filter((item): item is string => typeof item === "string");

  function tryParse(value: string): unknown[] {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

/** Transform row CartItem -> CartItemDetail (API.md section 3). Harga 2 dp. */
function toItem(item: CartItemRow): CartItemDetail {
  const unitPrice = new Prisma.Decimal(item.variant.product.price.toString());
  const lineTotal = unitPrice.mul(item.quantity);

  return {
    id: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    product: {
      id: item.variant.product.id,
      name: item.variant.product.name,
      slug: item.variant.product.slug,
    },
    variant: {
      color: item.variant.color,
      size: item.variant.size,
      sku: item.variant.sku,
      stock: item.variant.stock,
    },
    unitPrice: unitPrice.toFixed(2),
    lineTotal: lineTotal.toFixed(2),
    image: parseImages(item.variant.product.images)[0] ?? "",
  };
}

/** Item hanya milik ctx jika sesi (user atau guest) sepadan. */
function belongsToCart(
  ctx: CartContext,
  item: { userId: string | null; sessionId: string | null },
): boolean {
  if (ctx.userId) return item.userId === ctx.userId;
  return ctx.sessionId != null && item.sessionId === ctx.sessionId;
}

/** Unique where cart item: ikut user berdaftar atau guest cookie. */
function itemUniqueWhere(ctx: CartContext, variantId: string): Prisma.CartItemWhereUniqueInput {
  return ctx.userId
    ? { userId_variantId: { userId: ctx.userId, variantId } }
    : { sessionId_variantId: { sessionId: ctx.sessionId ?? "", variantId } };
}

/**
 * Senarai cart + ringkasan (API.md section 3 - GET /api/cart).
 * Hanya item produk aktif disertakan; disusun terbaru dahulu (id desc).
 * subtotal dalam string 2 dp; itemCount = jumlah kuantiti semua baris.
 */
export async function getCart(ctx: CartContext): Promise<CartResult> {
  if (!ctx.userId && !ctx.sessionId) {
    return { items: [], subtotal: "0.00", itemCount: 0 };
  }

  const where: Prisma.CartItemWhereInput = ctx.userId
    ? { userId: ctx.userId, variant: { product: { isActive: true } } }
    : { sessionId: ctx.sessionId ?? "", variant: { product: { isActive: true } } };

  const rows = await db.cartItem.findMany({
    where,
    include: CART_ITEM_INCLUDE,
    orderBy: { id: "desc" },
  });

  const items = rows.map(toItem);
  const subtotal = items.reduce(
    (sum, item) => sum.add(new Prisma.Decimal(item.lineTotal)),
    new Prisma.Decimal(0),
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal: subtotal.toFixed(2),
    itemCount,
  };
}

/**
 * Tambah item ke cart (API.md section 3 - POST /api/cart).
 * Variant mesti wujud + produk aktif + stok > 0 (409 OUT_OF_STOCK).
 * Item sedia ada: quantity digabung, cap pada stok variant.
 */
export async function addToCart(
  ctx: CartContext,
  input: { variantId: string; quantity: number },
): Promise<CartResult> {
  const variant = await db.productVariant.findUnique({
    where: { id: input.variantId },
    include: { product: { select: { isActive: true } } },
  });

  if (!variant || !variant.product.isActive) {
    throw new ApiError("NOT_FOUND", "Produk tidak ditemui.", 404);
  }
  if (variant.stock <= 0) {
    throw new ApiError("OUT_OF_STOCK", "Maaf, produk ini habis stok.", 409);
  }

  const uniqueWhere = itemUniqueWhere(ctx, input.variantId);
  const existing = await db.cartItem.findUnique({ where: uniqueWhere });
  const newQuantity = Math.min((existing?.quantity ?? 0) + input.quantity, variant.stock);

  await db.cartItem.upsert({
    where: uniqueWhere,
    create: {
      ...(ctx.userId ? { userId: ctx.userId } : { sessionId: ctx.sessionId ?? "" }),
      variantId: input.variantId,
      quantity: newQuantity,
    },
    update: { quantity: newQuantity },
  });

  return getCart(ctx);
}

/**
 * Kemas kini kuantiti item (API.md section 3 - PATCH /api/cart/[itemId]).
 * Kuantiti cap pada stok variant; quantity <= 0 bermaksud buang item.
 */
export async function updateCartItem(
  ctx: CartContext,
  itemId: string,
  quantity: number,
): Promise<CartResult> {
  const item = await db.cartItem.findUnique({
    where: { id: itemId },
    include: { variant: { select: { stock: true } } },
  });

  if (!item || !belongsToCart(ctx, item)) {
    throw new ApiError("NOT_FOUND", "Item cart tidak ditemui.", 404);
  }

  if (quantity <= 0) {
    await db.cartItem.delete({ where: { id: itemId } });
    return getCart(ctx);
  }

  const capped = Math.min(quantity, item.variant.stock);
  await db.cartItem.update({ where: { id: itemId }, data: { quantity: capped } });

  return getCart(ctx);
}

/** Buang item dari cart (API.md section 3 - DELETE /api/cart/[itemId]). */
export async function removeCartItem(ctx: CartContext, itemId: string): Promise<CartResult> {
  const item = await db.cartItem.findUnique({ where: { id: itemId } });

  if (!item || !belongsToCart(ctx, item)) {
    throw new ApiError("NOT_FOUND", "Item cart tidak ditemui.", 404);
  }

  await db.cartItem.delete({ where: { id: itemId } });
  return getCart(ctx);
}

/**
 * Gabung cart guest (sessionId) ke cart user (UX.md Flow C, selepas login).
 * Transaction: setiap item session di-upsert ke userId (gabung quantity,
 * cap stok; variant stok 0 dilangkau), kemudian semua item session dibuang
 * supaya tiada duplicate.
 */
export async function mergeCart(userId: string, sessionId: string): Promise<void> {
  const sessionItems = await db.cartItem.findMany({
    where: { sessionId },
    include: { variant: { select: { stock: true } } },
  });

  if (sessionItems.length === 0) return;

  await db.$transaction(async (tx) => {
    for (const item of sessionItems) {
      const stock = item.variant.stock;
      if (stock <= 0) continue;

      const existing = await tx.cartItem.findUnique({
        where: { userId_variantId: { userId, variantId: item.variantId } },
      });
      const newQuantity = Math.min((existing?.quantity ?? 0) + item.quantity, stock);

      await tx.cartItem.upsert({
        where: { userId_variantId: { userId, variantId: item.variantId } },
        create: { userId, variantId: item.variantId, quantity: newQuantity },
        update: { quantity: newQuantity },
      });
    }

    await tx.cartItem.deleteMany({ where: { sessionId } });
  });
}
