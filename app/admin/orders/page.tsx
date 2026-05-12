import type { Metadata } from "next";
import AdminPlaceholderPage from "../_components/AdminPlaceholderPage";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng"
};

export default function AdminOrdersPage() {
  return (
    <AdminPlaceholderPage
      title="Đơn hàng"
      description="Trang theo dõi đơn hàng, thanh toán, giao hàng và trạng thái xử lý."
      tasks={[
        "Nối dữ liệu từ bảng order",
        "Thêm bộ lọc trạng thái đơn hàng",
        "Tạo màn hình chi tiết và cập nhật trạng thái"
      ]}
    />
  );
}
