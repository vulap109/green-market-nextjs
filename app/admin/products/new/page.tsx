import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  type AdminCreateProductInput,
  createAdminProduct,
  getAdminProductCategoryOptions,
  getAdminProductStatusOptions
} from "@/lib/admin-products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thêm sản phẩm"
};

function getFormString(formData: FormData, key: keyof AdminCreateProductInput): string {
  return String(formData.get(key) || "").trim();
}

function getFormNumber(formData: FormData, key: keyof AdminCreateProductInput): number {
  const value = Number(getFormString(formData, key));
  return Number.isFinite(value) ? value : 0;
}

async function createProductAction(formData: FormData) {
  "use server";

  await createAdminProduct({
    category: getFormString(formData, "category"),
    costPrice: getFormNumber(formData, "costPrice"),
    description: getFormString(formData, "description"),
    featured: getFormString(formData, "featured"),
    name: getFormString(formData, "name"),
    price: getFormNumber(formData, "price"),
    salePrice: getFormNumber(formData, "salePrice"),
    shortDescription: getFormString(formData, "shortDescription"),
    sku: getFormString(formData, "sku"),
    slug: getFormString(formData, "slug"),
    sortOrder: getFormNumber(formData, "sortOrder"),
    status: getFormString(formData, "status"),
    stockQuantity: getFormNumber(formData, "stockQuantity"),
    thumbnail: getFormString(formData, "thumbnail")
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export default async function AdminNewProductPage() {
  const [categoryOptions, statusOptions] = await Promise.all([
    getAdminProductCategoryOptions(),
    getAdminProductStatusOptions()
  ]);
  const resolvedStatusOptions = statusOptions.length ? statusOptions : ["draft", "active", "inactive"];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Thêm sản phẩm</h2>
          <p className="mt-1 text-sm text-slate-600">
            Tạo sản phẩm mới trong hệ thống quản trị.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
        >
          <i className="fa-solid fa-arrow-left text-xs" aria-hidden="true" />
          <span>Danh sách</span>
        </Link>
      </section>

      <form action={createProductAction} className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-950">Thông tin cơ bản</h3>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tên sản phẩm</span>
              <input
                name="name"
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Slug</span>
              <input
                name="slug"
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">SKU</span>
              <input
                name="sku"
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Danh mục</span>
              <select
                name="category"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Chưa phân loại</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</span>
              <select
                name="status"
                defaultValue="draft"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {resolvedStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Thumbnail URL</span>
              <input
                name="thumbnail"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Featured</span>
              <input
                name="featured"
                placeholder="ban-chay, khuyen-mai-hot..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-950">Giá và sắp xếp</h3>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-5">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Giá</span>
              <input
                name="price"
                type="number"
                min="0"
                step="1000"
                defaultValue="0"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Giá Sale</span>
              <input
                name="salePrice"
                type="number"
                min="0"
                step="1000"
                defaultValue="0"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Giá gốc</span>
              <input
                name="costPrice"
                type="number"
                min="0"
                step="1000"
                defaultValue="0"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Stock</span>
              <input
                name="stockQuantity"
                type="number"
                min="0"
                defaultValue="0"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Thứ tự</span>
              <input
                name="sortOrder"
                type="number"
                defaultValue="0"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-950">Mô tả</h3>
          </div>

          <div className="grid gap-4 p-5">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Mô tả ngắn</span>
              <textarea
                name="shortDescription"
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Mô tả chi tiết</span>
              <textarea
                name="description"
                rows={7}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
          >
            Hủy
          </Link>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-[#004e29]"
          >
            <i className="fa-solid fa-floppy-disk text-xs" aria-hidden="true" />
            <span>Lưu sản phẩm</span>
          </button>
        </div>
      </form>
    </div>
  );
}
