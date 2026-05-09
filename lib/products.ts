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
