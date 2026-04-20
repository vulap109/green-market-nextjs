import Image from "next/image";
import Link from "next/link";
import {
  ADDRESS_ROUTE,
  CHECKING_POLICY_ROUTE,
  DELIVERY_POLICY_ROUTE,
  HOME_ROUTE,
  PAYMENT_POLICY_ROUTE,
  PRIVACY_POLICY_ROUTE,
  RETURN_POLICY_ROUTE
} from "@/lib/routes";

type FooterLink = {
  href: string;
  label: string;
  accent?: boolean;
};

type SocialLink = {
  href: string;
  label: string;
  iconClassName: string;
};

const supportLinks: FooterLink[] = [
  { href: PRIVACY_POLICY_ROUTE, label: "Chính sách bảo mật" },
  { href: DELIVERY_POLICY_ROUTE, label: "Chính sách giao hàng" },
  { href: RETURN_POLICY_ROUTE, label: "Chính sách đổi trả" },
  { href: CHECKING_POLICY_ROUTE, label: "Chính sách kiểm hàng" },
  { href: PAYMENT_POLICY_ROUTE, label: "Chính sách thanh toán" }
];

const storeLinks: FooterLink[] = [
  { href: ADDRESS_ROUTE, label: "Hà Nội" },
  { href: ADDRESS_ROUTE, label: "Thành phố HCM" },
  { href: ADDRESS_ROUTE, label: "Tỉnh thành khác" },
  { href: "#", label: "Ship hỏa tốc trong vòng 30 phút", accent: true }
];

const socialLinks: SocialLink[] = [
  {
    href: "https://www.facebook.com/profile.php?id=61577502750044",
    label: "Facebook",
    iconClassName: "fa-brands fa-facebook-f text-sm"
  },
  {
    href: "https://www.instagram.com/greenmarket063?igsh=MjMxcnJpOWQxYjUy&utm_source=qr",
    label: "Instagram",
    iconClassName: "fa-brands fa-instagram text-sm"
  }
];

export default function AppFooter() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 border-b border-gray-50 p-4 md:grid-cols-4">
        <div className="col-span-1">
          <Link href={HOME_ROUTE} className="mb-4 flex items-center gap-2">
            <Image src="/images/logo_1.png" alt="Green Market" width={45} height={45} />
            <Image src="/images/logo_2.png" alt="Green Market" width={78} height={45} />
          </Link>

          <p className="text-sm font-medium italic leading-relaxed text-black">
            Green Market là website chuyên cung cấp giỏ trái cây cao cấp, trái cây nhập khẩu tươi ngon và
            bánh kem chất lượng, phù hợp làm quà tặng mọi dịp. Sản phẩm được tuyển chọn kỹ lưỡng, thiết kế
            sang trọng, giao nhanh trong ngày.
          </p>

          <div className="mt-2 flex space-x-5">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition hover:bg-primary hover:text-white"
              >
                <i className={item.iconClassName}></i>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold uppercase text-primary underline decoration-2 decoration-orange-500 underline-offset-8">
            Hỗ trợ khách hàng
          </h4>

          <ul className="space-y-3 text-sm font-normal">
            {supportLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold uppercase text-primary underline decoration-2 decoration-orange-500 underline-offset-8">
            Hệ thống cửa hàng
          </h4>

          <ul className="space-y-3 text-sm font-normal">
            {storeLinks.map((item) => (
              <li key={item.label}>
                {item.href === "#" ? (
                  <span className={item.accent ? "text-orange-500 font-semibold" : undefined}>{item.label}</span>
                ) : (
                  <Link
                    href={item.href}
                    className={`transition hover:text-primary ${item.accent ? "text-orange-500" : ""}`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-sm font-bold uppercase text-primary underline decoration-2 decoration-orange-500 underline-offset-8">
            Liên hệ
          </h4>

          <ul className="space-y-3 text-xs font-semibold">
            <li className="flex items-center gap-3">
              <i className="fa-solid fa-phone text-primary"></i>
              <a href="tel:0973074063" className="transition hover:text-primary">
                0973 074 063
              </a>
            </li>
            <li className="flex items-center gap-3">
              <i className="fa-solid fa-envelope text-primary"></i>
              <a href="mailto:contact@greenmarket.com.vn" className="transition hover:text-primary">
                contact@greenmarket.com.vn
              </a>
            </li>
            <li className="flex items-start gap-3">
              <i className="fa-solid fa-location-dot mt-1 text-primary"></i>
              <span>32/42/11 Bùi Đình Túy, Phường 12, Quận Bình Thạnh, TP.HCM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl py-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
          © 2026 Green Market - Bảo lưu mọi quyền
        </p>
      </div>
    </footer>
  );
}
