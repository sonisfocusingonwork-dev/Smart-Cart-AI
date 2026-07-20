import { useState, useEffect } from "react";
import { MonogramPattern } from "../components/ui/MonogramPattern";
import { ClayCartLogo } from "../components/ui/ClayCartLogo";
import { BarcodeCameraScanner } from "../components/ui/BarcodeCameraScanner";
import { api } from "../api";
import { STORE_LOCATIONS, USER_MAP_POINT } from "../shared";

import {
  ChevronDown,
  Trash2,
  Navigation,
  BarChart3,
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
  Sparkles,
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

const ProductCarousel = ({
  visible,
  items,
  update,
  remove,
  handleProtectedAdd,
}: {
  visible: any[];
  items: Item[];
  update: (id: string, d: number) => void;
  remove: (id: string) => void;
  handleProtectedAdd: (p: any) => void;
}) => {
  const [offset, setOffset] = useState(0);
  const maxOffset = Math.max(0, visible.length - 3);

  useEffect(() => {
    if (maxOffset === 0) return;
    const timer = setInterval(() => {
      setOffset((prev) => (prev >= maxOffset ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxOffset]);

  // Reset offset if visible items change dramatically
  useEffect(() => {
    if (offset > maxOffset) setOffset(0);
  }, [maxOffset, offset]);

  return (
    <>
      <div className="mt-7 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.17em] text-[#15803D]">
            Ưu đãi hôm nay
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#334155]">
            Gợi ý hôm nay
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#15803D] bg-white disabled:opacity-35 disabled:border-[#E2E8F0] hover:bg-[#F1F5F9] transition"
            disabled={offset === 0}
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => setOffset(Math.min(maxOffset, offset + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#15803D] bg-white disabled:opacity-35 disabled:border-[#E2E8F0] hover:bg-[#F1F5F9] transition"
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
                className="w-[calc(33.3333%_-_10.66px)] shrink-0 overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition hover:border-[#15803D]"
              >
                <div className={`relative h-20 ${p.tone}`}>
                  <span className="absolute left-3 top-3 rounded-full bg-[#F5F5E6] px-3 py-1 text-[10px] font-black text-[#15803D]">
                    ƯU ĐÃI
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold text-[#334155] truncate">
                    {p.name}
                  </h3>
                  <div className="mt-1 flex items-end gap-2">
                    {p.oldPrice && (
                      <span className="text-xs text-[#475569] line-through">
                        {formatMoney(p.oldPrice)}
                      </span>
                    )}
                    <b className="text-xl text-[#15803D]">
                      {formatMoney(p.price)}
                    </b>
                  </div>
                  {cartItem ? (
                    <div className="mt-3 flex h-10 w-full items-center justify-between overflow-hidden rounded-2xl border border-[#15803D] bg-[#F1F5F9] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-all">
                      <button
                        onClick={() =>
                          cartItem.qty === 1
                            ? remove(cartItem.id)
                            : update(cartItem.id, -1)
                        }
                        className="flex h-full w-12 items-center justify-center text-lg font-black text-[#334155] transition-colors hover:bg-[#CBD5E1]/40"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center font-black text-[#15803D]">
                        {cartItem.qty}
                      </span>
                      <button
                        onClick={() => update(cartItem.id, 1)}
                        className="flex h-full w-12 items-center justify-center text-lg font-black text-[#334155] transition-colors hover:bg-[#CBD5E1]/40"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleProtectedAdd(p)}
                      className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-[#15803D] bg-white text-sm font-extrabold text-[#334155] transition-transform active:scale-95 hover:bg-[#FFF7ED]"
                    >
                      <Plus size={17} className="text-[#15803D]" />
                      Thêm vào giỏ
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
};

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
  deleteManualItem,
  setPendingNavTarget,
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
  deleteManualItem: (idx: number) => void;
  setPendingNavTarget: (target: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [typedBarcode, setTypedBarcode] = useState("");
  const [showAllList, setShowAllList] = useState(false);
  const [showCheckedItems, setShowCheckedItems] = useState(true);
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

  const getDistance = (p1: any, p2: any) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  const processedManualList = manualList.map((item, index) => {
    const normalizedName = item.name.toLowerCase();
    const loc = STORE_LOCATIONS.find(l => normalizedName.includes(l.name.toLowerCase()) || l.name.toLowerCase().includes(normalizedName));
    let distance = Infinity;
    if (loc) {
      distance = getDistance(USER_MAP_POINT, loc.point);
    }
    return { ...item, originalIndex: index, loc, distance };
  });

  const uncheckedItems = processedManualList.filter(i => !i.checked).sort((a, b) => a.distance - b.distance);
  const checkedItems = processedManualList.filter(i => i.checked);
  const boughtCount = checkedItems.length;
  const totalCount = manualList.length;
  const progress = totalCount === 0 ? 0 : (boughtCount / totalCount) * 100;
  const visibleUnchecked = showAllList ? uncheckedItems : uncheckedItems.slice(0, 4);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#FFFFFF]">
      {isBarcodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[360px] overflow-hidden rounded-3xl bg-[#F5F5E6] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] border border-[#15803D]/50 flex flex-col">
            <div className="flex h-14 items-center justify-between border-b border-[#15803D]/20 px-5 bg-white">
              <h3 className="text-lg font-black text-[#15803D]">Nhập mã Barcode</h3>
              <button onClick={() => setIsBarcodeModalOpen(false)} className="text-[#334155] hover:text-[#15803D]"><X size={20} /></button>
            </div>
            <div className="p-6 text-center">
              <div className="mb-6 w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 text-2xl font-black text-[#334155] tracking-widest min-h-[60px] flex items-center justify-center shadow-inner break-all">
                {typedBarcode || <span className="text-[#94A3B8] font-normal tracking-normal text-lg break-normal">Nhập mã vạch...</span>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button key={num} onClick={() => setTypedBarcode(prev => prev + num)} className="flex h-14 items-center justify-center rounded-2xl bg-white border border-[#E2E8F0] text-xl font-bold text-[#334155] shadow-[2px_2px_0px_0px_rgba(51,65,85,0.06)] active:scale-95 transition-transform">{num}</button>
                ))}
                <button onClick={() => setTypedBarcode("")} className="flex h-14 items-center justify-center rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] text-sm font-black text-[#B91C1C] shadow-[2px_2px_0px_0px_rgba(51,65,85,0.06)] active:scale-95 transition-transform">Xóa</button>
                <button onClick={() => setTypedBarcode(prev => prev + "0")} className="flex h-14 items-center justify-center rounded-2xl bg-white border border-[#E2E8F0] text-xl font-bold text-[#334155] shadow-[2px_2px_0px_0px_rgba(51,65,85,0.06)] active:scale-95 transition-transform">0</button>
                <button onClick={() => {
                  const matched = dbProducts.find((p) => p.barcode === typedBarcode || p.id.toString() === typedBarcode) || dbProducts[0];
                  if (matched) handleProtectedAdd(matched);
                  setIsBarcodeModalOpen(false);
                  setTypedBarcode("");
                }} className="flex h-14 items-center justify-center rounded-2xl bg-[#D1FAE5] border border-[#34D399] text-sm font-black text-[#047857] shadow-[2px_2px_0px_0px_rgba(51,65,85,0.06)] active:scale-95 transition-transform">Xác nhận</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <TopStatusBar
        onHelp={() =>
          setNotice("Yêu cầu hỗ trợ đã được gửi tới nhân viên gần nhất.")
        }
      />

      <header className="flex h-[74px] shrink-0 items-center gap-4 border-b border-[#15803D]/55 bg-[#FFFFFF] px-7 text-[#334155] relative overflow-hidden font-black tracking-wide"><MonogramPattern />
        <ClayCartLogo className="h-14 w-14 drop-shadow-[0_4px_8px_rgba(51,65,85,0.08)]" />
        <div className="min-w-[170px]">
          <p className="text-lg font-black">
            Xin chào, {currentCart.member || "Khách hàng"}!
          </p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#15803D]/75 bg-white px-2 py-0.5 text-[11px] font-black text-[#15803D]">
            <Star size={12} fill="currentColor" />
            {memberPoints.toLocaleString("vi-VN")} điểm
          </span>
        </div>
        {groupCode && (
          <button
            onClick={() => go("group")}
            className="flex h-12 items-center gap-3 rounded-2xl border border-[#15803D]/60 bg-[#15803D]/10 px-3 text-left hover:bg-[#15803D]/20"
          >
            <Users size={20} className="text-[#15803D]" />
            <span>
              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-300">
                Nhóm {groupMembers.length}/3 xe
              </span>
              <b className="font-mono text-sm tracking-wider text-[#334155]">
                {groupCode} · {currentCart.cartId}
              </b>
            </span>
          </button>
        )}
        <div className="relative mx-auto w-[300px]">
          <Search className="absolute left-4 top-3 text-[#334155]" size={20} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            placeholder="Tìm món hàng..."
            className="h-11 w-full rounded-2xl border border-[#E2E8F0] bg-white pl-11 pr-4 text-sm font-semibold text-[#334155] outline-none ring-[#15803D] focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 shadow-sm"
          />
        </div>
        <button
          onClick={() => go("cart")}
          className="ml-auto flex h-12 items-center gap-2 rounded-2xl border border-[#15803D]/70 bg-white px-4 text-sm font-bold hover:bg-white"
        >
          <ShoppingCart size={21} />
          <span>
            {cartCount} món -{" "}
            <b className="text-[#15803D]">{formatMoney(cartTotal)}</b>
          </span>
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {notice && (
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#15803D] bg-[#F1F5F9] px-4 py-2 text-sm font-bold">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-[1.15fr_.85fr] gap-5">
          <section className="rounded-3xl border border-[#15803D]/55 bg-[#F5F5E6] p-3 text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#15803D] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] animate-pulse" />
                <b className="text-sm font-black">Máy quét tự động</b>
              </div>
              <button
                onClick={() => setIsBarcodeModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-[#15803D]/70 px-3 py-1.5 text-[11px] font-bold text-[#15803D] bg-white hover:bg-[#F1F5F9] transition-colors shadow-sm"
              >
                <Keyboard size={14} />
                Nhập tay
              </button>
            </div>
            
            <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-inner border border-[#E2E8F0] min-h-[160px]">
              <BarcodeCameraScanner 
                onScanSuccess={(decodedText) => {
                  const matched = dbProducts.find((p) => p.barcode === decodedText || p.id.toString() === decodedText);
                  if (matched) {
                    handleProtectedAdd(matched);
                  } else {
                    setDuplicateAlert(`Không tìm thấy sản phẩm có mã: ${decodedText}`);
                  }
                }} 
              />
            </div>
          </section>

          <section className="flex flex-col rounded-3xl border border-[#15803D]/55 bg-[#FEF9ED] p-4 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] justify-between h-[218px]">
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="font-black italic tracking-widest text-sm text-[#15803D]">
                  smart list
                </span>
                <div className="flex items-center gap-1 text-[11px] font-black text-[#15803D]">
                  <BarChart3 size={13} />
                  {boughtCount}/{totalCount} đã mua
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div className="h-full bg-gradient-to-r from-[#8CB867] to-[#15803D] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
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
                className="h-8 flex-1 rounded-2xl border border-[#E2E8F0] bg-white px-2.5 text-xs font-bold outline-none focus:border-[#15803D]"
              />
              <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#15803D] shadow-md text-white active:scale-95 transition-transform">
                <Plus size={16} strokeWidth={3} />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 [scrollbar-width:none]">
              {visibleUnchecked.map((m) => (
                <div key={m.originalIndex} className="group relative flex items-center gap-2 rounded-xl bg-white border border-[#E2E8F0] p-1.5 shadow-[2px_2px_0px_0px_rgba(51,65,85,0.04)] transition-all hover:border-[#15803D]/50">
                  <button onClick={() => toggleCheckItem(m.originalIndex)} className="shrink-0 text-[#94A3B8] hover:text-[#15803D] transition-colors"><Circle size={18} /></button>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-extrabold text-[#334155]">{m.name}</span>
                    {m.loc && <span className="block truncate text-[9px] font-bold text-[#15803D]">{m.loc.zone} · {m.loc.shelf}</span>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {m.loc && (
                      <button onClick={() => { setPendingNavTarget(m.loc); go("map"); }} className="rounded-lg bg-[#F1F5F9] p-1.5 text-[#15803D] hover:bg-[#D1FAE5] transition-colors"><Navigation size={13} /></button>
                    )}
                    <button onClick={() => deleteManualItem(m.originalIndex)} className="rounded-lg bg-[#F1F5F9] p-1.5 text-[#94A3B8] hover:bg-[#FEE2E2] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}

              {uncheckedItems.length > 4 && (
                <button onClick={() => setShowAllList(!showAllList)} className="flex w-full items-center justify-center py-1 text-[10px] font-bold text-[#64748B] hover:text-[#15803D]">
                  {showAllList ? "Thu gọn" : `Xem tất cả (${uncheckedItems.length - 4})`} <ChevronDown size={12} className={`ml-0.5 transition-transform ${showAllList ? "rotate-180" : ""}`} />
                </button>
              )}

              {checkedItems.length > 0 && (
                <div className="mt-2 pb-1">
                  <button onClick={() => setShowCheckedItems(!showCheckedItems)} className="flex w-full items-center justify-between rounded-lg bg-[#F1F5F9] px-2 py-1.5 text-[10px] font-bold text-[#64748B]">
                    <span>Đã mua nhanh ({checkedItems.length})</span>
                    <ChevronDown size={12} className={`transition-transform ${showCheckedItems ? "" : "-rotate-90"}`} />
                  </button>
                  {showCheckedItems && (
                    <div className="mt-1.5 space-y-1.5">
                      {checkedItems.map((m) => (
                        <div key={m.originalIndex} className="group flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100 pl-1">
                          <button onClick={() => toggleCheckItem(m.originalIndex)} className="shrink-0 text-[#15803D]"><CheckCircle2 size={16} /></button>
                          <span className="min-w-0 flex-1 truncate text-xs font-bold line-through text-[#94A3B8]">{m.name}</span>
                          <button onClick={() => deleteManualItem(m.originalIndex)} className="shrink-0 p-1 text-[#94A3B8] hover:text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.17em] text-[#15803D]">
              Cửa hàng dành cho bạn
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#334155]">
              Khám phá danh mục
            </h2>
          </div>
          <button
            onClick={() => go("map")}
            className="flex items-center gap-2 text-sm font-extrabold text-[#15803D] hover:underline"
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
              className="group flex h-[110px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border border-[#E2E8F0] shadow-sm transition-all hover:-translate-y-1 hover:border-[#15803D] active:scale-95"
            >
              <SoftIcon className="h-14 w-14 transition-transform group-active:scale-90">
                <Icon size={26} strokeWidth={1.5} />
              </SoftIcon>
              <span className="text-xs font-extrabold text-[#334155] truncate w-full px-1">
                {label}
              </span>
            </button>
          ))}
        </div>

        <ProductCarousel
          visible={visible}
          items={items}
          update={update}
          remove={remove}
          handleProtectedAdd={handleProtectedAdd}
        />
      </div>
    </section>
  );
}