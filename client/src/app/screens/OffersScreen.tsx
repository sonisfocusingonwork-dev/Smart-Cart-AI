import { useState } from "react";
import { MonogramPattern } from "../components/ui/MonogramPattern";
import { Gift, Star, X, CheckCircle2 } from "lucide-react";
import {
  MEMBER_VOUCHERS,
  getVoucherStatus,
  getVoucherSaving,
  formatMoney,
  Back,
  TopStatusBar,
} from "../shared";
import type { Item, Voucher } from "../shared";

function voucherStatus(
  voucher: Voucher,
  cartTotal: number,
  items: Item[],
  memberTier: "Gold",
) {
  return getVoucherStatus(voucher, cartTotal, items, memberTier);
}

export function OffersScreen({
  back,
  memberPoints,
  cartTotal,
  items,
  memberTier,
}: {
  back: () => void;
  memberPoints: number;
  cartTotal: number;
  items: Item[];
  memberTier: "Gold";
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const offers = MEMBER_VOUCHERS.map((voucher) => ({
    voucher,
    status: voucherStatus(voucher, cartTotal, items, memberTier),
  }));
  const eligibleOffers = offers.filter(
    (entry) => entry.status.key === "eligible",
  );
  const otherOffers = offers.filter(
    (entry) =>
      entry.status.key !== "eligible" && entry.status.key !== "expired",
  );
  const recommended =
    eligibleOffers
      .filter((entry) => !entry.voucher.stackable)
      .map((entry) => ({
        ...entry,
        saving: getVoucherSaving(entry.voucher, cartTotal, items),
      }))
      .sort((a, b) => b.saving - a.saving)[0] ?? eligibleOffers[0];

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      /* Trình duyệt chặn clipboard */
    }
    setCopiedCode(code);
    window.setTimeout(
      () => setCopiedCode((current) => (current === code ? null : current)),
      1800,
    );
  };

  const renderVoucher = (
    {
      voucher,
      status,
    }: { voucher: Voucher; status: ReturnType<typeof voucherStatus> },
    recommendedId?: string,
  ) => {
    const isRecommended = voucher.id === recommendedId;
    const statusStyle =
      status.key === "eligible"
        ? "border-[#15803D] bg-emerald-50 text-emerald-700"
        : status.key === "upcoming"
          ? "border-sky-400 bg-sky-50 text-sky-700"
          : "border-amber-400 bg-amber-50 text-amber-700";
    return (
      <article
        key={voucher.id}
        className={`relative overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] ${isRecommended ? "border-[#15803D] ring-2 ring-[#D3524B]/15" : "border-[#E2E8F0]"}`}
      >
        {isRecommended && (
          <span className="absolute right-0 top-0 rounded-bl-2xl bg-[#15803D] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white">
            Được đề xuất
          </span>
        )}
        <div className="flex h-full">
          <div className="flex w-[160px] shrink-0 flex-col items-center justify-center bg-[#F5F5E6] p-5 text-center text-[#334155]">
            <Gift size={30} className="text-[#15803D]" />
            <b className="mt-3 break-all font-mono text-lg tracking-wider text-[#15803D]">
              {voucher.code}
            </b>
            <button
              onClick={() => copyCode(voucher.code)}
              className="mt-3 rounded-2xl border border-[#15803D]/70 px-3 py-1.5 text-[10px] font-black hover:bg-[#15803D] hover:text-white"
            >
              {copiedCode === voucher.code ? "Đã sao chép" : "Sao chép mã"}
            </button>
          </div>
          <div className="min-w-0 flex-1 p-5">
            <div className="flex items-start gap-3 pr-20">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#15803D]">
                  {voucher.campaign}
                </p>
                <h3 className="mt-1 text-lg font-black text-[#334155]">
                  {voucher.title}
                </h3>
                <p className="mt-1 text-base font-black text-[#15803D]">
                  {voucher.benefit}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
              {voucher.description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="rounded-2xl bg-[#F8FAFC] px-3 py-2">
                <span className="block text-[#64748B]">Hiệu lực</span>
                <span>
                  {new Date(voucher.validFrom).toLocaleDateString("vi-VN")} –{" "}
                  {new Date(voucher.expiresAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] px-3 py-2">
                <span className="block text-[#64748B]">Giới hạn sử dụng</span>
                <span>{voucher.usageLimit}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-black ${statusStyle}`}
              >
                {status.label}
              </span>
              <span className="text-right text-xs font-bold text-[#64748B]">
                {status.reason}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAFC]">
      <TopStatusBar
        onHelp={() => setNotice("Yêu cầu hỗ trợ về mã ưu đãi đã được gửi.")}
      />
      <header className="flex h-[82px] shrink-0 items-center gap-5 border-b border-[#15803D]/55 bg-[#FFFFFF] px-7 text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] relative overflow-hidden font-black tracking-wide"><MonogramPattern />
        <Back onClick={back} dark />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#15803D]">
            Quyền lợi thành viên
          </p>
          <h1 className="text-2xl font-black">Ưu đãi đang áp dụng</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-2xl border border-[#15803D]/60 bg-white px-4 py-2 text-sm font-black">
          <Star size={17} className="text-[#15803D]" fill="currentColor" />
          {memberPoints.toLocaleString("vi-VN")} điểm
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto max-w-6xl">
          {notice && (
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#15803D] bg-white px-4 py-3 text-sm font-bold">
              <span>{notice}</span>
              <button onClick={() => setNotice("")}>
                <X size={17} />
              </button>
            </div>
          )}
          <div className="grid grid-cols-[1.1fr_.9fr] gap-5">
            <section className="rounded-3xl border border-[#15803D] bg-[#F5F5E6] p-6 text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#15803D]">
                Phân tích giỏ hiện tại
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {recommended
                  ? `Mã phù hợp nhất: ${recommended.voucher.code}`
                  : "Chưa có mã giảm tiền đủ điều kiện"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">
                Hệ thống chỉ chọn một mã giảm tiền tốt nhất. Ưu đãi cộng điểm
                như DIEMX2 có thể được áp dụng kèm nếu còn hiệu lực.
              </p>
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3">
                <span className="text-sm font-bold text-[#475569]">
                  Giá trị giỏ hàng
                </span>
                <b className="text-xl text-[#15803D]">
                  {formatMoney(cartTotal)}
                </b>
              </div>
            </section>
            <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[.16em] text-[#15803D]">
                Quy tắc áp dụng
              </p>
              <div className="mt-4 space-y-3 text-sm font-semibold text-[#475569]">
                <p className="flex gap-2">
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-[#15803D]"
                  />
                  Mỗi hóa đơn dùng tối đa một mã giảm tiền.
                </p>
                <p className="flex gap-2">
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-[#15803D]"
                  />
                  Mã hạng Gold chỉ dùng khi tài khoản vẫn ở hạng Gold.
                </p>
                <p className="flex gap-2">
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-[#15803D]"
                  />
                  Mọi mã đều có ngày bắt đầu, ngày hết hạn và điều kiện rõ ràng.
                </p>
              </div>
            </section>
          </div>
          <section className="mt-7">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#15803D]">
                  Đủ điều kiện
                </p>
                <h2 className="text-2xl font-black">Mã có thể dùng ngay</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                {eligibleOffers.length} mã
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {eligibleOffers.map((entry) =>
                renderVoucher(entry, recommended?.voucher.id),
              )}
            </div>
            {eligibleOffers.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-sm font-bold text-[#64748B]">
                Chưa có mã đủ điều kiện với giỏ hàng hiện tại.
              </div>
            )}
          </section>
          <section className="mt-8 pb-8">
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-[.16em] text-amber-600">
                Cần thêm điều kiện hoặc sắp diễn ra
              </p>
              <h2 className="text-2xl font-black">
                Các ưu đãi khác của tài khoản
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {otherOffers.map((entry) => renderVoucher(entry))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

// --- MAIN APP ---