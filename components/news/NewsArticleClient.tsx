"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/static/StaticPageShell";
import { buildCollectionUrl } from "@/lib/catalog";
import { HOME_ROUTE, NEWS_ROUTE } from "@/lib/routes";
import { formatString, resolveAssetPath } from "@/lib/utils";
import type { NewsArticle } from "@/lib/types";

type FeedbackState = {
  tone: "error" | "success";
  text: string;
};

type NewsArticleClientProps = Readonly<{
  article: NewsArticle;
  contentHtml: string;
}>;

function ShareIcon({ label }: Readonly<{ label: string }>) {
  return <span aria-hidden="true" className="text-xs font-black uppercase">{label}</span>;
}

export default function NewsArticleClient({ article, contentHtml }: NewsArticleClientProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const articleTitle = article.title || "Tin tức";
  const articleAuthor = article.author || "Green Market";
  const dateLabel = article.dateLabel || article.date || "";
  const heroImagePath =
    resolveAssetPath(article.hero || article.thumbnail) || "/images/news-8-3-thumb.jpg";
  const heroImageAlt = article.heroAlt || article.thumbnailAlt || articleTitle;

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    function handleContentClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const actionElement = target?.closest<HTMLElement>("[data-news-action]");
      if (!actionElement) {
        return;
      }

      const action = actionElement.dataset.newsAction;
      if (action === "toggle-toc") {
        const tocList = contentRef.current?.querySelector<HTMLElement>("#tocList");
        if (!tocList) {
          return;
        }

        const shouldHide = !tocList.classList.contains("hidden");
        tocList.classList.toggle("hidden", shouldHide);
        actionElement.textContent = shouldHide ? "[Hiện]" : "[Ẩn]";
        return;
      }

      if (action === "open-catalog") {
        const category = formatString(actionElement.dataset.newsCategory);
        router.push(buildCollectionUrl({ category }));
      }
    }

    const contentElement = contentRef.current;
    contentElement.addEventListener("click", handleContentClick);

    return () => {
      contentElement.removeEventListener("click", handleContentClick);
    };
  }, [router]);

  useEffect(() => {
    if (!window.location.hash) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const targetSection = document.querySelector(window.location.hash);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [contentHtml]);

  async function handleCopyLink() {
    const articleUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(articleUrl);
      setFeedback({
        text: "Đã sao chép link bài viết.",
        tone: "success"
      });
    } catch (error) {
      console.error("copy article link failed:", error);
      window.prompt("Sao chép link bài viết:", articleUrl);
    }
  }

  function handleShare(platform: "facebook" | "twitter" | "copy") {
    const articleUrl = window.location.href;

    if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    if (platform === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    void handleCopyLink();
  }

  return (
    <>
      {feedback ? (
        <div
          className={`fixed right-4 top-24 z-[150] rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-2xl ${
            feedback.tone === "success" ? "bg-[#0d6b38]" : "bg-[#ed1b24]"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <Breadcrumbs
        items={[
          { href: HOME_ROUTE, label: "Trang chủ" },
          { href: NEWS_ROUTE, label: "Tin tức" },
          { label: articleTitle }
        ]}
      />

      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <article>
          <header className="mb-8">
            <h1 className="mb-4 text-2xl leading-tight font-bold text-gray-900 md:text-[32px]">
              {articleTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>bởi: {articleAuthor}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span>{dateLabel}</span>
            </div>
          </header>

          <figure className="relative mb-10 w-full overflow-hidden rounded-xl">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={heroImagePath}
                alt={heroImageAlt}
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
            </div>
          </figure>

          <div
            ref={contentRef}
            className="news-prose max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          <div className="mt-12 flex items-center gap-4 border-t border-gray-200 pt-6">
            <span className="text-sm font-bold text-gray-700">Chia sẻ bài viết:</span>
            <button
              type="button"
              onClick={() => handleShare("facebook")}
              aria-label="Chia sẻ Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
            >
              <ShareIcon label="F" />
            </button>
            <button
              type="button"
              onClick={() => handleShare("twitter")}
              aria-label="Chia sẻ Twitter"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-600"
            >
              <ShareIcon label="X" />
            </button>
            <button
              type="button"
              onClick={() => handleShare("copy")}
              aria-label="Sao chép liên kết bài viết"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white transition hover:bg-green-600"
            >
              <ShareIcon label="L" />
            </button>
          </div>
        </article>
      </main>
    </>
  );
}
