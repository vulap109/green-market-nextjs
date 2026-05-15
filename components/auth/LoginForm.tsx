"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { isAdminRole } from "@/lib/auth/login";

type LoginFormProps = Readonly<{
  className?: string;
}>;

const LOGIN_ERROR_MESSAGE = "Email hoặc mật khẩu không đúng.";

export default function LoginForm({ className = "" }: LoginFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setErrorMessage("Vui lòng nhập email và mật khẩu.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      });

      if (!result?.ok) {
        setErrorMessage(LOGIN_ERROR_MESSAGE);
        return;
      }

      const session = await getSession();
      const destination = isAdminRole(session?.user?.role) ? "/admin" : "/";

      router.replace(destination);
      router.refresh();
    } catch {
      setErrorMessage("Không thể đăng nhập lúc này. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Green Market</p>
        <h1 className="mt-3 text-2xl font-black text-gray-950">Đăng nhập</h1>
        <p className="mt-2 text-sm text-gray-600">Dùng email và mật khẩu đã được cấp cho tài khoản của bạn.</p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-gray-800">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-emerald-100"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-800">Mật khẩu</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-emerald-100"
            placeholder="••••••••"
          />
        </label>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#004e29] disabled:cursor-wait disabled:bg-gray-400"
      >
        <i className="fa-solid fa-right-to-bracket text-xs" aria-hidden="true" />
        <span>{isSubmitting ? "Đang đăng nhập" : "Đăng nhập"}</span>
      </button>

      <div className="mt-5 text-center text-sm text-gray-600">
        <Link href="/" className="font-bold text-primary transition hover:text-[#004e29]">
          Quay về trang chủ
        </Link>
      </div>
    </form>
  );
}
