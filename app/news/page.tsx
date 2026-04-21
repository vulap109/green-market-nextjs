import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getNewsData } from "@/lib/data";
import {
  buildNewsDetailUrl,
  resolveNewsAssetPath,
  sortNewsByDateDesc
} from "@/lib/news";
import { HOME_ROUTE } from "@/lib/routes";
import type { NewsArticle } from "@/lib/types";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin tức mới nhất từ Green Market."
};

function NewsListItem({ article }: Readonly<{ article: NewsArticle }>) {
  const articleUrl = buildNewsDetailUrl(article.slug);
  const articleTitle = article.title || "Tin tức";
  const articleDescription = article.description || "";
  const imageUrl = resolveNewsAssetPath(article.thumbnail || article.hero) || "/images/news-8-3-thumb.jpg";
  const imageAlt = article.thumbnailAlt || article.heroAlt || articleTitle;
  const author = article.author || "Green Market";
  const dateLabel = article.dateLabel || article.date || "";

  return (
    <article className="group">
      <Link href={articleUrl} className="relative block aspect-[16/9] overflow-hidden bg-gray-100">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      </Link>

      <div className="px-5 pb-6 pt-4 md:px-6">
        <Link
          href={articleUrl}
          className="line-clamp-2 text-xl font-semibold leading-snug text-gray-900 transition group-hover:text-primary"
        >
          {articleTitle}
        </Link>

        {articleDescription ? (
          <p className="mt-3 line-clamp-2 text-sm leading-7 text-gray-600">{articleDescription}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span>bởi: {author}</span>
          {dateLabel ? (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <time dateTime={article.date}>{dateLabel}</time>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default async function NewsPage() {
  const newsItems = sortNewsByDateDesc(await getNewsData());

  return (
    <>
      <div className="border-b border-gray-100 bg-gray-50 py-3">
        <div className="mx-auto max-w-7xl px-4 text-xs text-gray-500">
          <Link href={HOME_ROUTE} className="transition hover:text-primary">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">Tin tức</span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-gray-900">tin tức</h1>

        {newsItems.length ? (
          <div className="grid gap-7 md:grid-cols-2">
            {newsItems.map((article) => (
              <NewsListItem key={String(article.id ?? article.slug)} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
            Chưa có bài viết nào để hiển thị.
          </div>
        )}
      </main>
    </>
  );
}
