import { useState, useEffect } from "react";
import { api } from "../api";

import {
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Map,
  Plus,
  ScanLine,
  Search,
  ShoppingCart,
  ShoppingBag,
  Smartphone,
  Star,
  X,
  Circle,
  CheckCircle2,
  Users,
} from "lucide-react";
import {
  formatMoney,
  CATEGORIES,
  GoldIcon,
  SoftIcon,
  TopStatusBar,
} from "../shared";
import type { Screen, MemberCart, Item, ShoppingListItem } from "../shared";

export function HomeScreen({
  cartCount,
  cartTotal,
  add,
  go,
  items,
  update,
  remove,
  onSelectCategory,
  manualList,
  addNewManualItem,
  toggleCheckItem,
  setDuplicateAlert,
  groupCode,
  currentCart,
  groupMembers,
  memberPoints,
}: {
  cartCount: number;
  cartTotal: number;
  add: (item: Omit<Item, "id" | "qty">) => void;
  go: (s: Screen) => void;
  items: Item[];
  update: (id: string, d: number) => void;
  remove: (id: string) => void;
  onSelectCategory: (cat: string) => void;
  manualList: ShoppingListItem[];
  addNewManualItem: (name: string) => void;
  toggleCheckItem: (idx: number) => void;
  setDuplicateAlert: (v: string | null) => void;
  groupCode: string;
  currentCart: MemberCart;
  groupMembers: MemberCart[];
  memberPoints: number;
}) {
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    api.getProducts()
      .then(data => {
        if (data && data.length > 0) setDbProducts(data);
      })
      .catch(err => console.error("Error loading products for home search:", err));
  }, []);

  const visible = dbProducts.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );
  const maxOffset = Math.max(0, visible.length - 3);

  useEffect(() => {
    if (maxOffset === 0) return;
    const timer = setInterval(() => {
      setOffset((prev) => (prev >= maxOffset ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxOffset]);

  const handleProtectedAdd = (p: any) => {
    const existing = items.find(
      (item) => item.name.toLowerCase() === p.name.toLowerCase(),
    );
    if (existing) {
      setDuplicateAlert(
        `Sản phẩm "${p.name}" đã có trong giỏ hàng${existing.addedBy ? `, được thêm bởi ${existing.addedBy}` : ""}.`,
      );
      return;
    }
    add(p);
    setNotice(
      groupCode
        ? `[Đã đồng bộ nhóm ${groupCode}] ${currentCart.member} vừa thêm ${p.name}.`
        : `Đã thêm ${p.name} vào giỏ hàng.`,
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#FFFFFF]">
      <TopStatusBar
        onHelp={() =>
          setNotice("Yêu cầu hỗ trợ đã được gửi tới nhân viên gần nhất.")
        }
      />

      <header className="flex h-[74px] shrink-0 items-center gap-4 border-b border-[#F97316]/55 bg-[#0F172A] px-7 text-white">
        <GoldIcon className="h-11 w-11">
          <ShoppingBag size={22} />
        </GoldIcon>
        <div className="min-w-[170px]">
          <p className="text-lg font-black">
            Xin chào, {currentCart.member || "Khách hàng"}!
          </p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#F97316]/75 bg-white/5 px-2 py-0.5 text-[11px] font-black text-[#F97316]">
            <Star size={12} fill="currentColor" />
            {memberPoints.toLocaleString("vi-VN")} điểm
          </span>
        </div>
        {groupCode && (
          <button
            onClick={() => go("group")}
            className="flex h-12 items-center gap-3 rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-3 text-left hover:bg-emerald-500/20"
          >
            <Users size={20} className="text-emerald-400" />
            <span>
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Nhóm {groupMembers.length}/3 xe
              </span>
              <b className="font-mono text-sm tracking-wider text-white">
                {groupCode} · {currentCart.cartId}
              </b>
            </span>
          </button>
        )}
        <div className="relative mx-auto w-[300px]">
          <Search className="absolute left-4 top-3 text-[#0F172A]" size={20} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOffset(0);
            }}
            placeholder="Tìm món hàng..."
            className="h-11 w-full rounded-xl bg-white pl-11 pr-4 text-sm font-semibold text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"
          />
        </div>
        <button
          onClick={() => go("cart")}
          className="ml-auto flex h-12 items-center gap-2 rounded-xl border border-[#F97316]/70 bg-white/10 px-4 text-sm font-bold hover:bg-white/15"
        >
          <ShoppingCart size={21} />
          <span>
            {cartCount} món -{" "}
            <b className="text-[#F97316]">{formatMoney(cartTotal)}</b>
          </span>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {notice && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-[#F97316] bg-[#F1F5F9] px-4 py-2 text-sm font-bold">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-[1.15fr_.85fr] gap-5">
          <section className="rounded-3xl border border-[#F97316]/55 bg-[#0F172A] p-5 text-white shadow-[0_0_22px_rgba(249,115,22,.12)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#F97316] shadow-[0_0_10px_#F97316]" />
                <b>Máy quét đang sẵn sàng</b>
              </div>
              <GoldIcon className="h-10 w-10">
                <ScanLine size={20} />
              </GoldIcon>
            </div>
            <p className="mt-2 text-sm text-[#CBD5E1]">
              Đưa barcode vào vùng quét để thêm sản phẩm nhanh.
            </p>
            <button
              onClick={() => {
                if (dbProducts.length > 0) handleProtectedAdd(dbProducts[0]);
              }}
              className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-[#F97316]/70 px-4 text-sm font-bold text-[#F97316] hover:bg-white/10"
            >
              <Keyboard size={18} />
              Nhập mã barcode thủ công
            </button>
          </section>

          <section className="flex flex-col rounded-3xl border border-[#F97316]/55 bg-[#FEF9ED] p-5 shadow-[0_12px_26px_rgba(17,17,17,.08)] justify-between">
            <div className="flex items-center justify-between border-b border-[#F97316]/30 pb-2">
              <span className="font-black italic tracking-widest text-sm text-[#EA580C]">
                shopping list
              </span>
              <button
                onClick={() => setNotice("Đã đồng bộ từ điện thoại.")}
                className="flex items-center gap-1 text-[11px] font-black text-[#EA580C] hover:underline"
              >
                <Smartphone size={13} />
                Đồng bộ
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!manualInput.trim()) return;
                addNewManualItem(manualInput.trim());
                setManualInput("");
              }}
              className="my-2 flex gap-1.5"
            >
              <input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ghi thêm món thủ công..."
                className="h-8 flex-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold outline-none focus:border-[#F97316]"
              />
              <button className="h-8 rounded-lg bg-[#F97316] px-3 text-xs font-black text-white">
                +
              </button>
            </form>
            <div className="max-h-24 overflow-y-auto space-y-1.5 [scrollbar-width:none]">
              {manualList.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleCheckItem(idx)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  {m.checked ? (
                    <CheckCircle2
                      size={16}
                      className="text-[#F97316] shrink-0"
                    />
                  ) : (
                    <Circle
                      size={16}
                      className="text-[#CBD5E1] group-hover:text-[#F97316] shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <span
                      className={`block truncate text-xs font-extrabold ${m.checked ? "line-through text-[#94A3B8]" : "text-[#0F172A]"}`}
                    >
                      {m.name}
                    </span>
                    {m.addedBy && (
                      <span className="block truncate text-[9px] font-semibold text-[#64748B]">
                        {m.addedBy}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.17em] text-[#EA580C]">
              Cửa hàng dành cho bạn
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#0F172A]">
              Khám phá danh mục
            </h2>
          </div>
          <button
            onClick={() => go("map")}
            className="flex items-center gap-2 text-sm font-extrabold text-[#EA580C] hover:underline"
          >
            <Map size={18} />
            Xem vị trí trên bản đồ
          </button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-3">
          {CATEGORIES.map(([Icon, label]) => (
            <button
              key={label}
              onClick={() => onSelectCategory(label)}
              className="group flex h-[110px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#CBD5E1] bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#F97316] active:scale-95"
            >
              <SoftIcon className="h-14 w-14 transition-transform group-active:scale-90">
                <Icon size={26} strokeWidth={1.5} />
              </SoftIcon>
              <span className="text-xs font-extrabold text-[#0F172A] truncate w-full px-1">
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.17em] text-[#EA580C]">
              Ưu đãi hôm nay
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#0F172A]">
              Gợi ý hôm nay
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F97316] bg-white disabled:opacity-35 disabled:border-[#CBD5E1] hover:bg-[#F1F5F9] transition"
              disabled={offset === 0}
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => setOffset(Math.min(maxOffset, offset + 1))}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F97316] bg-white disabled:opacity-35 disabled:border-[#CBD5E1] hover:bg-[#F1F5F9] transition"
              disabled={offset >= maxOffset}
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="overflow-hidden mt-3 pb-4">
          <div
            className="flex gap-4 transition-transform duration-500 ease-out w-full"
            style={{
              transform: `translateX(calc(-${offset} * (100% / 3 + 16px / 3)))`,
            }}
          >
            {visible.map((p) => {
              const cartItem = items.find((i) => i.name === p.name);
              return (
                <article
                  key={p.name}
                  className="w-[calc(33.3333%_-_10.66px)] shrink-0 overflow-hidden rounded-3xl border border-[#CBD5E1] bg-white shadow-[0_10px_24px_rgba(17,17,17,.08)] transition hover:border-[#F97316]"
                >
                  <div className={`relative h-20 ${p.tone}`}>
                    <span className="absolute left-3 top-3 rounded-full bg-[#0F172A]/85 px-3 py-1 text-[10px] font-black text-[#F97316]">
                      ƯU ĐÃI
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-extrabold text-[#0F172A] truncate">
                      {p.name}
                    </h3>
                    <div className="mt-1 flex items-end gap-2">
                      {p.oldPrice && (
                        <span className="text-xs text-[#475569] line-through">
                          {formatMoney(p.oldPrice)}
                        </span>
                      )}
                      <b className="text-xl text-[#F97316]">
                        {formatMoney(p.price)}
                      </b>
                    </div>
                    {cartItem ? (
                      <div className="mt-3 flex h-10 w-full items-center justify-between overflow-hidden rounded-xl border border-[#F97316] bg-[#F1F5F9] shadow-[0_0_12px_rgba(249,115,22,.15)] transition-all">
                        <button
                          onClick={() =>
                            cartItem.qty === 1
                              ? remove(cartItem.id)
                              : update(cartItem.id, -1)
                          }
                          className="flex h-full w-12 items-center justify-center text-lg font-black text-[#0F172A] transition-colors hover:bg-[#CBD5E1]/40"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center font-black text-[#F97316]">
                          {cartItem.qty}
                        </span>
                        <button
                          onClick={() => update(cartItem.id, 1)}
                          className="flex h-full w-12 items-center justify-center text-lg font-black text-[#0F172A] transition-colors hover:bg-[#CBD5E1]/40"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleProtectedAdd(p)}
                        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#F97316] bg-white text-sm font-extrabold text-[#0F172A] transition-transform active:scale-95 hover:bg-[#FFF7ED]"
                      >
                        <Plus size={17} className="text-[#F97316]" />
                        Thêm vào giỏ
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}