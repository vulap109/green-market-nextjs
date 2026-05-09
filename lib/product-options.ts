import { getProductFinalPrice, getProductPrice } from "@/lib/products";
import type { CakeSizeOption, ProductRecord } from "@/lib/types";

const CREAM_CAKE_SIZES: Record<string, CakeSizeOption[]> = {
  ll: [
    { value: "12cm", label: "12cm", price: 129000 },
    { value: "14cm", label: "14cm", price: 210000 },
    { value: "16cm", label: "16cm", price: 250000 },
    { value: "18cm", label: "18cm", price: 320000 },
    { value: "20cm", label: "20cm", price: 350000 }
  ],
  ht: [
    { value: "14cm", label: "14cm", price: 310000 },
    { value: "16cm", label: "16cm", price: 350000 },
    { value: "18cm", label: "18cm", price: 420000 },
    { value: "20cm", label: "20cm", price: 450000 }
  ],
  lq: [
    { value: "14cm", label: "14cm", price: 330000 },
    { value: "16cm", label: "16cm", price: 370000 },
    { value: "18cm", label: "18cm", price: 440000 },
    { value: "20cm", label: "20cm", price: 470000 }
  ],
  qd: [
    { value: "14cm", label: "14cm", price: 350000 },
    { value: "16cm", label: "16cm", price: 390000 },
    { value: "18cm", label: "18cm", price: 460000 },
    { value: "20cm", label: "20cm", price: 490000 }
  ],
  yv: [
    { value: "12cm", label: "12cm", price: 129000 },
    { value: "14cm", label: "14cm", price: 210000 },
    { value: "16cm", label: "16cm", price: 250000 },
    { value: "18cm", label: "18cm", price: 320000 },
    { value: "20cm", label: "20cm", price: 350000 }
  ]
};

export function getCreamCakeSizeOptions(product?: ProductRecord | null): CakeSizeOption[] {
  if (!product || (product.parentCategory || product.category) !== "cream-cake") {
    return [];
  }

  const category = String(product.category || "").trim().toLowerCase();
  return CREAM_CAKE_SIZES[category] || CREAM_CAKE_SIZES.ll;
}

export function getSelectedCakeSizeOption(
  product?: ProductRecord | null,
  selectedValue?: string | null
): CakeSizeOption | null {
  const sizeOptions = getCreamCakeSizeOptions(product);
  if (!sizeOptions.length) {
    return null;
  }

  const requestedValue = String(selectedValue || "").trim();
  return sizeOptions.find((size) => size.value === requestedValue) || sizeOptions[0] || null;
}

export function getProductDisplayPricing(product?: ProductRecord | null, selectedSizeValue?: string | null) {
  if (!product) {
    return {
      currentPrice: 0,
      originalPrice: 0,
      showOriginalPrice: false
    };
  }

  const selectedCakeSize = getSelectedCakeSizeOption(product, selectedSizeValue);
  if (selectedCakeSize) {
    return {
      currentPrice: selectedCakeSize.price,
      originalPrice: 0,
      showOriginalPrice: false
    };
  }

  const currentPrice = getProductFinalPrice(product);
  const originalPrice = getProductPrice(product);

  return {
    currentPrice,
    originalPrice,
    showOriginalPrice: originalPrice >= currentPrice
  };
}
