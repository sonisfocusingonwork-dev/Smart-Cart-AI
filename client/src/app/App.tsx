import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Wifi } from "lucide-react";
import { api } from "./api";

import {
  BottomNav,
  PURCHASE_HISTORY,
  getCheckoutSummary,
  isSharedGroupSnapshot,
  normalizeLookup,
  setGlobalStoreLocations,
  createStoreLocation,
  STORE_LOCATIONS,
} from "./shared";
import type {
  CompletedReceipt,
  GroupRole,
  Item,
  MemberCart,
  PurchaseHistoryOrder,
  Screen,
  SharedGroupSnapshot,
  ShoppingListItem,
} from "./shared";
import { AccountScreen } from "./screens/AccountScreen";
import { CartScreen } from "./screens/CartScreen";
import { CategoryScreen } from "./screens/CategoryScreen";
import { GroupSessionScreen } from "./screens/GroupSessionScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { MapScreen } from "./screens/MapScreen";
import { OffersScreen } from "./screens/OffersScreen";
import { PurchaseHistoryScreen } from "./screens/PurchaseHistoryScreen";
import { SplashScreen } from "./screens/SplashScreen";
import { AdminLoginScreen } from "./screens/AdminLoginScreen";
import { AdminDashboardScreen } from "./screens/AdminDashboardScreen";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { BranchProvider } from "./contexts/BranchContext";

const MEMBER_TIER = "Gold" as const;
const GROUP_STORAGE_PREFIX = "smartcart-group-";
const groupStorageKey = (code: string) => `${GROUP_STORAGE_PREFIX}${code}`;
const normalizeCode = (code: string) =>
  code.trim().toUpperCase().replace(/\s+/g, "");
const TONE_BY_CART: Record<string, string> = {
  "Cart_01 (Xe chính)": "bg-[#0F172A]",
  "Cart_02 (Xe 2)": "bg-[#F97316]",
  "Cart_03 (Xe 3)": "bg-[#334155]",
};

export default function App() {
  const [screen, setScreenState] = useState<Screen>("splash");
  const [prevScreen, setPrevScreen] = useState<Screen>("home");
  const [adminName, setAdminName] = useState("Root Technician");
  const [activeCategory, setActiveCategory] =
    useState<string>("Thực phẩm tươi");
  const [showListPopup, setShowListPopup] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [memberPoints, setMemberPoints] = useState(() => {
    if (typeof window === "undefined") return 1250;
    const saved = Number(
      window.localStorage.getItem("smartcart-member-points"),
    );
    return Number.isFinite(saved) && saved >= 0 ? saved : 1250;
  });
  const memberTier = MEMBER_TIER;
  const [purchaseHistory, setPurchaseHistory] = useState<
    PurchaseHistoryOrder[]
  >(() => {
    if (typeof window === "undefined") return PURCHASE_HISTORY;
    try {
      const saved = JSON.parse(
        window.localStorage.getItem("smartcart-purchase-history") ?? "null",
      ) as unknown;
      return Array.isArray(saved)
        ? (saved as PurchaseHistoryOrder[])
        : PURCHASE_HISTORY;
    } catch {
      return PURCHASE_HISTORY;
    }
  });

  const [groupCode, setGroupCode] = useState("");
  const [groupRole, setGroupRole] = useState<GroupRole>(null);
  const [syncStatus, setSyncStatus] = useState("Chưa tham gia phiên nhóm");
  const [currentCart, setCurrentCart] = useState<MemberCart>({
    member: "Khách hàng",
    cartId: "Mua sắm cá nhân",
    tone: "bg-[#0F172A]",
  });
  const [groupMembers, setGroupMembers] = useState<MemberCart[]>([]);

  const [manualList, setManualList] = useState<ShoppingListItem[]>([
    { name: "Mì Hảo Hảo", checked: false },
    { name: "Sữa Tươi Vinamilk", checked: true },
    { name: "Thịt Bò Úc 500g", checked: false },
  ]);
  const [items, setItems] = useState<Item[]>([]);

  const sourceIdRef = useRef(
    `smart-cart-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const channelRef = useRef<BroadcastChannel | null>(null);
  const applyingRemoteRef = useRef(false);
  const lastSnapshotAtRef = useRef(0);
  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(
        "smartcart-member-points",
        String(memberPoints),
      );
  }, [memberPoints]);

  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(
        "smartcart-purchase-history",
        JSON.stringify(purchaseHistory),
      );
  }, [purchaseHistory]);

  useEffect(() => {
    api.getOrders()
      .then(data => {
        if (data && data.length > 0) setPurchaseHistory(data);
      })
      .catch(err => console.error("Error fetching purchase history from BE:", err));
  }, []);

  useEffect(() => {
    api.getProducts().then(products => {
      const getZone = (category: string, name: string) => {
        if (category === "Hàng tươi sống") {
          const lowerName = name.toLowerCase();
          if (lowerName.includes("thịt") || lowerName.includes("cá") || lowerName.includes("tôm") || lowerName.includes("bò") || lowerName.includes("heo") || lowerName.includes("gà") || lowerName.includes("mực") || lowerName.includes("cua")) {
            return "Thịt & Cá";
          }
          if (lowerName.includes("táo") || lowerName.includes("cam") || lowerName.includes("nho") || lowerName.includes("chuối") || lowerName.includes("dưa") || lowerName.includes("xoài") || lowerName.includes("lê") || lowerName.includes("ổi") || lowerName.includes("mít")) {
            return "Trái cây";
          }
          return "Rau củ";
        }
        
        const MAP_ZONE_MAPPING: Record<string, string> = {
          "Thực phẩm khô & đồ uống": "Mì · Gạo · Gia vị", // Mì tôm, gạo thuộc khu này
          "Đông lạnh": "Tủ đông",
          "Gia vị": "Mì · Gạo · Gia vị",
          "Đồ gia dụng": "Đồ gia dụng",
          "Mẹ & Bé": "Đồ gia dụng",
          "Hóa mỹ phẩm": "Đồ hộp · Hóa mỹ phẩm"
        };
        
        // Cải thiện phân bổ đồ uống
        if (category === "Thực phẩm khô & đồ uống") {
           const lowerName = name.toLowerCase();
           if (lowerName.includes("nước") || lowerName.includes("coca") || lowerName.includes("bia") || lowerName.includes("sữa") || lowerName.includes("trà") || lowerName.includes("cà phê") || lowerName.includes("pepsi")) {
             return "Đồ uống";
           }
        }
        return MAP_ZONE_MAPPING[category] || "Khu dịch vụ";
      };

      const productLocations = products.map((p, index) => {
        const zone = getZone(p.category, p.name);
        return createStoreLocation(
          p._id || p.id || `loc-${index}`,
          p.name,
          [p.name, p.category],
          zone,
          `Kệ ${zone}`,
          0,
          0,
          "product"
        );
      });
      const facilities = STORE_LOCATIONS.filter(loc => loc.kind === "service");
      setGlobalStoreLocations([...facilities, ...productLocations]);
    }).catch(err => console.error(err));
  }, []);

  // Detect manual URL access to /admin
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === "/admin" || path.startsWith("/admin/") || hash === "#/admin") {
        const storedRole = window.localStorage.getItem("smartcart-user-role");
        if (storedRole === "admin") {
          const storedAdminName = window.localStorage.getItem("smartcart-user-name") || "Root Technician";
          setAdminName(storedAdminName);
          setAuthenticated(true);
          setScreenState("admin");
        } else {
          // Force screen state to "admin" to trigger AdminProtectedRoute block UI
          setScreenState("admin");
        }
      }
    }
  }, []);

  const memberLabel = `${currentCart.member} · ${currentCart.cartId}`;

  const setScreen = (newScreen: Screen) => {
    if (newScreen === screen) return;
    if (newScreen === "cart" || newScreen === "category") setPrevScreen(screen);
    setShowListPopup(false);
    setScreenState(newScreen);
  };

  const back = () => {
    if (screen === "login") setScreenState("splash");
    else if (screen === "cart" || screen === "category")
      setScreenState(prevScreen);
    else setScreenState("home");
  };

  const goToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    setScreen("category");
  };

  const buildSnapshot = useCallback(
    (
      code: string,
      members: MemberCart[],
      nextItems: Item[],
      nextList: ShoppingListItem[],
    ): SharedGroupSnapshot => ({
      code,
      members,
      items: nextItems,
      manualList: nextList,
      updatedAt: Math.max(Date.now(), lastSnapshotAtRef.current + 1),
      sourceId: sourceIdRef.current,
    }),
    [],
  );

  const writeSnapshot = useCallback((snapshot: SharedGroupSnapshot) => {
    if (typeof window === "undefined") return;
    lastSnapshotAtRef.current = Math.max(
      lastSnapshotAtRef.current,
      snapshot.updatedAt,
    );
    try {
      window.localStorage.setItem(
        groupStorageKey(snapshot.code),
        JSON.stringify(snapshot),
      );
      channelRef.current?.postMessage(snapshot);
    } catch {
      setSyncStatus("Không thể ghi dữ liệu đồng bộ trên thiết bị này");
    }
  }, []);

  // API Syncing for Group Sessions
  useEffect(() => {
    if (!groupCode) return;
    let active = true;

    const syncSession = async () => {
      try {
        const session = await api.getGroupSession(groupCode);
        if (!active) return;
        
        if (session.updatedAtTimestamp > lastSnapshotAtRef.current && session.sourceId !== sourceIdRef.current) {
          applyingRemoteRef.current = true;
          lastSnapshotAtRef.current = session.updatedAtTimestamp;
          setItems(session.items);
          setManualList(session.manualList);
          setGroupMembers(session.members);
          setSyncStatus(`Vừa nhận cập nhật từ xe khác lúc ${new Date(session.updatedAtTimestamp).toLocaleTimeString("vi-VN")}`);
        }
      } catch (err) {
        if (groupRole === 'member') {
          if (active) {
            setGroupCode("");
            setGroupRole(null);
            setGroupMembers([]);
            setCurrentCart((current) => ({
              ...current,
              cartId: "Tài khoản cá nhân",
              tone: "bg-[#0F172A]",
            }));
            setSyncStatus("Xe chính đã kết thúc phiên nhóm");
            setDuplicateAlert("Phiên mua sắm nhóm đã được xe chính kết thúc.");
            setScreenState("home");
          }
        }
      }
    };

    const interval = setInterval(syncSession, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [groupCode, groupRole]);

  // Push local updates to backend when items/manualList changes
  useEffect(() => {
    if (!groupCode) return;
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }

    const pushUpdate = async () => {
      try {
        const nextTimestamp = Date.now();
        lastSnapshotAtRef.current = nextTimestamp;
        
        await api.updateGroupSession(groupCode, {
          members: groupMembers,
          items,
          manualList,
          sourceId: sourceIdRef.current
        });
        
        setSyncStatus(`Đã đồng bộ lúc ${new Date(nextTimestamp).toLocaleTimeString("vi-VN")}`);
      } catch (err) {
        console.error("Error pushing session update to BE:", err);
      }
    };

    const timeout = setTimeout(pushUpdate, 500);
    return () => clearTimeout(timeout);
  }, [groupCode, groupMembers, items, manualList]);

  const createShoppingGroup = async (name: string) => {
    const code = `SC-${Math.floor(100000 + Math.random() * 900000)}`;
    const host: MemberCart = {
      member: name,
      cartId: "Cart_01 (Xe chính)",
      tone: TONE_BY_CART["Cart_01 (Xe chính)"],
    };
    const hostLabel = `${host.member} · ${host.cartId}`;
    const sharedItems = items.map((item) => ({
      ...item,
      addedBy: item.addedBy ?? hostLabel,
    }));
    const sharedList = manualList.map((item) => ({
      ...item,
      addedBy: item.addedBy ?? hostLabel,
    }));
    const members = [host];

    try {
      await api.createGroupSession({
        code,
        members,
        items: sharedItems,
        manualList: sharedList,
        sourceId: sourceIdRef.current
      });

      const activeCarts = await api.getCarts();
      const cartObj = activeCarts.find((c: any) => c.name.includes("01"));
      if (cartObj) {
        await api.updateCart(cartObj.id, { currentSession: code, status: "active" });
      }

      setAuthenticated(true);
      setCurrentCart(host);
      setGroupCode(code);
      setGroupRole("host");
      setGroupMembers(members);
      setItems(sharedItems);
      setManualList(sharedList);
      setSyncStatus("Xe chính đã tạo nhóm và đang chờ xe 2, xe 3");
      setScreenState("group");
    } catch (err) {
      alert("Lỗi khi tạo nhóm mua sắm: " + (err as Error).message);
    }
  };

  const joinShoppingGroup = async (
    name: string,
    cartId: string,
    rawCode: string,
  ): Promise<string | null> => {
    const code = normalizeCode(rawCode);
    if (!/^SC-\d{6}$/.test(code)) return "Mã nhóm phải có dạng SC-123456.";

    try {
      const session = await api.joinGroupSession(code, {
        member: name,
        cartId,
        tone: TONE_BY_CART[cartId] ?? "bg-[#334155]",
        sourceId: sourceIdRef.current
      });

      const activeCarts = await api.getCarts();
      const numMatch = cartId.match(/\d+/);
      const cartIndex = numMatch ? numMatch[0] : "";
      const cartObj = activeCarts.find((c: any) => c.id.endsWith(cartIndex));
      if (cartObj) {
        await api.updateCart(cartObj.id, { currentSession: code, status: "active" });
      }

      setAuthenticated(true);
      const newMember = session.members.find((m: any) => m.cartId === cartId);
      if (newMember) setCurrentCart(newMember);
      setGroupCode(code);
      setGroupRole("member");
      setGroupMembers(session.members);
      setItems(session.items);
      setManualList(session.manualList);
      setSyncStatus(`Đã tham gia nhóm ${code}`);
      setScreenState("group");
      return null;
    } catch (err) {
      return (err as Error).message || "Không tìm thấy mã nhóm hoặc nhóm đã đầy.";
    }
  };

  const leaveGroup = async () => {
    const code = groupCode;
    if (code) {
      try {
        await api.leaveGroupSession(code, {
          cartId: currentCart.cartId,
          groupRole,
          sourceId: sourceIdRef.current
        });

        const activeCarts = await api.getCarts();
        const numMatch = currentCart.cartId.match(/\d+/);
        const cartIndex = numMatch ? numMatch[0] : "";
        const cartObj = activeCarts.find((c: any) => c.id.endsWith(cartIndex));
        if (cartObj) {
          await api.updateCart(cartObj.id, { currentSession: "", status: "inactive" });
        }
      } catch (err) {
        console.error("Error leaving group session on BE:", err);
      }
    }
    lastSnapshotAtRef.current = 0;
    setGroupCode("");
    setGroupRole(null);
    setGroupMembers([]);
    setCurrentCart((current) => ({
      member: current.member || "Khách hàng",
      cartId: "Mua sắm cá nhân",
      tone: "bg-[#0F172A]",
    }));
    setSyncStatus("Chưa tham gia phiên nhóm");
  };


  const toggleCheckItem = (idx: number) => {
    setManualList((list) =>
      list.map((item, itemIndex) =>
        itemIndex === idx ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const addNewManualItem = (name: string) => {
    const normalized = normalizeLookup(name);
    const existing = manualList.find(
      (item) => normalizeLookup(item.name) === normalized,
    );
    if (existing) {
      setDuplicateAlert(`"${name}" đã có trong shopping list.`);
      return;
    }
    setManualList((list) => [
      ...list,
      {
        name: name.trim(),
        checked: false,
        addedBy: groupCode ? memberLabel : undefined,
      },
    ]);
  };

  const add = (product: Omit<Item, "id" | "qty"> & { stockLevel?: number }) => {
    if (typeof product.stockLevel === "number" && product.stockLevel <= 0) {
      setDuplicateAlert(`Sản phẩm "${product.name}" hiện đã hết hàng trong kho!`);
      return;
    }
    const existing = items.find(
      (item) => normalizeLookup(item.name) === normalizeLookup(product.name),
    );
    if (existing) {
      setDuplicateAlert(`Sản phẩm "${product.name}" đã có trong giỏ hàng.`);
      return;
    }
    setItems((list) => [
      ...list,
      {
        ...product,
        id: `${sourceIdRef.current}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        qty: 1,
        addedBy: groupCode ? memberLabel : undefined,
      },
    ]);
  };

  const update = (id: string, delta: number) => {
    const target = items.find((item) => item.id === id);
    if (
      delta > 0 &&
      groupCode &&
      target?.addedBy &&
      target.addedBy !== memberLabel
    ) {
      setDuplicateAlert(
        `Sản phẩm "${target?.name}" đã được ${target?.addedBy} thêm trước đó.`,
      );
    }
    
    if (delta > 0 && target && typeof target.stockLevel === 'number' && target.qty + delta > target.stockLevel) {
      setDuplicateAlert(`Sản phẩm "${target.name}" chỉ còn ${target.stockLevel} sản phẩm trong kho!`);
      return;
    }

    setItems((list) =>
      list.flatMap((item) => {
        if (item.id !== id) return [item];
        const nextQty = item.qty + delta;
        return nextQty <= 0 ? [] : [{ ...item, qty: nextQty }];
      }),
    );
  };
  const remove = (id: string) =>
    setItems((list) => list.filter((item) => item.id !== id));

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  );
  const checkout = useMemo(
    () => getCheckoutSummary(subtotal, items, memberTier),
    [subtotal, items, memberTier],
  );
  const cartTotal = checkout.total;

  const handlePaymentSuccess = async (receipt: CompletedReceipt) => {
    const historyOrder: PurchaseHistoryOrder = {
      id: receipt.orderId,
      completedAt: receipt.paidAt,
      store: receipt.store,
      paymentMethod: receipt.paymentMethod,
      items: receipt.items,
      discount: receipt.discount,
      tax: receipt.tax,
      total: receipt.total,
      pointsEarned: receipt.pointsEarned,
      appliedVoucherCode: receipt.appliedVoucherCode,
    };
    try {
      await api.createOrder(historyOrder);
      setPurchaseHistory((history) => [historyOrder, ...history]);
      
      const nextPoints = memberPoints + receipt.pointsEarned;
      setMemberPoints(nextPoints);

      // Cập nhật điểm của khách hàng trên database
      if (typeof window !== "undefined") {
        const userId = window.localStorage.getItem("smartcart-current-user-id");
        const userPhone = window.localStorage.getItem("smartcart-current-user-phone");
        if (userId) {
          await api.updateCustomerPoints(userId, nextPoints);
        } else if (userPhone) {
          await api.updateCustomerPointsByPhone(userPhone, nextPoints);
        }
      }
      
      setItems([]);
    } catch (err) {
      console.error("Failed to save order or update stats on BE:", err);
      alert("Lỗi kết nối: Không thể lưu đơn hàng. Vui lòng thử lại!");
    }
  };


  const completePersonalLogin = (user: any) => {
    leaveGroup();
    setAuthenticated(true);
    const displayPhone = user.phoneNumber || user.phone;
    const role = user.role || "customer";
    setCurrentCart({
      member: user.fullName || user.name || "Khách hàng",
      cartId: displayPhone ? `Tài khoản ${displayPhone}` : `Mã QR ${user.qrCode}`,
      tone: "bg-[#0F172A]",
    });
    setMemberPoints(user.points || 1250);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("smartcart-current-user-phone", displayPhone || "");
      window.localStorage.setItem("smartcart-current-user-id", user._id || "");
      window.localStorage.setItem("smartcart-user-role", role);
      window.localStorage.setItem("smartcart-user-name", user.fullName || user.name || "Khách hàng");
      if (role === "admin") {
        if (user.token) {
          window.localStorage.setItem("smartcart-admin-token", user.token);
        }
        window.history.pushState({}, "", "/admin");
      } else {
        window.history.pushState({}, "", "/home");
      }
    }

    if (role === "admin") {
      setAdminName(user.fullName || user.name || "Administrator");
      setScreenState("admin");
    } else {
      setScreenState("home");
    }
  };

  const handlePhoneLogin = (customer: any) => {
    completePersonalLogin(customer);
  };

  const handleQrLogin = async () => {
    try {
      const user = await api.loginWithQR();
      completePersonalLogin(user);
    } catch (err) {
      alert("Lỗi khi đăng nhập QR: " + (err as Error).message);
    }
  };


  const renderScreen = () => {
    switch (screen) {
      case "splash":
        return <SplashScreen start={() => setScreen("login")} />;
      case "login":
        return (
          <LoginScreen
            back={back}
            continueAsGuest={() => {
              leaveGroup();
              setAuthenticated(false);
              setCurrentCart({
                member: "Khách hàng",
                cartId: "Mua sắm cá nhân",
                tone: "bg-[#0F172A]",
              });
              setScreen("home");
            }}
            onQrLogin={handleQrLogin}
            onPhoneLogin={handlePhoneLogin}
            onCreateGroup={createShoppingGroup}
            onJoinGroup={joinShoppingGroup}
          />
        );
      case "admin-login":
        // Fallback or legacy admin login screen
        return (
          <AdminLoginScreen
            back={() => setScreen("login")}
            onLoginSuccess={(name, token, role) => {
              if (typeof window !== "undefined") {
                window.localStorage.setItem("smartcart-admin-token", token);
                window.localStorage.setItem("smartcart-user-role", role);
                window.localStorage.setItem("smartcart-user-name", name);
              }
              setAuthenticated(true);
              setAdminName(name);
              setScreen("admin");
            }}
          />
        );
      case "admin":
        const currentRole = typeof window !== "undefined" ? window.localStorage.getItem("smartcart-user-role") : null;
        return (
          <AdminProtectedRoute
            userRole={currentRole}
            onRedirect={() => {
              setScreenState("login");
              if (typeof window !== "undefined") {
                window.history.pushState({}, "", "/");
              }
            }}
          >
            <BranchProvider>
              <AdminDashboardScreen
                logout={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem("smartcart-admin-token");
                    window.localStorage.removeItem("smartcart-user-role");
                    window.localStorage.removeItem("smartcart-user-name");
                    window.history.pushState({}, "", "/");
                  }
                  setAuthenticated(false);
                  setScreenState("login");
                }}
                adminName={adminName}
              />
            </BranchProvider>
          </AdminProtectedRoute>
        );
      case "home":
        return (
          <HomeScreen
            cartCount={cartCount}
            cartTotal={cartTotal}
            add={add}
            go={setScreen}
            items={items}
            update={update}
            remove={remove}
            onSelectCategory={goToCategory}
            manualList={manualList}
            addNewManualItem={addNewManualItem}
            toggleCheckItem={toggleCheckItem}
            setDuplicateAlert={setDuplicateAlert}
            groupCode={groupCode}
            currentCart={currentCart}
            groupMembers={groupMembers}
            memberPoints={authenticated ? memberPoints : 0}
          />
        );
      case "category":
        return (
          <CategoryScreen
            categoryName={activeCategory}
            items={items}
            add={add}
            update={update}
            remove={remove}
            go={setScreen}
            back={back}
            cartCount={cartCount}
            cartTotal={cartTotal}
            toggleListPopup={() => setShowListPopup((value) => !value)}
            showListPopup={showListPopup}
            manualList={manualList}
            toggleCheckItem={toggleCheckItem}
            addNewManualItem={addNewManualItem}
          />
        );
      case "group":
        return (
          <GroupSessionScreen
            groupCode={groupCode}
            groupRole={groupRole}
            currentCart={currentCart}
            groupMembers={groupMembers}
            syncStatus={syncStatus}
            back={() => {
              leaveGroup();
              setScreenState("login");
            }}
            go={setScreen}
            cartCount={cartCount}
            cartTotal={cartTotal}
            toggleListPopup={() => setShowListPopup((value) => !value)}
            showListPopup={showListPopup}
            manualList={manualList}
            toggleCheckItem={toggleCheckItem}
            addNewManualItem={addNewManualItem}
          />
        );
      case "map":
        return (
          <MapScreen
            go={setScreen}
            cartCount={cartCount}
            cartTotal={cartTotal}
            items={items}
            toggleListPopup={() => setShowListPopup((value) => !value)}
            showListPopup={showListPopup}
            manualList={manualList}
            toggleCheckItem={toggleCheckItem}
            addNewManualItem={addNewManualItem}
          />
        );
      case "cart":
        return (
          <CartScreen
            items={items}
            update={update}
            remove={remove}
            go={setScreen}
            back={back}
            checkout={checkout}
            groupCode={groupCode}
            onPaymentSuccess={handlePaymentSuccess}
          />
        );
      case "account":
        return (
          <AccountScreen
            authenticated={authenticated}
            navigate={setScreen}
            onSignIn={() => setScreen("login")}
            logout={handleLogout}
            cartCount={cartCount}
            cartTotal={cartTotal}
            toggleListPopup={() => setShowListPopup((value) => !value)}
            showListPopup={showListPopup}
            manualList={manualList}
            toggleCheckItem={toggleCheckItem}
            addNewManualItem={addNewManualItem}
            memberPoints={memberPoints}
            purchaseHistory={purchaseHistory}
            memberTier={memberTier}
            memberName={currentCart.member}
          />
        );
      case "history":
        return (
          <PurchaseHistoryScreen
            back={() => setScreen("account")}
            memberPoints={memberPoints}
            history={purchaseHistory}
          />
        );
      case "offers":
        return (
          <OffersScreen
            back={() => setScreen("account")}
            memberPoints={memberPoints}
            cartTotal={subtotal}
            items={items}
            memberTier={memberTier}
          />
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    leaveGroup();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("smartcart-current-user-phone");
      window.localStorage.removeItem("smartcart-current-user-id");
    }
    setAuthenticated(false);
    setScreenState("splash");
  };

  const showNav =
    screen === "home" || screen === "map" || screen === "account";

  return (
    <main className="h-[100dvh] w-full overflow-hidden bg-[#FFFFFF] text-[#0F172A]">
      <div className="relative mx-auto flex h-full max-w-[1366px] flex-col overflow-hidden">
        {renderScreen()}
        {duplicateAlert && (
          <div className="absolute left-1/2 top-4 z-[100] flex w-[min(720px,90%)] -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-amber-500 bg-amber-50 p-4 text-[#0F172A] shadow-[0_16px_36px_rgba(17,17,17,.25)]">
            <AlertTriangle size={26} className="shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-700">
                Cảnh báo trùng lặp
              </p>
              <p className="mt-1 text-sm font-extrabold">{duplicateAlert}</p>
            </div>
            <button
              onClick={() => setDuplicateAlert(null)}
              className="rounded-xl bg-amber-200 px-3 py-2 text-xs font-black hover:bg-amber-300"
            >
              Đã hiểu
            </button>
          </div>
        )}
        {groupCode &&
          !["splash", "login", "group"].includes(screen) && (
            <button
              onClick={() => setScreen("group")}
              className="absolute bottom-[92px] left-5 z-30 flex items-center gap-2 rounded-xl border border-emerald-400 bg-[#0F172A]/95 px-3 py-2 text-xs font-black text-white shadow-lg"
            >
              <Wifi size={15} className="text-emerald-400" />
              <span>
                {groupCode} · {syncStatus}
              </span>
            </button>
          )}
        {showNav && (
          <BottomNav
            active={screen}
            onChange={setScreen}
            cartCount={cartCount}
          />
        )}
      </div>
    </main>
  );
}