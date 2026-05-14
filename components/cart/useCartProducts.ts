"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductRecord } from "@/lib/product-types";
import type { CartItem } from "@/lib/types";

type CartProductsResponse = {
  items?: ProductRecord[];
};

type CartProductsState = Readonly<{
  isLoading: boolean;
  loadError: string;
  products: ProductRecord[];
}>;

function getCartProductIdKey(cart: CartItem[]): string {
  return Array.from(new Set(cart.map((item) => String(item.id || "").trim()).filter(Boolean))).join(",");
}

export function useCartProducts(cart: CartItem[], isReady: boolean): CartProductsState {
  const productIdKey = useMemo(() => getCartProductIdKey(cart), [cart]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadedProductIdKey, setLoadedProductIdKey] = useState("");

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const productIds = productIdKey ? productIdKey.split(",") : [];

    if (!productIds.length) {
      setProducts([]);
      setLoadError("");
      setIsLoading(false);
      setLoadedProductIdKey("");
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);
    setLoadError("");

    fetch("/api/products/cart", {
      body: JSON.stringify({ ids: productIds }),
      headers: {
        "content-type": "application/json"
      },
      method: "POST",
      signal: controller.signal
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load cart products: ${response.status}`);
        }

        return (await response.json()) as CartProductsResponse;
      })
      .then((data) => {
        setProducts(Array.isArray(data.items) ? data.items : []);
        setLoadedProductIdKey(productIdKey);
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error("cart products load failed:", error);
        setProducts([]);
        setLoadError("Khong tai duoc san pham trong gio hang.");
        setLoadedProductIdKey(productIdKey);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [isReady, productIdKey]);

  return {
    isLoading: isLoading || (isReady && Boolean(productIdKey) && loadedProductIdKey !== productIdKey && !loadError),
    loadError,
    products
  };
}
