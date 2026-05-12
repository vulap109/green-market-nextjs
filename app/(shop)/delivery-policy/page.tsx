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

export const metadata: Metadata = {
  title: "Chính Sách Giao Hàng"
};

export default function DeliveryPolicyPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/", label: "Trang chủ" },
          { label: "Chính sách giao hàng" }
        ]}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-10">
        <StaticContentCard>
          <PageTitleBlock title="Chính Sách Giao Hàng" />

        <div className="space-y-6 text-sm leading-relaxed text-gray-600">
          <p>
            <strong>Green Market</strong> cam kết mang đến dịch vụ giao hàng nhanh chóng và tiện lợi cho khách
            hàng tại Hà Nội và TP.HCM. Dưới đây là chính sách giao hàng chi tiết.
          </p>

          <PolicySection title="1. Phạm Vi Giao Hàng">
            <BulletList
              items={[
                "Giao hàng tại khu vực Hà Nội và TP.HCM.",
                "Hỗ trợ giao hàng đến các tỉnh thành khác theo thỏa thuận."
              ]}
            />
          </PolicySection>

          <PolicySection title="2. Thời Gian Giao Hàng">
            <BulletList
              items={[
                "Giao hàng trong vòng 2 đến 4 giờ đối với các đơn hàng nội thành Hà Nội và TP.HCM.",
                "Đối với các đơn hàng cần giao gấp, vui lòng liên hệ hotline 0973 074 063 để được hỗ trợ."
              ]}
            />
          </PolicySection>

          <PolicySection title="3. Phí Giao Hàng">
            <BulletList
              items={[
                "Miễn phí giao hàng cho đơn hàng có hóa đơn từ 1.000.000₫ trở lên, không áp dụng với địa chỉ ngoại thành quá 10km.",
                "Đơn hàng dưới 1.000.000₫, phí giao hàng sẽ được tính theo khu vực.",
                "Giao hàng ngoại thành và các tỉnh sẽ được tính phí theo bảng giá của đơn vị vận chuyển hoặc thỏa thuận riêng."
              ]}
            />
          </PolicySection>

          <PolicySection title="4. Chính Sách Nhận Hàng">
            <BulletList
              items={[
                "Khách hàng kiểm tra hàng trước khi nhận.",
                "Nếu có bất kỳ vấn đề gì về sản phẩm như hư hỏng, sai hàng hoặc thiếu hàng, vui lòng liên hệ ngay với Green Market để được hỗ trợ đổi trả.",
                "Nếu khách hàng không nhận hàng vì lý do cá nhân, phí vận chuyển sẽ không được hoàn lại."
              ]}
            />
          </PolicySection>

          <PolicySection title="5. Hỗ Trợ Đặc Biệt">
            <BulletList
              items={[
                "Hỗ trợ giao hàng tận nơi cho doanh nghiệp, sự kiện, tiệc tùng theo yêu cầu.",
                "Giao hàng theo khung giờ mong muốn nếu có thể sắp xếp được và được báo trước.",
                "Hỗ trợ đổi địa chỉ nhận hàng trước khi giao nếu có yêu cầu."
              ]}
            />
          </PolicySection>

          <PolicySection title="Mọi Thắc Mắc Về Chính Sách Giao Hàng">
            <ContactSupportCard
              items={[
                { label: "Hotline", value: "0973 074 063", href: "tel:0973074063" },
                { label: "Email", value: "contact@greenmarket.com.vn", href: "mailto:contact@greenmarket.com.vn" },
                { label: "Website", value: "greenmarket.com.vn", href: "https://greenmarket.com.vn" }
              ]}
            />
          </PolicySection>

          <NoticeBox>
            <p className="italic">Green Market trân trọng cảm ơn quý khách hàng đã tin tưởng và ủng hộ.</p>
          </NoticeBox>
        </div>
        </StaticContentCard>
      </main>
    </>
  );
}
