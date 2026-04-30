import { SEARCH_ROUTE } from "@/lib/routes";
import type { ProductRecord } from "@/lib/types";

export const HEADER_SEARCH_DEBOUNCE_MS = 500;

export function normalizeSearchText(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function filterProductsByKeyword(
  products: ProductRecord[] = [],
  keyword?: string | null,
  limit?: number | null
): ProductRecord[] {
  const normalizedKeyword = normalizeSearchText(keyword);

  let matches = normalizedKeyword
    ? products.filter((product) => normalizeSearchText(product?.name).includes(normalizedKeyword))
    : products.slice();

  const maxItems = Number(limit);
  if (maxItems > 0) {
    matches = matches.slice(0, maxItems);
  }

  return matches;
}

export function buildProductSearchUrl(keyword?: string | null): string {
  const trimmedKeyword = String(keyword || "").trim();
  const params = new URLSearchParams();

  if (trimmedKeyword) {
    params.set("keyword", trimmedKeyword);
  }

  const queryString = params.toString();
  return `${SEARCH_ROUTE}${queryString ? `?${queryString}` : ""}`;
}
