import AdminProductImageFields, { type AdminProductImageFieldValue } from "./AdminProductImageFields";
import AdminProductVariantFields, {
  type AdminProductVariantFieldValue
} from "./AdminProductVariantFields";
import { ADMIN_PRODUCT_STATUS_OPTIONS } from "@/lib/admin-products";
import type { AdminCreateProductInput, AdminProductCategoryOption } from "@/lib/product-types";

export type AdminProductFormValues = Omit<AdminCreateProductInput, "images" | "variants">;

type AdminProductFormFieldsProps = Readonly<{
  categoryOptions: ReadonlyArray<AdminProductCategoryOption>;
  existingImages?: ReadonlyArray<AdminProductImageFieldValue>;
  values?: Partial<AdminProductFormValues>;
  variants?: ReadonlyArray<AdminProductVariantFieldValue>;
}>;

const emptyFormValues: AdminProductFormValues = {
  category: "",
  costPrice: 0,
  description: "",
  featured: "",
  name: "",
  price: 0,
  salePrice: 0,
  shortDescription: "",
  sku: "",
  slug: "",
  sortOrder: 0,
  status: "draft",
  stockQuantity: 0,
  thumbnail: ""
};

export default function AdminProductFormFields({
  categoryOptions,
  existingImages = [],
  values,
  variants
}: AdminProductFormFieldsProps) {
  const productValues = {
    ...emptyFormValues,
    ...values
  };

  return (
    <>
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
              defaultValue={productValues.name}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Slug</span>
            <input
              name="slug"
              required
              defaultValue={productValues.slug}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">SKU</span>
            <input
              name="sku"
              required
              defaultValue={productValues.sku}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Danh mục</span>
            <select
              name="category"
              defaultValue={productValues.category}
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
              defaultValue={productValues.status}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              {ADMIN_PRODUCT_STATUS_OPTIONS.map((status) => (
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
              defaultValue={productValues.thumbnail}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Featured</span>
            <input
              name="featured"
              placeholder="ban-chay, khuyen-mai-hot..."
              defaultValue={productValues.featured}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
        </div>
      </section>

      <AdminProductImageFields existingImages={existingImages} />

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
              defaultValue={productValues.price}
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
              defaultValue={productValues.salePrice}
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
              defaultValue={productValues.costPrice}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Stock</span>
            <input
              name="stockQuantity"
              type="number"
              min="0"
              defaultValue={productValues.stockQuantity}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Thứ tự</span>
            <input
              name="sortOrder"
              type="number"
              defaultValue={productValues.sortOrder}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
        </div>
      </section>

      <AdminProductVariantFields variants={variants} />

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
              defaultValue={productValues.shortDescription}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Mô tả chi tiết</span>
            <textarea
              name="description"
              rows={7}
              defaultValue={productValues.description}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
        </div>
      </section>
    </>
  );
}
