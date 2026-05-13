import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminProductForm, { type AdminProductFormState } from "../../_components/AdminProductForm";
import AdminProductFormFields from "../../_components/AdminProductFormFields";
import {
  findAdminProductIdentityConflict,
  getAdminProductCategoryOptions,
  getAdminProductForEdit,
  updateAdminProduct
} from "@/lib/admin-products";
import {
  createAdminProductFormError,
  deleteAdminProductImagesFromBlob,
  getAdminProductIdentityFromFormData,
  getAdminProductInputFromFormData,
  getAdminProductMutationErrorMessage,
  getDuplicateProductMessage
} from "../../_lib/product-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sửa sản phẩm"
};

type AdminEditProductPageProps = Readonly<{
  params: Promise<{
    productId: string;
  }>;
}>;

async function updateProductAction(
  _state: AdminProductFormState,
  formData: FormData
): Promise<AdminProductFormState> {
  "use server";

  const productId = String(formData.get("productId") || "").trim();

  try {
    const identity = getAdminProductIdentityFromFormData(formData);
    const conflict = await findAdminProductIdentityConflict({
      ...identity,
      excludeProductId: productId
    });

    if (conflict) {
      return createAdminProductFormError(getDuplicateProductMessage(conflict));
    }

    const productInput = await getAdminProductInputFromFormData(formData);
    const replacedImages =
      productInput.images.length > 0 ? (await getAdminProductForEdit(productId))?.images || [] : [];

    await updateAdminProduct(productId, productInput);
    await deleteAdminProductImagesFromBlob(replacedImages);
  } catch (error) {
    return createAdminProductFormError(getAdminProductMutationErrorMessage(error));
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  redirect("/admin/products");
}

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const { productId } = await params;
  const [categoryOptions, product] = await Promise.all([
    getAdminProductCategoryOptions(),
    getAdminProductForEdit(productId)
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Sửa sản phẩm</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cập nhật thông tin, ảnh và variant cho {product.name}.
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

      <AdminProductForm action={updateProductAction}>
        <input type="hidden" name="productId" value={product.id} />
        <AdminProductFormFields
          categoryOptions={categoryOptions}
          existingImages={product.images}
          values={product}
          variants={product.variants}
        />

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
            <span>Cập nhật sản phẩm</span>
          </button>
        </div>
      </AdminProductForm>
    </div>
  );
}
