"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Breadcrumbs } from "@/components/static/StaticPageShell";
import {
  CART_KEY,
  CART_UPDATED_EVENT,
  getCartCount,
  removeFromCart,
  resolveCartItems,
  updateCartQty
} from "@/lib/cart";
import {
  getBrowserReadySnapshot,
  getLocalStorageSnapshot,
  getServerReadySnapshot,
  subscribeNoop,
  subscribeWindowEvents
} from "@/lib/browser-store";
import { formatMoney } from "@/lib/utils";
import { CHECKOUT_ROUTE, HOME_ROUTE } from "@/lib/routes";
import type { ProductRecord } from "@/lib/product-types";
import type { CartItem } from "@/lib/types";

type CartPageClientProps = Readonly<{
  products: ProductRecord[];
}>;

type FeedbackState = {
  tone: "error" | "success";
  text: string;
};

function parseCartSnapshot(snapshot: string): CartItem[] {
  try {
    const parsed = JSON.parse(snapshot || "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch (error) {
    console.error("Invalid cart snapshot:", error);
    return [];
  }
}

export default function CartPageClient({ products }: CartPageClientProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const isHydrated = useSyncExternalStore(subscribeNoop, getBrowserReadySnapshot, getServerReadySnapshot);
  const cartSnapshot = useSyncExternalStore(
    (callback) => subscribeWindowEvents([CART_UPDATED_EVENT, "storage"], callback),
    () => getLocalStorageSnapshot(CART_KEY, "[]"),
    () => "[]"
  );
  const cart = useMemo(() => parseCartSnapshot(cartSnapshot), [cartSnapshot]);
  const resolvedItems = useMemo(() => resolveCartItems(products, cart), [cart, products]);
  const itemCount = getCartCount(cart);
  const orderTotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  function setSuccessFeedback(text: string) {
    setFeedback({
      text,
      tone: "success"
    });
  }

  function setErrorFeedback(text: string) {
    setFeedback({
      text,
      tone: "error"
    });
  }

  function handleQtyChange(id: string, size: string, change: number) {
    const currentItem = cart.find(
      (item) => String(item.id) === String(id) && String(item.size || "") === String(size || "")
    );

    if (!currentItem) {
      return;
    }

    const nextQty = (Number(currentItem.qty) || 0) + change;
    if (nextQty < 1) {
      return;
    }

    updateCartQty(id, nextQty, size);
  }

  function handleRemove(id: string, size: string) {
    const confirmed = window.confirm("Bạn có chắc muốn bỏ sản phẩm này khỏi giỏ hàng?");
    if (!confirmed) {
      return;
    }

    removeFromCart(id, size);
    setSuccessFeedback("Đã xóa sản phẩm.");
  }

  async function handleCopyPromo(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setSuccessFeedback(`Đã sao chép mã: ${code}`);
    } catch (error) {
      console.error("copy promo failed:", error);
      setErrorFeedback("Không sao chép được mã khuyến mãi.");
    }
  }

  function handleCheckout() {
    if (itemCount <= 0) {
      setErrorFeedback("Giỏ hàng đang trống, vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }

    router.push(CHECKOUT_ROUTE);
  }

  return (
    <>
      {feedback ? (
        <div
          className={`fixed right-4 top-24 z-[150] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-2xl ${
            feedback.tone === "success" ? "bg-[#0d6b38]" : "bg-[#ed1b24]"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <Breadcrumbs
        items={[
          { href: HOME_ROUTE, label: "Trang Chủ" },
          { label: "Giỏ Hàng" }
        ]}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8">
        <div className="mb-6 flex flex-col items-end justify-between gap-2 border-b border-gray-200 pb-4 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
          <p className="mt-2 text-sm text-gray-500 md:mt-0">
            Bạn đang có <span className="font-bold text-black">{itemCount}</span> sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full space-y-6 lg:w-2/3">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              {!isHydrated ? (
                <div className="p-10 text-center text-gray-400">
                  <div className="mb-3 inline-flex justify-center">
                    <i className="fa-solid fa-spinner animate-spin text-2xl" aria-hidden="true" />
                  </div>
                  <p className="text-sm">Đang tải giỏ hàng...</p>
                </div>
              ) : resolvedItems.length ? (
                resolvedItems.map((item) => (
                  <article key={item.key} className="relative flex border-b border-gray-100 p-4 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, item.size)}
                      className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 text-[10px] text-white transition-colors hover:bg-red-500"
                      aria-label="Xóa sản phẩm"
                    >
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>

                    <Link href={item.productHref} className="relative ml-1 mt-1 block h-24 w-24 flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="rounded border border-gray-100 object-cover"
                      />
                    </Link>

                    <div className="ml-4 flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={item.productHref}
                            className="line-clamp-2 text-sm font-semibold text-gray-800 transition hover:text-primary"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-xs text-gray-500">{item.sku}</p>
                          {item.size ? (
                            <p className="mt-1 text-xs font-medium text-primary">Phân loại: {item.size}</p>
                          ) : null}
                          <p className="mt-1 text-xs font-medium text-gray-500">
                            {formatMoney(item.unitPrice)}
                          </p>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <p className="font-bold text-gray-900">{formatMoney(item.lineTotal)}</p>

                          <div className="ml-auto mt-3 flex w-[110px] items-center overflow-hidden rounded border border-gray-200">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.size, -1)}
                              className="flex h-8 w-16 items-center justify-center bg-gray-50 font-bold text-gray-600 transition-colors hover:bg-gray-100"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={item.qty}
                              readOnly
                              className="h-8 w-full bg-white text-center text-sm font-semibold focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item.id, item.size, 1)}
                              className="flex h-8 w-16 items-center justify-center bg-gray-50 font-bold text-gray-600 transition-colors hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="p-10 text-center text-gray-500">
                  <div className="mb-3 inline-flex justify-center">
                    <i className="fa-solid fa-cart-shopping text-4xl text-gray-300" aria-hidden="true" />
                  </div>
                  <p className="font-semibold text-gray-700">Giỏ hàng của bạn đang trống</p>
                  <p className="mt-1 text-sm">Hãy chọn thêm sản phẩm để tiếp tục mua sắm.</p>
                  <Link
                    href={HOME_ROUTE}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
                    Tiếp tục mua hàng
                  </Link>
                </div>
              )}
            </div>

            <div className="group flex w-max cursor-pointer items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-white transition-colors group-hover:border-primary">
                <i className="fa-solid fa-check text-[10px] opacity-0" aria-hidden="true" />
              </div>
              <span className="select-none text-sm font-medium text-gray-700">Xuất hóa đơn cho đơn hàng</span>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <label className="mb-2 block text-sm font-semibold text-gray-800">Ghi chú đơn hàng</label>
              <textarea
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                placeholder="Ghi chú về việc giao hàng, xuất hóa đơn..."
              />
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-bold text-gray-800">
                  Thông tin đơn hàng
                </h2>
                <div className="mb-4 flex items-end justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm font-semibold text-gray-700">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-[#ed1b24]">{formatMoney(orderTotal)}</span>
                </div>
                <ul className="mb-6 list-disc space-y-1 pl-4 text-xs text-gray-500">
                  <li>Phí vận chuyển sẽ được tính ở trang thanh toán.</li>
                </ul>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={itemCount === 0}
                  className="w-full rounded bg-[#ed1b24] py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Thanh toán
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-800">Khuyến mãi dành cho bạn</h2>
                  <div className="flex gap-2 text-gray-400">
                    <button type="button" className="transition-colors hover:text-black" aria-label="Khuyến mãi trước">
                      <i className="fa-solid fa-arrow-left-long" aria-hidden="true" />
                    </button>
                    <button type="button" className="transition-colors hover:text-black" aria-label="Khuyến mãi tiếp theo">
                      <i className="fa-solid fa-arrow-right-long" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="relative flex gap-3 overflow-hidden rounded-lg border border-gray-200 p-3">
                  <div className="absolute bottom-0 left-[60px] top-0 border-l border-dashed border-gray-200" />
                  <div className="flex w-12 flex-shrink-0 items-center justify-center text-[#ed1b24]">
                    <i className="fa-solid fa-truck-fast text-3xl" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-gray-800">Miễn phí vận chuyển</h3>
                      <i
                        className="fa-solid fa-circle-info cursor-pointer text-xs text-gray-400"
                        title="Chi tiết điều kiện"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-500">Đơn hàng từ 599K, giảm tối đa 20K</p>

                    <div className="mt-3 flex items-end justify-between">
                      <div className="text-[10px] text-gray-500">
                        <p>
                          Mã: <strong className="text-gray-700">FREESHIP20K2026T3</strong>
                        </p>
                        <p>HSD: 31/03/2026</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPromo("FREESHIP20K2026T3")}
                        className="rounded-full bg-black px-3 py-1.5 text-[9px] font-bold uppercase text-white transition-colors hover:bg-gray-800"
                      >
                        Sao chép mã
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
