import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getProductRecordSelect, mapProductRecord, productRecordOrderBy } from "@/lib/product-record";
import { getProductCollectionCategory, getProductDiscount, getProductId } from "@/lib/products";
import { normalizeSearchText } from "@/lib/search";
import type { Prisma } from "@/generated/prisma/client";
import type { ProductCatalogResult, ProductRecord } from "@/lib/types";

export type CategoryCatalogRecord = {
  children: Array<{
    name: string;
    slug: string;
  }>;
  name: string;
  slug: string;
};

type ProductCatalogQueryOptions = Readonly<{
  category?: string | null;
  featured?: string | null;
  keyword?: string | null;
  page?: number | null;
  parentCategory?: string | null;
  pageSize?: number | null;
  priceRange?: string | null;
}>;

function sanitizeProductTake(limit?: number | null): number | undefined {
  const take = Math.floor(Number(limit));
  return Number.isFinite(take) && take > 0 ? take : undefined;
}

function sanitizeProductPage(page?: number | null): number {
  const requestedPage = Math.floor(Number(page) || 1);
  return Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
}

function normalizeCatalogValue(value?: string | null): string {
  return String(value || "").trim().toLowerCase();
}

function applyProductCategoryWhere(
  where: Prisma.ProductWhereInput,
  parentCategory?: string | null,
  category?: string | null
) {
  const productParentCategory = normalizeCatalogValue(parentCategory);
  const productCategory = normalizeCatalogValue(category);

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
  switch (String(priceRange || "").trim()) {
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

function buildProductKeywordWhere(keyword?: string | null): Prisma.ProductWhereInput | null {
  const searchKeyword = String(keyword || "").trim();
  const normalizedKeyword = normalizeSearchText(searchKeyword);
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

function buildProductCatalogWhere(options: ProductCatalogQueryOptions): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    status: "active"
  };
  const productFeatured = normalizeCatalogValue(options.featured);
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

function buildProductPageInfo(
  totalProducts: number,
  options: Pick<ProductCatalogQueryOptions, "page" | "pageSize">
) {
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

export const findCategoryBySlug = cache(async (slug?: string | null): Promise<CategoryCatalogRecord | null> => {
  const categorySlug = String(slug || "").trim().toLowerCase();

  if (!categorySlug) {
    return null;
  }

  const category = await prisma.category.findFirst({
    where: {
      isActive: true,
      slug: categorySlug
    },
    select: {
      children: {
        where: {
          isActive: true
        },
        select: {
          name: true,
          slug: true
        },
        orderBy: [
          {
            sortOrder: "asc"
          },
          {
            id: "asc"
          }
        ]
      },
      name: true,
      slug: true
    }
  });

  return category;
});

export const findProductBySlug = cache(async (slug?: string | null): Promise<ProductRecord | null> => {
  const productSlug = String(slug || "").trim().toLowerCase();

  if (!productSlug) {
    return null;
  }

  const product = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      status: "active"
    },
    select: getProductRecordSelect({
      includeCategoryName: true,
      includeDescription: true,
      includeVariants: true
    })
  });

  return product
    ? mapProductRecord(product, {
        includeCategoryName: true,
        includeDescription: true,
        includeVariants: true
      })
    : null;
});

export const findProductByCategory = cache(
  async (category?: string | null, limit?: number | null): Promise<ProductRecord[]> => {
    const take = sanitizeProductTake(limit);
    const where: Prisma.ProductWhereInput = {
      status: "active"
    };

    applyProductCategoryWhere(where, category);

    const products = await prisma.product.findMany({
      where,
      select: getProductRecordSelect(),
      orderBy: productRecordOrderBy,
      ...(take ? { take } : {})
    });

    return products.map((product) => mapProductRecord(product));
  }
);

export const findProductsByKeyword = cache(
  async (keyword?: string | null, limit?: number | null): Promise<ProductRecord[]> => {
    const keywordWhere = buildProductKeywordWhere(keyword);
    const take = sanitizeProductTake(limit);

    if (!keywordWhere) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        status: "active",
        AND: [keywordWhere]
      },
      select: getProductRecordSelect(),
      orderBy: productRecordOrderBy,
      ...(take ? { take } : {})
    });

    return products.map((product) => mapProductRecord(product));
  }
);

export const findProductCatalog = cache(
  async (options: ProductCatalogQueryOptions = {}): Promise<ProductCatalogResult> => {
    const where = buildProductCatalogWhere(options);
    const totalProducts = await prisma.product.count({ where });
    const pageInfo = buildProductPageInfo(totalProducts, options);
    const products = totalProducts
      ? await prisma.product.findMany({
          where,
          select: getProductRecordSelect(),
          orderBy: productRecordOrderBy,
          ...(pageInfo.pageSize > 0
            ? {
                skip: (pageInfo.currentPage - 1) * pageInfo.pageSize,
                take: pageInfo.pageSize
              }
            : {})
        })
      : [];

    return {
      items: products.map((product) => {
        const productRecord = mapProductRecord(product);
        return {
          ...productRecord,
          discount: getProductDiscount(productRecord)
        };
      }),
      pageInfo
    };
  }
);

export const findProductsByFeatured = cache(
  async (featured?: string | null, limit?: number | null): Promise<ProductRecord[]> => {
    const productFeatured = String(featured || "").trim().toLowerCase();
    const take = sanitizeProductTake(limit);

    if (!productFeatured) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        featured: productFeatured,
        status: "active"
      },
      select: getProductRecordSelect(),
      orderBy: productRecordOrderBy,
      ...(take ? { take } : {})
    });

    return products.map((product) => mapProductRecord(product));
  }
);

export const getSimilarProducts = cache(async (product: ProductRecord | null, limit = 5): Promise<ProductRecord[]> => {
  const category = getProductCollectionCategory(product);
  const take = Math.max(Math.floor(Number(limit) || 0), 0);

  if (!product || !category || take === 0) {
    return [];
  }

  const currentProductId = getProductId(product);
  const where: Prisma.ProductWhereInput = {
    status: "active",
    id: {
      not: currentProductId
    },
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
  };
  const products = await prisma.product.findMany({
    where,
    select: getProductRecordSelect(),
    orderBy: productRecordOrderBy,
    take
  });

  return products.map((similarProduct) => mapProductRecord(similarProduct));
});
