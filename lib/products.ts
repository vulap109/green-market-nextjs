import { filterProductsByKeyword } from "@/lib/search";
import type { PageInfo, PrimitiveId, ProductQueryOptions, ProductRecord } from "@/lib/types";

export function getProductId(product?: ProductRecord | null): number {
  return Number(product?.id ?? 0);
}

export function getProductSlug(product?: ProductRecord | null): string {
  if (product?.slug) {
    return String(product.slug);
  }

  return String(product?.name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProductPrice(product?: ProductRecord | null): number {
  return Number(product?.price ?? 0);
}

export function getProductFinalPrice(product?: ProductRecord | null): number {
  const nextPrice = Number(product?.finalprice ?? getProductPrice(product));
  return Number.isFinite(nextPrice) ? nextPrice : 0;
}

export function getProductDiscount(product?: ProductRecord | null): number {
  const originalPrice = getProductPrice(product);
  const finalPrice = getProductFinalPrice(product);

  if (!originalPrice || finalPrice >= originalPrice) {
    return 0;
  }

  const percent = ((originalPrice - finalPrice) / originalPrice) * 100;
  return Math.floor(percent * 2) / 2;
}

export function matchesProductPriceRange(product: ProductRecord, priceRange?: string | null): boolean {
  const normalizedRange = String(priceRange || "").trim();
  if (!normalizedRange) {
    return true;
  }

  const currentPrice = getProductFinalPrice(product);

  switch (normalizedRange) {
    case "0-500k":
      return currentPrice <= 500000;
    case "500k-1m":
      return currentPrice > 500000 && currentPrice <= 1000000;
    case "1m-1_5m":
      return currentPrice > 1000000 && currentPrice <= 1500000;
    case "1_5m-2m":
      return currentPrice > 1500000 && currentPrice <= 2000000;
    case "2m-3m":
      return currentPrice > 2000000 && currentPrice <= 3000000;
    case "3m-plus":
      return currentPrice > 3000000;
    default:
      return true;
  }
}

export function filterProducts(
  products: ProductRecord[] = [],
  options: Omit<ProductQueryOptions, "limit" | "page"> = {}
): ProductRecord[] {
  let matches = products.slice();
  const requestedSubcategory = String(options.subcategory || "").trim();
  const requestedPriceRange = String(options.priceRange || "").trim();

  if (Array.isArray(options.ids) && options.ids.length > 0) {
    matches = options.ids
      .map((id) => products.find((product) => getProductId(product) === id))
      .filter((product): product is ProductRecord => Boolean(product));
  }

  if (options.category) {
    matches = matches.filter((product) => product.category === options.category);
  }

  if (requestedSubcategory) {
    matches = matches.filter((product) => String(product.subcategory || "").trim() === requestedSubcategory);
  }

  if (requestedPriceRange) {
    matches = matches.filter((product) => matchesProductPriceRange(product, requestedPriceRange));
  }

  if (options.keyword) {
    matches = filterProductsByKeyword(matches, options.keyword);
  }

  return matches.map((product) => ({
    ...product,
    discount: getProductDiscount(product)
  }));
}

export function paginateProducts(
  products: ProductRecord[] = [],
  options: Pick<ProductQueryOptions, "limit" | "page"> = {}
): { items: ProductRecord[]; pageInfo: PageInfo } {
  const totalProducts = products.length;
  const requestedLimit = Number(options.limit);
  const hasLimit = requestedLimit > 0;
  const pageSize = hasLimit ? requestedLimit : totalProducts;
  const totalPages = totalProducts === 0 ? 0 : hasLimit ? Math.ceil(totalProducts / pageSize) : 1;
  const requestedPage = Number(options.page) || 1;
  const currentPage = totalPages === 0 ? 1 : Math.min(Math.max(requestedPage, 1), totalPages);

  const items = hasLimit
    ? products.slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize)
    : products.slice();

  return {
    items,
    pageInfo: {
      currentPage,
      pageSize,
      totalPages,
      totalProducts
    }
  };
}

export function queryProducts(
  products: ProductRecord[] = [],
  options: ProductQueryOptions = {}
): { items: ProductRecord[]; pageInfo: PageInfo } {
  const filteredProducts = filterProducts(products, options);
  return paginateProducts(filteredProducts, options);
}

export function pickProductsByIds(products: ProductRecord[] = [], ids: PrimitiveId[] = []): ProductRecord[] {
  return filterProducts(products, { ids });
}
