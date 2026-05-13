"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_TOTAL_MAX_LABEL,
  PRODUCT_IMAGE_UPLOAD_LIMIT
} from "@/lib/product-image-upload";

export type AdminProductImageFieldValue = Readonly<{
  id: string;
  imageUrl: string;
  isMain: boolean;
  sortOrder: number;
}>;

type AdminProductImageFieldsProps = Readonly<{
  existingImages?: ReadonlyArray<AdminProductImageFieldValue>;
}>;

export default function AdminProductImageFields({
  existingImages = []
}: AdminProductImageFieldsProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const hasExistingImages = existingImages.length > 0;
  const hasPreviewImages = previewUrls.length > 0;

  useEffect(
    () => () => {
      previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    },
    [previewUrls]
  );

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []);

    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-950">Ảnh sản phẩm</h3>
      </div>

      <div className="grid gap-4 p-5">
        <div className="space-y-3">
          <input
            id="productImages"
            type="file"
            name="productImages"
            accept={PRODUCT_IMAGE_ACCEPT}
            multiple
            onChange={handleImageChange}
            className="sr-only"
          />
          <label
            htmlFor="productImages"
            className="inline-flex h-10 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
          >
            <i className="fa-solid fa-images text-xs" aria-hidden="true" />
            <span>Chọn ảnh</span>
          </label>
          <span className="block text-xs font-medium text-slate-500">
            Tối đa {PRODUCT_IMAGE_UPLOAD_LIMIT} ảnh, tổng dung lượng tối đa{" "}
            {PRODUCT_IMAGE_TOTAL_MAX_LABEL}. Ảnh đầu tiên sẽ là ảnh chính.
          </span>
        </div>

        {hasExistingImages ? (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Ảnh hiện tại</p>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                >
                  <img
                    src={image.imageUrl}
                    alt={`Ảnh sản phẩm ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {image.isMain || index === 0 ? (
                    <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-bold text-white">
                      Ảnh chính
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {hasPreviewImages ? (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Ảnh mới</p>
            <div className="flex flex-wrap gap-3">
              {previewUrls.map((previewUrl, index) => (
                <div
                  key={previewUrl}
                  className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                >
                  <img
                    src={previewUrl}
                    alt={`Ảnh sản phẩm ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-bold text-white">
                      Ảnh chính
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
