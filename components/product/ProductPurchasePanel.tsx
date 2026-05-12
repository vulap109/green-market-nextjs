"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatProductMoney } from "@/lib/format";
import {
  getProductDisplayPricing,
  getSelectedProductVariantOption
} from "@/lib/product-options";
import { CART_ROUTE } from "@/lib/routes";
import type { ProductRecord } from "@/lib/types";

type ProductPurchasePanelProps = Readonly<{
  product: ProductRecord;
}>;

export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const variantOptions = product.variantOptions || [];
  const defaultVariant = variantOptions[0] || null;
  const [qty, setQty] = useState(1);
  const [selectedVariantValue, setSelectedVariantValue] = useState(defaultVariant?.value || "");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const selectedVariant = getSelectedProductVariantOption(product, selectedVariantValue);
  const pricing = useMemo(
    () => getProductDisplayPricing(product, selectedVariantValue),
    [product, selectedVariantValue]
  );
  const showContactPrice = pricing.currentPrice <= 0 && pricing.originalPrice <= 0;

  useEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFeedbackMessage("");
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [feedbackMessage]);

  function normalizeQty(nextQty: number): number {
    if (!Number.isFinite(nextQty) || nextQty < 1) {
      return 1;
    }

    return Math.floor(nextQty);
  }

  function updateQty(nextQty: number) {
    setQty(normalizeQty(nextQty));
  }

  function handleAddToCart(): boolean {
    const productId = product.id;
    if (productId === undefined || productId === null) {
      return false;
    }

    addToCart({
      id: productId,
      priceSnapshot: pricing.currentPrice,
      qty,
      ...(selectedVariant ? { size: selectedVariant.label } : {})
    });
    setFeedbackMessage(`Đã thêm ${qty} sản phẩm vào giỏ hàng.`);
    return true;
  }

  function handleBuyNow() {
    if (!handleAddToCart()) {
      return;
    }

    router.push(CART_ROUTE);
  }

  return (
    <>
      {feedbackMessage ? (
        <div className="fixed right-4 top-24 z-[150] rounded-xl bg-[#0d6b38] px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          {feedbackMessage}
        </div>
      ) : null}

      <div className="flex w-full flex-col">
        <h1 className="mb-2 text-2xl font-bold leading-tight text-gray-800">{product.name}</h1>

        <div className="mb-4 flex gap-4 border-b border-gray-100 pb-4 text-xs text-gray-500">
          <span>
            SKU: <span className="text-gray-800">{product.sku || "N/A"}</span>
          </span>
          <span className="border-l border-gray-300 pl-4">
            Tình trạng: <span className="font-medium text-primary">Còn hàng</span>
          </span>
        </div>

        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <div className="mb-1 flex items-end gap-3">
            <span className="text-3xl font-black text-red-600">
              {showContactPrice ? "Liên Hệ" : formatProductMoney(pricing.currentPrice)}
            </span>
            {!showContactPrice && pricing.showOriginalPrice ? (
              <span className="mb-1 text-lg font-medium text-gray-400 line-through">
                {formatProductMoney(pricing.originalPrice)}
              </span>
            ) : null}
          </div>
          {!showContactPrice ? (
            <div className="mt-2 flex items-center gap-1 text-xs font-bold text-red-500">
              <i className="fa-solid fa-fire text-orange-500"></i>
              <span>SẢN PHẨM FLASH SALE</span>
            </div>
          ) : null}
        </div>

        {variantOptions.length ? (
          <div className="mb-6">
            <p className="mb-3 text-sm font-bold text-gray-700">Phân loại:</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {variantOptions.map((variant) => (
                <label key={variant.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="product-variant"
                    value={variant.value}
                    checked={selectedVariantValue === variant.value}
                    onChange={() => setSelectedVariantValue(variant.value)}
                    className="peer sr-only"
                  />
                  <span className="flex h-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition-all peer-checked:border-orange-600">
                    {variant.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-gray-700">Số lượng:</p>
          <div className="flex h-10 w-fit items-center overflow-hidden rounded border border-gray-300">
            <button
              type="button"
              onClick={() => updateQty(qty - 1)}
              className="flex h-full w-10 items-center justify-center bg-gray-50 font-bold text-gray-600 transition hover:bg-gray-200"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(event) => updateQty(Number(event.target.value))}
              className="quantity-input h-full w-12 border-x border-gray-300 text-center text-sm font-bold text-gray-800 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => updateQty(qty + 1)}
              className="flex h-full w-10 items-center justify-center bg-gray-50 font-bold text-gray-600 transition hover:bg-gray-200"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-auto flex gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-primary py-3.5 text-sm font-bold uppercase text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg"
          >
            Thêm vào giỏ
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex flex-1 items-center justify-center gap-2 rounded bg-primary py-3.5 text-sm font-bold uppercase text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </>
  );
}
