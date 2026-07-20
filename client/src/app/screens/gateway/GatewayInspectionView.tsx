import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, ShoppingCart, User, RefreshCw, BellRing, Camera, ChevronDown, ChevronUp, Maximize2, X } from "lucide-react";
import { api } from "../../api";
import type { CartHistoryPayload, GateSnapshotData } from "../../shared";
import { useGateway } from "../../contexts/GatewayContext";

interface GatewayInspectionViewProps {
  cartId: string;
  staffName: string;
  token?: string; // Optional if you pass token
  onBack: () => void;
}

export function GatewayInspectionView({ cartId, staffName, token = "", onBack }: GatewayInspectionViewProps) {
  const { refreshDashboard } = useGateway();
  const [loading, setLoading] = useState(true);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  
  const [cartInfo, setCartInfo] = useState<CartHistoryPayload | null>(null);
  const [snapshotData, setSnapshotData] = useState<GateSnapshotData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payload = await api.getGatewayCartPayload(cartId, token);
        setCartInfo(payload.cartHistory);
        setSnapshotData(payload.gateSnapshot);
      } catch (err) {
        console.error("Error fetching cart payload:", err);
        setError("Không thể tải thông tin xe đẩy hoặc xe đẩy không tồn tại.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cartId, token]);

  const handleAction = (action: "pass" | "hold") => {
    if (action === "hold") {
      setShowHoldModal(true);
    } else {
      submitLog("pass", "Hợp lệ");
    }
  };

  const submitLog = async (status: "pass" | "hold", reason?: string) => {
    try {
      console.log("Logged decision:", { cartId, staffName, status, reason });
      await api.submitGatewayLog(cartId, staffName, status, reason, token);
      await refreshDashboard(token);
      onBack();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateTrustScore = () => {
    if (!cartInfo) return 100;
    const unverifiedItems = cartInfo.items.filter(i => !i.aiVerified).length;
    if (unverifiedItems === 0) return 98;
    if (unverifiedItems === 1) return 75;
    return 45;
  };

  const trustScore = calculateTrustScore();

  const TrafficLight = ({ score }: { score: number }) => {
    const isGreen = score >= 90;
    const isYellow = score >= 70 && score < 90;
    const isRed = score < 70;

    return (
      <div className="flex gap-4 items-center bg-black/5 p-4 rounded-3xl border border-black/10">
        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${isGreen ? 'bg-green-500 border-green-200 shadow-[0_0_30px_rgba(34,197,94,0.6)]' : 'bg-gray-300 border-gray-400 opacity-30'}`} />
        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${isYellow ? 'bg-amber-400 border-amber-200 shadow-[0_0_30px_rgba(251,191,36,0.6)]' : 'bg-gray-300 border-gray-400 opacity-30'}`} />
        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${isRed ? 'bg-red-500 border-red-200 shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'bg-gray-300 border-gray-400 opacity-30'}`} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F5F5E6]">
        <div className="w-12 h-12 border-4 border-[#15803D]/30 border-t-[#15803D] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !cartInfo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5F5E6] p-8 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 flex items-center justify-center rounded-full mb-6">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-2xl font-black text-[#334155] mb-2">Lỗi Truy Xuất Dữ Liệu</h2>
        <p className="text-[#64748B] font-medium mb-8 max-w-md">
          {error || `Không tìm thấy dữ liệu cho mã xe: ${cartId}`}
        </p>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-[#15803D] text-white font-bold rounded-xl shadow-lg hover:bg-[#166534] transition-colors"
        >
          Quay lại Bảng Điều Khiển
        </button>
      </div>
    );
  }

  const unverifiedItemsCount = cartInfo.items.filter(i => !i.aiVerified).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5E6] relative">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center gap-6 z-10 shrink-0 shadow-sm">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] text-[#64748B] hover:text-[#334155] hover:bg-[#F1F5F9] rounded-xl font-bold transition-colors border border-[#E2E8F0]"
        >
          <ArrowLeft size={18} /> Đóng
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#15803D]">Chi Tiết Kiểm Tra: {cartInfo.cartId}</h1>
          <p className="text-sm font-semibold text-[#64748B]">Đang xử lý bởi: <span className="text-[#334155]">{staffName}</span></p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 [scrollbar-width:none]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Cart Info & AI Analysis */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Identity & Payment Verification */}
            <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#94A3B8] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User size={16} /> Thông tin khách hàng
                  </h2>
                  <div className="text-2xl font-black text-[#334155] mb-1">{cartInfo.customerPhone}</div>
                  <div className="text-[#64748B] font-medium text-sm flex items-center gap-4">
                    <span>Đến lúc: <strong className="text-[#334155]">{cartInfo.timestamp}</strong></span>
                    <span>Hóa đơn: <strong className="text-[#334155]">{cartInfo.invoiceCode}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {cartInfo.status === 'paid' || cartInfo.status === 'passed' ? (
                    <div className="bg-[#D1FAE5] text-[#15803D] px-6 py-3 rounded-2xl flex items-center gap-3 border border-[#15803D]/20">
                      <CheckCircle2 size={28} />
                      <div className="text-left">
                        <div className="font-black text-lg">ĐÃ THANH TOÁN</div>
                        <div className="text-xs font-bold opacity-80 uppercase tracking-widest">{cartInfo.paymentMethod}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl flex items-center gap-3 border border-red-200">
                      <XCircle size={28} />
                      <div className="font-black text-lg">CHƯA THANH TOÁN</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
                <div className="flex gap-8 items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#94A3B8] uppercase">Tổng SP</div>
                    <div className="text-3xl font-black text-[#334155]">{cartInfo.items.reduce((acc, curr) => acc + curr.qty, 0)}</div>
                  </div>
                  <div className="text-right space-y-1">
                    {cartInfo.discount ? (
                      <div className="text-sm font-bold text-red-500">Giảm giá {cartInfo.appliedVoucherCode ? `(${cartInfo.appliedVoucherCode})` : ''}: -{cartInfo.discount.toLocaleString("vi-VN")} đ</div>
                    ) : null}
                    {cartInfo.tax ? (
                      <div className="text-sm font-bold text-[#64748B]">Thuế VAT: {cartInfo.tax.toLocaleString("vi-VN")} đ</div>
                    ) : null}
                    <div className="text-sm font-bold text-[#94A3B8] uppercase mt-2">Tổng thanh toán</div>
                    <div className="text-3xl font-black text-[#15803D]">{cartInfo.total.toLocaleString("vi-VN")} đ</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Products */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] overflow-hidden">
              <button 
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="w-full bg-[#F8FAFC] border-b border-[#E2E8F0] p-6 flex justify-between items-center transition-colors hover:bg-[#F1F5F9]"
              >
                <h3 className="font-black text-[#334155] flex items-center gap-2">
                  <ShoppingCart className="text-[#3B82F6]" /> Danh sách sản phẩm ({cartInfo.items.length})
                </h3>
                {isProductsOpen ? <ChevronUp className="text-[#64748B]" /> : <ChevronDown className="text-[#64748B]" />}
              </button>
              
              {isProductsOpen && (
                <div className="p-6">
                  <div className="space-y-4">
                    {cartInfo.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-dashed border-[#E2E8F0] last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[#334155] bg-[#F1F5F9] w-8 h-8 rounded-lg flex items-center justify-center">{item.qty}</span>
                          <span className="font-bold text-[#475569]">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right font-bold text-[#334155]">
                            {item.price.toLocaleString("vi-VN")} đ x {item.qty}
                          </div>
                          {item.aiVerified ? (
                            <CheckCircle2 size={20} className="text-[#16A34A]" />
                          ) : (
                            <AlertTriangle size={20} className="text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis & Alerts */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] overflow-hidden">
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-6 flex justify-between items-center">
                <h3 className="font-black text-[#334155] flex items-center gap-2">
                  <ShieldAlert className="text-[#3B82F6]" /> AI Trust Score & Phân Tích
                </h3>
                <div className="px-3 py-1 bg-white border border-[#E2E8F0] rounded-full text-xs font-bold text-[#64748B]">
                  Risk: <span className={trustScore >= 90 ? "text-[#15803D]" : "text-amber-500"}>{trustScore >= 90 ? 'LOW' : 'MEDIUM'}</span>
                </div>
              </div>
              <div className="p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                      <circle 
                        cx="80" cy="80" r="70" fill="none" 
                        stroke={trustScore >= 90 ? "#16A34A" : trustScore >= 70 ? "#F59E0B" : "#EF4444"} 
                        strokeWidth="12" 
                        strokeDasharray="440" 
                        strokeDashoffset={440 - (440 * trustScore) / 100}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-[#334155]">{trustScore}</span>
                      <span className="text-xs font-bold text-[#94A3B8]">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  {unverifiedItemsCount > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-start gap-3">
                      <AlertTriangle className="shrink-0 mt-0.5 text-amber-500" size={20} />
                      <div>
                        <div className="font-bold">Cảnh báo hệ thống</div>
                        <p className="text-sm font-medium mt-1">Phát hiện {unverifiedItemsCount} sản phẩm không khớp hoặc cần kiểm tra lại.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] p-4 rounded-2xl flex items-start gap-3">
                      <CheckCircle2 className="shrink-0 mt-0.5 text-[#16A34A]" size={20} />
                      <div>
                        <div className="font-bold">Không phát hiện sai lệch hàng hóa</div>
                        <p className="text-sm font-medium mt-1">Hệ thống Camera AI xác nhận số lượng trên xe khớp với hóa đơn.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Camera & Action Center */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Visual Result */}
            <div className="bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] flex flex-col items-center justify-center">
              <h3 className="font-black text-[#94A3B8] uppercase tracking-wider mb-6 text-sm text-center">Tín Hiệu Kiểm Soát</h3>
              <TrafficLight score={trustScore} />
              <div className="mt-6 text-center">
                {trustScore >= 90 ? (
                  <span className="inline-block px-4 py-1.5 bg-[#D1FAE5] text-[#15803D] font-black rounded-full border border-[#15803D]/20">
                    HỢP LỆ - CÓ THỂ QUA CỔNG
                  </span>
                ) : (
                  <span className="inline-block px-4 py-1.5 bg-[#FEF3C7] text-amber-600 font-black rounded-full border border-amber-300">
                    CẦN KIỂM TRA LẠI
                  </span>
                )}
              </div>
            </div>

            {/* Camera Snapshot Placeholder */}
            {snapshotData && (
              <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] overflow-hidden flex flex-col">
                <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex justify-between items-center">
                  <h3 className="font-bold text-[#334155] text-sm flex items-center gap-2">
                    <Camera size={16} /> Gate Snapshot
                  </h3>
                  <button onClick={() => setIsZoomModalOpen(true)} className="text-[#64748B] hover:text-[#334155]">
                    <Maximize2 size={16} />
                  </button>
                </div>
                <div className="w-full aspect-[4/3] bg-black relative flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => setIsZoomModalOpen(true)}>
                  <img src={snapshotData.imageUrl} alt="Gate Snapshot" className="absolute inset-0 w-full h-full object-cover" />
                  
                  {/* Bounding Boxes */}
                  {snapshotData.aiAnomalies.map((anomaly, idx) => (
                    <div 
                      key={idx}
                      className="absolute border-2 border-red-500 bg-red-500/20"
                      style={{
                        left: `${anomaly.x}%`,
                        top: `${anomaly.y}%`,
                        width: `${anomaly.width}%`,
                        height: `${anomaly.height}%`
                      }}
                    >
                      <span className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                        {anomaly.label}
                      </span>
                    </div>
                  ))}
                  
                  {/* Overlay Metadata */}
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs flex justify-between bg-black/50 p-2 rounded backdrop-blur-sm">
                    <span>{snapshotData.timestamp}</span>
                    <span className="font-bold">{snapshotData.cartId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Center */}
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] flex flex-col gap-4">
              <button 
                onClick={() => handleAction("pass")}
                className="w-full bg-[#15803D] hover:bg-[#15803D]/90 text-white font-black py-5 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(21,128,61,0.39)] text-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={24} /> Cho Phép Qua Cổng
              </button>
              
              <button 
                onClick={() => handleAction("hold")}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-5 rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] text-lg flex items-center justify-center gap-2"
              >
                <XCircle size={24} /> Tạm Giữ Kiểm Tra
              </button>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <button className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#334155] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <RefreshCw size={18} /> Làm Mới
                </button>
                <button className="bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] hover:bg-[#FEF3C7] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <BellRing size={18} /> Gọi Q.Lý
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* HOLD MODAL */}
      {showHoldModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl flex flex-col transform animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black text-center text-[#334155] mb-2">Xác nhận Tạm giữ</h2>
            <p className="text-center text-[#64748B] font-medium mb-8">Vui lòng chọn lý do tạm giữ xe <strong className="text-[#334155]">{cartId}</strong></p>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              {['Chưa thanh toán', 'Sản phẩm không khớp', 'QR/Hóa đơn không hợp lệ', 'Nghi ngờ gian lận', 'Lỗi hệ thống', 'Khác'].map(reason => (
                <button
                  key={reason}
                  onClick={() => setHoldReason(reason)}
                  className={`py-4 px-4 rounded-2xl border-2 font-bold text-sm transition-all text-center
                    ${holdReason === reason 
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' 
                      : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#CBD5E1]'}`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowHoldModal(false);
                  setHoldReason("");
                }}
                className="flex-1 py-4 bg-[#F1F5F9] text-[#475569] font-bold rounded-2xl hover:bg-[#E2E8F0] transition-colors"
              >
                Hủy
              </button>
              <button 
                disabled={!holdReason}
                onClick={() => {
                  submitLog("hold", holdReason);
                  setShowHoldModal(false);
                }}
                className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-colors shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] disabled:opacity-50 disabled:shadow-none"
              >
                Xác nhận Giữ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM MODAL */}
      {isZoomModalOpen && snapshotData && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-12">
          <button 
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 bg-white/10 rounded-full"
          >
            <X size={32} />
          </button>
          
          <div className="w-full max-w-5xl aspect-[4/3] bg-black relative rounded-2xl overflow-hidden shadow-2xl">
            <img src={snapshotData.imageUrl} alt="Gate Snapshot Zoom" className="absolute inset-0 w-full h-full object-contain" />
            
            {/* Bounding Boxes */}
            {snapshotData.aiAnomalies.map((anomaly, idx) => (
              <div 
                key={idx}
                className="absolute border-4 border-red-500 bg-red-500/20"
                style={{
                  left: `${anomaly.x}%`,
                  top: `${anomaly.y}%`,
                  width: `${anomaly.width}%`,
                  height: `${anomaly.height}%`
                }}
              >
                <span className="absolute -top-10 left-0 bg-red-500 text-white text-base font-black px-4 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  {anomaly.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
