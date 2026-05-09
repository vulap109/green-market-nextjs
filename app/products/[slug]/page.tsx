import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/catalog/ProductCard";
import ProductDescription from "@/components/product/ProductDescription";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import { resolveAssetPath } from "@/lib/assets";
import { buildCollectionUrl } from "@/lib/catalog";
import {
  findProductBySlug,
  getSimilarProducts
} from "@/lib/product-detail";
import { getProductCollectionCategory } from "@/lib/products";
import { HOME_ROUTE } from "@/lib/routes";

type ProductPageProps = Readonly<{
  params: Promise<{
    slug: string;
  }>;
}>;

function getRouteParamValue(value?: string): string {
  return String(value || "").trim();
}

function ServiceItem({
  iconClassName,
  text,
  toneClassName
}: Readonly<{
  iconClassName: string;
  text: string;
  toneClassName: string;
}>) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 text-xl ${toneClassName}`}>
        <i className={iconClassName}></i>
      </span>
      <span className="text-xs leading-snug text-gray-600">{text}</span>
    </li>
  );
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const routeParams = await params;
  const product = await findProductBySlug(getRouteParamValue(routeParams.slug));

  return {
    title: product?.name || "Thông Tin Sản Phẩm"
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const routeParams = await params;
  const productSlug = getRouteParamValue(routeParams.slug).toLowerCase();

  if (!productSlug) {
    notFound();
  }

  const product = await findProductBySlug(productSlug);
  if (!product) {
    notFound();
  }

  const productImage = resolveAssetPath(product.img);
  const descriptionHtml = product.description?.trim() || "<p>Đang cập nhật mô tả sản phẩm.</p>";
  const similarProducts = await getSimilarProducts(product, 5);
  const categoryCatalogLink = {
    href: buildCollectionUrl({ category: getProductCollectionCategory(product) }),
    title: product.parentCategoryName || product.categoryName || "Sản phẩm"
  };

  return (
    <>
      <div className="py-3">
        <div className="mx-auto max-w-7xl px-4 text-xs text-gray-500">
          <Link href={HOME_ROUTE} className="transition hover:text-primary">
            Trang Chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href={categoryCatalogLink.href} className="transition hover:text-primary">
            {categoryCatalogLink.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-800">{product.name || "Chi tiết sản phẩm"}</span>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-8">
        <div className="relative flex flex-col gap-10 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:p-8">
          <div className="flex w-full flex-col gap-4 md:w-5/12">
            <div className="group relative aspect-square w-full cursor-crosshair overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={productImage}
                alt={product.name || "Sản phẩm"}
                fill
                priority
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex gap-2">
              <div className="h-20 w-20 cursor-pointer overflow-hidden rounded border-2 border-primary">
                <Image
                  src={productImage}
                  alt={product.name || "Ảnh sản phẩm"}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-4/12">
            <ProductPurchasePanel product={product} />
          </div>

          <div className="w-full md:w-3/12">
            <div className="h-full rounded-lg border border-primary bg-white p-5">
              <h2 className="mb-5 border-b border-gray-100 pb-2 font-bold text-gray-800">
                Tiêu chuẩn dịch vụ
              </h2>
              <ul className="space-y-5 text-sm">
                <ServiceItem
                  iconClassName="fa-solid fa-basket-wheat"
                  toneClassName="text-primary"
                  text="Giỏ trái cây mix tone màu theo yêu cầu để phù hợp với từng dịp đặc biệt"
                />
                <ServiceItem
                  iconClassName="fa-solid fa-envelope-open-text"
                  toneClassName="text-primary"
                  text="Tặng kèm banner và thiệp chúc mừng thiết kế theo yêu cầu"
                />
                <ServiceItem
                  iconClassName="fa-solid fa-file-invoice-dollar"
                  toneClassName="text-red-500"
                  text="Hỗ trợ xuất hóa đơn VAT cho doanh nghiệp"
                />
                <ServiceItem
                  iconClassName="fa-solid fa-truck-fast"
                  toneClassName="text-yellow-500"
                  text="Giao hàng nhanh chóng, đảm bảo chất lượng"
                />
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="inline-block border-b border-primary pb-2 text-lg font-bold text-gray-800">
            Mô tả sản phẩm
          </h2>
          <ProductDescription html={descriptionHtml} />
        </div>

        {similarProducts.length ? (
          <section className="mt-8">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-800">Sản phẩm tương tự</h2>
                <Link href={categoryCatalogLink.href} className="text-xs font-bold text-primary hover:underline">
                  Xem tất cả
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-5">
                {similarProducts.map((similarProduct) => (
                  <ProductCard
                    key={String(similarProduct.id ?? similarProduct.slug)}
                    product={similarProduct}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
