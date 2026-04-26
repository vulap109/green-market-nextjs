-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "password_hash" TEXT,
    "role" VARCHAR(30) NOT NULL DEFAULT 'customer',
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "email_verified_at" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "short_description" TEXT,
    "description" TEXT,
    "price" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "sale_price" DECIMAL(12,0),
    "cost_price" DECIMAL(12,0),
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "weight_grams" INTEGER,
    "thumbnail" TEXT,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_image" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "image_url" TEXT NOT NULL,
    "alt_text" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_post" (
    "id" BIGSERIAL NOT NULL,
    "author_id" BIGINT,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "thumbnail" TEXT,
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT,
    "session_id" VARCHAR(255),
    "status" VARCHAR(30) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" BIGSERIAL NOT NULL,
    "cart_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "unit_price" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "variant" VARCHAR(100) NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" BIGSERIAL NOT NULL,
    "order_code" VARCHAR(50) NOT NULL,
    "user_id" BIGINT,
    "customer_name" VARCHAR(150) NOT NULL,
    "customer_phone" VARCHAR(30) NOT NULL,
    "customer_email" VARCHAR(255),
    "shipping_full_name" VARCHAR(150),
    "shipping_phone" VARCHAR(30),
    "shipping_address_line" VARCHAR(255) NOT NULL,
    "shipping_ward" VARCHAR(120),
    "shipping_district" VARCHAR(120),
    "shipping_province" VARCHAR(120),
    "shipping_country" VARCHAR(120) NOT NULL DEFAULT 'Vietnam',
    "shipping_postal_code" VARCHAR(20),
    "note" TEXT,
    "subtotal" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "shipping_fee" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "payment_method" VARCHAR(30) NOT NULL DEFAULT 'cod',
    "payment_status" VARCHAR(30) NOT NULL DEFAULT 'unpaid',
    "order_status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "placed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "product_id" BIGINT,
    "product_name" VARCHAR(255) NOT NULL,
    "product_sku" VARCHAR(100),
    "unit_price" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "variant" VARCHAR(100) NOT NULL DEFAULT '',
    "quantity" INTEGER NOT NULL,
    "line_total" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "payment_method" VARCHAR(30) NOT NULL,
    "provider" VARCHAR(50),
    "provider_transaction_id" VARCHAR(150),
    "amount" DECIMAL(12,0) NOT NULL DEFAULT 0,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMPTZ(6),
    "raw_response" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(255),
    "image_url" TEXT NOT NULL,
    "mobile_image_url" TEXT,
    "link" TEXT,
    "position" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_at" TIMESTAMPTZ(6),
    "end_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_sku_key" ON "product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "news_post_slug_key" ON "news_post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_variant_key" ON "cart_items"("cart_id", "product_id", "variant");

-- CreateIndex
CREATE UNIQUE INDEX "order_order_code_key" ON "order"("order_code");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_post" ADD CONSTRAINT "news_post_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
