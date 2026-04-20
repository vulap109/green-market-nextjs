import type { PrimitiveId } from "@/lib/types";
import { ALL_PRODUCTS_ROUTE } from "@/lib/routes";

export type CatalogBanner = {
  desktop: string;
  mobile: string;
};

export type CatalogFilterOption = {
  label: string;
  value: string;
};

type CatalogPreset = {
  category?: string;
  ids?: PrimitiveId[];
  title: string;
};

type AllProductsUrlOptions = {
  keyword?: string | null;
  page?: number | null;
  priceRange?: string | null;
  q?: string | null;
  subcategory?: string | null;
};

const DEFAULT_TITLE = "Tất Cả Sản Phẩm";
const SEARCH_RESULT_TITLE = "Kết quả tìm kiếm";

export const ALL_PRODUCTS_PAGE_SIZE = 9;

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

const catalogPresetByQuery: Record<string, CatalogPreset> = {
  "ban-chay-nhat": {
    title: "Sản Phẩm Bán Chạy",
    ids: [142, 3, 165, 157, 9, 11, 158, 15, 17, 18, 19, 162, 151, 149, 105, 8, 13, 66]
  },
  "khuyen-mai": {
    title: "Khuyến Mãi Hot",
    ids: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
  },
  "gio-qua-trai-cay": {
    title: "Giỏ Quà Tặng Trái Cây",
    category: "fruit-basket"
  },
  "qua-tang-thuc-pham": {
    title: "Giỏ Quà Tặng Thực Phẩm",
    category: "gift-box"
  },
  "trai-cay-nhap-khau": {
    title: "Trái Cây Nhập Khẩu",
    category: "imported-fruits"
  },
  "banh-kem": {
    title: "Bánh Kem Thiết Kế",
    category: "cream-cake"
  },
  "hoa-tuoi": {
    title: "Hoa Tươi Nghệ Thuật",
    category: "flowers"
  }
};

export function getSearchParamValue(value?: string | string[] | null): string {
  if (Array.isArray(value)) {
    return String(value[0] || "").trim();
  }

  return String(value || "").trim();
}

export function sanitizeCatalogPage(page?: string | number | null): number {
  const nextPage = Number(page);
  if (!Number.isFinite(nextPage) || nextPage < 1) {
    return 1;
  }

  return Math.floor(nextPage);
}

export function getCatalogSubcategoryOptions(category?: string | null): CatalogFilterOption[] {
  return [{ value: "", label: "Tất cả sản phẩm" }].concat(
    subcategoryFilterByCategory[String(category || "").trim()] || []
  );
}

export function sanitizeCatalogSubcategory(category?: string | null, subcategory?: string | null): string {
  const requestedSubcategory = String(subcategory || "").trim();
  if (!requestedSubcategory) {
    return "";
  }

  return getCatalogSubcategoryOptions(category).some((option) => option.value === requestedSubcategory)
    ? requestedSubcategory
    : "";
}

export function sanitizeCatalogPriceRange(priceRange?: string | null): string {
  const requestedPriceRange = String(priceRange || "").trim();
  if (!requestedPriceRange) {
    return "";
  }

  return catalogPriceFilters.some((option) => option.value === requestedPriceRange)
    ? requestedPriceRange
    : "";
}

export function resolveCatalogContext(query?: string | null, keyword?: string | null) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const normalizedKeyword = String(keyword || "").trim();
  const preset = catalogPresetByQuery[normalizedQuery];
  const category = String(preset?.category || "").trim();
  const title = normalizedKeyword ? SEARCH_RESULT_TITLE : preset?.title || DEFAULT_TITLE;

  return {
    banner: bannerImageByCategory[category] || defaultBanner,
    category,
    ids: preset?.ids || null,
    query: normalizedQuery,
    subcategoryOptions: getCatalogSubcategoryOptions(category),
    title
  };
}

export function resolveCatalogLinkByCategory(category?: string | null) {
  const normalizedCategory = String(category || "").trim();
  const matchedPresetEntry = Object.entries(catalogPresetByQuery).find(
    ([, preset]) => String(preset.category || "").trim() === normalizedCategory
  );
  const query = matchedPresetEntry?.[0] || "";
  const title = matchedPresetEntry?.[1]?.title || DEFAULT_TITLE;

  return {
    href: buildAllProductsUrl(query ? { q: query } : {}),
    query,
    title
  };
}

export function buildAllProductsUrl(options: AllProductsUrlOptions = {}): string {
  const params = new URLSearchParams();
  const requestedQuery = String(options.q || "").trim();
  const requestedKeyword = String(options.keyword || "").trim();
  const requestedSubcategory = String(options.subcategory || "").trim();
  const requestedPriceRange = String(options.priceRange || "").trim();
  const requestedPage = sanitizeCatalogPage(options.page);

  if (requestedQuery) {
    params.set("q", requestedQuery);
  }

  if (requestedKeyword) {
    params.set("keyword", requestedKeyword);
  }

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
  return `${ALL_PRODUCTS_ROUTE}${queryString ? `?${queryString}` : ""}`;
}
