import type { Metadata } from "next";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { getProductsData, getVietnamAddressData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Thanh Toán"
};

export default async function CheckoutPage() {
  const [products, addressData] = await Promise.all([getProductsData(), getVietnamAddressData()]);

  return <CheckoutPageClient products={products} addressData={addressData} />;
}
