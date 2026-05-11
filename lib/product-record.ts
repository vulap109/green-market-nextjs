import type { Prisma } from "@/generated/prisma/client";
import type { ProductRecord } from "@/lib/types";

type ProductRecordSource = Readonly<{
  category?: {
    name?: string | null;
    parent?: {
      name?: string | null;
      slug?: string | null;
    } | null;
    slug?: string | null;
  } | null;
  description?: string | null;
  id?: bigint | number | string | null;
  images?: ReadonlyArray<{
    imageUrl?: string | null;
  }> | null;
  name?: string | null;
  price?: unknown;
  salePrice?: unknown;
  sku?: string | null;
  slug?: string | null;
  sortOrder?: number | null;
  thumbnail?: string | null;
}>;

type MapProductRecordOptions = Readonly<{
  includeCategoryName?: boolean;
  includeDescription?: boolean;
}>;

export const productRecordOrderBy = [
  {
    sortOrder: "asc" as const
  },
  {
    id: "asc" as const
  }
] satisfies Prisma.ProductOrderByWithRelationInput[];

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
    }
  } satisfies Prisma.ProductSelect;
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
  const finalprice = Number(product.salePrice ?? product.price ?? 0);
  const image = product.thumbnail || product.images?.[0]?.imageUrl;

  return {
    id: product.id === undefined || product.id === null ? undefined : Number(product.id),
    sku: product.sku || undefined,
    slug: product.slug || undefined,
    name: product.name || undefined,
    price,
    finalprice,
    sortOrder: product.sortOrder ?? undefined,
    img: image || undefined,
    category: category || undefined,
    ...(options.includeCategoryName ? { categoryName: categoryName || undefined } : {}),
    parentCategory: parentCategory || undefined,
    ...(options.includeCategoryName ? { parentCategoryName: parentCategoryName || undefined } : {}),
    ...(options.includeDescription ? { description: product.description || undefined } : {})
  };
}
