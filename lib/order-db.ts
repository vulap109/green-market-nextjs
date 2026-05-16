import { prisma } from "@/lib/prisma";
import { formatString, resolveAssetPath } from "@/lib/utils";
import type { CheckoutOrder, CheckoutOrderItem, PaymentMethod } from "@/lib/types";

export class CheckoutOrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutOrderValidationError";
  }
}

type PreparedOrderItem = Readonly<{
  lineTotal: number;
  productId: bigint | null;
  productName: string;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  variant: string;
}>;

type PreparedCheckoutOrder = Readonly<{
  address: string;
  code: string;
  customerEmail: string | null;
  customerName: string;
  customerPhone: string;
  district: string | null;
  items: PreparedOrderItem[];
  note: string | null;
  paymentMethod: PaymentMethod;
  placedAt: Date;
  province: string | null;
  shippingFee: number;
  subtotal: number;
  totalAmount: number;
  ward: string | null;
}>;

function sanitizeText(value: unknown, maxLength: number): string {
  return formatString(value).slice(0, maxLength);
}

function sanitizeOptionalText(value: unknown, maxLength: number): string | null {
  const text = sanitizeText(value, maxLength);
  return text || null;
}

function sanitizeMoney(value: unknown): number {
  const amount = Math.round(Number(value));
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function toMoneyNumber(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function sanitizeQuantity(value: unknown): number {
  const quantity = Math.floor(Number(value));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function parsePositiveBigInt(value: unknown): bigint | null {
  const rawValue = formatString(value);

  if (!/^\d+$/.test(rawValue)) {
    return null;
  }

  const parsedValue = BigInt(rawValue);
  return parsedValue > BigInt(0) ? parsedValue : null;
}

function sanitizePaymentMethod(value: unknown): PaymentMethod {
  const paymentMethod = formatString(value);

  if (paymentMethod === "bank" || paymentMethod === "cod") {
    return paymentMethod;
  }

  throw new CheckoutOrderValidationError("Phuong thuc thanh toan khong hop le.");
}

function mapPaymentMethod(value: unknown): PaymentMethod {
  return formatString(value) === "bank" ? "bank" : "cod";
}

function sanitizePlacedAt(value: unknown): Date {
  const placedAt = new Date(formatString(value));

  return Number.isNaN(placedAt.getTime()) ? new Date() : placedAt;
}

function readCheckoutOrder(value: unknown): CheckoutOrder {
  if (!value || typeof value !== "object") {
    throw new CheckoutOrderValidationError("Du lieu don hang khong hop le.");
  }

  return value as CheckoutOrder;
}

function prepareOrderItem(item: CheckoutOrderItem): PreparedOrderItem | null {
  const quantity = sanitizeQuantity(item.qty);
  const productName = sanitizeText(item.name, 255);

  if (!productName || quantity <= 0) {
    return null;
  }

  const unitPrice = sanitizeMoney(item.unitPrice);

  return {
    lineTotal: unitPrice * quantity,
    productId: parsePositiveBigInt(item.id),
    productName,
    productSku: sanitizeOptionalText(item.sku, 100),
    quantity,
    unitPrice,
    variant: sanitizeText(item.size, 100)
  };
}

function prepareCheckoutOrder(value: unknown): PreparedCheckoutOrder {
  const order = readCheckoutOrder(value);
  const items = Array.isArray(order.items)
    ? order.items.map(prepareOrderItem).filter((item): item is PreparedOrderItem => Boolean(item))
    : [];

  if (!items.length) {
    throw new CheckoutOrderValidationError("Don hang khong co san pham hop le.");
  }

  const customerName = sanitizeText(order.fullname, 150);
  const customerPhone = sanitizeText(order.phone, 30);
  const address = sanitizeText(order.address, 255);
  const orderCode = sanitizeText(order.code, 50);

  if (!customerName || !customerPhone || !address || !orderCode) {
    throw new CheckoutOrderValidationError("Vui long dien day du thong tin dat hang bat buoc.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = sanitizeMoney(order.shippingFee);

  return {
    address,
    code: orderCode,
    customerEmail: sanitizeOptionalText(order.email, 255),
    customerName,
    customerPhone,
    district: sanitizeOptionalText(order.district, 120),
    items,
    note: sanitizeOptionalText(order.notes, 1000),
    paymentMethod: sanitizePaymentMethod(order.paymentMethod),
    placedAt: sanitizePlacedAt(order.createdAt),
    province: sanitizeOptionalText(order.province, 120),
    shippingFee,
    subtotal,
    totalAmount: subtotal + shippingFee,
    ward: sanitizeOptionalText(order.ward, 120)
  };
}

export async function createCheckoutOrderRecord(value: unknown) {
  const order = prepareCheckoutOrder(value);
  const productIds = Array.from(
    new Set(order.items.map((item) => item.productId).filter((id): id is bigint => id !== null))
  );
  const existingProducts = productIds.length
    ? await prisma.product.findMany({
        where: {
          id: {
            in: productIds
          }
        },
        select: {
          id: true
        }
      })
    : [];
  const existingProductIds = new Set(existingProducts.map((product) => product.id.toString()));
  const createdOrder = await prisma.order.create({
    data: {
      orderCode: order.code,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      shippingFullName: order.customerName,
      shippingPhone: order.customerPhone,
      shippingAddressLine: order.address,
      shippingWard: order.ward,
      shippingDistrict: order.district,
      shippingProvince: order.province,
      note: order.note,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: "unpaid",
      orderStatus: "pending",
      placedAt: order.placedAt
    },
    select: {
      id: true,
      orderCode: true
    }
  });

  try {
    for (const item of order.items) {
      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          productId:
            item.productId && existingProductIds.has(item.productId.toString()) ? item.productId : null,
          productName: item.productName,
          productSku: item.productSku,
          unitPrice: item.unitPrice,
          variant: item.variant,
          quantity: item.quantity,
          lineTotal: item.lineTotal
        }
      });
    }

    await prisma.payment.create({
      data: {
        orderId: createdOrder.id,
        paymentMethod: order.paymentMethod,
        amount: order.totalAmount,
        status: "pending"
      }
    });
  } catch (error) {
    await cleanupIncompleteOrder(createdOrder.id);
    throw error;
  }

  return createdOrder;
}

async function cleanupIncompleteOrder(orderId: bigint) {
  try {
    await prisma.order.delete({
      where: {
        id: orderId
      }
    });
  } catch (cleanupError) {
    console.error("cleanup incomplete checkout order failed:", cleanupError);
  }
}

export async function findCheckoutOrderByCode(orderCode?: string | null): Promise<CheckoutOrder | null> {
  const code = formatString(orderCode);
  if (!code) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: {
      orderCode: code
    },
    select: {
      orderCode: true,
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      shippingAddressLine: true,
      shippingWard: true,
      shippingDistrict: true,
      shippingProvince: true,
      note: true,
      subtotal: true,
      shippingFee: true,
      totalAmount: true,
      paymentMethod: true,
      placedAt: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productId: true,
          productName: true,
          productSku: true,
          unitPrice: true,
          variant: true,
          quantity: true,
          lineTotal: true,
          product: {
            select: {
              thumbnail: true,
              images: {
                where: {
                  isMain: true
                },
                select: {
                  imageUrl: true
                },
                take: 1
              }
            }
          }
        },
        orderBy: {
          id: "asc"
        }
      }
    }
  });

  if (!order) {
    return null;
  }

  return {
    address: order.shippingAddressLine,
    code: order.orderCode,
    createdAt: (order.placedAt || order.createdAt).toISOString(),
    district: order.shippingDistrict || "",
    email: order.customerEmail || "",
    fullname: order.customerName,
    items: order.items.map((item) => {
      const productId = item.productId?.toString() || item.id.toString();
      const image = resolveAssetPath(item.product?.thumbnail || item.product?.images[0]?.imageUrl) || "/images/sp1.jpg";

      return {
        id: productId,
        image,
        lineTotal: toMoneyNumber(item.lineTotal),
        name: item.productName,
        qty: item.quantity,
        size: item.variant,
        sku: item.productSku || "",
        unitPrice: toMoneyNumber(item.unitPrice)
      };
    }),
    notes: order.note || "",
    paymentMethod: mapPaymentMethod(order.paymentMethod),
    phone: order.customerPhone,
    province: order.shippingProvince || "",
    shippingFee: toMoneyNumber(order.shippingFee),
    subtotal: toMoneyNumber(order.subtotal),
    total: toMoneyNumber(order.totalAmount),
    ward: order.shippingWard || ""
  };
}
