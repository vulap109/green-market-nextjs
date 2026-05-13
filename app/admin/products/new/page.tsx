import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { put } from "@vercel/blob";
import AdminProductForm, { type AdminProductFormState } from "../_components/AdminProductForm";
import {
  type AdminProductImageInput,
  type AdminCreateProductInput,
  createAdminProduct,
  findAdminProductIdentityConflict,
  getAdminProductCategoryOptions,
  getAdminProductStatusOptions
} from "@/lib/admin-products";
import { Prisma } from "@/generated/prisma/client";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_ALLOWED_TYPES,
  PRODUCT_IMAGE_TOTAL_MAX_BYTES,
  PRODUCT_IMAGE_TOTAL_MAX_LABEL,
  PRODUCT_IMAGE_UPLOAD_LIMIT
} from "@/lib/product-image-upload";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thêm sản phẩm"
};

type AdminCreateProductField = Exclude<keyof AdminCreateProductInput, "images">;

function createFormError(message: string): AdminProductFormState {
  return {
    message,
    nonce: `${Date.now()}-${Math.random()}`,
    status: "error"
  };
}

function getDuplicateProductMessage(conflict: "sku" | "slug"): string {
  return conflict === "slug"
    ? "Slug này đã tồn tại. Vui lòng nhập slug khác."
    : "SKU này đã tồn tại. Vui lòng nhập SKU khác.";
}

function getCreateProductErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const errorText = `${JSON.stringify(error.meta || {})} ${error.message}`;

    if (errorText.includes("product_slug_key") || errorText.includes("slug")) {
      return getDuplicateProductMessage("slug");
    }

    if (errorText.includes("product_sku_key") || errorText.includes("sku")) {
      return getDuplicateProductMessage("sku");
    }

    return "Dữ liệu sản phẩm bị trùng với một sản phẩm đã có.";
  }

  return error instanceof Error ? error.message : "Không thể tạo sản phẩm. Vui lòng thử lại.";
}

function getFormString(formData: FormData, key: AdminCreateProductField): string {
  return String(formData.get(key) || "").trim();
}

function getFormNumber(formData: FormData, key: AdminCreateProductField): number {
  const value = Number(getFormString(formData, key));
  return Number.isFinite(value) ? value : 0;
}

function getProductImageFiles(formData: FormData): File[] {
  return formData
    .getAll("productImages")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function isAllowedProductImageType(contentType: string): boolean {
  return PRODUCT_IMAGE_ALLOWED_TYPES.some((allowedType) => allowedType === contentType);
}

function getFileExtension(file: File): string {
  const nameExtension = file.name.match(/\.[a-z0-9]+$/i)?.[0]?.toLowerCase();

  if (nameExtension) {
    return nameExtension;
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  return ".jpg";
}

function getUploadPathname(file: File, index: number): string {
  const extension = getFileExtension(file);
  const fileStem = file.name.replace(/\.[^.]+$/, "");
  const safeStem =
    fileStem
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "product-image";

  return `products/${Date.now()}-${index + 1}-${safeStem}${extension}`;
}

function validateProductImageFiles(files: File[]): void {
  if (files.length > PRODUCT_IMAGE_UPLOAD_LIMIT) {
    throw new Error(`Chỉ được upload tối đa ${PRODUCT_IMAGE_UPLOAD_LIMIT} ảnh.`);
  }

  const unsupportedFile = files.find((file) => !isAllowedProductImageType(file.type));

  if (unsupportedFile) {
    throw new Error(`${unsupportedFile.name} không đúng định dạng JPG, PNG hoặc WEBP.`);
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > PRODUCT_IMAGE_TOTAL_MAX_BYTES) {
    throw new Error(
      `Tổng dung lượng ảnh là ${formatFileSize(totalSize)}, vượt quá giới hạn ${PRODUCT_IMAGE_TOTAL_MAX_LABEL}.`
    );
  }
}

async function uploadProductImages(files: File[]): Promise<AdminCreateProductInput["images"]> {
  validateProductImageFiles(files);

  const uploadedImages: AdminProductImageInput[] = [];

  for (const [index, file] of files.entries()) {
    const blob = await put(getUploadPathname(file, index), file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type
    });

    uploadedImages.push({
      imageUrl: blob.url,
      storageKey: blob.pathname
    });
  }

  return uploadedImages;
}

async function createProductAction(
  _state: AdminProductFormState,
  formData: FormData
): Promise<AdminProductFormState> {
  "use server";

  try {
    const sku = getFormString(formData, "sku");
    const slug = getFormString(formData, "slug");
    const conflict = await findAdminProductIdentityConflict({ sku, slug });

    if (conflict) {
      return createFormError(getDuplicateProductMessage(conflict));
    }

    const productImages = await uploadProductImages(getProductImageFiles(formData));

    await createAdminProduct({
      category: getFormString(formData, "category"),
      costPrice: getFormNumber(formData, "costPrice"),
      description: getFormString(formData, "description"),
      featured: getFormString(formData, "featured"),
      images: productImages,
      name: getFormString(formData, "name"),
      price: getFormNumber(formData, "price"),
      salePrice: getFormNumber(formData, "salePrice"),
      shortDescription: getFormString(formData, "shortDescription"),
      sku,
      slug,
      sortOrder: getFormNumber(formData, "sortOrder"),
      status: getFormString(formData, "status"),
      stockQuantity: getFormNumber(formData, "stockQuantity"),
      thumbnail: getFormString(formData, "thumbnail")
    });
  } catch (error) {
    return createFormError(getCreateProductErrorMessage(error));
  }

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

      <AdminProductForm action={createProductAction}>
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
            <h3 className="text-sm font-bold text-slate-950">Ảnh sản phẩm</h3>
          </div>

          <div className="grid gap-4 p-5">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Upload ảnh
              </span>
              <input
                type="file"
                name="productImages"
                accept={PRODUCT_IMAGE_ACCEPT}
                multiple
                className="block w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-bold file:text-white hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
              <span className="block text-xs font-medium text-slate-500">
                Tối đa 5 ảnh, tổng dung lượng tối đa 4.5MB. Ảnh đầu tiên sẽ là ảnh chính.
              </span>
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
      </AdminProductForm>
    </div>
  );
}
