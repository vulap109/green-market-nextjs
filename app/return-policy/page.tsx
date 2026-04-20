import type { Metadata } from "next";
import {
  BulletList,
  NoticeBox,
  NumberedSteps,
  PageTitleBlock,
  PolicySection,
  StaticContentCard
} from "@/components/static/StaticPageShell";
import StaticPageShell from "@/components/static/StaticPageShell";

export const metadata: Metadata = {
  title: "Chính Sách Đổi Trả Hàng"
};

export default function ReturnPolicyPage() {
  return (
    <StaticPageShell
      breadcrumbs={[
        { href: "/", label: "Trang chủ" },
        { label: "Chính sách đổi trả hàng" }
      ]}
    >
      <StaticContentCard>
        <PageTitleBlock title="Chính Sách Đổi Trả Hàng" />

        <div className="space-y-6 text-sm leading-relaxed text-gray-600">
          <p>
            <strong>Green Market</strong> cam kết cung cấp trái cây nhập khẩu chất lượng cao, đảm bảo tươi
            ngon khi đến tay khách hàng. Nếu có bất kỳ vấn đề nào liên quan đến sản phẩm, quý khách có thể
            yêu cầu đổi trả theo chính sách dưới đây.
          </p>

          <PolicySection title="1. Điều Kiện Áp Dụng Đổi Trả">
            <p>
              Khách hàng có thể đổi trả sản phẩm trong vòng <strong className="text-red-600">24 giờ</strong>{" "}
              kể từ khi nhận hàng nếu gặp các trường hợp sau:
            </p>
            <BulletList
              items={[
                "Trái cây bị dập nát, hư hỏng do quá trình vận chuyển.",
                "Sản phẩm không đúng với đơn đặt hàng như loại trái cây, số lượng hoặc mẫu giỏ quà.",
                "Trái cây không đảm bảo độ tươi ngon theo cam kết của Green Market."
              ]}
            />
            <NoticeBox title="Lưu ý quan trọng" tone="yellow">
              <BulletList
                className="text-[13px] marker:text-yellow-600"
                items={[
                  "Sản phẩm cần được giữ nguyên hiện trạng, chưa qua sử dụng.",
                  "Quý khách vui lòng cung cấp hình ảnh hoặc video sản phẩm khi yêu cầu đổi trả."
                ]}
              />
            </NoticeBox>
          </PolicySection>

          <PolicySection title="2. Quy Trình Đổi Trả">
            <NumberedSteps
              steps={[
                {
                  title: "Liên hệ",
                  description: (
                    <p>
                      Liên hệ hotline <strong className="text-primary">0973 074 063</strong> hoặc email{" "}
                      <strong>contact@greenmarket.com.vn</strong> trong vòng{" "}
                      <strong className="text-red-600">24 giờ</strong> kể từ khi nhận hàng.
                    </p>
                  )
                },
                {
                  title: "Cung cấp bằng chứng",
                  description: <p>Cung cấp hình ảnh hoặc video sản phẩm để Green Market xác nhận tình trạng.</p>
                },
                {
                  title: "Xử lý đổi trả",
                  description: (
                    <>
                      <p>Sau khi xác nhận lỗi từ Green Market, quý khách có thể chọn:</p>
                      <BulletList
                        items={[
                          "Đổi sang sản phẩm khác có giá trị tương đương.",
                          "Hoàn tiền nếu không có sản phẩm thay thế phù hợp."
                        ]}
                      />
                    </>
                  )
                }
              ]}
            />
          </PolicySection>

          <PolicySection title="3. Chi Phí Đổi Trả">
            <BulletList
              items={[
                "Miễn phí đổi trả nếu lỗi do Green Market hoặc đơn vị vận chuyển.",
                "Nếu khách hàng muốn đổi sản phẩm do thay đổi nhu cầu cá nhân, vui lòng chịu chi phí vận chuyển nếu có."
              ]}
            />
          </PolicySection>

          <PolicySection title="4. Trường Hợp Không Áp Dụng Đổi Trả">
            <BulletList
              className="marker:text-red-500"
              items={[
                "Trái cây đã qua sử dụng hoặc bảo quản không đúng cách.",
                "Yêu cầu đổi trả sau 24 giờ kể từ khi nhận hàng.",
                "Sản phẩm bị hư hỏng do khách hàng gây ra."
              ]}
            />
          </PolicySection>

          <NoticeBox>
            <p className="font-semibold text-gray-800">
              Green Market luôn đặt sự hài lòng của khách hàng lên hàng đầu.
            </p>
            <p>
              Nếu có bất kỳ thắc mắc nào, hãy liên hệ ngay với chúng tôi qua hotline 0973 074 063 hoặc email
              contact@greenmarket.com.vn để được hỗ trợ nhanh nhất.
            </p>
          </NoticeBox>
        </div>
      </StaticContentCard>
    </StaticPageShell>
  );
}
