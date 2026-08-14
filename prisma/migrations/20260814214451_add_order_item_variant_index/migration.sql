-- AlterTable
-- Index untuk OrderItem.variantId: dipakai dalam updateProduct (count variant
-- referenced sebelum delete) dan join OrderItem -> ProductVariant.
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");
