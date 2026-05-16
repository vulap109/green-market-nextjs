import type { Metadata } from "next";
import OrderSuccessPageClient from "@/components/order/OrderSuccessPageClient";
import { findCheckoutOrderByCode } from "@/lib/order-db";
import { formatParamString } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Đặt Hàng Thành Công"
};

type OrderSuccessPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;
  const orderCode = formatParamString(params.code);
  const order = await findCheckoutOrderByCode(orderCode);

  return <OrderSuccessPageClient order={order} />;
}
