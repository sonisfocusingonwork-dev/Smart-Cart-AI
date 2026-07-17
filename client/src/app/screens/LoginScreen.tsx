import { useState, type FormEvent } from "react";
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

      <div className="flex w-[43%] shrink-0 flex-col items-center justify-center overflow-y-auto bg-[#0F172A] px-10 py-16 text-white [scrollbar-width:none]">
        <p className="text-sm font-black uppercase tracking-[.18em] text-[#F97316]">
          Đồng bộ tài khoản
        </p>
        <h1 className="mt-2 text-center text-3xl font-black">
          Đăng nhập Smart Cart
        </h1>
        <p className="mt-2 max-w-sm text-center text-sm font-semibold leading-relaxed text-[#CBD5E1]">
          Quét QR, dùng số điện thoại hoặc tiếp tục mua sắm với tư cách khách.
        </p>

        <button
          type="button"
          onClick={onQrLogin}
          className="group mt-7 rounded-[30px] border border-[#F97316] bg-white p-5 shadow-[0_0_30px_rgba(249,115,22,.35)] transition hover:scale-[1.02]"
          aria-label="Mô phỏng quét mã QR để đăng nhập"
        >
          <QrCode
            size={176}
            className="text-[#0F172A] transition group-hover:text-[#EA580C]"
            strokeWidth={1.3}
          />
        </button>
        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#CBD5E1]">
          <Smartphone size={17} className="text-[#F97316]" />
          Quét bằng ứng dụng Smart Cart
        </div>
        <button
          type="button"
          onClick={onQrLogin}
          className="mt-3 text-xs font-black text-[#F97316] underline-offset-4 hover:underline"
        >
          Mô phỏng quét QR thành công
        </button>

        <div className="my-5 flex w-full max-w-[330px] items-center gap-3 text-xs font-bold uppercase tracking-[.16em] text-[#CBD5E1]">
          <span className="h-px flex-1 bg-white/20" />
          hoặc
          <span className="h-px flex-1 bg-white/20" />
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
            className="flex h-12 w-full max-w-[330px] items-center justify-center gap-2 rounded-xl border border-[#F97316]/70 bg-white/10 px-5 text-sm font-extrabold text-[#F97316] transition hover:bg-white/15"
          >
            <Phone size={18} /> Đăng nhập bằng SĐT hoặc Mail
          </button>
        ) : authMode === "otp" ? (
          <form
            onSubmit={handleOtpSubmit}
            className="w-full max-w-[330px] rounded-2xl border border-white/15 bg-white/5 p-4"
          >
            <h3 className="text-center text-sm font-black text-[#F97316] mb-2 uppercase tracking-wider">
              Xác nhận Email
            </h3>
            <p className="text-[11px] text-center text-[#CBD5E1] mb-4 leading-relaxed">
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
                className="h-11 w-full text-center tracking-[0.5em] font-mono rounded-xl bg-white pl-3 pr-3 text-lg font-black text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"
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
                className="h-11 flex-1 rounded-xl border border-white/25 text-xs font-black text-white hover:bg-white/10"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="flex h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-[#F97316] text-xs font-black text-[#0F172A] hover:bg-orange-500 transition-colors"
              >
                Xác thực <ArrowRight size={15} />
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handlePhoneSubmit}
            className="w-full max-w-[330px] rounded-2xl border border-white/15 bg-white/5 p-4 space-y-3"
          >
            <div className="mb-1 flex border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setPersonalError("");
                  setShowRegisterLink(false);
                }}
                className={`flex-1 text-center text-xs font-black pb-1 transition ${authMode === "login" ? "border-b-2 border-[#F97316] text-[#F97316]" : "text-[#CBD5E1]"}`}
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
                className={`flex-1 text-center text-xs font-black pb-1 transition ${authMode === "register" ? "border-b-2 border-[#F97316] text-[#F97316]" : "text-[#CBD5E1]"}`}
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
                    className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm font-bold text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"
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
                    className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm font-bold text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"
                  />
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
                    className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm font-bold text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"
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
                    className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm font-bold text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"
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
                    className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm font-bold text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"
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
                    className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm font-bold text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"
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
                    className="h-11 w-full rounded-xl bg-white pl-10 pr-3 text-sm font-bold text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"
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
                    className="mt-1.5 block text-xs font-black text-[#F97316] underline text-left hover:text-white"
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
                className="h-11 flex-1 rounded-xl border border-white/25 text-xs font-black text-white hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-[#F97316] text-xs font-black text-[#0F172A] hover:bg-orange-500 transition-colors"
              >
                {authMode === "login" ? "Đăng nhập" : "Đăng ký"} <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}


        <button
          type="button"
          onClick={continueAsGuest}
          className="mt-3 flex h-11 w-full max-w-[330px] items-center justify-center rounded-xl border border-white/30 bg-white/5 px-5 text-sm font-bold text-white transition hover:bg-white/15"
        >
          Tiếp tục với tư cách khách (Guest)
        </button>


      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-10 py-9 [scrollbar-width:none]">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[.18em] text-[#EA580C]">
            Group Shopping
          </p>
          <h2 className="mt-1 text-4xl font-black text-[#0F172A]">
            Mua sắm theo nhóm
          </h2>
          <p className="mt-2 text-sm font-semibold text-[#64748B]">
            Xe chính tạo mã. Xe 2 và xe 3 nhập mã để dùng chung giỏ hàng và
            shopping list.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
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
            className="rounded-3xl border border-[#F97316] bg-[#0F172A] p-6 text-white shadow-[0_12px_28px_rgba(15,23,42,.18)]"
          >
            <div className="flex items-center gap-3">
              <GoldIcon className="h-12 w-12">
                <Users size={22} />
              </GoldIcon>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#F97316]">
                  Dành cho Cart 01
                </p>
                <h3 className="text-xl font-black">Tạo nhóm trên xe chính</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#CBD5E1]">
              Sau khi tạo nhóm, xe chính sẽ hiển thị mã gồm 6 số để các xe còn
              lại tham gia.
            </p>
            <label className="mt-5 block text-xs font-black uppercase tracking-wider text-[#F97316]">
              Tên thành viên xe chính
            </label>
            <input
              value={hostName}
              onChange={(event) => setHostName(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-bold text-white outline-none focus:border-[#F97316]"
              placeholder="Ví dụ: Ba"
            />
            <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] font-black text-[#0F172A] hover:bg-white">
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
            className="rounded-3xl border border-[#CBD5E1] bg-white p-6 shadow-[0_12px_28px_rgba(17,17,17,.08)]"
          >
            <div className="flex items-center gap-3">
              <GoldIcon className="h-12 w-12">
                <QrCode size={22} />
              </GoldIcon>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#EA580C]">
                  Dành cho Cart 02–03
                </p>
                <h3 className="text-xl font-black text-[#0F172A]">
                  Tham gia mua sắm theo nhóm
                </h3>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <input
                value={joinName}
                onChange={(event) => setJoinName(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-sm font-bold outline-none focus:border-[#F97316]"
                placeholder="Tên thành viên"
              />
              <select
                value={joinCartId}
                onChange={(event) => setJoinCartId(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-sm font-bold outline-none focus:border-[#F97316]"
              >
                <option value="Cart_02 (Xe 2)">Cart_02 (Xe 2)</option>
                <option value="Cart_03 (Xe 3)">Cart_03 (Xe 3)</option>
              </select>
              <input
                value={joinCode}
                onChange={(event) =>
                  setJoinCode(event.target.value.toUpperCase())
                }
                className="h-12 w-full rounded-xl border-2 border-[#F97316] bg-[#FFF7ED] px-3 text-center font-mono text-xl font-black uppercase tracking-[.18em] outline-none"
                placeholder="SC-123456"
                maxLength={9}
              />
            </div>
            <button className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] font-black text-white hover:bg-[#F97316] hover:text-[#0F172A]">
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
              className="flex min-h-[68px] items-center gap-3 rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] px-4"
            >
              <CheckCircle2 size={20} className="shrink-0 text-[#F97316]" />
              <span className="text-xs font-extrabold text-[#0F172A]">
                {index + 1}. {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
