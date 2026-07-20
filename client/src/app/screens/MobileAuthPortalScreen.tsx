import { useState, FormEvent, useEffect } from "react";
import { ChevronLeft, LogIn, Phone, Smartphone, UserRound } from "lucide-react";
import { api } from "../api";

export function MobileAuthPortalScreen() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "guest">("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp" | "success" | "error">("credentials");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Extract sessionId from URL
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("sessionId");
    if (sid) {
      setSessionId(sid);
      // Notify backend that QR was scanned
      fetch(`http://${window.location.hostname}:5000/api/auth/qr-session/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid })
      }).catch(console.error);
    } else {
      setStep("error");
      setErrorMsg("Không tìm thấy phiên đăng nhập (Thiếu sessionId).");
    }
  }, []);

  const handleSendOtp = (e: FormEvent) => {
    e.preventDefault();
    if (!phone || !/^0\d{9}$/.test(phone)) {
      setErrorMsg("Vui lòng nhập số điện thoại hợp lệ (10 số).");
      return;
    }
    setErrorMsg("");
    setStep("otp");
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg("OTP phải gồm 6 chữ số.");
      return;
    }
    submitPairing(phone, "Khách hàng");
  };

  const handleGuestSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập tên của bạn.");
      return;
    }
    submitPairing(undefined, name);
  };

  const submitPairing = async (userPhone?: string, userName?: string) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/auth/qr-session/pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, phone: userPhone, name: userName })
      });
      const data = await res.json();
      if (data.success) {
        setStep("success");
      } else {
        setStep("error");
        setErrorMsg(data.message || "Xác thực thất bại.");
      }
    } catch (err) {
      setStep("error");
      setErrorMsg("Lỗi kết nối máy chủ.");
    }
  };

  if (step === "success") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="w-full max-w-sm p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5] text-[#15803D]">
            <LogIn size={32} />
          </div>
          <h2 className="text-xl font-black text-[#15803D] mb-2">Kết nối thành công!</h2>
          <p className="text-sm font-semibold text-[#64748B]">Bạn có thể tiếp tục mua sắm trên xe đẩy Smart Cart.</p>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="w-full max-w-sm p-6 text-center">
          <h2 className="text-xl font-black text-[#EF4444] mb-2">Lỗi kết nối</h2>
          <p className="text-sm font-bold text-[#64748B]">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8FAFC]">
      <div className="bg-white px-4 py-4 shadow-sm flex items-center gap-3">
        <Smartphone className="text-[#15803D]" size={24} />
        <h1 className="text-lg font-black text-[#334155] tracking-tight">Smart Cart <span className="text-[#15803D]">Auth</span></h1>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center items-center">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-md border border-[#E2E8F0]">
          <div className="flex border-b border-[#E2E8F0] mb-6">
            <button
              onClick={() => { setAuthMode("login"); setErrorMsg(""); setStep("credentials"); }}
              className={`flex-1 pb-3 text-center text-sm font-black transition-colors ${authMode === "login" ? "border-b-2 border-[#15803D] text-[#15803D]" : "text-[#94A3B8]"}`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setAuthMode("guest"); setErrorMsg(""); setStep("credentials"); }}
              className={`flex-1 pb-3 text-center text-sm font-black transition-colors ${authMode === "guest" ? "border-b-2 border-[#15803D] text-[#15803D]" : "text-[#94A3B8]"}`}
            >
              Khách vãng lai
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-xs font-bold text-red-500">
              {errorMsg}
            </div>
          )}

          {authMode === "login" ? (
            step === "credentials" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-3.5 text-[#94A3B8]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Số điện thoại di động"
                    className="h-12 w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] pl-11 pr-4 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>
                <button type="submit" className="h-12 w-full rounded-2xl bg-[#15803D] text-sm font-black text-white hover:bg-[#166534] shadow-[0_4px_12px_rgba(21,128,61,0.25)] transition-all">
                  Tiếp tục
                </button>
                <div className="pt-4 text-center">
                  <span className="text-xs font-bold text-[#94A3B8]">Hoặc đăng nhập bằng</span>
                  <button type="button" className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white text-sm font-black text-[#334155] hover:bg-[#F8FAFC]">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-5 w-5" />
                    Google
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <button type="button" onClick={() => setStep("credentials")} className="flex items-center gap-1 text-xs font-bold text-[#15803D] mb-2">
                  <ChevronLeft size={16} /> Quay lại
                </button>
                <p className="text-xs font-bold text-[#64748B] text-center mb-4">Nhập mã OTP vừa được gửi đến {phone}</p>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="h-14 w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-center text-xl tracking-[0.5em] font-mono font-black text-[#334155] outline-none focus:border-[#15803D]"
                />
                <button type="submit" className="h-12 w-full rounded-2xl bg-[#15803D] text-sm font-black text-white hover:bg-[#166534] shadow-[0_4px_12px_rgba(21,128,61,0.25)] transition-all">
                  Xác thực & Kết nối
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div className="relative">
                <UserRound size={18} className="absolute left-3.5 top-3.5 text-[#94A3B8]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên hiển thị của bạn"
                  className="h-12 w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] pl-11 pr-4 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D]"
                />
              </div>
              <button type="submit" className="h-12 w-full rounded-2xl bg-[#15803D] text-sm font-black text-white hover:bg-[#166534] shadow-[0_4px_12px_rgba(21,128,61,0.25)] transition-all">
                Bắt đầu mua sắm
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
