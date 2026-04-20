import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getNewsData } from "@/lib/data";
import { buildNewsDetailUrl } from "@/lib/news";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin tức mới nhất từ Green Market."
};

export default async function NewsPage() {
  const newsItems = await getNewsData();
  const firstNewsSlug = String(newsItems[0]?.slug || "").trim();

  if (!firstNewsSlug) {
    notFound();
  }

  redirect(buildNewsDetailUrl(firstNewsSlug));
}
