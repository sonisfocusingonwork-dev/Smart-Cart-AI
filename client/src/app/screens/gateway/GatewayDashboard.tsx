import React, { useState, useEffect, useRef } from "react";
import { LogOut, QrCode, Search, CheckCircle2, XCircle, AlertTriangle, Clock, FileText, ShoppingBag, CreditCard, Phone, X, Camera, RefreshCw } from "lucide-react";
import type { CartHistoryPayload } from "../../shared";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useGateway } from "../../contexts/GatewayContext";

interface GatewayDashboardProps {
  staffName: string;
  onLogout: () => void;
  onScanCart: (cartId: string) => void;
}

export function GatewayDashboard({ staffName, onLogout, onScanCart }: GatewayDashboardProps) {
  const { data, loading, error, searchQuery, setSearchQuery, filteredHistory, refreshDashboard } = useGateway();
  const [selectedHistory, setSelectedHistory] = useState<CartHistoryPayload | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scannerReady, setScannerReady] = useState(false);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader | null = new BrowserMultiFormatReader();
    let isComponentMounted = true;

    if (videoRef.current) {
      codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if (result && isComponentMounted) {
          const text = result.getText();
          let scannedId = text;
          try {
            const parsed = JSON.parse(text);
            if (parsed.invoiceId) {
              scannedId = parsed.invoiceId;
            }
          } catch(e) {
            // Not a JSON string, proceed with raw text
          }
          onScanCart(scannedId);
        }
      }).then(() => {
        if (isComponentMounted) setScannerReady(true);
      }).catch(err => {
        console.error("Camera access failed", err);
      });
    }

    return () => {
      isComponentMounted = false;
      if (codeReader) {
        codeReader.reset();
        codeReader = null;
      }
    };
  }, [onScanCart]);

  // Manual search to trigger inspection view directly
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      let query = searchQuery.trim();
      try {
        const parsed = JSON.parse(query);
        if (parsed.invoiceId) query = parsed.invoiceId;
      } catch(e) {}
      onScanCart(query);
    }
  };

  const stats = data?.stats || {
    totalChecks: 0,
    passCount: 0,
    holdCount: 0,
    successRate: 0,
    avgSpeed: "0s"
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F5E6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#15803D]">Bảng Điều Khiển Cổng</h1>
          <p className="text-sm font-semibold text-[#64748B]">Ca trực: <span className="text-[#334155]">{staffName}</span></p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors"
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8 [scrollbar-width:none]">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
              {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCw className="animate-spin text-[#94A3B8]" size={20}/></div>}
              <span className="text-[#94A3B8] font-bold text-xs uppercase tracking-wider mb-1">Lượt kiểm tra</span>
              <span className="text-3xl font-black text-[#334155]">{stats.totalChecks}</span>
            </div>
            <div className="bg-[#F0FDF4] rounded-3xl p-5 border border-[#BBF7D0] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
              {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCw className="animate-spin text-[#15803D]" size={20}/></div>}
              <span className="text-[#15803D] font-bold text-xs uppercase tracking-wider mb-1">Hợp lệ (Pass)</span>
              <span className="text-3xl font-black text-[#16A34A]">{stats.passCount}</span>
            </div>
            <div className="bg-[#FEF2F2] rounded-3xl p-5 border border-[#FECACA] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
              {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCw className="animate-spin text-red-500" size={20}/></div>}
              <span className="text-red-600 font-bold text-xs uppercase tracking-wider mb-1">Tạm giữ (Hold)</span>
              <span className="text-3xl font-black text-red-500">{stats.holdCount}</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
              {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCw className="animate-spin text-[#94A3B8]" size={20}/></div>}
              <span className="text-[#94A3B8] font-bold text-xs uppercase tracking-wider mb-1">Tỷ lệ thành công</span>
              <span className="text-3xl font-black text-[#3B82F6]">{stats.successRate}%</span>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
              {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCw className="animate-spin text-[#94A3B8]" size={20}/></div>}
              <span className="text-[#94A3B8] font-bold text-xs uppercase tracking-wider mb-1">Tốc độ TB</span>
              <span className="text-3xl font-black text-[#334155]">{stats.avgSpeed}</span>
            </div>
          </div>

          {/* Main Action Area (Scan & Search) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scanner UI */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] overflow-hidden flex flex-col">
              <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h2 className="font-black text-[#334155] flex items-center gap-2">
                  <QrCode className="text-[#15803D]" /> Quét mã QR Xe Đẩy / Hóa Đơn
                </h2>
              </div>
              <div className="flex-1 bg-black relative flex items-center justify-center p-8">
                {/* Scanner optimized for Tablet square */}
                <div className="aspect-square w-full max-w-md border-2 border-dashed border-[#15803D] rounded-3xl flex items-center justify-center relative overflow-hidden">
                  <video 
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                  {!scannerReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
                      <Camera size={48} className="mb-4 opacity-50 animate-pulse" />
                      <p className="font-bold text-[#94A3B8]">Đang bật Camera...</p>
                    </div>
                  )}
                  {scannerReady && (
                    <div className="w-3/4 h-3/4 border-4 border-[#15803D]/80 rounded-2xl animate-pulse relative z-10" />
                  )}
                </div>
                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                  <button 
                    onClick={() => onScanCart("Cart_DEMO")}
                    className="px-6 py-4 bg-[#15803D] text-white font-black rounded-2xl shadow-lg z-10 hover:bg-[#166534] transition-colors"
                  >
                    Mã QR Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Search & History */}
            <div className="space-y-6 flex flex-col">
              {/* Search Bar */}
              <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]">
                <h3 className="font-black text-[#334155] mb-4">Tra cứu thủ công</h3>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nhập Mã xe, Mã hóa đơn, hoặc SĐT..."
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl pl-12 pr-4 py-4 text-[#334155] font-bold focus:outline-none focus:border-[#15803D] focus:bg-white transition-all shadow-sm"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={20} />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#15803D] text-white font-bold rounded-xl"
                  >
                    Tìm
                  </button>
                </form>
              </div>

              {/* History List */}
              <div className="flex-1 bg-white rounded-3xl border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] flex flex-col overflow-hidden">
                <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                  <h3 className="font-black text-[#334155] flex items-center gap-2">
                    <Clock className="text-[#3B82F6]" size={18} /> Lịch sử kiểm soát gần đây
                  </h3>
                </div>
                <div className="overflow-y-auto p-4 [scrollbar-width:none] flex-1 space-y-3 max-h-[350px] relative">
                  {loading && !filteredHistory.length && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                      <RefreshCw className="animate-spin text-[#94A3B8]" size={32} />
                    </div>
                  )}
                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center font-medium border border-red-100">
                      Lỗi tải dữ liệu: {error}
                    </div>
                  )}
                  {!loading && !error && filteredHistory.length === 0 && (
                    <div className="p-8 text-center text-[#94A3B8] font-medium">
                      Không tìm thấy lịch sử nào.
                    </div>
                  )}
                  {filteredHistory.map((log, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedHistory(log)}
                      className="flex items-center justify-between p-4 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm cursor-pointer rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-bold text-[#94A3B8] text-xs text-center w-14">
                          {new Date(log.timestamp).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <div className="font-black text-[#334155] text-lg leading-tight">{log.cartId}</div>
                          <div className="text-xs font-bold text-[#64748B] flex items-center gap-1 mt-1"><FileText size={12}/> {log.invoiceCode}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {log.status === "pass" ? (
                          <span className="px-4 py-1.5 bg-[#D1FAE5] text-[#15803D] font-bold rounded-full text-xs flex items-center gap-1.5 border border-[#A7F3D0]">
                            <CheckCircle2 size={16} /> Đã qua
                          </span>
                        ) : (
                          <span className="px-4 py-1.5 bg-[#FEE2E2] text-red-600 font-bold rounded-full text-xs flex items-center gap-1.5 border border-[#FECACA]">
                            <AlertTriangle size={16} /> Tạm giữ
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* History Detail Modal */}
      {selectedHistory && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] flex flex-col transform animate-in zoom-in-95 duration-200 border border-[#E2E8F0]">
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC] rounded-t-3xl">
              <h2 className="text-xl font-black text-[#334155] flex items-center gap-2">
                <FileText className="text-[#3B82F6]" /> Chi tiết: {selectedHistory.cartId}
              </h2>
              <button 
                onClick={() => setSelectedHistory(null)}
                className="p-2 text-[#64748B] hover:text-[#334155] hover:bg-[#E2E8F0] rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#94A3B8] uppercase flex items-center gap-1 mb-1"><FileText size={14}/> Mã Hóa Đơn</p>
                  <p className="font-black text-[#334155]">{selectedHistory.invoiceCode}</p>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#94A3B8] uppercase flex items-center gap-1 mb-1"><Phone size={14}/> SĐT Khách</p>
                  <p className="font-black text-[#334155]">{selectedHistory.customerPhone}</p>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#94A3B8] uppercase flex items-center gap-1 mb-1"><CreditCard size={14}/> Thanh Toán</p>
                  <p className="font-black text-[#334155]">{selectedHistory.paymentMethod}</p>
                </div>
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#94A3B8] uppercase flex items-center gap-1 mb-1"><ShoppingBag size={14}/> Tổng tiền</p>
                  <p className="font-black text-[#15803D]">{selectedHistory.total.toLocaleString("vi-VN")} đ</p>
                  {selectedHistory.discount ? (
                    <p className="text-[10px] font-bold text-red-500 mt-0.5">Giảm {selectedHistory.appliedVoucherCode ? `(${selectedHistory.appliedVoucherCode})` : ''}: -{selectedHistory.discount.toLocaleString("vi-VN")}đ</p>
                  ) : null}
                  {selectedHistory.tax ? (
                    <p className="text-[10px] font-bold text-[#64748B] mt-0.5">VAT: {selectedHistory.tax.toLocaleString("vi-VN")}đ</p>
                  ) : null}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-[#334155] mb-3 flex items-center gap-2 border-b border-[#E2E8F0] pb-2">Danh sách sản phẩm ({selectedHistory.items.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {selectedHistory.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-medium py-2 border-b border-dashed border-[#E2E8F0] last:border-0">
                      <div className="flex items-center gap-2 text-[#475569]">
                        <span className="font-black text-[#334155]">{item.qty}x</span> {item.name}
                      </div>
                      <div className="text-[#334155] font-bold text-right">
                        {item.price.toLocaleString("vi-VN")} đ x {item.qty}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-b-3xl flex justify-end">
              <button 
                onClick={() => setSelectedHistory(null)}
                className="px-6 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] font-bold rounded-xl hover:bg-[#F1F5F9] transition-colors shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
