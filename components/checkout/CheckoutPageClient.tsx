"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  CART_KEY,
  CART_UPDATED_EVENT,
  clearCart,
  getCartCount,
  resolveCartItems
} from "@/lib/cart";
import {
  getBrowserReadySnapshot,
  getLocalStorageSnapshot,
  getServerReadySnapshot,
  subscribeNoop,
  subscribeWindowEvents
} from "@/lib/browser-store";
import { formatProductMoney } from "@/lib/format";
import {
  buildOrderEmailTemplateParams,
  buildOrderSuccessUrl,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  generateOrderCode,
  saveSuccessfulOrder
} from "@/lib/order";
import { ALL_PRODUCTS_ROUTE, CART_ROUTE, HOME_ROUTE } from "@/lib/routes";
import type {
  CartItem,
  CheckoutOrder,
  DistrictRecord,
  PaymentMethod,
  ProductRecord,
  ProvinceRecord,
  ResolvedCartItem,
  WardRecord
} from "@/lib/types";

type CheckoutPageClientProps = Readonly<{
  addressData: ProvinceRecord[];
  products: ProductRecord[];
}>;

type CheckoutFormState = {
  address: string;
  districtId: string;
  email: string;
  fullname: string;
  notes: string;
  paymentMethod: PaymentMethod;
  phone: string;
  provinceId: string;
  wardId: string;
};

type CheckoutFieldErrors = Partial<
  Record<keyof Omit<CheckoutFormState, "email" | "notes" | "paymentMethod">, string>
>;

type FeedbackState = {
  tone: "error" | "success";
  text: string;
};

type EmailJsBrowser = {
  init: (options: { publicKey: string }) => void;
  send: (
    serviceId: string,
    templateId: string,
    templateParams: Record<string, unknown>
  ) => Promise<unknown>;
};

declare global {
  interface Window {
    emailjs?: EmailJsBrowser;
  }
}

const EMAILJS_SCRIPT_ID = "emailjs-browser-sdk";

const defaultFormState: CheckoutFormState = {
  address: "",
  districtId: "",
  email: "",
  fullname: "",
  notes: "",
  paymentMethod: "bank",
  phone: "",
  provinceId: "",
  wardId: ""
};

let emailJsLoadPromise: Promise<EmailJsBrowser> | null = null;
let isEmailJsInitialized = false;

function parseCartSnapshot(snapshot: string): CartItem[] {
  try {
    const parsed = JSON.parse(snapshot || "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch (error) {
    console.error("Invalid cart snapshot:", error);
    return [];
  }
}

function loadEmailJsBrowser(): Promise<EmailJsBrowser> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("EmailJS is only available in the browser."));
  }

  if (window.emailjs) {
    return Promise.resolve(window.emailjs);
  }

  if (emailJsLoadPromise) {
    return emailJsLoadPromise;
  }

  emailJsLoadPromise = new Promise((resolve, reject) => {
    function handleReady() {
      if (window.emailjs) {
        resolve(window.emailjs);
        return;
      }

      reject(new Error("EmailJS SDK loaded but window.emailjs is unavailable."));
    }

    function handleError() {
      emailJsLoadPromise = null;
      reject(new Error("Can not load EmailJS SDK."));
    }

    const existingScript = document.getElementById(EMAILJS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", handleReady, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = EMAILJS_SCRIPT_ID;
    script.async = true;
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.addEventListener("load", handleReady, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return emailJsLoadPromise;
}

async function getEmailJsBrowser(): Promise<EmailJsBrowser> {
  const emailjs = await loadEmailJsBrowser();
  if (!isEmailJsInitialized) {
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY
    });
    isEmailJsInitialized = true;
  }

  return emailjs;
}

function SelectChevron() {
  return (
    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
      <span className="text-xs">▾</span>
    </span>
  );
}

function getInputClassName(hasError: boolean) {
  return `peer block w-full appearance-none rounded-lg border bg-transparent px-4 py-3.5 text-sm text-gray-900 transition-colors focus:outline-none focus:ring-1 ${
    hasError
      ? "border-red-600 focus:border-red-600 focus:ring-red-600"
      : "border-gray-300 focus:border-red-600 focus:ring-red-600"
  }`;
}

function getLabelClassName(hasError: boolean, multiline = false) {
  return `absolute left-3 z-10 origin-[0] bg-white px-1 text-sm duration-300 ${
    hasError ? "text-red-600" : "text-gray-500"
  } ${
    multiline
      ? "top-0 -translate-y-1/2 scale-[0.85] cursor-text peer-placeholder-shown:top-6 peer-placeholder-shown:scale-100 peer-placeholder-shown:px-0 peer-focus:top-0 peer-focus:scale-[0.85] peer-focus:px-1 peer-focus:text-red-600"
      : "top-0 -translate-y-1/2 scale-[0.85] cursor-text peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:px-0 peer-focus:top-0 peer-focus:scale-[0.85] peer-focus:px-1 peer-focus:text-red-600"
  }`;
}

function buildOrderPayload(
  formState: CheckoutFormState,
  resolvedItems: ResolvedCartItem[],
  addressNames: {
    district: string;
    province: string;
    ward: string;
  }
): CheckoutOrder {
  const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    address: formState.address.trim(),
    code: generateOrderCode(),
    createdAt: new Date().toISOString(),
    district: addressNames.district,
    email: formState.email.trim(),
    fullname: formState.fullname.trim(),
    items: resolvedItems.map((item) => ({
      id: item.id,
      image: item.image,
      lineTotal: item.lineTotal,
      name: item.name,
      qty: item.qty,
      size: item.size,
      sku: item.sku,
      unitPrice: item.unitPrice
    })),
    notes: formState.notes.trim(),
    paymentMethod: formState.paymentMethod,
    phone: formState.phone.trim(),
    province: addressNames.province,
    shippingFee: 0,
    subtotal,
    total: subtotal,
    ward: addressNames.ward
  };
}

export default function CheckoutPageClient({ addressData, products }: CheckoutPageClientProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<CheckoutFormState>(defaultFormState);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isHydrated = useSyncExternalStore(subscribeNoop, getBrowserReadySnapshot, getServerReadySnapshot);
  const cartSnapshot = useSyncExternalStore(
    (callback) => subscribeWindowEvents([CART_UPDATED_EVENT, "storage"], callback),
    () => getLocalStorageSnapshot(CART_KEY, "[]"),
    () => "[]"
  );
  const cart = useMemo(() => parseCartSnapshot(cartSnapshot), [cartSnapshot]);
  const resolvedItems = useMemo(() => resolveCartItems(products, cart), [cart, products]);
  const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const selectedProvince = addressData.find((province) => province.Id === formState.provinceId);
  const districts = selectedProvince?.Districts || [];
  const selectedDistrict = districts.find((district) => district.Id === formState.districtId);
  const wards = selectedDistrict?.Wards || [];
  const selectedWard = wards.find((ward) => ward.Id === formState.wardId);
  const addressNames = {
    district: selectedDistrict?.Name || "",
    province: selectedProvince?.Name || "",
    ward: selectedWard?.Name || ""
  };

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  function updateField<K extends keyof CheckoutFormState>(field: K, value: CheckoutFormState[K]) {
    setFormState((currentValue) => ({
      ...currentValue,
      [field]: value
    }));

    setFieldErrors((currentValue) => {
      if (!(field in currentValue)) {
        return currentValue;
      }

      const nextErrors = { ...currentValue };
      delete nextErrors[field as keyof CheckoutFieldErrors];
      return nextErrors;
    });
  }

  function handleProvinceChange(provinceId: string) {
    setFormState((currentValue) => ({
      ...currentValue,
      provinceId,
      districtId: "",
      wardId: ""
    }));

    setFieldErrors((currentValue) => {
      const nextErrors = { ...currentValue };
      delete nextErrors.provinceId;
      delete nextErrors.districtId;
      delete nextErrors.wardId;
      return nextErrors;
    });
  }

  function handleDistrictChange(districtId: string) {
    setFormState((currentValue) => ({
      ...currentValue,
      districtId,
      wardId: ""
    }));

    setFieldErrors((currentValue) => {
      const nextErrors = { ...currentValue };
      delete nextErrors.districtId;
      delete nextErrors.wardId;
      return nextErrors;
    });
  }

  function validateForm(): boolean {
    const nextErrors: CheckoutFieldErrors = {};

    if (!formState.fullname.trim()) {
      nextErrors.fullname = "Vui lòng nhập họ và tên.";
    }
    if (!formState.phone.trim()) {
      nextErrors.phone = "Vui lòng nhập số điện thoại.";
    }
    if (!formState.provinceId.trim()) {
      nextErrors.provinceId = "Vui lòng chọn tỉnh/thành phố.";
    }
    if (!formState.districtId.trim()) {
      nextErrors.districtId = "Vui lòng chọn quận/huyện.";
    }
    if (!formState.wardId.trim()) {
      nextErrors.wardId = "Vui lòng chọn xã/phường/thị trấn.";
    }
    if (!formState.address.trim()) {
      nextErrors.address = "Vui lòng nhập địa chỉ cụ thể.";
    }

    setFieldErrors(nextErrors);

    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      document.getElementById(firstInvalidField)?.focus();
    }

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (getCartCount(cart) <= 0) {
      window.alert("Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.");
      router.push(CART_ROUTE);
      return;
    }

    if (!validateForm()) {
      setFeedback({
        text: "Vui lòng điền đầy đủ các thông tin bắt buộc.",
        tone: "error"
      });
      return;
    }

    const orderPayload = buildOrderPayload(formState, resolvedItems, addressNames);

    try {
      setIsSubmitting(true);
      const emailjs = await getEmailJsBrowser();
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        buildOrderEmailTemplateParams(orderPayload)
      );

      saveSuccessfulOrder(orderPayload);
      clearCart();
      setFormState(defaultFormState);
      setFieldErrors({});
      router.push(buildOrderSuccessUrl(orderPayload.code));
    } catch (error) {
      console.error("checkout submit error:", error);
      setFeedback({
        text: "Đặt hàng thất bại. Vui lòng thử lại sau ít phút hoặc liên hệ hotline để được hỗ trợ.",
        tone: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-50 pb-20">
      {feedback ? (
        <div
          className={`fixed right-4 top-24 z-[150] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-2xl ${
            feedback.tone === "success" ? "bg-[#0d6b38]" : "bg-[#ed1b24]"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <div className="border-b border-gray-200 bg-gray-100 py-3">
        <div className="mx-auto max-w-7xl px-4 text-xs text-gray-500">
          <Link href={HOME_ROUTE} className="transition hover:text-primary">
            Trang Chủ
          </Link>
          <span className="mx-2">|</span>
          <Link href={CART_ROUTE} className="transition hover:text-primary">
            Giỏ Hàng
          </Link>
          <span className="mx-2">|</span>
          <span className="font-medium text-gray-800">Thanh Toán</span>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-8">
            <h1 className="mb-6 border-b border-gray-100 pb-4 text-xl font-bold text-gray-800">
              Thông tin thanh toán
            </h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="relative md:col-span-2">
                <input
                  id="fullname"
                  type="text"
                  value={formState.fullname}
                  onChange={(event) => updateField("fullname", event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors.fullname))}
                  placeholder=" "
                  required
                />
                <label htmlFor="fullname" className={getLabelClassName(Boolean(fieldErrors.fullname))}>
                  Họ và tên *
                </label>
              </div>

              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  value={formState.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors.phone))}
                  placeholder=" "
                  required
                />
                <label htmlFor="phone" className={getLabelClassName(Boolean(fieldErrors.phone))}>
                  Số điện thoại *
                </label>
              </div>

              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={getInputClassName(false)}
                  placeholder=" "
                />
                <label htmlFor="email" className={getLabelClassName(false)}>
                  Địa chỉ email (tùy chọn)
                </label>
              </div>

              <div className="relative">
                <select
                  id="provinceId"
                  value={formState.provinceId}
                  onChange={(event) => handleProvinceChange(event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors.provinceId))}
                >
                  <option value="" disabled hidden />
                  {addressData.map((province) => (
                    <option key={province.Id} value={province.Id}>
                      {province.Name}
                    </option>
                  ))}
                </select>
                <label htmlFor="provinceId" className={getLabelClassName(Boolean(fieldErrors.provinceId))}>
                  Tỉnh/Thành phố *
                </label>
                <SelectChevron />
              </div>

              <div className="relative">
                <select
                  id="districtId"
                  value={formState.districtId}
                  onChange={(event) => handleDistrictChange(event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors.districtId))}
                  disabled={!districts.length}
                >
                  <option value="" disabled hidden />
                  {districts.map((district: DistrictRecord) => (
                    <option key={district.Id} value={district.Id}>
                      {district.Name}
                    </option>
                  ))}
                </select>
                <label htmlFor="districtId" className={getLabelClassName(Boolean(fieldErrors.districtId))}>
                  Quận/Huyện *
                </label>
                <SelectChevron />
              </div>

              <div className="relative md:col-span-2 lg:col-span-1">
                <select
                  id="wardId"
                  value={formState.wardId}
                  onChange={(event) => updateField("wardId", event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors.wardId))}
                  disabled={!wards.length}
                >
                  <option value="" disabled hidden />
                  {wards.map((ward: WardRecord) => (
                    <option key={ward.Id} value={ward.Id}>
                      {ward.Name}
                    </option>
                  ))}
                </select>
                <label htmlFor="wardId" className={getLabelClassName(Boolean(fieldErrors.wardId))}>
                  Xã/Phường/Thị trấn *
                </label>
                <SelectChevron />
              </div>

              <div className="relative md:col-span-2">
                <input
                  id="address"
                  type="text"
                  value={formState.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  className={getInputClassName(Boolean(fieldErrors.address))}
                  placeholder=" "
                  required
                />
                <label htmlFor="address" className={getLabelClassName(Boolean(fieldErrors.address))}>
                  Địa chỉ cụ thể (số nhà, tên đường...) *
                </label>
              </div>
            </div>

            <h2 className="mb-6 mt-10 border-b border-gray-100 pb-4 text-xl font-bold text-gray-800">
              Thông tin bổ sung
            </h2>
            <div className="relative">
              <textarea
                id="notes"
                rows={4}
                value={formState.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className={getInputClassName(false)}
                placeholder=" "
              />
              <label htmlFor="notes" className={getLabelClassName(false, true)}>
                Ghi chú đơn hàng (tùy chọn)
              </label>
            </div>
          </section>

          <aside className="lg:col-span-4">
            <div className="sticky top-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 border-b border-gray-100 pb-4 text-xl font-bold text-gray-800">
                Đơn hàng của bạn
              </h2>
              <div className="mb-4 flex justify-between border-b border-gray-100 pb-2 text-sm font-bold text-gray-600">
                <span>Sản phẩm</span>
                <span>Tạm tính</span>
              </div>

              <div className="mb-6 space-y-4 border-b border-gray-100 pb-6">
                {!isHydrated ? (
                  <div className="py-4 text-center">
                    <p className="text-sm text-gray-400">Đang tải đơn hàng...</p>
                  </div>
                ) : resolvedItems.length ? (
                  resolvedItems.map((item) => (
                    <article key={item.key} className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex items-center gap-4">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="rounded object-cover p-0.5"
                          />
                          <span className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-[10px] font-bold text-white shadow-sm">
                            {item.qty}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium text-gray-800">{item.name}</p>
                          {item.size ? (
                            <p className="mt-1 text-xs text-primary">Kích thước: {item.size}</p>
                          ) : null}
                        </div>
                      </div>
                      <span className="whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatProductMoney(item.lineTotal)}
                      </span>
                    </article>
                  ))
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm font-semibold text-gray-700">Giỏ hàng của bạn đang trống</p>
                    <Link
                      href={ALL_PRODUCTS_ROUTE}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                    >
                      ← Quay lại mua hàng
                    </Link>
                  </div>
                )}
              </div>

              <div className="mb-6 space-y-3 border-b border-gray-100 pb-6">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Tạm tính</span>
                  <span className="font-semibold">{formatProductMoney(subtotal)}</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-base font-bold text-gray-800">Tổng</span>
                  <span className="text-xl font-bold text-red-600">{formatProductMoney(subtotal)}</span>
                </div>
              </div>

              <div className="mb-8 space-y-4">
                <label className="group flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank"
                    checked={formState.paymentMethod === "bank"}
                    onChange={() => updateField("paymentMethod", "bank")}
                    className="h-4 w-4 cursor-pointer accent-red-600"
                  />
                  <span className="text-sm text-gray-700 transition-colors group-hover:text-red-600">
                    Chuyển khoản ngân hàng trực tiếp
                  </span>
                </label>
                <label className="group flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={formState.paymentMethod === "cod"}
                    onChange={() => updateField("paymentMethod", "cod")}
                    className="h-4 w-4 cursor-pointer accent-red-600"
                  />
                  <span className="text-sm text-gray-700 transition-colors group-hover:text-red-600">
                    Thanh toán khi nhận hàng
                  </span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isHydrated || !resolvedItems.length || isSubmitting}
                className="w-full rounded-lg bg-red-600 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors shadow-md hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi đơn hàng..." : "Đặt hàng"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
