import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionCatalog from "@/components/catalog/CollectionCatalog";
import { Breadcrumbs } from "@/components/static/StaticPageShell";
import {
  CATALOG_PAGE_SIZE,
  type CatalogFilterOption,
  getCatalogRouteCategory,
  getCatalogBanner,
  getProductFeaturedCatalog,
  sanitizeCatalogPage,
  sanitizeCatalogPriceRange,
  sanitizeCatalogSubcategoryValue
} from "@/lib/catalog";
import {
  findCategoryBySlug,
  findProductCatalog
} from "@/lib/product-db";
import type { CategoryCatalogRecord } from "@/lib/product-types";
import { HOME_ROUTE } from "@/lib/routes";
import { formatParamString } from "@/lib/utils";

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
  productFeatured: string;
  routeCategory: string;
  subcategoryOptions: CatalogFilterOption[];
  title: string;
};

async function resolveCategoryPageContext(routeCategory: string): Promise<CategoryPageContext | null> {
  const featuredCatalog = getProductFeaturedCatalog(routeCategory);
  if (featuredCatalog) {
    return {
      productCategory: "",
      productFeatured: featuredCatalog.featured,
      routeCategory,
      subcategoryOptions: getSubcategoryOptions(),
      title: featuredCatalog.title
    };
  }

  const category = await findCategoryBySlug(routeCategory);
  if (!category) {
    return null;
  }

  return {
    productCategory: category.slug,
    productFeatured: "",
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

  const paramsValue = await searchParams;
  const initialSubcategory = sanitizeCatalogSubcategoryValue(
    catalogContext.subcategoryOptions,
    formatParamString(paramsValue.subcategory)
  );
  const initialPriceRange = sanitizeCatalogPriceRange(formatParamString(paramsValue.price));
  const initialPage = sanitizeCatalogPage(formatParamString(paramsValue.page));
  const catalogResult = await findProductCatalog({
    category: initialSubcategory,
    featured: catalogContext.productFeatured,
    page: initialPage,
    parentCategory: catalogContext.productCategory,
    pageSize: CATALOG_PAGE_SIZE,
    priceRange: initialPriceRange
  });
  const catalogStateKey = [
    catalogContext.routeCategory,
    initialSubcategory,
    initialPriceRange,
    catalogResult.pageInfo.currentPage
  ].join("|");
  const catalogBanner = getCatalogBanner(catalogContext.productCategory);

  return (
    <>
      <Breadcrumbs
        items={[
          { href: HOME_ROUTE, label: "Trang Chủ" },
          { label: catalogContext.title }
        ]}
      />

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
        catalogResult={catalogResult}
        initialPage={catalogResult.pageInfo.currentPage}
        initialPriceRange={initialPriceRange}
        routeCategory={catalogContext.routeCategory}
        initialSubcategory={initialSubcategory}
        subcategoryOptions={catalogContext.subcategoryOptions}
        title={catalogContext.title}
      />
    </>
  );
}
