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

export type AdminProductImageInput = Readonly<{
  imageUrl: string;
  storageKey: string;
}>;

export type AdminProductVariantInput = Readonly<{
  price: number;
  salePrice: number;
  status: string;
  stockQuantity: number;
  variantName: string;
}>;

export type AdminCreateProductInput = Readonly<{
  category: string;
  costPrice: number;
  description: string;
  featured: string;
  images: ReadonlyArray<AdminProductImageInput>;
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
  variants: ReadonlyArray<AdminProductVariantInput>;
}>;

export type AdminProductEditImage = Readonly<{
  id: string;
  imageUrl: string;
  isMain: boolean;
  sortOrder: number;
  storageKey: string;
}>;

export type AdminProductEditVariant = Readonly<
  AdminProductVariantInput & {
    id: string;
    sku: string;
  }
>;

export type AdminProductEditDetails = Readonly<
  Omit<AdminCreateProductInput, "images" | "variants"> & {
    id: string;
    images: ReadonlyArray<AdminProductEditImage>;
    variants: ReadonlyArray<AdminProductEditVariant>;
  }
>;
