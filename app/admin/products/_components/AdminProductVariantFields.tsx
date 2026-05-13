"use client";

import { useRef, useState } from "react";

export type AdminProductVariantFieldValue = Readonly<{
  price: number;
  salePrice: number;
  status: string;
  stockQuantity: number;
  variantName: string;
}>;

type AdminProductVariantFieldsProps = Readonly<{
  variants?: ReadonlyArray<AdminProductVariantFieldValue>;
}>;

type VariantRow = AdminProductVariantFieldValue & Readonly<{ fieldId: number }>;

const emptyVariantValue: AdminProductVariantFieldValue = {
  price: 0,
  salePrice: 0,
  status: "active",
  stockQuantity: 1,
  variantName: ""
};

function createInitialVariantRows(variants: ReadonlyArray<AdminProductVariantFieldValue>): VariantRow[] {
  return variants.map((variant, index) => ({
    ...variant,
    fieldId: index
  }));
}

export default function AdminProductVariantFields({
  variants = []
}: AdminProductVariantFieldsProps) {
  const [variantRows, setVariantRows] = useState<VariantRow[]>(() => createInitialVariantRows(variants));
  const nextVariantIdRef = useRef(variantRows.length);

  function addVariant() {
    const nextVariantId = nextVariantIdRef.current;

    nextVariantIdRef.current += 1;
    setVariantRows((currentVariantRows) => [
      ...currentVariantRows,
      {
        ...emptyVariantValue,
        fieldId: nextVariantId
      }
    ]);
  }

  function removeVariant(variantId: number) {
    setVariantRows((currentVariantRows) =>
      currentVariantRows.filter((currentVariantRow) => currentVariantRow.fieldId !== variantId)
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-slate-950">Variant</h3>
        <button
          type="button"
          onClick={addVariant}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-bold text-white transition hover:bg-[#004e29]"
        >
          <i className="fa-solid fa-plus text-xs" aria-hidden="true" />
          <span>Thêm variant</span>
        </button>
      </div>

      <div className="grid gap-3 p-5">
        {variantRows.length ? (
          variantRows.map((variant, index) => (
            <div
              key={variant.fieldId}
              className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[minmax(180px,1.5fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(100px,0.8fr)_minmax(100px,0.8fr)_2.5rem]"
            >
              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Tên variant
                </span>
                <input
                  name="productVariantName"
                  placeholder="12cm"
                  defaultValue={variant.variantName}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Giá</span>
                <input
                  name="productVariantPrice"
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={variant.price}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  Giá sale
                </span>
                <input
                  name="productVariantSalePrice"
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={variant.salePrice}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Status</span>
                <select
                  name="productVariantStatus"
                  defaultValue={variant.status || "active"}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Stock</span>
                <input
                  name="productVariantStockQuantity"
                  type="number"
                  min="0"
                  defaultValue={variant.stockQuantity}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeVariant(variant.fieldId)}
                  aria-label={`Xóa variant ${index + 1}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm text-slate-500 transition hover:border-red-200 hover:text-red-600"
                >
                  <i className="fa-solid fa-trash-can text-xs" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <button
            type="button"
            onClick={addVariant}
            className="flex h-12 items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-primary hover:text-primary"
          >
            <i className="fa-solid fa-plus text-xs" aria-hidden="true" />
            <span>Thêm variant</span>
          </button>
        )}
      </div>
    </section>
  );
}
