import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getProductRecordSelect, mapProductRecord } from "@/lib/product-record";
import { getProductId } from "@/lib/products";
import type { Prisma } from "@/generated/prisma/client";
import type { ProductRecord } from "@/lib/types";

function toBigIntId(id?: string | number | null): bigint | null {
  const idValue = String(id ?? "").trim();
  if (!/^\d+$/.test(idValue)) {
    return null;
  }

  return BigInt(idValue);
}

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
    select: getProductRecordSelect({ includeDescription: true })
  });

  return product ? mapProductRecord(product, { includeDescription: true }) : null;
});

export const getSimilarProducts = cache(async (product: ProductRecord | null, limit = 5): Promise<ProductRecord[]> => {
  const category = String(product?.category || "").trim();
  const take = Math.max(Math.floor(Number(limit) || 0), 0);

  if (!product || !category || take === 0) {
    return [];
  }

  const currentProductId = toBigIntId(getProductId(product));
  const where: Prisma.ProductWhereInput = {
    status: "active",
    ...(currentProductId
      ? {
          id: {
            not: currentProductId
          }
        }
      : {}),
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
