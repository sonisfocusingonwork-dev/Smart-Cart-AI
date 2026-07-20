import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, Crown, Shield, Star, Award } from 'lucide-react';

interface Customer {
  _id: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  points: number;
  membershipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  purchaseHistory: any[];
}

export const CustomerCrmTab = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum': return <Crown size={16} className="text-purple-400" />;
      case 'Gold': return <Award size={16} className="text-yellow-400" />;
      case 'Silver': return <Shield size={16} className="text-slate-300" />;
      default: return <Star size={16} className="text-[#15803D]" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Gold': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Silver': return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
      default: return 'bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20';
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(search.toLowerCase()) || 
    (c.phoneNumber && c.phoneNumber.includes(search))
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-white">Quản Lý Khách Hàng (CRM)</h2>
        
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1E293B] border border-[#E2E8F0] rounded-2xl pl-10 pr-4 py-2.5 text-white focus:border-[#15803D] focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all text-sm"
          />
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        </div>
      </div>

      <div className="flex-1 bg-[#1E293B] border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-[#E2E8F0] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Khách hàng</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Liên hệ</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap text-center">Hạng thành viên</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap text-right">Tổng đơn hàng</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap text-right">Điểm tích lũy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Không tìm thấy khách hàng nào.</td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {customer.fullName}
                    </td>
                    <td className="px-6 py-4">
                      {customer.phoneNumber || customer.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className={`px-3 py-1 rounded-full border flex items-center gap-1.5 text-xs font-bold ${getTierColor(customer.membershipTier)}`}>
                          {getTierIcon(customer.membershipTier)}
                          {customer.membershipTier}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-white">
                      {customer.purchaseHistory?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#15803D]">
                      {customer.points.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
