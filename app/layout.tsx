import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/layout/AppHeader";
import ContactPopup from "@/components/layout/ContactPopup";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://greenmarket.com.vn"),
  title: {
    default: "Green Market - Trái Cây Nhập Khẩu & Quà Tặng Cao Cấp",
    template: "%s | Green Market"
  },
  description:
    "Green Market chuyên trái cây nhập khẩu, giỏ quà trái cây, bánh kem và quà tặng cao cấp cho nhiều dịp biếu tặng.",
  applicationName: "Green Market",
  icons: {
    icon: "/images/logo_1.png",
    shortcut: "/images/logo_1.png",
    apple: "/images/logo_1.png"
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Green Market",
    title: "Green Market - Trái Cây Nhập Khẩu & Quà Tặng Cao Cấp",
    description:
      "Green Market chuyên trái cây nhập khẩu, giỏ quà trái cây, bánh kem và quà tặng cao cấp cho nhiều dịp biếu tặng."
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Market - Trái Cây Nhập Khẩu & Quà Tặng Cao Cấp",
    description:
      "Green Market chuyên trái cây nhập khẩu, giỏ quà trái cây, bánh kem và quà tặng cao cấp cho nhiều dịp biếu tặng."
  }
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          {children}
          <AppFooter />
          <ContactPopup />
        </div>
      </body>
    </html>
  );
}
