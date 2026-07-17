import { useState } from "react";
import {
  ArrowRight,
  CreditCard,
  Phone,
  ShoppingCart,
  ShoppingBag,
  Trash2,
  Wallet,
  Wifi,
  X,
  CheckCircle2,
  FileText,
  Users,
  AlertTriangle,
  Banknote,
  Printer,
  Mail,
  RotateCcw,
  Send,
} from "lucide-react";
import { formatMoney, GoldIcon, Back, Modal } from "../shared";
import type {
  Screen,
  Item,
  PaymentMethod,
  CompletedReceipt,
  CheckoutSummary,
} from "../shared";

export function CartScreen({
  items,
  update,
  remove,
  go,
  back,
  checkout,
  groupCode,
  onPaymentSuccess,
}: {
  items: Item[];
  update: (id: string, delta: number) => void;
  remove: (id: string) => void;
  go: (screen: Screen) => void;
  back: () => void;
  checkout: CheckoutSummary;
  groupCode: string;
  onPaymentSuccess: (receipt: CompletedReceipt) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [methods, setMethods] = useState(false);
  const [receipt, setReceipt] = useState<CompletedReceipt | null>(null);
  const [sendPanel, setSendPanel] = useState(false);
  const [sendChannel, setSendChannel] = useState<"email" | "phone">("email");
  const [sendTarget, setSendTarget] = useState("");
  const [receiptNotice, setReceiptNotice] = useState("");
  const [returnPanel, setReturnPanel] = useState(false);
  const [returnCause, setReturnCause] = useState(
    "Khách hàng chọn nhầm sản phẩm",
  );
  const [returnDetail, setReturnDetail] = useState("");
  const {
    subtotal,
    tax,
    discount,
    total: cartTotal,
    appliedVoucher,
    pointsEarned,
  } = checkout;

  const createOrderId = () => {
    const now = new Date();
    const datePart = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    return `SC-${datePart}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const payWith = (paymentMethod: PaymentMethod) => {
    if (receipt || items.length === 0) return;
    const nextReceipt: CompletedReceipt = {
      orderId: createOrderId(),
      paidAt: new Date().toISOString(),
      store: "Smart Market · Quận Bình Thạnh",
      paymentMethod,
      items: items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      subtotal,
      tax,
      discount,
      total: cartTotal,
      pointsEarned,
      appliedVoucherCode: appliedVoucher?.code,
    };
    setMethods(false);
    setReceipt(nextReceipt);
    onPaymentSuccess(nextReceipt);
  };

  const printReceipt = () => {
    if (!receipt || typeof window === "undefined") return;
    const printWindow = window.open("", "_blank", "width=760,height=900");
    if (!printWindow) {
      setReceiptNotice(
        "Trình duyệt đang chặn cửa sổ in. Hãy cho phép pop-up và thử lại.",
      );
      return;
    }
    const rows = receipt.items
      .map(
        (item) =>
          `<tr><td style="padding:8px 0">${item.name}</td><td style="text-align:center">${item.qty}</td><td style="text-align:right">${formatMoney(item.price * item.qty)}</td></tr>`,
      )
      .join("");
    printWindow.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Hóa đơn ${receipt.orderId}</title><style>body{font-family:Arial,sans-serif;color:#0f172a;max-width:680px;margin:30px auto;padding:24px}h1{text-align:center}.success{text-align:center;color:#15803d;font-weight:800}.meta{line-height:1.7}table{width:100%;border-collapse:collapse;border-top:1px dashed #94a3b8;border-bottom:1px dashed #94a3b8;margin:20px 0}.total{display:flex;justify-content:space-between;font-size:22px;font-weight:800}.muted{color:#64748b}</style></head><body><p class="success">✓ THANH TOÁN THÀNH CÔNG</p><h1>HÓA ĐƠN SMART CART</h1><div class="meta"><b>Mã hóa đơn:</b> ${receipt.orderId}<br><b>Thời gian:</b> ${new Date(receipt.paidAt).toLocaleString("vi-VN")}<br><b>Phương thức:</b> ${receipt.paymentMethod}<br><b>Cửa hàng:</b> ${receipt.store}</div><table><thead><tr><th style="text-align:left;padding:8px 0">Sản phẩm</th><th>SL</th><th style="text-align:right">Thành tiền</th></tr></thead><tbody>${rows}</tbody></table><p>Tạm tính: <b>${formatMoney(receipt.subtotal)}</b></p><p>Thuế: <b>${formatMoney(receipt.tax)}</b></p><p>Giảm giá: <b>-${formatMoney(receipt.discount)}</b>${receipt.appliedVoucherCode ? ` (${receipt.appliedVoucherCode})` : ""}</p><div class="total"><span>Tổng thanh toán</span><span>${formatMoney(receipt.total)}</span></div><p class="muted">Điểm tích lũy: +${receipt.pointsEarned} Smart Points</p><p style="text-align:center;margin-top:40px">Cảm ơn bạn đã mua sắm tại Smart Market.</p></body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const sendReceipt = () => {
    const value = sendTarget.trim();
    const valid =
      sendChannel === "email"
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        : /^(\+?84|0)\d{9}$/.test(value.replace(/[\s.-]/g, ""));
    if (!valid) {
      setReceiptNotice(
        sendChannel === "email"
          ? "Email chưa đúng định dạng."
          : "Số điện thoại chưa đúng định dạng Việt Nam.",
      );
      return;
    }
    setReceiptNotice(
      `Đã gửi hóa đơn ${receipt?.orderId ?? ""} qua ${sendChannel === "email" ? "email" : "số điện thoại"} ${value}.`,
    );
    setSendPanel(false);
    setSendTarget("");
  };

  const submitReturn = () => {
    if (!returnDetail.trim()) {
      setReceiptNotice("Vui lòng mô tả sản phẩm hoặc sai sót cần đổi trả.");
      return;
    }
    const ticket = `RT-${Math.floor(100000 + Math.random() * 900000)}`;
    setReceiptNotice(
      `Đã tạo yêu cầu đổi trả ${ticket} cho hóa đơn ${receipt?.orderId}. Nhân viên sẽ kiểm tra nguyên nhân “${returnCause}”.`,
    );
    setReturnPanel(false);
    setReturnDetail("");
  };

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#FFFFFF]">
      <header className="flex h-20 items-center gap-5 border-b border-[#F97316]/55 bg-[#0F172A] px-7 text-white">
        <Back onClick={back} dark />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#F97316]">
            {groupCode ? `Đồng bộ nhóm ${groupCode}` : "Mua sắm cá nhân"}
          </p>
          <h1 className="text-2xl font-black">
            {groupCode ? "Giỏ hàng chung của nhóm" : "Giỏ hàng của bạn"}
          </h1>
        </div>
        {groupCode && (
          <span className="ml-auto flex items-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/10 px-4 py-2 text-xs font-black text-emerald-300">
            <Wifi size={16} /> Đang đồng bộ thời gian thực
          </span>
        )}
      </header>
      <div className="min-h-0 flex flex-1 gap-6 p-6">
        <div className="relative w-[60%] overflow-hidden rounded-3xl border border-[#CBD5E1] bg-white shadow-inner">
          <div className="absolute right-0 top-4 h-[88%] w-1 rounded-full bg-[#F97316]/60" />
          <div className="h-full overflow-y-auto p-5 pr-8 [scrollbar-width:none]">
            {items.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-[#64748B]">
                <ShoppingCart size={56} className="mb-3 opacity-40" />
                <b>Giỏ hàng đang trống</b>
              </div>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="mb-4 flex gap-5 rounded-2xl border border-[#CBD5E1] bg-white p-4 shadow-sm transition-colors hover:border-[#F97316]/50"
              >
                <div
                  className={`h-24 w-24 shrink-0 rounded-2xl ${item.tone}`}
                />
                <div className="flex flex-1 flex-col">
                  <h3 className="text-lg font-extrabold text-[#0F172A]">
                    {item.name}
                  </h3>
                  {item.addedBy && (
                    <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-1 text-[10px] font-bold text-[#475569]">
                      <Users size={12} /> Được thêm bởi {item.addedBy}
                    </span>
                  )}
                  <b className="mt-1 text-xl text-[#F97316]">
                    {formatMoney(item.price)}
                  </b>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex overflow-hidden rounded-xl border border-[#CBD5E1]">
                      <button
                        onClick={() => update(item.id, -1)}
                        className="h-10 w-10 transition-colors hover:bg-[#F1F5F9]"
                      >
                        −
                      </button>
                      <span className="flex h-10 w-10 items-center justify-center border-x border-[#CBD5E1] font-black">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => update(item.id, 1)}
                        className="h-10 w-10 transition-colors hover:bg-[#F1F5F9]"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="flex items-center gap-2 text-sm font-bold text-[#DC2626] hover:opacity-75"
                    >
                      <Trash2 size={17} /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="w-[40%]">
          <div className="sticky top-0 rounded-3xl border border-[#F97316]/65 bg-white/88 p-6 shadow-[0_16px_32px_rgba(17,17,17,.12)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <GoldIcon className="h-11 w-11">
                <ShoppingBag size={21} />
              </GoldIcon>
              <h2 className="text-2xl font-black">Hóa đơn mini</h2>
            </div>
            {[
              ["Tạm tính", subtotal],
              ["Thuế", tax],
              ["Giảm giá", -discount],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="mb-3 flex justify-between text-base"
              >
                <span className="text-[#475569]">{label}</span>
                <b>{formatMoney(Number(value))}</b>
              </div>
            ))}
            {appliedVoucher && (
              <div className="mb-3 flex justify-between text-xs font-bold text-emerald-700">
                <span>Mã áp dụng</span>
                <b>{appliedVoucher.code}</b>
              </div>
            )}
            <div className="my-5 border-t border-dashed border-[#CBD5E1]" />
            <div className="flex items-end justify-between">
              <span className="text-lg font-black">Tổng cộng</span>
              <b className="text-3xl text-[#EA580C]">
                {formatMoney(cartTotal)}
              </b>
            </div>
            <button
              onClick={() => setConfirm(true)}
              disabled={items.length === 0}
              className="mt-7 flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-[#F97316] bg-[#F97316] text-xl font-black text-[#0F172A] shadow-[0_0_20px_rgba(249,115,22,.35)] transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Thanh toán <ArrowRight />
            </button>
          </div>
        </aside>
      </div>
      {confirm && (
        <Modal>
          <h2>Xác nhận thanh toán giỏ hàng này?</h2>
          <p className="mt-2 text-base font-semibold text-[#475569]">
            Đơn hàng sẽ được chuyển tới bước chọn phương thức thanh toán.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 rounded-xl border border-[#CBD5E1] py-3 font-bold hover:bg-[#F1F5F9]"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                setConfirm(false);
                setMethods(true);
              }}
              className="flex-1 rounded-xl bg-[#F97316] py-3 font-black shadow-md"
            >
              Đồng ý
            </button>
          </div>
        </Modal>
      )}
      {methods && (
        <Modal>
          <h2>Chọn phương thức thanh toán</h2>
          <p className="mt-2 text-sm font-semibold text-[#64748B]">
            Sau khi hoàn tất, hệ thống sẽ phát hành hóa đơn điện tử.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {(
              [
                [Banknote, "Tiền mặt"],
                [CreditCard, "Thẻ ngân hàng"],
                [Wallet, "Ví điện tử"],
              ] as const
            ).map(([Icon, label]) => (
              <button
                key={label}
                onClick={() => payWith(label)}
                className="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-[#F97316] bg-white font-bold transition-colors hover:bg-[#FFF7ED]"
              >
                <GoldIcon className="h-12 w-12">
                  <Icon size={22} />
                </GoldIcon>
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMethods(false)}
            className="mt-5 w-full text-sm font-bold text-[#475569]"
          >
            Quay lại
          </button>
        </Modal>
      )}

      {receipt && (
        <div className="absolute inset-0 z-[120] overflow-y-auto bg-[#F8FAFC] p-6 [scrollbar-width:none]">
          <div className="mx-auto max-w-5xl">
            <div className="mb-5 flex items-center justify-center gap-3 rounded-3xl border border-emerald-300 bg-emerald-50 px-6 py-5 text-emerald-800 shadow-sm">
              <CheckCircle2 size={34} />
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em]">
                  Thanh toán thành công
                </p>
                <h1 className="text-2xl font-black">
                  Đơn hàng đã được ghi nhận và phát hành hóa đơn
                </h1>
              </div>
            </div>
            {receiptNotice && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-[#F97316] bg-white px-4 py-3 text-sm font-bold">
                <span>{receiptNotice}</span>
                <button type="button" onClick={() => setReceiptNotice("")}>
                  <X size={17} />
                </button>
              </div>
            )}
            <div className="grid grid-cols-[1fr_340px] gap-5">
              <section className="rounded-3xl border border-[#CBD5E1] bg-white p-7 shadow-[0_12px_30px_rgba(15,23,42,.08)]">
                <div className="flex items-start justify-between border-b border-dashed border-[#CBD5E1] pb-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.18em] text-[#EA580C]">
                      Hóa đơn điện tử
                    </p>
                    <h2 className="mt-1 text-3xl font-black">
                      SMART CART RECEIPT
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-[#64748B]">
                      {receipt.store}
                    </p>
                  </div>
                  <GoldIcon className="h-14 w-14">
                    <FileText size={25} />
                  </GoldIcon>
                </div>
                <div className="grid grid-cols-2 gap-3 py-5 text-sm">
                  <div className="rounded-xl bg-[#F8FAFC] p-3">
                    <span className="block text-xs font-bold text-[#64748B]">
                      Mã hóa đơn
                    </span>
                    <b>{receipt.orderId}</b>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] p-3">
                    <span className="block text-xs font-bold text-[#64748B]">
                      Thời gian
                    </span>
                    <b>{new Date(receipt.paidAt).toLocaleString("vi-VN")}</b>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] p-3">
                    <span className="block text-xs font-bold text-[#64748B]">
                      Phương thức
                    </span>
                    <b>{receipt.paymentMethod}</b>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFC] p-3">
                    <span className="block text-xs font-bold text-[#64748B]">
                      Smart Points
                    </span>
                    <b className="text-[#EA580C]">
                      +{receipt.pointsEarned} điểm
                    </b>
                  </div>
                </div>
                {receipt.appliedVoucherCode && (
                  <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    Đã áp dụng mã {receipt.appliedVoucherCode} và giảm{" "}
                    {formatMoney(receipt.discount)}.
                  </div>
                )}
                <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]">
                  <div className="grid grid-cols-[1fr_70px_140px] bg-[#0F172A] px-4 py-3 text-xs font-black uppercase tracking-[.12em] text-white">
                    <span>Sản phẩm</span>
                    <span className="text-center">SL</span>
                    <span className="text-right">Thành tiền</span>
                  </div>
                  {receipt.items.map((item) => (
                    <div
                      key={item.name}
                      className="grid grid-cols-[1fr_70px_140px] border-t border-[#E2E8F0] px-4 py-3 text-sm font-semibold"
                    >
                      <span>{item.name}</span>
                      <span className="text-center">{item.qty}</span>
                      <b className="text-right">
                        {formatMoney(item.price * item.qty)}
                      </b>
                    </div>
                  ))}
                </div>
                <div className="ml-auto mt-5 w-full max-w-sm space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Tạm tính</span>
                    <b>{formatMoney(receipt.subtotal)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Thuế</span>
                    <b>{formatMoney(receipt.tax)}</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Giảm giá</span>
                    <b>-{formatMoney(receipt.discount)}</b>
                  </div>
                  <div className="mt-3 flex items-end justify-between border-t border-dashed border-[#CBD5E1] pt-4">
                    <span className="text-lg font-black">Tổng thanh toán</span>
                    <b className="text-3xl text-[#EA580C]">
                      {formatMoney(receipt.total)}
                    </b>
                  </div>
                </div>
              </section>
              <aside className="space-y-4">
                <section className="rounded-3xl border border-[#F97316]/60 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-[#EA580C]">
                    Tiện ích hóa đơn
                  </p>
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => setReturnPanel(true)}
                      className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#CBD5E1] px-4 font-black hover:border-[#F97316] hover:bg-[#FFF7ED]"
                    >
                      <RotateCcw size={19} className="text-[#EA580C]" />
                      Hỗ trợ đổi trả hàng
                    </button>
                    <button
                      type="button"
                      onClick={printReceipt}
                      className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#CBD5E1] px-4 font-black hover:border-[#F97316] hover:bg-[#FFF7ED]"
                    >
                      <Printer size={19} className="text-[#EA580C]" />
                      In hóa đơn
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendPanel(true)}
                      className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#CBD5E1] px-4 font-black hover:border-[#F97316] hover:bg-[#FFF7ED]"
                    >
                      <Mail size={19} className="text-[#EA580C]" />
                      Gửi hóa đơn
                    </button>
                  </div>
                </section>
                <section className="rounded-3xl border border-[#CBD5E1] bg-[#0F172A] p-5 text-white">
                  <p className="text-sm font-black">Lưu ý đổi trả</p>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-[#CBD5E1]">
                    Giữ sản phẩm và hóa đơn. Cửa hàng sẽ xác minh nguyên nhân,
                    tình trạng hàng và điều kiện chính sách trước khi đổi hoặc
                    hoàn tiền.
                  </p>
                </section>
                <button
                  type="button"
                  onClick={() => go("home")}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#F97316] text-lg font-black shadow-md"
                >
                  Hoàn tất mua sắm <ArrowRight size={20} />
                </button>
              </aside>
            </div>
          </div>

          {sendPanel && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-[#F97316] bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black">Gửi hóa đơn</h3>
                  <button type="button" onClick={() => setSendPanel(false)}>
                    <X />
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSendChannel("email");
                      setSendTarget("");
                    }}
                    className={`rounded-xl border px-3 py-3 text-sm font-black ${sendChannel === "email" ? "border-[#F97316] bg-[#FFF7ED]" : "border-[#CBD5E1]"}`}
                  >
                    <Mail size={18} className="mx-auto mb-1" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSendChannel("phone");
                      setSendTarget("");
                    }}
                    className={`rounded-xl border px-3 py-3 text-sm font-black ${sendChannel === "phone" ? "border-[#F97316] bg-[#FFF7ED]" : "border-[#CBD5E1]"}`}
                  >
                    <Phone size={18} className="mx-auto mb-1" />
                    Số điện thoại
                  </button>
                </div>
                <input
                  value={sendTarget}
                  onChange={(event) => setSendTarget(event.target.value)}
                  placeholder={
                    sendChannel === "email" ? "ten@email.com" : "0901234567"
                  }
                  className="mt-4 h-12 w-full rounded-xl border border-[#CBD5E1] px-3 font-semibold outline-none focus:border-[#F97316]"
                />
                <button
                  type="button"
                  onClick={sendReceipt}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] font-black"
                >
                  <Send size={18} />
                  Gửi hóa đơn
                </button>
              </div>
            </div>
          )}

          {returnPanel && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-3xl border border-[#F97316] bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-[#EA580C]">
                      Hóa đơn {receipt.orderId}
                    </p>
                    <h3 className="text-xl font-black">Hỗ trợ đổi trả hàng</h3>
                  </div>
                  <button type="button" onClick={() => setReturnPanel(false)}>
                    <X />
                  </button>
                </div>
                <label className="mt-5 block text-xs font-black">
                  Nguyên nhân
                </label>
                <select
                  value={returnCause}
                  onChange={(event) => setReturnCause(event.target.value)}
                  className="mt-1 h-12 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 font-semibold"
                >
                  <option>Khách hàng chọn nhầm sản phẩm</option>
                  <option>Khách hàng muốn đổi sản phẩm khác</option>
                  <option>Cửa hàng giao sai hoặc thiếu sản phẩm</option>
                  <option>Sản phẩm lỗi, hư hỏng hoặc sai chất lượng</option>
                </select>
                <label className="mt-4 block text-xs font-black">
                  Sản phẩm và tình trạng cần hỗ trợ
                </label>
                <textarea
                  value={returnDetail}
                  onChange={(event) => setReturnDetail(event.target.value)}
                  placeholder="Ví dụ: Sữa Vinamilk bị móp hộp, cần đổi sản phẩm mới..."
                  className="mt-1 min-h-28 w-full resize-none rounded-xl border border-[#CBD5E1] p-3 font-semibold outline-none focus:border-[#F97316]"
                />
                <div className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800">
                  <AlertTriangle size={17} className="shrink-0" />
                  Yêu cầu sẽ được nhân viên xác minh trước khi chấp nhận đổi
                  hoặc hoàn tiền.
                </div>
                <button
                  type="button"
                  onClick={submitReturn}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] font-black"
                >
                  <RotateCcw size={18} />
                  Gửi yêu cầu đổi trả
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}