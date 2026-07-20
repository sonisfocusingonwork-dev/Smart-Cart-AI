import React, { useState } from 'react';
import { Bot, MessageSquare, Globe, Navigation, Plus, X, Save } from 'lucide-react';

export function ChatbotConfigTab() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [navEnabled, setNavEnabled] = useState(true);
  const [botName, setBotName] = useState('Smart Assistant');
  const [language, setLanguage] = useState('vi');
  const [greeting, setGreeting] = useState('Xin chào! Tôi có thể giúp gì cho bạn hôm nay?');
  const [questions, setQuestions] = useState([
    'Tìm khu vực đồ tươi sống ở đâu?',
    'Có khuyến mãi gì hôm nay không?',
    'Cách thanh toán bằng thẻ?'
  ]);
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    alert("Đã lưu cấu hình Chatbot thành công!");
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#15803D]">Cấu hình AI Chatbot</h2>
          <p className="text-[#64748B] text-sm mt-1">Quản lý trợ lý ảo trên màn hình xe đẩy.</p>
        </div>
        
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#15803D]/90 text-white rounded-2xl font-bold transition-all shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
          <Save size={18} />
          <span>Lưu thay đổi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cột trái: Cài đặt chung */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] space-y-6">
            <h3 className="text-lg font-black text-[#334155] flex items-center gap-2">
              <Bot className="text-[#15803D]" />
              Cài đặt chung
            </h3>

            {/* Toggle Bật/Tắt AI */}
            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div>
                <h4 className="font-bold text-[#334155]">Trợ lý AI (AI Assistant)</h4>
                <p className="text-xs text-[#94A3B8]">Kích hoạt chatbot trên tất cả xe đẩy</p>
              </div>
              <button 
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isEnabled ? 'bg-[#15803D]' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Đổi tên Chatbot */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#334155]">Tên hiển thị Chatbot</label>
              <input 
                type="text" 
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#334155] font-semibold focus:outline-none focus:border-[#15803D] transition-colors"
              />
            </div>

            {/* Chọn ngôn ngữ */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#334155] flex items-center gap-2">
                <Globe size={16} className="text-[#94A3B8]" />
                Ngôn ngữ mặc định
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#334155] font-semibold focus:outline-none focus:border-[#15803D] transition-colors appearance-none"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="ko">한국어 (Korean)</option>
              </select>
            </div>

            {/* Toggle Chỉ đường */}
            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
                  <Navigation size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[#334155]">Chỉ đường trong siêu thị</h4>
                  <p className="text-xs text-[#94A3B8]">Hiển thị map khi khách hỏi vị trí</p>
                </div>
              </div>
              <button 
                onClick={() => setNavEnabled(!navEnabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${navEnabled ? 'bg-[#15803D]' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${navEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Cột phải: Nội dung hội thoại */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)] space-y-6">
            <h3 className="text-lg font-black text-[#334155] flex items-center gap-2">
              <MessageSquare className="text-[#15803D]" />
              Nội dung hội thoại
            </h3>

            {/* Thiết lập lời chào */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#334155]">Lời chào mặc định</label>
              <textarea 
                rows={3}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#334155] focus:outline-none focus:border-[#15803D] transition-colors resize-none"
              />
            </div>

            {/* Câu hỏi gợi ý */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-[#334155]">Câu hỏi gợi ý (Gợi ý trên UI cho khách hàng)</label>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                  placeholder="Thêm câu hỏi mới..."
                  className="flex-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#334155] focus:outline-none focus:border-[#15803D] transition-colors"
                />
                <button 
                  onClick={handleAddQuestion}
                  className="px-4 py-2.5 bg-[#15803D] text-white rounded-xl hover:bg-[#15803D]/90 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-2 mt-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <span className="text-sm text-[#475569]">{q}</span>
                    <button 
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {questions.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">Chưa có câu hỏi gợi ý nào.</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
