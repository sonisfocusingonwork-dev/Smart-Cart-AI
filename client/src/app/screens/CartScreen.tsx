import { useState } from "react";
import { MonogramPattern } from "../components/ui/MonogramPattern";
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
  currentCartLabel?: string; // e.g. "Khách hàng · Cart_01 (Xe chính)"
}) {
  const [confirm, setConfirm] = useState(false);
  const [methods, setMethods] = useState(false);
  const [viewMode, setViewMode] = useState<'shared' | 'personal'>('shared');

  const displayItems = viewMode === 'shared' || !groupCode
    ? items
    : items.filter(item => item.addedBy === currentCartLabel);

  const displaySubtotal = displayItems.reduce((acc, it) => acc + (it.price * it.qty), 0);
  const displayTax = displaySubtotal * 0.08;
  const displayTotal = displaySubtotal + displayTax - (checkout.discount || 0);

  const {
    subtotal,
    tax,
    discount,
    total: cartTotal,
    appliedVoucher,
    pointsEarned,
  } = checkout;

  const createOrderId = () => {
    // Generate a unique ID using timestamp and random string
    return `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  };

  const payWith = (paymentMethod: PaymentMethod) => {
    if (items.length === 0) return;
    const nextReceipt: CompletedReceipt = {
      orderId: createOrderId(),
      paidAt: new Date().toISOString(),
      store: "Smart Market · Quận Bình Thạnh",
      paymentMethod,
      items: displayItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      subtotal: displaySubtotal,
      tax: displayTax,
      discount,
      total: displayTotal,
      pointsEarned,
      appliedVoucherCode: appliedVoucher?.code,
    };
    setMethods(false);
    onPaymentSuccess(nextReceipt);
  };



  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#FFFFFF]">
      <header className="flex h-20 items-center gap-5 border-b border-[#15803D]/55 bg-[#FFFFFF] px-7 text-[#334155] relative overflow-hidden font-black tracking-wide"><MonogramPattern />
        <Back onClick={back} dark />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#15803D]">
            {groupCode ? `Đồng bộ nhóm ${groupCode}` : "Mua sắm cá nhân"}
          </p>
          <h1 className="text-2xl font-black">
            {groupCode ? "Giỏ hàng chung của nhóm" : "Giỏ hàng của bạn"}
          </h1>
        </div>
        {groupCode && (
          <span className="ml-auto flex items-center gap-2 rounded-2xl border border-[#15803D]/50 bg-[#15803D]/10 px-4 py-2 text-xs font-black text-emerald-300">
            <Wifi size={16} /> Đang đồng bộ thời gian thực
          </span>
        )}
      </header>

      {groupCode && (
        <div className="flex justify-center border-b border-[#E2E8F0] bg-white px-6 py-3">
          <div className="flex rounded-full bg-[#F1F5F9] p-1">
            <button
              onClick={() => setViewMode('shared')}
              className={`rounded-full px-6 py-2 text-sm font-black transition-colors ${viewMode === 'shared' ? 'bg-[#15803D] text-white shadow-md' : 'text-[#64748B] hover:bg-[#E2E8F0]'}`}
            >
              Hóa đơn chung (Cả nhóm)
            </button>
            <button
              onClick={() => setViewMode('personal')}
              className={`rounded-full px-6 py-2 text-sm font-black transition-colors ${viewMode === 'personal' ? 'bg-[#15803D] text-white shadow-md' : 'text-[#64748B] hover:bg-[#E2E8F0]'}`}
            >
              Hóa đơn riêng (Xe của bạn)
            </button>
          </div>
        </div>
      )}

      <div className="min-h-0 flex flex-1 gap-6 p-6">
        <div className="relative w-[60%] overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-inner">
          <div className="absolute right-0 top-4 h-[88%] w-1 rounded-full bg-[#15803D]/60" />
          <div className="h-full overflow-y-auto p-5 pr-8 [scrollbar-width:none]">
            {displayItems.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-[#64748B]">
                <ShoppingCart size={56} className="mb-3 opacity-40" />
                <b>{viewMode === 'shared' ? 'Giỏ hàng chung đang trống' : 'Giỏ hàng cá nhân đang trống'}</b>
              </div>
            )}
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="mb-4 flex gap-5 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border border-[#E2E8F0] p-4 shadow-sm transition-colors hover:border-[#15803D]/50"
              >
                <div
                  className={`h-24 w-24 shrink-0 rounded-2xl ${item.tone}`}
                />
                <div className="flex flex-1 flex-col">
                  <h3 className="text-lg font-extrabold text-[#334155]">
                    {item.name}
                  </h3>
                  {item.addedBy && (
                    <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[#F1F5F9] px-2 py-1 text-[10px] font-bold text-[#475569]">
                      <Users size={12} /> Được thêm bởi {item.addedBy}
                    </span>
                  )}
                  <b className="mt-1 text-xl text-[#15803D]">
                    {formatMoney(item.price)}
                  </b>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex overflow-hidden rounded-2xl border border-[#E2E8F0]">
                      <button
                        onClick={() => update(item.id, -1)}
                        className="h-10 w-10 transition-colors hover:bg-[#F1F5F9]"
                      >
                        −
                      </button>
                      <span className="flex h-10 w-10 items-center justify-center border-x border-[#E2E8F0] font-black">
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
                      className="flex items-center gap-2 text-sm font-bold text-[#15803D] hover:opacity-75"
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
          <div className="sticky top-0 rounded-3xl border border-[#15803D]/65 bg-white shadow-sm p-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] ">
            <div className="mb-5 flex items-center gap-3">
              <GoldIcon className="h-11 w-11">
                <ShoppingBag size={21} />
              </GoldIcon>
              <h2 className="text-2xl font-black">Hóa đơn mini</h2>
            </div>
            <div className="flex justify-between text-sm font-bold text-[#64748B]">
              <span>Tạm tính {viewMode === 'personal' ? '(Riêng)' : ''}</span>
              <span>{formatMoney(displaySubtotal)}</span>
            </div>
            <div className="mt-3 flex justify-between text-sm font-bold text-[#64748B]">
              <span>Thuế (8%)</span>
              <span>{formatMoney(displayTax)}</span>
            </div>
            {discount > 0 && viewMode === 'shared' && (
              <div className="mt-3 flex justify-between text-sm font-bold text-[#059669]">
                <span>Giảm giá</span>
                <span>-{formatMoney(discount)}</span>
              </div>
            )}
            <hr className="my-4 border-[#E2E8F0]" />
            <div className="flex justify-between text-2xl font-black text-[#15803D]">
              <span>Tổng cộng</span>
              <span>{formatMoney(displayTotal)}</span>
            </div>
          </div>
          <button
            onClick={() => setMethods(true)}
            disabled={displayItems.length === 0}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#15803D] text-lg font-black text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            Thanh toán hóa đơn {viewMode === 'personal' ? 'riêng' : 'chung'} <ArrowRight size={20} />
          </button>
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
              className="flex-1 rounded-2xl border border-[#E2E8F0] py-3 font-bold hover:bg-[#F1F5F9]"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                setConfirm(false);
                setMethods(true);
              }}
              className="flex-1 rounded-2xl bg-[#15803D] py-3 font-black shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
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
          <div className="mt-6 grid grid-cols-2 gap-3">
            {(
              [
                [CreditCard, "Thẻ ngân hàng"],
                [Wallet, "Ví điện tử"],
              ] as const
            ).map(([Icon, label]) => (
              <button
                key={label}
                onClick={() => payWith(label)}
                className="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-[#15803D] bg-white font-bold transition-colors hover:bg-[#FFF7ED]"
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


    </section>
  );
}