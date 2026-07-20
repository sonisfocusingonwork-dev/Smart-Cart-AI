import React, { useState } from 'react';
import { ShoppingCart, QrCode, Edit3, Activity, Battery, Power, DownloadCloud, Check } from 'lucide-react';

export function AICartConfigTab() {
  const [cartName, setCartName] = useState('Smart Cart 01');
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);

  const handleRegister = () => {
    alert("Đăng ký xe đẩy mới!");
  };

  const handleAssignQR = () => {
    alert("Gán mã QR cho xe!");
  };

  const handleReboot = () => {
    if (window.confirm("Bạn có chắc chắn muốn khởi động lại xe đẩy này?")) {
      alert("Đang khởi động lại...");
    }
  };

  const handleUpdateFirmware = () => {
    alert("Đang kiểm tra và cập nhật firmware...");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-[#15803D]">Cấu hình xe đẩy AI</h2>
        <p className="text-[#64748B] text-sm mt-1">Quản lý và giám sát trạng thái của các xe đẩy thông minh.</p>
      </div>

      {/* Main Status & Info Card */}
      <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#15803D]/10 flex items-center justify-center text-[#15803D]">
            <ShoppingCart size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-[#334155]">{cartName}</h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black ${isOnline ? 'bg-[#15803D]/10 text-[#15803D]' : 'bg-slate-100 text-slate-500'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#64748B]">
              <Battery size={16} className={batteryLevel > 20 ? "text-[#15803D]" : "text-red-500"} />
              <span>Pin: {batteryLevel}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOnline(!isOnline)} className="px-4 py-2 rounded-2xl font-bold text-sm bg-white border border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC] shadow-sm transition-all">
            Toggle Status
          </button>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Đăng ký xe đẩy */}
        <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] hover:shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-all flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h4 className="font-bold text-[#334155] mb-1">Đăng ký xe đẩy mới</h4>
            <p className="text-xs text-[#94A3B8]">Thêm xe đẩy AI vào hệ thống cửa hàng</p>
          </div>
          <button onClick={handleRegister} className="mt-auto w-full py-2.5 bg-[#15803D] hover:bg-[#15803D]/90 text-white rounded-xl font-bold text-sm transition-colors">
            Đăng ký ngay
          </button>
        </div>

        {/* Gán mã QR */}
        <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] hover:shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-all flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <QrCode size={24} />
          </div>
          <div>
            <h4 className="font-bold text-[#334155] mb-1">Gán mã QR</h4>
            <p className="text-xs text-[#94A3B8]">Đồng bộ mã QR định danh cho xe đẩy</p>
          </div>
          <button onClick={handleAssignQR} className="mt-auto w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors">
            Gán mã QR
          </button>
        </div>

        {/* Đổi tên xe */}
        <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] hover:shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-all flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Edit3 size={24} />
          </div>
          <div className="w-full">
            <h4 className="font-bold text-[#334155] mb-1">Đổi tên xe</h4>
            <input 
              type="text" 
              value={cartName} 
              onChange={(e) => setCartName(e.target.value)}
              className="w-full mt-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#334155] font-semibold focus:outline-none focus:border-[#15803D]"
            />
          </div>
        </div>

        {/* Khởi động lại */}
        <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] hover:shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-all flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Power size={24} />
          </div>
          <div>
            <h4 className="font-bold text-[#334155] mb-1">Khởi động lại</h4>
            <p className="text-xs text-[#94A3B8]">Gửi lệnh restart hệ thống xuống xe</p>
          </div>
          <button onClick={handleReboot} className="mt-auto w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors">
            Reboot
          </button>
        </div>

        {/* Cập nhật firmware */}
        <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] hover:shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-all flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <DownloadCloud size={24} />
          </div>
          <div>
            <h4 className="font-bold text-[#334155] mb-1">Firmware</h4>
            <p className="text-xs text-[#94A3B8]">Cập nhật phần mềm mới nhất (v2.4.1)</p>
          </div>
          <button onClick={handleUpdateFirmware} className="mt-auto w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors">
            Cập nhật ngay
          </button>
        </div>
      </div>
    </div>
  );
}
