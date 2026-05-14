import type { ProductRecord } from "@/lib/product-types";

export type CartItem = {
  id: string;
  priceSnapshot?: number;
  qty: number;
  size?: string;
};

export type ResolvedCartItem = {
  cartItem: CartItem;
  id: string;
  image: string;
  key: string;
  lineTotal: number;
  name: string;
  product?: ProductRecord;
  productHref: string;
  qty: number;
  size: string;
  sku: string;
  unitPrice: number;
};

export type PaymentMethod = "bank" | "cod";

export type NewsArticle = {
  author?: string;
  contentFile?: string;
  date?: string;
  dateLabel?: string;
  description?: string;
  featured?: boolean;
  hero?: string;
  heroAlt?: string;
  id?: number | string;
  slug?: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  title?: string;
};

export type CheckoutOrderItem = {
  id: string;
  image: string;
  lineTotal: number;
  name: string;
  qty: number;
  size: string;
  sku: string;
  unitPrice: number;
};

export type CheckoutOrder = {
  address: string;
  code: string;
  createdAt: string;
  district: string;
  email: string;
  fullname: string;
  items: CheckoutOrderItem[];
  notes: string;
  paymentMethod: PaymentMethod;
  phone: string;
  province: string;
  shippingFee: number;
  subtotal: number;
  total: number;
  ward: string;
};

export type WardRecord = {
  Id: string;
  Level?: string;
  Name: string;
};

export type DistrictRecord = {
  Id: string;
  Name: string;
  Wards?: WardRecord[];
};

export type ProvinceRecord = {
  Districts?: DistrictRecord[];
  Id: string;
  Name: string;
};

