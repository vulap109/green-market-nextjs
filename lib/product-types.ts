export type ProductVariantOption = {
  id?: number | string;
  label: string;
  price: number;
  sku?: string;
  stockQuantity?: number;
  value: string;
};

export type ProductRecord = {
  category?: string;
  categoryName?: string;
  description?: string;
  discount?: number | string;
  id?: number | string;
  img?: string;
  name?: string;
  parentCategory?: string;
  parentCategoryName?: string;
  price?: number;
  salePrice?: number;
  sku?: string;
  slug?: string;
  sortOrder?: number;
  variantOptions?: ProductVariantOption[];
};

export type PageInfo = {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalProducts: number;
};

export type ProductCatalogResult = {
  items: ProductRecord[];
  pageInfo: PageInfo;
};

export type CategoryCatalogRecord = {
  children: Array<{
    name: string;
    slug: string;
  }>;
  name: string;
  slug: string;
};

export type ProductCatalogQueryOptions = Readonly<{
  category?: string | null;
  featured?: string | null;
  keyword?: string | null;
  page?: number | null;
  parentCategory?: string | null;
  pageSize?: number | null;
  priceRange?: string | null;
}>;

export type ProductRecordSource = Readonly<{
  category?: {
    name?: string | null;
    parent?: {
      name?: string | null;
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
  sortOrder?: number | null;
  thumbnail?: string | null;
  variants?: ReadonlyArray<{
    id?: bigint | number | string | null;
    price?: unknown;
    salePrice?: unknown;
    sku?: string | null;
    stockQuantity?: number | null;
    variantName?: string | null;
  }> | null;
}>;

export type MapProductRecordOptions = Readonly<{
  includeCategoryName?: boolean;
  includeDescription?: boolean;
  includeVariants?: boolean;
}>;

export type ProductPageInfoOptions = Pick<ProductCatalogQueryOptions, "page" | "pageSize">;
