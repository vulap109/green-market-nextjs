import type { ProductRecord } from "@/lib/types";

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

export function getProductCollectionCategory(product?: ProductRecord | null): string {
  return String(product?.parentCategory || product?.category || "").trim();
}

export function getProductPrice(product?: ProductRecord | null): number {
  const price = Number(product?.price ?? 0);
  return Number.isFinite(price) ? price : 0;
}

export function getProductSalePrice(product?: ProductRecord | null): number {
  const salePrice = Number(product?.salePrice ?? 0);
  if (Number.isFinite(salePrice) && salePrice > 0) {
    return salePrice;
  }

  return getProductPrice(product);
}

export function getProductDiscount(product?: ProductRecord | null): number {
  const originalPrice = getProductPrice(product);
  const salePrice = getProductSalePrice(product);

  if (!originalPrice || salePrice >= originalPrice) {
    return 0;
  }

  const percent = ((originalPrice - salePrice) / originalPrice) * 100;
  return Math.floor(percent * 2) / 2;
}
