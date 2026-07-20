import React, { useState, useEffect } from "react";
import { GatewayDashboard } from "./gateway/GatewayDashboard";
import { GatewayInspectionView } from "./gateway/GatewayInspectionView";
import { GatewayProvider } from "../contexts/GatewayContext";

type GatewayView = "dashboard" | "inspection";

export function GatewayPortalScreen({ back }: { back: () => void }) {
  const [view, setView] = useState<GatewayView>("dashboard");
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = window.localStorage.getItem("smartcart-user-name") || "Nhân viên cổng";
      const t = window.localStorage.getItem("smartcart-admin-token") || "";
      setStaffName(name);
      setToken(t);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("smartcart-admin-token");
      window.localStorage.removeItem("smartcart-user-role");
      window.localStorage.removeItem("smartcart-user-name");
      window.history.pushState({}, "", "/");
    }
    back();
  };

  const handleScanCart = (cartId: string) => {
    setSelectedCartId(cartId);
    setView("inspection");
  };

  const handleBackToDashboard = () => {
    setSelectedCartId(null);
    setView("dashboard");
  };

  return (
    <GatewayProvider token={token}>
      <div className="h-screen w-full bg-[#F5F5E6] font-sans flex flex-col overflow-hidden">
        {view === "dashboard" && (
          <GatewayDashboard 
            staffName={staffName} 
            onLogout={handleLogout} 
            onScanCart={handleScanCart} 
          />
        )}
        
        {view === "inspection" && selectedCartId && (
          <GatewayInspectionView 
            cartId={selectedCartId}
            staffName={staffName}
            token={token}
            onBack={handleBackToDashboard} 
          />
        )}
      </div>
    </GatewayProvider>
  );
}
