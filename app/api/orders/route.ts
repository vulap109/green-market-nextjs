import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import {
  CheckoutOrderValidationError,
  createCheckoutOrderRecord
} from "@/lib/order-db";

type OrderRequestBody = {
  order?: unknown;
};

async function getRequestBody(request: Request): Promise<OrderRequestBody> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as OrderRequestBody) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = await getRequestBody(request);

  try {
    const order = await createCheckoutOrderRecord(body.order ?? body);

    return NextResponse.json({
      order: {
        code: order.orderCode,
        id: order.id.toString()
      }
    });
  } catch (error) {
    if (error instanceof CheckoutOrderValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Ma don hang da ton tai. Vui long thu lai." },
        { status: 409 }
      );
    }

    console.error("create checkout order failed:", error);
    return NextResponse.json(
      { message: "Khong luu duoc don hang. Vui long thu lai sau." },
      { status: 500 }
    );
  }
}
