import { COLLECTIONS_ROUTE } from "@/lib/routes";
import { formatLowercaseString, formatString } from "@/lib/utils";

export type CatalogBanner = {
  desktop: string;
  mobile: string;
};

export type CatalogFilterOption = {
  label: string;
  value: string;
};

export type ProductFeaturedCatalog = {
  featured: string;
  title: string;
};

type CollectionUrlOptions = {
  category?: string | null;
  page?: number | null;
  priceRange?: string | null;
  subcategory?: string | null;
};

export const CATALOG_PAGE_SIZE = 9;

export const catalogPriceFilters: CatalogFilterOption[] = [
  { value: "", label: "Tất cả mức giá" },
  { value: "0-500k", label: "0 - 500k" },
  { value: "500k-1m", label: "500k - 1tr" },
  { value: "1m-1_5m", label: "1tr - 1tr5" },
  { value: "1_5m-2m", label: "1tr5 - 2tr" },
  { value: "2m-3m", label: "2tr - 3tr" },
  { value: "3m-plus", label: "3tr trở lên" }
];

const defaultBanner: CatalogBanner = {
  desktop: "/images/banner-tat-ca-san-pham.jpg",
  mobile: "/images/banner-tat-ca-san-pham-mb.jpg"
};

const bannerImageByCategory: Record<string, CatalogBanner> = {
  "": defaultBanner,
  "cream-cake": {
    desktop: "/images/cake/banner-banh-kem.jpg",
    mobile: "/images/cake/banner-banh-kem-mb.jpg"
  }
};

const subcategoryFilterByCategory: Record<string, CatalogFilterOption[]> = {
  "fruit-basket": [
    { value: "funeral", label: "Giỏ trái cây viếng" },
    { value: "fresh", label: "Giỏ trái cây tươi" },
    { value: "box", label: "Hộp quà trái cây" }
  ],
  "cream-cake": [
    { value: "ll", label: "Bánh kem LL" },
    { value: "lq", label: "Bánh kem LQ" },
    { value: "qd", label: "Bánh kem QD" },
    { value: "ht", label: "Bánh kem HT" }
  ]
};

const productFeaturedCatalogByRouteCategory: Record<string, ProductFeaturedCatalog> = {
  "ban-chay": {
    featured: "ban-chay",
    title: "Sản Phẩm Bán Chạy"
  },
  "khuyen-mai-hot": {
    featured: "khuyen-mai-hot",
    title: "Khuyến Mãi Hot"
  }
};

export function sanitizeCatalogPage(page?: string | number | null): number {
  const nextPage = Number(page);
  if (!Number.isFinite(nextPage) || nextPage < 1) {
    return 1;
  }

  return Math.floor(nextPage);
}

export function getCatalogSubcategoryOptions(category?: string | null): CatalogFilterOption[] {
  return [{ value: "", label: "Tất cả sản phẩm" }].concat(
    subcategoryFilterByCategory[formatString(category)] || []
  );
}

export function sanitizeCatalogSubcategory(category?: string | null, subcategory?: string | null): string {
  return sanitizeCatalogSubcategoryValue(getCatalogSubcategoryOptions(category), subcategory);
}

export function sanitizeCatalogSubcategoryValue(
  options: CatalogFilterOption[],
  subcategory?: string | null
): string {
  const requestedSubcategory = formatString(subcategory);
  if (!requestedSubcategory) {
    return "";
  }

  return options.some((option) => option.value === requestedSubcategory) ? requestedSubcategory : "";
}

export function sanitizeCatalogPriceRange(priceRange?: string | null): string {
  const requestedPriceRange = formatString(priceRange);
  if (!requestedPriceRange) {
    return "";
  }

  return catalogPriceFilters.some((option) => option.value === requestedPriceRange)
    ? requestedPriceRange
    : "";
}

export function getCatalogRouteCategory(category?: string | null): string {
  return formatLowercaseString(category);
}

export function getCatalogBanner(category?: string | null): CatalogBanner {
  return bannerImageByCategory[formatString(category)] || defaultBanner;
}

export function getProductFeaturedCatalog(category?: string | null): ProductFeaturedCatalog | null {
  const routeCategory = getCatalogRouteCategory(category);
  const featuredCatalog = productFeaturedCatalogByRouteCategory[routeCategory];
  return featuredCatalog ? { ...featuredCatalog } : null;
}

export function buildCollectionUrl(options: CollectionUrlOptions = {}): string {
  const params = new URLSearchParams();
  const requestedCategory = getCatalogRouteCategory(options.category);
  const requestedSubcategory = formatString(options.subcategory);
  const requestedPriceRange = formatString(options.priceRange);
  const requestedPage = sanitizeCatalogPage(options.page);

  if (requestedSubcategory) {
    params.set("subcategory", requestedSubcategory);
  }

  if (requestedPriceRange) {
    params.set("price", requestedPriceRange);
  }

  if (requestedPage > 1) {
    params.set("page", String(requestedPage));
  }

  const queryString = params.toString();
  const pathname = `${COLLECTIONS_ROUTE}/${encodeURIComponent(requestedCategory)}`;

  return `${pathname}${queryString ? `?${queryString}` : ""}`;
}
