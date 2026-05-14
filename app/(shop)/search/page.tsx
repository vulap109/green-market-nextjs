import type { Metadata } from "next";
import CollectionCatalog from "@/components/catalog/CollectionCatalog";
import { Breadcrumbs } from "@/components/static/StaticPageShell";
import {
  CATALOG_PAGE_SIZE,
  sanitizeCatalogPage,
  sanitizeCatalogPriceRange
} from "@/lib/catalog";
import { findProductCatalog } from "@/lib/product-db";
import { HOME_ROUTE } from "@/lib/routes";
import { formatParamString } from "@/lib/utils";

type SearchPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function getSearchTitle(keyword: string): string {
  return keyword ? `Kết quả tìm kiếm: ${keyword}` : "Tìm kiếm sản phẩm";
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const paramsValue = await searchParams;
  const keyword = formatParamString(paramsValue.keyword);

  return {
    title: getSearchTitle(keyword)
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const paramsValue = await searchParams;
  const keyword = formatParamString(paramsValue.keyword);
  const initialPriceRange = sanitizeCatalogPriceRange(formatParamString(paramsValue.price));
  const initialPage = sanitizeCatalogPage(formatParamString(paramsValue.page));
  const catalogResult = await findProductCatalog({
    keyword,
    page: initialPage,
    pageSize: CATALOG_PAGE_SIZE,
    priceRange: initialPriceRange
  });
  const title = getSearchTitle(keyword);
  const catalogStateKey = [
    "search",
    keyword,
    initialPriceRange,
    catalogResult.pageInfo.currentPage
  ].join("|");

  return (
    <>
      <Breadcrumbs
        items={[
          { href: HOME_ROUTE, label: "Trang Chủ" },
          { label: "Tìm kiếm" }
        ]}
      />

      <CollectionCatalog
        key={catalogStateKey}
        catalogMode="search"
        catalogResult={catalogResult}
        initialPage={catalogResult.pageInfo.currentPage}
        initialPriceRange={initialPriceRange}
        routeCategory=""
        searchKeyword={keyword}
        initialSubcategory=""
        subcategoryOptions={[]}
        title={title}
      />
    </>
  );
}
