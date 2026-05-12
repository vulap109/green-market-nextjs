import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin"
};

const dashboardStats = [
  {
    label: "Sản phẩm",
    value: "0",
    description: "Sẵn sàng nối dữ liệu quản trị"
  },
  {
    label: "Đơn hàng",
    value: "0",
    description: "Theo dõi đơn mới và trạng thái xử lý"
  },
  {
    label: "Khách hàng",
    value: "0",
    description: "Quản lý thông tin và lịch sử mua hàng"
  }
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold text-slate-950">Tổng quan</h2>
        <p className="mt-1 text-sm text-slate-600">
          Khu vực admin đã được tách khỏi layout shop để phát triển các trang quản trị riêng.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-600">{stat.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-bold text-slate-950">Các bước tiếp theo</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {["Tạo trang danh sách sản phẩm", "Tạo trang quản lý đơn hàng", "Gắn middleware kiểm tra quyền admin"].map(
            (task) => (
              <div key={task} className="flex items-center gap-3 px-5 py-4 text-sm text-slate-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-primary">
                  <i className="fa-solid fa-check text-[10px]" aria-hidden="true" />
                </span>
                <span>{task}</span>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
