import { formatString } from "@/lib/utils";

type QueryValue = string | number | null | undefined;

export const HOME_ROUTE = "/";
export const COLLECTIONS_ROUTE = "/collections";
export const PRODUCT_ROUTE = "/products";
export const SEARCH_ROUTE = "/search";
export const CART_ROUTE = "/cart";
export const CHECKOUT_ROUTE = "/check-out";
export const ORDER_SUCCESS_ROUTE = "/order-success";
export const NEWS_ROUTE = "/news";
export const PRIVACY_POLICY_ROUTE = "/privacy-policy";
export const DELIVERY_POLICY_ROUTE = "/delivery-policy";
export const RETURN_POLICY_ROUTE = "/return-policy";
export const CHECKING_POLICY_ROUTE = "/checking-policy";
export const PAYMENT_POLICY_ROUTE = "/payment-policy";
export const ADDRESS_ROUTE = "/address";

export function buildUrlWithQuery(pathname: string, query: Record<string, QueryValue>): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    const normalizedValue = formatString(value);
    if (!normalizedValue) {
      return;
    }

    searchParams.set(key, normalizedValue);
  });

  const queryString = searchParams.toString();
  return `${pathname}${queryString ? `?${queryString}` : ""}`;
}

export function buildProductDetailUrl(options: Readonly<{ id?: QueryValue; slug?: QueryValue }>): string {
  const slug = formatString(options.slug);
  if (slug) {
    return `${PRODUCT_ROUTE}/${encodeURIComponent(slug)}`;
  }

  const id = formatString(options.id);
  return id ? buildUrlWithQuery(PRODUCT_ROUTE, { id }) : PRODUCT_ROUTE;
}
