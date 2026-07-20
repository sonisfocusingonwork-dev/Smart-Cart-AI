import React, { useState, useEffect } from "react";
import { api } from "../api";

import {
  Wrench,
  Cpu,
  RefreshCw,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Activity,
  AlertTriangle,
  Eye,
  FileText,
  Check,
  X,
  Settings,
  Layers,
  ShieldAlert,
  Smartphone,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  UserCheck,
  LifeBuoy,
  ChevronDown,
  Camera,
} from "lucide-react";
import Barcode from "react-barcode";
import { BrowserMultiFormatReader } from "@zxing/library";
import type { Product } from "../shared";
import { BarcodeCameraScanner } from "../components/ui/BarcodeCameraScanner";
import { SystemSettingsScreen } from "./SystemSettingsScreen";
import { useBranch } from "../contexts/BranchContext";
import { useSocket } from "../hooks/useSocket";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  "Hàng tươi sống": "#EF4444",
  "Thực phẩm khô & đồ uống": "#F59E0B",
  "Đông lạnh": "#0EA5E9",
  "Gia vị": "#8B5CF6",
  "Đồ gia dụng": "#64748B",
  "Mẹ & Bé": "#EC4899",
  "Hóa mỹ phẩm": "#10B981",
};

// Interfaces

interface Cart {
  id: string;
  name: string;
  status: "active" | "inactive" | "maintenance";
  battery: number;
  lastConnected: string;
  currentSession?: string;
  currentCustomer?: {
    _id: string;
    fullName: string;
  };
  hardwareStatus?: {
    camera: "Good" | "Error";
    scale: "Good" | "Error";
    barcodeScanner: "Good" | "Error";
  };
  currentZone?: string;
  coordinates?: {
    x: number;
    y: number;
  };
  batteryLevel?: number;
}

interface SessionItem {
  name: string;
  qty: number;
  price: number;
  addedAt: string;
}

interface SecurityAlert {
  id: string;
  cartId: string;
  cartName: string;
  time: string;
  type: "Lệch cân nặng" | "Camera AI phát hiện vật lạ";
  severity: "high" | "medium";
  status: "pending" | "resolved";
  details: string;
}

const getCategoryDisplay = (category: string) => {
  switch (category) {
    case "Hàng tươi sống":
      return {
        label: "🥩 Tươi sống",
        badgeClass: "bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20",
      };
    case "Thực phẩm khô & đồ uống":
      return {
        label: "📦 Đồ khô & Nước",
        badgeClass: "bg-[#FEF3C7] text-[#D97706] border border-amber-500/20",
      };
    case "Đông lạnh":
      return {
        label: "❄️ Đông lạnh",
        badgeClass: "bg-[#E0F2FE] text-[#0284C7] border border-sky-500/20",
      };
    default:
      return {
        label: category,
        badgeClass: "bg-slate-500/10 text-[#94A3B8] border border-slate-500/20",
      };
  }
};

const AccordionChartRow = ({
  item,
  maxValue,
  color,
  type,
}: {
  item: any;
  maxValue: number;
  color: string;
  type: "revenue" | "volume";
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse numerical values to calculate ratio width
  const val = type === "revenue" 
    ? parseFloat(item.revenue.replace(/[^0-9.]/g, "")) 
    : parseFloat(item.volume.replace(/[^0-9.]/g, ""));
    
  const percent = maxValue > 0 ? (val / maxValue) * 100 : 0;
  const displayValue = type === "revenue" ? item.revenue : item.volume;
  const trackColor = "bg-transparent";

  return (
    <div className="flex flex-col rounded-2xl hover:bg-[#F8FAFC] transition-colors border border-transparent hover:border-[#E2E8F0]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-4 w-full p-3 text-left outline-none"
      >
        <div className="flex items-center gap-3 w-32 shrink-0">
          <ChevronDown
            size={18}
            className={`text-[#94A3B8] transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180" : ""
            }`}
          />
          <span className="text-[#334155] font-bold text-sm truncate">
            {item.name}
          </span>
        </div>
        
        <div className={`flex-1 h-3 ${trackColor} rounded-full overflow-hidden flex items-center`}>
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
        
        <div
          className="w-14 shrink-0 text-right font-black text-sm"
          style={{ color }}
        >
          {displayValue}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-40 opacity-100 mb-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-12 mr-3 px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-sm text-[#475569] shadow-sm">
          {item.details && item.details.length > 0 ? (
            <ul className="space-y-1.5 list-disc pl-4">
              {item.details.map((d: string, i: number) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          ) : (
            <span className="italic text-[#94A3B8]">Chưa có chi tiết bổ sung.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export function AdminDashboardScreen({
  logout,
  adminName,
}: {
  logout: () => void;
  adminName: string;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "carts" | "settings"
  >("overview");
  const currentRole =
    typeof window !== "undefined"
      ? window.localStorage.getItem("smartcart-user-role")
      : "Tech";

  // --- BACKEND API DATA LOAD ---
  const [products, setProducts] = useState<Product[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- CARTS ADVANCED TABLE & MAP VIEWS STATE ---
  const [cartsViewMode, setCartsViewMode] = useState<"list" | "map">("list");
  const [cartSearch, setCartSearch] = useState("");
  const [cartStatusFilter, setCartStatusFilter] = useState("all");
  const [cartBatteryFilter, setCartBatteryFilter] = useState("all");
  const [cartPage, setCartPage] = useState(1);
  const [cartLimit, setCartLimit] = useState(50);
  const [cartSortBy, setCartSortBy] = useState("id");
  const [cartSortOrder, setCartSortOrder] = useState<"asc" | "desc">("asc");
  const [tableCarts, setTableCarts] = useState<Cart[]>([]);
  const [tableCartsTotal, setTableCartsTotal] = useState(0);
  const [checkedCartIds, setCheckedCartIds] = useState<string[]>([]);
  const [selectedMapCart, setSelectedMapCart] = useState<Cart | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const [sessionItems, setSessionItems] = useState<
    Record<string, SessionItem[]>
  >({});

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // CRUD Product Form States
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] =
    useState<Product["category"]>("Hàng tươi sống");
  const [formSubCategory, setFormSubCategory] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formQuantity, setFormQuantity] = useState(0);
  const [formStockLevel, setFormStockLevel] = useState(0);
  const [formRevenue, setFormRevenue] = useState(0);
  const [formBarcode, setFormBarcode] = useState("");
  const [formBarcodeError, setFormBarcodeError] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Product list filter states
  const [productSearch, setProductSearch] = useState("");
  const [selectedProdCat, setSelectedProdCat] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    const handleNewTicket = (ticket: any) => {
      setToastMessage({
        title: "YÊU CẦU HỖ TRỢ MỚI",
        message: `Xe ${ticket.cartId} đang cần hỗ trợ tại khu vực ${ticket.locationZone}`,
      });
      // Auto-hide toast after 5s
      setTimeout(() => setToastMessage(null), 5000);
    };

    const handleInventoryUpdated = async () => {
      try {
        const prodData = await api.getProducts();
        setProducts(prodData);
      } catch (err) {
        console.error("Lỗi khi tải lại kho hàng:", err);
      }
    };

    const handleCartUpdated = async () => {
      try {
        const cartsData = await api.getCarts();
        setCarts(cartsData);
      } catch (err) {
        console.error("Lỗi khi tải lại danh sách xe đẩy:", err);
      }
    };

    socket.on("admin-new-ticket", handleNewTicket);
    socket.on("inventory-updated", handleInventoryUpdated);
    socket.on("cart-updated", handleCartUpdated);

    return () => {
      socket.off("admin-new-ticket", handleNewTicket);
      socket.off("inventory-updated", handleInventoryUpdated);
      socket.off("cart-updated", handleCartUpdated);
    };
  }, [socket]);

  // Carts CRUD State
  const [cartFormOpen, setCartFormOpen] = useState(false);
  const [editingCart, setEditingCart] = useState<Cart | null>(null);
  const [cartFormId, setCartFormId] = useState("");
  const [cartFormName, setCartFormName] = useState("");
  const [cartFormStatus, setCartFormStatus] =
    useState<Cart["status"]>("active");
  const [cartFormBattery, setCartFormBattery] = useState(100);

  // Live Session View Panel State
  const [selectedSessionCart, setSelectedSessionCart] = useState<Cart | null>(
    null,
  );
  const [sessionDrawerOpen, setSessionDrawerOpen] = useState(false);

  const { selectedBranchId, setSelectedBranchId } = useBranch();
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    if (
      currentRole === "RootAdmin" ||
      currentRole === "StoreManager" ||
      currentRole === "admin"
    ) {
      api
        .getBranches()
        .then((data) => setBranches(data))
        .catch(console.error);
    }
  }, [currentRole]);

  const loadTableCarts = async () => {
    try {
      const response = await api.getCarts({
        page: cartPage,
        limit: cartLimit,
        search: cartSearch,
        status: cartStatusFilter,
        batteryLevel: cartBatteryFilter,
        sortBy: cartSortBy,
        sortOrder: cartSortOrder,
      });
      if (response && response.carts) {
        setTableCarts(response.carts);
        setTableCartsTotal(response.total);
      } else if (Array.isArray(response)) {
        setTableCarts(response);
        setTableCartsTotal(response.length);
      }
    } catch (err) {
      console.error("Failed to load table carts:", err);
    }
  };

  useEffect(() => {
    loadTableCarts();
  }, [
    cartPage,
    cartSearch,
    cartStatusFilter,
    cartBatteryFilter,
    cartSortBy,
    cartSortOrder,
  ]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const prodData = await api.getProducts();
        if (active) setProducts(prodData);

        const cartData = await api.getCarts();
        if (active) setCarts(cartData);

        const analytics = await api.getAnalyticsOverview();
        if (active) setAnalyticsData(analytics);

        // Nạp các mặt hàng trong session nhóm hiện tại của xe đẩy
        const sessionMap: Record<string, SessionItem[]> = {};
        for (const cart of cartData) {
          if (cart.currentSession) {
            try {
              const session = await api.getGroupSession(cart.currentSession);
              if (session && session.items) {
                sessionMap[cart.currentSession] = session.items.map(
                  (item: any) => ({
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    addedAt: new Date(session.updatedAt).toLocaleTimeString(
                      "vi-VN",
                    ),
                  }),
                );
              }
            } catch {
              // Mặc định fallback nếu không tồn tại session trên db
              sessionMap[cart.currentSession] = [
                {
                  name: "Sữa Tươi Tiệt Trùng Vinamilk 1L",
                  qty: 1,
                  price: 36000,
                  addedAt: "Vừa xong",
                },
              ];
            }
          }
        }
        if (active) setSessionItems((prev) => ({ ...prev, ...sessionMap }));
      } catch (err) {
        console.error("Error loading admin data from API:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // --- CHART INTERACTIONS & DATA PREPARATION ---

  // Interactive Detail View Category Selected (for Pie Chart)
  const [selectedChartCategory, setSelectedChartCategory] =
    useState<Product["category"]>("Hàng tươi sống");

  // Sum data by Category for the Bar Chart
  const barChartData = analyticsData?.barChartData || [];
  const totalQuantitySum = products.reduce((sum, p) => sum + p.stockLevel, 0); // Keep stock level local sum for now, or use total from BE
  const totalRevenueSum = analyticsData?.totalRevenue || 0;
  const lowStockCount = React.useMemo(
    () => products.filter((p) => p.stockLevel < 10).length,
    [products],
  );

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.subCategory.toLowerCase().includes(productSearch.toLowerCase());
      const matchCat =
        selectedProdCat === "all" || p.category === selectedProdCat;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, selectedProdCat]);

  // Data for Minimalist Horizontal Bar Charts
  const CATEGORY_PERFORMANCE = React.useMemo(() => [
    { name: "🥬 Rau củ", revenue: "52M", volume: "3200", details: ["Cải thìa: 12M", "Xà lách: 15M", "Cà chua: 25M"] },
    { name: "🥤 Đồ uống", revenue: "48M", volume: "2900", details: ["Nước suối: 10M", "Nước ngọt: 20M", "Trà: 18M"] },
    { name: "🥩 Thịt", revenue: "45M", volume: "1800", details: ["Thịt bò: 25M", "Thịt heo: 15M", "Gà: 5M"] },
    { name: "🍜 Khô", revenue: "41M", volume: "1700", details: ["Mì tôm: 20M", "Gạo: 21M"] },
  ], []);

  const maxRevenue = React.useMemo(() => Math.max(
    ...CATEGORY_PERFORMANCE.map(item => parseFloat(item.revenue.replace(/[^0-9.]/g, "")))
  ), [CATEGORY_PERFORMANCE]);

  const maxVolume = React.useMemo(() => Math.max(
    ...CATEGORY_PERFORMANCE.map(item => parseFloat(item.volume.replace(/[^0-9.]/g, "")))
  ), [CATEGORY_PERFORMANCE]);

  // Donut chart data for Cart status
  const donutChartData = analyticsData?.donutChartData || [];

  const totalCartsCount = carts.length;

  // --- PRODUCT CRUD OPERATIONS (FIXED ID DUPLICATION) ---

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormId(`SP${Date.now().toString().slice(-6)}`);
    setFormBarcode("");
    setFormBarcodeError("");
    setFormName("");
    setFormCategory("Hàng tươi sống");
    setFormSubCategory("");
    setFormPrice(0);
    setFormQuantity(0);
    setFormStockLevel(0);
    setFormRevenue(0);
    setProductFormOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormId(product.id);
    setFormBarcode(product.barcode || "");
    setFormBarcodeError("");
    setFormName(product.name);
    setFormCategory(product.category);
    setFormSubCategory(product.subCategory);
    setFormPrice(product.price);
    setFormQuantity(product.quantity);
    setFormStockLevel(product.stockLevel);
    setFormRevenue(product.revenue);
    setIsScannerOpen(false);
    setProductFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormBarcodeError("");
    
    if (!formBarcode.trim()) {
      setFormBarcodeError("Vui lòng nhập hoặc quét Mã Barcode");
      return;
    }
    
    if (
      !formName.trim() ||
      !formSubCategory.trim() ||
      formPrice <= 0 ||
      formQuantity < 0
    ) {
      alert("Vui lòng điền đúng thông tin sản phẩm!");
      return;
    }

    try {
      const parsedStock = Number(formQuantity);
      
      if (editingProduct) {
        const updated = await api.updateProduct(formId, {
          name: formName,
          category: formCategory,
          subCategory: formSubCategory,
          price: Number(formPrice),
          quantity: parsedStock,
          stockLevel: parsedStock,
          revenue: Number(formRevenue) || 0,
          barcode: formBarcode,
        });
        
        setProducts((prevProducts) => 
          prevProducts.map((p) => (p.id === formId ? { ...updated, stockLevel: parsedStock } : p))
        );
      } else {
        const created = await api.createProduct({
          id: formId,
          name: formName,
          category: formCategory,
          subCategory: formSubCategory,
          price: Number(formPrice),
          quantity: parsedStock,
          stockLevel: parsedStock,
          revenue: Number(formRevenue) || 0,
          barcode: formBarcode,
        });
        
        setProducts((prevProducts) => [...prevProducts, { ...created, stockLevel: parsedStock }]);
      }
      
      setProductFormOpen(false);
    } catch (err: any) {
      if (err.message === "Mã barcode này đã tồn tại trong hệ thống.") {
        setFormBarcodeError(err.message);
      } else {
        alert("Lỗi khi lưu sản phẩm: " + err.message);
      }
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm: ${name}?`)) {
      try {
        await api.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        await api.createLog({
          msg: `Sản phẩm [${id}] - ${name} đã bị xóa khỏi hệ thống.`,
          type: "warning",
          time: new Date().toLocaleTimeString("vi-VN"),
        });
        const logs = await api.getLogs();
        setSystemLogs(logs);
      } catch (err) {
        alert("Lỗi khi xóa sản phẩm: " + (err as Error).message);
      }
    }
  };

  // --- CARTS CRUD & INTERACTIVE ACTIONS (FULLY SYNCHRONIZED) ---

  const handleOpenAddCart = () => {
    setEditingCart(null);
    const maxIdNum = carts.reduce((max, c) => {
      const num = parseInt(c.id.replace(/\D/g, ""), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `C${String(maxIdNum + 1).padStart(3, "0")}`;

    setCartFormId(nextId);
    setCartFormName(
      `Xe đẩy Smart Cart ${String(maxIdNum + 1).padStart(2, "0")}`,
    );
    setCartFormStatus("active");
    setCartFormBattery(100);
    setCartFormOpen(true);
  };

  const handleOpenEditCart = (cart: Cart) => {
    setEditingCart(cart);
    setCartFormId(cart.id);
    setCartFormName(cart.name);
    setCartFormStatus(cart.status);
    setCartFormBattery(cart.battery);
    setCartFormOpen(true);
  };

  const handleSaveCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartFormName.trim() || cartFormBattery < 0 || cartFormBattery > 100) {
      alert("Thông tin xe đẩy không hợp lệ!");
      return;
    }

    try {
      if (editingCart) {
        const updated = await api.updateCart(cartFormId, {
          name: cartFormName,
          status: cartFormStatus,
          battery: cartFormBattery,
        });
        setCarts((prev) =>
          prev.map((c) => (c.id === cartFormId ? updated : c)),
        );
        loadTableCarts();
        await api.createLog({
          msg: `Thông tin [${cartFormId}] - ${cartFormName} đã được cập nhật.`,
          type: "success",
          time: new Date().toLocaleTimeString("vi-VN"),
        });
      } else {
        const created = await api.createCart({
          id: cartFormId,
          name: cartFormName,
          status: cartFormStatus,
          battery: cartFormBattery,
          lastConnected: "Vừa xong",
        });
        setCarts((prev) => [...prev, created]);
        loadTableCarts();
        await api.createLog({
          msg: `Xe đẩy mới [${cartFormId}] đã được đăng ký trên hệ thống Gateway.`,
          type: "success",
          time: new Date().toLocaleTimeString("vi-VN"),
        });
      }
      setCartFormOpen(false);
      const logs = await api.getLogs();
      setSystemLogs(logs);
    } catch (err) {
      alert("Lỗi khi lưu thông tin xe đẩy: " + (err as Error).message);
    }
  };

  const handleDeleteCart = async (id: string, name: string) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn gỡ bỏ xe đẩy: ${name} khỏi hệ thống?`,
      )
    ) {
      try {
        await api.deleteCart(id);
        setCarts((prev) => prev.filter((c) => c.id !== id));
        loadTableCarts();
        await api.createLog({
          msg: `Xe đẩy [${id}] đã bị gỡ kết nối khỏi hệ thống.`,
          type: "danger",
          time: new Date().toLocaleTimeString("vi-VN"),
        });
        const logs = await api.getLogs();
        setSystemLogs(logs);
      } catch (err) {
        alert("Lỗi khi gỡ bỏ xe đẩy: " + (err as Error).message);
      }
    }
  };

  const handleForceCheckout = async (cartId: string, sessionCode: string) => {
    if (
      window.confirm(
        `Xác nhận thanh toán cưỡng bức & kết thúc phiên mua sắm ${sessionCode} trên Xe đẩy ${cartId}?`,
      )
    ) {
      try {
        await api.leaveGroupSession(sessionCode, {
          cartId,
          groupRole: "host",
          sourceId: "admin",
        });
        const updated = await api.updateCart(cartId, { currentSession: "" });
        setCarts((prev) => prev.map((c) => (c.id === cartId ? updated : c)));
        loadTableCarts();

        await api.createLog({
          msg: `Đã ngắt kết nối & Hoàn tất cưỡng bức phiên mua sắm ${sessionCode} của xe đẩy [${cartId}].`,
          type: "info",
          time: new Date().toLocaleTimeString("vi-VN"),
        });
        setSessionDrawerOpen(false);
        const logs = await api.getLogs();
        setSystemLogs(logs);
      } catch (err) {
        alert("Lỗi khi kết thúc phiên mua sắm: " + (err as Error).message);
      }
    }
  };

  const handleLockWheels = async (cartId: string, cartName: string) => {
    if (
      window.confirm(
        `Gửi lệnh khóa cứng bánh xe từ xa tới thiết bị ${cartName}?`,
      )
    ) {
      try {
        const updated = await api.updateCart(cartId, { status: "maintenance" });
        setCarts((prev) => prev.map((c) => (c.id === cartId ? updated : c)));
        loadTableCarts();

        const pendingAlert = alerts.find(
          (a) => a.cartId === cartId && a.status === "pending",
        );
        if (pendingAlert) {
          await api.updateAlert(pendingAlert.id, { status: "resolved" });
          setAlerts((prev) =>
            prev.map((a) =>
              a.id === pendingAlert.id ? { ...a, status: "resolved" } : a,
            ),
          );
        }

        await api.createLog({
          msg: `Gửi lệnh KHÓA BÁNH XE đẩy [${cartId}] thành công. Xe đã tự động chuyển sang chế độ Bảo Trì.`,
          type: "danger",
          time: new Date().toLocaleTimeString("vi-VN"),
        });
        if (selectedSessionCart && selectedSessionCart.id === cartId) {
          setSelectedSessionCart((prev) =>
            prev ? { ...prev, status: "maintenance" } : null,
          );
        }
        const logs = await api.getLogs();
        setSystemLogs(logs);
      } catch (err) {
        alert("Lỗi khi khóa bánh xe: " + (err as Error).message);
      }
    }
  };

  const handleBulkUpdateStatus = async (status: string) => {
    if (checkedCartIds.length === 0) return;
    try {
      await api.bulkUpdateCarts(checkedCartIds, status);
      setCheckedCartIds([]);
      loadTableCarts();
      const data = await api.getCarts();
      setCarts(data);
      await api.createLog({
        msg: `Đã cập nhật trạng thái hàng loạt sang [${status === "active" ? "Đang chạy" : status === "inactive" ? "Ngoại tuyến" : "Bảo trì"}] thành công.`,
        type: "success",
        time: new Date().toLocaleTimeString("vi-VN"),
      });
      const logs = await api.getLogs();
      setSystemLogs(logs);
    } catch (err) {
      alert("Lỗi khi cập nhật hàng loạt: " + (err as Error).message);
    }
  };

  const handleRebootScreen = (cartId: string, cartName: string) => {
    alert(
      `Đang gửi tín hiệu Restart Gateway tới ${cartName}... Tablet đang khởi động lại.`,
    );
    api
      .createLog({
        msg: `Đã gửi yêu cầu khởi động lại màn hình máy tính bảng trên [${cartId}].`,
        type: "warning",
        time: new Date().toLocaleTimeString("vi-VN"),
      })
      .then(() => api.getLogs())
      .then((logs) => setSystemLogs(logs));
  };

  const handleResolveAlert = async (alertId: string, cartId: string) => {
    try {
      const updated = await api.updateAlert(alertId, { status: "resolved" });
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      await api.createLog({
        msg: `Cảnh báo an ninh [${alertId}] đã được Kỹ thuật viên phê duyệt Bỏ qua (Resolved).`,
        type: "success",
        time: new Date().toLocaleTimeString("vi-VN"),
      });
      const logs = await api.getLogs();
      setSystemLogs(logs);
    } catch (err) {
      alert("Lỗi khi duyệt cảnh báo: " + (err as Error).message);
    }
  };

  const formatMoney = (val: number) => {
    return val.toLocaleString("vi-VN") + "đ";
  };

  return (
    <section className="flex h-full min-h-0 w-full bg-white text-[#334155] font-sans relative overflow-hidden">
      {/* SIDEBAR */}
      <aside
        className={`${sidebarCollapsed ? "w-20" : "w-64"} shrink-0 bg-transparent border-r border-[#E2E8F0] flex flex-col justify-between z-20 transition-all duration-300 relative`}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-5 -right-3 h-6 w-6 rounded-full bg-[#15803D] text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] hover:bg-[#15803D] transition-all z-30 cursor-pointer border border-[#E2E8F0]"
          title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={12} />
          ) : (
            <ChevronLeft size={12} />
          )}
        </button>

        <div>
          {/* Brand Header */}
          <div
            className={`h-16 flex items-center ${sidebarCollapsed ? "justify-center px-0" : "px-6"} border-b border-[#E2E8F0] gap-3`}
          >
            <div className="h-9 w-9 rounded-2xl bg-[#15803D] flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] shrink-0">
              <Wrench size={18} />
            </div>
            {!sidebarCollapsed && (
              <div className="animate-fade-in whitespace-nowrap">
                <h2 className="text-sm font-black tracking-widest text-[#334155] uppercase">
                  Smart Cart
                </h2>
                <span className="text-[10px] text-[#15803D] font-bold block leading-none">
                  ADMIN DASHBOARD
                </span>
              </div>
            )}
          </div>

          {/* User profile brief */}
          <div
            className={`p-4 ${sidebarCollapsed ? "mx-2 px-2 justify-center" : "mx-3"} my-4 rounded-2xl bg-white border border-[#E2E8F0] flex items-center gap-3`}
          >
            <div className="h-10 w-10 rounded-full bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-center font-bold text-[#15803D] shrink-0">
              AD
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1 animate-fade-in whitespace-nowrap">
                <span className="text-xs text-[#94A3B8] block font-semibold leading-none">
                  Kỹ thuật viên
                </span>
                <span className="text-sm font-bold text-[#334155] block mt-1 truncate">
                  {adminName}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center py-3.5 px-0" : "gap-3 px-4 py-3"} rounded-2xl text-sm font-extrabold transition-all ${
                activeTab === "overview"
                  ? "bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]"
                  : "text-[#94A3B8] hover:bg-white hover:text-[#334155]"
              }`}
              title="Doanh Thu & Hàng Hóa"
            >
              <LayoutDashboard size={18} className="shrink-0" />
              {!sidebarCollapsed && (
                <span className="animate-fade-in whitespace-nowrap">
                  Doanh Thu & Hàng Hóa
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center py-3.5 px-0" : "gap-3 px-4 py-3"} rounded-2xl text-sm font-extrabold transition-all ${
                activeTab === "products"
                  ? "bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]"
                  : "text-[#94A3B8] hover:bg-white hover:text-[#334155]"
              }`}
              title="Quản Lý Sản Phẩm"
            >
              <ShoppingBag size={18} className="shrink-0" />
              {!sidebarCollapsed && (
                <span className="animate-fade-in whitespace-nowrap">
                  Quản Lý Sản Phẩm
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("carts")}
              className={`w-full flex items-center ${sidebarCollapsed ? "justify-center py-3.5 px-0" : "gap-3 px-4 py-3"} rounded-2xl text-sm font-extrabold transition-all ${
                activeTab === "carts"
                  ? "bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]"
                  : "text-[#94A3B8] hover:bg-white hover:text-[#334155]"
              }`}
              title="Trạng Thái Xe Đẩy"
            >
              <ShoppingCart size={18} className="shrink-0" />
              {!sidebarCollapsed && (
                <span className="animate-fade-in whitespace-nowrap">
                  Trạng Thái Xe Đẩy
                </span>
              )}
            </button>

            {(currentRole === "RootAdmin" ||
              currentRole === "StoreManager" ||
              currentRole === "admin") && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center ${sidebarCollapsed ? "justify-center py-3.5 px-0" : "gap-3 px-4 py-3"} rounded-2xl text-sm font-extrabold transition-all ${
                  activeTab === "settings"
                    ? "bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]"
                    : "text-[#94A3B8] hover:bg-white hover:text-[#334155]"
                }`}
                title="Cài đặt hệ thống"
              >
                <Settings size={18} className="shrink-0" />
                {!sidebarCollapsed && (
                  <span className="animate-fade-in whitespace-nowrap">
                    Cài đặt hệ thống
                  </span>
                )}
              </button>
            )}


          </nav>
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-[#E2E8F0]">
          <button
            onClick={logout}
            className={`w-full flex items-center justify-center ${sidebarCollapsed ? "h-11 py-3 px-0" : "gap-2 h-11"} rounded-2xl bg-[#15803D]/10 hover:bg-[#15803D]/20 text-[#15803D] text-sm font-black border border-[#15803D]/20 transition-all cursor-pointer`}
            title="Đăng xuất Admin"
          >
            <LogOut size={16} className="shrink-0" />
            {!sidebarCollapsed && (
              <span className="animate-fade-in whitespace-nowrap">
                Đăng xuất Admin
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 border-b border-[#E2E8F0] bg-transparent px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black uppercase text-[#334155] tracking-wide">
              {activeTab === "overview" && "Doanh Thu & Tồn Kho Đồng Bộ"}
              {activeTab === "products" && "Hệ Thống Quản Lý Sản Phẩm"}
              {activeTab === "carts" && "Giám Sát Hệ Thống Xe Đẩy Thông Minh"}
              {activeTab === "staff" && "Quản Lý Nhân Viên"}
              {activeTab === "settings" && "Cài Đặt Hệ Thống"}
            </h1>
          </div>

          <div className="flex items-center gap-4">


            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#15803D]/10 border border-[#15803D]/20 text-[#8CB867] text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-[#15803D] animate-ping" />
              <span>Gateway Live: Online</span>
            </div>

            {(currentRole === "RootAdmin" || currentRole === "admin") && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-[#E2E8F0] text-[#334155] text-xs font-bold">
                <Building2 size={14} className="text-[#15803D]" />
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-transparent border-none text-[#334155] focus:outline-none focus:ring-0 text-xs font-bold cursor-pointer"
                >
                  <option value="all" className="bg-white">
                    Tất cả Chi Nhánh
                  </option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id} className="bg-white">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="h-4 w-px bg-white" />
            <span className="text-xs text-[#94A3B8] font-semibold">
              Phiên làm việc: <b className="text-[#15803D]">Root-Mode</b>
            </span>
          </div>
        </header>

        {/* Tab content area */}
        <div className="flex-1 overflow-y-auto p-8 [scrollbar-width:none]">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]">
                  <div>
                    <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                      Tổng Doanh Thu Hàng Hóa
                    </span>
                    <b className="text-2xl font-black text-[#15803D] mt-2 block">
                      {formatMoney(
                        products.reduce((acc, p) => acc + p.revenue, 0),
                      )}
                    </b>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-[#15803D]/10 border border-[#15803D]/20 flex items-center justify-center text-[#15803D]">
                    <Layers size={22} />
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]">
                  <div>
                    <span className="text-xs font-bold text-[#334155] block uppercase tracking-wider">
                      Tổng Sản Phẩm Trong Kho
                    </span>
                    <b className="text-2xl font-black text-[#15803D] mt-2 block">
                      {products
                        .reduce((acc, p) => acc + (p.stockLevel || 0), 0)
                        .toLocaleString()}{" "}
                      sản phẩm
                    </b>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-[#15803D]/20 border border-[#15803D]/30 flex items-center justify-center text-[#15803D]">
                    <ShoppingBag size={22} />
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]">
                  <div>
                    <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                      Hiệu Suất Đồng Bộ Kho
                    </span>
                    <b className="text-2xl font-black text-[#15803D] mt-2 block">
                      100% Online
                    </b>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-[#15803D]/10 border border-[#15803D]/20 flex items-center justify-center text-[#15803D]">
                    <Activity size={22} />
                  </div>
                </div>
              </div>

              {/* Minimalist Horizontal Bar Charts */}
              <div className="flex flex-col gap-6">
                
                {/* Chart A: Doanh Thu */}
                <div className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] flex flex-col">
                  <h3 className="text-base font-black text-[#334155] uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-[#15803D]" />
                    Doanh thu theo danh mục
                  </h3>
                  <div className="space-y-3 mt-2">
                    {CATEGORY_PERFORMANCE.map((item, idx) => (
                      <AccordionChartRow
                        key={idx}
                        item={item}
                        maxValue={maxRevenue}
                        color="#15803D"
                        type="revenue"
                      />
                    ))}
                  </div>
                </div>

                {/* Chart B: Số Lượng Bán */}
                <div className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] flex flex-col">
                  <h3 className="text-base font-black text-[#334155] uppercase tracking-wider mb-6 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#8CB867]" />
                    Số lượng bán theo danh mục
                  </h3>
                  <div className="space-y-3 mt-2">
                    {CATEGORY_PERFORMANCE.map((item, idx) => (
                      <AccordionChartRow
                        key={idx}
                        item={item}
                        maxValue={maxVolume}
                        color="#8CB867"
                        type="volume"
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD MANAGEMENT */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Product Stats Briefs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] flex flex-col justify-between">
                  <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                    Tổng sản phẩm
                  </span>
                  <b className="text-2xl font-black text-[#334155] mt-1 block">
                    {products.length} dòng sản phẩm
                  </b>
                </div>
                <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] flex flex-col justify-between">
                  <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                    Tổng số lượng tồn
                  </span>
                  <b className="text-2xl font-black text-[#15803D] mt-1 block">
                    {totalQuantitySum.toLocaleString()} món
                  </b>
                </div>
                <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] flex flex-col justify-between">
                  <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                    Tổng doanh thu lũy kế
                  </span>
                  <b className="text-2xl font-black text-[#8CB867] mt-1 block">
                    {formatMoney(totalRevenueSum)}
                  </b>
                </div>
                <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] flex flex-col justify-between">
                  <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                    Sản phẩm sắp hết hàng
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <b
                      className={`text-2xl font-black ${lowStockCount > 0 ? "text-[#15803D]" : "text-[#475569]"}`}
                    >
                      {lowStockCount} sản phẩm
                    </b>
                    {lowStockCount > 0 && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#15803D] animate-ping shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Controls bar: Search, Filters & Add button */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#E2E8F0]">
                <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                  {/* Search input */}
                  <div className="relative flex-1 max-w-md">
                    <Search
                      size={16}
                      className="absolute left-4 top-3 text-[#94A3B8]"
                    />
                    <input
                      type="text"
                      placeholder="Tìm theo mã, tên hoặc phân loại..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="h-10 w-full rounded-2xl bg-white pl-11 pr-4 text-xs font-bold text-[#334155] placeholder-slate-500 outline-none ring-[#D3524B]/50 focus:bg-white focus:ring-2 transition-all border border-[#E2E8F0]"
                    />
                    {productSearch && (
                      <button
                        onClick={() => setProductSearch("")}
                        className="absolute right-3 top-2.5 text-xs text-[#94A3B8] hover:text-[#334155] font-extrabold"
                      >
                        Xóa
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
                    {[
                      { id: "all", label: "✨ Tất cả" },
                      { id: "Hàng tươi sống", label: "🥩 Tươi sống" },
                      {
                        id: "Thực phẩm khô & đồ uống",
                        label: "📦 Đồ khô & Nước",
                      },
                      { id: "Đông lạnh", label: "❄️ Đông lạnh" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedProdCat(cat.id)}
                        className={`h-8 px-4 rounded-full text-[11px] font-black tracking-wider transition-all whitespace-nowrap ${
                          selectedProdCat === cat.id
                            ? "bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]"
                            : "bg-white text-[#94A3B8] border border-[#E2E8F0] hover:bg-white hover:text-[#334155]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add New Button */}
                <button
                  onClick={handleOpenAddProduct}
                  className="flex h-10 items-center justify-center gap-2 rounded-2xl bg-[#15803D] shadow-md px-5 text-xs font-black text-white hover:bg-[#15803D] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] transition-all active:scale-[0.98] shrink-0"
                >
                  <Plus size={16} />
                  <span>Thêm sản phẩm</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="rounded-3xl border border-[#E2E8F0] bg-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
                  <table className="w-full text-left border-collapse table-auto relative min-w-[1200px]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs text-[#94A3B8] font-black uppercase tracking-wider">
                        <th className="py-4 px-4 min-w-[200px]">
                          Mã Barcode
                        </th>
                        <th className="py-4 px-4 min-w-[200px]">
                          Tên sản phẩm
                        </th>
                        <th className="py-4 px-4 w-[18%] min-w-[150px]">
                          Danh mục gốc
                        </th>
                        <th className="py-4 px-4 w-[17%] min-w-[130px]">
                          Phân loại nhỏ
                        </th>
                        <th className="py-4 px-4 w-[12%] min-w-[100px] text-right">
                          Đơn giá
                        </th>
                        <th className="py-4 px-4 w-[15%] min-w-[110px] text-right">
                          Tồn kho
                        </th>
                        <th className="py-4 px-4 w-[10%] min-w-[90px] text-center">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-bold text-[#475569]">
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-white transition-colors"
                        >
                          <td className="py-4 px-4 min-w-[200px]">
                            {product.barcode ? (
                              <div className="bg-white rounded-lg p-1 inline-block border border-[#E2E8F0] shadow-sm">
                                <Barcode 
                                  value={product.barcode} 
                                  width={1} 
                                  height={35} 
                                  fontSize={10}
                                  margin={0}
                                  displayValue={true} 
                                  background="transparent"
                                />
                              </div>
                            ) : (
                              <span className="font-mono text-[#94A3B8] text-xs">Chưa có mã</span>
                            )}
                          </td>
                          <td
                            className="py-4 px-4 min-w-[200px] text-[#334155] font-extrabold truncate"
                            title={product.name}
                          >
                            <div className="flex items-center gap-2">
                              {product.name}
                              {product.lowStockAlert && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#15803D]/20 text-[#15803D] border border-[#15803D]/30 whitespace-nowrap animate-pulse">
                                  SẮP HẾT HÀNG
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 w-[18%] min-w-[150px] whitespace-nowrap">
                            {(() => {
                              const display = getCategoryDisplay(
                                product.category,
                              );
                              return (
                                <span
                                  className={`px-2.5 py-1 rounded-2xl text-[10px] font-black tracking-wider ${display.badgeClass} inline-block whitespace-nowrap`}
                                >
                                  {display.label}
                                </span>
                              );
                            })()}
                          </td>
                          <td
                            className="py-4 px-4 w-[17%] min-w-[130px] text-[#94A3B8] truncate"
                            title={product.subCategory}
                          >
                            {product.subCategory}
                          </td>
                          <td className="py-4 px-4 w-[12%] min-w-[100px] text-right text-[#334155] font-extrabold whitespace-nowrap">
                            {formatMoney(product.price)}
                          </td>
                          <td className="py-4 px-4 w-[15%] min-w-[110px] text-right whitespace-nowrap">
                            {product.stockLevel < 10 ? (
                              <div className="flex items-center justify-end gap-1.5 text-[#15803D] font-extrabold whitespace-nowrap">
                                <AlertTriangle
                                  size={12}
                                  className="animate-bounce shrink-0"
                                />
                                <span>
                                  {product.stockLevel.toLocaleString()} món
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#475569] whitespace-nowrap">
                                {product.stockLevel.toLocaleString()} món
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 w-[10%] min-w-[90px]">
                            <div className="flex items-center justify-center gap-2">
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEditProduct(product)}
                                className="h-8 w-8 rounded-2xl bg-white text-[#475569] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#15803D] hover:text-white hover:border-transparent transition-all"
                                title="Chỉnh sửa sản phẩm"
                              >
                                <Edit size={14} />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() =>
                                  handleDeleteProduct(product.id, product.name)
                                }
                                className="h-8 w-8 rounded-2xl bg-white text-[#15803D] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#15803D] hover:text-white hover:border-transparent transition-all"
                                title="Xóa sản phẩm"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="py-12 text-center text-[#94A3B8] text-sm font-bold flex flex-col items-center justify-center gap-2">
                    <Info size={24} className="text-slate-600" />
                    <span>
                      Không tìm thấy sản phẩm nào khớp với điều kiện lọc!
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SMART CART MONITORING & DONUT CHART & LIVE SESSION DETAIL */}
          {activeTab === "carts" && (
            <div className="space-y-6">
              {/* Stat Briefs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
                  <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                    Tổng số xe đẩy
                  </span>
                  <b className="text-2xl font-black text-[#334155] mt-1 block">
                    {totalCartsCount} xe đẩy
                  </b>
                </div>
                <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
                  <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                    Đang hoạt động
                  </span>
                  <b className="text-2xl font-black text-[#15803D] mt-1 block">
                    {carts.filter((c) => c.status === "active").length} xe
                  </b>
                </div>
                <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
                  <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                    Không hoạt động
                  </span>
                  <b className="text-2xl font-black text-[#94A3B8] mt-1 block">
                    {carts.filter((c) => c.status === "inactive").length} xe
                  </b>
                </div>
                <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
                  <span className="text-xs font-bold text-[#94A3B8] block uppercase tracking-wider">
                    Đang bảo trì
                  </span>
                  <b className="text-2xl font-black text-[#D97706] mt-1 block">
                    {carts.filter((c) => c.status === "maintenance").length} xe
                  </b>
                </div>
              </div>

              {/* View mode toggle & Global cart actions bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCartsViewMode("list")}
                    className={`px-4 py-2 rounded-2xl text-xs font-black tracking-wider transition-all flex items-center gap-1.5 ${
                      cartsViewMode === "list"
                        ? "bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]"
                        : "bg-white text-[#94A3B8] hover:bg-white hover:text-[#334155]"
                    }`}
                  >
                    <span>📋 Chế độ Danh sách (List View)</span>
                  </button>
                  <button
                    onClick={() => setCartsViewMode("map")}
                    className={`px-4 py-2 rounded-2xl text-xs font-black tracking-wider transition-all flex items-center gap-1.5 ${
                      cartsViewMode === "map"
                        ? "bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]"
                        : "bg-white text-[#94A3B8] hover:bg-white hover:text-[#334155]"
                    }`}
                  >
                    <span>🗺️ Bản đồ vận hành (Map View)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Export button */}
                  <a
                    href={api.getExportCartsUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 items-center gap-1.5 rounded-2xl bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] border border-[#E2E8F0] px-3.5 text-xs font-black text-[#475569] hover:bg-[#F1F5F9] transition-all hover:text-[#334155] shrink-0"
                    title="Xuất file CSV toàn bộ xe đẩy"
                  >
                    <span>Xuất File CSV</span>
                  </a>

                  {/* Add New Button */}
                  <button
                    onClick={handleOpenAddCart}
                    className="flex h-9 items-center gap-1.5 rounded-2xl bg-[#15803D] shadow-md px-3.5 text-xs font-black text-white hover:bg-[#15803D] transition-all shrink-0"
                  >
                    <Plus size={14} />
                    <span>Thêm thiết bị mới</span>
                  </button>
                </div>
              </div>

              {/* Conditional view rendering */}
              {cartsViewMode === "list" ? (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.4fr] gap-6 min-w-0">
                  {/* Donut Chart Block */}
                  <div className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#334155] p-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] flex flex-col items-center justify-center">
                    <h3 className="text-sm font-black text-[#334155] uppercase tracking-wider mb-6 text-center w-full">
                      Cơ cấu trạng thái xe đẩy
                    </h3>

                    {/* Donut Chart container */}
                    <div className="w-56 h-56 shrink-0 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {donutChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1E293B",
                              borderColor: "rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                              color: "#FFF",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Inner Label display */}
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-[#334155]">
                          {totalCartsCount}
                        </span>
                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-1">
                          Tổng Số Xe
                        </span>
                      </div>
                    </div>

                    {/* Legend list */}
                    <div className="w-full mt-6 space-y-2">
                      {donutChartData.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs font-bold py-1.5 border-b border-[#E2E8F0]"
                        >
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[#94A3B8]">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Carts List Table */}
                  <div className="rounded-3xl border border-[#E2E8F0] bg-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] p-6 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Table Header & Search/Filters */}
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E2E8F0]">
                        <div>
                          <h3 className="text-sm font-black text-[#334155] uppercase tracking-wider">
                            Danh sách đăng ký thiết bị
                          </h3>
                          <p className="text-[10px] text-[#94A3B8] font-semibold mt-0.5">
                            Bấm biểu tượng 👁️ để xem Giỏ hàng trực tuyến của xe
                            đang hoạt động.
                          </p>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Search */}
                          <div className="relative w-full max-w-[180px]">
                            <Search
                              size={14}
                              className="absolute left-3 top-2.5 text-[#94A3B8]"
                            />
                            <input
                              type="text"
                              placeholder="Tìm mã, tên, khu vực..."
                              value={cartSearch}
                              onChange={(e) => {
                                setCartSearch(e.target.value);
                                setCartPage(1);
                              }}
                              className="h-8 w-full rounded-2xl bg-white pl-9 pr-3 text-xs font-bold text-[#334155] placeholder-slate-500 outline-none border border-[#E2E8F0] focus:bg-white"
                            />
                          </div>

                          {/* Status Filter */}
                          <select
                            value={cartStatusFilter}
                            onChange={(e) => {
                              setCartStatusFilter(e.target.value);
                              setCartPage(1);
                            }}
                            className="h-8 rounded-2xl bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] border border-[#E2E8F0] px-2 text-xs font-bold text-[#475569] outline-none focus:border-[#15803D]"
                          >
                            <option value="all">Mọi trạng thái</option>
                            <option value="active">Đang chạy</option>
                            <option value="inactive">Ngoại tuyến</option>
                            <option value="maintenance">Bảo trì</option>
                          </select>

                          {/* Battery Filter */}
                          <select
                            value={cartBatteryFilter}
                            onChange={(e) => {
                              setCartBatteryFilter(e.target.value);
                              setCartPage(1);
                            }}
                            className="h-8 rounded-2xl bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] border border-[#E2E8F0] px-2 text-xs font-bold text-[#475569] outline-none focus:border-[#15803D]"
                          >
                            <option value="all">Mọi mức pin</option>
                            <option value="low">Pin yếu (dưới 15%)</option>
                            <option value="medium">
                              Pin trung bình (16-50%)
                            </option>
                            <option value="high">Pin đầy (trên 50%)</option>
                          </select>
                        </div>
                      </div>

                      {/* Bulk Actions Menu (gán trạng thái hàng loạt) */}
                      {checkedCartIds.length > 0 && (
                        <div className="flex items-center gap-2 bg-[#15803D]/10 border border-[#15803D]/20 px-3 py-1.5 rounded-2xl mb-3 animate-fade-in">
                          <span className="text-xs text-[#15803D] font-extrabold">
                            Đã chọn {checkedCartIds.length} xe đẩy:
                          </span>
                          <div className="h-4 w-px bg-[#15803D]/20 mx-1" />
                          <button
                            onClick={() => handleBulkUpdateStatus("active")}
                            className="text-[10px] bg-[#FFFFFF] text-[#15803D] font-black px-2 py-1 rounded hover:bg-[#F1F5F9] transition"
                          >
                            Đang chạy
                          </button>
                          <button
                            onClick={() => handleBulkUpdateStatus("inactive")}
                            className="text-[10px] bg-[#FFFFFF] text-[#94A3B8] font-black px-2 py-1 rounded hover:bg-[#F1F5F9] transition"
                          >
                            Ngoại tuyến
                          </button>
                          <button
                            onClick={() =>
                              handleBulkUpdateStatus("maintenance")
                            }
                            className="text-[10px] bg-[#FFFFFF] text-[#D97706] font-black px-2 py-1 rounded hover:bg-[#F1F5F9] transition"
                          >
                            Bảo trì
                          </button>
                          <button
                            onClick={() => setCheckedCartIds([])}
                            className="text-[10px] text-[#94A3B8] underline ml-2 hover:text-[#334155] font-extrabold"
                          >
                            Hủy chọn
                          </button>
                        </div>
                      )}

                      <div className="overflow-x-auto max-h-[380px] custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1250px]">
                          <thead>
                            <tr className="border-b border-[#E2E8F0] text-[10px] text-[#94A3B8] font-black uppercase tracking-wider sticky top-0 bg-[#FFFFFF] z-10">
                              <th className="py-2.5 px-2 w-[5%] text-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    tableCarts.length > 0 &&
                                    tableCarts.every((c) =>
                                      checkedCartIds.includes(c.id),
                                    )
                                  }
                                  onChange={() => {
                                    const isAllChecked =
                                      tableCarts.length > 0 &&
                                      tableCarts.every((c) =>
                                        checkedCartIds.includes(c.id),
                                      );
                                    if (isAllChecked) {
                                      setCheckedCartIds((prev) =>
                                        prev.filter(
                                          (id) =>
                                            !tableCarts
                                              .map((c) => c.id)
                                              .includes(id),
                                        ),
                                      );
                                    } else {
                                      setCheckedCartIds((prev) => {
                                        const added = tableCarts
                                          .map((c) => c.id)
                                          .filter((id) => !prev.includes(id));
                                        return [...prev, ...added];
                                      });
                                    }
                                  }}
                                  className="rounded border-[#E2E8F0] bg-[#FFFFFF] accent-orange-500 h-3.5 w-3.5"
                                />
                              </th>

                              {/* Click-to-sort Headers */}
                              {(() => {
                                const renderSortable = (
                                  label: string,
                                  field: string,
                                  width: string,
                                ) => {
                                  const isSorted = cartSortBy === field;
                                  return (
                                    <th
                                      onClick={() => {
                                        if (isSorted) {
                                          setCartSortOrder((prev) =>
                                            prev === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setCartSortBy(field);
                                          setCartSortOrder("asc");
                                        }
                                        setCartPage(1);
                                      }}
                                      className={`py-2.5 px-4 cursor-pointer select-none hover:text-[#334155] transition-colors ${width}`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <span>{label}</span>
                                        <span className="text-[8px] text-[#94A3B8]">
                                          {isSorted
                                            ? cartSortOrder === "asc"
                                              ? "▲"
                                              : "▼"
                                            : "↕"}
                                        </span>
                                      </div>
                                    </th>
                                  );
                                };
                                return (
                                  <>
                                    {renderSortable("Mã số", "id", "w-[10%]")}
                                    {renderSortable(
                                      "Tên thiết bị",
                                      "name",
                                      "w-[15%]",
                                    )}
                                  </>
                                );
                              })()}

                              <th className="py-2.5 px-4 w-[12%]">
                                Trạng thái
                              </th>
                              <th className="py-2.5 px-4 w-[13%]">
                                Phần cứng (IoT)
                              </th>

                              {(() => {
                                const renderSortable = (
                                  label: string,
                                  field: string,
                                  width: string,
                                ) => {
                                  const isSorted = cartSortBy === field;
                                  return (
                                    <th
                                      onClick={() => {
                                        if (isSorted) {
                                          setCartSortOrder((prev) =>
                                            prev === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setCartSortBy(field);
                                          setCartSortOrder("asc");
                                        }
                                        setCartPage(1);
                                      }}
                                      className={`py-2.5 px-4 cursor-pointer select-none hover:text-[#334155] transition-colors text-center ${width}`}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        <span>{label}</span>
                                        <span className="text-[8px] text-[#94A3B8]">
                                          {isSorted
                                            ? cartSortOrder === "asc"
                                              ? "▲"
                                              : "▼"
                                            : "↕"}
                                        </span>
                                      </div>
                                    </th>
                                  );
                                };
                                return renderSortable(
                                  "Mức Pin",
                                  "battery",
                                  "w-[12%] text-center",
                                );
                              })()}

                              <th className="py-2.5 px-4 w-[13%]">Khu vực</th>
                              <th className="py-2.5 px-4 w-[15%]">
                                Khách hàng
                              </th>

                              {(() => {
                                const renderSortable = (
                                  label: string,
                                  field: string,
                                  width: string,
                                ) => {
                                  const isSorted = cartSortBy === field;
                                  return (
                                    <th
                                      onClick={() => {
                                        if (isSorted) {
                                          setCartSortOrder((prev) =>
                                            prev === "asc" ? "desc" : "asc",
                                          );
                                        } else {
                                          setCartSortBy(field);
                                          setCartSortOrder("asc");
                                        }
                                        setCartPage(1);
                                      }}
                                      className={`py-2.5 px-4 cursor-pointer select-none hover:text-[#334155] transition-colors ${width}`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <span>{label}</span>
                                        <span className="text-[8px] text-[#94A3B8]">
                                          {isSorted
                                            ? cartSortOrder === "asc"
                                              ? "▲"
                                              : "▼"
                                            : "↕"}
                                        </span>
                                      </div>
                                    </th>
                                  );
                                };
                                return renderSortable(
                                  "Kết nối cuối",
                                  "lastConnected",
                                  "w-[13%]",
                                );
                              })()}

                              <th className="py-2.5 px-4 w-[12%] text-center">
                                Thao tác
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs font-bold text-[#475569]">
                            {tableCarts.map((cart) => {
                              const isLowBattery = cart.battery <= 15;
                              return (
                                <tr key={cart.id} className="hover:bg-white">
                                  {/* Checkbox */}
                                  <td className="py-3 px-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={checkedCartIds.includes(cart.id)}
                                      onChange={() => {
                                        if (checkedCartIds.includes(cart.id)) {
                                          setCheckedCartIds((prev) =>
                                            prev.filter((id) => id !== cart.id),
                                          );
                                        } else {
                                          setCheckedCartIds((prev) => [
                                            ...prev,
                                            cart.id,
                                          ]);
                                        }
                                      }}
                                      className="rounded border-[#E2E8F0] bg-[#FFFFFF] accent-orange-500 h-3.5 w-3.5"
                                    />
                                  </td>

                                  {/* Code */}
                                  <td className="py-3 px-4 font-mono text-[#15803D]">
                                    {cart.id}
                                  </td>

                                  {/* Name */}
                                  <td
                                    className="py-3 px-4 text-[#334155] font-extrabold truncate"
                                    title={cart.name}
                                  >
                                    {cart.name}
                                  </td>

                                  {/* Status */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                          cart.status === "active"
                                            ? "bg-[#D1FAE5] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
                                            : cart.status === "inactive"
                                              ? "bg-[#15803D] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
                                              : "bg-yellow-500 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]"
                                        }`}
                                      />
                                      <span className="text-[#475569]">
                                        {cart.status === "active"
                                          ? "Đang chạy"
                                          : cart.status === "inactive"
                                            ? "Ngoại tuyến"
                                            : "Bảo trì"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Hardware IoT Status Badges */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1">
                                      <span
                                        className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                          cart.hardwareStatus?.camera === "Good"
                                            ? "bg-[#D1FAE5] text-[#15803D] border border-green-500/20"
                                            : "bg-[#15803D]/15 text-[#15803D] border border-[#15803D]/20 animate-pulse"
                                        }`}
                                        title={`Camera: ${cart.hardwareStatus?.camera === "Good" ? "Hoạt động tốt" : "Lỗi!"}`}
                                      >
                                        CAM
                                      </span>
                                      <span
                                        className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                          cart.hardwareStatus?.scale === "Good"
                                            ? "bg-[#D1FAE5] text-[#15803D] border border-green-500/20"
                                            : "bg-[#15803D]/15 text-[#15803D] border border-[#15803D]/20 animate-pulse"
                                        }`}
                                        title={`Cân điện tử: ${cart.hardwareStatus?.scale === "Good" ? "Hoạt động tốt" : "Lỗi!"}`}
                                      >
                                        CÂN
                                      </span>
                                      <span
                                        className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                          cart.hardwareStatus
                                            ?.barcodeScanner === "Good"
                                            ? "bg-[#D1FAE5] text-[#15803D] border border-green-500/20"
                                            : "bg-[#15803D]/15 text-[#15803D] border border-[#15803D]/20 animate-pulse"
                                        }`}
                                        title={`Máy quét mã: ${cart.hardwareStatus?.barcodeScanner === "Good" ? "Hoạt động tốt" : "Lỗi!"}`}
                                      >
                                        QUÉT
                                      </span>
                                    </div>
                                  </td>

                                  {/* Battery Level */}
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <span
                                        className={`h-2.5 w-6 rounded border border-[#E2E8F0] relative flex items-center p-0.5`}
                                      >
                                        <span
                                          className={`h-full rounded-sm ${
                                            isLowBattery
                                              ? "bg-[#15803D]"
                                              : cart.battery < 50
                                                ? "bg-amber-500"
                                                : "bg-[#D1FAE5]"
                                          }`}
                                          style={{ width: `${cart.battery}%` }}
                                        />
                                      </span>
                                      <span
                                        className={`whitespace-nowrap ${
                                          isLowBattery
                                            ? "text-[#15803D] font-extrabold animate-pulse"
                                            : "text-[#475569]"
                                        }`}
                                      >
                                        {cart.battery}%
                                      </span>
                                    </div>
                                  </td>

                                  {/* Zone / Location */}
                                  <td
                                    className="py-3 px-4 text-[#475569] truncate"
                                    title={cart.currentZone}
                                  >
                                    {cart.currentZone || "—"}
                                  </td>

                                  {/* Customer */}
                                  <td className="py-3 px-4 text-[#475569] truncate">
                                    {cart.status === "active" &&
                                    cart.currentCustomer
                                      ? cart.currentCustomer.fullName || "—"
                                      : "—"}
                                  </td>

                                  {/* Last Connected */}
                                  <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap">
                                    {cart.lastConnected}
                                  </td>

                                  {/* Operations */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {/* Eye Icon (Live Session Drawer) */}
                                      {cart.currentSession ? (
                                        <button
                                          onClick={() => {
                                            setSelectedSessionCart(cart);
                                            setSessionDrawerOpen(true);
                                          }}
                                          className="h-7 w-7 rounded bg-white border border-[#E2E8F0] text-[#15803D] flex items-center justify-center hover:bg-[#15803D] hover:text-white hover:border-transparent transition-all"
                                          title="Xem giỏ hàng trực tuyến của xe"
                                        >
                                          <Eye size={12} />
                                        </button>
                                      ) : (
                                        <div className="h-7 w-7 opacity-20 flex items-center justify-center text-[#94A3B8]">
                                          <Eye size={12} />
                                        </div>
                                      )}

                                      {/* Edit */}
                                      <button
                                        onClick={() => handleOpenEditCart(cart)}
                                        className="h-7 w-7 rounded bg-white border border-[#E2E8F0] text-[#475569] flex items-center justify-center hover:bg-[#F1F5F9] hover:text-[#334155] transition-all"
                                        title="Sửa thông tin xe đẩy"
                                      >
                                        <Edit size={11} />
                                      </button>

                                      {/* Delete */}
                                      <button
                                        onClick={() =>
                                          handleDeleteCart(cart.id, cart.name)
                                        }
                                        className="h-7 w-7 rounded bg-white border border-[#E2E8F0] text-[#15803D] flex items-center justify-center hover:bg-[#15803D] hover:text-white transition-all"
                                        title="Xóa xe đẩy khỏi hệ thống"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination controls at the bottom */}
                    {(() => {
                      const totalPages =
                        Math.ceil(tableCartsTotal / cartLimit) || 1;
                      return (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E8F0] text-xs text-[#94A3B8]">
                          <div>
                            Hiển thị <b>{tableCarts.length}</b> /{" "}
                            <b>{tableCartsTotal}</b> xe đẩy (Trang {cartPage} /{" "}
                            {totalPages})
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (cartPage > 1)
                                  setCartPage((prev) => prev - 1);
                              }}
                              disabled={cartPage === 1}
                              className="px-3 py-1.5 rounded-2xl bg-white border border-[#E2E8F0] text-[#475569] disabled:opacity-30 disabled:pointer-events-none hover:bg-white transition font-bold"
                            >
                              Trước
                            </button>
                            <button
                              onClick={() => {
                                if (cartPage < totalPages)
                                  setCartPage((prev) => prev + 1);
                              }}
                              disabled={cartPage === totalPages}
                              className="px-3 py-1.5 rounded-2xl bg-white border border-[#E2E8F0] text-[#475569] disabled:opacity-30 disabled:pointer-events-none hover:bg-white transition font-bold"
                            >
                              Sau
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                /* MAP VIEW MODE */
                <div className="grid grid-cols-1 gap-6">
                  <div className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] text-[#334155] p-6 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] relative">
                    {/* Map Header with controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-sm font-black text-[#334155] uppercase tracking-wider">
                          Bản đồ vận hành IoT Real-time
                        </h3>
                        <p className="text-[10px] text-[#94A3B8] font-semibold mt-0.5">
                          Theo dõi vị trí thực tế của xe đẩy và kiểm soát an
                          ninh từ xa.
                        </p>
                      </div>

                      {/* Heatmap Toggle & Legend */}
                      <div className="flex items-center gap-4 flex-wrap">
                        <button
                          onClick={() => setShowHeatmap((prev) => !prev)}
                          className={`px-3 py-1.5 rounded-2xl text-xs font-black transition ${
                            showHeatmap
                              ? "bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]"
                              : "bg-white text-[#94A3B8] border border-[#E2E8F0] hover:bg-white"
                          }`}
                        >
                          🔥 Heatmap Overlay: {showHeatmap ? "BẬT" : "TẮT"}
                        </button>

                        {/* Map color codes */}
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[#475569] bg-white px-3 py-1.5 rounded-2xl border border-[#E2E8F0]">
                          <div className="flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
                            <span>Đang chạy</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#EAB308] animate-pulse" />
                            <span>Pin yếu</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444] animate-pulse" />
                            <span>Lỗi/Offline</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Isometric 2.5D Map Supermarket layout */}
                    <div
                      className="relative w-full border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC] overflow-hidden select-none"
                      style={{ height: "calc(100vh - 260px)" }}
                    >
                      <svg
                        className="w-full h-full"
                        viewBox="42 42 1276 650"
                        preserveAspectRatio="none"
                        role="img"
                      >
                        {/* Defs */}
                        <defs>
                          <filter
                            id="isoShadowAdmin"
                            x="-15%"
                            y="-20%"
                            width="140%"
                            height="150%"
                          >
                            <feDropShadow
                              dx="4"
                              dy="4"
                              stdDeviation="0"
                              floodColor="#334155"
                              floodOpacity="0.04"
                            />
                          </filter>
                        </defs>

                        {/* Background Grid */}
                        <rect
                          x="42"
                          y="42"
                          width="1276"
                          height="650"
                          rx="24"
                          fill="#FFFFFF"
                          stroke="#CBD5E1"
                          strokeWidth={3}
                        />
                        <g
                          fill="none"
                          stroke="#15803D"
                          strokeWidth={2}
                          opacity=".25"
                        >
                          <path d="M338 65V668M970 65V668M65 225H1295M65 520H1295" />
                        </g>

                        {/* Title inside map */}
                        <text
                          x="76"
                          y="84"
                          fill="#15803D"
                          fontSize="14"
                          fontWeight="900"
                          letterSpacing="2"
                        >
                          SƠ ĐỒ VẬN HÀNH · 2.5D OPERATIONAL PLAN
                        </text>

                        {/* Isometric Racks */}
                        {(() => {
                          const renderBlock = (
                            x: number,
                            y: number,
                            label: string,
                            w = 170,
                            h = 56,
                          ) => {
                            const fillColor = "#FFFFFF";
                            const strokeColor = "#15803D";
                            const textColor = "#334155";
                            return (
                              <g
                                transform={`translate(${x} ${y}) scale(0.98)`}
                                filter="url(#isoShadowAdmin)"
                                key={label}
                              >
                                <polygon
                                  points={`0,18 ${w},18 ${w + 24},0 24,0`}
                                  fill={fillColor}
                                  stroke={strokeColor}
                                  strokeWidth={1.5}
                                />
                                <polygon
                                  points={`${w},18 ${w + 24},0 ${w + 24},${h - 10} ${w},${h + 7}`}
                                  fill={fillColor}
                                  stroke={strokeColor}
                                  strokeWidth={1.5}
                                />
                                <polygon
                                  points={`0,18 ${w},18 ${w},${h + 7} 0,${h + 7}`}
                                  fill={fillColor}
                                  stroke={strokeColor}
                                  strokeWidth={1.5}
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
                            <>
                              {/* HÀNG TƯƠI SỐNG */}
                              {renderBlock(392, 94, "RAU CỦ")}
                              {renderBlock(637, 94, "TRÁI CÂY")}
                              {renderBlock(882, 94, "THỊT & CÁ")}

                              {/* ĐÔNG LẠNH */}
                              {renderBlock(1076, 165, "TỦ MÁT")}
                              {renderBlock(1076, 286, "TỦ ĐÔNG")}
                              {renderBlock(1076, 407, "KHO LẠNH")}

                              {/* THỰC PHẨM KHÔ */}
                              {renderBlock(392, 235, "MÌ · GẠO · GIA VỊ", 235)}
                              {renderBlock(637, 306, "ĐỒ UỐNG", 235)}
                              {renderBlock(392, 377, "ĐỒ UỐNG · BÁNH KẸO", 480)}
                              {renderBlock(
                                392,
                                448,
                                "ĐỒ HỘP · HÓA MỸ PHẨM",
                                480,
                              )}
                              {renderBlock(392, 519, "ĐỒ GIA DỤNG", 480)}

                              {/* TRẠM XE ĐẨY AI */}
                              {renderBlock(76, 286, "TRẠM XE ĐẨY AI")}

                              {/* LỐI VÀO / LỐI RA */}
                              {renderBlock(76, 548, "LỐI VÀO", 108)}
                              {renderBlock(202, 548, "LỐI RA", 108)}

                              {/* QUẦY THU NGÂN */}
                              <g filter="url(#isoShadowAdmin)">
                                <rect
                                  x="1000"
                                  y="482"
                                  width="244"
                                  height="170"
                                  rx="16"
                                  fill="#FFFFFF"
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
                                  strokeWidth={2}
                                />
                                <rect
                                  x="1092"
                                  y="532"
                                  width="55"
                                  height="82"
                                  rx="8"
                                  fill="#FFFFFF"
                                  stroke="#15803D"
                                  strokeWidth={2}
                                />
                                <rect
                                  x="1166"
                                  y="532"
                                  width="55"
                                  height="82"
                                  rx="8"
                                  fill="#FFFFFF"
                                  stroke="#15803D"
                                  strokeWidth={2}
                                />
                                <text
                                  x="1122"
                                  y="516"
                                  fill="#334155"
                                  fontWeight="800"
                                  textAnchor="middle"
                                  fontSize="17"
                                >
                                  QUẦY THU NGÂN
                                </text>
                                <text
                                  x="1045"
                                  y="579"
                                  fill="#334155"
                                  fontWeight="800"
                                  textAnchor="middle"
                                  fontSize="12"
                                >
                                  01
                                </text>
                                <text
                                  x="1119"
                                  y="579"
                                  fill="#334155"
                                  fontWeight="800"
                                  textAnchor="middle"
                                  fontSize="12"
                                >
                                  02
                                </text>
                                <text
                                  x="1193"
                                  y="579"
                                  fill="#334155"
                                  fontWeight="800"
                                  textAnchor="middle"
                                  fontSize="12"
                                >
                                  03
                                </text>
                              </g>
                            </>
                          );
                        })()}

                        {/* Heatmap overlays inside SVG */}
                        {showHeatmap && (
                          <g opacity="0.15">
                            <circle
                              cx="500"
                              cy="200"
                              r="100"
                              fill="#EF4444"
                              className="animate-pulse"
                            />
                            <circle
                              cx="700"
                              cy="400"
                              r="140"
                              fill="#D3524B"
                              className="animate-pulse"
                            />
                            <circle
                              cx="1150"
                              cy="300"
                              r="110"
                              fill="#EAB308"
                              className="animate-pulse"
                            />
                          </g>
                        )}

                        {/* Plotting Carts Dots directly inside SVG view space */}
                        {carts
                          .filter((cart) => {
                            const hasHardwareError =
                              cart.hardwareStatus?.camera === "Error" ||
                              cart.hardwareStatus?.scale === "Error" ||
                              cart.hardwareStatus?.barcodeScanner === "Error";
                            return (
                              cart.status === "active" ||
                              (cart.status === "maintenance" &&
                                hasHardwareError)
                            );
                          })
                          .map((cart) => {
                            const hasHardwareError =
                              cart.hardwareStatus?.camera === "Error" ||
                              cart.hardwareStatus?.scale === "Error" ||
                              cart.hardwareStatus?.barcodeScanner === "Error";
                            const isLowBattery = cart.battery <= 15;
                            const isOffline = cart.status === "inactive";

                            let dotColor = "#22C55E"; // Green
                            let isPulsing = false;

                            if (isOffline || hasHardwareError) {
                              dotColor = "#EF4444"; // Red
                              isPulsing = true;
                            } else if (isLowBattery) {
                              dotColor = "#EAB308"; // Yellow
                              isPulsing = true;
                            }

                            const xPos = cart.coordinates?.x || 100;
                            const yPos = cart.coordinates?.y || 100;

                            return (
                              <g
                                key={cart.id}
                                className="cursor-pointer"
                                onClick={() => setSelectedMapCart(cart)}
                              >
                                {/* Pulse glow background */}
                                <circle
                                  cx={xPos}
                                  cy={yPos}
                                  r={isPulsing ? 18 : 12}
                                  fill={dotColor}
                                  opacity="0.35"
                                  className={isPulsing ? "animate-pulse" : ""}
                                />
                                {/* Main cart indicator dot */}
                                <circle
                                  cx={xPos}
                                  cy={yPos}
                                  r="8"
                                  fill={dotColor}
                                  stroke="#FFFFFF"
                                  strokeWidth="2"
                                />
                                {/* Cart ID Tag */}
                                <rect
                                  x={xPos - 18}
                                  y={yPos - 22}
                                  width="36"
                                  height="12"
                                  rx="3"
                                  fill="rgba(15, 23, 42, 0.85)"
                                  stroke="rgba(255, 255, 255, 0.15)"
                                  strokeWidth="1"
                                />
                                <text
                                  x={xPos}
                                  y={yPos - 13}
                                  fill="#FFFFFF"
                                  fontSize="8"
                                  fontWeight="900"
                                  textAnchor="middle"
                                  className="select-none font-mono"
                                >
                                  {cart.id}
                                </text>
                              </g>
                            );
                          })}
                      </svg>

                      {/* Details Popover Card when clicking a dot */}
                      {selectedMapCart && (
                        <div
                          className="absolute z-30 w-72 rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] animate-fade-in text-xs"
                          style={{
                            left: `${Math.min(75, Math.max(5, ((selectedMapCart.coordinates?.x || 100) / 1360) * 100 - 12))}%`,
                            top: `${Math.min(55, Math.max(5, ((selectedMapCart.coordinates?.y || 100) / 760) * 100 - 25))}%`,
                          }}
                        >
                          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-3">
                            <div>
                              <h4 className="font-extrabold text-[#334155] text-sm">
                                {selectedMapCart.name}
                              </h4>
                              <span className="font-mono text-[10px] text-[#15803D]">
                                ID: {selectedMapCart.id}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedMapCart(null)}
                              className="text-[#94A3B8] hover:text-[#334155] p-0.5 rounded hover:bg-white"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-[#94A3B8]">
                                Trạng thái:
                              </span>
                              <span
                                className={`font-extrabold ${
                                  selectedMapCart.status === "active"
                                    ? "text-[#15803D]"
                                    : selectedMapCart.status === "inactive"
                                      ? "text-[#94A3B8]"
                                      : "text-[#D97706]"
                                }`}
                              >
                                {selectedMapCart.status === "active"
                                  ? "Đang chạy"
                                  : selectedMapCart.status === "inactive"
                                    ? "Ngoại tuyến"
                                    : "Bảo trì"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#94A3B8]">
                                Dung lượng Pin:
                              </span>
                              <span
                                className={`font-extrabold ${selectedMapCart.battery <= 15 ? "text-[#15803D] animate-pulse" : "text-[#334155]"}`}
                              >
                                {selectedMapCart.battery}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#94A3B8]">
                                Khu vực (Zone):
                              </span>
                              <span className="text-[#475569] font-bold">
                                {selectedMapCart.currentZone ||
                                  "Không xác định"}
                              </span>
                            </div>

                            {/* IoT status */}
                            <div className="border-t border-[#E2E8F0] pt-2 mt-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                                Kết nối phần cứng:
                              </span>
                              <div className="grid grid-cols-3 gap-1 text-center font-black text-[8px]">
                                <div
                                  className={`py-1 rounded border ${selectedMapCart.hardwareStatus?.camera === "Good" ? "bg-[#D1FAE5] text-[#15803D] border-green-500/20" : "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20"}`}
                                >
                                  CAMERA
                                </div>
                                <div
                                  className={`py-1 rounded border ${selectedMapCart.hardwareStatus?.scale === "Good" ? "bg-[#D1FAE5] text-[#15803D] border-green-500/20" : "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20"}`}
                                >
                                  CÂN
                                </div>
                                <div
                                  className={`py-1 rounded border ${selectedMapCart.hardwareStatus?.barcodeScanner === "Good" ? "bg-[#D1FAE5] text-[#15803D] border-green-500/20" : "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20"}`}
                                >
                                  MÁY QUÉT
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {selectedMapCart.currentSession && (
                              <button
                                onClick={() => {
                                  setSelectedSessionCart(selectedMapCart);
                                  setSessionDrawerOpen(true);
                                  setSelectedMapCart(null);
                                }}
                                className="flex-1 rounded-2xl bg-[#15803D]/20 hover:bg-[#15803D]/30 text-[#15803D] font-extrabold py-2 text-center transition"
                              >
                                Xem Giỏ Hàng
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleLockWheels(
                                  selectedMapCart.id,
                                  selectedMapCart.name,
                                );
                                setSelectedMapCart(null);
                              }}
                              className="flex-1 rounded-2xl bg-[#15803D] hover:bg-[#15803D] text-white font-extrabold py-2 text-center transition shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]"
                            >
                              Khóa Bánh Xe
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}



          {/* TAB 8: SYSTEM SETTINGS */}
          {activeTab === "settings" && (
            <div className="animate-fadeIn w-full h-full">
              <SystemSettingsScreen />
            </div>
          )}
        </div>
      </main>

      {/* --- LIVE CART SESSION DRAWER (NEW FEATURE!) --- */}
      {sessionDrawerOpen && selectedSessionCart && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
          {/* Drawer Backdrop closer */}
          <div className="flex-1" onClick={() => setSessionDrawerOpen(false)} />

          {/* Drawer Body Panel */}
          <div className="w-[450px] h-full bg-white border-l border-[#E2E8F0] p-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] animate-slideLeft text-[#334155]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-[#15803D]" />
                  <div>
                    <h3 className="text-base font-black uppercase text-[#334155] leading-none">
                      Giỏ Hàng Trực Tiếp
                    </h3>
                    <span className="text-[10px] text-[#94A3B8] font-bold block mt-1">
                      {selectedSessionCart.name} · Phiên:{" "}
                      <b className="text-[#15803D]">
                        {selectedSessionCart.currentSession}
                      </b>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSessionDrawerOpen(false)}
                  className="h-8 w-8 rounded-2xl bg-white hover:bg-white flex items-center justify-center text-[#94A3B8] hover:text-[#334155]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cart Info Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2.5 mb-6 text-xs font-bold">
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Trạng thái xe:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black ${
                      selectedSessionCart.status === "active"
                        ? "bg-[#15803D]/10 text-[#8CB867]"
                        : "bg-[#15803D]/10 text-[#15803D]"
                    }`}
                  >
                    {selectedSessionCart.status === "active"
                      ? "Đang hoạt động"
                      : "Bảo Trì"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Dung lượng pin:</span>
                  <span className="text-[#334155]">
                    {selectedSessionCart.battery}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#94A3B8]">Cập nhật mạng cuối:</span>
                  <span className="text-[#475569]">
                    {selectedSessionCart.lastConnected}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-black uppercase text-[#15803D] tracking-wider mb-3">
                  Sản phẩm trong giỏ
                </h4>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 [scrollbar-width:thin]">
                  {selectedSessionCart.currentSession &&
                    sessionItems[selectedSessionCart.currentSession]?.map(
                      (item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white border border-[#E2E8F0] p-3 rounded-2xl"
                        >
                          <div>
                            <span className="text-sm font-extrabold text-[#334155] block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#94A3B8] block mt-1">
                              Đơn giá: {formatMoney(item.price)} · Thêm lúc:{" "}
                              {item.addedAt}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-[#15803D] block">
                              x{item.qty}
                            </span>
                            <span className="text-xs font-extrabold text-[#334155] block mt-1">
                              {formatMoney(item.price * item.qty)}
                            </span>
                          </div>
                        </div>
                      ),
                    )}

                  {(!selectedSessionCart.currentSession ||
                    !sessionItems[selectedSessionCart.currentSession] ||
                    sessionItems[selectedSessionCart.currentSession].length ===
                      0) && (
                    <div className="py-8 text-center text-[#94A3B8] text-xs font-bold">
                      Giỏ hàng hiện tại đang trống!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bill Summary and Drawer actions */}
            <div>
              {/* Summary */}
              {selectedSessionCart.currentSession &&
                sessionItems[selectedSessionCart.currentSession] && (
                  <div className="border-t border-[#E2E8F0] pt-4 mb-6">
                    <div className="flex justify-between items-center font-black">
                      <span className="text-[#94A3B8] text-xs uppercase tracking-wider">
                        Tổng tạm tính:
                      </span>
                      <span className="text-xl text-[#334155]">
                        {formatMoney(
                          sessionItems[
                            selectedSessionCart.currentSession
                          ].reduce(
                            (sum, item) => sum + item.price * item.qty,
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {selectedSessionCart.currentSession && (
                  <button
                    onClick={() =>
                      handleForceCheckout(
                        selectedSessionCart.id,
                        selectedSessionCart.currentSession!,
                      )
                    }
                    className="w-full h-11 rounded-2xl bg-[#15803D] hover:bg-[#15803D] text-xs font-black text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Thanh toán khẩn cấp (Force Checkout)</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      handleLockWheels(
                        selectedSessionCart.id,
                        selectedSessionCart.name,
                      )
                    }
                    className="h-11 rounded-2xl bg-[#15803D]/10 hover:bg-[#15803D]/20 text-[#15803D] border border-[#15803D]/20 text-xs font-black transition-all flex items-center justify-center gap-1.5"
                  >
                    <X size={14} />
                    <span>Khóa bánh xe</span>
                  </button>
                  <button
                    onClick={() =>
                      handleRebootScreen(
                        selectedSessionCart.id,
                        selectedSessionCart.name,
                      )
                    }
                    className="h-11 rounded-2xl bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] text-xs font-black transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Reboot Screen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CRUD MODALS --- */}

      {/* 1. Product Form Modal */}
      {productFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white text-[#334155] p-8 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] animate-zoomIn">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-6">
              <h3 className="text-lg font-black uppercase text-[#334155]">
                {editingProduct
                  ? `Sửa Sản Phẩm: ${editingProduct.id}`
                  : "Thêm Sản Phẩm Mới"}
              </h3>
              <button
                onClick={() => setProductFormOpen(false)}
                className="h-8 w-8 rounded-2xl bg-white hover:bg-white flex items-center justify-center text-[#94A3B8] hover:text-[#334155]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Mã Barcode
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formBarcode}
                      onChange={(e) => {
                        setFormBarcode(e.target.value);
                        setFormBarcodeError("");
                      }}
                      className="h-10 flex-1 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] outline-none focus:border-[#15803D]"
                      placeholder="Nhập mã barcode..."
                    />
                    <button
                      type="button"
                      onClick={() => setIsScannerOpen(!isScannerOpen)}
                      className="h-10 px-4 flex items-center justify-center gap-2 bg-white text-[#15803D] font-bold text-xs border border-[#15803D] rounded-2xl hover:bg-[#D1FAE5] transition-colors whitespace-nowrap shadow-sm"
                    >
                      <Camera size={16} />
                      Quét Camera
                    </button>
                  </div>
                  {formBarcodeError && (
                    <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-[11px] font-bold text-[#B91C1C]">
                      {formBarcodeError}
                    </div>
                  )}
                  {isScannerOpen && (
                    <div className="mt-3 w-full h-[260px] border border-[#15803D] rounded-2xl overflow-hidden shadow-sm">
                      <BarcodeCameraScanner onScanSuccess={(code) => {
                         setFormBarcode(code);
                         setFormBarcodeError("");
                         setIsScannerOpen(false);
                      }} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Mã hệ thống (Auto)
                  </label>
                  <input
                    type="text"
                    value={formId}
                    disabled
                    className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-slate-50 px-3 text-xs font-mono font-bold text-[#94A3B8] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Phân loại gốc
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) =>
                      setFormCategory(e.target.value as Product["category"])
                    }
                    className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] outline-none focus:border-[#15803D]"
                  >
                    <option value="Hàng tươi sống">🥩 Hàng tươi sống</option>
                    <option value="Thực phẩm khô & đồ uống">
                      📦 Thực phẩm khô & đồ uống
                    </option>
                    <option value="Đông lạnh">❄️ Đông lạnh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] placeholder-slate-500 outline-none focus:border-[#15803D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Phân loại nhỏ
                  </label>
                  <input
                    type="text"
                    value={formSubCategory}
                    onChange={(e) => setFormSubCategory(e.target.value)}
                    placeholder="ví dụ: Thịt tươi, Hải sản..."
                    className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] placeholder-slate-500 outline-none focus:border-[#15803D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Đơn giá (VND)
                  </label>
                  <input
                    type="number"
                    value={formPrice || ""}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    placeholder="Đơn giá"
                    className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] placeholder-slate-500 outline-none focus:border-[#15803D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Số lượng trong kho
                  </label>
                  <input
                    type="number"
                    value={formQuantity || ""}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    placeholder="Tồn kho"
                    className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] placeholder-slate-500 outline-none focus:border-[#15803D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Doanh thu tích lũy
                  </label>
                  <input
                    type="number"
                    value={formRevenue || ""}
                    onChange={(e) => setFormRevenue(Number(e.target.value))}
                    placeholder="Không nhập sẽ tính tự động"
                    className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] placeholder-slate-500 outline-none focus:border-[#15803D]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex gap-3">
                <button
                  type="button"
                  onClick={() => setProductFormOpen(false)}
                  className="flex-1 h-11 rounded-2xl bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] text-[#475569] hover:bg-[#F1F5F9] text-xs font-black transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-2xl bg-[#15803D] shadow-md hover:bg-[#15803D] text-xs font-black text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Cart Form Modal */}
      {cartFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-3xl border border-[#E2E8F0] bg-white text-[#334155] p-8 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] animate-zoomIn">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-6">
              <h3 className="text-lg font-black uppercase text-[#334155]">
                {editingCart
                  ? `Sửa thiết bị: ${editingCart.id}`
                  : "Thêm thiết bị xe mới"}
              </h3>
              <button
                onClick={() => setCartFormOpen(false)}
                className="h-8 w-8 rounded-2xl bg-white hover:bg-white flex items-center justify-center text-[#94A3B8] hover:text-[#334155]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCart} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                  Mã thiết bị
                </label>
                <input
                  type="text"
                  value={cartFormId}
                  disabled
                  className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-white px-3 text-xs font-mono font-bold text-[#94A3B8] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                  Tên xe đẩy
                </label>
                <input
                  type="text"
                  value={cartFormName}
                  onChange={(e) => setCartFormName(e.target.value)}
                  placeholder="Nhập tên xe đẩy..."
                  className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] placeholder-slate-500 outline-none focus:border-[#15803D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Trạng thái hoạt động
                  </label>
                  <select
                    value={cartFormStatus}
                    onChange={(e) =>
                      setCartFormStatus(e.target.value as Cart["status"])
                    }
                    className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] outline-none focus:border-[#15803D]"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="maintenance">Đang bảo trì</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Dung lượng Pin (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={cartFormBattery}
                    onChange={(e) => setCartFormBattery(Number(e.target.value))}
                    className="h-10 w-full rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] px-3 text-xs font-bold text-[#334155] outline-none focus:border-[#15803D]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex gap-3">
                <button
                  type="button"
                  onClick={() => setCartFormOpen(false)}
                  className="flex-1 h-11 rounded-2xl bg-[#FFFFFF] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] text-[#475569] hover:bg-[#F1F5F9] text-xs font-black transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-2xl bg-[#15803D] shadow-md hover:bg-[#15803D] text-xs font-black text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] transition-all"
                >
                  Lưu thiết bị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
