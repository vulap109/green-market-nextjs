import type { Metadata } from "next";
import {
  ContactSupportCard,
  NoticeBox,
  PageTitleBlock,
  StaticContentCard
} from "@/components/static/StaticPageShell";
import StaticPageShell from "@/components/static/StaticPageShell";

export const metadata: Metadata = {
  title: "Chi Nhánh Hà Nội"
};

function StoreLocationCard({
  address,
  directionsHref,
  title
}: Readonly<{
  address: string;
  directionsHref: string;
  title: string;
}>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-primary hover:shadow-md">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">{address}</p>
      <a
        href={directionsHref}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex text-xs font-bold text-primary transition hover:underline"
      >
        Chỉ đường
      </a>
    </div>
  );
}

export default function AddressPage() {
  return (
    <StaticPageShell
      maxWidth="7xl"
      breadcrumbs={[
        { href: "/", label: "Trang chủ" },
        { href: "/", label: "Hệ thống cửa hàng" },
        { label: "Chi nhánh Hà Nội" }
      ]}
    >
      <StaticContentCard className="p-6 md:p-10">
        <PageTitleBlock
          title="Chi Nhánh Hà Nội"
          description="Hệ thống trái cây nhập khẩu và quà tặng cao cấp Green Market tại Hà Nội."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <NoticeBox title="Ship hỏa tốc trong vòng 30 phút" tone="orange">
              <p>Áp dụng cho mọi đơn hàng tại khu vực nội thành Hà Nội.</p>
            </NoticeBox>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 border-b border-gray-100 pb-2 text-sm font-bold uppercase tracking-[0.2em] text-gray-800">
                Liên hệ với chúng tôi
              </h2>
              <ContactSupportCard
                items={[
                  { label: "Website", value: "greenmarket.com.vn", href: "https://greenmarket.com.vn" },
                  { label: "Hotline / Zalo", value: "0973 074 063", href: "tel:0973074063" }
                ]}
              />
            </div>

            <div className="space-y-4">
              <StoreLocationCard
                title="Cơ sở 1"
                address="207 Mai Dịch, Cầu Giấy, Hà Nội"
                directionsHref="https://maps.google.com/?q=207+Mai+Dich,+Cau+Giay,+Ha+Noi"
              />
              <StoreLocationCard
                title="Cơ sở 2"
                address="32/42/11 Bùi Đình Túy, Phường 12, Quận Bình Thạnh, TP.HCM"
                directionsHref="https://maps.google.com/?q=32/42/11+Bui+Dinh+Tuy,+Phuong+12,+Quan+Binh+Thanh,+Ho+Chi+Minh"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="relative min-h-[500px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-inner">
              <iframe
                src="https://www.google.com/maps?q=207+Mai+Dich,+Cau+Giay,+Ha+Noi&output=embed"
                title="Bản đồ chi nhánh Hà Nội"
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </StaticContentCard>
    </StaticPageShell>
  );
}
