import { NEWS_ROUTE } from "@/lib/routes";
import { formatLowercaseString, formatString } from "@/lib/utils";
import type { NewsArticle } from "@/lib/types";

export const NEWS_DATA_URL = "/data/news.json";

export function buildNewsDetailUrl(slug?: string | null): string {
  const nextSlug = formatString(slug);
  return nextSlug ? `${NEWS_ROUTE}/${encodeURIComponent(nextSlug)}` : NEWS_ROUTE;
}

export function getNewsTimestamp(article?: NewsArticle | null): number {
  const timestamp = Date.parse(String(article?.date || ""));
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function sortNewsByDateDesc(newsItems: NewsArticle[] = []): NewsArticle[] {
  return newsItems.slice().sort((left, right) => getNewsTimestamp(right) - getNewsTimestamp(left));
}

export function sortHighlightedNews(newsItems: NewsArticle[] = []): NewsArticle[] {
  return newsItems.slice().sort((left, right) => {
    const featuredDiff = Number(Boolean(right?.featured)) - Number(Boolean(left?.featured));
    if (featuredDiff !== 0) {
      return featuredDiff;
    }

    return getNewsTimestamp(right) - getNewsTimestamp(left);
  });
}

export function findNewsArticle(newsItems: NewsArticle[] = [], slug?: string | null): NewsArticle | null {
  if (!newsItems.length) {
    return null;
  }

  const requestedSlug = formatLowercaseString(slug);
  if (!requestedSlug) {
    return newsItems[0] ?? null;
  }

  return (
    newsItems.find((item) => formatLowercaseString(item?.slug) === requestedSlug) ?? null
  );
}
