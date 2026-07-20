import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Gift,
  History,
  Sparkles,
  UserRound,
  X,
  Circle,
  CheckCircle2,
} from "lucide-react";
import {
  GoldIcon,
  TopStatusBar,
  MiniCartButton,
  QuickListButton,
} from "../shared";
import type { Screen, ShoppingListItem, PurchaseHistoryOrder } from "../shared";

export function AccountScreen({
  logout,
  authenticated,
  onSignIn,
  navigate,
  cartCount,
  cartTotal,
  toggleListPopup,
  showListPopup,
  manualList,
  toggleCheckItem,
  addNewManualItem,
  memberPoints,
  purchaseHistory,
  memberTier,
  memberName,
}: {
  logout: () => void;
  authenticated: boolean;
  onSignIn: () => void;
  navigate: (screen: Screen) => void;
  cartCount: number;
  cartTotal: number;
  toggleListPopup: () => void;
  showListPopup: boolean;
  manualList: ShoppingListItem[];
  toggleCheckItem: (idx: number) => void;
  addNewManualItem: (name: string) => void;
  memberPoints: number;
  purchaseHistory: PurchaseHistoryOrder[];
  memberTier: "Gold";
  memberName: string;
}) {
  const [notice, setNotice] = useState("");
  const [localInput, setLocalInput] = useState("");
  const platinumTarget = 2000;
  const progress = Math.min(
    100,
    Math.round((memberPoints / platinumTarget) * 100),
  );
  const pointsToPlatinum = Math.max(0, platinumTarget - memberPoints);
  const initials =
    memberName
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "KH";

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <TopStatusBar
        isAbsolute
        onHelp={() =>
          setNotice("Yêu cầu hỗ trợ đã được gửi tới nhân viên gần nhất.")
        }
      />

      <div className="min-h-0 w-full flex-1 overflow-y-auto px-8 pb-8 pt-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="absolute right-7 top-12 z-30 flex items-center gap-2.5">
          <QuickListButton onClick={toggleListPopup} />
          <MiniCartButton
            onClick={() => navigate("cart")}
            count={cartCount}
            total={cartTotal}
          />

          {showListPopup && (
            <div className="absolute right-0 top-14 z-50 w-[310px] rounded-3xl border border-[#15803D] bg-[#FEF9ED] p-5 text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] ">
              <div className="mb-3 flex items-center justify-between border-b border-[#15803D]/30 pb-2">
                <span className="text-base font-black italic tracking-widest text-[#15803D]">
                  shopping list
                </span>
                <button
                  type="button"
                  onClick={toggleListPopup}
                  className="rounded-2xl p-1 hover:bg-[#334155]/5"
                  aria-label="Đóng shopping list"
                >
                  <X size={16} />
                </button>
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const value = localInput.trim();
                  if (!value) return;
                  addNewManualItem(value);
                  setLocalInput("");
                }}
                className="mb-3 flex gap-1.5"
              >
                <input
                  value={localInput}
                  onChange={(event) => setLocalInput(event.target.value)}
                  placeholder="Thêm việc cần mua..."
                  className="h-8 min-w-0 flex-1 rounded-2xl border border-[#E2E8F0] bg-white px-2.5 text-xs font-bold outline-none focus:border-[#15803D]"
                />
                <button
                  type="submit"
                  className="h-8 rounded-2xl bg-[#15803D] shadow-md px-3 text-xs font-black text-white"
                >
                  +
                </button>
              </form>
              <div className="max-h-52 space-y-2 overflow-y-auto [scrollbar-width:none]">
                {manualList.length === 0 && (
                  <p className="py-4 text-center text-xs font-bold text-[#64748B]">
                    Shopping list đang trống.
                  </p>
                )}
                {manualList.map((item, index) => (
                  <button
                    type="button"
                    key={`${item.name}-${index}`}
                    onClick={() => toggleCheckItem(index)}
                    className="flex w-full items-center gap-2.5 border-b border-black/10 pb-1.5 text-left group"
                  >
                    {item.checked ? (
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-[#15803D]"
                      />
                    ) : (
                      <Circle
                        size={18}
                        className="shrink-0 text-[#475569] group-hover:text-[#15803D]"
                      />
                    )}
                    <span
                      className={`min-w-0 flex-1 truncate text-xs font-extrabold ${item.checked ? "text-[#94A3B8] line-through" : "text-[#334155]"}`}
                    >
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[.17em] text-[#15803D]">
              Phiên mua sắm hiện tại
            </p>
            <h1 className="mt-1 text-3xl font-black text-[#334155]">
              Tài khoản
            </h1>
          </div>

          {notice && (
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#15803D] bg-[#F1F5F9] px-4 py-3 text-sm font-bold">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Đóng thông báo"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {authenticated ? (
            <div className="grid grid-cols-[.9fr_1.1fr] gap-6">
              <div className="space-y-5">
                <section className="rounded-3xl border border-[#15803D]/65 bg-[#F5F5E6] p-7 text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
                  <div className="flex items-center gap-5">
                    <GoldIcon className="h-20 w-20 rounded-full">
                      <span className="text-2xl font-black">{initials}</span>
                    </GoldIcon>
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[.16em] text-[#15803D]">
                        Hạng thành viên · {memberTier}
                      </p>
                      <h2 className="mt-2 truncate text-3xl font-black">
                        {memberName}
                      </h2>
                      <p className="mt-1 text-sm text-[#475569]">
                        Mã thành viên · SC-102984
                      </p>
                    </div>
                  </div>
                  <p className="mt-7 border-t border-[#E2E8F0] pt-4 text-sm italic text-[#475569]">
                    Thông tin tài khoản được đồng bộ với ứng dụng Smart Cart.
                  </p>
                </section>

                <section className="rounded-3xl border border-[#15803D]/65 bg-white p-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[.16em] text-[#15803D]">
                        Smart Points
                      </p>
                      <h2 className="mt-1 text-3xl font-black text-[#334155]">
                        {memberPoints.toLocaleString("vi-VN")}{" "}
                        <span className="text-base">điểm</span>
                      </h2>
                    </div>
                    <GoldIcon className="h-12 w-12">
                      <Sparkles size={23} />
                    </GoldIcon>
                  </div>
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm font-bold">
                      <span className="text-[#475569]">Gold</span>
                      <span className="text-[#15803D]">{progress}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#F1F5F9]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#8CB867] to-[#15803D] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-3 flex justify-between text-xs font-extrabold">
                      <span className="text-[#475569]">Silver</span>
                      <span className="text-[#15803D]">Gold</span>
                      <span className="text-[#475569]">Platinum</span>
                    </div>
                    <p className="mt-4 rounded-2xl bg-[#F1F5F9] px-3 py-2 text-sm font-bold text-[#334155]">
                      {pointsToPlatinum > 0 ? (
                        <>
                          Còn{" "}
                          <span className="text-[#15803D]">
                            {pointsToPlatinum.toLocaleString("vi-VN")} điểm
                          </span>{" "}
                          để lên hạng Platinum
                        </>
                      ) : (
                        <span className="text-[#15803D]">
                          Bạn đã đủ điểm lên hạng Platinum.
                        </span>
                      )}
                    </p>
                  </div>
                </section>
              </div>

              <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#15803D]">
                  Dịch vụ trong phiên
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#334155]">
                  Mua sắm của bạn
                </h2>
                <div className="mt-6 space-y-4">
                  <button
                    type="button"
                    onClick={() => navigate("history")}
                    className="flex min-h-[94px] w-full items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-5 text-left transition-colors hover:border-[#15803D] hover:bg-[#F1F5F9]"
                  >
                    <GoldIcon className="h-12 w-12">
                      <History size={22} />
                    </GoldIcon>
                    <span>
                      <span className="block text-lg font-extrabold text-[#334155]">
                        Lịch sử mua sắm
                      </span>
                      <span className="block text-sm text-[#475569]">
                        {purchaseHistory.length} đơn hàng đã hoàn tất
                      </span>
                    </span>
                    <ChevronRight className="ml-auto text-[#15803D]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("offers")}
                    className="flex min-h-[112px] w-full items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-5 text-left transition-colors hover:border-[#15803D] hover:bg-[#F1F5F9]"
                  >
                    <GoldIcon className="h-12 w-12">
                      <Gift size={22} />
                    </GoldIcon>
                    <span>
                      <span className="flex items-center gap-2 text-lg font-extrabold text-[#334155]">
                        Ưu đãi đang áp dụng{" "}
                        <Check className="text-[#15803D]" size={20} />
                      </span>
                      <span className="mt-1 block text-sm font-medium leading-relaxed text-[#15803D]">
                        Xem mã còn hạn và điều kiện phù hợp với giỏ hàng hiện
                        tại.
                      </span>
                    </span>
                    <ChevronRight className="ml-auto text-[#15803D]" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#15803D] bg-[#FEF2F2] text-lg font-black text-[#15803D] transition-colors hover:bg-[#FEE2E2]"
                >
                  <ArrowLeft size={20} />
                  Đăng xuất tài khoản
                </button>
              </section>
            </div>
          ) : (
            <section className="mx-auto max-w-lg rounded-3xl border border-[#15803D]/65 bg-[#F5F5E6] p-8 text-center text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
              <GoldIcon className="mx-auto h-16 w-16 rounded-full">
                <UserRound size={30} />
              </GoldIcon>
              <h2 className="mt-5 text-2xl font-black">Khách mua sắm</h2>
              <p className="mt-2 text-[#475569]">
                Đăng nhập để xem điểm tích lũy, lịch sử đơn hàng và ưu đãi cá
                nhân.
              </p>
              <button
                type="button"
                onClick={onSignIn}
                className="mt-6 rounded-2xl bg-[#15803D] shadow-md px-6 py-3 font-black text-white"
              >
                Đăng nhập
              </button>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}