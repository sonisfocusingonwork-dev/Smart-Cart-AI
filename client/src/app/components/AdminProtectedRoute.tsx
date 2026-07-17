import { ReactNode } from "react";

type AdminProtectedRouteProps = {
  children: ReactNode;
  userRole: string | null;
  onRedirect: () => void;
};

export function AdminProtectedRoute({ children, userRole, onRedirect }: AdminProtectedRouteProps) {
  const isAdmin = userRole === "admin";

  if (!isAdmin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0F172A] text-white">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] max-w-md">
          <h1 className="text-4xl font-black text-red-500 tracking-wider">403</h1>
          <h2 className="text-xl font-bold mt-2 text-white">Truy cập bị từ chối</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Bạn không có quyền truy cập vào Cổng Quản trị viên của Smart Cart. Vui lòng đăng nhập bằng tài khoản Quản trị để tiếp tục.
          </p>
          <button
            onClick={onRedirect}
            className="mt-6 w-full rounded-xl bg-[#F97316] py-3 text-sm font-black text-[#0F172A] hover:bg-orange-500 transition shadow-[0_0_20px_rgba(249,115,22,0.3)]"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
