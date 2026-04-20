import Link from "next/link";
import { ALL_PRODUCTS_ROUTE, HOME_ROUTE } from "@/lib/routes";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-16 md:py-24">
      <section className="w-full overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-[linear-gradient(135deg,#004e29_0%,#006b38_55%,#2f8f57_100%)] px-6 py-10 text-white md:px-10 md:py-14">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-white/70">404</p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
              Không tìm thấy trang bạn đang cần.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/85">
              Liên kết có thể đã bị đổi, nhập sai đường dẫn hoặc sản phẩm không còn tồn tại.
            </p>
          </div>

          <div className="flex flex-col justify-center px-6 py-10 md:px-10 md:py-14">
            <div className="rounded-3xl border border-green-100 bg-green-50/70 p-6">
              <p className="text-sm leading-7 text-gray-600">
                Bạn có thể quay về trang chủ hoặc mở danh mục sản phẩm để tiếp tục tìm kiếm.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={HOME_ROUTE}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-[#004e29]"
                >
                  Về trang chủ
                </Link>
                <Link
                  href={ALL_PRODUCTS_ROUTE}
                  className="inline-flex items-center justify-center rounded-full border border-primary px-6 py-3 text-sm font-bold text-primary transition hover:bg-green-50"
                >
                  Xem sản phẩm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
