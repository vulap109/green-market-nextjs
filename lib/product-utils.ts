import type { Prisma } from "@/generated/prisma/client";
import { formatLowercaseString, formatSearchText, formatString } from "@/lib/utils";
import type {
  MapProductRecordOptions,
  ProductCatalogQueryOptions,
  ProductPageInfoOptions,
  ProductRecord,
  ProductRecordSource,
  ProductVariantOption
} from "@/lib/product-types";

export const PRODUCT_IMAGE_UPLOAD_LIMIT = 5;
export const PRODUCT_IMAGE_TOTAL_MAX_BYTES = Math.floor(4.5 * 1024 * 1024);
export const PRODUCT_IMAGE_TOTAL_MAX_LABEL = "4.5MB";
export const PRODUCT_IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PRODUCT_IMAGE_ACCEPT = PRODUCT_IMAGE_ALLOWED_TYPES.join(",");

export const productRecordOrderBy = [
  {
    sortOrder: "asc" as const
  },
  {
    id: "asc" as const
  }
] satisfies Prisma.ProductOrderByWithRelationInput[];

export function getProductId(product?: ProductRecord | null): number {
  return Number(product?.id ?? 0);
}

export function getProductCollectionCategory(product?: ProductRecord | null): string {
  return formatString(product?.parentCategory || product?.category);
}

export function getProductPrice(product?: ProductRecord | null): number {
  const price = Number(product?.price ?? 0);
  return Number.isFinite(price) ? price : 0;
}

export function getProductSalePrice(product?: ProductRecord | null): number {
  const salePrice = Number(product?.salePrice ?? 0);
  if (Number.isFinite(salePrice) && salePrice > 0) {
    return salePrice;
  }

  return getProductPrice(product);
}

export function getProductDiscount(product?: ProductRecord | null): number {
  const originalPrice = getProductPrice(product);
  const salePrice = getProductSalePrice(product);

  if (!originalPrice || salePrice >= originalPrice) {
    return 0;
  }

  const percent = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.floor(percent * 2) / 2;
}

export function sanitizeProductTake(limit?: number | null): number | undefined {
  const take = Math.floor(Number(limit));
  return Number.isFinite(take) && take > 0 ? take : undefined;
}

function sanitizeProductPage(page?: number | null): number {
  const requestedPage = Math.floor(Number(page) || 1);
  return Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
}

export function applyProductCategoryWhere(
  where: Prisma.ProductWhereInput,
  parentCategory?: string | null,
  category?: string | null
) {
  const productParentCategory = formatLowercaseString(parentCategory);
  const productCategory = formatLowercaseString(category);

  if (productCategory) {
    where.category = productParentCategory
      ? {
          parent: {
            slug: productParentCategory
          },
          slug: productCategory
        }
      : {
          slug: productCategory
        };
    return;
  }

  if (productParentCategory) {
    where.category = {
      OR: [
        {
          slug: productParentCategory
        },
        {
          parent: {
            slug: productParentCategory
          }
        }
      ]
    };
  }
}

function buildFinalPriceComparisonWhere(
  minExclusive?: number,
  maxInclusive?: number
): Prisma.ProductWhereInput {
  const comparison = {
    ...(minExclusive === undefined ? {} : { gt: minExclusive }),
    ...(maxInclusive === undefined ? {} : { lte: maxInclusive })
  };

  return {
    OR: [
      {
        salePrice: {
          not: null,
          ...comparison
        }
      },
      {
        price: comparison,
        salePrice: null
      }
    ]
  };
}

function buildFinalPriceRangeWhere(priceRange?: string | null): Prisma.ProductWhereInput | null {
  switch (formatString(priceRange)) {
    case "0-500k":
      return buildFinalPriceComparisonWhere(undefined, 500000);
    case "500k-1m":
      return buildFinalPriceComparisonWhere(500000, 1000000);
    case "1m-1_5m":
      return buildFinalPriceComparisonWhere(1000000, 1500000);
    case "1_5m-2m":
      return buildFinalPriceComparisonWhere(1500000, 2000000);
    case "2m-3m":
      return buildFinalPriceComparisonWhere(2000000, 3000000);
    case "3m-plus":
      return buildFinalPriceComparisonWhere(3000000);
    default:
      return null;
  }
}

export function buildProductKeywordWhere(keyword?: string | null): Prisma.ProductWhereInput | null {
  const searchKeyword = formatString(keyword);
  const normalizedKeyword = formatSearchText(searchKeyword);
  const slugKeyword = normalizedKeyword.replace(/\s+/g, "-");

  if (!searchKeyword || !normalizedKeyword) {
    return null;
  }

  const productSearchConditions: Prisma.ProductWhereInput[] = [
    {
      name: {
        contains: searchKeyword,
        mode: "insensitive"
      }
    },
    {
      sku: {
        contains: searchKeyword,
        mode: "insensitive"
      }
    }
  ];

  if (slugKeyword) {
    productSearchConditions.push({
      slug: {
        contains: slugKeyword,
        mode: "insensitive"
      }
    });
  }

  return {
    OR: productSearchConditions
  };
}

export function buildProductCatalogWhere(
  options: ProductCatalogQueryOptions
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: "active"
  };
  const productFeatured = formatLowercaseString(options.featured);
  const keywordWhere = buildProductKeywordWhere(options.keyword);
  const priceRangeWhere = buildFinalPriceRangeWhere(options.priceRange);
  const productFilters = [keywordWhere, priceRangeWhere].filter(Boolean) as Prisma.ProductWhereInput[];

  if (productFeatured) {
    where.featured = productFeatured;
  }

  applyProductCategoryWhere(where, options.parentCategory, options.category);

  if (productFilters.length) {
    where.AND = productFilters;
  }

  return where;
}

export function buildProductPageInfo(totalProducts: number, options: ProductPageInfoOptions) {
  const pageSize = sanitizeProductTake(options.pageSize) ?? totalProducts;
  const totalPages = totalProducts === 0 ? 0 : pageSize > 0 ? Math.ceil(totalProducts / pageSize) : 1;
  const requestedPage = sanitizeProductPage(options.page);
  const currentPage = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalProducts
  };
}

export function getProductRecordSelect(options: MapProductRecordOptions = {}) {
  return {
    id: true,
    sku: true,
    slug: true,
    name: true,
    price: true,
    salePrice: true,
    sortOrder: true,
    thumbnail: true,
    ...(options.includeDescription ? { description: true } : {}),
    category: {
      select: {
        ...(options.includeCategoryName ? { name: true } : {}),
        slug: true,
        parent: {
          select: {
            ...(options.includeCategoryName ? { name: true } : {}),
            slug: true
          }
        }
      }
    },
    images: {
      select: {
        imageUrl: true
      },
      orderBy: [
        {
          isMain: "desc" as const
        },
        {
          sortOrder: "asc" as const
        },
        {
          id: "asc" as const
        }
      ]
    },
    ...(options.includeVariants
      ? {
          variants: {
            where: {
              status: "active"
            },
            select: {
              id: true,
              price: true,
              salePrice: true,
              sku: true,
              stockQuantity: true,
              variantName: true
            },
            orderBy: [
              {
                price: "asc" as const
              },
              {
                id: "asc" as const
              }
            ]
          }
        }
      : {})
  } satisfies Prisma.ProductSelect;
}

function mapProductVariantOptions(product: ProductRecordSource): ProductRecord["variantOptions"] {
  return (product.variants || [])
    .map((variant) => {
      const label = formatString(variant.variantName);
      const price = Number(variant.salePrice ?? variant.price ?? 0);

      return {
        ...(variant.id === undefined || variant.id === null ? {} : { id: Number(variant.id) }),
        label,
        price: Number.isFinite(price) ? price : 0,
        ...(variant.sku ? { sku: variant.sku } : {}),
        ...(variant.stockQuantity === undefined || variant.stockQuantity === null
          ? {}
          : { stockQuantity: variant.stockQuantity }),
        value: variant.id === undefined || variant.id === null ? label : String(variant.id)
      };
    })
    .filter((option) => option.label);
}

export function mapProductRecord(
  product: ProductRecordSource,
  options: MapProductRecordOptions = {}
): ProductRecord {
  const category = product.category?.slug;
  const categoryName = product.category?.name;
  const parentCategory = product.category?.parent?.slug;
  const parentCategoryName = product.category?.parent?.name;
  const price = Number(product.price ?? 0);
  const salePrice = Number(product.salePrice ?? 0);
  const image = product.thumbnail || product.images?.[0]?.imageUrl;

  return {
    id: product.id === undefined || product.id === null ? undefined : Number(product.id),
    sku: product.sku || undefined,
    slug: product.slug || undefined,
    name: product.name || undefined,
    price,
    salePrice,
    sortOrder: product.sortOrder ?? undefined,
    img: image || undefined,
    category: category || undefined,
    ...(options.includeCategoryName ? { categoryName: categoryName || undefined } : {}),
    parentCategory: parentCategory || undefined,
    ...(options.includeCategoryName ? { parentCategoryName: parentCategoryName || undefined } : {}),
    ...(options.includeDescription ? { description: product.description || undefined } : {}),
    ...(options.includeVariants ? { variantOptions: mapProductVariantOptions(product) } : {})
  };
}

export function getSelectedProductVariantOption(
  product?: ProductRecord | null,
  selectedValue?: string | null
): ProductVariantOption | null {
  const variantOptions = product?.variantOptions || [];
  if (!variantOptions.length) {
    return null;
  }

  const requestedValue = formatString(selectedValue);
  return variantOptions.find((variant) => variant.value === requestedValue) || variantOptions[0] || null;
}

export function getProductDisplayPricing(product?: ProductRecord | null, selectedVariantValue?: string | null) {
  if (!product) {
    return {
      currentPrice: 0,
      originalPrice: 0,
      showOriginalPrice: false
    };
  }

  const selectedVariant = getSelectedProductVariantOption(product, selectedVariantValue);
  if (selectedVariant) {
    return {
      currentPrice: selectedVariant.price,
      originalPrice: 0,
      showOriginalPrice: false
    };
  }

  const currentPrice = getProductSalePrice(product);
  const originalPrice = getProductPrice(product);

  return {
    currentPrice,
    originalPrice,
    showOriginalPrice: originalPrice >= currentPrice
  };
}
