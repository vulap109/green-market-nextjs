import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  applyProductCategoryWhere,
  buildProductCatalogWhere,
  buildProductKeywordWhere,
  buildProductPageInfo,
  getProductCollectionCategory,
  getProductDiscount,
  getProductId,
  getProductRecordSelect,
  mapProductRecord,
  productRecordOrderBy,
  sanitizeProductTake
} from "@/lib/product-utils";
import { formatLowercaseString } from "@/lib/utils";
import type {
  CategoryCatalogRecord,
  ProductCatalogQueryOptions,
  ProductCatalogResult,
  ProductRecord
} from "@/lib/product-types";

export const findCategoryBySlug = cache(async (slug?: string | null): Promise<CategoryCatalogRecord | null> => {
  const categorySlug = formatLowercaseString(slug);

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
  const productSlug = formatLowercaseString(slug);

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
    const productFeatured = formatLowercaseString(featured);
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

export const getProductsData = cache(async (): Promise<ProductRecord[]> => {
  const products = await prisma.product.findMany({
    where: {
      status: "active"
    },
    select: getProductRecordSelect({ includeVariants: true }),
    orderBy: productRecordOrderBy
  });

  return products.map((product) => mapProductRecord(product, { includeVariants: true }));
});
