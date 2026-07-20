import React from "react";
import { CheckCircle2, FileText, ArrowRight, Mail, Printer, RotateCcw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatMoney, GoldIcon } from "../shared";
import type { CompletedReceipt, Screen } from "../shared";

interface DigitalInvoiceScreenProps {
  receipt: CompletedReceipt;
  go: (screen: Screen) => void;
  cartId: string;
}

export function DigitalInvoiceScreen({ receipt, go, cartId }: DigitalInvoiceScreenProps) {
  // Payload for the Gateway Checker to scan
  const qrPayload = JSON.stringify({
    invoiceId: receipt.orderId,
    cartId: cartId,
  });

  return (
    <div className="flex flex-col h-full bg-[#F5F5E6] overflow-y-auto [scrollbar-width:none]">
      <div className="max-w-2xl mx-auto w-full p-6 pt-12 space-y-8 flex-1 flex flex-col">
        
        {/* Success Banner */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 bg-green-100 text-[#15803D] rounded-full flex items-center justify-center mb-2 shadow-[0_0_40px_rgba(21,128,61,0.2)]">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-[#15803D]">Thanh Toán Thành Công</h1>
          <p className="text-[#64748B] font-medium">Cảm ơn bạn đã mua sắm tại Smart Market!</p>
        </div>

        {/* Paper Receipt UI */}
        <div className="bg-[#FEF9ED] rounded-3xl border-2 border-dashed border-[#E2E8F0] p-8 shadow-[8px_8px_0px_0px_rgba(21,128,61,0.05)] relative overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-[#E2E8F0] pb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#15803D]">
                Hóa đơn điện tử
              </p>
              <h2 className="mt-1 text-2xl font-black text-[#334155]">
                SMART CART RECEIPT
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#64748B]">
                {receipt.store}
              </p>
            </div>
            <GoldIcon className="h-14 w-14 opacity-80">
              <FileText size={25} />
            </GoldIcon>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 py-6 text-sm border-b border-[#E2E8F0]">
            <div>
              <span className="block text-xs font-bold text-[#64748B]">Mã hóa đơn</span>
              <b className="text-[#334155]">{receipt.orderId}</b>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#64748B]">Thời gian</span>
              <b className="text-[#334155]">{new Date(receipt.paidAt).toLocaleString("vi-VN")}</b>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#64748B]">Phương thức</span>
              <b className="text-[#334155]">{receipt.paymentMethod}</b>
            </div>
            <div>
              <span className="block text-xs font-bold text-[#64748B]">Điểm thưởng</span>
              <b className="text-[#15803D]">+{receipt.pointsEarned} Smart Points</b>
            </div>
          </div>

          {/* Items */}
          <div className="py-6 border-b border-[#E2E8F0] space-y-4">
            <div className="flex justify-between text-xs font-black uppercase tracking-wider text-[#94A3B8]">
              <span>Sản phẩm</span>
              <span className="text-right">Thành tiền</span>
            </div>
            {receipt.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm font-bold text-[#334155]">
                <span>{item.qty}x {item.name}</span>
                <span>{formatMoney(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-6 space-y-3 text-sm text-[#475569] font-medium border-b-2 border-dashed border-[#E2E8F0]">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <b>{formatMoney(receipt.subtotal)}</b>
            </div>
            <div className="flex justify-between">
              <span>Thuế</span>
              <b>{formatMoney(receipt.tax)}</b>
            </div>
            <div className="flex justify-between text-[#15803D]">
              <span>Giảm giá {receipt.appliedVoucherCode ? `(${receipt.appliedVoucherCode})` : ""}</span>
              <b>-{formatMoney(receipt.discount)}</b>
            </div>
            <div className="flex justify-between items-end pt-4">
              <span className="text-lg font-black text-[#334155]">Tổng thanh toán</span>
              <b className="text-3xl text-[#15803D]">{formatMoney(receipt.total)}</b>
            </div>
          </div>

          {/* Action Buttons (Email, Print, Return) */}
          <div className="py-6 border-b-2 border-dashed border-[#E2E8F0] grid grid-cols-3 gap-3">
            <button 
              onClick={() => alert("Đã gửi hóa đơn qua Email!")}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:border-[#15803D] hover:text-[#15803D] transition-colors text-[#64748B] active:scale-95"
            >
              <Mail size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-center">Gửi Email</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:border-[#15803D] hover:text-[#15803D] transition-colors text-[#64748B] active:scale-95"
            >
              <Printer size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-center">In biên lai</span>
            </button>
            <button 
              onClick={() => alert("Chức năng hỗ trợ hoàn trả đang được bảo trì.")}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm hover:border-[#15803D] hover:text-[#15803D] transition-colors text-[#64748B] active:scale-95"
            >
              <RotateCcw size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-center">Hoàn trả</span>
            </button>
          </div>

          {/* Gateway QR Code Injection */}
          <div className="mt-8 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
            <QRCodeSVG 
              value={qrPayload} 
              size={180} 
              level="H"
              includeMargin={true}
              fgColor="#15803D"
            />
            <p className="mt-4 text-sm font-black text-[#334155] text-center max-w-[250px]">
              Đưa mã này cho nhân viên kiểm soát tại cổng
            </p>
            <p className="mt-1 text-xs font-semibold text-[#94A3B8]">
              (Show this code to the Gateway Checker)
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pb-12 pt-4">
          <button 
            onClick={() => go("home")}
            className="w-full flex items-center justify-center gap-2 bg-[#334155] text-white py-5 rounded-2xl font-black text-xl hover:bg-[#1E293B] transition-all shadow-[0_8px_30px_rgba(51,65,85,0.2)] active:scale-[0.98]"
          >
            Về trang chủ <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
