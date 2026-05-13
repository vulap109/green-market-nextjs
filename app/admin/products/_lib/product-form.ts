import { del, put } from "@vercel/blob";
import { Prisma } from "@/generated/prisma/client";
import {
  type AdminCreateProductInput,
  type AdminProductEditImage,
  type AdminProductImageInput
} from "@/lib/admin-products";
import {
  PRODUCT_IMAGE_ALLOWED_TYPES,
  PRODUCT_IMAGE_TOTAL_MAX_BYTES,
  PRODUCT_IMAGE_TOTAL_MAX_LABEL,
  PRODUCT_IMAGE_UPLOAD_LIMIT
} from "@/lib/product-image-upload";
import type { AdminProductFormState } from "../_components/AdminProductForm";

type AdminProductField = Exclude<keyof AdminCreateProductInput, "images" | "variants">;

export type AdminProductIdentity = Pick<AdminCreateProductInput, "sku" | "slug">;

export function createAdminProductFormError(message: string): AdminProductFormState {
  return {
    message,
    nonce: `${Date.now()}-${Math.random()}`,
    status: "error"
  };
}

export function getDuplicateProductMessage(conflict: "sku" | "slug"): string {
  return conflict === "slug"
    ? "Slug này đã tồn tại. Vui lòng nhập slug khác."
    : "SKU này đã tồn tại. Vui lòng nhập SKU khác.";
}

export function getAdminProductMutationErrorMessage(error: unknown): string {
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

  return error instanceof Error ? error.message : "Không thể lưu sản phẩm. Vui lòng thử lại.";
}

export function getAdminProductIdentityFromFormData(formData: FormData): AdminProductIdentity {
  return {
    sku: getFormString(formData, "sku"),
    slug: getFormString(formData, "slug")
  };
}

export async function getAdminProductInputFromFormData(
  formData: FormData
): Promise<AdminCreateProductInput> {
  const identity = getAdminProductIdentityFromFormData(formData);
  const productImages = await uploadProductImages(getProductImageFiles(formData));

  return {
    category: getFormString(formData, "category"),
    costPrice: getFormNumber(formData, "costPrice"),
    description: getFormString(formData, "description"),
    featured: getFormString(formData, "featured"),
    images: productImages,
    name: getFormString(formData, "name"),
    price: getFormNumber(formData, "price"),
    salePrice: getFormNumber(formData, "salePrice"),
    shortDescription: getFormString(formData, "shortDescription"),
    sku: identity.sku,
    slug: identity.slug,
    sortOrder: getFormNumber(formData, "sortOrder"),
    status: getFormString(formData, "status"),
    stockQuantity: getFormNumber(formData, "stockQuantity"),
    thumbnail: getFormString(formData, "thumbnail"),
    variants: getProductVariants(formData)
  };
}

export async function deleteAdminProductImagesFromBlob(
  images: ReadonlyArray<Pick<AdminProductEditImage, "imageUrl" | "storageKey">>
): Promise<void> {
  const blobReferences = Array.from(
    new Set(
      images
        .map((image) => image.storageKey || getVercelBlobUrl(image.imageUrl))
        .filter(Boolean)
    )
  );

  if (!blobReferences.length) {
    return;
  }

  try {
    await del(blobReferences);
  } catch (error) {
    console.warn("Could not delete old product images from Vercel Blob.", error);
  }
}

function getFormString(formData: FormData, key: AdminProductField): string {
  return String(formData.get(key) || "").trim();
}

function getFormNumber(formData: FormData, key: AdminProductField): number {
  const value = Number(getFormString(formData, key));
  return Number.isFinite(value) ? value : 0;
}

function getNumberFromFormValue(value: FormDataEntryValue | undefined): number {
  const numberValue = Number(String(value || "").trim());

  return Number.isFinite(numberValue) ? numberValue : 0;
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

function getVercelBlobUrl(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);

    return url.hostname.endsWith("blob.vercel-storage.com") ? imageUrl : "";
  } catch {
    return "";
  }
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

function getProductVariants(formData: FormData): AdminCreateProductInput["variants"] {
  const variantNames = formData.getAll("productVariantName");
  const variantPrices = formData.getAll("productVariantPrice");
  const variantSalePrices = formData.getAll("productVariantSalePrice");
  const variantStatuses = formData.getAll("productVariantStatus");
  const variantStockQuantities = formData.getAll("productVariantStockQuantity");

  return variantNames
    .map((variantName, index) => ({
      price: getNumberFromFormValue(variantPrices[index]),
      salePrice: getNumberFromFormValue(variantSalePrices[index]),
      status: String(variantStatuses[index] || "active").trim(),
      stockQuantity: getNumberFromFormValue(variantStockQuantities[index]),
      variantName: String(variantName || "").trim()
    }))
    .filter((variant) => variant.variantName);
}
