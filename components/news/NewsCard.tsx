import Image from "next/image";
import Link from "next/link";
import { buildNewsDetailUrl } from "@/lib/news";
import { resolveAssetPath } from "@/lib/utils";
import type { NewsArticle } from "@/lib/types";

type NewsCardProps = Readonly<{
  article: NewsArticle;
}>;

export default function NewsCard({ article }: NewsCardProps) {
  const articleUrl = buildNewsDetailUrl(article.slug);
  const imageUrl = resolveAssetPath(article.thumbnail || article.hero) || "/images/news-8-3-thumb.jpg";
  const articleTitle = article.title || "Tin tức";
  const articleDescription = article.description || "";
  const imageAlt = article.thumbnailAlt || article.heroAlt || articleTitle;
  const dateLabel = article.dateLabel || article.date || "";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-lg">
      <Link href={articleUrl} className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {dateLabel ? (
          <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 text-[10px] font-medium text-gray-600 backdrop-blur-sm">
            {dateLabel}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link
          href={articleUrl}
          className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-gray-800 transition-colors group-hover:text-primary"
        >
          {articleTitle}
        </Link>
        <p className="mb-4 line-clamp-2 flex-1 text-[13px] leading-relaxed text-gray-500">
          {articleDescription}
        </p>
        <div className="mt-auto">
          <Link
            href={articleUrl}
            className="border-b border-transparent pb-0.5 text-[12px] text-gray-500 transition-colors group-hover:border-primary group-hover:text-primary"
          >
            Xem thêm <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
