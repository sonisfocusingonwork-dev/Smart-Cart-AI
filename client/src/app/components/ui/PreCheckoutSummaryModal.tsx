import React from 'react';
import { ShoppingCart, Users, CheckCircle2, Coins, Receipt } from 'lucide-react';
import { AnimatedModal } from './AnimatedModal';

type PreCheckoutSummaryModalProps = {
  isOpen: boolean;
  ownerName: string;
  memberCount: number;
  totalAmount: number;
  pointsUsed: number;
  onConfirm: () => void;
  onCancel: () => void;
};

export const PreCheckoutSummaryModal: React.FC<PreCheckoutSummaryModalProps> = ({
  isOpen,
  ownerName,
  memberCount,
  totalAmount,
  pointsUsed,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatedModal isOpen={isOpen} onClose={onCancel}>
      <div className="w-[450px] p-6">
        <h2 className="text-2xl font-black text-[#1E293B] text-center mb-6">
          Xác nhận thanh toán nhóm
        </h2>
        
        <div className="bg-[#F8FAFC] rounded-2xl p-5 mb-6 border border-[#E2E8F0] space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#64748B]">
              <Users size={18} /> Chủ nhóm
            </span>
            <span className="text-sm font-black text-[#15803D]">{ownerName}</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#64748B]">
              <ShoppingCart size={18} /> Số lượng thành viên
            </span>
            <span className="text-sm font-bold text-[#334155]">{memberCount} xe</span>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#64748B]">
              <Coins size={18} /> Điểm sử dụng
            </span>
            <span className="text-sm font-bold text-[#F59E0B]">-{pointsUsed.toLocaleString('vi-VN')} điểm</span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="flex items-center gap-2 text-base font-bold text-[#334155]">
              <Receipt size={20} /> Tổng thanh toán
            </span>
            <span className="text-xl font-black text-[#EF4444]">{totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div className="bg-[#ECFDF5] rounded-xl p-3 mb-6 border border-[#10B981]/30">
          <p className="text-xs font-semibold text-[#065F46] flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5"/>
            Toàn bộ điểm thưởng từ hóa đơn này sẽ được cộng vào tài khoản của Chủ nhóm ({ownerName}).
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl bg-[#F1F5F9] font-bold text-[#475569] hover:bg-[#E2E8F0] transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-2xl bg-[#15803D] font-black text-white hover:bg-[#15803D]/90 shadow-md transition-colors"
          >
            Xác nhận thanh toán
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};
