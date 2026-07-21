import React from 'react';
import { AlertOctagon, User, SplitSquareHorizontal, XCircle } from 'lucide-react';
import { AnimatedModal } from './AnimatedModal';

type ConflictResolutionModalProps = {
  isOpen: boolean;
  onKeepOwner: () => void;
  onTransfer: () => void;
  onNoPoints: () => void;
  onSplitBill: () => void;
};

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onKeepOwner,
  onTransfer,
  onNoPoints,
  onSplitBill,
}) => {
  return (
    <AnimatedModal isOpen={isOpen} onClose={() => {}}>
      <div className="w-[500px] p-6 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#FEF2F2] text-[#EF4444] shadow-sm">
          <AlertOctagon size={40} />
        </div>
        <h2 className="mb-2 text-2xl font-black text-[#1E293B]">
          Phát hiện Xung đột Tài khoản
        </h2>
        
        <p className="mb-6 text-sm font-semibold leading-relaxed text-[#64748B]">
          Có nhiều hơn 1 tài khoản đăng nhập trong nhóm của bạn. Hệ thống thanh toán chỉ hỗ trợ <strong className="text-[#1E293B]">một tài khoản tích điểm duy nhất</strong>. Vui lòng chọn hướng giải quyết:
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onKeepOwner}
            className="flex h-12 w-full items-center justify-between px-4 rounded-2xl border border-[#15803D] bg-[#F0FDF4] text-[#15803D] font-bold hover:bg-[#DCFCE7] transition-colors"
          >
            <span className="flex items-center gap-2"><User size={18}/> Giữ Chủ nhóm hiện tại</span>
            <span className="text-xs font-semibold">Điểm thuộc về Chủ nhóm</span>
          </button>
          
          <button
            onClick={onTransfer}
            className="flex h-12 w-full items-center justify-between px-4 rounded-2xl border border-[#3B82F6] bg-[#EFF6FF] text-[#2563EB] font-bold hover:bg-[#DBEAFE] transition-colors"
          >
            <span className="flex items-center gap-2"><User size={18}/> Chuyển quyền Chủ nhóm</span>
            <span className="text-xs font-semibold">Cấp quyền cho xe khác</span>
          </button>

          <button
            onClick={onSplitBill}
            className="flex h-12 w-full items-center justify-between px-4 rounded-2xl border border-[#8B5CF6] bg-[#F5F3FF] text-[#7C3AED] font-bold hover:bg-[#EDE9FE] transition-colors"
          >
            <span className="flex items-center gap-2"><SplitSquareHorizontal size={18}/> Tách hóa đơn</span>
            <span className="text-xs font-semibold">Mỗi người tự thanh toán</span>
          </button>

          <button
            onClick={onNoPoints}
            className="flex h-12 w-full items-center justify-between px-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] font-bold hover:bg-[#F1F5F9] transition-colors"
          >
            <span className="flex items-center gap-2"><XCircle size={18}/> Bỏ qua tích điểm</span>
            <span className="text-xs font-semibold">Thanh toán với tư cách Khách</span>
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};
