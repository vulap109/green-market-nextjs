import { getProductSalePrice, getProductPrice } from "@/lib/products";
import type { ProductRecord, ProductVariantOption } from "@/lib/types";

export function getSelectedProductVariantOption(
  product?: ProductRecord | null,
  selectedValue?: string | null
): ProductVariantOption | null {
  const variantOptions = product?.variantOptions || [];
  if (!variantOptions.length) {
    return null;
  }

  const requestedValue = String(selectedValue || "").trim();
  return variantOptions.find((variant) => variant.value === requestedValue) || variantOptions[0] || null;
}

export function getProductDisplayPricing(product?: ProductRecord | null, selectedVariantValue?: string | null) {
  if (!product) {
    return {
      currentPrice: 0,
      originalPrice: 0,
      showOriginalPrice: false
    };
  }

  const selectedVariant = getSelectedProductVariantOption(product, selectedVariantValue);
  if (selectedVariant) {
    return {
      currentPrice: selectedVariant.price,
      originalPrice: 0,
      showOriginalPrice: false
    };
  }

  const currentPrice = getProductSalePrice(product);
  const originalPrice = getProductPrice(product);

  return {
    currentPrice,
    originalPrice,
    showOriginalPrice: originalPrice >= currentPrice
  };
}
