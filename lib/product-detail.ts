import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getProductRecordSelect, mapProductRecord } from "@/lib/product-record";
import { getProductId } from "@/lib/products";
import type { Prisma } from "@/generated/prisma/client";
import type { ProductRecord } from "@/lib/types";

export type CategoryCatalogRecord = {
  children: Array<{
    name: string;
    slug: string;
  }>;
  name: string;
  slug: string;
};

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
    select: getProductRecordSelect({ includeCategoryName: true, includeDescription: true })
  });

  return product
    ? mapProductRecord(product, { includeCategoryName: true, includeDescription: true })
    : null;
});

export const findProductByCategory = cache(async (category?: string | null): Promise<ProductRecord[]> => {
  const productCategory = String(category || "").trim().toLowerCase();
  const where: Prisma.ProductWhereInput = {
    status: "active"
  };

  if (productCategory) {
    where.category = {
      OR: [
        {
          slug: productCategory
        },
        {
          parent: {
            slug: productCategory
          }
        }
      ]
    };
  }

  const products = await prisma.product.findMany({
    where,
    select: getProductRecordSelect(),
    orderBy: {
      id: "asc"
    }
  });

  return products.map((product) => mapProductRecord(product));
});

export const findProductsByFeatured = cache(async (featured?: string | null): Promise<ProductRecord[]> => {
  const productFeatured = String(featured || "").trim().toLowerCase();

  if (!productFeatured) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      featured: productFeatured,
      status: "active"
    },
    select: getProductRecordSelect(),
    orderBy: {
      id: "asc"
    }
  });

  return products.map((product) => mapProductRecord(product));
});

export const getSimilarProducts = cache(async (product: ProductRecord | null, limit = 5): Promise<ProductRecord[]> => {
  const category = String(product?.category || "").trim();
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
    orderBy: {
      id: "asc"
    },
    take
  });

  return products.map((similarProduct) => mapProductRecord(similarProduct));
});
