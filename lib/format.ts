import type { PaymentMethod } from "@/lib/types";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatProductMoney(amount: number | string | null | undefined): string {
  return `${Number(amount || 0).toLocaleString("vi-VN")} \u20AB`;
}

export const formatMoney = formatProductMoney;

export function getPaymentMethodLabel(method: PaymentMethod | string): string {
  return method === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản ngân hàng trực tiếp";
}
