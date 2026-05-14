import type { Metadata } from "next";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { getVietnamAddressData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Thanh Toán"
};

export default async function CheckoutPage() {
  const addressData = await getVietnamAddressData();

  return <CheckoutPageClient addressData={addressData} />;
}
