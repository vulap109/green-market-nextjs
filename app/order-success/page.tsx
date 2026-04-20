import type { Metadata } from "next";
import OrderSuccessPageClient from "@/components/order/OrderSuccessPageClient";

export const metadata: Metadata = {
  title: "Đặt Hàng Thành Công"
};

type OrderSuccessPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function getSearchParamValue(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return String(value[0] || "").trim();
  }

  return String(value || "").trim();
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;

  return <OrderSuccessPageClient expectedCode={getSearchParamValue(params.code)} />;
}
