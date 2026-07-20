import { useState } from "react";
import { MonogramPattern } from "../components/ui/MonogramPattern";
import { ChevronRight, History, Search, Star, X } from "lucide-react";
import {
  formatMoney,
  normalizeLookup,
  GoldIcon,
  Back,
  TopStatusBar,
} from "../shared";
import type { PurchaseHistoryOrder } from "../shared";

function formatPurchaseDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatMonthYear(value: string) {
  const formatted = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function PurchaseHistoryScreen({
  back,
  memberPoints,
  history,
}: {
  back: () => void;
  memberPoints: number;
  history: PurchaseHistoryOrder[];
}) {
  const [query, setQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    history[0]?.id ?? null,
  );
  const [notice, setNotice] = useState("");
  const normalizedQuery = normalizeLookup(query);
  const filteredHistory = history.filter((order) => {
    if (!normalizedQuery) return true;
    return normalizeLookup(
      [
        order.id,
        order.store,
        order.paymentMethod,
        ...order.items.map((item) => item.name),
      ].join(" "),
    ).includes(normalizedQuery);
  });
  const groupedHistory = filteredHistory.reduce<
    Record<string, PurchaseHistoryOrder[]>
  >((groups, order) => {
    const key = formatMonthYear(order.completedAt);
    groups[key] = [...(groups[key] ?? []), order];
    return groups;
  }, {});
  const totalSpent = history.reduce((sum, order) => sum + order.total, 0);
  const totalPointsEarned = history.reduce(
    (sum, order) => sum + order.pointsEarned,
    0,
  );

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAFC]">
      <TopStatusBar
        onHelp={() =>
          setNotice("Yêu cầu hỗ trợ về lịch sử đơn hàng đã được gửi.")
        }
      />
      <header className="flex h-[82px] shrink-0 items-center gap-5 border-b border-[#15803D]/55 bg-[#FFFFFF] px-7 text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] relative overflow-hidden font-black tracking-wide"><MonogramPattern />
        <Back onClick={back} dark />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#15803D]">
            Tài khoản thành viên
          </p>
          <h1 className="text-2xl font-black">Lịch sử mua sắm</h1>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border border-[#E2E8F0] p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#64748B]">
                Đơn đã hoàn tất
              </p>
              <b className="mt-2 block text-3xl text-[#334155]">
                {history.length}
              </b>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border border-[#E2E8F0] p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#64748B]">
                Tổng chi tiêu
              </p>
              <b className="mt-2 block text-3xl text-[#15803D]">
                {formatMoney(totalSpent)}
              </b>
            </div>
            <div className="rounded-2xl border border-[#15803D]/60 bg-[#FFF7ED] p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#15803D]">
                Điểm nhận từ các đơn
              </p>
              <b className="mt-2 block text-3xl text-[#334155]">
                +{totalPointsEarned.toLocaleString("vi-VN")}
              </b>
            </div>
          </div>
          <div className="relative mt-5">
            <Search
              className="absolute left-4 top-3.5 text-[#64748B]"
              size={20}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo mã đơn, cửa hàng hoặc sản phẩm..."
              className="h-12 w-full rounded-2xl border border-[#E2E8F0] bg-white pl-12 pr-4 text-sm font-semibold outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#D3524B]/20"
            />
          </div>
          <div className="mt-6 space-y-7 pb-8">
            {Object.entries(groupedHistory).map(([month, orders]) => (
              <section key={month}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[#15803D]" />
                  <h2 className="text-lg font-black text-[#334155]">{month}</h2>
                  <span className="text-xs font-bold text-[#64748B]">
                    {orders.length} đơn hàng
                  </span>
                </div>
                <div className="space-y-3">
                  {orders.map((order) => {
                    const expanded = expandedOrderId === order.id;
                    const originalTotal = order.items.reduce(
                      (sum, item) => sum + item.price * item.qty,
                      0,
                    );
                    const orderTax =
                      order.tax ??
                      Math.max(
                        0,
                        order.total -
                          Math.max(0, originalTotal - order.discount),
                      );
                    return (
                      <article
                        key={order.id}
                        className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition ${expanded ? "border-[#15803D] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]" : "border-[#E2E8F0] hover:border-[#15803D]/70"}`}
                      >
                        <button
                          onClick={() =>
                            setExpandedOrderId(expanded ? null : order.id)
                          }
                          className="flex w-full items-center gap-5 p-5 text-left"
                        >
                          <GoldIcon className="h-12 w-12">
                            <History size={22} />
                          </GoldIcon>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <b className="text-lg text-[#334155]">
                                {order.id}
                              </b>
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
                                HOÀN TẤT
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-bold text-[#15803D]">
                              {formatPurchaseDate(order.completedAt)}
                            </p>
                            <p className="mt-1 truncate text-xs font-semibold text-[#64748B]">
                              {order.store} · {order.paymentMethod}
                            </p>
                          </div>
                          <div className="text-right">
                            <b className="block text-xl text-[#334155]">
                              {formatMoney(order.total)}
                            </b>
                            <span className="mt-1 block text-xs font-black text-[#15803D]">
                              +{order.pointsEarned} điểm
                            </span>
                          </div>
                          <ChevronRight
                            className={`text-[#15803D] transition-transform ${expanded ? "rotate-90" : ""}`}
                          />
                        </button>
                        {expanded && (
                          <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-5">
                            <div className="grid grid-cols-[1fr_280px] gap-6">
                              <div>
                                <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-[#64748B]">
                                  Sản phẩm trong đơn
                                </p>
                                <div className="space-y-2">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.name}
                                      className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3"
                                    >
                                      <span className="font-bold text-[#334155]">
                                        {item.name}{" "}
                                        <span className="text-[#64748B]">
                                          × {item.qty}
                                        </span>
                                      </span>
                                      <b>
                                        {formatMoney(item.price * item.qty)}
                                      </b>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <aside className="rounded-2xl border border-[#E2E8F0] bg-white p-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-[#64748B]">
                                    Tạm tính
                                  </span>
                                  <b>{formatMoney(originalTotal)}</b>
                                </div>
                                <div className="mt-3 flex justify-between text-sm">
                                  <span className="text-[#64748B]">
                                    Ưu đãi
                                    {order.appliedVoucherCode
                                      ? ` · ${order.appliedVoucherCode}`
                                      : ""}
                                  </span>
                                  <b className="text-[#15803D]">
                                    −{formatMoney(order.discount)}
                                  </b>
                                </div>
                                <div className="mt-3 flex justify-between text-sm">
                                  <span className="text-[#64748B]">Thuế</span>
                                  <b>{formatMoney(orderTax)}</b>
                                </div>
                                <div className="my-4 border-t border-dashed border-[#E2E8F0]" />
                                <div className="flex justify-between">
                                  <span className="font-black">
                                    Đã thanh toán
                                  </span>
                                  <b className="text-xl text-[#15803D]">
                                    {formatMoney(order.total)}
                                  </b>
                                </div>
                                <p className="mt-4 rounded-2xl bg-[#FFF7ED] px-3 py-2 text-xs font-bold text-[#15803D]">
                                  Thời gian hoàn tất:{" "}
                                  {formatPurchaseDate(order.completedAt)}
                                </p>
                              </aside>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
            {filteredHistory.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#E2E8F0] bg-white p-12 text-center">
                <History size={52} className="mx-auto text-[#475569]" />
                <h2 className="mt-4 text-xl font-black">
                  Không tìm thấy đơn hàng
                </h2>
                <p className="mt-2 text-sm text-[#64748B]">
                  Thử tìm bằng mã đơn hoặc tên sản phẩm khác.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}