import React, { useMemo, useState, useEffect } from "react";
import {
  Apple, ArrowLeft, ArrowRight, Baby, Battery, BellRing, Bot, Camera, Check, ChevronLeft, ChevronRight,
  CircleDollarSign, CreditCard, Gift, Grid2X2, Headphones, History, Home, Keyboard, LockKeyhole, Map,
  Package, Phone, Plus, QrCode, ScanLine, Search, ShieldCheck, ShoppingCart,
  ShoppingBag, Smartphone, Sparkles, Star, Trash2, UserRound, Wallet, Wifi, Wheat, X
} from "lucide-react";

type Screen = "splash" | "login" | "home" | "map" | "cart" | "account" | "category";
type Item = { id: number; name: string; price: number; oldPrice?: number; qty: number; tone: string; category?: string };

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")} ₫`;

const CATEGORIES = [[Apple,"Thực phẩm tươi"],[Package,"Đồ khô"],[Wheat,"Gia vị"],[ShoppingBag,"Đồ gia dụng"],[Baby,"Mẹ & Bé"],[Sparkles,"Hóa mỹ phẩm"]] as const;
const PRODUCTS = [
  {name:"Thịt Bò Úc 500g", category: "Thực phẩm tươi", price:100000, oldPrice:150000, tone:"bg-[#0F172A]"},
  {name:"Táo Fuji Nam Phi", category: "Thực phẩm tươi", price:85000, tone:"bg-[#0F172A]"},
  {name:"Cá Hồi Tươi 300g", category: "Thực phẩm tươi", price:180000, tone:"bg-[#F97316]"},
  {name:"Mì Gói Hảo Hảo", category: "Đồ khô", price:4000, tone:"bg-[#F97316]"},
  {name:"Gạo ST25 5kg", category: "Đồ khô", price:145000, oldPrice:160000, tone:"bg-[#0F172A]"},
  {name:"Hạt Điều Rang Muối", category: "Đồ khô", price:75000, tone:"bg-[#F97316]"},
  {name:"Dầu ăn Simply 1L", category: "Gia vị", price:62000, tone:"bg-[#F97316]"},
  {name:"Nước mắm Nam Ngư", category: "Gia vị", price:45000, tone:"bg-[#0F172A]"},
  {name:"Hạt Nêm Knorr", category: "Gia vị", price:32000, tone:"bg-[#F97316]"},
  {name:"Nước rửa chén Sunlight", category: "Đồ gia dụng", price:25000, tone:"bg-[#F97316]"},
  {name:"Khăn giấy cuộn lớn", category: "Đồ gia dụng", price:42000, tone:"bg-[#0F172A]"},
  {name:"Sữa Tươi Vinamilk 1L", category: "Mẹ & Bé", price:36000, oldPrice:45000, tone:"bg-[#F97316]"},
  {name:"Tã dán Huggies L", category: "Mẹ & Bé", price:280000, tone:"bg-[#0F172A]"},
  {name:"Dầu gội Clear 650ml", category: "Hóa mỹ phẩm", price:120000, tone:"bg-[#0F172A]"},
  {name:"Kem đánh răng Closeup", category: "Hóa mỹ phẩm", price:38000, tone:"bg-[#F97316]"}
];

function GoldIcon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#F97316] bg-[#0F172A] p-px shadow-[0_0_11px_rgba(249,115,22,.38)] ${className}`}><span className="flex h-full w-full items-center justify-center rounded-[inherit] bg-[#0F172A] text-[#F97316]">{children}</span></span>;
}

function SoftIcon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#0F172A] transition-colors group-hover:bg-[#F97316] group-hover:text-white ${className}`}>{children}</span>;
}

function Back({ onClick, dark = false }: { onClick: () => void; dark?: boolean }) {
  return <button onClick={onClick} className={`flex h-12 items-center gap-2 rounded-xl px-4 text-base font-extrabold transition active:scale-95 ${dark ? "text-white hover:bg-white/10" : "border border-[#F97316]/70 bg-white/75 text-[#0F172A] shadow-sm backdrop-blur-xl hover:bg-white"}`}><ChevronLeft size={22} /> Quay lại</button>;
}

function TopStatusBar({ onHelp, isAbsolute = false }: { onHelp: () => void; isAbsolute?: boolean }) {
  return (
    <div className={`${isAbsolute ? "absolute inset-x-0 top-0 z-30" : "shrink-0"} flex h-10 items-center justify-between bg-[#0F172A] px-7 text-[11px] font-bold text-[#CBD5E1]`}>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5"><Battery size={14} className="text-[#F97316]"/>85%</span>
        <span className="flex items-center gap-1.5"><Wifi size={14} className="text-[#F97316]"/>Đã kết nối</span>
      </div>
      <button onClick={onHelp} className="relative top-1 flex h-7 items-center gap-1.5 rounded-lg bg-[#F97316] px-3 text-xs font-black text-[#0F172A] hover:bg-white transition-colors">
        <Headphones size={14}/>Gọi hỗ trợ
      </button>
    </div>
  );
}

function MiniCartButton({ onClick, count, total, className = "" }: { onClick: () => void; count: number; total: number; className?: string }) {
  return (
    <button onClick={onClick} className={`z-30 flex h-12 items-center gap-2 rounded-xl border border-[#F97316]/75 bg-[#0F172A]/92 px-4 text-sm font-bold text-white shadow-[0_0_16px_rgba(249,115,22,.2)] backdrop-blur-xl hover:bg-[#0F172A] ${className}`}>
      <ShoppingCart size={20}/>
      <span>{count} món - <b className="text-[#F97316]">{formatMoney(total)}</b></span>
    </button>
  );
}

function BottomNav({ active, onChange, cartCount }: { active: Screen; onChange: (screen: Screen) => void; cartCount: number }) {
  const tabs = [["home", Home, "Trang chủ"], ["map", Map, "Bản đồ & AI"], ["account", UserRound, "Tài khoản"]] as const;
  return <nav className="flex h-[82px] shrink-0 items-center gap-4 border-t border-[#CBD5E1] bg-white/95 px-8 shadow-[0_-8px_28px_rgba(17,17,17,.06)] backdrop-blur-xl">
    {tabs.map(([id, Icon, label]) => {
      const isActive = active === id;
      return (
        <button key={id} onClick={() => onChange(id)} className={`relative flex h-[62px] flex-1 items-center justify-center gap-3 rounded-2xl px-5 transition-all duration-300 ${isActive ? "bg-[#FFF7ED] border border-[#F97316]/60 text-[#F97316] shadow-[0_4px_16px_rgba(249,115,22,.15)] scale-[1.02]" : "text-[#475569] hover:bg-[#F1F5F9] border border-transparent"}`}>
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${isActive ? "bg-[#F97316] text-white shadow-[0_0_12px_rgba(249,115,22,.4)]" : "bg-[#F1F5F9] text-[#0F172A]"}`}><Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} /></span>
          <span className={`text-sm font-black tracking-wide ${isActive ? "text-[#0F172A]" : "text-[#475569]"}`}>{label}</span>
          {id === "cart" && cartCount > 0 && <span className="absolute right-4 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F97316] px-1 text-[10px] text-white font-black shadow-sm">{cartCount}</span>}
        </button>
      );
    })}
  </nav>;
}

// --- SCREENS ---

function CategoryScreen({ categoryName, items, add, update, remove, go, back, cartCount, cartTotal }: { categoryName: string; items: Item[]; add: (item: Omit<Item,"id"|"qty">) => void; update: (id: number, d: number) => void; remove: (id: number) => void; go: (s: Screen) => void; back: () => void; cartCount: number; cartTotal: number; }) {
  const filteredProducts = PRODUCTS.filter(p => p.category === categoryName);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="flex h-20 shrink-0 items-center gap-5 border-b border-[#F97316]/55 bg-[#0F172A] px-7 text-white shadow-md">
        <Back onClick={back} dark/>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#F97316]">Danh mục siêu thị</p>
          <h1 className="text-2xl font-black">{categoryName}</h1>
        </div>
        <MiniCartButton onClick={() => go("cart")} count={cartCount} total={cartTotal} className="ml-auto" />
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filteredProducts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-[#475569]">
            <Package size={64} className="mb-4 opacity-50" />
            <p className="text-lg font-bold">Chưa có sản phẩm nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5 pb-8">
            {filteredProducts.map(p => {
              const cartItem = items.find(i => i.name === p.name);
              return (
                <article key={p.name} className="overflow-hidden rounded-3xl border border-[#CBD5E1] bg-white shadow-[0_10px_24px_rgba(17,17,17,.06)] transition hover:border-[#F97316] hover:shadow-[0_10px_24px_rgba(249,115,22,.12)]">
                  <div className={`relative h-28 ${p.tone}`}><span className="absolute left-3 top-3 rounded-full bg-[#0F172A]/85 px-3 py-1 text-[10px] font-black text-[#F97316]">CÓ SẴN</span></div>
                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-[#0F172A] truncate">{p.name}</h3>
                    <div className="mt-2 flex items-end gap-2">{p.oldPrice&&<span className="text-sm text-[#475569] line-through">{formatMoney(p.oldPrice)}</span>}<b className="text-2xl text-[#F97316]">{formatMoney(p.price)}</b></div>
                    {cartItem ? (
                      <div className="mt-4 flex h-12 w-full items-center justify-between overflow-hidden rounded-xl border border-[#F97316] bg-[#F1F5F9] shadow-[0_0_12px_rgba(249,115,22,.15)] transition-all">
                        <button onClick={() => cartItem.qty === 1 ? remove(cartItem.id) : update(cartItem.id, -1)} className="flex h-full w-14 items-center justify-center text-xl font-black text-[#0F172A] transition-colors hover:bg-[#CBD5E1]/40">−</button>
                        <span className="flex-1 text-center text-lg font-black text-[#F97316]">{cartItem.qty}</span>
                        <button onClick={() => update(cartItem.id, 1)} className="flex h-full w-14 items-center justify-center text-xl font-black text-[#0F172A] transition-colors hover:bg-[#CBD5E1]/40">+</button>
                      </div>
                    ) : (
                      <button onClick={() => add(p)} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] text-base font-extrabold text-[#0F172A] transition-transform active:scale-95 hover:scale-[1.02] shadow-md"><Plus size={19}/>Thêm vào giỏ</button>
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

function Splash({ start }: { start: () => void }) {
  return <section className="relative flex h-full items-center justify-center overflow-hidden bg-[#0F172A] text-white"><div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#F97316]/15 blur-3xl" /><div className="absolute -bottom-24 right-12 h-80 w-80 rounded-full bg-[#F97316]/15 blur-3xl" /><div className="relative z-10 flex max-w-4xl items-center gap-16 px-12"><div className="relative h-[270px] w-[370px]"><div className="absolute inset-4 rounded-[48px] border border-[#F97316]/75 bg-[#0F172A] shadow-[0_0_55px_rgba(249,115,22,.38)]" /><div className="absolute left-14 top-14 h-28 w-60 rounded-[26px] border-2 border-[#F97316] bg-[#0F172A] shadow-[0_0_25px_rgba(255,216,20,.45)]" /><div className="absolute left-20 top-[78px] flex gap-5 text-[#F97316]"><ShoppingCart size={54} strokeWidth={1.6}/><Sparkles size={38}/></div><div className="absolute bottom-6 left-10 h-11 w-11 rounded-full border-4 border-[#F97316] bg-[#0F172A]"/><div className="absolute bottom-6 right-10 h-11 w-11 rounded-full border-4 border-[#F97316] bg-[#0F172A]"/></div><div className="max-w-xl"><div className="mb-5 flex items-center gap-3 text-[#F97316]"><GoldIcon className="h-12 w-12"><Sparkles size={23}/></GoldIcon><span className="text-sm font-black uppercase tracking-[.2em]">Smart Shopping Experience</span></div><h1 className="text-6xl font-black leading-[.98]">Smart Cart <span className="text-[#F97316]">AI</span></h1><p className="mt-6 text-xl leading-relaxed text-[#CBD5E1]">Chiếc xe đẩy thông minh dành riêng cho trải nghiệm mua sắm đẳng cấp 2026.</p><button onClick={start} className="mt-9 flex h-15 items-center gap-3 rounded-2xl border border-[#F97316] bg-[#F97316] px-8 py-4 text-lg font-black text-[#0F172A] shadow-[0_0_26px_rgba(249,115,22,.45)] transition hover:bg-[#F97316] active:scale-95"><ShoppingBag size={22}/> Bắt đầu mua sắm <ArrowRight size={20}/></button></div></div></section>;
}

function Login({ back, continueAsGuest, onPhoneLogin }: { back: () => void; continueAsGuest: () => void; onPhoneLogin: () => void }) {
  const benefits = [[CircleDollarSign,"Tích điểm tự động"],[Gift,"Nhận mã giảm giá cá nhân"],[History,"Lưu lịch sử mua hàng"],[Map,"Gợi ý lộ trình thông minh"],[ShieldCheck,"Bảo hành đổi trả nhanh"]] as const;
  return <section className="relative flex h-full overflow-hidden bg-[#FFFFFF]"><div className="absolute left-7 top-7 z-10"><Back onClick={back}/></div><div className="flex w-[46%] flex-col items-center justify-center bg-[#0F172A] p-10 text-white"><p className="mb-5 text-sm font-black uppercase tracking-[.18em] text-[#F97316]">Đồng bộ tài khoản</p><div className="rounded-[30px] border border-[#F97316] bg-white p-5 shadow-[0_0_30px_rgba(249,115,22,.35)]"><QrCode size={190} className="text-[#0F172A]" strokeWidth={1.3}/></div><p className="mt-5 text-sm text-[#CBD5E1]">Quét mã QR trên ứng dụng điện thoại</p><div className="mt-5 flex w-full max-w-[310px] flex-col items-center"><button onClick={onPhoneLogin} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#F97316]/70 bg-white/10 px-5 text-sm font-extrabold text-[#F97316] hover:bg-white/15"><Phone size={18}/> Đăng nhập bằng Số điện thoại</button><div className="my-4 flex w-full items-center gap-3 text-xs font-bold uppercase tracking-[.16em] text-[#CBD5E1]"><span className="h-px flex-1 bg-white/20"/>hoặc<span className="h-px flex-1 bg-white/20"/></div><button onClick={continueAsGuest} className="flex h-11 w-full items-center justify-center rounded-xl border border-white/30 bg-white/5 px-5 text-sm font-bold text-white hover:bg-white/15">Tiếp tục mua sắm với tư cách khách</button></div></div><div className="flex flex-1 flex-col justify-center px-14"><div className="mb-8"><p className="text-sm font-black uppercase tracking-[.18em] text-[#EA580C]">Quyền lợi thành viên</p><h2 className="mt-2 text-4xl font-black text-[#0F172A]">Mua sắm thông minh hơn</h2></div><div className="grid grid-cols-1 gap-4">{benefits.map(([Icon,label]) => <div key={label} className="flex h-[68px] items-center gap-4 rounded-2xl border border-[#CBD5E1] bg-white/80 px-5 shadow-sm"><GoldIcon className="h-11 w-11"><Icon size={21}/></GoldIcon><span className="text-lg font-bold text-[#0F172A]">{label}</span><Check className="ml-auto text-[#F97316]" size={20}/></div>)}</div></div></section>;
}

function HomeScreen({ cartCount, cartTotal, add, go, items, update, remove, onSelectCategory }: { cartCount: number; cartTotal: number; add: (item: Omit<Item,"id"|"qty">) => void; go: (s: Screen) => void; items: Item[]; update: (id: number, d: number) => void; remove: (id: number) => void; onSelectCategory: (cat: string) => void; }) {
  const [offset, setOffset] = useState(0); 
  const [query, setQuery] = useState(""); 
  const [notice, setNotice] = useState("");
  
  const visible = PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase())); 
  const maxOffset = Math.max(0, visible.length - 3);

  useEffect(() => {
    if (maxOffset === 0) return;
    const timer = setInterval(() => { setOffset((prev) => (prev >= maxOffset ? 0 : prev + 1)); }, 4000);
    return () => clearInterval(timer);
  }, [maxOffset, offset]);

  return <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#FFFFFF]">
    <TopStatusBar onHelp={() => setNotice("Yêu cầu hỗ trợ đã được gửi tới nhân viên gần nhất.")} />
    
    <header className="flex h-[74px] shrink-0 items-center gap-5 border-b border-[#F97316]/50 bg-[#0F172A] px-7 text-white"><GoldIcon className="h-11 w-11"><ShoppingBag size={22}/></GoldIcon><div><p className="text-lg font-black">Xin chào, Khách hàng!</p><span className="mt-1 inline-flex items-center gap-1 rounded-full border border-[#F97316]/75 bg-white/5 px-2 py-0.5 text-[11px] font-black text-[#F97316]"><Star size={12} fill="currentColor"/>1.250 điểm</span></div><div className="relative mx-auto w-[360px]"><Search className="absolute left-4 top-3 text-[#0F172A]" size={20}/><input value={query} onChange={e=>{setQuery(e.target.value);setOffset(0)}} placeholder="Tìm món hàng..." className="h-11 w-full rounded-xl bg-white pl-11 pr-4 text-sm font-semibold text-[#0F172A] outline-none ring-[#F97316] focus:ring-2"/></div><button onClick={()=>go("cart")} className="ml-auto flex h-12 items-center gap-2 rounded-xl border border-[#F97316]/70 bg-white/10 px-4 text-sm font-bold hover:bg-white/15"><ShoppingCart size={21}/><span>{cartCount} món - <b className="text-[#F97316]">{formatMoney(cartTotal)}</b></span></button></header>
    
    <div className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {notice && <div className="mb-3 flex items-center justify-between rounded-xl border border-[#F97316] bg-[#F1F5F9] px-4 py-2 text-sm font-bold"><span>{notice}</span><button onClick={()=>setNotice("")}><X size={17}/></button></div>}
      
      <div className="grid grid-cols-[1.15fr_.85fr] gap-5">
        <section className="rounded-3xl border border-[#F97316]/55 bg-[#0F172A] p-5 text-white shadow-[0_0_22px_rgba(249,115,22,.12)]"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#F97316] shadow-[0_0_10px_#F97316]"/><b>Máy quét đang sẵn sàng</b></div><GoldIcon className="h-10 w-10"><ScanLine size={20}/></GoldIcon></div><p className="mt-2 text-sm text-[#CBD5E1]">Đưa barcode vào vùng quét để thêm sản phẩm nhanh.</p>
          <button onClick={()=>{ add(PRODUCTS[0]); setNotice(`[Demo] Đã quét thành công: ${PRODUCTS[0].name}. Cân điện tử đã xác nhận.`); }} className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-[#F97316]/70 px-4 text-sm font-bold text-[#F97316] hover:bg-white/10"><Keyboard size={18}/>Nhập mã barcode thủ công</button>
        </section>
        <section className="rounded-3xl border border-[#F97316]/55 bg-white/88 p-5 shadow-[0_12px_26px_rgba(17,17,17,.08)] backdrop-blur-xl"><div className="flex items-center gap-3"><GoldIcon className="h-12 w-12"><QrCode size={23}/></GoldIcon><div><h2 className="font-black text-[#0F172A]">Danh sách mua sắm</h2><p className="text-sm text-[#475569]">Đồng bộ danh sách đã chuẩn bị</p></div></div><button onClick={()=>setNotice("Danh sách mua sắm đã được đồng bộ từ điện thoại.")} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#F97316] bg-[#F1F5F9] text-sm font-black text-[#0F172A] hover:bg-[#E2E8F0] transition"><Smartphone size={18}/>Đồng bộ từ điện thoại</button></section>
      </div>
      
      <div className="mt-6 flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.17em] text-[#EA580C]">Cửa hàng dành cho bạn</p><h2 className="mt-1 text-2xl font-black text-[#0F172A]">Khám phá danh mục</h2></div><button onClick={()=>go("map")} className="flex items-center gap-2 text-sm font-extrabold text-[#EA580C] hover:underline"><Map size={18}/>Xem vị trí trên bản đồ</button></div>
      <div className="mt-3 grid grid-cols-6 gap-3">
        {CATEGORIES.map(([Icon,label])=>
          <button 
            key={label} 
            onClick={() => onSelectCategory(label)}
            className="group flex h-[110px] flex-col items-center justify-center gap-2 rounded-2xl border border-[#CBD5E1] bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#F97316] active:scale-95"
          >
            <SoftIcon className="h-14 w-14 transition-transform group-active:scale-90"><Icon size={26} strokeWidth={1.5} /></SoftIcon>
            <span className="text-xs font-extrabold text-[#0F172A]">{label}</span>
          </button>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between">
        <div><p className="text-xs font-black uppercase tracking-[.17em] text-[#EA580C]">Ưu đãi hôm nay</p><h2 className="mt-1 text-2xl font-black text-[#0F172A]">Gợi ý hôm nay</h2></div>
        <div className="flex gap-2">
          <button onClick={()=>setOffset(Math.max(0, offset-1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F97316] bg-white disabled:opacity-35 disabled:border-[#CBD5E1] hover:bg-[#F1F5F9] transition" disabled={offset === 0}><ChevronLeft/></button>
          <button onClick={()=>setOffset(Math.min(maxOffset, offset+1))} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F97316] bg-white disabled:opacity-35 disabled:border-[#CBD5E1] hover:bg-[#F1F5F9] transition" disabled={offset >= maxOffset}><ChevronRight/></button>
        </div>
      </div>
      
      <div className="overflow-hidden mt-3 pb-4">
        <div className="flex gap-4 transition-transform duration-500 ease-out w-full" style={{ transform: `translateX(calc(-${offset} * (100% / 3 + 16px / 3)))` }}>
          {visible.map(p => {
            const cartItem = items.find(i => i.name === p.name);
            return (
              <article key={p.name} className="w-[calc(33.3333%-10.66px)] shrink-0 overflow-hidden rounded-3xl border border-[#CBD5E1] bg-white shadow-[0_10px_24px_rgba(17,17,17,.08)] transition hover:border-[#F97316]">
                <div className={`relative h-20 ${p.tone}`}><span className="absolute left-3 top-3 rounded-full bg-[#0F172A]/85 px-3 py-1 text-[10px] font-black text-[#F97316]">ƯU ĐÃI</span></div>
                <div className="p-4">
                  <h3 className="font-extrabold text-[#0F172A] truncate">{p.name}</h3>
                  <div className="mt-1 flex items-end gap-2">{p.oldPrice&&<span className="text-xs text-[#475569] line-through">{formatMoney(p.oldPrice)}</span>}<b className="text-xl text-[#F97316]">{formatMoney(p.price)}</b></div>
                  {cartItem ? (
                    <div className="mt-3 flex h-10 w-full items-center justify-between overflow-hidden rounded-xl border border-[#F97316] bg-[#F1F5F9] shadow-[0_0_12px_rgba(249,115,22,.15)] transition-all">
                      <button onClick={() => cartItem.qty === 1 ? remove(cartItem.id) : update(cartItem.id, -1)} className="flex h-full w-12 items-center justify-center text-lg font-black text-[#0F172A] transition-colors hover:bg-[#CBD5E1]/40">−</button>
                      <span className="flex-1 text-center font-black text-[#F97316]">{cartItem.qty}</span>
                      <button onClick={() => update(cartItem.id, 1)} className="flex h-full w-12 items-center justify-center text-lg font-black text-[#0F172A] transition-colors hover:bg-[#CBD5E1]/40">+</button>
                    </div>
                  ) : (
                    <button onClick={() => go("map")} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#F97316] bg-white text-sm font-extrabold text-[#0F172A] transition-transform active:scale-95 hover:bg-[#FFF7ED]"><Map size={17} className="text-[#F97316]"/>Tìm vị trí kệ</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

    </div>
  </section>;
}

function MapAI({ back, go, cartCount, cartTotal }: { back: () => void; go: (s: Screen) => void; cartCount: number; cartTotal: number; }) {
  const [chat, setChat] = useState(false);
  const [route, setRoute] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("Tôi đã tìm được Mì gói tại Khu Thực Phẩm Khô, Kệ 04.");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const zoneProducts: Record<string, string[]> = {
    "Rau củ": ["Rau cải xanh", "Cà rốt Đà Lạt", "Khoai tây", "Cà chua bi"], "Trái cây": ["Táo Fuji Nam Phi", "Cam sành", "Nho xanh", "Chuối Laba"], "Thịt & Cá": ["Thịt bò Úc 500g", "Thịt heo ba rọi", "Cá hồi tươi", "Tôm thẻ"],
    "Tủ mát": ["Sữa tươi Vinamilk", "Sữa chua", "Phô mai lát", "Nước ép lạnh"], "Tủ đông": ["Kem vani", "Há cảo đông lạnh", "Cá viên", "Gà rán đông lạnh"], "Kho lạnh": ["Hải sản đông lạnh", "Thịt bò đông lạnh", "Đá viên", "Rau củ đông lạnh"],
    "Mì · Gạo · Gia vị": ["Mì Hảo Hảo tôm chua cay", "Gạo ST25", "Nước mắm Nam Ngư", "Dầu ăn Simply", "Muối i-ốt"], "Đồ uống · Bánh kẹo": ["Coca-Cola", "Nước khoáng", "Bánh Oreo", "Kẹo Alpenliebe", "Cà phê hòa tan"], "Đồ hộp · Hóa mỹ phẩm": ["Cá ngừ hộp", "Thịt hộp", "Dầu gội", "Nước giặt", "Kem đánh răng"],
    "Đồ gia dụng": ["Khăn giấy", "Túi rác", "Nước rửa chén", "Màng bọc thực phẩm"], "Trạm Xe Đẩy AI": ["Nhận xe đẩy", "Sạc xe thông minh", "Hỗ trợ quét QR"], "Quầy Thu Ngân": ["Thanh toán QR", "Thẻ ngân hàng", "Ví điện tử", "Hóa đơn điện tử"],
  };
  const ask = (value: string) => { if (!value.trim()) return; setAnswer(`Tôi đã nhận câu hỏi “${value}”. Bạn có muốn xem chỉ đường trên bản đồ không?`); setChat(true); setRoute(false); setPrompt(""); };
  const Block = ({ x, y, label, zone, w = 170, h = 56 }: { x:number;y:number;label:string;zone?:string;w?:number;h?:number }) => <g transform={`translate(${x} ${y}) scale(0.98)`} filter="url(#isoShadow)" className={zone ? "cursor-pointer" : ""} onClick={() => zone && setSelectedZone(zone)}><polygon points={`0,18 ${w},18 ${w+24},0 24,0`} fill="#0F172A" stroke="#F97316" strokeWidth="1.5"/><polygon points={`${w},18 ${w+24},0 ${w+24},${h-10} ${w},${h+7}`} fill="#0F172A"/><polygon points={`0,18 ${w},18 ${w},${h+7} 0,${h+7}`} fill="#0F172A"/><text x={w/2} y={47} textAnchor="middle" fill="#F97316" fontSize="13" fontWeight="800">{label}</text></g>;
  
  return <section className="relative h-full overflow-hidden bg-[#FFFFFF]" aria-label="Bản đồ siêu thị isometric">
    <TopStatusBar isAbsolute onHelp={() => setAnswer("Yêu cầu hỗ trợ đã được gửi tới nhân viên gần nhất.")} />
    
    <svg className="absolute inset-0 h-full w-full p-7" viewBox="0 0 1360 760" preserveAspectRatio="xMidYMid meet" role="img">
      <defs><filter id="isoShadow" x="-15%" y="-20%" width="140%" height="150%"><feDropShadow dx="9" dy="11" stdDeviation="6" floodColor="#0F172A" floodOpacity=".23"/></filter><filter id="isoGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><pattern id="floorGrid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" stroke="#CBD5E1" strokeWidth="1" fill="none" opacity=".7"/></pattern></defs>
      <rect x="42" y="42" width="1276" height="650" rx="24" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3"/><rect x="42" y="42" width="1276" height="650" rx="24" fill="url(#floorGrid)"/>
      <g fill="none" stroke="#F97316" strokeWidth="2" opacity=".55"><path d="M338 65V668M970 65V668M65 225H1295M65 520H1295"/></g><text x="76" y="84" fill="#0F172A" fontSize="14" fontWeight="900" letterSpacing="2">SƠ ĐỒ SIÊU THỊ · 2.5D FLOOR PLAN</text>
      <g filter="url(#isoShadow)"><rect x="76" y="548" width="108" height="104" rx="12" fill="#0F172A" stroke="#F97316" strokeWidth="2"/><rect x="202" y="548" width="108" height="104" rx="12" fill="#0F172A" stroke="#F97316" strokeWidth="2"/><rect onClick={() => setSelectedZone("Trạm Xe Đẩy AI")} className="cursor-pointer" x="76" y="286" width="234" height="92" rx="14" fill="#0F172A" stroke="#F97316" strokeWidth="2"/></g><g fill="#F97316" fontWeight="800" textAnchor="middle"><text x="130" y="602" fontSize="15">LỐI VÀO</text><text x="256" y="602" fontSize="15">LỐI RA</text><text x="193" y="332" fontSize="16">TRẠM XE ĐẨY AI</text><text x="193" y="354" fontSize="11">KHU SẠC &amp; NHẬN XE</text></g><g stroke="#F97316" strokeWidth="3"><path d="M99 621h62M225 621h62"/></g>
      <text x="530" y="112" fill="#EA580C" fontSize="18" fontWeight="900">HÀNG TƯƠI SỐNG</text><Block x={390} y={138} label="RAU CỦ" zone="Rau củ" w={155}/><Block x={575} y={138} label="TRÁI CÂY" zone="Trái cây" w={155}/><Block x={760} y={138} label="THỊT & CÁ" zone="Thịt & Cá" w={155}/>
      <text x="1090" y="112" fill="#EA580C" fontSize="18" fontWeight="900">ĐÔNG LẠNH</text><Block x={1000} y={138} label="TỦ MÁT" zone="Tủ mát" w={235} h={66}/><Block x={1000} y={225} label="TỦ ĐÔNG" zone="Tủ đông" w={235} h={66}/><Block x={1000} y={312} label="KHO LẠNH" zone="Kho lạnh" w={235} h={66}/>
      <text x="600" y="278" fill="#EA580C" fontSize="18" fontWeight="900">THỰC PHẨM KHÔ</text><Block x={392} y={306} label="MÌ · GẠO · GIA VỊ" zone="Mì · Gạo · Gia vị" w={480} h={46}/><Block x={392} y={377} label="ĐỒ UỐNG · BÁNH KẸO" zone="Đồ uống · Bánh kẹo" w={480} h={46}/><Block x={392} y={448} label="ĐỒ HỘP · HÓA MỸ PHẨM" zone="Đồ hộp · Hóa mỹ phẩm" w={480} h={46}/><Block x={392} y={519} label="ĐỒ GIA DỤNG" zone="Đồ gia dụng" w={480} h={46}/>
      <g filter="url(#isoShadow)"><rect onClick={() => setSelectedZone("Quầy Thu Ngân")} className="cursor-pointer" x="1000" y="482" width="244" height="170" rx="16" fill="#0F172A" stroke="#F97316" strokeWidth="2"/><rect x="1018" y="532" width="55" height="82" rx="8" fill="#0F172A" stroke="#F97316"/><rect x="1092" y="532" width="55" height="82" rx="8" fill="#0F172A" stroke="#F97316"/><rect x="1166" y="532" width="55" height="82" rx="8" fill="#0F172A" stroke="#F97316"/></g><g fill="#F97316" fontWeight="800" textAnchor="middle"><text x="1122" y="516" fontSize="17">QUẦY THU NGÂN</text><text x="1045" y="579" fontSize="12">01</text><text x="1119" y="579" fontSize="12">02</text><text x="1193" y="579" fontSize="12">03</text></g>
      {route && <g filter="url(#isoGlow)"><path d="M930 410 L900 410 L900 286 L885 286 L885 330" fill="none" stroke="#F97316" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="15 12"/><circle cx="885" cy="330" r="17" fill="#0F172A" stroke="#F97316" strokeWidth="5"/><text x="885" y="335" fill="#F97316" fontSize="12" fontWeight="900" textAnchor="middle">Mì</text></g>}
      <g transform="translate(930 410)"><ellipse cy="31" rx="29" ry="8" fill="#0F172A" opacity=".2"/><circle r="22" fill="#F97316" stroke="#FFF" strokeWidth="4"/><circle r="6" fill="#FFF"/><rect x="-28" y="29" width="56" height="22" rx="11" fill="#F97316"/><text x="0" y="44" fill="#FFF" fontSize="12" fontWeight="800" textAnchor="middle">Bạn</text></g>
    </svg>
    {selectedZone && <div className="absolute bottom-7 left-7 z-30 w-[340px] overflow-hidden rounded-3xl border border-[#F97316] bg-white/90 shadow-[0_0_25px_rgba(249,115,22,.24),0_16px_30px_rgba(17,17,17,.18)] backdrop-blur-xl"><div className="flex items-center justify-between bg-[#0F172A] px-5 py-3 text-white"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#F97316]">Danh mục khu vực</p><h2 className="text-lg font-black">{selectedZone}</h2></div><button onClick={() => setSelectedZone(null)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Đóng danh mục"><X size={19}/></button></div><div className="grid grid-cols-2 gap-2 p-4">{zoneProducts[selectedZone].map((product) => <button key={product} onClick={() => { setAnswer(`${product} thuộc ${selectedZone}. Tôi có thể chỉ đường cho bạn.`); setChat(true); setSelectedZone(null); }} className="rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-3 text-left text-sm font-bold text-[#0F172A] hover:border-[#F97316] hover:bg-[#F1F5F9]">{product}</button>)}</div></div>}
    <div className="absolute left-1/2 top-12 z-20 w-[430px] -translate-x-1/2 rounded-2xl border border-[#F97316] bg-white/78 p-1 shadow-[0_0_18px_rgba(249,115,22,.23)] backdrop-blur-xl"><div className="flex h-12 items-center gap-3 px-4"><Search size={20}/><input onKeyDown={e=>{if(e.key==="Enter")ask(e.currentTarget.value)}} placeholder="Tìm sản phẩm..." className="h-full flex-1 bg-transparent font-semibold outline-none"/></div></div>
    <MiniCartButton onClick={() => go("cart")} count={cartCount} total={cartTotal} className="absolute right-6 top-[52px]" />
    {chat && <div className="absolute bottom-24 right-7 z-30 w-[350px] overflow-hidden rounded-3xl border border-[#F97316] bg-white/92 shadow-[0_0_24px_rgba(249,115,22,.24)] backdrop-blur-xl"><div className="flex items-center gap-2 bg-[#0F172A] px-4 py-3 text-white"><GoldIcon className="h-8 w-8 rounded-lg"><Bot size={17}/></GoldIcon><b>Trợ lý AI</b><button onClick={()=>setChat(false)} className="ml-auto"><X/></button></div><p className="p-4 text-sm font-semibold leading-relaxed">{answer}</p>{route?<div className="mx-4 mb-4 rounded-xl bg-[#F1F5F9] p-3 text-sm font-bold text-[#EA580C]">✓ Tuyến dẫn đường đã được hiển thị.</div>:<div className="flex gap-2 px-4 pb-3"><button onClick={()=>setRoute(true)} className="flex-1 rounded-xl bg-[#F97316] py-3 font-black">Chỉ đường</button><button onClick={()=>setChat(false)} className="rounded-xl border border-[#CBD5E1] px-4 font-bold">Để sau</button></div>}<div className="flex flex-wrap gap-2 px-4 pb-3">{["Mã giảm giá đang có?","Thịt bò ở đâu?","Gợi ý món ăn tối?"].map((suggestion)=><button key={suggestion} onClick={()=>ask(suggestion)} className="rounded-full border border-[#F97316]/75 bg-[#F1F5F9] px-3 py-1.5 text-xs font-bold text-[#0F172A] hover:bg-[#E2E8F0]">{suggestion}</button>)}</div><form onSubmit={e=>{e.preventDefault();ask(prompt)}} className="flex border-t border-[#CBD5E1] p-3"><input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Nhập câu hỏi..." className="h-10 min-w-0 flex-1 rounded-xl bg-[#F1F5F9] px-3 outline-none"/><button className="ml-2 rounded-xl bg-[#F97316] px-4 font-black">Gửi</button></form></div>}
    <button onClick={()=>setChat(v=>!v)} aria-label="Mở trợ lý AI" className="absolute bottom-7 right-7 z-30 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#F97316] bg-[#F97316] text-[#0F172A] shadow-[0_0_24px_rgba(249,115,22,.65)] transition-transform hover:scale-105"><Bot size={30}/></button>
  </section>;
}

function CartScreen({ items, update, remove, go, back, subtotal, cartTotal }: { items: Item[]; update:(id:number,d:number)=>void; remove:(id:number)=>void; go:(s:Screen)=>void; back:()=>void; subtotal: number; cartTotal: number; }) {
  const [confirm,setConfirm]=useState(false); 
  const [methods,setMethods]=useState(false); 
  const tax=Math.round(subtotal*.03); 
  const discount=Math.min(15000,subtotal); 
  
  return <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#FFFFFF]"><header className="flex h-20 items-center gap-5 border-b border-[#F97316]/55 bg-[#0F172A] px-7 text-white"><Back onClick={back} dark/><h1 className="text-2xl font-black">Giỏ hàng của bạn</h1></header><div className="min-h-0 flex flex-1 gap-6 p-6"><div className="relative w-[60%] overflow-hidden rounded-3xl border border-[#CBD5E1] bg-white shadow-inner"><div className="absolute right-0 top-4 h-[88%] w-1 rounded-full bg-[#F97316]/60"/><div className="h-full overflow-y-auto p-5 pr-8 [scrollbar-width:none]">{items.map(item=><div key={item.id} className="mb-4 flex gap-5 rounded-2xl border border-[#CBD5E1] bg-white p-4 shadow-sm hover:border-[#F97316]/50 transition-colors"><div className={`h-24 w-24 shrink-0 rounded-2xl ${item.tone}`}/><div className="flex flex-1 flex-col"><h3 className="text-lg font-extrabold text-[#0F172A]">{item.name}</h3><b className="mt-1 text-xl text-[#F97316]">{formatMoney(item.price)}</b><div className="mt-auto flex items-center justify-between"><div className="flex overflow-hidden rounded-xl border border-[#CBD5E1]"><button onClick={()=>update(item.id,-1)} className="h-10 w-10 hover:bg-[#F1F5F9] transition-colors">−</button><span className="flex h-10 w-10 items-center justify-center border-x border-[#CBD5E1] font-black">{item.qty}</span><button onClick={()=>update(item.id,1)} className="h-10 w-10 hover:bg-[#F1F5F9] transition-colors">+</button></div><button onClick={()=>remove(item.id)} className="flex items-center gap-2 text-sm font-bold text-[#DC2626] hover:opacity-75"><Trash2 size={17}/> Xóa</button></div></div></div>)}</div></div><aside className="w-[40%]"><div className="sticky top-0 rounded-3xl border border-[#F97316]/65 bg-white/88 p-6 shadow-[0_16px_32px_rgba(17,17,17,.12)] backdrop-blur-xl"><div className="mb-5 flex items-center gap-3"><GoldIcon className="h-11 w-11"><ShoppingBag size={21}/></GoldIcon><h2 className="text-2xl font-black">Hóa đơn mini</h2></div>{[["Tạm tính",subtotal],["Thuế",tax],["Giảm giá",-discount]].map(([l,v])=><div key={String(l)} className="mb-3 flex justify-between text-base"><span className="text-[#475569]">{l}</span><b>{formatMoney(Number(v))}</b></div>)}<div className="my-5 border-t border-dashed border-[#CBD5E1]"/><div className="flex items-end justify-between"><span className="text-lg font-black">Tổng cộng</span><b className="text-3xl text-[#EA580C]">{formatMoney(cartTotal)}</b></div><button onClick={()=>setConfirm(true)} className="mt-7 flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-[#F97316] bg-[#F97316] text-xl font-black text-[#0F172A] shadow-[0_0_20px_rgba(249,115,22,.35)] hover:scale-[1.02] active:scale-95 transition-transform">Thanh toán <ArrowRight/></button></div></aside></div>{confirm&&<Modal><h2>Xác nhận thanh toán giỏ hàng này?</h2><p className="mt-2 text-[#475569] text-base font-semibold">Đơn hàng của bạn sẽ được chuyển tới bước chọn phương thức.</p><div className="mt-6 flex gap-3"><button onClick={()=>setConfirm(false)} className="flex-1 rounded-xl border border-[#CBD5E1] py-3 font-bold hover:bg-[#F1F5F9]">Hủy</button><button onClick={()=>{setConfirm(false);setMethods(true)}} className="flex-1 rounded-xl bg-[#F97316] py-3 font-black shadow-md">Đồng ý</button></div></Modal>}{methods&&<Modal><h2>Chọn phương thức thanh toán</h2><div className="mt-6 grid grid-cols-3 gap-3">{[[QrCode,"QR Code"],[CreditCard,"Thẻ ngân hàng"],[Wallet,"Ví điện tử"]].map(([Icon,label])=>{const I=Icon as typeof QrCode;return <button key={String(label)} onClick={()=>go("home")} className="flex h-32 flex-col items-center justify-center gap-3 rounded-2xl border border-[#CBD5E1] hover:border-[#F97316] bg-white font-bold hover:bg-[#FFF7ED] transition-colors"><GoldIcon className="h-12 w-12"><I size={22}/></GoldIcon>{String(label)}</button>})}</div><button onClick={()=>setMethods(false)} className="mt-5 w-full text-sm font-bold text-[#475569] hover:text-[#0F172A]">Quay lại</button></Modal>}</section>;
}
function Modal({children}:{children:React.ReactNode}){return <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-8 backdrop-blur-sm"><div className="w-full max-w-[520px] rounded-3xl border border-[#F97316] bg-white p-8 shadow-[0_0_32px_rgba(249,115,22,.35)]"><div className="text-center text-2xl font-black text-[#0F172A] [&>h2]:text-2xl">{children}</div></div></div>}

function Account({ logout, authenticated, onSignIn, navigate, cartCount, cartTotal }: { logout:()=>void; authenticated:boolean; onSignIn:()=>void; navigate:(screen:Screen)=>void; cartCount: number; cartTotal: number; }) {
  const [notice, setNotice] = useState("");
  const points = 1240; const progress = 62;
  
  return <section className="relative flex h-full min-h-0 overflow-hidden bg-[#FFFFFF]">
    <TopStatusBar isAbsolute onHelp={() => setNotice("Yêu cầu hỗ trợ đã được gửi tới nhân viên gần nhất.")} />
    
    <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <MiniCartButton onClick={() => navigate("cart")} count={cartCount} total={cartTotal} className="absolute right-7 top-12" />
      
      <div className="mx-auto max-w-5xl"><div className="mb-5"><p className="text-xs font-black uppercase tracking-[.17em] text-[#EA580C]">Phiên mua sắm hiện tại</p><h1 className="mt-1 text-3xl font-black text-[#0F172A]">Tài khoản</h1></div>{notice&&<div className="mb-4 flex items-center justify-between rounded-xl border border-[#F97316] bg-[#F1F5F9] px-4 py-3 text-sm font-bold"><span>{notice}</span><button onClick={()=>setNotice("")}><X size={17}/></button></div>}
        {authenticated ? <div className="grid grid-cols-[.9fr_1.1fr] gap-6"><div className="space-y-5"><section className="rounded-3xl border border-[#F97316]/65 bg-[#0F172A] p-7 text-white shadow-[0_0_24px_rgba(249,115,22,.16)]"><div className="flex items-center gap-5"><GoldIcon className="h-20 w-20 rounded-full"><span className="text-2xl font-black">AN</span></GoldIcon><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#F97316]">HẠNG THÀNH VIÊN - GOLD</p><h2 className="mt-2 text-3xl font-black">Anh Nguyễn</h2><p className="mt-1 text-sm text-[#CBD5E1]">Mã thành viên · SC-102984</p></div></div><p className="mt-7 border-t border-white/15 pt-4 text-sm italic text-[#CBD5E1]">Vui lòng sử dụng App di động để cập nhật thông tin cá nhân</p></section><section className="rounded-3xl border border-[#F97316]/65 bg-white/92 p-6 shadow-[0_12px_26px_rgba(17,17,17,.08)]"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#EA580C]">Smart Points</p><h2 className="mt-1 text-3xl font-black text-[#0F172A]">{points.toLocaleString("vi-VN")} <span className="text-base">điểm</span></h2></div><GoldIcon className="h-12 w-12"><Sparkles size={23}/></GoldIcon></div><div className="mt-6"><div className="mb-2 flex justify-between text-sm font-bold"><span className="text-[#475569]">Gold</span><span className="text-[#EA580C]">{progress}%</span></div><div className="h-3 overflow-hidden rounded-full bg-[#F1F5F9]"><div className="h-full rounded-full bg-[#F97316] shadow-[0_0_12px_rgba(249,115,22,.6)]" style={{width:`${progress}%`}}/></div><div className="mt-3 flex justify-between text-xs font-extrabold"><span className="text-[#475569]">Silver</span><span className="text-[#EA580C]">Gold</span><span className="text-[#475569]">Platinum</span></div><p className="mt-4 rounded-xl bg-[#F1F5F9] px-3 py-2 text-sm font-bold text-[#0F172A]">Còn <span className="text-[#EA580C]">760 điểm</span> để lên hạng Platinum</p></div></section></div><section className="rounded-3xl border border-[#CBD5E1] bg-white p-6 shadow-[0_10px_24px_rgba(17,17,17,.06)]"><p className="text-xs font-black uppercase tracking-[.16em] text-[#EA580C]">Dịch vụ trong phiên</p><h2 className="mt-1 text-2xl font-black text-[#0F172A]">Mua sắm của bạn</h2><div className="mt-6 space-y-4"><button onClick={()=>setNotice("Lịch sử mua hàng đã sẵn sàng để xem.")} className="flex min-h-[94px] w-full items-center gap-4 rounded-2xl border border-[#CBD5E1] bg-white px-5 text-left hover:border-[#F97316] hover:bg-[#F1F5F9] transition-colors"><GoldIcon className="h-12 w-12"><History size={22}/></GoldIcon><span><span className="block text-lg font-extrabold text-[#0F172A]">Lịch sử mua hàng</span><span className="block text-sm text-[#475569]">Xem lại các đơn hàng đã hoàn tất</span></span><ChevronRight className="ml-auto text-[#EA580C]"/></button><button onClick={()=>setNotice("Mã giảm giá tốt nhất đã được tự động trừ vào giỏ hàng.")} className="flex min-h-[112px] w-full items-center gap-4 rounded-2xl border border-[#CBD5E1] bg-[#FFFFFF] px-5 text-left hover:border-[#F97316] hover:bg-[#F1F5F9] transition-colors"><GoldIcon className="h-12 w-12"><Gift size={22}/></GoldIcon><span><span className="flex items-center gap-2 text-lg font-extrabold text-[#0F172A]">Ưu đãi đang áp dụng <Check className="text-[#EA580C]" size={20}/></span><span className="mt-1 block text-sm font-medium leading-relaxed text-[#EA580C]">Hệ thống đã tự động chọn &amp; trừ mã giảm giá tốt nhất vào giỏ hàng</span></span><ChevronRight className="ml-auto text-[#EA580C]"/></button></div><button onClick={logout} className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#DC2626] bg-[#FEF2F2] text-lg font-black text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"><ArrowLeft size={20}/>Đăng xuất tài khoản</button></section></div> : <section className="mx-auto max-w-lg rounded-3xl border border-[#F97316]/65 bg-[#0F172A] p-8 text-center text-white shadow-[0_0_24px_rgba(249,115,22,.16)]"><GoldIcon className="mx-auto h-16 w-16 rounded-full"><UserRound size={30}/></GoldIcon><h2 className="mt-5 text-2xl font-black">Khách mua sắm</h2><p className="mt-2 text-[#CBD5E1]">Đăng nhập để xem điểm tích lũy, quyền lợi và ưu đãi cá nhân.</p><button onClick={onSignIn} className="mt-6 rounded-xl bg-[#F97316] px-6 py-3 font-black text-[#0F172A]">Đăng nhập</button></section>}</div>
    </div>
  </section>;
}

export default function App() {
  const [screen, setScreenState] = useState<Screen>("splash");
  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [activeCategory, setActiveCategory] = useState<string>("Thực phẩm tươi");
  
  const [authenticated, setAuthenticated] = useState(false);
  const [items, setItems] = useState<Item[]>([{id:1,name:"Sữa Tươi Vinamilk 1L",price:36000,oldPrice:45000,qty:1,tone:"bg-[#F97316]",category:"Mẹ & Bé"},{id:2,name:"Thịt Bò Úc 500g",price:100000,oldPrice:150000,qty:1,tone:"bg-[#0F172A]",category:"Thực phẩm tươi"},{id:3,name:"Mì Gói Hảo Hảo",price:4000,qty:2,tone:"bg-[#F97316]",category:"Đồ khô"}]);
  
  const setScreen = (newScreen: Screen) => {
    if (newScreen !== "cart") setPrevScreen(screen);
    setScreenState(newScreen);
  };

  const back = () => {
    if (screen === "login") setScreenState("splash");
    else if (screen === "cart") setScreenState(prevScreen);
    else setScreenState("home");
  };

  const goToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    setScreen("category");
  };

  const add = (p: Omit<Item,"id"|"qty">) => setItems(a => a.some(x=>x.name===p.name) ? a.map(x=>x.name===p.name ? {...x,qty:x.qty+1} : x) : [...a,{...p,id:Date.now(),qty:1}]);
  const update = (id:number, d:number) => setItems(a => a.map(x=>x.id===id ? {...x,qty:Math.max(1,x.qty+d)} : x));
  const remove = (id:number) => setItems(a => a.filter(x=>x.id!==id));

  const cartCount = useMemo(() => items.reduce((s,x)=>s+x.qty,0), [items]);
  const subtotal = useMemo(() => items.reduce((s,x)=>s+x.price*x.qty,0), [items]);
  const cartTotal = useMemo(() => subtotal + Math.round(subtotal*.03) - Math.min(15000,subtotal), [subtotal]);

  const renderScreen = () => {
    switch (screen) {
      case "splash": return <Splash start={() => setScreen("login")} />;
      case "login": return <Login back={back} continueAsGuest={() => { setAuthenticated(false); setScreen("home"); }} onPhoneLogin={() => { setAuthenticated(true); window.alert("Đăng nhập bằng Số điện thoại thành công."); setScreen("home"); }} />;
      case "home": return <HomeScreen cartCount={cartCount} cartTotal={subtotal} add={add} go={setScreen} items={items} update={update} remove={remove} onSelectCategory={goToCategory} />;
      case "category": return <CategoryScreen categoryName={activeCategory} cartCount={cartCount} cartTotal={subtotal} add={add} go={setScreen} items={items} update={update} remove={remove} back={back} />;
      case "map": return <MapAI back={back} go={setScreen} cartCount={cartCount} cartTotal={subtotal} />;
      case "cart": return <CartScreen items={items} update={update} remove={remove} go={setScreen} back={back} subtotal={subtotal} cartTotal={cartTotal} />;
      case "account": return <Account authenticated={authenticated} navigate={setScreen} onSignIn={() => setScreen("login")} logout={() => { setAuthenticated(false); setScreen("splash"); }} cartCount={cartCount} cartTotal={subtotal} />;
      default: return null;
    }
  };

  const showNav = !["splash", "login", "cart"].includes(screen);

  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-[#FFFFFF] text-[#0F172A]">
      <div className="mx-auto flex h-full max-w-[1366px] flex-col overflow-hidden">
        {renderScreen()}
        {showNav && <BottomNav active={screen} onChange={setScreen} cartCount={cartCount} />}
      </div>
    </main>
  );
}