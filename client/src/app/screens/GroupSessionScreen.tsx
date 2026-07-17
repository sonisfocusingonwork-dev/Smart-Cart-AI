import { useState } from "react";
import {
  ArrowRight,
  QrCode,
  X,
  Circle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { GoldIcon, Back, MiniCartButton, QuickListButton } from "../shared";
import type {
  Screen,
  MemberCart,
  ShoppingListItem,
  GroupRole,
} from "../shared";

export function GroupSessionScreen({
  groupCode,
  groupRole,
  currentCart,
  groupMembers,
  syncStatus,
  back,
  go,
  cartCount,
  cartTotal,
  toggleListPopup,
  showListPopup,
  manualList,
  toggleCheckItem,
  addNewManualItem,
}: {
  groupCode: string;
  groupRole: GroupRole;
  currentCart: MemberCart;
  groupMembers: MemberCart[];
  syncStatus: string;
  back: () => void;
  go: (s: Screen) => void;
  cartCount: number;
  cartTotal: number;
  toggleListPopup: () => void;
  showListPopup: boolean;
  manualList: ShoppingListItem[];
  toggleCheckItem: (idx: number) => void;
  addNewManualItem: (name: string) => void;
}) {
  const [localInput, setLocalInput] = useState("");
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(groupCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="flex h-20 shrink-0 items-center gap-5 border-b border-[#F97316]/55 bg-[#0F172A] px-7 text-white shadow-md">
        <Back onClick={back} dark />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#F97316]">
            Mua sắm theo nhóm
          </p>
          <h1 className="text-2xl font-black">Phiên mua sắm đang đồng bộ</h1>
        </div>
        <div className="relative ml-auto flex items-center gap-3">
          <QuickListButton onClick={toggleListPopup} />
          <MiniCartButton
            onClick={() => go("cart")}
            count={cartCount}
            total={cartTotal}
          />
          {showListPopup && (
            <div className="absolute right-0 top-14 z-50 w-[310px] rounded-3xl border border-[#F97316] bg-[#FEF9ED] p-5 text-[#0F172A] shadow-[0_16px_36px_rgba(17,17,17,.25)] backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between border-b border-[#F97316]/30 pb-2">
                <span className="text-base font-black italic tracking-widest text-[#EA580C]">
                  shopping list chung
                </span>
                <button
                  onClick={toggleListPopup}
                  className="rounded-lg p-1 hover:bg-black/5"
                >
                  <X size={16} />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!localInput.trim()) return;
                  addNewManualItem(localInput.trim());
                  setLocalInput("");
                }}
                className="mb-3 flex gap-1.5"
              >
                <input
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  placeholder="Thêm món cho cả nhóm..."
                  className="h-8 flex-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold outline-none focus:border-[#F97316]"
                />
                <button className="h-8 rounded-lg bg-[#F97316] px-3 text-xs font-black text-white">
                  +
                </button>
              </form>
              <div className="max-h-52 space-y-2 overflow-y-auto [scrollbar-width:none]">
                {manualList.map((m, idx) => (
                  <div
                    key={`${m.name}-${idx}`}
                    onClick={() => toggleCheckItem(idx)}
                    className="flex cursor-pointer items-center gap-2.5 border-b border-black/10 pb-1.5 group"
                  >
                    {m.checked ? (
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-[#F97316]"
                      />
                    ) : (
                      <Circle
                        size={18}
                        className="shrink-0 text-[#CBD5E1] group-hover:text-[#F97316]"
                      />
                    )}
                    <div className="min-w-0">
                      <span
                        className={`block truncate text-xs font-extrabold ${m.checked ? "text-[#94A3B8] line-through" : "text-[#0F172A]"}`}
                      >
                        {m.name}
                      </span>
                      {m.addedBy && (
                        <span className="block truncate text-[10px] font-semibold text-[#64748B]">
                          Thêm bởi {m.addedBy}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto p-8 [scrollbar-width:none]">
        <div className="grid grid-cols-[1.1fr_.9fr] gap-6">
          <section className="rounded-3xl border border-[#F97316] bg-[#0F172A] p-7 text-white shadow-[0_0_28px_rgba(249,115,22,.2)]">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#F97316]">
                  Mã tham gia nhóm
                </p>
                <h2 className="mt-3 font-mono text-5xl font-black tracking-[.16em] text-white">
                  {groupCode || "------"}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#CBD5E1]">
                  Trên một thiết bị khác, nhập mã này tại màn hình đăng nhập
                  nhóm để cùng đi chợ.
                </p>
              </div>
              <GoldIcon className="h-16 w-16">
                <QrCode size={30} />
              </GoldIcon>
            </div>
            <button
              onClick={copyCode}
              className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 font-black text-[#0F172A] hover:bg-white"
            >
              <FileText size={18} />
              {copied ? "Đã sao chép mã" : "Sao chép mã nhóm"}
            </button>
          </section>

          <section className="rounded-3xl border border-[#CBD5E1] bg-white p-7 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#EA580C]">
              Thiết bị hiện tại
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#0F172A]">
              {currentCart.member}
            </h2>
            <p className="mt-1 text-sm font-bold text-[#475569]">
              {currentCart.cartId}
            </p>
            <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-extrabold text-emerald-700">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={18} />{" "}
                {groupRole === "host"
                  ? "Xe chính đang phát mã nhóm"
                  : "Đã tham gia nhóm của xe chính"}
              </span>
              <span className="mt-2 block text-xs font-semibold text-emerald-600">
                {syncStatus}
              </span>
            </div>
          </section>
        </div>

        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#EA580C]">
              Thiết bị trong phiên
            </p>
            <h3 className="mt-1 text-2xl font-black text-[#0F172A]">
              {groupMembers.length}/3 xe đã kết nối
            </h3>
          </div>
          <button
            onClick={() => go("home")}
            className="flex h-12 items-center gap-2 rounded-xl bg-[#F97316] px-5 font-black text-[#0F172A] shadow-md hover:scale-[1.02]"
          >
            Bắt đầu mua sắm <ArrowRight size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {["Cart_01 (Xe chính)", "Cart_02 (Xe 2)", "Cart_03 (Xe 3)"].map(
            (cartId, idx) => {
              const member = groupMembers.find((m) => m.cartId === cartId);
              return (
                <div
                  key={cartId}
                  className={`rounded-2xl border p-5 ${member ? "border-[#F97316] bg-[#FFF7ED]" : "border-dashed border-[#CBD5E1] bg-white"}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl font-black text-white ${member?.tone ?? "bg-[#CBD5E1]"}`}
                    >
                      {member
                        ? member.member.slice(0, 1).toUpperCase()
                        : idx + 1}
                    </span>
                    <div>
                      <b className="block text-sm text-[#0F172A]">
                        {member?.member ?? "Đang chờ tham gia"}
                      </b>
                      <span className="text-xs font-semibold text-[#64748B]">
                        {cartId}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`mt-4 text-xs font-bold ${member ? "text-emerald-600" : "text-[#94A3B8]"}`}
                  >
                    {member
                      ? "● Đang đồng bộ giỏ hàng & shopping list"
                      : "Chưa kết nối"}
                  </p>
                </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}