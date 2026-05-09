import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

function createContentUnavailableMarkup(): string {
  return `
    <div class="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-sm text-gray-500">
      Không tải được nội dung bài viết. Vui lòng thử tải lại trang sau ít phút.
    </div>
  `;
}

function resolveNewsContentPath(contentFile?: string | null): string | null {
  const normalizedPath = String(contentFile || "").trim();
  if (!normalizedPath) {
    return null;
  }

  const withoutLeadingSlash = normalizedPath.replace(/^\/+/, "");
  if (!withoutLeadingSlash.startsWith("data/news/") || !withoutLeadingSlash.endsWith(".html")) {
    return null;
  }

  return path.join(process.cwd(), "public", withoutLeadingSlash);
}

function normalizeNewsContentHtml(contentHtml: string): string {
  return contentHtml
    .replace(/\s+onclick="toggleTOC\(\)"/g, ' data-news-action="toggle-toc"')
    .replace(
      /\s+onclick="showCollectionPage\('([^']+)'\)"/g,
      ' data-news-action="open-catalog" data-news-category="$1"'
    );
}

const readNewsContentFile = cache(async (absolutePath: string): Promise<string> => {
  try {
    const rawContent = await readFile(absolutePath, "utf8");
    return normalizeNewsContentHtml(rawContent);
  } catch (error) {
    console.error("readNewsContentFile error:", error);
    return createContentUnavailableMarkup();
  }
});

export async function getNewsArticleContent(contentFile?: string | null): Promise<string> {
  const absolutePath = resolveNewsContentPath(contentFile);
  if (!absolutePath) {
    return createContentUnavailableMarkup();
  }

  return readNewsContentFile(absolutePath);
}
