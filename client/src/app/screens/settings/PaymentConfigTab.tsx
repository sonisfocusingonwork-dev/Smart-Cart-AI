import React, { useState } from 'react';
import { CreditCard, Wallet, Settings, Save, Check } from 'lucide-react';

export function PaymentConfigTab() {
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [momoEnabled, setMomoEnabled] = useState(true);
  const [vnpayEnabled, setVnpayEnabled] = useState(true);

  const handleSave = () => {
    alert("Đã lưu cấu hình thanh toán!");
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#15803D]">Cấu hình thanh toán</h2>
          <p className="text-[#64748B] text-sm mt-1">Quản lý cổng thanh toán và API keys.</p>
        </div>
        
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#15803D]/90 text-white rounded-2xl font-bold transition-all shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]">
          <Save size={18} />
          <span>Lưu thay đổi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Thẻ Tín Dụng Quốc Tế */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#334155] flex items-center gap-2">
              <CreditCard className="text-[#15803D]" />
              Thẻ Tín Dụng (Stripe)
            </h3>
            <button 
              onClick={() => setStripeEnabled(!stripeEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${stripeEnabled ? 'bg-[#15803D]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${stripeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-[#334155]">Publishable Key</label>
              <input type="text" placeholder="pk_test_..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#15803D]" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-[#334155]">Secret Key</label>
              <input type="password" placeholder="sk_test_..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#15803D]" />
            </div>
          </div>
        </div>

        {/* PayPal */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#334155] flex items-center gap-2">
              <Wallet className="text-blue-600" />
              Ví PayPal
            </h3>
            <button 
              onClick={() => setPaypalEnabled(!paypalEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${paypalEnabled ? 'bg-[#15803D]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${paypalEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-[#334155]">Client ID</label>
              <input type="text" placeholder="Nhập Client ID..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#15803D]" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-[#334155]">Secret Key</label>
              <input type="password" placeholder="Nhập Secret Key..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#15803D]" />
            </div>
          </div>
        </div>

        {/* Ví MoMo */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#334155] flex items-center gap-2">
              <Wallet className="text-[#A50064]" />
              Ví MoMo
            </h3>
            <button 
              onClick={() => setMomoEnabled(!momoEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${momoEnabled ? 'bg-[#15803D]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${momoEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-[#334155]">Partner Code</label>
              <input type="text" placeholder="MOMO..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#15803D]" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-[#334155]">Access Key</label>
              <input type="password" placeholder="..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#15803D]" />
            </div>
          </div>
        </div>

        {/* VNPAY */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.04)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-[#334155] flex items-center gap-2">
              <CreditCard className="text-blue-500" />
              VNPAY
            </h3>
            <button 
              onClick={() => setVnpayEnabled(!vnpayEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${vnpayEnabled ? 'bg-[#15803D]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${vnpayEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-[#334155]">TmnCode</label>
              <input type="text" placeholder="..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#15803D]" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-[#334155]">Hash Secret</label>
              <input type="password" placeholder="..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#15803D]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
