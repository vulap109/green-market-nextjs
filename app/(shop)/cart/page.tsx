import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";
import { getProductsData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Giỏ Hàng"
};

export default async function CartPage() {
  const products = await getProductsData();

  return <CartPageClient products={products} />;
}
