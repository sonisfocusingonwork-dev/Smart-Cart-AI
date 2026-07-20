import React, { useState } from "react";
import { ArrowLeft, ShieldCheck, WifiOff } from "lucide-react";
import { api } from "../../api";

interface GatewayLoginScreenProps {
  onLoginSuccess: (name: string, token: string) => void;
  onBack: () => void;
}

export function GatewayLoginScreen({ onLoginSuccess, onBack }: GatewayLoginScreenProps) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !pin) {
      setError("Vui lòng nhập đầy đủ Số điện thoại và Mã PIN.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Use existing admin login endpoint
      const res = await api.adminLogin(phone, pin);
      
      if (res.admin.role !== "GatewayChecker" && res.admin.role !== "RootAdmin") {
        setError("Tài khoản không có quyền truy cập Cổng Kiểm Soát.");
        setLoading(false);
        return;
      }

      onLoginSuccess(res.admin.name, res.token);
    } catch (err) {
      setError("Đăng nhập thất bại. Kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex bg-[#F5F5E6]">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex flex-1 bg-[#15803D] flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <ShieldCheck size={120} className="mb-8 drop-shadow-lg" />
        <h1 className="text-4xl font-black text-center mb-4 tracking-tight drop-shadow-sm">Gateway Control</h1>
        <p className="text-green-100 text-center text-lg max-w-md font-medium opacity-90">
          Cổng kiểm soát an ninh thông minh. Hệ thống tự động phân tích độ tin cậy và đối chiếu hóa đơn trực tiếp.
        </p>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#FFFFFF]">
        <button
          onClick={onBack}
          className="absolute top-8 left-8 lg:left-[50%] lg:ml-8 flex items-center gap-2 text-[#64748B] hover:text-[#334155] transition-colors font-bold bg-[#F8FAFC] px-4 py-2 rounded-2xl border border-[#E2E8F0]"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-black text-[#15803D] mb-2 tracking-tight">Cổng Kiểm Soát</h2>
            <p className="text-[#64748B] font-medium text-sm">Vui lòng đăng nhập bằng tài khoản An ninh / Gateway.</p>
          </div>

          {isOffline && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-2xl flex items-start gap-3 font-medium text-sm">
              <WifiOff className="shrink-0 mt-0.5" size={18} />
              <p>Mất kết nối mạng. Hệ thống sẽ sử dụng Offline Mode. Dữ liệu sẽ được đồng bộ khi có mạng lại.</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#334155] block">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-[#334155] font-bold focus:outline-none focus:border-[#15803D] focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#334155] block">Mã PIN (6 số)</label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-5 py-4 text-[#334155] font-black tracking-[0.5em] text-center focus:outline-none focus:border-[#15803D] focus:bg-white transition-all shadow-sm"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-bold animate-fade-in text-center bg-red-50 py-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#15803D] hover:bg-[#15803D]/90 text-white font-black py-4 rounded-2xl transition-all shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] disabled:opacity-70 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Vào Ca Trực"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
