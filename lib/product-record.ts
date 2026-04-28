import type { Prisma } from "@/generated/prisma/client";
import type { ProductRecord } from "@/lib/types";

type ProductRecordSource = Readonly<{
  category?: {
    parent?: {
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
  thumbnail?: string | null;
}>;

type MapProductRecordOptions = Readonly<{
  includeDescription?: boolean;
}>;

export function getProductRecordSelect(options: MapProductRecordOptions = {}) {
  return {
    id: true,
    sku: true,
    slug: true,
    name: true,
    price: true,
    salePrice: true,
    thumbnail: true,
    ...(options.includeDescription ? { description: true } : {}),
    category: {
      select: {
        slug: true,
        parent: {
          select: {
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
  const category = product.category?.parent?.slug || product.category?.slug;
  const subcategory = product.category?.slug;
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
    img: image || undefined,
    category: category || undefined,
    subcategory: subcategory || undefined,
    ...(options.includeDescription ? { description: product.description || undefined } : {})
  };
}
