"use client";

import { type ReactNode, useActionState, useEffect, useRef } from "react";

export type AdminProductFormState = Readonly<{
  message: string;
  nonce: string;
  status: "idle" | "error";
}>;

type AdminProductFormProps = Readonly<{
  action: (state: AdminProductFormState, formData: FormData) => Promise<AdminProductFormState>;
  children: ReactNode;
}>;

const initialState: AdminProductFormState = {
  message: "",
  nonce: "",
  status: "idle"
};

export default function AdminProductForm({ action, children }: AdminProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const alertedNonceRef = useRef("");

  useEffect(() => {
    if (state.status !== "error" || !state.message || state.nonce === alertedNonceRef.current) {
      return;
    }

    alertedNonceRef.current = state.nonce;
    window.alert(state.message);
  }, [state.message, state.nonce, state.status]);

  return (
    <form action={formAction} aria-busy={isPending} className="space-y-6">
      {children}
    </form>
  );
}
