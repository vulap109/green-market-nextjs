import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Giỏ Hàng"
};

export default function CartPage() {
  return <CartPageClient />;
}
