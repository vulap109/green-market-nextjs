import { prisma } from "@/lib/prisma";
import { PRODUCT_IMAGE_UPLOAD_LIMIT } from "@/lib/product-image-upload";
import type { Prisma } from "@/generated/prisma/client";

export const ADMIN_PRODUCTS_LIMIT = 50;

export type AdminProductFilters = Readonly<{
  category: string;
  keyword: string;
  status: string;
}>;

export type AdminProductCategoryOption = Readonly<{
  label: string;
  value: string;
}>;

export type AdminProductListItem = Readonly<{
  categoryName: string;
  categorySlug: string;
  costPrice: number;
  id: string;
  name: string;
  parentCategoryName: string;
  price: number;
  salePrice: number;
  sortOrder: number;
  sku: string;
  slug: string;
  status: string;
  updatedAt: Date;
}>;

export type AdminProductListResult = Readonly<{
  items: AdminProductListItem[];
  totalProducts: number;
}>;

export type AdminProductImageInput = Readonly<{
  imageUrl: string;
  storageKey: string;
}>;

export type AdminProductVariantInput = Readonly<{
  price: number;
  salePrice: number;
  status: string;
  stockQuantity: number;
  variantName: string;
}>;

export type AdminCreateProductInput = Readonly<{
  category: string;
  costPrice: number;
  description: string;
  featured: string;
  images: ReadonlyArray<AdminProductImageInput>;
  name: string;
  price: number;
  salePrice: number;
  shortDescription: string;
  sku: string;
  slug: string;
  sortOrder: number;
  status: string;
  stockQuantity: number;
  thumbnail: string;
  variants: ReadonlyArray<AdminProductVariantInput>;
}>;

function normalizeAdminFilterValue(value?: string | null): string {
  return String(value || "").trim();
}

function normalizeProductVariantStatus(value: string): string {
  return value === "inactive" ? "inactive" : "active";
}

function normalizeProductVariantSkuSegment(value: string, fallback: string): string {
  return (
    normalizeAdminFilterValue(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 30) || fallback
  );
}

function createProductVariantSku(productSKU: string, variantName: string, index: number): string {
  const productSegment = normalizeProductVariantSkuSegment(productSKU.toString(), "PRODUCT");
  const variantSegment = normalizeProductVariantSkuSegment(variantName, "VARIANT");
  const variantIndex = String(index + 1).padStart(2, "0");

  return `${productSegment}-${variantIndex}-${variantSegment}`.slice(0, 100);
}

function buildAdminProductWhere(filters: AdminProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  const keyword = normalizeAdminFilterValue(filters.keyword);
  const status = normalizeAdminFilterValue(filters.status);
  const category = normalizeAdminFilterValue(filters.category);
  const andFilters: Prisma.ProductWhereInput[] = [];

  if (keyword) {
    andFilters.push({
      OR: [
        {
          name: {
            contains: keyword,
            mode: "insensitive"
          }
        },
        {
          sku: {
            contains: keyword,
            mode: "insensitive"
          }
        },
        {
          slug: {
            contains: keyword,
            mode: "insensitive"
          }
        }
      ]
    });
  }

  if (status) {
    where.status = status;
  }

  if (category) {
    andFilters.push({
      category: {
        OR: [
          {
            slug: category
          },
          {
            parent: {
              slug: category
            }
          }
        ]
      }
    });
  }

  if (andFilters.length) {
    where.AND = andFilters;
  }

  return where;
}

export async function getAdminProductCategoryOptions(): Promise<AdminProductCategoryOption[]> {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
      slug: true,
      parent: {
        select: {
          name: true
        }
      }
    },
    orderBy: [
      {
        parentId: "asc"
      },
      {
        sortOrder: "asc"
      },
      {
        name: "asc"
      }
    ]
  });

  return categories.map((category) => ({
    label: category.parent?.name ? `${category.parent.name} / ${category.name}` : category.name,
    value: category.slug
  }));
}

export async function getAdminProductStatusOptions(): Promise<string[]> {
  const productStatuses = await prisma.product.findMany({
    distinct: ["status"],
    select: {
      status: true
    },
    orderBy: [
      {
        status: "asc"
      }
    ]
  });

  return productStatuses
    .map((productStatus) => normalizeAdminFilterValue(productStatus.status))
    .filter(Boolean);
}

export async function findAdminProducts(
  filters: AdminProductFilters
): Promise<AdminProductListResult> {
  const where = buildAdminProductWhere(filters);
  const [totalProducts, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: {
        category: {
          select: {
            name: true,
            slug: true,
            parent: {
              select: {
                name: true
              }
            }
          }
        },
        costPrice: true,
        id: true,
        name: true,
        price: true,
        salePrice: true,
        sortOrder: true,
        sku: true,
        slug: true,
        status: true,
        updatedAt: true
      },
      orderBy: [
        {
          updatedAt: "desc"
        },
        {
          id: "desc"
        }
      ],
      take: ADMIN_PRODUCTS_LIMIT
    })
  ]);

  return {
    items: products.map((product) => ({
      categoryName: product.category?.name || "",
      categorySlug: product.category?.slug || "",
      costPrice: Number(product.costPrice || 0),
      id: String(product.id),
      name: product.name,
      parentCategoryName: product.category?.parent?.name || "",
      price: Number(product.price || 0),
      salePrice: Number(product.salePrice || 0),
      sortOrder: product.sortOrder,
      sku: product.sku,
      slug: product.slug,
      status: product.status,
      updatedAt: product.updatedAt
    })),
    totalProducts
  };
}

export async function findAdminProductIdentityConflict(
  input: Pick<AdminCreateProductInput, "sku" | "slug">
): Promise<"sku" | "slug" | null> {
  const sku = normalizeAdminFilterValue(input.sku);
  const slug = normalizeAdminFilterValue(input.slug);
  const productWithSlug = slug
    ? await prisma.product.findUnique({
        where: {
          slug
        },
        select: {
          id: true
        }
      })
    : null;

  if (productWithSlug) {
    return "slug";
  }

  const productWithSku = sku
    ? await prisma.product.findUnique({
        where: {
          sku
        },
        select: {
          id: true
        }
      })
    : null;

  if (productWithSku) {
    return "sku";
  }

  return null;
}

export async function createAdminProduct(input: AdminCreateProductInput): Promise<void> {
  const productImages = input.images
    .slice(0, PRODUCT_IMAGE_UPLOAD_LIMIT)
    .map((image) => ({
      imageUrl: normalizeAdminFilterValue(image.imageUrl),
      storageKey: normalizeAdminFilterValue(image.storageKey)
    }))
    .filter((image) => image.imageUrl);
  const productVariants = input.variants
    .map((variant) => ({
      price: variant.price,
      salePrice: variant.salePrice,
      status: normalizeProductVariantStatus(variant.status),
      stockQuantity: variant.stockQuantity,
      variantName: normalizeAdminFilterValue(variant.variantName).slice(0, 150)
    }))
    .filter((variant) => variant.variantName);
  const category = input.category
    ? await prisma.category.findUnique({
        where: {
          slug: input.category
        },
        select: {
          id: true
        }
      })
    : null;

  const product = await prisma.product.create({
    data: {
      categoryId: category?.id ?? null,
      description: input.description || null,
      featured: input.featured,
      costPrice: input.costPrice > 0 ? input.costPrice : null,
      name: input.name,
      price: input.price,
      salePrice: input.salePrice > 0 ? input.salePrice : null,
      shortDescription: input.shortDescription || null,
      sku: input.sku,
      slug: input.slug,
      sortOrder: input.sortOrder,
      status: input.status || "draft",
      stockQuantity: input.stockQuantity,
      thumbnail: input.thumbnail || null
    },
    select: {
      id: true
    }
  });

  for (const [index, image] of productImages.entries()) {
    await prisma.productImage.create({
      data: {
        altText: input.name || null,
        imageUrl: image.imageUrl,
        isMain: index === 0,
        productId: product.id,
        sortOrder: index,
        storageKey: image.storageKey || null
      }
    });
  }

  for (const [index, variant] of productVariants.entries()) {
    await prisma.productVariant.create({
      data: {
        price: variant.price,
        productId: product.id,
        salePrice: variant.salePrice > 0 ? variant.salePrice : null,
        sku: createProductVariantSku(input.sku, variant.variantName, index),
        status: variant.status,
        stockQuantity: variant.stockQuantity,
        variantName: variant.variantName
      }
    });
  }
}
