import { useState, useEffect } from "react";
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
      <header className="flex h-20 shrink-0 items-center gap-5 border-b border-[#F97316]/55 bg-[#0F172A] px-7 text-white shadow-md">
        <Back onClick={back} dark />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#F97316]">
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
            <div className="absolute right-0 top-14 z-50 w-[300px] rounded-3xl border border-[#F97316] bg-[#FEF9ED] p-5 shadow-[0_16px_36px_rgba(17,17,17,.25)] backdrop-blur-xl animate-fadeIn text-[#0F172A]">
              <div className="flex items-center justify-between border-b border-[#F97316]/30 pb-2 mb-3">
                <span className="font-black italic tracking-widest text-base text-[#EA580C]">
                  shopping list
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
                className="flex gap-1.5 mb-3"
              >
                <input
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  placeholder="Thêm việc cần mua..."
                  className="h-8 flex-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold outline-none focus:border-[#F97316]"
                />
                <button className="h-8 rounded-lg bg-[#F97316] px-3 text-xs font-black text-white">
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
                          className="text-[#F97316] shrink-0"
                        />
                      ) : (
                        <Circle
                          size={18}
                          className="text-[#CBD5E1] group-hover:text-[#F97316] shrink-0"
                        />
                      )}
                      <span
                        className={`text-xs font-extrabold ${m.checked ? "line-through text-[#94A3B8]" : "text-[#0F172A]"}`}
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
                  className="overflow-hidden rounded-3xl border border-[#CBD5E1] bg-white shadow-[0_10px_24px_rgba(17,17,17,.06)] transition hover:border-[#F97316] hover:shadow-[0_10px_24px_rgba(249,115,22,.12)]"
                >
                  <div className={`relative h-28 ${p.tone}`}>
                    <span className="absolute left-3 top-3 rounded-full bg-[#0F172A]/85 px-3 py-1 text-[10px] font-black text-[#F97316]">
                      CÓ SẴN
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-[#0F172A] truncate">
                      {p.name}
                    </h3>
                    <div className="mt-2 flex items-end gap-2">
                      {p.oldPrice && (
                        <span className="text-sm text-[#475569] line-through">
                          {formatMoney(p.oldPrice)}
                        </span>
                      )}
                      <b className="text-2xl text-[#F97316]">
                        {formatMoney(p.price)}
                      </b>
                    </div>
                    {cartItem ? (
                      <div className="mt-4 flex h-12 w-full items-center justify-between overflow-hidden rounded-xl border border-[#F97316] bg-[#F1F5F9] shadow-[0_0_12px_rgba(249,115,22,.15)] transition-all">
                        <button
                          onClick={() =>
                            cartItem.qty === 1
                              ? remove(cartItem.id)
                              : update(cartItem.id, -1)
                          }
                          className="flex h-full w-14 items-center justify-center text-xl font-black text-[#0F172A] transition-colors hover:bg-[#CBD5E1]/40"
                        >
                          −
                        </button>
                        <span className="flex-1 text-center text-lg font-black text-[#F97316]">
                          {cartItem.qty}
                        </span>
                        <button
                          onClick={() => update(cartItem.id, 1)}
                          className="flex h-full w-14 items-center justify-center text-xl font-black text-[#0F172A] transition-colors hover:bg-[#CBD5E1]/40"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => add(p)}
                        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] text-base font-extrabold text-[#0F172A] transition-transform active:scale-95 hover:scale-[1.02] shadow-md"
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