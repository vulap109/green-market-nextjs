import { prisma } from "@/lib/prisma";
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

export type AdminCreateProductInput = Readonly<{
  category: string;
  costPrice: number;
  description: string;
  featured: string;
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
}>;

function normalizeAdminFilterValue(value?: string | null): string {
  return String(value || "").trim();
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

export async function createAdminProduct(input: AdminCreateProductInput): Promise<void> {
  await prisma.product.create({
    data: {
      description: input.description || null,
      featured: input.featured,
      ...(input.category
        ? {
            category: {
              connect: {
                slug: input.category
              }
            }
          }
        : {}),
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
    }
  });
}
