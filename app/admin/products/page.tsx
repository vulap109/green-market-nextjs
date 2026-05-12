import type { Metadata } from "next";
import AdminPlaceholderPage from "../_components/AdminPlaceholderPage";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm"
};

export default function AdminProductsPage() {
  return (
    <AdminPlaceholderPage
      title="Sản phẩm"
      description="Trang quản lý danh sách sản phẩm, tồn kho, giá bán và trạng thái hiển thị."
      tasks={[
        "Nối dữ liệu từ bảng product",
        "Thêm bộ lọc theo danh mục và trạng thái",
        "Tạo form thêm hoặc chỉnh sửa sản phẩm"
      ]}
    />
  );
}
