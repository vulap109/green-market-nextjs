"use client";

import { useEffect, useRef, useState } from "react";

const PRODUCT_DESCRIPTION_COLLAPSED_HEIGHT = 260;
const PRODUCT_DESCRIPTION_COLLAPSE_OFFSET = 24;

type ProductDescriptionProps = Readonly<{
  html: string;
}>;

export default function ProductDescription({ html }: ProductDescriptionProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    function syncContentHeight() {
      const contentElement = contentRef.current;
      if (!contentElement) {
        return;
      }

      const nextHeight = contentElement.scrollHeight;
      setContentHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    }

    syncContentHeight();

    const contentElement = contentRef.current;
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(syncContentHeight);
    resizeObserver?.observe(contentElement);
    window.addEventListener("resize", syncContentHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", syncContentHeight);
    };
  }, [html]);

  const isExpandable = contentHeight > PRODUCT_DESCRIPTION_COLLAPSED_HEIGHT + PRODUCT_DESCRIPTION_COLLAPSE_OFFSET;
  const wrapperMaxHeight = isExpandable
    ? `${isExpanded ? contentHeight : PRODUCT_DESCRIPTION_COLLAPSED_HEIGHT}px`
    : contentHeight
      ? `${contentHeight}px`
      : undefined;

  return (
    <div className="mt-4">
      <div
        className="relative overflow-hidden text-sm leading-relaxed text-gray-600 transition-all duration-300 ease-in-out"
        style={{ maxHeight: wrapperMaxHeight }}
      >
        <div ref={contentRef} className="space-y-4" dangerouslySetInnerHTML={{ __html: html }} />
        {isExpandable ? (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent transition-opacity duration-300 ${isExpanded ? "opacity-0" : "opacity-100"
              }`}
          />
        ) : null}
      </div>

      {isExpandable ? (
        <button
          type="button"
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-green-50"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? "Thu gọn" : "Xem thêm"}</span>
          <i className={`fa-solid ${isExpanded ? "fa-angle-up" : "fa-angle-down"} text-xs`}></i>
        </button>
      ) : null}
    </div>
  );
}
