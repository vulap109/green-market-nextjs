import Link from "next/link";
import type { ReactNode } from "react";
import ProductCard from "@/components/catalog/ProductCard";
import HomeCarousel from "@/components/home/HomeCarousel";
import NewsCard from "@/components/news/NewsCard";
import { getNewsData, getProductsData } from "@/lib/data";
import { sortHighlightedNews } from "@/lib/news";
import { queryProducts } from "@/lib/products";
import { ALL_PRODUCTS_ROUTE } from "@/lib/routes";

type HomeShelfConfig = {
  ctaHref: string;
  ctaLabel: string;
  ids?: number[];
  category?: string;
  title: string;
  badge?: string;
};

type BenefitItem = {
  description: string;
  icon: ReactNode;
  title: string;
};

type Testimonial = {
  initials: string;
  name: string;
  quote: string;
};

const homeShelfConfigs: HomeShelfConfig[] = [
  {
    title: "Sản Phẩm Bán Chạy",
    badge: "HOT",
    ctaLabel: "Xem tất cả",
    ctaHref: `${ALL_PRODUCTS_ROUTE}?q=ban-chay-nhat`,
    ids: [19, 162, 1, 149, 105, 8, 13, 66]
  },
  {
    title: "Giỏ Quà Trái Cây",
    ctaLabel: "Xem tất cả",
    ctaHref: `${ALL_PRODUCTS_ROUTE}?q=gio-qua-trai-cay`,
    category: "fruit-basket"
  },
  {
    title: "Trái Cây Nhập Khẩu",
    ctaLabel: "Xem tất cả",
    ctaHref: `${ALL_PRODUCTS_ROUTE}?q=trai-cay-nhap-khau`,
    category: "imported-fruits"
  },
  {
    title: "Bánh Kem",
    ctaLabel: "Xem tất cả",
    ctaHref: `${ALL_PRODUCTS_ROUTE}?q=banh-kem`,
    category: "cream-cake"
  }
];

const benefitItems: BenefitItem[] = [
  {
    title: "Trái Cây Tươi Mới",
    description: "Trái cây mùa tuyển chọn, đảm bảo độ tươi ngon nhất.",
    icon: <LeafIcon />
  },
  {
    title: "Đóng Gói Thủ Công",
    description: "Mỗi giỏ quà đều được trang trí thủ công tỉ mỉ.",
    icon: <HeartHandsIcon />
  },
  {
    title: "Giao Hàng Hỏa Tốc",
    description: "Giao hỏa tốc trong ngày tại TP. Hồ Chí Minh.",
    icon: <TruckIcon />
  },
  {
    title: "Quà Tặng Sang Trọng",
    description: "Phù hợp cho mọi dịp lễ, sinh nhật, thăm hỏi.",
    icon: <GiftIcon />
  }
];

const testimonials: Testimonial[] = [
  {
    initials: "NL",
    name: "Nguyễn Thị Lan",
    quote: "Giỏ hoa quả đẹp tuyệt vời! Hoa quả tươi ngon và đóng gói rất sang trọng."
  },
  {
    initials: "TT",
    name: "Trần Minh Tuấn",
    quote: "Tôi đặt giỏ quà tặng đối tác, bưu kiện đến rất nhanh và đẹp mắt."
  },
  {
    initials: "PH",
    name: "Phạm Thu Hương",
    quote: "Dịch vụ chuyên nghiệp, giao hàng đúng giờ. Quả cherry Úc rất giòn."
  }
];

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        d="M12 21v-7m0 0c-4.2 0-6.8-2.4-7.6-6.7C8.7 7.2 11 9 12 14Zm0 0c4.2 0 6.8-2.4 7.6-6.7C15.3 7.2 13 9 12 14Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function HeartHandsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        d="M7 11.5 4.8 9.3a2.8 2.8 0 1 1 4-4L12 8.5l3.2-3.2a2.8 2.8 0 0 1 4 4L17 11.5M7 11.5v5.2A2.3 2.3 0 0 0 9.3 19h5.4a2.3 2.3 0 0 0 2.3-2.3v-5.2M7 11.5h10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        d="M3 7.5h11v7H3Zm11 1.5h3.5l2 2.5v3H14Zm-7.5 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm10 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        d="M4 10.5h16v9H4Zm0 0h16V7H4Zm8 0v9m-4.5-12h9M9.3 7A1.8 1.8 0 1 1 12 4.8 1.8 1.8 0 0 1 14.7 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SectionHeading({
  title,
  ctaHref,
  ctaLabel,
  badge
}: Readonly<{
  badge?: string;
  ctaHref: string;
  ctaLabel: string;
  title: string;
}>) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
      <h2 className="flex items-center gap-3 border-l-4 border-primary pl-4 text-sm font-semibold uppercase tracking-tight text-gray-900 md:text-xl">
        {title}
        {badge ? (
          <span className="rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold italic text-white">
            {badge}
          </span>
        ) : null}
      </h2>
      <Link
        href={ctaHref}
        className="flex items-center gap-2 text-xs font-bold uppercase text-primary hover:text-red-600"
      >
        {ctaLabel}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const allProducts = await getProductsData();
  const newsItems = await getNewsData();
  const homeNewsItems = sortHighlightedNews(newsItems).slice(0, 3);
  const homeShelves = homeShelfConfigs.map((config) => ({
    ...config,
    items: queryProducts(allProducts, {
      ids: config.ids,
      category: config.category,
      limit: 8
    }).items
  }));

  return (
    <main className="pb-24">
      <HomeCarousel />

      {homeShelves.map((shelf) => (
        <section key={shelf.title} className="pt-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading
              title={shelf.title}
              badge={shelf.badge}
              ctaHref={shelf.ctaHref}
              ctaLabel={shelf.ctaLabel}
            />
            {shelf.items.length ? (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {shelf.items.map((product) => (
                  <ProductCard key={String(product.id ?? product.Id ?? product.slug)} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
                Chưa có sản phẩm để hiển thị.
              </div>
            )}
          </div>
        </section>
      ))}

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-medium text-gray-800">Tin tức nổi bật</h2>
          </div>
          {homeNewsItems.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {homeNewsItems.map((article) => (
                <NewsCard key={String(article.id ?? article.slug)} article={article} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
              Chưa có bài viết nào để hiển thị.
            </div>
          )}
        </div>
      </section>

      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-16 text-center text-2xl font-black uppercase tracking-[0.24em] text-primary">
            Tại Sao Chọn Chúng Tôi?
          </h2>

          <div className="grid gap-8 md:grid-cols-4">
            {benefitItems.map((item) => (
              <article
                key={item.title}
                className="group rounded-2xl bg-white p-8 text-center shadow-sm transition-all hover:bg-primary"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-primary transition-all group-hover:bg-white/20 group-hover:text-white">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-xs font-bold uppercase group-hover:text-white">{item.title}</h3>
                <p className="text-[11px] font-medium leading-relaxed text-gray-500 group-hover:text-white/80">
                  {item.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-20 grid grid-cols-3 rounded-3xl bg-primary py-10 text-center text-white shadow-2xl shadow-green-900/20">
            <div className="border-r border-white/10">
              <span className="mb-1 block text-4xl font-black italic">5.000+</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
                Khách hàng hài lòng
              </span>
            </div>
            <div className="border-r border-white/10">
              <span className="mb-1 block text-4xl font-black italic">100%</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
                Đảm bảo tươi ngon
              </span>
            </div>
            <div>
              <span className="mb-1 block text-4xl font-black italic">24/7</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
                Hỗ trợ khách hàng
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Khách Hàng Nói Gì
            <span className="ml-2 text-sm font-bold italic tracking-normal text-yellow-400">★ 4.9/5</span>
          </h2>
          <div className="mx-auto mt-4 h-1.5 w-24 rounded-full bg-primary" />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-lg"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 p-0.5 ring-2 ring-primary/20">
                  <span className="text-sm font-bold text-primary">{testimonial.initials}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold">{testimonial.name}</h3>
                  <div className="text-[9px] text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-xs italic text-gray-500">&quot;{testimonial.quote}&quot;</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
