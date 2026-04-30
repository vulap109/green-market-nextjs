"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import productsData from "@/public/data/products.json";
import { resolveAssetPath } from "@/lib/assets";
import { CART_UPDATED_EVENT, getCart, getCartCount } from "@/lib/cart";
import { buildCollectionUrl } from "@/lib/catalog";
import { formatProductMoney } from "@/lib/format";
import {
  buildProductDetailUrl,
  CART_ROUTE,
  HOME_ROUTE
} from "@/lib/routes";
import { getProductFinalPrice, getProductId } from "@/lib/products";
import { buildProductSearchUrl, filterProductsByKeyword } from "@/lib/search";
import type { ProductRecord } from "@/lib/types";

type HeaderMenuItem = {
  href: string;
  label: string;
  iconClassName: string;
  itemClassName: string;
  iconWrapperClassName: string;
  arrowHoverClassName: string;
  badge?: string;
};

const headerMenuItems: HeaderMenuItem[] = [
  {
    href: buildCollectionUrl({ category: "ban-chay" }),
    label: "Sản phẩm bán chạy",
    iconClassName: "fa-solid fa-bolt",
    itemClassName: "hover:border-red-100 hover:bg-red-50/80 hover:text-red-600",
    iconWrapperClassName: "bg-red-50 text-red-500 group-hover:bg-white",
    arrowHoverClassName: "group-hover:text-red-500"
  },
  {
    href: buildCollectionUrl({ category: "fruit-basket" }),
    label: "Giỏ quà trái cây",
    iconClassName: "fa-solid fa-gift",
    itemClassName: "hover:border-green-100 hover:bg-green-50/80 hover:text-primary",
    iconWrapperClassName: "bg-green-50 text-primary group-hover:bg-white",
    arrowHoverClassName: "group-hover:text-primary"
  },
  {
    href: buildCollectionUrl({ category: "imported-fruits" }),
    label: "Trái cây nhập khẩu",
    iconClassName: "fa-solid fa-apple-whole",
    itemClassName: "hover:border-emerald-100 hover:bg-emerald-50/80 hover:text-emerald-700",
    iconWrapperClassName: "bg-emerald-50 text-emerald-600 group-hover:bg-white",
    arrowHoverClassName: "group-hover:text-emerald-600"
  },
  {
    href: buildCollectionUrl({ category: "cream-cake" }),
    label: "Bánh kem thiết kế",
    iconClassName: "fa-solid fa-cake-candles",
    itemClassName: "hover:border-amber-100 hover:bg-amber-50/80 hover:text-amber-700",
    iconWrapperClassName: "bg-amber-50 text-amber-600 group-hover:bg-white",
    arrowHoverClassName: "group-hover:text-amber-600",
    badge: "New"
  },
  {
    href: buildCollectionUrl({ category: "flowers" }),
    label: "Hoa tươi nghệ thuật",
    iconClassName: "fa-solid fa-spa",
    itemClassName: "hover:border-pink-100 hover:bg-pink-50/80 hover:text-pink-600",
    iconWrapperClassName: "bg-pink-50 text-pink-500 group-hover:bg-white",
    arrowHoverClassName: "group-hover:text-pink-500"
  }
];

const productSearchData = productsData as ProductRecord[];

export default function AppHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const searchResults = filterProductsByKeyword(productSearchData, searchKeyword, 4);
  const hasKeyword = searchKeyword.trim().length > 0;

  useEffect(() => {
    function syncCartCount() {
      setCartCount(getCartCount(getCart()));
    }

    function syncSearchKeyword() {
      setSearchKeyword(new URLSearchParams(window.location.search).get("keyword") || "");
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!searchWrapperRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
    }

    syncCartCount();
    syncSearchKeyword();

    window.addEventListener(CART_UPDATED_EVENT, syncCartCount);
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("popstate", syncSearchKeyword);
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCartCount);
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("popstate", syncSearchKeyword);
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [isMenuOpen]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildProductSearchUrl(searchKeyword));
    setIsSearchOpen(false);
  }

  return (
    <header className="border-b border-gray-100 bg-white shadow-sm">
      <div className="bg-[#004e29] px-4 py-2 text-[11px] font-bold text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex gap-6">
            <span>
              <i className="fa-solid fa-phone mr-1"></i> Hotline:{" "}
              <a href="tel:0973074063">0973 074 063</a>
            </span>
            <span>
              <i className="fa-solid fa-truck mr-1"></i> Giao hàng trong ngày - Đặt trước 14h
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              <i className="fa-solid fa-location-dot mr-1"></i> TP. Hồ Chí Minh
            </span>
            <span className="border-l border-white/20 pl-4 uppercase">VI | EN</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:py-0 md:h-24 md:flex-nowrap">
        <div id="mobile-header-menu-wrap" className="relative z-30 flex items-center gap-3">
          <button
            id="header-menu-mobile-toggle"
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-primary hover:text-primary lg:hidden"
            aria-label={isMenuOpen ? "Đóng danh mục sản phẩm" : "Mở danh mục sản phẩm"}
            aria-controls="header-category-menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <i id="header-menu-mobile-close-icon" className="fa-solid fa-xmark text-lg"></i>
            ) : (
              <i id="header-menu-mobile-open-icon" className="fa-solid fa-bars text-base"></i>
            )}
          </button>

          <Link href={HOME_ROUTE} className="group flex items-center">
            <div className="rounded-lg p-2 transition-all duration-500 group-hover:rotate-[360deg]">
              <Image src="/images/logo_1.png" alt="Green Market" width={45} height={45} />
            </div>
            <div className="leading-none">
              <Image src="/images/logo_2.png" alt="Green Market" width={78} height={45} />
            </div>
          </Link>

          <button
            id="header-menu-desktop-toggle"
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="hidden h-12 items-center gap-3 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#004e29] lg:inline-flex"
            aria-label={isMenuOpen ? "Đóng danh mục sản phẩm" : "Mở danh mục sản phẩm"}
            aria-controls="header-category-menu"
            aria-expanded={isMenuOpen}
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              {isMenuOpen ? (
                <i id="header-menu-desktop-close-icon" className="fa-solid fa-xmark text-base"></i>
              ) : (
                <i id="header-menu-desktop-open-icon" className="fa-solid fa-bars-staggered text-sm"></i>
              )}
            </span>
            <span>Danh mục</span>
          </button>

          <div
            id="header-category-menu"
            className={`absolute left-0 top-[calc(100%+0.75rem)] z-30 w-[min(92vw,340px)] max-w-[calc(100vw-2rem)] origin-top-left rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl shadow-black/10 transition duration-200 ${isMenuOpen
                ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
                : "pointer-events-none invisible -translate-y-2 scale-95 opacity-0"
              }`}
          >
            <nav className="flex flex-col gap-1.5">
              {headerMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`group flex items-center gap-4 rounded-2xl border border-transparent px-4 text-sm font-semibold text-gray-700 transition ${item.itemClassName}`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${item.iconWrapperClassName}`}
                  >
                    <i className={item.iconClassName}></i>
                  </span>
                  <span className="flex-1">
                    {item.label}
                    {item.badge ? (
                      <span className="ml-1 rounded bg-red-500 pl-1 pr-2 italic font-semibold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                  <i
                    className={`fa-solid fa-angle-right text-xs text-gray-400 transition ${item.arrowHoverClassName}`}
                  ></i>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div
          id="header-product-search"
          ref={searchWrapperRef}
          className="order-3 w-full md:order-none md:flex-1 lg:max-w-xl"
        >
          <form id="header-product-search-form" onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50/90 px-4 py-2 shadow-sm transition focus-within:border-primary focus-within:bg-white focus-within:shadow-md">
              <i className="fa-solid fa-magnifying-glass text-sm text-gray-400"></i>
              <input
                id="header-product-search-input"
                type="search"
                value={searchKeyword}
                onChange={(event) => {
                  setSearchKeyword(event.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Tìm sản phẩm theo tên..."
                className="min-w-0 flex-1 bg-transparent text-base text-gray-700 outline-none placeholder:text-gray-400 sm:text-sm"
                autoComplete="off"
                aria-label="Tìm sản phẩm"
                aria-controls="header-product-search-dropdown"
              />
            </div>

            {isSearchOpen && hasKeyword ? (
              <div
                id="header-product-search-dropdown"
                className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-40 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-black/10"
              >
                <div id="header-product-search-results" className="max-h-[320px] overflow-y-auto">
                  {searchResults.length ? (
                    searchResults.map((product) => {
                      const imageSrc = resolveAssetPath(product.img) || "/images/sp1.jpg";
                      const productName = product.name || "Sản phẩm";
                      const price = formatProductMoney(getProductFinalPrice(product));
                      const productId = getProductId(product);

                      return (
                        <Link
                          key={productId || String(product.slug)}
                          href={buildProductDetailUrl({
                            slug: product.slug,
                            id: productId
                          })}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
                        >
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                            <Image
                              src={imageSrc}
                              alt={productName}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-gray-800">
                              {productName}
                            </span>
                            <span className="mt-1 block text-xs font-bold text-primary">{price}</span>
                          </span>
                        </Link>
                      );
                    })
                  ) : (
                    <p id="header-product-search-empty" className="px-4 py-5 text-sm text-gray-500">
                      Không tìm thấy sản phẩm phù hợp.
                    </p>
                  )}
                </div>
                <Link
                  id="header-product-search-view-all"
                  href={buildProductSearchUrl(searchKeyword)}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-primary transition hover:bg-green-50"
                >
                  <span>Xem tất cả</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            ) : null}
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-4 md:gap-6">
          <button
            type="button"
            onClick={() => window.alert("Mở tài khoản")}
            className="flex items-center gap-2 transition hover:text-primary"
          >
            <i className="fa-regular fa-user text-xl"></i>
            <span className="hidden text-xs font-bold uppercase md:block">Tài khoản</span>
          </button>

          <Link href={CART_ROUTE} className="relative flex items-center gap-2 transition hover:text-primary">
            <i className="fa-solid fa-basket-shopping text-2xl"></i>
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
            <span className="hidden text-xs font-bold uppercase md:block">Giỏ hàng</span>
          </Link>
        </div>
      </div>

      <button
        type="button"
        aria-label="Đóng danh mục sản phẩm"
        aria-hidden={!isMenuOpen}
        tabIndex={isMenuOpen ? 0 : -1}
        className={`fixed inset-0 z-20 h-screen bg-slate-950/35 backdrop-blur-[2px] transition duration-200 ${isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={() => setIsMenuOpen(false)}
      />
    </header>
  );
}
