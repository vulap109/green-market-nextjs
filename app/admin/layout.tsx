import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth, signOut } from "@/auth";
import { isAdminRole } from "@/lib/auth/login";
import AdminNavigation from "./_components/AdminNavigation";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

async function handleSignOut() {
  "use server";

  await signOut({ redirectTo: "/" });
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  const username = session.user.name || session.user.email || "Administrator";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center border-b border-slate-200 px-6">
            <Link href="/admin" className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">
              Green Admin
            </Link>
          </div>

          <AdminNavigation />
        </aside>

        <div className="min-w-0">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Quản trị cửa hàng</p>
              <h1 className="text-base font-bold text-slate-950">{username}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-primary hover:text-primary"
              >
                <i className="fa-solid fa-store text-[11px]" aria-hidden="true" />
                <span>Về shop</span>
              </Link>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-red-200 hover:text-red-600"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-[11px]" aria-hidden="true" />
                  <span>Đăng xuất</span>
                </button>
              </form>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
