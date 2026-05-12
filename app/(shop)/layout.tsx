import type { ReactNode } from "react";
import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";
import ContactPopup from "@/components/layout/ContactPopup";

type ShopLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      {children}
      <AppFooter />
      <ContactPopup />
    </div>
  );
}
