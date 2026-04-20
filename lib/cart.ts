import { resolveAssetPath } from "@/lib/assets";
import { getProductSlug } from "@/lib/products";
import { buildProductDetailUrl } from "@/lib/routes";
import type { CartItem, ProductRecord, ResolvedCartItem } from "@/lib/types";

export const CART_KEY = "cart_v1";
export const CART_UPDATED_EVENT = "cart:updated";

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

function getStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function dispatchCartUpdated(cart: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: {
        count: getCartCount(cart)
      }
    })
  );
}

export function getCartItemSize(item?: Partial<CartItem> | null): string {
  return String(item?.size || "");
}

export function getCartItemKey(item?: Partial<CartItem> | null): string {
  return `${String(item?.id || "")}::${getCartItemSize(item)}`;
}

export function getCart(storage?: StorageLike | null): CartItem[] {
  const targetStorage = getStorage(storage);

  if (!targetStorage) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(targetStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error("Invalid cart data:", error);
    targetStorage.removeItem(CART_KEY);
    return [];
  }
}

export function saveCart(cart: CartItem[], storage?: StorageLike | null): CartItem[] {
  const targetStorage = getStorage(storage);
  const nextCart = Array.isArray(cart) ? cart : [];

  if (targetStorage) {
    targetStorage.setItem(CART_KEY, JSON.stringify(nextCart));
  }

  dispatchCartUpdated(nextCart);
  return nextCart;
}

export function addToCart(
  item: Omit<CartItem, "id"> & { id: number | string },
  storage?: StorageLike | null
): CartItem[] {
  const cart = getCart(storage);
  const id = String(item.id);
  const qtyToAdd = Number(item.qty) || 1;
  const size = String(item.size || "");
  const existingItem = cart.find(
    (cartItem) => String(cartItem.id) === id && getCartItemSize(cartItem) === size
  );

  if (existingItem) {
    existingItem.qty = Number(existingItem.qty) + qtyToAdd;
    if (item.priceSnapshot !== undefined) {
      existingItem.priceSnapshot = item.priceSnapshot;
    }
  } else {
    cart.push({
      id,
      qty: qtyToAdd,
      ...(item.priceSnapshot !== undefined ? { priceSnapshot: item.priceSnapshot } : {}),
      ...(size ? { size } : {})
    });
  }

  return saveCart(cart, storage);
}

export function updateCartQty(
  id: number | string,
  qty: number,
  size = "",
  storage?: StorageLike | null
): CartItem[] {
  const cart = getCart(storage);
  const normalizedSize = String(size || "");
  const itemIndex = cart.findIndex(
    (cartItem) => String(cartItem.id) === String(id) && getCartItemSize(cartItem) === normalizedSize
  );

  if (itemIndex === -1) {
    return cart;
  }

  const nextQty = Number(qty);
  if (nextQty > 0) {
    cart[itemIndex].qty = nextQty;
  }

  return saveCart(cart, storage);
}

export function removeFromCart(id: number | string, size = "", storage?: StorageLike | null): CartItem[] {
  const normalizedSize = String(size || "");
  const nextCart = getCart(storage).filter(
    (item) => !(String(item.id) === String(id) && getCartItemSize(item) === normalizedSize)
  );

  return saveCart(nextCart, storage);
}

export function clearCart(storage?: StorageLike | null): CartItem[] {
  return saveCart([], storage);
}

export function getCartCount(cart: CartItem[] = getCart()): number {
  return cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

function getCartItemPrice(product: ProductRecord | undefined, cartItem: CartItem): number {
  if (cartItem.priceSnapshot !== undefined) {
    return Number(cartItem.priceSnapshot) || 0;
  }

  return Number(product?.price ?? product?.Price ?? 0);
}

export function findCartProduct(
  productsData: ProductRecord[] = [],
  cartItem?: Partial<CartItem> | null
): ProductRecord | undefined {
  return productsData.find(
    (productItem) => String(productItem.id ?? productItem.Id) === String(cartItem?.id || "")
  );
}

export function getCartItemUnitPrice(
  product: ProductRecord | undefined,
  cartItem?: Partial<CartItem> | null
): number {
  if (!cartItem) {
    return 0;
  }

  return getCartItemPrice(product, cartItem as CartItem);
}

export function getCartLineTotal(
  product: ProductRecord | undefined,
  cartItem?: Partial<CartItem> | null
): number {
  const qty = Number(cartItem?.qty) || 0;
  return getCartItemUnitPrice(product, cartItem) * qty;
}

export function resolveCartItems(
  productsData: ProductRecord[] = [],
  cart: CartItem[] = getCart()
): ResolvedCartItem[] {
  return cart.map((cartItem) => {
    const product = findCartProduct(productsData, cartItem);
    const id = String(cartItem.id);
    const size = getCartItemSize(cartItem);
    const qty = Number(cartItem.qty) || 0;
    const unitPrice = getCartItemUnitPrice(product, cartItem);
    const lineTotal = unitPrice * qty;
    const name = product?.name || `Sản phẩm #${id}`;
    const sku = String(product?.sku ?? product?.SKU ?? "N/A");
    const image = resolveAssetPath(product?.img) || "/images/sp1.jpg";
    const productHref = product ? buildProductDetailUrl({ slug: getProductSlug(product) }) : "#";

    return {
      cartItem,
      id,
      image,
      key: getCartItemKey(cartItem),
      lineTotal,
      name,
      product,
      productHref,
      qty,
      size,
      sku,
      unitPrice
    };
  });
}

export function getCartTotal(productsData: ProductRecord[] = [], storage?: StorageLike | null): number {
  return getCart(storage).reduce((sum, cartItem) => {
    const product = findCartProduct(productsData, cartItem);

    return sum + getCartItemPrice(product, cartItem) * (Number(cartItem.qty) || 0);
  }, 0);
}
