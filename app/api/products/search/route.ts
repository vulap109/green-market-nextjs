import { NextResponse } from "next/server";
import { findProductsByKeyword } from "@/lib/product-detail";

const DEFAULT_SEARCH_LIMIT = 4;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword");
  const items = await findProductsByKeyword(keyword, DEFAULT_SEARCH_LIMIT);

  return NextResponse.json({ items });
}
