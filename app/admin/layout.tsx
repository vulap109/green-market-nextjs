import Link from "next/link";
import type { ReactNode } from "react";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

const adminNavItems = [
  {
    href: "/admin",
    iconClassName: "fa-solid fa-chart-line",
    label: "Tổng quan"
  },
  {
    href: "/admin/products",
    iconClassName: "fa-solid fa-box-open",
    label: "Sản phẩm"
  },
  {
    href: "/admin/orders",
    iconClassName: "fa-solid fa-receipt",
    label: "Đơn hàng"
  },
  {
    href: "/admin/customers",
    iconClassName: "fa-solid fa-users",
    label: "Khách hàng"
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center border-b border-slate-200 px-6">
            <Link href="/admin" className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">
              Green Admin
            </Link>
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-max items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-primary"
              >
                <i className={`${item.iconClassName} w-4 text-center text-xs`} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Admin</p>
              <h1 className="text-base font-bold text-slate-950">Quản trị cửa hàng</h1>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-primary hover:text-primary"
            >
              <i className="fa-solid fa-store text-[11px]" aria-hidden="true" />
              <span>Về shop</span>
            </Link>
          </header>

          <main className="px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
