import { useState, useEffect } from "react";
import { MonogramPattern } from "../components/ui/MonogramPattern";
import { api } from "../api";
import { Package, Plus, X, Circle, CheckCircle2 } from "lucide-react";
import {
  formatMoney,
  Back,
  MiniCartButton,
  QuickListButton,
} from "../shared";
import type { Screen, Item, ShoppingListItem } from "../shared";

export function CategoryScreen({
  categoryName,
  items,
  add,
  update,
  remove,
  go,
  back,
  toggleListPopup,
  showListPopup,
  manualList,
  toggleCheckItem,
  addNewManualItem,
}: {
  categoryName: string;
  items: Item[];
  add: (item: Omit<Item, "id" | "qty">) => void;
  update: (id: string, d: number) => void;
  remove: (id: string) => void;
  go: (s: Screen) => void;
  back: () => void;
  cartCount: number;
  cartTotal: number;
  toggleListPopup: () => void;
  showListPopup: boolean;
  manualList: ShoppingListItem[];
  toggleCheckItem: (idx: number) => void;
  addNewManualItem: (name: string) => void;
}) {
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    api.getProducts()
      .then(data => {
        if (data && data.length > 0) setDbProducts(data);
      })
      .catch(err => console.error("Error loading products for category page:", err));
  }, []);

  const filteredProducts = dbProducts.filter((p) => p.category === categoryName);

  const [localInput, setLocalInput] = useState("");
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="flex h-20 shrink-0 items-center gap-5 border-b border-[#15803D]/55 bg-[#FFFFFF] px-7 text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] relative overflow-hidden font-black tracking-wide"><MonogramPattern />
        <Back onClick={back} dark />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#15803D]">
            Danh mục siêu thị
          </p>
          <h1 className="text-2xl font-black">{categoryName}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3 relative">
          <QuickListButton onClick={toggleListPopup} />
          <MiniCartButton
            onClick={() => go("cart")}
            count={count}
            total={subtotal}
          />

          {showListPopup && (
            <div className="absolute right-0 top-14 z-50 w-[300px] rounded-3xl border border-[#15803D] bg-[#FEF9ED] p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]  animate-fadeIn text-[#334155]">
              <div className="flex items-center justify-between border-b border-[#15803D]/30 pb-2 mb-3">
                <span className="font-black italic tracking-widest text-base text-[#15803D]">
                  shopping list
                </span>
                <button
                  onClick={toggleListPopup}
                  className="rounded-2xl p-1 hover:bg-[#334155]/5"
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
                className="flex gap-1.5 mb-3"
              >
                <input
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  placeholder="Thêm việc cần mua..."
                  className="h-8 flex-1 rounded-2xl border border-[#E2E8F0] bg-white px-2.5 text-xs font-bold outline-none focus:border-[#15803D]"
                />
                <button className="h-8 rounded-2xl bg-[#15803D] shadow-md px-3 text-xs font-black text-white">
                  +
                </button>
              </form>
              <div className="max-h-52 overflow-y-auto space-y-2 [scrollbar-width:none]">
                {manualList.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleCheckItem(idx)}
                    className="flex items-center justify-between border-b border-black/10 pb-1.5 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      {m.checked ? (
                        <CheckCircle2
                          size={18}
                          className="text-[#15803D] shrink-0"
                        />
                      ) : (
                        <Circle
                          size={18}
                          className="text-[#475569] group-hover:text-[#15803D] shrink-0"
                        />
                      )}
                      <span
                        className={`text-xs font-extrabold ${m.checked ? "line-through text-[#94A3B8]" : "text-[#334155]"}`}
                      >
                        {m.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filteredProducts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[#475569]">
            <Package size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-bold">
              Chưa có sản phẩm nào trong danh mục này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5 pb-8">
            {filteredProducts.map((p) => {
              const cartItem = items.find((i) => i.name === p.name);
              return (
                <article
                  key={p.name}
                  className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition hover:border-[#15803D] hover:shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
                >
                  <div className={`relative h-28 ${p.tone}`}>
                    <span className="absolute left-3 top-3 rounded-full bg-[#F5F5E6] px-3 py-1 text-[10px] font-black text-[#15803D]">
                      CÓ SẴN
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-[#334155] truncate">
                      {p.name}
                    </h3>
                    <div className="mt-2 flex items-end gap-2">
                      {p.oldPrice && (
                        <span className="text-sm text-[#475569] line-through">
                          {formatMoney(p.oldPrice)}
                        </span>
                      )}
                      <b className="text-2xl text-[#15803D]">
                        {formatMoney(p.price)}
                      </b>
                    </div>
                    {cartItem ? (
                      <div className="mt-4 flex h-12 w-full items-center justify-between overflow-hidden rounded-2xl border border-[#15803D] bg-[#F1F5F9] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-all">
                        <button
                          onClick={() =>
                            cartItem.qty === 1
                              ? remove(cartItem.id)
                              : update(cartItem.id, -1)
                          }
                          className="flex h-full w-14 items-center justify-center text-xl font-black text-[#334155] transition-colors hover:bg-[#CBD5E1]/40"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center text-lg font-black text-[#15803D]">
                          {cartItem.qty}
                        </span>
                        <button
                          onClick={() => update(cartItem.id, 1)}
                          className="flex h-full w-14 items-center justify-center text-xl font-black text-[#334155] transition-colors hover:bg-[#CBD5E1]/40"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => add(p)}
                        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#15803D] text-base font-extrabold text-white transition-transform active:scale-95 hover:scale-[1.02] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
                      >
                        <Plus size={19} />
                        Thêm vào giỏ
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}