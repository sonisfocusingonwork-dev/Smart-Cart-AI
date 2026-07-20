import React, { useMemo, useState, useEffect, useRef } from "react";
import { Bot, Map, Search, X, Circle, CheckCircle2 } from "lucide-react";
import {
  getCheckoutSummary,
  formatMoney,
  PRODUCTS,
  USER_MAP_POINT,
  STORE_LOCATIONS,
  normalizeLookup,
  scoreStoreLocation,
  searchStoreLocations,
  findStoreLocation,
  GoldIcon,
  TopStatusBar,
  MiniCartButton,
  QuickListButton,
} from "../shared";
import type {
  Screen,
  Item,
  ShoppingListItem,
  StoreProductLocation,
  AssistantMessage,
} from "../shared";

export function MapScreen({
  go,
  cartCount,
  cartTotal,
  items,
  showListPopup,
  toggleListPopup,
  manualList,
  toggleCheckItem,
  addNewManualItem,
  pendingNavTarget,
  setPendingNavTarget,
}: {
  go: (s: Screen) => void;
  cartCount: number;
  cartTotal: number;
  items: Item[];
  showListPopup: boolean;
  toggleListPopup: () => void;
  manualList: ShoppingListItem[];
  toggleCheckItem: (idx: number) => void;
  addNewManualItem: (name: string) => void;
  pendingNavTarget?: StoreProductLocation | null;
  setPendingNavTarget?: (t: StoreProductLocation | null) => void;
}) {
  const [chat, setChat] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Xin chào! Tôi có thể tìm chính xác sản phẩm, chỉ đường theo bản đồ, kiểm tra ưu đãi và gợi ý món ăn phù hợp.",
    },
  ]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<StoreProductLocation | null>(
    null,
  );
  const [pendingRoute, setPendingRoute] = useState<StoreProductLocation | null>(
    null,
  );
  const [localInput, setLocalInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const searchResults = useMemo(
    () => (searchQuery.trim() ? searchStoreLocations(searchQuery, 6) : []),
    [searchQuery],
  );

  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, chat]);

  const newMessage = (
    role: AssistantMessage["role"],
    text: string,
  ): AssistantMessage => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
  });

  const findProductRecord = (location: StoreProductLocation) =>
    PRODUCTS.find((product) => {
      const productName = normalizeLookup(product.name);
      return (
        productName === normalizeLookup(location.name) ||
        location.aliases.some(
          (alias) =>
            productName.includes(normalizeLookup(alias)) ||
            normalizeLookup(alias).includes(productName),
        )
      );
    });

  const describeLocation = (location: StoreProductLocation) =>
    `${location.name} nằm tại ${location.zone}, ${location.shelf}.`;

  type RouteSource = "manual" | "ai";

  const activateRoute = (
    location: StoreProductLocation,
    source: RouteSource = "manual",
  ) => {
    setActiveRoute(location);
    setPendingRoute(location);
    setSelectedZone(null);
    setSearchOpen(false);

    if (source === "manual") {
      setChat(false);
      return;
    }

    setMessages((previous) => [
      ...previous,
      newMessage(
        "assistant",
        `Đã bật chỉ đường tới ${location.name} tại ${location.zone}, ${location.shelf}. Hãy đi theo đường nét đứt màu cam trên bản đồ.`,
      ),
    ]);
  };

  useEffect(() => {
    if (pendingNavTarget) {
      activateRoute(pendingNavTarget, "manual");
      if (setPendingNavTarget) setPendingNavTarget(null);
    }
  }, [pendingNavTarget]);

  const selectZoneFromMap = (zone: string) => {
    const hasProducts = STORE_LOCATIONS.some(
      (location) => location.zone === zone && location.kind === "product"
    );

    if (!hasProducts) {
      const serviceLocation = STORE_LOCATIONS.find(
        (location) => location.zone === zone && location.kind === "service"
      );
      if (serviceLocation) {
        activateRoute(serviceLocation, "manual");
      }
      setSelectedZone(null);
    } else {
      setSelectedZone(zone);
    }
    setSearchOpen(false);
    setChat(false);
  };

  const handleMapSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const location = findStoreLocation(searchQuery);
    if (location) {
      activateRoute(location, "manual");
      return;
    }
    setChat(false);
    setPendingRoute(null);
    setSearchOpen(true);
  };

  const getDiscountReply = () => {
    const mapSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.qty,
      0,
    );
    const summary = getCheckoutSummary(mapSubtotal, items, "Gold");
    const saleProducts = PRODUCTS.filter(
      (product) => product.oldPrice && product.oldPrice > product.price,
    ).slice(0, 4);
    const productPromotions = saleProducts
      .map(
        (product) =>
          `• ${product.name}: tiết kiệm ${formatMoney((product.oldPrice ?? product.price) - product.price)}`,
      )
      .join("\n");
    const voucherText = summary.appliedVoucher
      ? `• Mã phù hợp nhất: ${summary.appliedVoucher.code} — giảm ${formatMoney(summary.discount)}.`
      : "• Giỏ hiện tại chưa đủ điều kiện cho mã giảm tiền.";
    const pointsText =
      summary.pointsMultiplier > 1
        ? `• Smart Points đang được nhân ${summary.pointsMultiplier}.`
        : "• Smart Points được tích theo giá trị thanh toán.";
    return `Ưu đãi đang áp dụng cho phiên mua sắm:\n${voucherText}\n${pointsText}\n${productPromotions}\nHệ thống chỉ áp dụng mã còn hạn và đủ điều kiện; câu hỏi này không bật chỉ đường.`;
  };

  const getRecipeReply = (request: string) => {
    const cartNames = items.map((item) => normalizeLookup(item.name));
    const hasInCart = (term: string) =>
      cartNames.some((name) => name.includes(normalizeLookup(term)));
    const normalizedRequest = normalizeLookup(request);

    if (hasInCart("thịt bò") || normalizedRequest.includes("bo")) {
      return "Gợi ý phù hợp: Bò xào rau củ. Bạn đã có thịt bò; có thể mua thêm cà rốt, rau cải xanh và dầu ăn. Thời gian nấu khoảng 20 phút. Hãy hỏi “cà rốt ở đâu?” nếu cần tôi tìm nguyên liệu.";
    }
    if (hasInCart("cá hồi") || normalizedRequest.includes("ca hoi")) {
      return "Gợi ý phù hợp: Cá hồi áp chảo kèm salad. Cần cá hồi, cà chua bi, rau xanh và một ít gia vị. Món này nhẹ, dễ làm và phù hợp cho bữa tối.";
    }
    if (hasInCart("mì") || normalizedRequest.includes("an sang")) {
      return "Gợi ý nhanh: Mì trộn rau củ và trứng. Có thể kết hợp Mì Hảo Hảo với rau cải, cà rốt và trứng; thời gian chuẩn bị khoảng 10–15 phút.";
    }
    return "Tôi gợi ý 3 lựa chọn cho bữa tối:\n• Bò xào rau củ — nhanh, đủ đạm và rau.\n• Cá hồi áp chảo cùng salad — nhẹ và dễ ăn.\n• Mì xào rau củ — tiết kiệm thời gian.\nBạn có thể chọn một món, sau đó hỏi vị trí từng nguyên liệu để tôi chỉ đường chính xác.";
  };

  const ask = async (rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;

    setChat(true);
    setPrompt("");
    setMessages((previous) => [...previous, newMessage("user", value)]);

    const normalizedValue = normalizeLookup(value);

    // 1. Kiểm tra ưu đãi / khuyến mãi
    if (
      normalizedValue.includes("uu dai") ||
      normalizedValue.includes("giam gia") ||
      normalizedValue.includes("khuyen mai")
    ) {
      setTimeout(() => {
        setMessages((previous) => [
          ...previous,
          newMessage("assistant", getDiscountReply()),
        ]);
      }, 500);
      return;
    }

    // 2. Kiểm tra gợi ý món ăn / công thức
    if (
      normalizedValue.includes("mon") ||
      normalizedValue.includes("nau") ||
      normalizedValue.includes("cong thuc") ||
      normalizedValue.includes("goi y")
    ) {
      setTimeout(() => {
        setMessages((previous) => [
          ...previous,
          newMessage("assistant", getRecipeReply(value)),
        ]);
      }, 500);
      return;
    }

    // 3. Tìm sản phẩm
    const location = findStoreLocation(value);
    if (location) {
      setTimeout(() => {
        activateRoute(location, "ai");
      }, 500);
      return;
    }

    // 4. Mặc định
    setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        newMessage(
          "assistant",
          "Xin lỗi, tôi chưa hiểu hoặc không tìm thấy thông tin bạn cần. Vui lòng thử từ khóa ngắn gọn hơn (ví dụ: 'thịt bò', 'gợi ý món ăn', 'ưu đãi').",
        ),
      ]);
    }, 500);
  };

  const openHelpChat = () => {
    setChat(true);
    setPendingRoute(null);
    setMessages((previous) => [
      ...previous,
      newMessage(
        "assistant",
        "Yêu cầu hỗ trợ đã được gửi tới nhân viên gần nhất. Trong lúc chờ, tôi vẫn có thể giúp bạn tìm sản phẩm hoặc hướng dẫn tới quầy thanh toán.",
      ),
    ]);
  };

  const selectedZoneLocations = selectedZone
    ? STORE_LOCATIONS.filter((location) => location.zone === selectedZone && location.kind === "product")
    : [];

  const Block = ({
    x,
    y,
    label,
    zone,
    w = 170,
    h = 32,
  }: {
    x: number;
    y: number;
    label: string;
    zone?: string;
    w?: number;
    h?: number;
  }) => {
    const highlighted = Boolean(
      zone && (selectedZone === zone || activeRoute?.zone === zone),
    );
    const fillColor = highlighted ? "#D1FAE5" : "#FFFFFF";
    const strokeColor = "#15803D";
    const textColor = "#334155";
    
    return (
      <g
        transform={`translate(${x} ${y}) scale(0.98)`}
        filter="url(#isoShadow)"
        className={zone ? "cursor-pointer" : ""}
        onClick={() => {
          if (zone) selectZoneFromMap(zone);
        }}
      >
        <polygon
          points={`0,18 ${w},18 ${w + 24},0 24,0`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        <polygon
          points={`${w},18 ${w + 24},0 ${w + 24},${h - 10} ${w},${h + 7}`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        <polygon
          points={`0,18 ${w},18 ${w},${h + 7} 0,${h + 7}`}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        <text
          x={w / 2 + 12}
          y={36}
          textAnchor="middle"
          fill={textColor}
          fontSize="13"
          fontWeight="800"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <section
      className="flex flex-col h-full overflow-hidden bg-[#FFFFFF]"
      aria-label="Bản đồ siêu thị isometric"
    >
      {/* HEADER SECTION */}
      <div className="shrink-0 flex flex-col z-40 bg-[#F5F5E6] border-b border-[#15803D]/20 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
        {/* Top status bar (now flows naturally) */}
        <TopStatusBar onHelp={openHelpChat} />
        
        {/* Navigation & Controls Bar */}
        <div className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between gap-4 relative">
          {/* Left Title */}
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F5F5E6] shadow-sm border border-[#E2E8F0] text-[#15803D] shadow-sm">
              <Map size={18} />
            </span>
            <div className="hidden sm:block">
              <h1 className="text-xs font-black tracking-wider text-[#334155] uppercase">Sơ Đồ Siêu Thị</h1>
              <span className="text-[10px] text-[#15803D] font-bold block leading-none">2.5D INTERACTIVE MAP</span>
            </div>
          </div>

          {/* Center Search Form */}
          <form
            onSubmit={handleMapSearch}
            className="flex-1 max-w-[460px] relative rounded-2xl border border-[#15803D]/50 bg-[#F8FAFC] p-1 focus-within:border-[#15803D] focus-within:ring-2 focus-within:ring-[#D3524B]/10 transition-all"
          >
            <div className="flex h-9 items-center gap-2.5 px-3">
              <Search size={16} className="text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => window.setTimeout(() => setSearchOpen(false), 120)}
                placeholder="Tìm sản phẩm, thương hiệu hoặc khu vực..."
                className="h-full min-w-0 flex-1 bg-transparent text-xs font-semibold text-[#334155] outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="rounded-2xl bg-[#15803D] shadow-md px-3 py-1.5 text-[10px] font-black text-white hover:bg-[#15803D] transition-colors"
              >
                Tìm đường
              </button>
            </div>
            
            {/* Search Dropdown list */}
            {searchOpen && searchQuery.trim() && (
              <div className="absolute inset-x-0 top-11 max-h-64 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-sm border border-[#E2E8F0] p-1.5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] z-50 [scrollbar-width:none]">
                {searchResults.length > 0 ? (
                  searchResults.map((location) => (
                    <button
                      type="button"
                      key={location.id}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setSearchQuery(location.name);
                        activateRoute(location, "manual");
                      }}
                      className="flex w-full items-center gap-2 rounded-2xl px-2.5 py-2 text-left hover:bg-[#FFF7ED] transition-colors"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-[#F5F5E6] text-[#15803D]">
                        <Map size={13} />
                      </span>
                      <span className="min-w-0">
                        <b className="block truncate text-xs text-[#334155]">
                          {location.name}
                        </b>
                        <span className="block truncate text-[10px] font-semibold text-[#64748B]">
                          {location.zone} · {location.shelf}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-center text-xs font-bold text-[#64748B]">
                    Không tìm thấy sản phẩm phù hợp.
                  </p>
                )}
              </div>
            )}
          </form>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">
            <QuickListButton onClick={toggleListPopup} />
            <MiniCartButton
              onClick={() => go("cart")}
              count={cartCount}
              total={cartTotal}
            />
            
            {/* Shopping List Popup */}
            {showListPopup && (
              <div className="absolute right-6 top-14 z-50 w-[310px] rounded-3xl border border-[#15803D] bg-[#FEF9ED] p-5 text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] ">
                <div className="mb-3 flex items-center justify-between border-b border-[#15803D]/30 pb-2">
                  <span className="text-base font-black italic tracking-widest text-[#15803D]">
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
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!localInput.trim()) return;
                    addNewManualItem(localInput.trim());
                    setLocalInput("");
                  }}
                  className="mb-3 flex gap-1.5"
                >
                  <input
                    value={localInput}
                    onChange={(event) => setLocalInput(event.target.value)}
                    placeholder="Thêm việc cần mua..."
                    className="h-8 flex-1 rounded-2xl border border-[#E2E8F0] bg-white px-2.5 text-xs font-bold outline-none focus:border-[#15803D]"
                  />
                  <button className="h-8 rounded-2xl bg-[#15803D] shadow-md px-3 text-xs font-black text-white">
                    +
                  </button>
                </form>
                <div className="max-h-52 space-y-2 overflow-y-auto [scrollbar-width:none]">
                  {manualList.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      onClick={() => toggleCheckItem(index)}
                      className="flex cursor-pointer items-center justify-between border-b border-black/10 pb-1.5 group"
                    >
                      <div className="flex items-center gap-2.5">
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
                          className={`text-xs font-extrabold ${item.checked ? "text-[#94A3B8] line-through" : "text-[#334155]"}`}
                        >
                          {item.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAP BODY SECTION */}
      <div className="flex-1 min-h-0 relative bg-white">
        <svg
          className="h-full w-full p-4"
          viewBox="0 0 1360 760"
          preserveAspectRatio="xMidYMid meet"
          role="img"
        >
        <defs>
          <filter id="isoShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="4"
              dy="4"
              stdDeviation="0"
              floodColor="#334155"
              floodOpacity="0.04"
            />
          </filter>
          <pattern
            id="floorGrid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M32 0H0V32"
              stroke="#CBD5E1"
              strokeWidth="1"
              fill="none"
              opacity=".7"
            />
          </pattern>
        </defs>
        <rect
          x="42"
          y="42"
          width="1276"
          height="650"
          rx="24"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="3"
        />
        <rect
          x="42"
          y="42"
          width="1276"
          height="650"
          rx="24"
          fill="url(#floorGrid)"
        />
        <g fill="none" stroke="#15803D" strokeWidth="2" opacity=".25">
          <path d="M338 65V668M970 65V668M65 225H1295M65 520H1295" />
        </g>
        <text
          x="76"
          y="84"
          fill="#15803D"
          fontSize="14"
          fontWeight="900"
          letterSpacing="2"
        >
          SƠ ĐỒ SIÊU THỊ · 2.5D FLOOR PLAN
        </text>
        <g filter="url(#isoShadow)">
          <rect
            x="76"
            y="548"
            width="108"
            height="104"
            rx="12"
            fill={activeRoute?.zone === "Lối vào" ? "#D1FAE5" : "#FFFFFF"}
            stroke="#15803D"
            strokeWidth={2}
            onClick={() => selectZoneFromMap("Lối vào")}
            className="cursor-pointer"
          />
          <rect
            x="202"
            y="548"
            width="108"
            height="104"
            rx="12"
            fill={activeRoute?.zone === "Lối ra" ? "#D1FAE5" : "#FFFFFF"}
            stroke="#15803D"
            strokeWidth={2}
            onClick={() => selectZoneFromMap("Lối ra")}
            className="cursor-pointer"
          />
          <rect
            onClick={() => selectZoneFromMap("Trạm Xe Đẩy AI")}
            className="cursor-pointer"
            x="76"
            y="286"
            width="234"
            height="92"
            rx="14"
            fill={
              activeRoute?.zone === "Trạm Xe Đẩy AI" ? "#D1FAE5" : "#FFFFFF"
            }
            stroke="#15803D"
            strokeWidth={2}
          />
        </g>
        <g fill="#334155" fontWeight="800" textAnchor="middle">
          <text x="130" y="602" fontSize="15">
            LỐI VÀO
          </text>
          <text x="256" y="602" fontSize="15">
            LỐI RA
          </text>
          <text x="193" y="332" fontSize="16">
            TRẠM XE ĐẨY AI
          </text>
          <text x="193" y="354" fontSize="11" fill="#15803D">
            KHU SẠC &amp; NHẬN XE
          </text>
        </g>
        <g stroke="#15803D" strokeWidth="3">
          <path d="M99 621h62M225 621h62" />
        </g>
        <text x="530" y="112" fill="#15803D" fontSize="18" fontWeight="900">
          HÀNG TƯƠI SỐNG
        </text>
        <Block x={390} y={138} label="RAU CỦ" zone="Rau củ" w={155} />
        <Block x={575} y={138} label="TRÁI CÂY" zone="Trái cây" w={155} />
        <Block x={760} y={138} label="THỊT & CÁ" zone="Thịt & Cá" w={155} />
        <text x="1090" y="112" fill="#15803D" fontSize="18" fontWeight="900">
          ĐÔNG LẠNH
        </text>
        <Block x={1000} y={138} label="TỦ MÁT" zone="Tủ mát" w={235} h={66} />
        <Block x={1000} y={225} label="TỦ ĐÔNG" zone="Tủ đông" w={235} h={66} />
        <Block
          x={1000}
          y={312}
          label="KHO LẠNH"
          zone="Kho lạnh"
          w={235}
          h={66}
        />
        <text x="600" y="278" fill="#15803D" fontSize="18" fontWeight="900">
          THỰC PHẨM KHÔ &amp; ĐỒ UỐNG
        </text>
        <Block
          x={392}
          y={306}
          label="MÌ · GẠO · GIA VỊ"
          zone="Mì · Gạo · Gia vị"
          w={235}
          h={46}
        />
        <Block x={637} y={306} label="ĐỒ UỐNG" zone="Đồ uống" w={235} h={46} />
        <Block
          x={392}
          y={377}
          label="ĐỒ UỐNG · BÁNH KẸO"
          zone="Đồ uống · Bánh kẹo"
          w={480}
          h={46}
        />
        <Block
          x={392}
          y={448}
          label="ĐỒ HỘP · HÓA MỸ PHẨM"
          zone="Đồ hộp · Hóa mỹ phẩm"
          w={480}
          h={46}
        />
        <Block
          x={392}
          y={519}
          label="ĐỒ GIA DỤNG"
          zone="Đồ gia dụng"
          w={480}
          h={46}
        />
        <g filter="url(#isoShadow)">
          <rect
            onClick={() => selectZoneFromMap("Quầy Thu Ngân")}
            className="cursor-pointer"
            x="1000"
            y="482"
            width="244"
            height="170"
            rx="16"
            fill={activeRoute?.zone === "Quầy Thu Ngân" ? "#D1FAE5" : "#FFFFFF"}
            stroke="#15803D"
            strokeWidth={2}
          />
          <rect
            x="1018"
            y="532"
            width="55"
            height="82"
            rx="8"
            fill="#FFFFFF"
            stroke="#15803D"
            strokeWidth="2"
          />
          <rect
            x="1092"
            y="532"
            width="55"
            height="82"
            rx="8"
            fill="#FFFFFF"
            stroke="#15803D"
            strokeWidth="2"
          />
          <rect
            x="1166"
            y="532"
            width="55"
            height="82"
            rx="8"
            fill="#FFFFFF"
            stroke="#15803D"
            strokeWidth="2"
          />
        </g>
        <g fill="#334155" fontWeight="800" textAnchor="middle">
          <text x="1122" y="516" fontSize="17">
            QUẦY THU NGÂN
          </text>
          <text x="1045" y="579" fontSize="12">
            01
          </text>
          <text x="1119" y="579" fontSize="12">
            02
          </text>
          <text x="1193" y="579" fontSize="12">
            03
          </text>
        </g>

        {activeRoute && (
          <g filter="url(#isoShadow)">
            <polyline
              points={activeRoute.path
                .map((point) => `${point.x},${point.y}`)
                .join(" ")}
              fill="none"
              stroke="#15803D"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="15 12"
            />
            <circle
              cx={activeRoute.point.x}
              cy={activeRoute.point.y}
              r="19"
              fill="#15803D"
              stroke="#FFFFFF"
              strokeWidth="4"
            />
            <text
              x={activeRoute.point.x}
              y={activeRoute.point.y + 4}
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="900"
              textAnchor="middle"
            >
              ĐÍCH
            </text>
          </g>
        )}
        <g transform={`translate(${USER_MAP_POINT.x} ${USER_MAP_POINT.y})`}>
          <ellipse cy="31" rx="29" ry="8" fill="#15803D" opacity=".2" />
          <circle r="22" fill="#15803D" stroke="#FFF" strokeWidth="4" />
          <circle r="6" fill="#FFF" />
          <rect x="-28" y="29" width="56" height="22" rx="11" fill="#15803D" />
          <text
            x="0"
            y="44"
            fill="#FFF"
            fontSize="12"
            fontWeight="800"
            textAnchor="middle"
          >
            Bạn
          </text>
        </g>
      </svg>

      {selectedZone && (
        <div className="absolute bottom-7 left-7 z-30 w-[370px] overflow-hidden rounded-3xl border border-[#15803D] bg-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] ">
          <div className="flex items-center justify-between bg-[#F5F5E6] px-5 py-3 text-[#334155]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#15803D]">
                Danh mục khu vực
              </p>
              <h2 className="text-lg font-black">{selectedZone}</h2>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="rounded-2xl p-2 hover:bg-white"
              aria-label="Đóng danh mục"
            >
              <X size={19} />
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-4 [scrollbar-width:none]">
            <div className="grid grid-cols-2 gap-2">
              {selectedZoneLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => activateRoute(location, "manual")}
                  className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-3 text-left hover:border-[#15803D] hover:bg-[#FFF7ED]"
                >
                  <span className="block text-sm font-black text-[#334155]">
                    {location.name}
                  </span>
                  <span className="mt-1 block text-[10px] font-bold text-[#64748B]">
                    {location.shelf}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selectedZone && activeRoute && (
        <div className="absolute bottom-7 left-7 z-30 w-[370px] rounded-3xl border border-[#15803D] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] ">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F5F5E6] text-[#15803D]">
              <Map size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#15803D]">
                Đang chỉ đường chính xác
              </p>
              <h2 className="mt-1 truncate text-lg font-black text-[#334155]">
                {activeRoute.name}
              </h2>
              <p className="mt-1 text-xs font-bold text-[#475569]">
                {activeRoute.zone} · {activeRoute.shelf}
              </p>
            </div>
            <button
              onClick={() => setActiveRoute(null)}
              className="rounded-2xl p-2 hover:bg-[#F1F5F9]"
              aria-label="Tắt chỉ đường"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}



      {chat && (
        <div className="absolute bottom-24 right-7 z-40 w-[390px] overflow-hidden rounded-3xl border border-[#15803D] bg-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] ">
          <div className="flex items-center gap-2 bg-[#F5F5E6] px-4 py-3 text-[#334155]">
            <GoldIcon className="h-8 w-8 rounded-2xl">
              <Bot size={17} />
            </GoldIcon>
            <div>
              <b className="block text-sm">Trợ lý Smart Cart AI</b>
              <span className="block text-[10px] font-semibold text-[#15803D]">
                ● Đã kết nối dữ liệu cửa hàng
              </span>
            </div>
            <button
              onClick={() => setChat(false)}
              className="ml-auto rounded-2xl p-1 hover:bg-white"
            >
              <X size={19} />
            </button>
          </div>
          <div
            ref={chatScrollRef}
            className="max-h-[270px] space-y-3 overflow-y-auto bg-[#F8FAFC] p-4 [scrollbar-width:none]"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm font-semibold leading-relaxed ${message.role === "user" ? "rounded-br-md bg-[#15803D] text-white" : "rounded-bl-md border border-[#E2E8F0] bg-white text-[#334155]"}`}
                >
                  {message.text}
                </p>
              </div>
            ))}
          </div>
          {isLoadingAI && (
              <div className="flex justify-start">
                <div className="flex space-x-1 rounded-bl-md border border-[#E2E8F0] bg-white px-3.5 py-3 text-[#334155] rounded-2xl">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
                </div>
              </div>
            )}
            {pendingRoute && activeRoute?.id !== pendingRoute.id && (
            <div className="flex gap-2 border-t border-[#E2E8F0] bg-white px-4 py-3">
              <button
                onClick={() => activateRoute(pendingRoute, "ai")}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#15803D] py-3 text-sm font-black text-white"
              >
                <Map size={17} />
                Chỉ đường tới {pendingRoute.name}
              </button>
              <button
                onClick={() => setPendingRoute(null)}
                className="rounded-2xl border border-[#E2E8F0] px-3 text-xs font-bold"
              >
                Để sau
              </button>
            </div>
          )}
          {pendingRoute && activeRoute?.id === pendingRoute.id && (
            <div className="mx-4 my-3 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-extrabold text-emerald-700">
              <CheckCircle2 size={17} /> Tuyến đường tới {pendingRoute.name}{" "}
              đang hiển thị.
            </div>
          )}
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {[
              "Mã giảm giá đang có?",
              "Thịt bò ở đâu?",
              "Gợi ý món ăn tối?",
              "Quầy thanh toán ở đâu?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => ask(suggestion)}
                className="rounded-full border border-[#15803D]/75 bg-[#FFF7ED] px-3 py-1.5 text-xs font-bold text-[#334155] hover:bg-[#FFEDD5]"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask(prompt);
            }}
            className="flex border-t border-[#E2E8F0] p-3"
          >
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Hỏi vị trí, ưu đãi hoặc món ăn..."
              className="h-10 min-w-0 flex-1 rounded-2xl bg-[#F1F5F9] px-3 text-sm outline-none focus:ring-2 focus:ring-[#D3524B]"
            />
            <button className="ml-2 rounded-2xl bg-[#15803D] shadow-md px-4 text-sm font-black text-white">
              Gửi
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setChat((value) => !value)}
        aria-label="Mở trợ lý AI"
        className="absolute bottom-7 right-7 z-30 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#15803D] bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-transform hover:scale-105"
      >
        <Bot size={30} />
      </button>
      </div>
    </section>
  );
}