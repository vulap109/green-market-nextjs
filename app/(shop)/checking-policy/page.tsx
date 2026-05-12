import type { Metadata } from "next";
import {
  Breadcrumbs,
  BulletList,
  NoticeBox,
  NumberedSteps,
  PageTitleBlock,
  PolicySection,
  StaticContentCard
} from "@/components/static/StaticPageShell";

export const metadata: Metadata = {
  title: "Chính Sách Kiểm Hàng"
};

export default function CheckingPolicyPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/", label: "Trang chủ" },
          { label: "Chính sách kiểm hàng" }
        ]}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-10">
        <StaticContentCard>
          <PageTitleBlock title="Chính Sách Kiểm Hàng" />

        <div className="space-y-6 text-sm leading-relaxed text-gray-600">
          <p>
            <strong>Green Market</strong> luôn cam kết mang đến cho khách hàng những sản phẩm trái cây nhập
            khẩu tươi ngon, chất lượng cao. Để đảm bảo quyền lợi và sự hài lòng của khách hàng, chúng tôi áp
            dụng chính sách kiểm hàng minh bạch trước khi nhận hàng.
          </p>

          <PolicySection title="1. Kiểm Hàng Khi Nhận Hàng">
            <p>Khi nhận hàng từ Green Market, quý khách vui lòng kiểm tra kỹ các yếu tố sau:</p>
            <BulletList
              items={[
                "Chất lượng trái cây: tươi, không dập nát, không hư hỏng, đúng loại đã đặt.",
                "Số lượng và mẫu mã đúng theo đơn hàng đã xác nhận.",
                "Hình thức giỏ quà hoặc hộp quà được gói đúng mẫu, đảm bảo đẹp mắt."
              ]}
            />
          </PolicySection>

          <PolicySection title="2. Điều Kiện Đổi Trả Hàng">
            <p>Green Market hỗ trợ đổi trả hàng trong các trường hợp sau:</p>
            <BulletList
              items={[
                "Trái cây bị hư hỏng hoặc dập nát nặng do quá trình vận chuyển.",
                "Sai loại trái cây hoặc sản phẩm khác với đơn đặt hàng.",
                "Giỏ quà bị lỗi trang trí hoặc không đúng thiết kế yêu cầu."
              ]}
            />
            <NoticeBox title="Lưu ý quan trọng" tone="yellow">
              <BulletList
                className="text-[13px] marker:text-yellow-600"
                items={[
                  "Khách hàng vui lòng báo ngay trong vòng 2 giờ sau khi nhận hàng để được hỗ trợ.",
                  "Trái cây cần được giữ nguyên trạng thái, không bị cắt gọt hoặc sử dụng trước khi đổi trả.",
                  "Không áp dụng đổi trả với các sản phẩm giảm giá hoặc đặt theo yêu cầu riêng, trừ khi có lỗi từ phía Green Market."
                ]}
              />
            </NoticeBox>
          </PolicySection>

          <PolicySection title="3. Quy Trình Giải Quyết Khiếu Nại">
            <NumberedSteps
              steps={[
                {
                  title: "Liên hệ hỗ trợ",
                  description: (
                    <p>
                      Liên hệ ngay hotline <strong className="text-primary">0973 074 063</strong> hoặc email{" "}
                      <strong>contact@greenmarket.com.vn</strong>.
                    </p>
                  )
                },
                {
                  title: "Cung cấp thông tin",
                  description: <p>Cung cấp thông tin đơn hàng, hình ảnh hoặc video sản phẩm lỗi.</p>
                },
                {
                  title: "Xác nhận và xử lý",
                  description: (
                    <p>
                      Green Market xác nhận và xử lý khiếu nại trong vòng{" "}
                      <strong className="text-red-600">24 giờ</strong>.
                    </p>
                  )
                },
                {
                  title: "Hoàn tất khiếu nại",
                  description: <p>Đổi hàng mới hoặc hoàn tiền theo thỏa thuận với khách hàng.</p>
                }
              ]}
            />
          </PolicySection>

          <NoticeBox>
            <p className="font-semibold text-gray-800">
              Green Market luôn đặt uy tín và sự hài lòng của khách hàng lên hàng đầu.
            </p>
            <p>Cảm ơn quý khách đã tin tưởng và ủng hộ chúng tôi.</p>
          </NoticeBox>
        </div>
        </StaticContentCard>
      </main>
    </>
  );
}
