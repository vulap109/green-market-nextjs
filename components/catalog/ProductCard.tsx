import Image from "next/image";
import Link from "next/link";
import { resolveAssetPath } from "@/lib/assets";
import { formatProductMoney } from "@/lib/format";
import { getProductDiscount, getProductSalePrice, getProductPrice, getProductSlug } from "@/lib/products";
import { buildProductDetailUrl } from "@/lib/routes";
import type { ProductRecord } from "@/lib/types";

type ProductCardProps = Readonly<{
  product: ProductRecord;
}>;

export default function ProductCard({ product }: ProductCardProps) {
  const productName = product.name || "Sản phẩm";
  const productSlug = getProductSlug(product);
  const productHref = buildProductDetailUrl({ slug: productSlug });
  const salePrice = getProductSalePrice(product);
  const originalPrice = getProductPrice(product);
  const discount = getProductDiscount(product);
  const imageSrc = resolveAssetPath(product.img) || "/images/sp1.jpg";
  const showContactPrice = originalPrice <= 0 && salePrice <= 0;
  const showOriginalPrice = originalPrice > salePrice;
  const showFlashSale = !showContactPrice && discount >= 11;

  return (
    <article className="product-card group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl">
      <Link href={productHref} className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <Image
          src={imageSrc}
          alt={productName}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
          className="object-cover transition-all duration-500 group-hover:scale-105"
        />
        {!showContactPrice && discount > 0 ? (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
            -{discount}%
          </span>
        ) : null}
        {showFlashSale ? (
          <Image
            src="/images/icon_flash_sale.png"
            alt="Flash sale"
            width={152}
            height={63}
            className="absolute right-2 top-0 h-auto w-20 object-contain"
          />
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-3 py-5 text-center sm:px-5">
        <Link
          href={productHref}
          className="mb-2 line-clamp-2 text-sm font-bold leading-tight text-gray-800 transition hover:text-primary"
        >
          {productName}
        </Link>

        <div className="mt-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-base font-black text-red-600">
              {showContactPrice ? "Liên Hệ" : formatProductMoney(salePrice)}
            </span>
            {!showContactPrice && showOriginalPrice ? (
              <span className="text-xs font-medium text-gray-400 line-through">
                {formatProductMoney(originalPrice)}
              </span>
            ) : null}
          </div>
          <Link
            href={productHref}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-white py-2.5 text-[11px] font-black uppercase tracking-wider text-primary transition-all hover:bg-red-500 hover:text-white"
          >
            Chon mua
          </Link>
        </div>
      </div>
    </article>
  );
}
