import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type {
  NewsArticle,
  ProvinceRecord
} from "@/lib/types";

async function readPublicJson<T>(relativePath: string): Promise<T> {
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  const rawData = await readFile(absolutePath, "utf8");
  return JSON.parse(rawData) as T;
}

export const getNewsData = cache(async (): Promise<NewsArticle[]> => {
  const data = await readPublicJson<unknown>("data/news.json");
  return Array.isArray(data) ? (data as NewsArticle[]) : [];
});

export const getVietnamAddressData = cache(async (): Promise<ProvinceRecord[]> => {
  const data = await readPublicJson<unknown>("data/vietnamAddress.json");
  return Array.isArray(data) ? (data as ProvinceRecord[]) : [];
});
