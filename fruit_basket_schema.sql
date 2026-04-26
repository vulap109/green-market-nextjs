-- PostgreSQL schema for a fruit basket e-commerce website
-- Covers products, hierarchical categories, news, users, carts,
-- guest checkout, orders, payments, reviews, coupons, banners, and settings.

BEGIN;

-- =========================================================
-- 1) USERS & CUSTOMER DATA
-- =========================================================

CREATE TABLE IF NOT EXISTS user (
    id                  BIGSERIAL PRIMARY KEY,
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(255) UNIQUE,
    phone               VARCHAR(30),
    password_hash       TEXT,
    role                VARCHAR(30) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
    status              VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    email_verified_at   TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--CREATE TABLE IF NOT EXISTS addresses (
--    id                  BIGSERIAL PRIMARY KEY,
--    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--    full_name           VARCHAR(150) NOT NULL,
--    phone               VARCHAR(30) NOT NULL,
--    address_line        VARCHAR(255) NOT NULL,
--    ward                VARCHAR(120),
--    district            VARCHAR(120),
--    province            VARCHAR(120),
--    country             VARCHAR(120) NOT NULL DEFAULT 'Vietnam',
--    postal_code         VARCHAR(20),
--    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
--    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
--);

-- =========================================================
-- 2) PRODUCT CATALOG
-- =========================================================

-- Hierarchical categories using parent_id.
-- Example:
-- fruit-basket (parent_id = null)
--   - box   (parent_id = fruit-basket.id)
--   - fresh (parent_id = fruit-basket.id)
CREATE TABLE IF NOT EXISTS category (
    id                  BIGSERIAL PRIMARY KEY,
    parent_id           BIGINT REFERENCES category(id) ON DELETE SET NULL,
    name                VARCHAR(150) NOT NULL,
    slug                VARCHAR(180) NOT NULL UNIQUE,
    description         TEXT,
    image_url           TEXT,
    meta_title          VARCHAR(255),
    meta_description    TEXT,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product (
    id                  BIGSERIAL PRIMARY KEY,
    category_id         BIGINT REFERENCES category(id) ON DELETE SET NULL,
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) NOT NULL UNIQUE,
    sku                 VARCHAR(100) NOT NULL UNIQUE,
    short_description   TEXT,
    description         TEXT,
    price               NUMERIC(12,0) NOT NULL DEFAULT 0,
    sale_price          NUMERIC(12,0),
    cost_price          NUMERIC(12,0),
    stock_quantity      INTEGER NOT NULL DEFAULT 0,
    weight_grams        INTEGER,
    thumbnail           TEXT,
    meta_title          VARCHAR(255),
    meta_description    TEXT,
    is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
    status              VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'out_of_stock', 'hidden')),
    published_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_image (
    id                  BIGSERIAL PRIMARY KEY,
    product_id          BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    image_url           TEXT NOT NULL,
    alt_text            VARCHAR(255),
    sort_order          INTEGER NOT NULL DEFAULT 0,
    is_main             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: use this only if 1 product can belong to MULTIPLE categories.
-- If you use products.category_id as the main category, this table can be used
-- for additional category assignments.
--CREATE TABLE IF NOT EXISTS product_categories (
--    id                  BIGSERIAL PRIMARY KEY,
--    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
--    category_id         BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
--    is_primary          BOOLEAN NOT NULL DEFAULT FALSE,
--    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--    UNIQUE (product_id, category_id)
--);

-- Optional: use this when products have variants such as size/box type/combo.
--CREATE TABLE IF NOT EXISTS product_variants (
--    id                  BIGSERIAL PRIMARY KEY,
--    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
--    name                VARCHAR(150) NOT NULL,
--    sku                 VARCHAR(100) NOT NULL UNIQUE,
--    price               NUMERIC(12,0) NOT NULL DEFAULT 0,
--    sale_price          NUMERIC(12,0),
--    stock_quantity      INTEGER NOT NULL DEFAULT 0,
--    image_url           TEXT,
--    is_default          BOOLEAN NOT NULL DEFAULT FALSE,
--    status              VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
--    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
--);

--CREATE TABLE IF NOT EXISTS product_reviews (
--    id                  BIGSERIAL PRIMARY KEY,
--    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
--    user_id             BIGINT REFERENCES users(id) ON DELETE SET NULL,
--    customer_name       VARCHAR(150),
--    customer_email      VARCHAR(255),
--    rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
--    comment             TEXT,
--    status              VARCHAR(30) NOT NULL DEFAULT 'pending'
--                            CHECK (status IN ('pending', 'approved', 'rejected')),
--    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
--);

--CREATE TABLE IF NOT EXISTS wishlists (
--    id                  BIGSERIAL PRIMARY KEY,
--    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
--    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--    UNIQUE (user_id, product_id)
--);

-- =========================================================
-- 3) NEWS / BLOG CONTENT
-- =========================================================

--CREATE TABLE IF NOT EXISTS news_categories (
--    id                  BIGSERIAL PRIMARY KEY,
--    name                VARCHAR(150) NOT NULL,
--    slug                VARCHAR(180) NOT NULL UNIQUE,
--    description         TEXT,
--    meta_title          VARCHAR(255),
--    meta_description    TEXT,
--    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
--    sort_order          INTEGER NOT NULL DEFAULT 0,
--    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
--);

CREATE TABLE IF NOT EXISTS news_post (
    id                  BIGSERIAL PRIMARY KEY,
    author_id           BIGINT REFERENCES user(id) ON DELETE SET NULL,
    title               VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) NOT NULL UNIQUE,
    excerpt             TEXT,
    content             TEXT NOT NULL,
    thumbnail           TEXT,
    meta_title          VARCHAR(255),
    meta_description    TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 4) CART
-- =========================================================

-- Supports logged-in users AND guests.
-- user_id: for logged-in users
-- session_id: for guest users
CREATE TABLE IF NOT EXISTS cart (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT REFERENCES user(id) ON DELETE CASCADE,
    session_id          VARCHAR(255),
    status              VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id                  BIGSERIAL PRIMARY KEY,
    cart_id             BIGINT NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    quantity            INTEGER NOT NULL CHECK (quantity > 0),
    unit_price          NUMERIC(12,0) NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);

-- =========================================================
-- 5) DISCOUNTS / COUPONS
-- =========================================================

--CREATE TABLE IF NOT EXISTS coupons (
--    id                  BIGSERIAL PRIMARY KEY,
--    code                VARCHAR(50) NOT NULL UNIQUE,
--    type                VARCHAR(20) NOT NULL
--                            CHECK (type IN ('percent', 'fixed')),
--    value               NUMERIC(12,0) NOT NULL,
--    min_order_amount    NUMERIC(12,0),
--    max_discount_amount NUMERIC(12,0),
--    usage_limit         INTEGER,
--    used_count          INTEGER NOT NULL DEFAULT 0,
--    start_at            TIMESTAMPTZ,
--    end_at              TIMESTAMPTZ,
--    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
--    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
--);

-- =========================================================
-- 6) ORDERS & PAYMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS order (
    id                      BIGSERIAL PRIMARY KEY,
    order_code              VARCHAR(50) NOT NULL UNIQUE,
    user_id                 BIGINT REFERENCES user(id) ON DELETE SET NULL,

    -- customer snapshot at time of purchase
    customer_name           VARCHAR(150) NOT NULL,
    customer_phone          VARCHAR(30) NOT NULL,
    customer_email          VARCHAR(255),

    -- shipping snapshot
    shipping_full_name      VARCHAR(150),
    shipping_phone          VARCHAR(30),
    shipping_address_line   VARCHAR(255) NOT NULL,
    shipping_ward           VARCHAR(120),
    shipping_district       VARCHAR(120),
    shipping_province       VARCHAR(120),
    shipping_country        VARCHAR(120) NOT NULL DEFAULT 'Vietnam',
    shipping_postal_code    VARCHAR(20),

    note                    TEXT,
    subtotal                NUMERIC(12,0) NOT NULL DEFAULT 0,
    discount_amount         NUMERIC(12,0) NOT NULL DEFAULT 0,
    shipping_fee            NUMERIC(12,0) NOT NULL DEFAULT 0,
    total_amount            NUMERIC(12,0) NOT NULL DEFAULT 0,

    payment_method          VARCHAR(30) NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'bank_transfer', 'momo', 'vnpay', 'stripe', 'paypal')),
    payment_status          VARCHAR(30) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded', 'partially_refunded')),
    order_status            VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'preparing', 'shipping', 'completed', 'cancelled')),
    placed_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_item (
    id                      BIGSERIAL PRIMARY KEY,
    order_id                BIGINT NOT NULL REFERENCES order(id) ON DELETE CASCADE,
    product_id              BIGINT REFERENCES product(id) ON DELETE SET NULL,
    product_name            VARCHAR(255) NOT NULL,
    product_sku             VARCHAR(100),
    unit_price              NUMERIC(12,0) NOT NULL DEFAULT 0,
    quantity                INTEGER NOT NULL CHECK (quantity > 0),
    line_total              NUMERIC(12,0) NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment (
    id                      BIGSERIAL PRIMARY KEY,
    order_id                BIGINT NOT NULL REFERENCES order(id) ON DELETE CASCADE,
    payment_method          VARCHAR(30) NOT NULL,
    provider                VARCHAR(50),
    provider_transaction_id VARCHAR(150),
    amount                  NUMERIC(12,0) NOT NULL DEFAULT 0,
    status                  VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
    paid_at                 TIMESTAMPTZ,
    raw_response            JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--CREATE TABLE IF NOT EXISTS order_status_histories (
--    id                      BIGSERIAL PRIMARY KEY,
--    order_id                BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
--    old_status              VARCHAR(30),
--    new_status              VARCHAR(30) NOT NULL,
--    note                    TEXT,
--    changed_by              BIGINT REFERENCES users(id) ON DELETE SET NULL,
--    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
--);

-- =========================================================
-- 7) CONTACT / CMS / SITE MANAGEMENT
-- =========================================================

--CREATE TABLE IF NOT EXISTS contact_submissions (
--    id                  BIGSERIAL PRIMARY KEY,
--    full_name           VARCHAR(150) NOT NULL,
--    phone               VARCHAR(30),
--    email               VARCHAR(255),
--    subject             VARCHAR(255),
--    message             TEXT NOT NULL,
--    status              VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
--    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
--);

CREATE TABLE IF NOT EXISTS banner (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(255),
    image_url           TEXT NOT NULL,
    mobile_image_url    TEXT,
    link                TEXT,
    position            VARCHAR(100),
    sort_order          INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    start_at            TIMESTAMPTZ,
    end_at              TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Single-row style settings table for core site info.
--CREATE TABLE IF NOT EXISTS settings (
--    id                      BIGSERIAL PRIMARY KEY,
--    site_name               VARCHAR(255) NOT NULL,
--    logo_url                TEXT,
--    favicon_url             TEXT,
--    phone                   VARCHAR(30),
--    email                   VARCHAR(255),
--    address                 VARCHAR(255),
--    facebook_url            TEXT,
--    instagram_url           TEXT,
--    zalo_url                TEXT,
--    tiktok_url              TEXT,
--    youtube_url             TEXT,
--    seo_default_title       VARCHAR(255),
--    seo_default_description TEXT,
--    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
--);

-- =========================================================
-- 8) INDEXES
-- =========================================================

--CREATE INDEX IF NOT EXISTS idx_addresses_user_id
--    ON addresses(user_id);

--CREATE INDEX IF NOT EXISTS idx_categories_parent_id
--    ON categories(parent_id);

--CREATE INDEX IF NOT EXISTS idx_categories_is_active
--    ON categories(is_active);

--CREATE INDEX IF NOT EXISTS idx_products_category_id
--    ON products(category_id);

--CREATE INDEX IF NOT EXISTS idx_products_status
--    ON products(status);

--CREATE INDEX IF NOT EXISTS idx_products_published_at
--    ON products(published_at);

--CREATE INDEX IF NOT EXISTS idx_product_images_product_id
--    ON product_images(product_id);

--CREATE INDEX IF NOT EXISTS idx_product_categories_product_id
--    ON product_categories(product_id);

--CREATE INDEX IF NOT EXISTS idx_product_categories_category_id
--    ON product_categories(category_id);

--CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
--    ON product_variants(product_id);

--CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id
--    ON product_reviews(product_id);

--CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id
--    ON product_reviews(user_id);

--CREATE INDEX IF NOT EXISTS idx_news_posts_category_id
--    ON news_posts(news_category_id);

--CREATE INDEX IF NOT EXISTS idx_news_posts_author_id
--    ON news_posts(author_id);

--CREATE INDEX IF NOT EXISTS idx_news_posts_status
--    ON news_posts(status);

--CREATE INDEX IF NOT EXISTS idx_news_posts_published_at
--    ON news_posts(published_at);

--CREATE INDEX IF NOT EXISTS idx_carts_user_id
--    ON carts(user_id);

--CREATE INDEX IF NOT EXISTS idx_carts_session_id
--    ON carts(session_id);

--CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id
--    ON cart_items(cart_id);

--CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
--    ON cart_items(product_id);

--CREATE INDEX IF NOT EXISTS idx_orders_user_id
--    ON orders(user_id);

--CREATE INDEX IF NOT EXISTS idx_orders_coupon_id
--    ON orders(coupon_id);

--CREATE INDEX IF NOT EXISTS idx_orders_order_status
--    ON orders(order_status);

--CREATE INDEX IF NOT EXISTS idx_orders_payment_status
--    ON orders(payment_status);

--CREATE INDEX IF NOT EXISTS idx_orders_placed_at
--    ON orders(placed_at);

--CREATE INDEX IF NOT EXISTS idx_order_items_order_id
--    ON order_items(order_id);

--CREATE INDEX IF NOT EXISTS idx_order_items_product_id
--    ON order_items(product_id);

--CREATE INDEX IF NOT EXISTS idx_payments_order_id
--    ON payments(order_id);

--CREATE INDEX IF NOT EXISTS idx_payments_provider_transaction_id
--    ON payments(provider_transaction_id);

--CREATE INDEX IF NOT EXISTS idx_order_status_histories_order_id
--    ON order_status_histories(order_id);

--CREATE INDEX IF NOT EXISTS idx_contact_submissions_status
--    ON contact_submissions(status);

--COMMIT;
