import type { Metadata } from "next";
import {
  Breadcrumbs,
  BulletList,
  ContactSupportCard,
  NoticeBox,
  PageTitleBlock,
  PolicySection,
  StaticContentCard
} from "@/components/static/StaticPageShell";
import { BANK_TRANSFER_INFO } from "@/lib/order";

export const metadata: Metadata = {
  title: "Chính Sách Thanh Toán"
};

export default function PaymentPolicyPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/", label: "Trang chủ" },
          { label: "Chính sách thanh toán" }
        ]}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-10">
        <StaticContentCard>
          <PageTitleBlock title="Chính Sách Thanh Toán" />

        <div className="space-y-6 text-sm leading-relaxed text-gray-600">
          <p>
            <strong>Green Market</strong> xin chân thành cảm ơn quý khách đã tin tưởng lựa chọn sản phẩm
            trái cây nhập khẩu, giỏ trái cây và quà tặng của chúng tôi. Để thuận tiện trong quá trình mua
            sắm, Green Market áp dụng hai phương thức thanh toán linh hoạt như sau:
          </p>

          <PolicySection title="1. Thanh Toán Khi Nhận Hàng (COD)">
            <BulletList
              items={[
                "Quý khách có thể thanh toán trực tiếp bằng tiền mặt hoặc chuyển khoản khi nhận hàng.",
                "Nhân viên giao hàng sẽ thu tiền theo đúng giá trị đơn hàng đã xác nhận trước đó.",
                "Phương thức này áp dụng cho các đơn hàng giao tại Hà Nội và TP.HCM."
              ]}
            />
          </PolicySection>

          <PolicySection title="2. Chuyển Khoản Ngân Hàng">
            <p>Green Market hỗ trợ thanh toán chuyển khoản trước với thông tin tài khoản như sau:</p>

            <div className="relative mb-6 w-full overflow-hidden rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm md:w-2/3">
              <div className="relative z-10 space-y-3">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                  <span className="w-32 text-xs font-medium uppercase tracking-wider text-gray-500">Ngân hàng:</span>
                  <span className="text-base font-bold text-gray-800">{BANK_TRANSFER_INFO.bankName}</span>
                </div>
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                  <span className="w-32 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Chủ tài khoản:
                  </span>
                  <span className="text-base font-bold uppercase text-gray-800">
                    {BANK_TRANSFER_INFO.accountName}
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
                  <span className="w-32 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Số tài khoản:
                  </span>
                  <span className="text-2xl font-black tracking-widest text-primary">
                    {BANK_TRANSFER_INFO.accountNumber}
                  </span>
                </div>
              </div>
            </div>

            <NoticeBox title="Lưu ý khi chuyển khoản" tone="yellow">
              <BulletList
                className="text-[13px] marker:text-yellow-600"
                items={[
                  "Vui lòng ghi rõ nội dung chuyển khoản: Họ tên + Số điện thoại + Mã đơn hàng.",
                  "Sau khi chuyển khoản, quý khách vui lòng gửi ảnh xác nhận giao dịch để Green Market xử lý đơn hàng nhanh chóng."
                ]}
              />
            </NoticeBox>
          </PolicySection>

          <PolicySection title="Thông Tin Hỗ Trợ">
            <ContactSupportCard
              items={[
                { label: "Hotline", value: "0973 074 063", href: "tel:0973074063" },
                { label: "Email", value: "contact@greenmarket.com.vn", href: "mailto:contact@greenmarket.com.vn" },
                { label: "Website", value: "greenmarket.com.vn", href: "https://greenmarket.com.vn/" }
              ]}
            />
          </PolicySection>

          <NoticeBox>
            <p>
              <strong>Green Market cam kết</strong> mang đến sự tiện lợi, minh bạch và an toàn trong thanh
              toán, giúp khách hàng yên tâm khi mua sắm các sản phẩm trái cây nhập khẩu và giỏ quà tại cửa
              hàng.
            </p>
          </NoticeBox>
        </div>
        </StaticContentCard>
      </main>
    </>
  );
}
