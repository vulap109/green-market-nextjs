import Link from "next/link";
import type { Metadata } from "next";
import {
  ADMIN_PRODUCT_STATUS_OPTIONS,
  ADMIN_PRODUCTS_LIMIT,
  type AdminProductFilters,
  type AdminProductListItem,
  findAdminProducts,
  getAdminProductCategoryOptions
} from "@/lib/admin-products";
import { getSearchParamValue } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm"
};

type AdminProductsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

const statusBadgeClassNameByStatus: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200"
};

function resolveAdminProductFilters(
  searchParams: Record<string, string | string[] | undefined>
): AdminProductFilters {
  return {
    category: getSearchParamValue(searchParams.category),
    keyword: getSearchParamValue(searchParams.keyword),
    status: getSearchParamValue(searchParams.status)
  };
}

function getProductCategoryLabel(product: AdminProductListItem): string {
  if (!product.categoryName) {
    return "Chưa phân loại";
  }

  return product.parentCategoryName
    ? `${product.parentCategoryName} / ${product.categoryName}`
    : product.categoryName;
}

function formatOptionalMoney(amount: number): string {
  return amount > 0 ? formatMoney(amount) : "-";
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const paramsValue = await searchParams;
  const filters = resolveAdminProductFilters(paramsValue);
  const [categoryOptions, productResult] = await Promise.all([
    getAdminProductCategoryOptions(),
    findAdminProducts(filters)
  ]);
  const hasMoreProducts = productResult.totalProducts > productResult.items.length;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Sản phẩm</h2>
          <p className="mt-1 text-sm text-slate-600">
            Quản lý danh sách sản phẩm, trạng thái hiển thị, danh mục, giá bán và thứ tự sắp xếp.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-[#004e29]"
        >
          <i className="fa-solid fa-plus text-xs" aria-hidden="true" />
          <span>Thêm sản phẩm</span>
        </Link>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <form action="/admin/products" method="get" className="grid gap-4 p-4 lg:grid-cols-[1fr_220px_260px_auto]">
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tên / SKU / slug</span>
            <input
              name="keyword"
              defaultValue={filters.keyword}
              placeholder="Nhập tên sản phẩm..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Trạng thái</span>
            <select
              name="status"
              defaultValue={filters.status}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Tất cả trạng thái</option>
              {ADMIN_PRODUCT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Danh mục</span>
            <select
              name="category"
              defaultValue={filters.category}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="">Tất cả danh mục</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <i className="fa-solid fa-filter text-xs" aria-hidden="true" />
              <span>Apply</span>
            </button>
            <Link
              href="/admin/products"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-primary hover:text-primary"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-950">
            {productResult.totalProducts.toLocaleString("vi-VN")} sản phẩm
          </p>
          {hasMoreProducts ? (
            <p className="text-xs font-medium text-slate-500">
              Đang hiển thị {ADMIN_PRODUCTS_LIMIT} sản phẩm mới cập nhật gần nhất.
            </p>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1220px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Giá</th>
                <th className="px-4 py-3 text-right">Giá Sale</th>
                <th className="px-4 py-3 text-right">Giá gốc</th>
                <th className="px-4 py-3 text-right">Thứ tự</th>
                <th className="px-4 py-3">Cập nhật</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productResult.items.length ? (
                productResult.items.map((product) => (
                  <tr key={product.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-slate-950">{product.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          SKU: {product.sku} · Slug: {product.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{getProductCategoryLabel(product)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                          statusBadgeClassNameByStatus[product.status] ||
                          "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {product.status || "Không rõ"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-slate-950">{formatMoney(product.price)}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatOptionalMoney(product.salePrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatOptionalMoney(product.costPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {product.sortOrder.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {product.updatedAt.toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
                      >
                        <i className="fa-solid fa-pen-to-square text-xs" aria-hidden="true" />
                        <span>Sửa</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-500">
                    Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
