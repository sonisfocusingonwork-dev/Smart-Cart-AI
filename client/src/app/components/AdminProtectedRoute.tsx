import { ReactNode } from "react";

type AdminProtectedRouteProps = {
  children: ReactNode;
  userRole: string | null;
  onRedirect: () => void;
};

export function AdminProtectedRoute({ children, userRole, onRedirect }: AdminProtectedRouteProps) {
  const allowedRoles = ["admin", "RootAdmin", "StoreManager", "Tech", "Security"];
  const isAdmin = userRole && allowedRoles.includes(userRole);

  if (!isAdmin) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#F5F5E6] text-[#334155]">
        <div className="rounded-3xl border border-[#15803D]/20 bg-[#15803D]/5 p-8 text-center shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] max-w-md">
          <h1 className="text-4xl font-black text-[#15803D] tracking-wider">403</h1>
          <h2 className="text-xl font-bold mt-2 text-[#334155]">Truy cập bị từ chối</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#475569]">
            Bạn không có quyền truy cập vào Cổng Quản trị viên của Smart Cart. Vui lòng đăng nhập bằng tài khoản Quản trị để tiếp tục.
          </p>
          <button
            onClick={onRedirect}
            className="mt-6 w-full rounded-2xl bg-[#15803D] py-3 text-sm font-black text-white hover:bg-[#15803D] shadow-md transition shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
          >
            Quay lại Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
