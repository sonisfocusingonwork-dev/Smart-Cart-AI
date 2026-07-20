import { useState, useEffect, useRef, type FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { io, Socket } from "socket.io-client";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Phone,
  Plus,
  QrCode,
  Smartphone,
  UserRound,
  Users,
  ChevronLeft,
  Headset,
  KeyRound,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { Back, GoldIcon } from "../shared";
import { api } from "../api";

type LoginScreenProps = {
  back: () => void;
  continueAsGuest: () => void;
  onQrLogin: () => void;
  onPhoneLogin: (customer: any) => void;
  onCreateGroup: (name: string) => void;
  onJoinGroup: (name: string, cartId: string, code: string) => string | null;
  onAdminPortal?: () => void;
};

export function LoginScreen({
  back,
  continueAsGuest,
  onQrLogin,
  onPhoneLogin,
  onCreateGroup,
  onJoinGroup,
  onAdminPortal,
}: LoginScreenProps) {
  const [hostName, setHostName] = useState("Xe chính");
  const [joinName, setJoinName] = useState("");
  const [joinCartId, setJoinCartId] = useState("Cart_02 (Xe 2)");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  const [phoneFormOpen, setPhoneFormOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "otp">("login");
  const [typedName, setTypedName] = useState("");
  const [typedAge, setTypedAge] = useState("");
  const [typedPhone, setTypedPhone] = useState("");
  const [typedPin, setTypedPin] = useState("");
  const [typedEmail, setTypedEmail] = useState("");
  const [typedLoginId, setTypedLoginId] = useState("");
  const [typedOtp, setTypedOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [personalError, setPersonalError] = useState("");
  const [showRegisterLink, setShowRegisterLink] = useState(false);

  type RecoveryStep = 'MENU' | 'QR' | 'OTP_PHONE' | 'OTP_VERIFY' | 'RESET_PIN' | 'STAFF' | null;
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>(null);
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [recoveryOtp, setRecoveryOtp] = useState("");
  const [recoveryNewPin, setRecoveryNewPin] = useState("");
  const [recoveryConfirmPin, setRecoveryConfirmPin] = useState("");
  const [isSimulatingQr, setIsSimulatingQr] = useState(false);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // App-less QR Authentication State
  const [qrSessionId, setQrSessionId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrStatus, setQrStatus] = useState<"WAITING" | "SCANNED" | "SUCCESS" | "EXPIRED">("WAITING");
  const [qrCountdown, setQrCountdown] = useState(60);
  const socketRef = useRef<Socket | null>(null);

  const fetchQrSession = async () => {
    try {
      const hostname = window.location.hostname;
      const res = await fetch(`http://${hostname}:5000/api/auth/qr-session/create`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setQrSessionId(data.sessionId);
        setQrUrl(`http://${hostname}:5173/auth/pair?sessionId=${data.sessionId}`);
        setQrStatus("WAITING");
        setQrCountdown(60);
        
        if (socketRef.current) socketRef.current.disconnect();
        const socket = io(`http://${hostname}:5000`);
        socketRef.current = socket;
        
        socket.emit("join-qr-room", data.sessionId);
        
        socket.on("qr-scanned", () => {
          setQrStatus("SCANNED");
        });
        
        socket.on("qr-auth-success", (payload) => {
          setQrStatus("SUCCESS");
          setTimeout(() => {
            onPhoneLogin({ ...payload.user, token: payload.user.token || "mock_token" });
          }, 1500);
        });
      }
    } catch (err) {
      console.error("Error creating QR session:", err);
    }
  };

  useEffect(() => {
    fetchQrSession();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (qrStatus !== "WAITING") return;
    if (qrCountdown <= 0) {
      fetchQrSession();
      return;
    }
    const timer = setInterval(() => {
      setQrCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [qrCountdown, qrStatus]);

  const handleSimulateQrRecovery = () => {
    setIsSimulatingQr(true);
    setTimeout(() => {
      setIsSimulatingQr(false);
      setRecoveryStep(null);
      onPhoneLogin({ id: "recovered_user", name: "Guest User", token: "mock_token" });
    }, 2500);
  };

  const handleSendRecoveryOtp = (e: FormEvent) => {
    e.preventDefault();
    if (!recoveryPhone.trim() || !/^0\d{9}$/.test(recoveryPhone)) {
      setRecoveryError("Vui lòng nhập SĐT 10 số hợp lệ.");
      return;
    }
    setRecoveryError("");
    setRecoveryStep('OTP_VERIFY');
  };

  const handleVerifyRecoveryOtp = (e: FormEvent) => {
    e.preventDefault();
    if (recoveryOtp.trim().length !== 6) {
      setRecoveryError("OTP phải gồm 6 chữ số.");
      return;
    }
    setRecoveryError("");
    setIsSubmittingOtp(true);
    setTimeout(() => {
      setIsSubmittingOtp(false);
      setRecoveryStep('RESET_PIN');
    }, 1500);
  };

  const handleResetPin = (e: FormEvent) => {
    e.preventDefault();
    if (recoveryNewPin.trim().length !== 6) {
      setRecoveryError("Mã PIN phải gồm 6 chữ số.");
      return;
    }
    if (recoveryNewPin !== recoveryConfirmPin) {
      setRecoveryError("Mã PIN xác nhận không khớp.");
      return;
    }
    setRecoveryError("");
    setRecoverySuccess(true);
    setTimeout(() => {
      setRecoverySuccess(false);
      setRecoveryStep(null);
      setRecoveryPhone("");
      setRecoveryOtp("");
      setRecoveryNewPin("");
      setRecoveryConfirmPin("");
    }, 2000);
  };

  const handlePhoneSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPersonalError("");

    if (authMode === "login") {
      const loginId = typedLoginId.trim();
      const pin = typedPin.trim();

      if (!loginId || !pin) {
        setPersonalError("Vui lòng điền Số điện thoại/Email và Mã PIN.");
        return;
      }
      if (!/^\d{6}$/.test(pin)) {
        setPersonalError("Mã PIN phải gồm đúng 6 chữ số.");
        return;
      }

      try {
        const data = await api.loginCustomer(loginId, pin);
        onPhoneLogin({ ...data.customer, token: data.token });
      } catch (err) {
        const msg = (err as Error).message;
        if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) { setPersonalError("Lỗi kết nối máy chủ. Vui lòng kiểm tra lại server backend."); } else if (msg === "user not found") {
          setPersonalError("Tài khoản chưa tồn tại. Vui lòng đăng ký!");
          setShowRegisterLink(true);
        } else {
          setPersonalError("Sai thông tin đăng nhập hoặc mã PIN");
        }
      }
    } else {
      const name = typedName.trim();
      const ageNum = Number(typedAge);
      const phone = typedPhone.replace(/\s+/g, "").trim();
      const pin = typedPin.trim();
      const email = typedEmail.trim();

      if (!name || !typedAge || !phone || !pin) {
        setPersonalError("Vui lòng điền đầy đủ Họ tên, Tuổi, SĐT và Mã PIN.");
        return;
      }
      if (isNaN(ageNum) || ageNum <= 0) {
        setPersonalError("Tuổi phải là số lớn hơn 0.");
        return;
      }
      if (!/^0\d{9}$/.test(phone)) {
        setPersonalError("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.");
        return;
      }
      if (!/^\d{6}$/.test(pin)) {
        setPersonalError("Mã PIN phải gồm đúng 6 chữ số.");
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setPersonalError("Định dạng Email không hợp lệ.");
        return;
      }

      try {
        const data = await api.registerCustomer({
          fullName: name,
          age: ageNum,
          phoneNumber: phone,
          pinCode: pin,
          email: email || undefined
        });

        if (data.message === "OTP_SENT") {
          setOtpEmail(data.email);
          setAuthMode("otp");
          setPersonalError("");
        } else {
          // Direct login (no email provided)
          onPhoneLogin({ ...data.customer, token: data.token });
        }
      } catch (err) {
        setPersonalError((err as Error).message);
      }
    }
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otp = typedOtp.trim();
    if (!otp) {
      setPersonalError("Vui lòng nhập mã OTP.");
      return;
    }

    try {
      const data = await api.verifyCustomerEmail(otpEmail, otp);
      onPhoneLogin({ ...data.customer, token: data.token });
    } catch (err) {
      setPersonalError((err as Error).message);
    }
  };



  return (
    <section className="relative flex h-full overflow-hidden bg-white">
      <div className="absolute left-7 top-7 z-20">
        <Back onClick={back} />
      </div>

      <div className="flex w-[43%] shrink-0 flex-col items-center justify-center overflow-y-auto bg-[#F5F5E6] px-10 py-16 text-[#334155] [scrollbar-width:none]">
        <p className="text-sm font-black uppercase tracking-[.18em] text-[#15803D]">
          Đồng bộ tài khoản
        </p>
        <h1 className="mt-2 text-center text-3xl font-black">
          Đăng nhập Smart Cart
        </h1>
        <p className="mt-2 max-w-sm text-center text-sm font-semibold leading-relaxed text-[#475569]">
          Quét QR, dùng số điện thoại hoặc tiếp tục mua sắm với tư cách khách.
        </p>

        <div className="relative mt-7 flex flex-col items-center justify-center">
          {/* Status Label */}
          <div
            className={`absolute -top-4 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 shadow-sm font-bold text-[10px] uppercase tracking-wider transition-all duration-300 ${
              qrStatus === "SUCCESS"
                ? "bg-[#15803D] text-white"
                : qrStatus === "EXPIRED"
                  ? "bg-rose-500 text-white"
                  : qrStatus === "SCANNED"
                    ? "bg-amber-500 text-white animate-pulse"
                    : "bg-white text-[#15803D] border border-[#15803D]"
            }`}
          >
            {qrStatus === "SUCCESS" && <CheckCircle2 size={12} />}
            {qrStatus === "EXPIRED" && <AlertTriangle size={12} />}
            {qrStatus === "SCANNED" && <Loader2 size={12} className="animate-spin" />}
            {qrStatus === "WAITING" && <Smartphone size={12} />}
            <span>
              {qrStatus === "SUCCESS"
                ? "Kết nối thành công"
                : qrStatus === "EXPIRED"
                  ? "Mã QR đã hết hạn"
                  : qrStatus === "SCANNED"
                    ? "Đang xác minh..."
                    : "Chờ quét mã"}
            </span>
          </div>

          {/* QR Container */}
          <div className="relative flex h-[220px] w-[220px] items-center justify-center rounded-[32px] bg-white shadow-[8px_8px_0px_0px_rgba(51,65,85,0.06)] border border-[#E2E8F0] overflow-hidden">
            {qrUrl && qrStatus !== "EXPIRED" ? (
              <div className={`h-full w-full transition-opacity duration-300 ${qrStatus !== "WAITING" ? "opacity-30 blur-[2px]" : ""}`}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrUrl)}&color=15803D&margin=0`}
                  alt="QR Code"
                  width={220}
                  height={220}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : qrStatus === "EXPIRED" ? (
              <div className="flex flex-col items-center justify-center text-[#94A3B8]">
                <QrCode size={64} strokeWidth={1} />
              </div>
            ) : (
              <Loader2 size={32} className="animate-spin text-[#15803D]" />
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-1.5 text-sm font-bold text-[#475569]">
          <div className="flex items-center gap-2">
            <Smartphone size={17} className="text-[#15803D]" />
            Sử dụng camera điện thoại để quét mã
          </div>
          {qrStatus === "WAITING" && (
            <div className="text-[10px] font-semibold text-[#94A3B8]">
              Mã tự động làm mới sau <span className="font-mono text-[#15803D]">{qrCountdown}s</span>
            </div>
          )}
          <button
            type="button"
            onClick={onQrLogin}
            className="mt-3 text-xs font-black text-[#15803D] underline-offset-4 hover:underline"
          >
            Mô phỏng quét QR thành công
          </button>
        </div>

        <div className="my-5 flex w-full max-w-[330px] items-center gap-3 text-xs font-bold uppercase tracking-[.16em] text-[#475569]">
          <span className="h-px flex-1 bg-white" />
          hoặc
          <span className="h-px flex-1 bg-white" />
        </div>

        {!phoneFormOpen ? (
          <button
            type="button"
            onClick={() => {
              setPhoneFormOpen(true);
              setAuthMode("login");
              setPersonalError("");
              setShowRegisterLink(false);
            }}
            className="flex h-12 w-full max-w-[330px] items-center justify-center gap-2 rounded-2xl border border-[#15803D]/70 bg-white px-5 text-sm font-extrabold text-[#15803D] transition hover:bg-white"
          >
            <Phone size={18} /> Đăng nhập bằng SĐT hoặc Mail
          </button>
        ) : authMode === "otp" ? (
          <form
            onSubmit={handleOtpSubmit}
            className="w-full max-w-[330px] rounded-2xl border border-[#E2E8F0] bg-white p-4"
          >
            <h3 className="text-center text-sm font-black text-[#15803D] mb-2 uppercase tracking-wider">
              Xác nhận Email
            </h3>
            <p className="text-[11px] text-center text-[#475569] mb-4 leading-relaxed">
              Mã xác thực OTP đã được gửi tới <strong>{otpEmail}</strong>. Vui lòng nhập mã để kích hoạt tài khoản.
            </p>
            <div className="relative">
              <QrCode
                size={17}
                className="absolute left-3 top-3 text-[#64748B]"
              />
              <input
                value={typedOtp}
                onChange={(event) => setTypedOtp(event.target.value)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Nhập 6 số OTP"
                className="h-11 w-full text-center tracking-[0.5em] font-mono rounded-2xl bg-white pl-3 pr-3 text-lg font-black text-[#334155] outline-none ring-[#D3524B] focus:ring-2"
              />
            </div>
            {personalError && (
              <p className="mt-2 text-xs font-bold text-red-300 text-center">
                {personalError}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setPersonalError("");
                }}
                className="h-11 flex-1 rounded-2xl border border-[#E2E8F0] text-xs font-black text-white hover:bg-white"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="flex h-11 flex-1 items-center justify-center gap-1 rounded-2xl bg-[#15803D] text-xs font-black text-white hover:bg-[#15803D] shadow-md transition-colors"
              >
                Xác thực <ArrowRight size={15} />
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handlePhoneSubmit}
            className="w-full max-w-[330px] rounded-2xl border border-[#E2E8F0] bg-white p-4 space-y-3"
          >
            <div className="mb-1 flex border-b border-[#E2E8F0] pb-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setPersonalError("");
                  setShowRegisterLink(false);
                }}
                className={`flex-1 text-center text-xs font-black pb-1 transition ${authMode === "login" ? "border-b-2 border-[#15803D] text-[#15803D]" : "text-[#CBD5E1]"}`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setPersonalError("");
                  setShowRegisterLink(false);
                }}
                className={`flex-1 text-center text-xs font-black pb-1 transition ${authMode === "register" ? "border-b-2 border-[#15803D] text-[#15803D]" : "text-[#CBD5E1]"}`}
              >
                Đăng ký
              </button>
            </div>

            {authMode === "login" ? (
              <>
                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-3 text-[#64748B]"
                  />
                  <input
                    value={typedLoginId}
                    onChange={(event) => setTypedLoginId(event.target.value)}
                    type="text"
                    placeholder="SĐT hoặc Email"
                    className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition-all"
                  />
                </div>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-3 text-[#64748B]"
                  />
                  <input
                    value={typedPin}
                    onChange={(event) => setTypedPin(event.target.value.replace(/\D/g, ''))}
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Nhập mã PIN (6 số)"
                    className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition-all"
                  />
                </div>
                <div className="text-right mt-1">
                  <button 
                    type="button" 
                    onClick={() => setRecoveryStep('MENU')}
                    className="text-[11px] font-black text-[#15803D] hover:underline"
                  >
                    Quên mã PIN?
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-3 text-[#64748B]"
                  />
                  <input
                    value={typedName}
                    onChange={(event) => setTypedName(event.target.value)}
                    type="text"
                    placeholder="Họ và tên"
                    className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition-all"
                  />
                </div>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-3 text-[#64748B]"
                  />
                  <input
                    value={typedAge}
                    onChange={(event) => setTypedAge(event.target.value.replace(/\D/g, ''))}
                    type="text"
                    inputMode="numeric"
                    placeholder="Tuổi"
                    className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-3 text-[#64748B]"
                  />
                  <input
                    value={typedPhone}
                    onChange={(event) => setTypedPhone(event.target.value)}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Số điện thoại"
                    className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition-all"
                  />
                </div>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-3 text-[#64748B]"
                  />
                  <input
                    value={typedPin}
                    onChange={(event) => setTypedPin(event.target.value.replace(/\D/g, ''))}
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Tạo mã PIN (6 số)"
                    className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition-all"
                  />
                </div>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3 top-3 text-[#64748B]"
                  />
                  <input
                    value={typedEmail}
                    onChange={(event) => setTypedEmail(event.target.value)}
                    type="text"
                    placeholder="Email (Không bắt buộc)"
                    className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition-all"
                  />
                </div>
              </>
            )}

            {personalError && (
              <div className="mt-2 text-xs font-bold text-red-300">
                <p>{personalError}</p>
                {showRegisterLink && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setPersonalError("");
                      setShowRegisterLink(false);
                    }}
                    className="mt-1.5 block text-xs font-black text-[#15803D] underline text-left hover:text-[#334155]"
                  >
                    Đăng ký ngay tài khoản mới
                  </button>
                )}
              </div>
            )}

            <div className="mt-3 flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPhoneFormOpen(false);
                  setPersonalError("");
                  setShowRegisterLink(false);
                }}
                className="h-11 flex-1 rounded-2xl border border-[#E2E8F0] bg-white text-xs font-black text-[#64748B] hover:bg-[#F8FAFC] transition-all shadow-[2px_2px_0px_0px_rgba(51,65,85,0.04)]"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex h-11 flex-1 items-center justify-center gap-1 rounded-2xl bg-[#15803D] text-xs font-black text-white hover:bg-[#15803D] shadow-md transition-colors"
              >
                {authMode === "login" ? "Đăng nhập" : "Đăng ký"} <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}


        <button
          type="button"
          onClick={continueAsGuest}
          className="mt-3 flex h-11 w-full max-w-[330px] items-center justify-center rounded-2xl border border-transparent bg-white px-5 text-sm font-bold text-[#334155] transition hover:bg-white"
        >
          Tiếp tục với tư cách khách (Guest)
        </button>


      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-10 py-9 [scrollbar-width:none]">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[.18em] text-[#15803D]">
            Group Shopping
          </p>
          <h2 className="mt-1 text-4xl font-black text-[#334155]">
            Mua sắm theo nhóm
          </h2>
          <p className="mt-2 text-sm font-semibold text-[#64748B]">
            Xe chính tạo mã. Xe 2 và xe 3 nhập mã để dùng chung giỏ hàng và
            shopping list.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!hostName.trim()) {
                setError("Vui lòng nhập tên người dùng xe chính.");
                return;
              }
              setError("");
              onCreateGroup(hostName.trim());
            }}
            className="rounded-3xl border border-[#15803D] bg-[#F5F5E6] p-6 text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
          >
            <div className="flex items-center gap-3">
              <GoldIcon className="h-12 w-12">
                <Users size={22} />
              </GoldIcon>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#15803D]">
                  Dành cho Cart 01
                </p>
                <h3 className="text-xl font-black">Tạo nhóm trên xe chính</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#475569]">
              Sau khi tạo nhóm, xe chính sẽ hiển thị mã gồm 6 số để các xe còn
              lại tham gia.
            </p>
            <label className="mt-5 block text-xs font-black uppercase tracking-wider text-[#15803D]">
              Tên thành viên xe chính
            </label>
            <input
              value={hostName}
              onChange={(event) => setHostName(event.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-[#E2E8F0] bg-white px-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D]"
              placeholder="Ví dụ: Ba"
            />
            <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#15803D] font-black text-white hover:bg-[#15803D]/90 shadow-sm border border-[#E2E8F0]">
              <Plus size={18} /> Tạo nhóm và lấy mã
            </button>
          </form>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!joinName.trim() || !joinCode.trim()) {
                setError("Vui lòng nhập tên và mã nhóm.");
                return;
              }
              const result = onJoinGroup(
                joinName.trim(),
                joinCartId,
                joinCode.trim(),
              );
              setError(result ?? "");
            }}
            className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
          >
            <div className="flex items-center gap-3">
              <GoldIcon className="h-12 w-12">
                <QrCode size={22} />
              </GoldIcon>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#15803D]">
                  Dành cho Cart 02–03
                </p>
                <h3 className="text-xl font-black text-[#334155]">
                  Tham gia mua sắm theo nhóm
                </h3>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={joinName}
                onChange={(event) => setJoinName(event.target.value)}
                className="h-11 w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-bold outline-none focus:border-[#15803D]"
                placeholder="Tên thành viên"
              />
              <select
                value={joinCartId}
                onChange={(event) => setJoinCartId(event.target.value)}
                className="h-11 w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm font-bold outline-none focus:border-[#15803D]"
              >
                <option value="Cart_02 (Xe 2)">Cart_02 (Xe 2)</option>
                <option value="Cart_03 (Xe 3)">Cart_03 (Xe 3)</option>
              </select>
              <input
                value={joinCode}
                onChange={(event) =>
                  setJoinCode(event.target.value.toUpperCase())
                }
                className="h-12 w-full rounded-2xl border-2 border-[#15803D] bg-[#FFF7ED] px-3 text-center font-mono text-xl font-black uppercase tracking-[.18em] outline-none"
                placeholder="SC-123456"
                maxLength={9}
              />
            </div>
            <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#F5F5E6] border border-[#E2E8F0] font-black text-[#15803D] hover:bg-[#15803D] hover:text-white transition-colors">
              <Users size={18} /> Nhập mã và tham gia
            </button>
          </form>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            "Giỏ hàng đồng bộ thời gian thực",
            "Shopping list dùng chung",
            "Cảnh báo sản phẩm trùng lặp",
          ].map((label, index) => (
            <div
              key={label}
              className="flex min-h-[68px] items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4"
            >
              <CheckCircle2 size={20} className="shrink-0 text-[#15803D]" />
              <span className="text-xs font-extrabold text-[#334155]">
                {index + 1}. {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Modal Overlay */}
      {recoveryStep && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#334155]/60 backdrop-blur-sm transition-all duration-200">
          <div className="relative w-full max-w-[360px] overflow-hidden rounded-[32px] bg-[#F5F5E6] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-5 py-4">
              <div className="flex items-center gap-3">
                {recoveryStep !== 'MENU' && recoveryStep !== 'RESET_PIN' && (
                  <button onClick={() => {
                    if (recoveryStep === 'QR' || recoveryStep === 'OTP_PHONE' || recoveryStep === 'STAFF') setRecoveryStep('MENU');
                    if (recoveryStep === 'OTP_VERIFY') setRecoveryStep('OTP_PHONE');
                    setRecoveryError("");
                  }} className="text-[#64748B] hover:text-[#15803D] transition">
                    <ChevronLeft size={20} strokeWidth={3} />
                  </button>
                )}
                <h3 className="text-[15px] font-black text-[#334155]">
                  {recoveryStep === 'MENU' && "Khôi phục đăng nhập"}
                  {recoveryStep === 'QR' && "Quét mã QR"}
                  {recoveryStep === 'OTP_PHONE' && "Xác thực qua SĐT"}
                  {recoveryStep === 'OTP_VERIFY' && "Nhập mã OTP"}
                  {recoveryStep === 'RESET_PIN' && "Tạo mã PIN mới"}
                  {recoveryStep === 'STAFF' && "Nhân viên hỗ trợ"}
                </h3>
              </div>
              <button 
                onClick={() => { setRecoveryStep(null); setRecoveryError(""); }}
                className="rounded-full bg-[#F1F5F9] p-1.5 text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#334155] transition"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {recoveryStep === 'MENU' && (
                <div className="space-y-3">
                  <p className="mb-4 text-xs font-semibold text-[#64748B] text-center px-2 leading-relaxed">
                    Đừng lo, hãy chọn một phương thức dưới đây để khôi phục hoặc tiếp tục mua sắm nhé!
                  </p>
                  <button onClick={() => setRecoveryStep('QR')} className="group flex w-full items-center gap-4 rounded-2xl border-2 border-[#15803D] bg-[#D1FAE5]/30 p-4 text-left transition hover:bg-[#D1FAE5]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#15803D] text-white">
                      <QrCode size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#15803D]">Đăng nhập bằng QR</h4>
                      <p className="text-[11px] font-semibold text-[#15803D]/70">Nhanh chóng & An toàn nhất</p>
                    </div>
                  </button>
                  <button onClick={() => setRecoveryStep('OTP_PHONE')} className="group flex w-full items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#15803D] hover:bg-[#F8FAFC]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569] group-hover:bg-[#15803D]/10 group-hover:text-[#15803D]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#334155]">Nhận mã OTP qua SĐT</h4>
                      <p className="text-[11px] font-semibold text-[#64748B]">Tạo lại mã PIN mới</p>
                    </div>
                  </button>
                  <button onClick={() => { setRecoveryStep(null); continueAsGuest(); }} className="group flex w-full items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#15803D] hover:bg-[#F8FAFC]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569] group-hover:bg-[#15803D]/10 group-hover:text-[#15803D]">
                      <UserRound size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#334155]">Tiếp tục với tư cách Khách</h4>
                      <p className="text-[11px] font-semibold text-[#64748B]">Bỏ qua đăng nhập</p>
                    </div>
                  </button>
                  <button onClick={() => setRecoveryStep('STAFF')} className="group flex w-full items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#15803D] hover:bg-[#F8FAFC]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569] group-hover:bg-[#15803D]/10 group-hover:text-[#15803D]">
                      <Headset size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#334155]">Liên hệ nhân viên hỗ trợ</h4>
                      <p className="text-[11px] font-semibold text-[#64748B]">Hỗ trợ thủ công</p>
                    </div>
                  </button>
                </div>
              )}

              {recoveryStep === 'QR' && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-5 flex h-48 w-48 items-center justify-center rounded-[32px] border-4 border-dashed border-[#15803D]/30 bg-white shadow-sm">
                    {isSimulatingQr ? (
                      <div className="flex flex-col items-center text-[#15803D]">
                        <Loader2 size={40} className="animate-spin mb-3" />
                        <span className="text-xs font-black">Đang xác thực...</span>
                      </div>
                    ) : (
                      <QrCode size={120} className="text-[#334155]" strokeWidth={1.2} />
                    )}
                  </div>
                  <div className="w-full space-y-2 rounded-2xl bg-white p-4 border border-[#E2E8F0]">
                    <p className="text-[11px] font-bold text-[#475569]"><span className="text-[#15803D] font-black">1.</span> Mở ứng dụng Smart Cart trên điện thoại</p>
                    <p className="text-[11px] font-bold text-[#475569]"><span className="text-[#15803D] font-black">2.</span> Chọn 'Quét QR để đăng nhập'</p>
                    <p className="text-[11px] font-bold text-[#475569]"><span className="text-[#15803D] font-black">3.</span> Xác thực bằng Face ID/Vân tay/OTP</p>
                  </div>
                  {!isSimulatingQr && (
                    <button onClick={handleSimulateQrRecovery} className="mt-5 text-xs font-black text-[#15803D] underline-offset-4 hover:underline">
                      Mô phỏng quét thành công
                    </button>
                  )}
                </div>
              )}

              {recoveryStep === 'OTP_PHONE' && (
                <form onSubmit={handleSendRecoveryOtp} className="space-y-4">
                  <p className="text-xs font-semibold text-[#64748B] text-center px-2 leading-relaxed mb-4">
                    Nhập số điện thoại đã đăng ký, chúng tôi sẽ gửi mã OTP để bạn tạo lại mã PIN mới.
                  </p>
                  <div className="relative">
                    <Phone size={17} className="absolute left-3 top-3 text-[#64748B]" />
                    <input
                      value={recoveryPhone}
                      onChange={(e) => setRecoveryPhone(e.target.value.replace(/\D/g, ''))}
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Số điện thoại"
                      autoFocus
                      className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition-all"
                    />
                  </div>
                  {recoveryError && <p className="text-xs font-bold text-red-400 text-center">{recoveryError}</p>}
                  <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#15803D] text-xs font-black text-white hover:bg-[#15803D]/90 shadow-md transition-colors mt-2">
                    Gửi mã OTP <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {recoveryStep === 'OTP_VERIFY' && (
                <form onSubmit={handleVerifyRecoveryOtp} className="space-y-4">
                  <p className="text-[11px] font-semibold text-[#64748B] text-center px-2 leading-relaxed mb-4">
                    Mã OTP 6 số đã được gửi đến <strong>{recoveryPhone}</strong>.
                  </p>
                  <input
                    value={recoveryOtp}
                    onChange={(e) => setRecoveryOtp(e.target.value.replace(/\D/g, ''))}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Nhập 6 số OTP"
                    autoFocus
                    className="h-12 w-full text-center tracking-[0.5em] font-mono rounded-2xl bg-white border border-[#E2E8F0] text-lg font-black text-[#334155] outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]"
                  />
                  {recoveryError && <p className="text-xs font-bold text-red-400 text-center">{recoveryError}</p>}
                  <button disabled={isSubmittingOtp} type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#15803D] text-xs font-black text-white hover:bg-[#15803D]/90 shadow-md transition-colors disabled:opacity-70 mt-2">
                    {isSubmittingOtp ? <Loader2 size={16} className="animate-spin" /> : "Xác thực OTP"}
                  </button>
                </form>
              )}

              {recoveryStep === 'RESET_PIN' && (
                <div className="relative">
                  {recoverySuccess ? (
                    <div className="flex flex-col items-center py-6 text-center animate-in fade-in zoom-in duration-300">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5]">
                        <ShieldCheck size={32} className="text-[#15803D]" />
                      </div>
                      <h4 className="text-lg font-black text-[#15803D]">Đổi mã PIN thành công!</h4>
                      <p className="mt-2 text-xs font-semibold text-[#64748B]">Bạn có thể sử dụng mã PIN mới để đăng nhập.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleResetPin} className="space-y-3">
                      <p className="text-xs font-semibold text-[#64748B] text-center px-2 leading-relaxed mb-2">
                        Tuyệt vời! Bây giờ hãy tạo mã PIN mới cho tài khoản của bạn.
                      </p>
                      <div className="relative">
                        <KeyRound size={17} className="absolute left-3 top-3 text-[#64748B]" />
                        <input
                          value={recoveryNewPin}
                          onChange={(e) => setRecoveryNewPin(e.target.value.replace(/\D/g, ''))}
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Tạo mã PIN mới (6 số)"
                          autoFocus
                          className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D]"
                        />
                      </div>
                      <div className="relative">
                        <KeyRound size={17} className="absolute left-3 top-3 text-[#64748B]" />
                        <input
                          value={recoveryConfirmPin}
                          onChange={(e) => setRecoveryConfirmPin(e.target.value.replace(/\D/g, ''))}
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Nhập lại PIN"
                          className="h-11 w-full rounded-2xl bg-white border border-[#E2E8F0] pl-10 pr-3 text-sm font-bold text-[#334155] outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D]"
                        />
                      </div>
                      {recoveryError && <p className="text-xs font-bold text-red-400 text-center pt-1">{recoveryError}</p>}
                      <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#15803D] text-xs font-black text-white hover:bg-[#15803D]/90 shadow-md transition-colors mt-4">
                        <CheckCircle2 size={16} /> Lưu mã PIN mới
                      </button>
                    </form>
                  )}
                </div>
              )}

              {recoveryStep === 'STAFF' && (
                <div className="flex flex-col items-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#D1FAE5]/50 border-2 border-[#15803D]/20">
                    <Headset size={40} className="text-[#15803D]" />
                  </div>
                  <p className="text-center text-sm font-semibold text-[#475569] leading-relaxed px-2">
                    Vui lòng cung cấp <strong className="text-[#334155]">Mã xe</strong> dưới đây cho nhân viên cửa hàng để được hỗ trợ mở khóa thủ công.
                  </p>
                  
                  <div className="mt-6 mb-8 w-full rounded-2xl border-2 border-[#15803D] bg-[#D1FAE5] py-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#15803D]">Mã xe của bạn</p>
                    <p className="mt-1 font-mono text-2xl font-black text-[#15803D]">SC-123456</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

