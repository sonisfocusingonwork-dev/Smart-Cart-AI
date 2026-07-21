import React from 'react';
import { AlertTriangle, Users } from 'lucide-react';
import { AnimatedModal } from './AnimatedModal';

type MemberJoinWarningModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoggedIn?: boolean;
};

export const MemberJoinWarningModal: React.FC<MemberJoinWarningModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoggedIn = false,
}) => {
  return (
    <AnimatedModal isOpen={isOpen} onClose={onCancel}>
      <div className="w-[450px] p-6 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#FEF2F2] text-[#EF4444] shadow-sm">
          <AlertTriangle size={40} />
        </div>
        <h2 className="mb-2 text-2xl font-black text-[#1E293B]">
          Xác nhận tham gia nhóm
        </h2>
        
        <div className="mb-6 text-sm font-semibold leading-relaxed text-[#64748B] text-left rounded-2xl bg-[#F8FAFC] p-4 border border-[#E2E8F0]">
          <p className="mb-3">
            <strong className="text-[#1E293B]">Lưu ý quan trọng:</strong> Khi tham gia mua sắm nhóm, <strong className="text-[#15803D]">toàn bộ điểm tích lũy và voucher</strong> từ các sản phẩm của bạn sẽ được chuyển thẳng về tài khoản của <strong className="text-[#1E293B]">Chủ nhóm</strong>.
          </p>
          {isLoggedIn && (
            <div className="rounded-xl bg-[#FEF2F2] p-3 text-[#B91C1C] border border-[#FCA5A5]/50">
              <span className="flex items-center gap-2 font-black mb-1"><Users size={16}/> Tài khoản cá nhân</span>
              Bạn đang đăng nhập. Tuy nhiên, điểm và voucher cá nhân của bạn sẽ bị vô hiệu hóa trong phiên đi chợ chung này.
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl bg-[#F1F5F9] font-bold text-[#475569] hover:bg-[#E2E8F0] transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-2xl bg-[#15803D] font-black text-white hover:bg-[#15803D]/90 shadow-md transition-colors"
          >
            Đồng ý tham gia
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
};
