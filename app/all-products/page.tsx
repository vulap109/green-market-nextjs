import type { Metadata } from "next";
import Link from "next/link";
import AllProductsCatalog from "@/components/catalog/AllProductsCatalog";
import {
  getSearchParamValue,
  resolveCatalogContext,
  sanitizeCatalogPage,
  sanitizeCatalogPriceRange,
  sanitizeCatalogSubcategory
} from "@/lib/catalog";
import { getProductsData } from "@/lib/data";
import { HOME_ROUTE } from "@/lib/routes";

type AllProductsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export async function generateMetadata({
  searchParams
}: AllProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const queryValue = getSearchParamValue(params.q);
  const keyword = getSearchParamValue(params.keyword);
  const catalogContext = resolveCatalogContext(queryValue, keyword);

  return {
    title: catalogContext.title
  };
}

export default async function AllProductsPage({ searchParams }: AllProductsPageProps) {
  const params = await searchParams;
  const products = await getProductsData();
  const queryValue = getSearchParamValue(params.q).toLowerCase();
  const keyword = getSearchParamValue(params.keyword);
  const catalogContext = resolveCatalogContext(queryValue, keyword);
  const initialSubcategory = sanitizeCatalogSubcategory(
    catalogContext.category,
    getSearchParamValue(params.subcategory)
  );
  const initialPriceRange = sanitizeCatalogPriceRange(getSearchParamValue(params.price));
  const initialPage = sanitizeCatalogPage(getSearchParamValue(params.page));
  const catalogStateKey = [
    catalogContext.query,
    keyword,
    initialSubcategory,
    initialPriceRange,
    initialPage
  ].join("|");

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
          <source media="(min-width: 768px)" srcSet={catalogContext.banner.desktop} />
          <img
            src={catalogContext.banner.mobile}
            alt={`Banner ${catalogContext.title}`}
            className="block h-auto w-full rounded-xl"
          />
        </picture>
      </section>

      <AllProductsCatalog
        key={catalogStateKey}
        initialKeyword={keyword}
        initialPage={initialPage}
        initialPriceRange={initialPriceRange}
        initialQuery={catalogContext.query}
        initialSubcategory={initialSubcategory}
        products={products}
        title={catalogContext.title}
      />
    </>
  );
}
