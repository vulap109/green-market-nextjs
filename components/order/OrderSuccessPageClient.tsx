"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  getBrowserReadySnapshot,
  getLocalStorageSnapshot,
  getServerReadySnapshot,
  subscribeNoop,
  subscribeWindowEvents
} from "@/lib/browser-store";
import { formatProductMoney, getPaymentMethodLabel } from "@/lib/format";
import {
  BANK_TRANSFER_INFO,
  buildBankTransferContent,
  buildVietQrImageUrl,
  formatOrderDate,
  getPaymentMethodNote,
  ORDER_SUCCESS_STORAGE_KEY,
  ORDER_SUCCESS_UPDATED_EVENT
} from "@/lib/order";
import { ALL_PRODUCTS_ROUTE, CART_ROUTE, HOME_ROUTE } from "@/lib/routes";
import type { CheckoutOrder } from "@/lib/types";

type FeedbackState = {
  tone: "error" | "success";
  text: string;
};

type OrderSuccessPageClientProps = Readonly<{
  expectedCode: string;
}>;

function parseOrderSnapshot(snapshot: string, expectedCode: string): CheckoutOrder | null {
  if (!snapshot) {
    return null;
  }

  try {
    const parsed = JSON.parse(snapshot) as CheckoutOrder | null;
    if (!parsed?.code) {
      return null;
    }

    if (expectedCode && parsed.code !== expectedCode) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Can not parse success order:", error);
    return null;
  }
}

export default function OrderSuccessPageClient({ expectedCode }: OrderSuccessPageClientProps) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [dismissedBankOrderCode, setDismissedBankOrderCode] = useState("");
  const [isBankModalManuallyOpen, setIsBankModalManuallyOpen] = useState(false);
  const isHydrated = useSyncExternalStore(subscribeNoop, getBrowserReadySnapshot, getServerReadySnapshot);
  const orderSnapshot = useSyncExternalStore(
    (callback) => subscribeWindowEvents([ORDER_SUCCESS_UPDATED_EVENT, "storage"], callback),
    () => getLocalStorageSnapshot(ORDER_SUCCESS_STORAGE_KEY, ""),
    () => ""
  );
  const order = useMemo(
    () => parseOrderSnapshot(orderSnapshot, expectedCode),
    [expectedCode, orderSnapshot]
  );
  const itemCount = useMemo(
    () => (order?.items || []).reduce((sum, item) => sum + (Number(item.qty) || 0), 0),
    [order]
  );
  const fullAddress = useMemo(
    () => [order?.address, order?.ward, order?.district, order?.province].filter(Boolean).join(", "),
    [order]
  );
  const bankTransferContent = buildBankTransferContent(order);
  const qrUrl = buildVietQrImageUrl(order);
  const isBankPayment = order?.paymentMethod === "bank";
  const isBankModalOpen = Boolean(
    order &&
      isBankPayment &&
      (isBankModalManuallyOpen || dismissedBankOrderCode !== order.code)
  );

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 1600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  useEffect(() => {
    if (!isBankModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsBankModalManuallyOpen(false);
        setDismissedBankOrderCode(order?.code || "");
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isBankModalOpen, order?.code]);

  async function handleCopyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback({
        text: "Đã sao chép",
        tone: "success"
      });
    } catch (error) {
      console.error("copy failed:", error);
      setFeedback({
        text: "Không sao chép được nội dung.",
        tone: "error"
      });
    }
  }

  function handleCloseBankModal() {
    setIsBankModalManuallyOpen(false);
    setDismissedBankOrderCode(order?.code || "");
  }

  function handleOpenBankModal() {
    setIsBankModalManuallyOpen(true);
  }

  if (!isHydrated) {
    return <main className="mx-auto max-w-7xl px-4 py-10 text-sm text-gray-500">Đang tải đơn hàng...</main>;
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 px-6 py-8 md:px-8">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <i className="fa-regular fa-folder-open text-xl" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-gray-400">Order Status</p>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">Không tìm thấy đơn hàng vừa đặt</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                  Trang xác nhận này chỉ hiển thị ngay sau khi đặt hàng thành công. Vui lòng quay lại cửa
                  hàng để tiếp tục mua sắm hoặc tạo đơn mới.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 px-6 py-6 md:flex-row md:px-8">
            <Link
              href={ALL_PRODUCTS_ROUTE}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
              Tiếp tục mua hàng
            </Link>
            <Link
              href={CART_ROUTE}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-primary hover:text-primary"
            >
              <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
              Quay lại giỏ hàng
            </Link>
          </div>
        </section>
      </main>
    );
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

      <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.2fr)_400px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.22),_transparent_36%),linear-gradient(135deg,_#f7fee7_0%,_#ffffff_45%,_#eff6ff_100%)] px-6 py-8 md:px-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                      <i className="fa-solid fa-check text-2xl" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">
                        Order Successful
                      </p>
                      <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                        Đặt hàng thành công
                      </h1>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                        Green Market đã nhận đơn và thông tin đã được gửi về shop. Nhân viên sẽ sớm liên hệ
                        để xác nhận trước khi giao hàng.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-3xl border border-white/70 bg-white/80 p-4 text-sm shadow-sm">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Mã đơn hàng
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">{order.code}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Thời gian đặt
                      </p>
                      <p className="mt-1 font-semibold text-gray-700">{formatOrderDate(order.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-6 py-6 md:px-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <article className="rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Khách hàng</p>
                    <p className="mt-2 text-base font-bold text-gray-900">{order.fullname}</p>
                    <p className="mt-1 text-sm font-medium text-gray-600">{order.phone}</p>
                    <p className="mt-1 text-sm text-gray-500">{order.email || "Không có email"}</p>
                  </article>

                  <article className="rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Phương thức thanh toán
                    </p>
                    <p className="mt-2 text-base font-bold text-gray-900">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{getPaymentMethodNote(order.paymentMethod)}</p>
                  </article>

                  <article className="rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Giao đến</p>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{fullAddress || "Chưa có địa chỉ"}</p>
                  </article>
                </div>

                {order.notes ? (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">
                      Ghi chú đơn hàng
                    </p>
                    <p className="mt-2 text-sm leading-6 text-amber-900">{order.notes}</p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 md:flex-row">
                  <Link
                    href={HOME_ROUTE}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
                    Tiếp tục mua hàng
                  </Link>
                  <a
                    href="tel:0973074063"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-primary hover:text-primary"
                  >
                    <i className="fa-solid fa-headset" aria-hidden="true" />
                    Gọi hỗ trợ
                  </a>
                  {isBankPayment ? (
                    <button
                      type="button"
                      onClick={handleOpenBankModal}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-6 py-3 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
                    >
                      <i className="fa-solid fa-building-columns" aria-hidden="true" />
                      Hiển thị thông tin chuyển khoản
                    </button>
                  ) : null}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm xl:sticky xl:top-8">
              <div className="border-b border-gray-100 px-6 py-5">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-gray-400">Order Summary</p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
              </div>

              <div className="space-y-4 border-b border-gray-100 px-6 py-5">
                {order.items.map((item) => (
                  <article key={`${item.id}-${item.size}`} className="flex items-start gap-4">
                    <div className="relative h-20 w-20 shrink-0">
                      <div className="absolute inset-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                        <Image
                          src={item.image || "/images/sp1.jpg"}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <span className="absolute -right-2 -top-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-gray-900 px-1.5 text-[11px] font-bold text-white shadow-sm">
                        {item.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold leading-6 text-gray-900">{item.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gray-400">
                        SKU: {item.sku || "N/A"}
                      </p>
                      {item.size ? (
                        <p className="mt-1 text-xs font-medium text-gray-500">Phân loại: {item.size}</p>
                      ) : null}
                      <p className="mt-2 text-sm text-gray-500">
                        {formatProductMoney(item.unitPrice)} x {item.qty}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-gray-900">
                      {formatProductMoney(item.lineTotal)}
                    </p>
                  </article>
                ))}
              </div>

              <div className="space-y-4 px-6 py-5">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-900">{formatProductMoney(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-gray-900">{formatProductMoney(order.shippingFee)}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tổng cộng</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {itemCount} sản phẩm
                      </p>
                    </div>
                    <p className="text-3xl font-black tracking-tight text-primary">
                      {formatProductMoney(order.total)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {isBankPayment ? (
        <div
          className={`fixed inset-0 z-[140] flex items-start justify-center overflow-y-auto p-4 transition duration-200 md:items-center ${
            isBankModalOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            aria-label="Đóng popup chuyển khoản"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={handleCloseBankModal}
          />

          <div
            className={`relative z-10 my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-2xl transition duration-200 ${
              isBankModalOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-2 md:px-8">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-600">Bank Transfer</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">Chuyển khoản ngân hàng</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseBankModal}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-lg text-gray-600 transition hover:border-primary hover:text-primary"
                aria-label="Đóng popup chuyển khoản"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>

            <div className="grid min-h-0 gap-4 overflow-y-auto p-4 md:grid-cols-[350px_minmax(0,1fr)] md:p-5">
              <section className="rounded-[28px] border border-gray-200 bg-gray-50 p-4">
                <div>
                  <p className="text-md font-semibold text-gray-900">Cách 1: Chuyển khoản bằng mã QR</p>
                  <p className="text-xs text-gray-600">Mở app ngân hàng để quét mã VietQR bên dưới.</p>
                </div>

                <div className="mt-5 rounded-[24px] border border-gray-200 bg-white py-2 text-center">
                  <Image
                    src={qrUrl}
                    alt={`Mã QR chuyển khoản ${bankTransferContent}`}
                    width={220}
                    height={220}
                    className="mx-auto aspect-square w-full max-w-[220px] object-cover"
                  />
                  <a
                    href={qrUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={`vietqr-${bankTransferContent || "green-market"}.png`}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-normal text-sky-700"
                  >
                    <i className="fa-solid fa-download" aria-hidden="true" />
                    Tải xuống
                  </a>
                  <p className="mt-4 text-xs text-gray-600">45 app ngân hàng hỗ trợ quét mã VietQR.</p>
                </div>
              </section>

              <section className="rounded-[28px] border border-gray-200 p-4">
                <p className="text-md font-semibold text-gray-900">Cách 2: Chuyển khoản thủ công theo thông tin</p>

                <div className="mt-5 overflow-hidden">
                  <div className="flex flex-wrap">
                    <span className="w-[110px] text-sm text-gray-600">Ngân hàng:</span>
                    <strong className="text-base text-gray-900">{BANK_TRANSFER_INFO.bankName}</strong>
                  </div>

                  <div className="flex flex-wrap pt-2">
                    <span className="w-[110px] text-sm text-gray-600">Chủ tài khoản:</span>
                    <strong className="break-words text-base text-gray-900">{BANK_TRANSFER_INFO.accountName}</strong>
                  </div>

                  <div className="flex flex-wrap pt-2">
                    <span className="w-[110px] text-sm text-gray-600">Số tài khoản:</span>
                    <strong className="min-w-[145px] break-all text-base text-gray-900">
                      {BANK_TRANSFER_INFO.accountNumber}
                    </strong>
                    <button
                      type="button"
                      onClick={() => handleCopyText(BANK_TRANSFER_INFO.accountNumber)}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-700 lg:ml-20"
                    >
                      Sao chép
                    </button>
                  </div>

                  <div className="flex flex-wrap pt-2">
                    <span className="w-[110px] text-sm text-gray-600">Số tiền:</span>
                    <strong className="min-w-[145px] break-all text-base text-gray-900">
                      {formatProductMoney(order.total)}
                    </strong>
                    <button
                      type="button"
                      onClick={() => handleCopyText(String(order.total))}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-700 lg:ml-20"
                    >
                      Sao chép
                    </button>
                  </div>

                  <div className="flex flex-wrap pt-2">
                    <span className="w-[110px] text-sm text-amber-800">Nội dung:</span>
                    <strong className="w-[190px] break-all text-base text-amber-950">{bankTransferContent}</strong>
                    <button
                      type="button"
                      onClick={() => handleCopyText(bankTransferContent)}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-700 lg:ml-9"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm leading-7 text-gray-700">
                    Lưu ý: Nhập chính xác nội dung{" "}
                    <strong className="font-bold text-gray-900">{bankTransferContent}</strong> khi chuyển khoản.
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p className="flex items-start gap-2">
                      <i className="fa-solid fa-phone mt-0.5 text-primary" aria-hidden="true" />
                      Hotline: 0973 074 063
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="fa-solid fa-envelope mt-0.5 text-primary" aria-hidden="true" />
                      Email: contact@greenmarket.com.vn
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="fa-solid fa-circle-info mt-0.5 text-primary" aria-hidden="true" />
                      Sau khi chuyển khoản, bạn có thể gửi ảnh biên nhận qua Zalo hoặc hotline để shop xử lý
                      nhanh hơn.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
