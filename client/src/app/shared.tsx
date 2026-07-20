import React, { useState } from "react";
import {
  Apple,
  Baby,
  Battery,
  Bot,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Home,
  Map,
  Package,
  Phone,
  ShoppingCart,
  ShoppingBag,
  Sparkles,
  UserRound,
  Wifi,
  Wheat,
  X,
  CupSoda,
  CheckCircle2,
  FileText,
  AlertTriangle,
  RotateCcw,
  Send,
} from "lucide-react";

export type Screen =
  | "splash"
  | "login"
  | "home"
  | "map"
  | "cart"
  | "account"
  | "category"
  | "group"
  | "history"
  | "offers"
  | "admin"
  | "admin-login"
  | "invoice";
export type MemberCart = { member: string; cartId: string; tone: string };
export type Item = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  qty: number;
  tone: string;
  category?: string;
  addedBy?: string;
  barcode: string;
};

export interface Product {
  id: string;
  name: string;
  category:
    | "Hàng tươi sống"
    | "Thực phẩm khô & đồ uống"
    | "Đông lạnh"
    | "Gia vị"
    | "Đồ gia dụng"
    | "Mẹ & Bé"
    | "Hóa mỹ phẩm"
    | string;
  subCategory: string;
  price: number;
  quantity: number;
  revenue: number;
  stockLevel: number;
  lowStockAlert?: boolean;
  image?: string;
  barcode: string;
}
export type ShoppingListItem = {
  name: string;
  checked: boolean;
  addedBy?: string;
};
export type GroupRole = "host" | "member" | null;
export type SharedGroupSnapshot = {
  code: string;
  members: MemberCart[];
  items: Item[];
  manualList: ShoppingListItem[];
  updatedAt: number;
  sourceId: string;
};

export const isSharedGroupSnapshot = (
  value: unknown,
): value is SharedGroupSnapshot => {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<SharedGroupSnapshot>;
  return (
    typeof snapshot.code === "string" &&
    Array.isArray(snapshot.members) &&
    Array.isArray(snapshot.items) &&
    Array.isArray(snapshot.manualList) &&
    typeof snapshot.updatedAt === "number" &&
    typeof snapshot.sourceId === "string"
  );
};

export type PurchaseHistoryLine = { name: string; qty: number; price: number };
export type PurchaseHistoryOrder = {
  id: string;
  completedAt: string;
  store: string;
  paymentMethod: string;
  items: PurchaseHistoryLine[];
  discount: number;
  tax?: number;
  total: number;
  pointsEarned: number;
  appliedVoucherCode?: string;
};

export type PaymentMethod = "Tiền mặt" | "Thẻ ngân hàng" | "Ví điện tử";
export type CompletedReceipt = {
  orderId: string;
  paidAt: string;
  store: string;
  paymentMethod: PaymentMethod;
  items: PurchaseHistoryLine[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  pointsEarned: number;
  appliedVoucherCode?: string;
};

export type Voucher = {
  id: string;
  code: string;
  title: string;
  campaign: string;
  benefit: string;
  description: string;
  validFrom: string;
  expiresAt: string;
  minSpend?: number;
  memberTier?: "Gold";
  requiredCategory?: string;
  weekendOnly?: boolean;
  stackable?: boolean;
  usageLimit: string;
}

export interface GateItemDetails {
  name: string;
  qty: number;
  price: number;
  aiVerified: boolean;
}

export interface CartHistoryPayload {
  cartId: string;
  invoiceCode: string;
  customerPhone: string;
  paymentMethod: PaymentMethod | string;
  items: GateItemDetails[];
  status: 'paid' | 'unpaid' | 'hold' | 'passed';
  timestamp: string;
  handledBy?: string;
  total: number;
  discount?: number;
  tax?: number;
  appliedVoucherCode?: string;
}

export interface GatewayDashboardData {
  stats: {
    totalChecks: number;
    passCount: number;
    holdCount: number;
    successRate: number;
    avgSpeed: string;
  };
  history: CartHistoryPayload[];
}

export interface GateSnapshotData {
  imageUrl: string;
  timestamp: string;
  cartId: string;
  aiAnomalies: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }[];
};

export type VoucherStatus = {
  key: "eligible" | "upcoming" | "expired" | "condition";
  label: string;
  reason: string;
};

export type CheckoutSummary = {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  total: number;
  appliedVoucher: Voucher | null;
  pointsMultiplier: number;
  pointsEarned: number;
};

export const PURCHASE_HISTORY: PurchaseHistoryOrder[] = [
  {
    id: "SC-260706-1842",
    completedAt: "2026-07-06T18:42:00+07:00",
    store: "Smart Market · Quận Bình Thạnh",
    paymentMethod: "Ví điện tử MoMo",
    items: [
      { name: "Thịt Bò Úc 500g", qty: 1, price: 100000 },
      { name: "Gạo ST25 5kg", qty: 1, price: 145000 },
      { name: "Coca-Cola 330ml", qty: 4, price: 10000 },
    ],
    discount: 25000,
    total: 268000,
    pointsEarned: 27,
  },
  {
    id: "SC-260628-0956",
    completedAt: "2026-06-28T09:56:00+07:00",
    store: "Smart Market · Quận 1",
    paymentMethod: "Thẻ ngân hàng",
    items: [
      { name: "Sữa Tươi Vinamilk 1L", qty: 2, price: 36000 },
      { name: "Táo Fuji Nam Phi", qty: 1, price: 85000 },
      { name: "Khăn giấy cuộn lớn", qty: 1, price: 42000 },
    ],
    discount: 15000,
    total: 184000,
    pointsEarned: 18,
  },
  {
    id: "SC-260615-2014",
    completedAt: "2026-06-15T20:14:00+07:00",
    store: "Smart Market · Quận Bình Thạnh",
    paymentMethod: "QR ngân hàng",
    items: [
      { name: "Cá Hồi Tươi 300g", qty: 1, price: 180000 },
      { name: "Dầu ăn Simply 1L", qty: 1, price: 62000 },
      { name: "Nước mắm Nam Ngư", qty: 1, price: 45000 },
    ],
    discount: 30000,
    total: 266000,
    pointsEarned: 27,
  },
  {
    id: "SC-260530-1648",
    completedAt: "2026-05-30T16:48:00+07:00",
    store: "Smart Market · Quận 3",
    paymentMethod: "Ví SmartPay",
    items: [
      { name: "Tã dán Huggies L", qty: 1, price: 280000 },
      { name: "Sữa Tươi Vinamilk 1L", qty: 2, price: 36000 },
      { name: "Nước suối Aquafina 500ml", qty: 6, price: 6000 },
    ],
    discount: 40000,
    total: 348000,
    pointsEarned: 35,
  },
  {
    id: "SC-260511-1132",
    completedAt: "2026-05-11T11:32:00+07:00",
    store: "Smart Market · Quận Bình Thạnh",
    paymentMethod: "Tiền mặt tại quầy",
    items: [
      { name: "Mì Gói Hảo Hảo", qty: 10, price: 4000 },
      { name: "Hạt Nêm Knorr", qty: 2, price: 32000 },
      { name: "Dầu gội Clear 650ml", qty: 1, price: 120000 },
    ],
    discount: 15000,
    total: 209000,
    pointsEarned: 21,
  },
  {
    id: "SC-260427-1907",
    completedAt: "2026-04-27T19:07:00+07:00",
    store: "Smart Market · Quận 1",
    paymentMethod: "Thẻ ngân hàng",
    items: [
      { name: "Nước rửa chén Sunlight", qty: 2, price: 25000 },
      { name: "Kem đánh răng Closeup", qty: 2, price: 38000 },
      { name: "Hạt Điều Rang Muối", qty: 1, price: 75000 },
    ],
    discount: 20000,
    total: 181000,
    pointsEarned: 18,
  },
];

export const MEMBER_VOUCHERS: Voucher[] = [
  {
    id: "smart-15k",
    code: "SMART15K",
    title: "Giảm 15.000 ₫ cho hóa đơn từ 100.000 ₫",
    campaign: "Ưu đãi thành viên Smart Cart",
    benefit: "Giảm trực tiếp 15.000 ₫",
    description:
      "Được hệ thống tự động ưu tiên khi đây là mã giảm tiền phù hợp nhất với giỏ hàng.",
    validFrom: "2026-07-01T00:00:00+07:00",
    expiresAt: "2026-08-31T23:59:59+07:00",
    minSpend: 100000,
    usageLimit: "1 lần/ngày",
  },
  {
    id: "gold-40k",
    code: "GOLD40K",
    title: "Đặc quyền riêng cho thành viên Gold",
    campaign: "Quyền lợi hạng thành viên",
    benefit: "Giảm 40.000 ₫",
    description:
      "Chỉ áp dụng cho tài khoản hạng Gold với hóa đơn đủ điều kiện.",
    validFrom: "2026-07-01T00:00:00+07:00",
    expiresAt: "2026-12-31T23:59:59+07:00",
    minSpend: 400000,
    memberTier: "Gold",
    usageLimit: "2 lần/tháng",
  },
  {
    id: "national-day",
    code: "QUOCKHANH26",
    title: "Mừng Quốc khánh 2/9",
    campaign: "Tuần lễ Quốc khánh",
    benefit: "Giảm 12%, tối đa 60.000 ₫",
    description:
      "Áp dụng trong thời gian diễn ra chương trình lễ Quốc khánh, cho hóa đơn từ 250.000 ₫.",
    validFrom: "2026-08-25T00:00:00+07:00",
    expiresAt: "2026-09-03T23:59:59+07:00",
    minSpend: 250000,
    usageLimit: "1 lần/tài khoản",
  },
  {
    id: "home-care",
    code: "GIADUNG15",
    title: "Giảm 15% ngành hàng Đồ gia dụng",
    campaign: "Tuần lễ chăm sóc nhà cửa",
    benefit: "Giảm 15%, tối đa 50.000 ₫",
    description:
      "Giỏ hàng phải có ít nhất một sản phẩm thuộc danh mục Đồ gia dụng.",
    validFrom: "2026-07-05T00:00:00+07:00",
    expiresAt: "2026-08-31T23:59:59+07:00",
    minSpend: 200000,
    requiredCategory: "Đồ gia dụng",
    usageLimit: "3 lần/tài khoản",
  },
  {
    id: "double-points",
    code: "DIEMX2",
    title: "Nhân đôi Smart Points",
    campaign: "Tháng hội viên",
    benefit: "Tích điểm x2",
    description:
      "Có thể dùng cùng một mã giảm tiền vì đây là ưu đãi cộng điểm.",
    validFrom: "2026-07-01T00:00:00+07:00",
    expiresAt: "2026-07-31T23:59:59+07:00",
    stackable: true,
    usageLimit: "Không giới hạn trong thời gian chương trình",
  },
  {
    id: "weekend",
    code: "CUOITUAN25K",
    title: "Mua sắm cuối tuần",
    campaign: "Thứ Sáu đến Chủ Nhật",
    benefit: "Giảm 25.000 ₫",
    description:
      "Chỉ dùng vào thứ Sáu, thứ Bảy hoặc Chủ Nhật với hóa đơn từ 300.000 ₫.",
    validFrom: "2026-07-01T00:00:00+07:00",
    expiresAt: "2026-09-30T23:59:59+07:00",
    minSpend: 300000,
    weekendOnly: true,
    usageLimit: "1 lần/cuối tuần",
  },
];

export const getVoucherStatus = (
  voucher: Voucher,
  subtotal: number,
  items: Item[],
  memberTier: "Gold",
  now = new Date(),
): VoucherStatus => {
  const startsAt = new Date(voucher.validFrom);
  const expiresAt = new Date(voucher.expiresAt);
  if (now < startsAt)
    return {
      key: "upcoming",
      label: "Sắp diễn ra",
      reason: `Bắt đầu ${startsAt.toLocaleDateString("vi-VN")}`,
    };
  if (now > expiresAt)
    return {
      key: "expired",
      label: "Đã hết hạn",
      reason: `Đã hết hạn ${expiresAt.toLocaleDateString("vi-VN")}`,
    };
  if (voucher.memberTier && voucher.memberTier !== memberTier)
    return {
      key: "condition",
      label: "Không đúng hạng",
      reason: `Chỉ dành cho hạng ${voucher.memberTier}`,
    };
  if (voucher.weekendOnly && ![0, 5, 6].includes(now.getDay()))
    return {
      key: "condition",
      label: "Chờ cuối tuần",
      reason: "Chỉ áp dụng từ thứ Sáu đến Chủ Nhật",
    };
  if (voucher.minSpend && subtotal < voucher.minSpend)
    return {
      key: "condition",
      label: "Chưa đủ điều kiện",
      reason: `Cần mua thêm ${formatMoney(voucher.minSpend - subtotal)}`,
    };
  if (
    voucher.requiredCategory &&
    !items.some((item) => item.category === voucher.requiredCategory)
  )
    return {
      key: "condition",
      label: "Chưa đủ điều kiện",
      reason: `Cần có sản phẩm ${voucher.requiredCategory}`,
    };
  return {
    key: "eligible",
    label: voucher.stackable ? "Có thể dùng kèm" : "Dùng được ngay",
    reason: voucher.stackable
      ? "Có thể kết hợp với một mã giảm tiền"
      : "Đủ điều kiện cho giỏ hiện tại",
  };
};

export const getVoucherSaving = (
  voucher: Voucher,
  subtotal: number,
  items: Item[],
): number => {
  switch (voucher.id) {
    case "smart-15k":
      return Math.min(15000, subtotal);
    case "gold-40k":
      return Math.min(40000, subtotal);
    case "national-day":
      return Math.min(60000, Math.round(subtotal * 0.12));
    case "home-care": {
      const categorySubtotal = items
        .filter((item) => item.category === voucher.requiredCategory)
        .reduce((sum, item) => sum + item.price * item.qty, 0);
      return Math.min(50000, Math.round(categorySubtotal * 0.15));
    }
    case "weekend":
      return Math.min(25000, subtotal);
    default:
      return 0;
  }
};

export const getCheckoutSummary = (
  subtotal: number,
  items: Item[],
  memberTier: "Gold",
  now = new Date(),
): CheckoutSummary => {
  const eligibleMoneyVouchers = MEMBER_VOUCHERS.filter(
    (voucher) =>
      !voucher.stackable &&
      getVoucherStatus(voucher, subtotal, items, memberTier, now).key ===
        "eligible",
  )
    .map((voucher) => ({
      voucher,
      saving: getVoucherSaving(voucher, subtotal, items),
    }))
    .filter((entry) => entry.saving > 0)
    .sort(
      (a, b) =>
        b.saving - a.saving || a.voucher.code.localeCompare(b.voucher.code),
    );

  const best = eligibleMoneyVouchers[0] ?? null;
  const discount = Math.min(subtotal, best?.saving ?? 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.03);
  const total = taxableAmount + tax;
  const doublePointsActive = MEMBER_VOUCHERS.some(
    (voucher) =>
      voucher.stackable &&
      getVoucherStatus(voucher, subtotal, items, memberTier, now).key ===
        "eligible",
  );
  const pointsMultiplier = doublePointsActive ? 2 : 1;
  const pointsEarned = Math.floor(total / 10000) * pointsMultiplier;

  return {
    subtotal,
    discount,
    taxableAmount,
    tax,
    total,
    appliedVoucher: best?.voucher ?? null,
    pointsMultiplier,
    pointsEarned,
  };
};

export const formatMoney = (value: number) =>
  `${value.toLocaleString("vi-VN")} ₫`;

export const CATEGORIES = [
  [Apple, "Hàng tươi sống"],
  [CupSoda, "Thực phẩm khô & đồ uống"],
  [Package, "Đông lạnh"],
  [Wheat, "Gia vị"],
  [ShoppingBag, "Đồ gia dụng"],
  [Baby, "Mẹ & Bé"],
  [Sparkles, "Hóa mỹ phẩm"],
] as const;
export const PRODUCTS = [
  {
    name: "Thịt Bò Úc 500g",
    category: "Thực phẩm tươi",
    price: 100000,
    oldPrice: 150000,
    tone: "bg-[#0F172A]",
  },
  {
    name: "Táo Fuji Nam Phi",
    category: "Thực phẩm tươi",
    price: 85000,
    tone: "bg-[#0F172A]",
  },
  {
    name: "Cá Hồi Tươi 300g",
    category: "Thực phẩm tươi",
    price: 180000,
    tone: "bg-[#15803D]",
  },
  {
    name: "Mì Gói Hảo Hảo",
    category: "Đồ khô",
    price: 4000,
    tone: "bg-[#15803D]",
  },
  {
    name: "Gạo ST25 5kg",
    category: "Đồ khô",
    price: 145000,
    oldPrice: 160000,
    tone: "bg-[#0F172A]",
  },
  {
    name: "Hạt Điều Rang Muối",
    category: "Đồ khô",
    price: 75000,
    tone: "bg-[#15803D]",
  },
  {
    name: "Dầu ăn Simply 1L",
    category: "Gia vị",
    price: 62000,
    tone: "bg-[#15803D]",
  },
  {
    name: "Nước mắm Nam Ngư",
    category: "Gia vị",
    price: 45000,
    tone: "bg-[#0F172A]",
  },
  {
    name: "Hạt Nêm Knorr",
    category: "Gia vị",
    price: 32000,
    tone: "bg-[#15803D]",
  },
  {
    name: "Coca-Cola 330ml",
    category: "Đồ uống",
    price: 10000,
    tone: "bg-[#15803D]",
  },
  {
    name: "Bia Heineken 330ml",
    category: "Đồ uống",
    price: 21000,
    tone: "bg-[#0F172A]",
  },
  {
    name: "Nước suối Aquafina 500ml",
    category: "Đồ uống",
    price: 6000,
    tone: "bg-[#15803D]",
  },
  {
    name: "Nước rửa chén Sunlight",
    category: "Đồ gia dụng",
    price: 25000,
    tone: "bg-[#15803D]",
  },
  {
    name: "Khăn giấy cuộn lớn",
    category: "Đồ gia dụng",
    price: 42000,
    tone: "bg-[#0F172A]",
  },
  {
    name: "Sữa Tươi Vinamilk 1L",
    category: "Mẹ & Bé",
    price: 36000,
    oldPrice: 45000,
    tone: "bg-[#15803D]",
  },
  {
    name: "Tã dán Huggies L",
    category: "Mẹ & Bé",
    price: 280000,
    tone: "bg-[#0F172A]",
  },
  {
    name: "Dầu gội Clear 650ml",
    category: "Hóa mỹ phẩm",
    price: 120000,
    tone: "bg-[#0F172A]",
  },
  {
    name: "Kem đánh răng Closeup",
    category: "Hóa mỹ phẩm",
    price: 38000,
    tone: "bg-[#15803D]",
  },
];

export type MapPoint = { x: number; y: number };
export type StoreLocationKind = "product" | "service";
export type StoreProductLocation = {
  id: string;
  name: string;
  aliases: string[];
  zone: string;
  shelf: string;
  point: MapPoint;
  path: MapPoint[];
  kind: StoreLocationKind;
};
export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export const USER_MAP_POINT: MapPoint = { x: 930, y: 410 };
export const STORE_ZONE_META: Record<
  string,
  { anchor: MapPoint; approach: MapPoint[] }
> = {
  "Rau củ": {
    anchor: { x: 470, y: 195 },
    approach: [
      USER_MAP_POINT,
      { x: 950, y: 410 },
      { x: 950, y: 250 },
      { x: 470, y: 250 },
    ],
  },
  "Trái cây": {
    anchor: { x: 655, y: 195 },
    approach: [
      USER_MAP_POINT,
      { x: 950, y: 410 },
      { x: 950, y: 250 },
      { x: 655, y: 250 },
    ],
  },
  "Thịt & Cá": {
    anchor: { x: 840, y: 195 },
    approach: [
      USER_MAP_POINT,
      { x: 950, y: 410 },
      { x: 950, y: 250 },
      { x: 840, y: 250 },
    ],
  },
  "Tủ mát": {
    anchor: { x: 1115, y: 205 },
    approach: [USER_MAP_POINT, { x: 970, y: 410 }, { x: 970, y: 205 }],
  },
  "Tủ đông": {
    anchor: { x: 1115, y: 292 },
    approach: [USER_MAP_POINT, { x: 970, y: 410 }, { x: 970, y: 292 }],
  },
  "Kho lạnh": {
    anchor: { x: 1115, y: 379 },
    approach: [USER_MAP_POINT, { x: 970, y: 410 }, { x: 970, y: 379 }],
  },
  "Mì · Gạo · Gia vị": {
    anchor: { x: 545, y: 352 },
    approach: [
      USER_MAP_POINT,
      { x: 900, y: 410 },
      { x: 900, y: 365 },
      { x: 650, y: 365 },
    ],
  },
  "Đồ uống": {
    anchor: { x: 790, y: 352 },
    approach: [USER_MAP_POINT, { x: 900, y: 410 }, { x: 900, y: 365 }],
  },
  "Đồ uống · Bánh kẹo": {
    anchor: { x: 685, y: 423 },
    approach: [USER_MAP_POINT, { x: 900, y: 410 }, { x: 900, y: 435 }],
  },
  "Đồ hộp · Hóa mỹ phẩm": {
    anchor: { x: 685, y: 494 },
    approach: [USER_MAP_POINT, { x: 900, y: 410 }, { x: 900, y: 506 }],
  },
  "Đồ gia dụng": {
    anchor: { x: 685, y: 565 },
    approach: [USER_MAP_POINT, { x: 900, y: 410 }, { x: 900, y: 578 }],
  },
  "Trạm Xe Đẩy AI": {
    anchor: { x: 195, y: 336 },
    approach: [
      USER_MAP_POINT,
      { x: 900, y: 410 },
      { x: 900, y: 520 },
      { x: 338, y: 520 },
      { x: 338, y: 336 },
    ],
  },
  "Quầy Thu Ngân": {
    anchor: { x: 1120, y: 520 },
    approach: [
      USER_MAP_POINT,
      { x: 970, y: 410 },
      { x: 970, y: 470 },
      { x: 1120, y: 470 },
    ],
  },
  "Lối vào": {
    anchor: { x: 130, y: 600 },
    approach: [
      USER_MAP_POINT,
      { x: 900, y: 410 },
      { x: 900, y: 520 },
      { x: 338, y: 520 },
      { x: 338, y: 600 },
    ],
  },
  "Lối ra": {
    anchor: { x: 256, y: 600 },
    approach: [
      USER_MAP_POINT,
      { x: 900, y: 410 },
      { x: 900, y: 520 },
      { x: 338, y: 520 },
      { x: 338, y: 600 },
    ],
  },
};

export const createStoreLocation = (
  id: string,
  name: string,
  aliases: string[],
  zone: string,
  shelf: string,
  offsetX = 0,
  offsetY = 0,
  kind: StoreLocationKind = "product",
): StoreProductLocation => {
  const meta = STORE_ZONE_META[zone];
  if (!meta) throw new Error(`Chưa khai báo tọa độ cho khu vực: ${zone}`);
  const point = { x: meta.anchor.x + offsetX, y: meta.anchor.y + offsetY };
  return {
    id,
    name,
    aliases,
    zone,
    shelf,
    point,
    path: [...meta.approach, point],
    kind,
  };
};

export let STORE_LOCATIONS: StoreProductLocation[] = [
  createStoreLocation(
    "khu-rau-cu",
    "Khu Rau củ",
    ["rau củ", "khu rau củ"],
    "Rau củ",
    "Khu hàng tươi sống",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-trai-cay",
    "Khu Trái cây",
    ["trái cây", "khu trái cây"],
    "Trái cây",
    "Khu hàng tươi sống",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-thit-ca",
    "Khu Thịt & Cá",
    ["thịt cá", "thịt và cá", "khu thịt"],
    "Thịt & Cá",
    "Khu hàng tươi sống",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-tu-mat",
    "Khu Tủ mát",
    ["tủ mát", "khu tủ mát"],
    "Tủ mát",
    "Dãy lạnh 01",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-tu-dong",
    "Khu Tủ đông",
    ["tủ đông", "khu tủ đông"],
    "Tủ đông",
    "Dãy lạnh 02",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-kho-lanh",
    "Khu Kho lạnh",
    ["kho lạnh", "khu kho lạnh"],
    "Kho lạnh",
    "Dãy lạnh 03",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-gia-vi",
    "Khu Mì · Gạo · Gia vị",
    ["gia vị", "khu gia vị", "thực phẩm khô", "mì gạo gia vị"],
    "Mì · Gạo · Gia vị",
    "Dãy A",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-do-uong",
    "Khu Đồ uống",
    ["đồ uống", "khu đồ uống", "nước giải khát"],
    "Đồ uống",
    "Dãy B",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-banh-keo",
    "Khu Bánh kẹo",
    ["bánh kẹo", "khu bánh kẹo"],
    "Đồ uống · Bánh kẹo",
    "Dãy C",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-hoa-my-pham",
    "Khu Hóa mỹ phẩm",
    ["hóa mỹ phẩm", "khu hóa mỹ phẩm", "đồ hộp"],
    "Đồ hộp · Hóa mỹ phẩm",
    "Dãy D",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "khu-gia-dung",
    "Khu Đồ gia dụng",
    ["đồ gia dụng", "khu gia dụng"],
    "Đồ gia dụng",
    "Dãy E",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "tram-xe-day",
    "Trạm Xe Đẩy AI",
    ["trạm xe", "sạc xe", "nhận xe"],
    "Trạm Xe Đẩy AI",
    "Khu dịch vụ",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "quay-thu-ngan",
    "Quầy Thu Ngân",
    ["quầy thanh toán", "thanh toán", "thu ngân"],
    "Quầy Thu Ngân",
    "Quầy 01–03",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "loi-vao",
    "Lối vào",
    ["cửa vào", "lối vào"],
    "Lối vào",
    "Cửa phía Tây",
    0,
    0,
    "service",
  ),
  createStoreLocation(
    "loi-ra",
    "Lối ra",
    ["cửa ra", "lối ra"],
    "Lối ra",
    "Cửa phía Tây",
    0,
    0,
    "service",
  ),
];

export const setGlobalStoreLocations = (locations: StoreProductLocation[]) => {
  STORE_LOCATIONS = locations;
};

export const normalizeLookup = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const scoreStoreLocation = (
  query: string,
  location: StoreProductLocation,
): number => {
  const normalizedQuery = normalizeLookup(query);
  if (!normalizedQuery) return 0;
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const primaryCandidates = [location.name, ...location.aliases].map(
    normalizeLookup,
  );
  const secondaryCandidates = [location.zone, location.shelf].map(
    normalizeLookup,
  );
  let best = 0;

  const applyCandidates = (
    candidates: string[],
    exactScore: number,
    containsScore: number,
    tokenWeight: number,
  ) => {
    for (const candidate of candidates) {
      if (!candidate) continue;
      if (candidate === normalizedQuery) best = Math.max(best, exactScore);
      else if (normalizedQuery.includes(candidate))
        best = Math.max(best, containsScore + Math.min(candidate.length, 18));
      else if (candidate.includes(normalizedQuery))
        best = Math.max(
          best,
          containsScore - 12 + Math.min(normalizedQuery.length, 18),
        );
      const candidateTokens = candidate.split(" ").filter(Boolean);
      const overlap = queryTokens.filter((token) =>
        candidateTokens.some(
          (candidateToken) =>
            candidateToken === token ||
            candidateToken.startsWith(token) ||
            token.startsWith(candidateToken),
        ),
      ).length;
      if (overlap > 0)
        best = Math.max(
          best,
          overlap * tokenWeight + (overlap === queryTokens.length ? 18 : 0),
        );
    }
  };

  applyCandidates(primaryCandidates, 140, 118, 30);
  applyCandidates(secondaryCandidates, 88, 72, 18);
  return best;
};

export const searchStoreLocations = (
  query: string,
  limit = 6,
): StoreProductLocation[] =>
  STORE_LOCATIONS.map((location) => ({
    location,
    score: scoreStoreLocation(query, location),
  }))
    .filter((result) => result.score >= 24)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.location.name.localeCompare(b.location.name, "vi"),
    )
    .slice(0, limit)
    .map((result) => result.location);

export const findStoreLocation = (query: string): StoreProductLocation | null =>
  searchStoreLocations(query, 1)[0] ?? null;

export function GoldIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#15803D] bg-[#0F172A] p-px shadow-[0_0_11px_rgba(249,115,22,.38)] ${className}`}
    >
      <span className="flex h-full w-full items-center justify-center rounded-[inherit] bg-[#0F172A] text-[#15803D]">
        {children}
      </span>
    </span>
  );
}

export function SoftIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#15803D] transition-colors group-hover:bg-[#15803D] group-hover:text-white ${className}`}
    >
      {children}
    </span>
  );
}

export function Back({
  onClick,
  dark = false,
}: {
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative z-10 flex h-12 items-center gap-2 rounded-xl px-4 text-base font-extrabold transition active:scale-95 border border-[#15803D]/70 bg-white text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] hover:bg-[#F5F5E6]`}
    >
      <ChevronLeft size={22} /> Quay lại
    </button>
  );
}

export function TopStatusBar({
  onHelp,
  isAbsolute = false,
}: {
  onHelp: () => void;
  isAbsolute?: boolean;
}) {
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportView, setSupportView] = useState<
    "menu" | "ai" | "staff" | "return" | "faq"
  >("menu");
  const [supportNotice, setSupportNotice] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiReply, setAiReply] = useState(
    "Xin chào! Tôi có thể hướng dẫn thanh toán, tìm sản phẩm, ưu đãi và quy trình đổi trả.",
  );
  const [returnOrder, setReturnOrder] = useState("");
  const [returnCause, setReturnCause] = useState(
    "Khách hàng chọn nhầm sản phẩm",
  );
  const [returnDetail, setReturnDetail] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const closeSupport = () => {
    setSupportOpen(false);
    setSupportView("menu");
    setSupportNotice("");
  };

  const askQuickAI = (question: string) => {
    const value = question.trim();
    if (!value) return;
    const normalized = normalizeLookup(value);
    if (normalized.includes("doi tra") || normalized.includes("hoan tra")) {
      setAiReply(
        "Bạn có thể mở mục “Hỗ trợ hoàn trả hàng”, nhập mã hóa đơn, chọn nguyên nhân do khách hàng hoặc cửa hàng và gửi yêu cầu để nhân viên xác minh.",
      );
    } else if (
      normalized.includes("ma") ||
      normalized.includes("uu dai") ||
      normalized.includes("giam gia")
    ) {
      setAiReply(
        "Mã giảm giá được kiểm tra theo hạng thành viên, giá trị giỏ hàng và hạn sử dụng. Vào Tài khoản → Ưu đãi đang áp dụng để xem mã phù hợp nhất.",
      );
    } else if (
      normalized.includes("thanh toan") ||
      normalized.includes("tien mat") ||
      normalized.includes("the")
    ) {
      setAiReply(
        "Hệ thống hỗ trợ Tiền mặt, Thẻ ngân hàng và Ví điện tử. Sau khi thanh toán thành công, hóa đơn sẽ hiện để in, gửi qua email/số điện thoại hoặc yêu cầu đổi trả.",
      );
    } else if (
      normalized.includes("o dau") ||
      normalized.includes("tim") ||
      normalized.includes("san pham")
    ) {
      setAiReply(
        "Hãy mở Bản đồ & AI, nhập tên sản phẩm hoặc thương hiệu. Hệ thống sẽ truy xuất đúng khu, đúng kệ và vẽ tuyến đường từ vị trí xe hiện tại.",
      );
    } else {
      setAiReply(
        "Tôi đã ghi nhận câu hỏi. Bạn có thể mô tả rõ hơn về thanh toán, sản phẩm, ưu đãi hoặc đổi trả để tôi hướng dẫn chính xác.",
      );
    }
    setAiQuestion("");
  };

  const requestStaff = () => {
    onHelp();
    setSupportNotice(
      "Đã gửi yêu cầu. Nhân viên gần nhất đang di chuyển tới vị trí xe của bạn.",
    );
  };

  const submitReturnSupport = () => {
    if (!returnOrder.trim()) {
      setSupportNotice("Vui lòng nhập mã hóa đơn cần hỗ trợ.");
      return;
    }
    const ticket = `RT-${Math.floor(100000 + Math.random() * 900000)}`;
    onHelp();
    setSupportNotice(
      `Đã tạo yêu cầu ${ticket}. Nhân viên sẽ xác minh hóa đơn ${returnOrder.trim()} và nguyên nhân “${returnCause}”.`,
    );
    setReturnDetail("");
  };

  const faqItems = [
    [
      "Tôi có thể thanh toán bằng cách nào?",
      "Bạn có thể chọn Tiền mặt, Thẻ ngân hàng hoặc Ví điện tử tại bước thanh toán.",
    ],
    [
      "Làm sao lấy lại hóa đơn?",
      "Sau khi thanh toán, hóa đơn có thể được in hoặc gửi lại qua email/số điện thoại. Các đơn cũ nằm trong Tài khoản → Lịch sử mua sắm.",
    ],
    [
      "Khi nào được yêu cầu đổi trả?",
      "Bạn cần có mã hóa đơn và mô tả rõ sai sót. Nhân viên sẽ kiểm tra tình trạng hàng và chính sách áp dụng trước khi xác nhận.",
    ],
    [
      "Giỏ hàng nhóm có đồng bộ không?",
      "Có. Số lượng, sản phẩm và shopping list được đồng bộ cho các xe đang dùng cùng mã nhóm.",
    ],
  ] as const;

  return (
    <div
      className={`${isAbsolute ? "absolute inset-x-0 top-0 z-40 w-full" : "relative"} flex h-10 shrink-0 items-center justify-between bg-[#0F172A] px-7 text-[11px] font-bold text-[#CBD5E1]`}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Battery size={14} className="text-[#15803D]" />
          85%
        </span>
        <span className="flex items-center gap-1.5">
          <Wifi size={14} className="text-[#15803D]" />
          Đã kết nối (0.3s)
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          setSupportOpen((value) => !value);
          setSupportView("menu");
          setSupportNotice("");
        }}
        className="flex h-7 items-center gap-1.5 rounded-lg bg-[#15803D] px-3 text-xs font-black text-white transition-colors hover:bg-white"
      >
        <Headphones size={14} />
        Trung tâm hỗ trợ
      </button>

      {supportOpen && (
        <div className="absolute right-5 top-9 z-[220] w-[430px] overflow-hidden rounded-3xl border border-[#15803D] bg-white text-[#334155] shadow-[0_20px_55px_rgba(15,23,42,.32)]">
          <div className="flex items-center gap-3 bg-[#0F172A] px-5 py-4 text-white">
            <GoldIcon className="h-10 w-10 rounded-xl">
              <Headphones size={19} />
            </GoldIcon>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#15803D]">
                Smart Cart Care
              </p>
              <h2 className="truncate text-base font-black">
                Trung tâm hỗ trợ
              </h2>
            </div>
            {supportView !== "menu" && (
              <button
                type="button"
                onClick={() => {
                  setSupportView("menu");
                  setSupportNotice("");
                }}
                className="rounded-lg px-2 py-1 text-xs font-black text-[#15803D] hover:bg-white"
              >
                Quay lại
              </button>
            )}
            <button
              type="button"
              onClick={closeSupport}
              className="rounded-lg p-1.5 hover:bg-white shadow-sm border border-[#E2E8F0]/10"
              aria-label="Đóng trung tâm hỗ trợ"
            >
              <X size={18} />
            </button>
          </div>

          {supportNotice && (
            <div className="m-4 flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-3 text-xs font-extrabold leading-relaxed text-emerald-800">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <span>{supportNotice}</span>
            </div>
          )}

          {supportView === "menu" && (
            <div className="grid grid-cols-2 gap-3 p-4">
              <button
                type="button"
                onClick={() => setSupportView("ai")}
                className="group min-h-32 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#15803D] hover:bg-[#FFF7ED]"
              >
                <GoldIcon className="h-11 w-11 rounded-xl">
                  <Bot size={20} />
                </GoldIcon>
                <b className="mt-3 block text-sm">Hỗ trợ nhanh bằng AI</b>
                <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-[#64748B]">
                  Hỏi nhanh về thanh toán, ưu đãi, vị trí và đổi trả.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSupportView("staff")}
                className="group min-h-32 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#15803D] hover:bg-[#FFF7ED]"
              >
                <GoldIcon className="h-11 w-11 rounded-xl">
                  <Phone size={20} />
                </GoldIcon>
                <b className="mt-3 block text-sm">Gọi nhân viên trực tiếp</b>
                <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-[#64748B]">
                  Gửi vị trí xe để nhân viên tới hỗ trợ.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSupportView("return")}
                className="group min-h-32 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#15803D] hover:bg-[#FFF7ED]"
              >
                <GoldIcon className="h-11 w-11 rounded-xl">
                  <RotateCcw size={20} />
                </GoldIcon>
                <b className="mt-3 block text-sm">Hỗ trợ hoàn trả hàng</b>
                <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-[#64748B]">
                  Xử lý sai sót từ khách hàng hoặc cửa hàng.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSupportView("faq")}
                className="group min-h-32 rounded-2xl border border-[#E2E8F0] bg-white p-4 text-left transition hover:border-[#15803D] hover:bg-[#FFF7ED]"
              >
                <GoldIcon className="h-11 w-11 rounded-xl">
                  <FileText size={20} />
                </GoldIcon>
                <b className="mt-3 block text-sm">Câu hỏi thường gặp</b>
                <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-[#64748B]">
                  Xem hướng dẫn cho các tình huống phổ biến.
                </span>
              </button>
            </div>
          )}

          {supportView === "ai" && (
            <div className="p-4">
              <div className="rounded-2xl bg-[#F1F5F9] p-4 text-sm font-semibold leading-relaxed text-[#334155]">
                <div className="mb-2 flex items-center gap-2 font-black text-[#334155]">
                  <Bot size={18} className="text-[#15803D]" />
                  AI hỗ trợ nhanh
                </div>
                {aiReply}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Thanh toán thế nào?",
                  "Cách đổi trả?",
                  "Mã giảm giá ở đâu?",
                ].map((question) => (
                  <button
                    type="button"
                    key={question}
                    onClick={() => askQuickAI(question)}
                    className="rounded-full border border-[#15803D]/70 bg-[#FFF7ED] px-3 py-1.5 text-[11px] font-black"
                  >
                    {question}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  askQuickAI(aiQuestion);
                }}
                className="mt-4 flex gap-2"
              >
                <input
                  value={aiQuestion}
                  onChange={(event) => setAiQuestion(event.target.value)}
                  placeholder="Nhập câu hỏi cần hỗ trợ..."
                  className="h-11 min-w-0 flex-1 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm font-semibold outline-none focus:border-[#15803D]"
                />
                <button className="flex h-11 items-center gap-1 rounded-xl bg-[#15803D] px-4 text-xs font-black">
                  <Send size={15} />
                  Gửi
                </button>
              </form>
            </div>
          )}

          {supportView === "staff" && (
            <div className="p-5">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#15803D]">
                  Hỗ trợ tại chỗ
                </p>
                <h3 className="mt-1 text-lg font-black">
                  Gọi nhân viên gần nhất
                </h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[#64748B]">
                  Hệ thống sẽ gửi vị trí hiện tại của xe và ưu tiên nhân viên
                  đang ở gần khu vực của bạn.
                </p>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-3 text-xs font-bold">
                  <span>Thời gian dự kiến</span>
                  <b className="text-[#15803D]">2–4 phút</b>
                </div>
              </div>
              <button
                type="button"
                onClick={requestStaff}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15803D] font-black"
              >
                <Phone size={18} />
                Gọi nhân viên hỗ trợ
              </button>
            </div>
          )}

          {supportView === "return" && (
            <div className="max-h-[490px] overflow-y-auto p-5 [scrollbar-width:none]">
              <p className="text-sm font-semibold leading-relaxed text-[#64748B]">
                Nhập thông tin hóa đơn để cửa hàng kiểm tra trường hợp đổi hoặc
                hoàn trả.
              </p>
              <label className="mt-4 block text-xs font-black">
                Mã hóa đơn
              </label>
              <input
                value={returnOrder}
                onChange={(event) => setReturnOrder(event.target.value)}
                placeholder="Ví dụ: SC-260706-1842"
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] px-3 text-sm font-semibold outline-none focus:border-[#15803D]"
              />
              <label className="mt-4 block text-xs font-black">
                Nguyên nhân
              </label>
              <select
                value={returnCause}
                onChange={(event) => setReturnCause(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm font-semibold outline-none"
              >
                <option>Khách hàng chọn nhầm sản phẩm</option>
                <option>Khách hàng muốn đổi sản phẩm khác</option>
                <option>Cửa hàng giao sai hoặc thiếu sản phẩm</option>
                <option>Sản phẩm lỗi, hư hỏng hoặc sai chất lượng</option>
              </select>
              <label className="mt-4 block text-xs font-black">
                Mô tả thêm
              </label>
              <textarea
                value={returnDetail}
                onChange={(event) => setReturnDetail(event.target.value)}
                placeholder="Mô tả sản phẩm và tình trạng cần hỗ trợ..."
                className="mt-1 min-h-24 w-full resize-none rounded-xl border border-[#E2E8F0] p-3 text-sm font-semibold outline-none focus:border-[#15803D]"
              />
              <div className="mt-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-[11px] font-bold leading-relaxed text-amber-800">
                <AlertTriangle size={16} className="shrink-0" />
                Nhân viên sẽ xác minh hóa đơn, tình trạng sản phẩm và chính sách
                đổi trả trước khi phê duyệt.
              </div>
              <button
                type="button"
                onClick={submitReturnSupport}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15803D] font-black"
              >
                <RotateCcw size={18} />
                Gửi yêu cầu hoàn trả
              </button>
            </div>
          )}

          {supportView === "faq" && (
            <div className="max-h-[500px] space-y-2 overflow-y-auto p-4 [scrollbar-width:none]">
              {faqItems.map(([question, answer], index) => (
                <div
                  key={question}
                  className="overflow-hidden rounded-xl border border-[#E2E8F0]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setFaqOpen((value) => (value === index ? null : index))
                    }
                    className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3 text-left text-sm font-black hover:bg-[#F8FAFC]"
                  >
                    <span>{question}</span>
                    <ChevronRight
                      size={17}
                      className={`shrink-0 transition-transform ${faqOpen === index ? "rotate-90" : ""}`}
                    />
                  </button>
                  {faqOpen === index && (
                    <p className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs font-semibold leading-relaxed text-[#64748B]">
                      {answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MiniCartButton({
  onClick,
  count,
  total,
  className = "",
}: {
  onClick: () => void;
  count: number;
  total: number;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`z-20 flex h-12 items-center gap-2 rounded-xl border border-[#15803D]/75 bg-[#0F172A]/92 px-4 text-sm font-bold text-white shadow-[0_0_16px_rgba(249,115,22,.2)]  hover:bg-[#0F172A] ${className}`}
    >
      <ShoppingCart size={20} />
      <span>
        {count} món - <b className="text-[#15803D]">{formatMoney(total)}</b>
      </span>
    </button>
  );
}

export function QuickListButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Mở danh sách mua sắm nhóm"
      className={`flex h-12 w-12 items-center justify-center rounded-xl border border-[#15803D]/75 bg-[#0F172A]/92 text-[#15803D] shadow-[0_0_16px_rgba(249,115,22,.2)]  hover:bg-[#0F172A] hover:text-white transition-colors ${className}`}
    >
      <FileText size={22} />
    </button>
  );
}

export function BottomNav({
  active,
  onChange,
  cartCount,
}: {
  active: Screen;
  onChange: (screen: Screen) => void;
  cartCount: number;
}) {
  const tabs = [
    ["home", Home, "Trang chủ"],
    ["map", Map, "Bản đồ & AI"],
    ["account", UserRound, "Tài khoản"],
  ] as const;
  return (
    <nav className="flex h-[82px] shrink-0 items-center gap-3 border-t border-[#E2E8F0] bg-white px-6 shadow-[0_-8px_28px_rgba(17,17,17,.06)] ">
      {tabs.map(([id, Icon, label]) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative flex h-[62px] flex-1 items-center justify-center gap-2.5 rounded-2xl px-3 transition-all duration-300 ${isActive ? "bg-[#D1FAE5] border border-[#8CB867]/40 text-[#15803D] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] scale-[1.02]" : "text-[#475569] hover:bg-[#F1F5F9] border border-transparent"}`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${isActive ? "bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]" : "bg-[#F1F5F9] text-[#334155]"}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
            </span>
            <span
              className={`text-xs font-black tracking-wide ${isActive ? "text-[#334155]" : "text-[#475569]"}`}
            >
              {label}
            </span>
            {id === "home" && cartCount > 0 && (
              <span className="absolute right-3 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#15803D] px-1 text-[9px] text-white font-black">
                {cartCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// --- SCREEN: HỆ THỐNG GIAO DIỆN QUẢN TRỊ ADMIN ---

export function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center bg-[#334155]/50 p-8 ">
      <div className="w-full max-w-[560px] rounded-3xl border border-[#15803D] bg-white p-8 shadow-[0_0_32px_rgba(249,115,22,.35)]">
        <div className="text-center text-[#334155] [&>h2]:text-2xl [&>h2]:font-black">
          {children}
        </div>
      </div>
    </div>
  );
}