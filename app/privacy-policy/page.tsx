import type { Metadata } from "next";
import {
  BulletList,
  ContactSupportCard,
  NoticeBox,
  PageTitleBlock,
  PolicySection,
  StaticContentCard
} from "@/components/static/StaticPageShell";
import StaticPageShell from "@/components/static/StaticPageShell";

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật"
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPageShell
      breadcrumbs={[
        { href: "/", label: "Trang chủ" },
        { label: "Chính sách bảo mật" }
      ]}
    >
      <StaticContentCard>
        <PageTitleBlock title="Chính Sách Bảo Mật" />

        <div className="space-y-6 text-sm leading-relaxed text-gray-600">
          <p>
            <strong>Green Market</strong> cam kết bảo mật tuyệt đối thông tin cá nhân của khách hàng. Chính
            sách bảo mật này nhằm giúp quý khách hiểu rõ về cách chúng tôi thu thập, sử dụng và bảo vệ
            thông tin cá nhân khi sử dụng dịch vụ tại Green Market.
          </p>

          <PolicySection title="1. Mục Đích Thu Thập Thông Tin">
            <p>Chúng tôi thu thập thông tin khách hàng nhằm các mục đích sau:</p>
            <BulletList
              items={[
                "Cung cấp và xử lý đơn hàng một cách chính xác, nhanh chóng.",
                "Hỗ trợ khách hàng trong quá trình mua sắm và sử dụng dịch vụ.",
                "Cung cấp thông tin về sản phẩm, chương trình khuyến mãi, ưu đãi đặc biệt.",
                "Cải thiện dịch vụ, nâng cao trải nghiệm mua hàng của khách hàng."
              ]}
            />
          </PolicySection>

          <PolicySection title="2. Phạm Vi Thu Thập Thông Tin">
            <p>Các thông tin cá nhân mà Green Market có thể thu thập bao gồm:</p>
            <BulletList
              items={[
                "Họ và tên khách hàng.",
                "Số điện thoại, địa chỉ giao hàng.",
                "Địa chỉ email nếu khách hàng cung cấp.",
                "Nội dung yêu cầu hỗ trợ hoặc phản hồi từ khách hàng."
              ]}
            />
          </PolicySection>

          <PolicySection title="3. Bảo Mật Thông Tin Khách Hàng">
            <p>
              Green Market cam kết không chia sẻ, bán hoặc trao đổi thông tin cá nhân của khách hàng cho
              bất kỳ bên thứ ba nào không liên quan, trừ trường hợp có yêu cầu từ cơ quan chức năng theo quy
              định của pháp luật.
            </p>
            <p>
              Chúng tôi sử dụng các biện pháp bảo mật hiện đại để bảo vệ thông tin khách hàng trước các
              hành vi truy cập trái phép, mất mát hoặc lạm dụng.
            </p>
          </PolicySection>

          <PolicySection title="4. Thời Gian Lưu Trữ Thông Tin">
            <p>
              Thông tin khách hàng sẽ được lưu trữ trong hệ thống của Green Market cho đến khi khách hàng
              yêu cầu xóa bỏ hoặc khi không còn cần thiết cho mục đích kinh doanh.
            </p>
          </PolicySection>

          <PolicySection title="5. Quyền Lợi Của Khách Hàng">
            <p>Khách hàng có quyền:</p>
            <BulletList
              items={[
                "Yêu cầu kiểm tra, cập nhật, điều chỉnh hoặc xóa thông tin cá nhân của mình bất cứ lúc nào.",
                "Từ chối nhận các thông tin quảng cáo từ Green Market.",
                "Được hỗ trợ về các vấn đề liên quan đến thông tin cá nhân khi có nhu cầu."
              ]}
            />
          </PolicySection>

          <PolicySection title="6. Liên Hệ">
            <p>
              Nếu có bất kỳ thắc mắc nào liên quan đến chính sách bảo mật, quý khách có thể liên hệ với
              chúng tôi qua:
            </p>
            <ContactSupportCard
              items={[
                { label: "Hotline", value: "0973 074 063", href: "tel:0973074063" },
                { label: "Email", value: "contact@greenmarket.com.vn", href: "mailto:contact@greenmarket.com.vn" }
              ]}
            />
          </PolicySection>

          <NoticeBox>
            <p className="italic">
              Green Market trân trọng sự tin tưởng của quý khách và cam kết luôn bảo vệ thông tin khách hàng
              một cách tốt nhất.
            </p>
          </NoticeBox>
        </div>
      </StaticContentCard>
    </StaticPageShell>
  );
}
