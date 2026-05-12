"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavItem = Readonly<{
  exact?: boolean;
  href: string;
  iconClassName: string;
  label: string;
}>;

const adminNavItems: AdminNavItem[] = [
  {
    exact: true,
    href: "/admin",
    iconClassName: "fa-solid fa-chart-line",
    label: "Tổng quan"
  },
  {
    exact: true,
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

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function isNavItemActive(pathname: string, item: AdminNavItem): boolean {
  const normalizedPathname = normalizePathname(pathname);
  const normalizedHref = normalizePathname(item.href);

  if (item.exact) {
    return normalizedPathname === normalizedHref;
  }

  return normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`);
}

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible">
      {adminNavItems.map((item) => {
        const isActive = isNavItemActive(pathname, item);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-primary text-white shadow-sm hover:bg-primary hover:text-white"
                : "text-slate-600 hover:bg-emerald-50 hover:text-primary"
            }`}
          >
            <i className={`${item.iconClassName} w-4 text-center text-xs`} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
