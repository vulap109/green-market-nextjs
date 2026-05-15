import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "@/components/auth/LoginForm";
import { isAdminRole } from "@/lib/auth/login";

export const metadata: Metadata = {
  title: "Đăng nhập"
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect(isAdminRole(session.user.role) ? "/admin" : "/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-[420px]">
        <LoginForm />
      </div>
    </main>
  );
}
