import type { PaymentMethod } from "@/lib/types";

type ParamStringValue = string | string[] | null | undefined;
type ProductSlugSource = Readonly<{
  name?: string | null;
  slug?: string | null;
}>;

export function formatString(value: unknown): string {
  return String(value ?? "").trim();
}

export function formatLowercaseString(value: unknown): string {
  return formatString(value).toLowerCase();
}

export function formatParamString(value?: ParamStringValue): string {
  return formatString(Array.isArray(value) ? value[0] : value);
}

export function formatPathname(value: unknown): string {
  return formatString(value).replace(/\/+$/, "") || "/";
}

export function resolveAssetPath(assetPath?: string | null): string {
  const normalizedPath = formatString(assetPath);

  if (!normalizedPath) {
    return "";
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
}

export function formatSearchText(value: unknown): string {
  return formatLowercaseString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatSlugString(value: unknown): string {
  return formatLowercaseString(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatProductSlug(product?: ProductSlugSource | null): string {
  return formatString(product?.slug) || formatSlugString(product?.name);
}

export function formatMoney(amount: number | string | null | undefined): string {
  return `${Number(amount || 0).toLocaleString("vi-VN")} \u20AB`;
}

export function getPaymentMethodLabel(method: PaymentMethod | string): string {
  return method === "cod"
    ? "Thanh to\u00e1n khi nh\u1eadn h\u00e0ng"
    : "Chuy\u1ec3n kho\u1ea3n ng\u00e2n h\u00e0ng tr\u1ef1c ti\u1ebfp";
}

export function getPaymentMethodNote(method: PaymentMethod | string): string {
  return method === "cod"
    ? "Kh\u00e1ch thanh to\u00e1n khi nh\u1eadn h\u00e0ng t\u1eeb nh\u00e2n vi\u00ean giao nh\u1eadn."
    : "Vui l\u00f2ng m\u1edf th\u00f4ng tin chuy\u1ec3n kho\u1ea3n v\u00e0 chuy\u1ec3n \u0111\u00fang s\u1ed1 ti\u1ec1n, \u0111\u00fang n\u1ed9i dung \u0111\u1ec3 shop x\u00e1c nh\u1eadn nhanh.";
}
