import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CollectionCatalog from "@/components/catalog/CollectionCatalog";
import {
  type CatalogFilterOption,
  getCatalogRouteCategory,
  getCatalogBanner,
  getProductStatusCatalog,
  getSearchParamValue,
  sanitizeCatalogPage,
  sanitizeCatalogPriceRange,
  sanitizeCatalogSubcategoryValue
} from "@/lib/catalog";
import {
  type CategoryCatalogRecord,
  findCategoryBySlug,
  findProductByCategory,
  findProductsByStatus
} from "@/lib/product-detail";
import { HOME_ROUTE } from "@/lib/routes";

type CategoryPageProps = Readonly<{
  params: Promise<{
    category?: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function getRouteCategory(value?: string): string {
  return getCatalogRouteCategory(value);
}

function getSubcategoryOptions(category?: CategoryCatalogRecord | null): CatalogFilterOption[] {
  const options = [{ value: "", label: "Tất cả sản phẩm" }];
  const childOptions =
    category?.children.map((childCategory) => ({
      label: childCategory.name,
      value: childCategory.slug
    })) || [];

  return options.concat(childOptions);
}

type CategoryPageContext = {
  productCategory: string;
  productStatus: string;
  routeCategory: string;
  subcategoryOptions: CatalogFilterOption[];
  title: string;
};

async function resolveCategoryPageContext(routeCategory: string): Promise<CategoryPageContext | null> {
  const statusCatalog = getProductStatusCatalog(routeCategory);
  if (statusCatalog) {
    return {
      productCategory: "",
      productStatus: statusCatalog.status,
      routeCategory,
      subcategoryOptions: getSubcategoryOptions(),
      title: statusCatalog.title
    };
  }

  const category = await findCategoryBySlug(routeCategory);
  if (!category) {
    return null;
  }

  return {
    productCategory: category.slug,
    productStatus: "",
    routeCategory: category.slug,
    subcategoryOptions: getSubcategoryOptions(category),
    title: category.name
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const routeParams = await params;
  const catalogContext = await resolveCategoryPageContext(getRouteCategory(routeParams.category));

  return {
    title: catalogContext?.title || "Danh mục sản phẩm"
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const routeParams = await params;
  const routeCategory = getRouteCategory(routeParams.category);
  const catalogContext = await resolveCategoryPageContext(routeCategory);

  if (!catalogContext) {
    notFound();
  }

  const [paramsValue, products] = await Promise.all([
    searchParams,
    catalogContext.productStatus
      ? findProductsByStatus(catalogContext.productStatus)
      : findProductByCategory(catalogContext.productCategory)
  ]);
  const initialSubcategory = sanitizeCatalogSubcategoryValue(
    catalogContext.subcategoryOptions,
    getSearchParamValue(paramsValue.subcategory)
  );
  const initialPriceRange = sanitizeCatalogPriceRange(getSearchParamValue(paramsValue.price));
  const initialPage = sanitizeCatalogPage(getSearchParamValue(paramsValue.page));
  const catalogStateKey = [
    catalogContext.routeCategory,
    initialSubcategory,
    initialPriceRange,
    initialPage
  ].join("|");
  const catalogBanner = getCatalogBanner(catalogContext.productCategory);

  return (
    <>
      <div className="bg-gray-50 py-3">
        <div className="mx-auto max-w-7xl px-4 text-xs text-gray-500">
          <Link href={HOME_ROUTE} className="transition hover:text-primary">
            Trang Chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">{catalogContext.title}</span>
        </div>
      </div>

      <section className="relative mx-auto w-full max-w-7xl overflow-hidden px-4">
        <picture className="block">
          <source media="(min-width: 768px)" srcSet={catalogBanner.desktop} />
          <img
            src={catalogBanner.mobile}
            alt={`Banner ${catalogContext.title}`}
            className="block h-auto w-full rounded-xl"
          />
        </picture>
      </section>

      <CollectionCatalog
        key={catalogStateKey}
        initialPage={initialPage}
        initialPriceRange={initialPriceRange}
        routeCategory={catalogContext.routeCategory}
        initialSubcategory={initialSubcategory}
        products={products}
        subcategoryOptions={catalogContext.subcategoryOptions}
        title={catalogContext.title}
      />
    </>
  );
}
