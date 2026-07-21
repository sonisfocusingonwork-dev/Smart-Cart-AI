import React from 'react';
import { LogIn, UserX } from 'lucide-react';
import { AnimatedModal } from './AnimatedModal';

type GroupAuthGateModalProps = {
  isOpen: boolean;
  onLogin: () => void;
  onGuest: () => void;
  onClose: () => void;
};

export const GroupAuthGateModal: React.FC<GroupAuthGateModalProps> = ({
  isOpen,
  onLogin,
  onGuest,
  onClose,
}) => {
  return (
    <AnimatedModal isOpen={isOpen} onClose={onClose}>
      <div className="w-[450px] p-6 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#E2E8F0] text-[#334155] shadow-sm">
          <LogIn size={40} />
        </div>
        <h2 className="mb-2 text-2xl font-black text-[#1E293B]">
          Đăng nhập để tích điểm
        </h2>
        <p className="mb-6 text-sm font-semibold leading-relaxed text-[#64748B]">
          Bạn cần đăng nhập để làm Chủ nhóm và nhận toàn bộ điểm & voucher từ phiên đi chợ chung này.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#15803D] px-4 font-black text-white hover:bg-[#15803D]/90 shadow-md transition-colors"
          >
            <LogIn size={20} />
            Đăng nhập ngay
          </button>
          
          <button
            onClick={onGuest}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] px-4 font-bold text-[#475569] hover:bg-[#F1F5F9] transition-colors"
          >
            <UserX size={18} />
            Tiếp tục dưới dạng Guest (Không tích điểm)
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};
