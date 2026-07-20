import React from 'react';
import { DatabaseBackup, HardDriveDownload, AlertTriangle, Info } from 'lucide-react';

export function BackupConfigTab() {

  const handleCreateBackup = () => {
    if(window.confirm("Quá trình sao lưu có thể mất vài phút. Bạn có muốn tiếp tục?")) {
      alert("Đang tạo bản sao lưu dữ liệu toàn hệ thống...");
    }
  };

  const handleRestoreData = () => {
    if(window.confirm("CẢNH BÁO: Khôi phục dữ liệu sẽ ghi đè toàn bộ dữ liệu hiện tại! Bạn chắc chắn chứ?")) {
      alert("Đang khôi phục dữ liệu...");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h2 className="text-2xl font-black text-[#15803D]">Sao lưu & Khôi phục dữ liệu</h2>
        <p className="text-[#64748B] text-sm mt-1">Đảm bảo an toàn dữ liệu hệ thống với các bản sao lưu định kỳ.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-amber-700">Lưu ý quan trọng</h4>
          <p className="text-sm text-amber-600 mt-1">Hệ thống sẽ tự động sao lưu vào lúc 02:00 AM mỗi ngày. Bạn chỉ cần thực hiện sao lưu thủ công trước khi tiến hành cập nhật hệ thống hoặc bảo trì lớn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Create Backup */}
        <div className="bg-[#FFFFFF] rounded-3xl p-8 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#15803D]/10 text-[#15803D] flex items-center justify-center mb-6">
            <DatabaseBackup size={40} />
          </div>
          <h3 className="text-xl font-black text-[#334155] mb-2">Tạo bản sao lưu</h3>
          <p className="text-sm text-[#64748B] mb-8">Tạo tức thì một tệp sao lưu nén toàn bộ database (Sản phẩm, Người dùng, Đơn hàng).</p>
          
          <button 
            onClick={handleCreateBackup}
            className="w-full py-3.5 bg-[#15803D] hover:bg-[#15803D]/90 text-white rounded-2xl font-bold shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition-all flex items-center justify-center gap-2"
          >
            <DatabaseBackup size={20} />
            Bắt đầu Sao Lưu
          </button>
        </div>

        {/* Restore Data */}
        <div className="bg-[#FFFFFF] rounded-3xl p-8 border border-red-100 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-6">
            <HardDriveDownload size={40} />
          </div>
          <h3 className="text-xl font-black text-[#334155] mb-2">Khôi phục dữ liệu</h3>
          <p className="text-sm text-[#64748B] mb-8">Khôi phục hệ thống từ một bản sao lưu. Hành động này sẽ thay thế dữ liệu hiện tại.</p>
          
          <button 
            onClick={handleRestoreData}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)] transition-all flex items-center justify-center gap-2"
          >
            <HardDriveDownload size={20} />
            Tải lên & Khôi Phục
          </button>
        </div>

      </div>
      
      {/* Lịch sử sao lưu */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center gap-2">
          <Info className="text-[#94A3B8]" size={18} />
          <h3 className="font-bold text-[#334155]">Lịch sử sao lưu gần đây</h3>
        </div>
        <div className="p-5 text-center text-sm text-[#94A3B8] italic">
          Chưa có bản sao lưu nào được thực hiện thủ công trong tuần này.
        </div>
      </div>
    </div>
  );
}
