import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsArticleClient from "@/components/news/NewsArticleClient";
import { getNewsData } from "@/lib/data";
import { findNewsArticle } from "@/lib/news";
import { getNewsArticleContent } from "@/lib/news-content";
import { formatLowercaseString, formatString } from "@/lib/utils";

type NewsArticlePageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

async function getNewsPageData(slug: string) {
  const normalizedSlug = formatLowercaseString(slug);

  if (!normalizedSlug) {
    return {
      article: null,
      contentHtml: ""
    };
  }

  const newsItems = await getNewsData();
  const article = findNewsArticle(newsItems, normalizedSlug);

  if (!article) {
    return {
      article: null,
      contentHtml: ""
    };
  }

  const contentHtml = await getNewsArticleContent(article.contentFile);
  return {
    article,
    contentHtml
  };
}

export async function generateStaticParams() {
  const newsItems = await getNewsData();

  return newsItems
    .map((article) => formatString(article.slug))
    .filter(Boolean)
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const routeParams = await params;
  const { article } = await getNewsPageData(routeParams.slug);

  if (!article) {
    return {
      title: "Không tìm thấy bài viết",
      description: "Đường dẫn bài viết không hợp lệ hoặc nội dung này chưa được xuất bản."
    };
  }

  return {
    title: article.title || "Tin tức",
    description: article.description || "Tin tức mới nhất từ Green Market.",
    openGraph: {
      title: article.title || "Tin tức",
      description: article.description || "Tin tức mới nhất từ Green Market.",
      images: article.hero || article.thumbnail ? [String(article.hero || article.thumbnail)] : undefined
    },
    twitter: {
      title: article.title || "Tin tức",
      description: article.description || "Tin tức mới nhất từ Green Market.",
      images: article.hero || article.thumbnail ? [String(article.hero || article.thumbnail)] : undefined
    }
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const routeParams = await params;
  const { article, contentHtml } = await getNewsPageData(routeParams.slug);

  if (!article) {
    notFound();
  }

  return <NewsArticleClient article={article} contentHtml={contentHtml} />;
}
