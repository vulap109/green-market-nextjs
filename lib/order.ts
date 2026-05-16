import { ORDER_SUCCESS_ROUTE } from "@/lib/routes";
import { formatString, getPaymentMethodLabel } from "@/lib/utils";
import type { CheckoutOrder } from "@/lib/types";

export const EMAILJS_PUBLIC_KEY = "pRg2xzuGVPHOs4IN-";
export const EMAILJS_SERVICE_ID = "service_fresh_fruit";
export const EMAILJS_TEMPLATE_ID = "template_tygr3dw";
export const EMAILJS_CONSULTATION_TEMPLATE_ID = "template_1cv4a91";

export const BANK_TRANSFER_INFO = {
  accountName: "LY VAN HUNG",
  accountNumber: "19074398800014",
  bankCode: "TECHCOMBANK",
  bankId: "techcombank",
  bankName: "Techcombank",
  qrTemplate: "compact"
} as const;

type SubmitCheckoutOrderResponse = {
  message?: string;
};

export function generateOrderCode(now = new Date()): string {
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("");
  const timePart = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("");
  const randomPart = String(Math.floor(Math.random() * 900) + 100);

  return `GM${datePart}${timePart}${randomPart}`;
}

export function buildOrderSuccessUrl(orderCode?: string | null): string {
  const nextCode = formatString(orderCode);
  return nextCode ? `${ORDER_SUCCESS_ROUTE}?code=${encodeURIComponent(nextCode)}` : ORDER_SUCCESS_ROUTE;
}

export async function submitCheckoutOrder(order: CheckoutOrder): Promise<void> {
  const response = await fetch("/api/orders", {
    body: JSON.stringify({ order }),
    headers: {
      "content-type": "application/json"
    },
    method: "POST"
  });

  if (response.ok) {
    return;
  }

  let message = "Khong luu duoc don hang. Vui long thu lai sau.";

  try {
    const data = (await response.json()) as SubmitCheckoutOrderResponse;
    message = formatString(data.message) || message;
  } catch {
    // Use the default message when the API does not return JSON.
  }

  throw new Error(message);
}

export function formatOrderDate(value?: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function buildBankTransferContent(order?: Partial<CheckoutOrder> | null): string {
  return formatString(order?.code);
}

export function buildVietQrImageUrl(order?: Partial<CheckoutOrder> | null): string {
  const params = new URLSearchParams({
    accountName: BANK_TRANSFER_INFO.accountName,
    addInfo: buildBankTransferContent(order),
    amount: String(Math.round(Number(order?.total || 0)))
  });

  return `https://img.vietqr.io/image/${BANK_TRANSFER_INFO.bankId}-${BANK_TRANSFER_INFO.accountNumber}-${BANK_TRANSFER_INFO.qrTemplate}.png?${params.toString()}`;
}

type ConsultationEmailRequest = {
  message: string;
  name: string;
  phone: string;
};

export function buildConsultationEmailTemplateParams(request: ConsultationEmailRequest) {
  return {
    message: request.message,
    name: request.name,
    phone: request.phone
  };
}

export function buildOrderEmailTemplateParams(order: CheckoutOrder) {
  return {
    address: order.address,
    customer_email: order.email || "Không",
    customer_name: order.fullname,
    customer_phone: order.phone,
    district: order.district,
    item_count: order.items.reduce((sum, item) => sum + item.qty, 0),
    notes: order.notes || "Không",
    order_code: order.code,
    order_created_at: new Date(order.createdAt).toLocaleString("vi-VN"),
    order_items: order.items
      .map((item, index) =>
        [
          `${index + 1}. ${item.name}`,
          `SKU: ${item.sku}`,
          item.size ? `Phân loại: ${item.size}` : "",
          `Số lượng: ${item.qty}`,
          `Đơn giá: ${Number(item.unitPrice || 0).toLocaleString("vi-VN")} ₫`,
          `Thành tiền: ${Number(item.lineTotal || 0).toLocaleString("vi-VN")} ₫`
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n"),
    order_total: `${Number(order.total || 0).toLocaleString("vi-VN")} ₫`,
    payment_method: getPaymentMethodLabel(order.paymentMethod),
    province: order.province,
    subject: `Đơn hàng mới ${order.code} - ${order.fullname} - ${order.phone}`,
    ward: order.ward
  };
}
