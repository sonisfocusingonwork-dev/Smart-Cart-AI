import React, { useState } from 'react';
import { Monitor, Sun, Moon, Palette, Image as ImageIcon, Globe, Save } from 'lucide-react';

export function SystemUIConfigTab() {
  const [themeMode, setThemeMode] = useState<'light'|'dark'>('light');
  const [primaryColor, setPrimaryColor] = useState('#15803D');
  const [language, setLanguage] = useState('vi');

  const handleUploadLogo = () => alert("Upload logo thành công!");
  const handleSave = () => alert("Đã lưu cấu hình giao diện!");

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#15803D]">Giao diện hệ thống</h2>
          <p className="text-[#64748B] text-sm mt-1">Tuỳ chỉnh màu sắc, theme và logo của hệ thống.</p>
        </div>
        
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#15803D]/90 text-white rounded-2xl font-bold transition-all shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
          <Save size={18} />
          <span>Lưu giao diện</span>
        </button>
      </div>

      <div className="bg-[#FFFFFF] rounded-3xl p-8 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] grid grid-cols-1 md:grid-cols-2 gap-10">
        
        <div className="space-y-8">
          {/* Chế độ Sáng/Tối */}
          <div className="space-y-3">
            <label className="font-black text-[#334155] flex items-center gap-2">
              <Monitor size={18} className="text-[#15803D]" />
              Chế độ Sáng / Tối
            </label>
            <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-1 w-full max-w-xs">
              <button 
                onClick={() => setThemeMode('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${themeMode === 'light' ? 'bg-white text-[#15803D] shadow-sm' : 'text-[#94A3B8] hover:text-[#334155]'}`}
              >
                <Sun size={16} /> Light
              </button>
              <button 
                onClick={() => setThemeMode('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${themeMode === 'dark' ? 'bg-[#1E293B] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#334155]'}`}
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          </div>

          {/* Màu chủ đạo */}
          <div className="space-y-3">
            <label className="font-black text-[#334155] flex items-center gap-2">
              <Palette size={18} className="text-amber-500" />
              Màu chủ đạo (Primary Color)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-12 w-12 rounded-xl cursor-pointer border-0 p-0 overflow-hidden"
              />
              <input 
                type="text" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-32 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[#15803D] uppercase"
              />
            </div>
          </div>

          {/* Ngôn ngữ hệ thống */}
          <div className="space-y-3">
            <label className="font-black text-[#334155] flex items-center gap-2">
              <Globe size={18} className="text-blue-500" />
              Ngôn ngữ mặc định
            </label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full max-w-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#15803D] appearance-none"
            >
              <option value="vi">Tiếng Việt (Vietnamese)</option>
              <option value="en">English (US)</option>
            </select>
          </div>
        </div>

        {/* Upload Logo */}
        <div className="space-y-3 border-l-0 md:border-l border-[#E2E8F0] md:pl-10">
          <label className="font-black text-[#334155] flex items-center gap-2 mb-2">
            <ImageIcon size={18} className="text-purple-500" />
            Logo Hệ thống
          </label>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E2E8F0] rounded-3xl bg-[#F8FAFC] text-center">
            <div className="w-24 h-24 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center mb-4 shadow-sm">
              {/* Fake logo display */}
              <div className="font-black text-2xl text-[#15803D]">SC</div>
            </div>
            <p className="text-sm font-semibold text-[#64748B] mb-2">Kéo thả logo vào đây</p>
            <p className="text-xs text-[#94A3B8] mb-6">Định dạng PNG/SVG, max 2MB</p>
            <button onClick={handleUploadLogo} className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#334155] rounded-xl font-bold hover:bg-[#F5F5E6] transition-all">
              Tải ảnh lên
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
