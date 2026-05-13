import { prisma } from "@/lib/prisma";
import { PRODUCT_IMAGE_UPLOAD_LIMIT } from "@/lib/product-image-upload";
import type { Prisma } from "@/generated/prisma/client";

export const ADMIN_PRODUCTS_LIMIT = 50;
export const ADMIN_PRODUCT_STATUS_OPTIONS = ["draft", "active", "inactive"] as const;

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

export type AdminProductEditImage = Readonly<{
  id: string;
  imageUrl: string;
  isMain: boolean;
  sortOrder: number;
  storageKey: string;
}>;

export type AdminProductEditVariant = Readonly<
  AdminProductVariantInput & {
    id: string;
    sku: string;
  }
>;

export type AdminProductEditDetails = Readonly<
  Omit<AdminCreateProductInput, "images" | "variants"> & {
    id: string;
    images: ReadonlyArray<AdminProductEditImage>;
    variants: ReadonlyArray<AdminProductEditVariant>;
  }
>;

function normalizeAdminFilterValue(value?: string | null): string {
  return String(value || "").trim();
}

function parseProductId(productId: string): bigint | null {
  const normalizedProductId = normalizeAdminFilterValue(productId);

  if (!/^\d+$/.test(normalizedProductId)) {
    return null;
  }

  const parsedProductId = BigInt(normalizedProductId);

  return parsedProductId > BigInt(0) ? parsedProductId : null;
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

export async function getAdminProductForEdit(productId: string): Promise<AdminProductEditDetails | null> {
  const parsedProductId = parseProductId(productId);

  if (!parsedProductId) {
    return null;
  }

  const product = await prisma.product.findUnique({
    where: {
      id: parsedProductId
    },
    select: {
      category: {
        select: {
          slug: true
        }
      },
      costPrice: true,
      description: true,
      featured: true,
      id: true,
      images: {
        orderBy: [
          {
            sortOrder: "asc"
          },
          {
            id: "asc"
          }
        ],
        select: {
          id: true,
          imageUrl: true,
          isMain: true,
          sortOrder: true,
          storageKey: true
        }
      },
      name: true,
      price: true,
      salePrice: true,
      shortDescription: true,
      sku: true,
      slug: true,
      sortOrder: true,
      status: true,
      stockQuantity: true,
      thumbnail: true,
      variants: {
        orderBy: [
          {
            createdAt: "asc"
          },
          {
            id: "asc"
          }
        ],
        select: {
          id: true,
          price: true,
          salePrice: true,
          sku: true,
          status: true,
          stockQuantity: true,
          variantName: true
        }
      }
    }
  });

  if (!product) {
    return null;
  }

  return {
    category: product.category?.slug || "",
    costPrice: Number(product.costPrice || 0),
    description: product.description || "",
    featured: product.featured || "",
    id: product.id.toString(),
    images: product.images.map((image) => ({
      id: image.id.toString(),
      imageUrl: image.imageUrl,
      isMain: image.isMain,
      sortOrder: image.sortOrder,
      storageKey: image.storageKey || ""
    })),
    name: product.name,
    price: Number(product.price || 0),
    salePrice: Number(product.salePrice || 0),
    shortDescription: product.shortDescription || "",
    sku: product.sku,
    slug: product.slug,
    sortOrder: product.sortOrder,
    status: product.status,
    stockQuantity: product.stockQuantity,
    thumbnail: product.thumbnail || "",
    variants: product.variants.map((variant) => ({
      id: variant.id.toString(),
      price: Number(variant.price || 0),
      salePrice: Number(variant.salePrice || 0),
      sku: variant.sku,
      status: variant.status,
      stockQuantity: variant.stockQuantity,
      variantName: variant.variantName
    }))
  };
}

export async function findAdminProductIdentityConflict(
  input: Pick<AdminCreateProductInput, "sku" | "slug"> & Readonly<{ excludeProductId?: string }>
): Promise<"sku" | "slug" | null> {
  const sku = normalizeAdminFilterValue(input.sku);
  const slug = normalizeAdminFilterValue(input.slug);
  const excludedProductId = input.excludeProductId ? parseProductId(input.excludeProductId) : null;
  const excludeCurrentProductWhere = excludedProductId
    ? {
        id: {
          not: excludedProductId
        }
      }
    : {};
  const productWithSlug = slug
    ? await prisma.product.findFirst({
        where: {
          slug,
          ...excludeCurrentProductWhere
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
    ? await prisma.product.findFirst({
        where: {
          sku,
          ...excludeCurrentProductWhere
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

function normalizeProductImages(
  images: ReadonlyArray<AdminProductImageInput>
): AdminProductImageInput[] {
  return images
    .slice(0, PRODUCT_IMAGE_UPLOAD_LIMIT)
    .map((image) => ({
      imageUrl: normalizeAdminFilterValue(image.imageUrl),
      storageKey: normalizeAdminFilterValue(image.storageKey)
    }))
    .filter((image) => image.imageUrl);
}

function normalizeProductVariants(
  variants: ReadonlyArray<AdminProductVariantInput>
): AdminProductVariantInput[] {
  return variants
    .map((variant) => ({
      price: variant.price,
      salePrice: variant.salePrice,
      status: normalizeProductVariantStatus(variant.status),
      stockQuantity: variant.stockQuantity,
      variantName: normalizeAdminFilterValue(variant.variantName).slice(0, 150)
    }))
    .filter((variant) => variant.variantName);
}

export async function createAdminProduct(input: AdminCreateProductInput): Promise<void> {
  const productImages = normalizeProductImages(input.images);
  const productVariants = normalizeProductVariants(input.variants);
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

export async function updateAdminProduct(
  productId: string,
  input: AdminCreateProductInput
): Promise<void> {
  const parsedProductId = parseProductId(productId);

  if (!parsedProductId) {
    throw new Error("Khong tim thay san pham.");
  }

  const productImages = normalizeProductImages(input.images);
  const productVariants = normalizeProductVariants(input.variants);
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
  const updatedAt = new Date();

  const existingProduct = await prisma.product.findUnique({
    where: {
      id: parsedProductId
    },
    select: {
      id: true
    }
  });

  if (!existingProduct) {
    throw new Error("Khong tim thay san pham.");
  }

  await prisma.product.update({
    where: {
      id: parsedProductId
    },
    data: {
      categoryId: category?.id ?? null,
      costPrice: input.costPrice > 0 ? input.costPrice : null,
      description: input.description || null,
      featured: input.featured,
      name: input.name,
      price: input.price,
      salePrice: input.salePrice > 0 ? input.salePrice : null,
      shortDescription: input.shortDescription || null,
      sku: input.sku,
      slug: input.slug,
      sortOrder: input.sortOrder,
      status: input.status || "draft",
      stockQuantity: input.stockQuantity,
      thumbnail: input.thumbnail || null,
      updatedAt
    }
  });

  if (productImages.length > 0) {
    await prisma.productImage.deleteMany({
      where: {
        productId: parsedProductId
      }
    });

    for (const [index, image] of productImages.entries()) {
      await prisma.productImage.create({
        data: {
          altText: input.name || null,
          imageUrl: image.imageUrl,
          isMain: index === 0,
          productId: parsedProductId,
          sortOrder: index,
          storageKey: image.storageKey || null
        }
      });
    }
  }

  await prisma.productVariant.deleteMany({
    where: {
      productId: parsedProductId
    }
  });

  for (const [index, variant] of productVariants.entries()) {
    await prisma.productVariant.create({
      data: {
        price: variant.price,
        productId: parsedProductId,
        salePrice: variant.salePrice > 0 ? variant.salePrice : null,
        sku: createProductVariantSku(input.sku, variant.variantName, index),
        status: variant.status,
        stockQuantity: variant.stockQuantity,
        variantName: variant.variantName
      }
    });
  }
}
