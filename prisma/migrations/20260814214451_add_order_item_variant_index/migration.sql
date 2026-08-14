-- AlterTable
-- Index untuk OrderItem.variantId: dipakai dalam updateProduct (count variant
-- referenced sebelum delete) dan join OrderItem -> ProductVariant.
-- NOTA: index ini telah di-apply manual ke production (14 Aug 2026, kerana
-- prisma migrate hang pada Supabase pooler). IF NOT EXISTS menjadikan
-- migration ini idempotent - migrate deploy masa depan tidak akan gagal.
CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx" ON "OrderItem"("variantId");
