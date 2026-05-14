import { SEARCH_ROUTE } from "@/lib/routes";
import { formatSearchText, formatString } from "@/lib/utils";
import type { ProductRecord } from "@/lib/product-types";

export const HEADER_SEARCH_DEBOUNCE_MS = 500;

export function filterProductsByKeyword(
  products: ProductRecord[] = [],
  keyword?: string | null,
  limit?: number | null
): ProductRecord[] {
  const normalizedKeyword = formatSearchText(keyword);

  let matches = normalizedKeyword
    ? products.filter((product) => formatSearchText(product?.name).includes(normalizedKeyword))
    : products.slice();

  const maxItems = Number(limit);
  if (maxItems > 0) {
    matches = matches.slice(0, maxItems);
  }

  return matches;
}

type ProductSearchUrlOptions = Readonly<{
  page?: number | null;
  priceRange?: string | null;
}>;

export function buildProductSearchUrl(
  keyword?: string | null,
  options: ProductSearchUrlOptions = {}
): string {
  const trimmedKeyword = formatString(keyword);
  const requestedPriceRange = formatString(options.priceRange);
  const requestedPage = Math.floor(Number(options.page) || 1);
  const params = new URLSearchParams();

  if (trimmedKeyword) {
    params.set("keyword", trimmedKeyword);
  }

  if (requestedPriceRange) {
    params.set("price", requestedPriceRange);
  }

  if (Number.isFinite(requestedPage) && requestedPage > 1) {
    params.set("page", String(requestedPage));
  }

  const queryString = params.toString();
  return `${SEARCH_ROUTE}${queryString ? `?${queryString}` : ""}`;
}
