import type { Metadata } from "next";
import AdminPlaceholderPage from "../_components/AdminPlaceholderPage";

export const metadata: Metadata = {
  title: "Quản lý khách hàng"
};

export default function AdminCustomersPage() {
  return (
    <AdminPlaceholderPage
      title="Khách hàng"
      description="Trang quản lý hồ sơ khách hàng, thông tin liên hệ và lịch sử mua hàng."
      tasks={[
        "Nối dữ liệu từ bảng user",
        "Thêm tìm kiếm theo tên, email hoặc số điện thoại",
        "Tạo màn hình chi tiết khách hàng"
      ]}
    />
  );
}
