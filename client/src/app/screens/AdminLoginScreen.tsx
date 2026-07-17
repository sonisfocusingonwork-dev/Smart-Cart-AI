import { useState, type FormEvent } from "react";
import { Lock, Phone, User, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "../api";


type AdminLoginScreenProps = {
  back: () => void;
  onLoginSuccess: (adminName: string, token: string, role: string) => void;
};

export function AdminLoginScreen({ back, onLoginSuccess }: AdminLoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const data = await api.loginAdmin(username.trim(), password.trim());
      setLoading(false);
      onLoginSuccess(data.admin.name, data.token, data.admin.role);
    } catch (err) {
      setLoading(false);
      setError((err as Error).message);
    }
  };


  return (
    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 text-white">
      {/* Back button */}
      <button
        onClick={back}
        className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
        aria-label="Quay lại"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-orange-500/20">
            <Lock size={32} />
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-wide text-white uppercase">
            Cổng Quản Trị Hệ Thống
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Đăng nhập bằng tài khoản Kỹ thuật viên để vào Admin Dashboard.
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập (ví dụ: 0987654321)"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-[#F97316] focus:bg-white/10 focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (ví dụ: 654321)"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-[#F97316] focus:bg-white/10 focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-sm font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Xác thực & Đăng nhập"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Tài khoản Demo: <code className="text-[#F97316] bg-slate-800 px-1.5 py-0.5 rounded">0987654321</code> / <code className="text-[#F97316] bg-slate-800 px-1.5 py-0.5 rounded">654321</code>
        </div>
      </div>
    </div>
  );
}
