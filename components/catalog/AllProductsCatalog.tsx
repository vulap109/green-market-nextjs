"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/catalog/ProductCard";
import {
  ALL_PRODUCTS_PAGE_SIZE,
  buildAllProductsUrl,
  catalogPriceFilters,
  resolveCatalogContext
} from "@/lib/catalog";
import { queryProducts } from "@/lib/products";
import type { ProductRecord } from "@/lib/types";

type AllProductsCatalogProps = Readonly<{
  initialKeyword: string;
  initialPage: number;
  initialPriceRange: string;
  initialQuery: string;
  initialSubcategory: string;
  products: ProductRecord[];
  title: string;
}>;

type CatalogUrlState = {
  keyword: string;
  page: number;
  priceRange: string;
  queryValue: string;
  subcategory: string;
};

function FilterOptionButton({
  active,
  label,
  onClick
}: Readonly<{
  active: boolean;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 text-left text-xs font-bold transition ${
        active ? "text-primary" : "text-gray-600 hover:text-primary"
      }`}
    >
      <span
        className={`grid h-[1.15em] w-[1.15em] place-content-center rounded-[0.15em] border transition ${
          active ? "border-primary bg-primary" : "border-gray-300 bg-white"
        }`}
      >
        <span
          className={`h-[0.65em] w-[0.65em] bg-white transition-transform [clip-path:polygon(14%_44%,0_65%,50%_100%,100%_16%,80%_0%,43%_62%)] ${
            active ? "scale-100" : "scale-0"
          }`}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}

function buildVisiblePages(currentPage: number, totalPages: number): number[] {
  const maxVisiblePages = 5;
  const middleOffset = Math.floor(maxVisiblePages / 2);
  let startPage = Math.max(1, currentPage - middleOffset);
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
}

export default function AllProductsCatalog({
  initialKeyword,
  initialPage,
  initialPriceRange,
  initialQuery,
  initialSubcategory,
  products,
  title
}: AllProductsCatalogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [queryValue, setQueryValue] = useState(initialQuery);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [subcategory, setSubcategory] = useState(initialSubcategory);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [page, setPage] = useState(initialPage);
  const productListRef = useRef<HTMLDivElement | null>(null);
  const catalogContext = useMemo(
    () => resolveCatalogContext(queryValue, keyword),
    [keyword, queryValue]
  );
  const catalogResult = useMemo(
    () =>
      queryProducts(products, {
        category: catalogContext.category,
        ids: catalogContext.ids,
        keyword,
        limit: ALL_PRODUCTS_PAGE_SIZE,
        page,
        priceRange,
        subcategory
      }),
    [catalogContext.category, catalogContext.ids, keyword, page, priceRange, products, subcategory]
  );
  const visiblePages = useMemo(
    () => buildVisiblePages(catalogResult.pageInfo.currentPage, catalogResult.pageInfo.totalPages),
    [catalogResult.pageInfo.currentPage, catalogResult.pageInfo.totalPages]
  );
  const firstVisibleItem = catalogResult.pageInfo.totalProducts
    ? (catalogResult.pageInfo.currentPage - 1) * catalogResult.pageInfo.pageSize + 1
    : 0;
  const lastVisibleItem = catalogResult.pageInfo.totalProducts
    ? Math.min(
        catalogResult.pageInfo.currentPage * catalogResult.pageInfo.pageSize,
        catalogResult.pageInfo.totalProducts
      )
    : 0;

  function updateCatalogState(
    nextState: Partial<CatalogUrlState>,
    options: Readonly<{ replace?: boolean; scrollToList?: boolean }> = {}
  ) {
    const resolvedState: CatalogUrlState = {
      keyword,
      page,
      priceRange,
      queryValue,
      subcategory,
      ...nextState
    };
    const nextUrl = buildAllProductsUrl({
      keyword: resolvedState.keyword,
      page: resolvedState.page,
      priceRange: resolvedState.priceRange,
      q: resolvedState.queryValue,
      subcategory: resolvedState.subcategory
    });
    const currentUrl = buildAllProductsUrl({
      keyword,
      page,
      priceRange,
      q: queryValue,
      subcategory
    });

    setQueryValue(resolvedState.queryValue);
    setKeyword(resolvedState.keyword);
    setSubcategory(resolvedState.subcategory);
    setPriceRange(resolvedState.priceRange);
    setPage(resolvedState.page);

    if (nextUrl !== currentUrl) {
      startTransition(() => {
        if (options.replace) {
          router.replace(nextUrl, { scroll: false });
          return;
        }

        router.push(nextUrl, { scroll: false });
      });
    }

    if (options.scrollToList) {
      requestAnimationFrame(() => {
        productListRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    }
  }

  function toggleMobileFilters() {
    if (window.innerWidth >= 1024) {
      return;
    }

    setIsMobileFilterOpen((currentValue) => !currentValue);
  }

  return (
    <div className="bg-gray-50 pb-20">
      <div className="mx-auto flex max-w-7xl flex-col px-4 lg:flex-row lg:gap-8">
        <div className="w-full flex-shrink-0 pt-4 lg:w-64">
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm lg:sticky lg:top-32">
            <button
              type="button"
              className="flex w-full items-center justify-between border-b border-gray-100 px-6 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-gray-900 transition hover:text-primary lg:cursor-default"
              aria-controls="catalog-filter-panel"
              aria-expanded={isMobileFilterOpen}
              onClick={toggleMobileFilters}
            >
              <span>Bộ lọc</span>
              <span className="lg:hidden">
                <i
                  className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${
                    isMobileFilterOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </span>
            </button>

            <div
              id="catalog-filter-panel"
              className={`grid transition-[grid-template-rows,opacity,visibility] duration-300 lg:block ${
                isMobileFilterOpen
                  ? "visible grid-rows-[1fr] opacity-100"
                  : "invisible grid-rows-[0fr] opacity-0 pointer-events-none lg:visible lg:opacity-100 lg:pointer-events-auto"
              }`}
            >
              <div className="overflow-hidden px-6 lg:overflow-visible">
                <ul className="space-y-3 pb-2 pt-2 text-xs font-bold text-gray-600">
                  {catalogContext.subcategoryOptions.map((option) => (
                    <li key={option.value || "all-products"}>
                      <FilterOptionButton
                        active={subcategory === option.value}
                        label={option.label}
                        onClick={() => updateCatalogState({ page: 1, subcategory: option.value })}
                      />
                    </li>
                  ))}
                </ul>

                <h2 className="border-b border-gray-100 pb-2 pt-4 text-sm font-semibold uppercase tracking-[0.24em] text-gray-900">
                  Khoảng giá
                </h2>
                <ul className="mb-6 space-y-3 pt-2 text-xs font-bold text-gray-600">
                  {catalogPriceFilters.map((option) => (
                    <li key={option.value || "all-price"}>
                      <FilterOptionButton
                        active={priceRange === option.value}
                        label={option.label}
                        onClick={() => updateCatalogState({ page: 1, priceRange: option.value })}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1" ref={productListRef}>
          <div className="my-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-black">{title}</h1>
              <p className="mt-1 text-xs text-black/65">
                {catalogResult.pageInfo.totalProducts
                  ? `Hiển thị ${firstVisibleItem}-${lastVisibleItem} / ${catalogResult.pageInfo.totalProducts} sản phẩm`
                  : "Không tìm thấy sản phẩm phù hợp."}
              </p>
            </div>

            <select
              defaultValue="newest"
              disabled
              aria-label="Sắp xếp sản phẩm"
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-500 outline-none disabled:opacity-100 sm:w-auto"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Theo mức độ phổ biến</option>
              <option value="rating">Theo điểm đánh giá</option>
              <option value="price-asc">Theo giá: thấp đến cao</option>
              <option value="price-desc">Theo giá: cao xuống thấp</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
            {catalogResult.items.length ? (
              catalogResult.items.map((product) => (
                <ProductCard key={String(product.id ?? product.Id ?? product.slug)} product={product} />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
                Không tìm thấy sản phẩm phù hợp.
              </div>
            )}
          </div>

          {catalogResult.pageInfo.totalPages > 0 ? (
            <div className="flex justify-center gap-3 pb-10 pt-12">
              <button
                type="button"
                disabled={catalogResult.pageInfo.currentPage === 1 || isPending}
                onClick={() =>
                  updateCatalogState(
                    { page: catalogResult.pageInfo.currentPage - 1 },
                    { scrollToList: true }
                  )
                }
                className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold transition-all ${
                  catalogResult.pageInfo.currentPage === 1 || isPending
                    ? "cursor-not-allowed bg-gray-100 text-gray-300"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:bg-gray-50 hover:text-primary"
                }`}
                aria-label="Trang trước"
              >
                <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
              </button>

              {visiblePages[0] > 1 ? (
                <span className="flex h-10 w-10 cursor-default items-center justify-center rounded-lg bg-transparent font-bold text-gray-400">
                  ...
                </span>
              ) : null}

              {visiblePages.map((visiblePage) => {
                const isActive = visiblePage === catalogResult.pageInfo.currentPage;

                return (
                  <button
                    key={visiblePage}
                    type="button"
                    disabled={isActive || isPending}
                    onClick={() => updateCatalogState({ page: visiblePage }, { scrollToList: true })}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:bg-gray-50 hover:text-primary"
                    } ${isPending && !isActive ? "opacity-70" : ""}`}
                  >
                    {visiblePage}
                  </button>
                );
              })}

              {visiblePages[visiblePages.length - 1] < catalogResult.pageInfo.totalPages ? (
                <span className="flex h-10 w-10 cursor-default items-center justify-center rounded-lg bg-transparent font-bold text-gray-400">
                  ...
                </span>
              ) : null}

              <button
                type="button"
                disabled={
                  catalogResult.pageInfo.currentPage === catalogResult.pageInfo.totalPages || isPending
                }
                onClick={() =>
                  updateCatalogState(
                    { page: catalogResult.pageInfo.currentPage + 1 },
                    { scrollToList: true }
                  )
                }
                className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold transition-all ${
                  catalogResult.pageInfo.currentPage === catalogResult.pageInfo.totalPages || isPending
                    ? "cursor-not-allowed bg-gray-100 text-gray-300"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-primary hover:bg-gray-50 hover:text-primary"
                }`}
                aria-label="Trang sau"
              >
                <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
