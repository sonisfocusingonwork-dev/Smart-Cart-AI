import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Save, AlertCircle } from 'lucide-react';

export const SystemSettingsTab = () => {
  const [taxRate, setTaxRate] = useState<number>(0);
  const [stripeKey, setStripeKey] = useState<string>('');
  const [paypalKey, setPaypalKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setTaxRate(data.taxRate || 0);
      setStripeKey(data.paymentGatewayKeys?.stripe || '');
      setPaypalKey(data.paymentGatewayKeys?.paypal || '');
    } catch (err) {
      setError('Lỗi khi tải cài đặt hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await api.updateSettings({
        taxRate,
        paymentGatewayKeys: {
          stripe: stripeKey,
          paypal: paypalKey
        }
      });
      setSuccess('Đã lưu cấu hình thành công!');
    } catch (err) {
      setError('Lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-400">Đang tải cấu hình...</div>;
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-bold text-white mb-6">Cài Đặt Hệ Thống</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Thuế VAT (%)</label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            min="0"
            max="100"
          />
          <p className="text-xs text-slate-500 mt-2">Mức thuế VAT mặc định áp dụng cho tất cả đơn hàng (ví dụ: 8, 10).</p>
        </div>

        <div className="pt-4 border-t border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">Cổng Thanh Toán</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Stripe API Key</label>
              <input
                type="text"
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
                placeholder="sk_test_..."
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">PayPal Client ID</label>
              <input
                type="text"
                value={paypalKey}
                onChange={(e) => setPaypalKey(e.target.value)}
                placeholder="Client ID"
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-500/20 hover:from-orange-400 hover:to-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : (
              <>
                <Save size={18} />
                Lưu Cài Đặt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
