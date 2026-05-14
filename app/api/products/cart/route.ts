import { NextResponse } from "next/server";
import { findProductsByIds } from "@/lib/product-db";

type CartProductsRequestBody = {
  ids?: unknown;
};

async function getRequestBody(request: Request): Promise<CartProductsRequestBody> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as CartProductsRequestBody) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = await getRequestBody(request);
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((id): id is bigint | number | string =>
        ["bigint", "number", "string"].includes(typeof id)
      )
    : [];
  const items = await findProductsByIds(ids);

  return NextResponse.json({ items });
}
