import React from 'react';
import { Map, UploadCloud, Plus, Edit2, Crosshair } from 'lucide-react';

export function MapConfigTab() {
  const handleUpload = () => alert("Upload sơ đồ mới!");
  const handleAddZone = () => alert("Thêm khu vực!");
  const handleAddShelf = () => alert("Thêm kệ hàng!");

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#15803D]">Quản lý bản đồ cửa hàng</h2>
          <p className="text-[#64748B] text-sm mt-1">Cấu hình sơ đồ và vị trí sản phẩm cho tính năng AI Navigation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Zone */}
        <div className="lg:col-span-2 bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] flex flex-col justify-center items-center h-80 border-dashed border-2 bg-[#F8FAFC]">
          <UploadCloud size={48} className="text-[#94A3B8] mb-4" />
          <h3 className="text-lg font-bold text-[#334155] mb-2">Upload sơ đồ cửa hàng</h3>
          <p className="text-sm text-[#94A3B8] text-center mb-6 max-w-sm">
            Kéo thả file ảnh hoặc SVG vào đây. Định dạng hỗ trợ: JPG, PNG, SVG (Khuyến nghị SVG để hiển thị tốt nhất).
          </p>
          <button onClick={handleUpload} className="px-6 py-2.5 bg-[#15803D] text-white rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] hover:bg-[#15803D]/90 transition-all">
            Chọn File
          </button>
        </div>

        {/* Action Panel */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] space-y-4">
          <h3 className="font-black text-[#334155] text-lg">Công cụ thao tác</h3>
          
          <button onClick={handleAddZone} className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[#E2E8F0] hover:border-[#15803D] hover:bg-[#F5F5E6] transition-all text-left">
            <div className="w-10 h-10 rounded-full bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <div className="font-bold text-[#334155]">Thêm khu vực mới</div>
              <div className="text-xs text-[#64748B]">Khoanh vùng khu đồ tươi sống, đồ khô...</div>
            </div>
          </button>

          <button onClick={() => alert("Đổi tên khu vực")} className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[#E2E8F0] hover:border-[#15803D] hover:bg-[#F5F5E6] transition-all text-left">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Edit2 size={20} />
            </div>
            <div>
              <div className="font-bold text-[#334155]">Đổi tên khu vực</div>
              <div className="text-xs text-[#64748B]">Chỉnh sửa label trên bản đồ</div>
            </div>
          </button>

          <button onClick={handleAddShelf} className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[#E2E8F0] hover:border-[#15803D] hover:bg-[#F5F5E6] transition-all text-left">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Map size={20} />
            </div>
            <div>
              <div className="font-bold text-[#334155]">Thêm kệ hàng</div>
              <div className="text-xs text-[#64748B]">Vẽ các block kệ hàng cố định</div>
            </div>
          </button>

          <button onClick={() => alert("Chỉnh tọa độ sản phẩm")} className="w-full flex items-center gap-3 p-4 rounded-2xl border border-[#E2E8F0] hover:border-[#15803D] hover:bg-[#F5F5E6] transition-all text-left">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Crosshair size={20} />
            </div>
            <div>
              <div className="font-bold text-[#334155]">Chỉnh vị trí sản phẩm</div>
              <div className="text-xs text-[#64748B]">Kéo thả pin điểm sản phẩm</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
