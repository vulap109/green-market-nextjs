-- CreateTable
CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "variant_name" VARCHAR(150) NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "price" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "sale_price" DECIMAL(12,0),
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "product_variants_status_check" CHECK ("status" IN ('active', 'inactive')),
    CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_sku_key" ON "product_variants"("sku");
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants"("product_id");

-- Backfill the existing cream-cake size matrix into per-product variants.
INSERT INTO "product_variants" (
    "product_id",
    "variant_name",
    "sku",
    "price",
    "sale_price",
    "stock_quantity",
    "status"
)
SELECT
    p."id",
    variant_data."variant_name",
    CONCAT(p."sku", '-', UPPER(variant_data."variant_name")),
    variant_data."price",
    NULL,
    p."stock_quantity",
    'active'
FROM "product" p
JOIN "category" c ON c."id" = p."category_id"
JOIN (
    VALUES
        ('ll', '12cm', 129000),
        ('ll', '14cm', 210000),
        ('ll', '16cm', 250000),
        ('ll', '18cm', 320000),
        ('ll', '20cm', 350000),
        ('ht', '14cm', 310000),
        ('ht', '16cm', 350000),
        ('ht', '18cm', 420000),
        ('ht', '20cm', 450000),
        ('lq', '14cm', 330000),
        ('lq', '16cm', 370000),
        ('lq', '18cm', 440000),
        ('lq', '20cm', 470000),
        ('qd', '14cm', 350000),
        ('qd', '16cm', 390000),
        ('qd', '18cm', 460000),
        ('qd', '20cm', 490000),
        ('yv', '12cm', 129000),
        ('yv', '14cm', 210000),
        ('yv', '16cm', 250000),
        ('yv', '18cm', 320000),
        ('yv', '20cm', 350000)
) AS variant_data("category_slug", "variant_name", "price")
    ON variant_data."category_slug" = c."slug"
WHERE p."status" = 'active'
ON CONFLICT ("sku") DO UPDATE SET
    "variant_name" = EXCLUDED."variant_name",
    "price" = EXCLUDED."price",
    "stock_quantity" = EXCLUDED."stock_quantity",
    "status" = EXCLUDED."status",
    "updated_at" = CURRENT_TIMESTAMP;
