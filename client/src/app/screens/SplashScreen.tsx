import {
  Apple,
  ArrowRight,
  Beef,
  CupSoda,
  Fish,
  Milk,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Wheat,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GoldIcon } from "../shared";
import { ClayCartLogo } from "../components/ui/ClayCartLogo";

type SplashScreenProps = {
  start: () => void;
};

type DecorativeMonogram = {
  Icon: LucideIcon;
  label: string;
  className: string;
  iconSize: number;
  rotate?: string;
  delay: number;
  duration: number;
};

const DECORATIVE_MONOGRAMS: DecorativeMonogram[] = [
  {
    Icon: Apple,
    label: "Rau củ và trái cây",
    className: "left-[5%] top-[12%] h-24 w-24",
    iconSize: 42,
    rotate: "-rotate-12",
    delay: 0,
    duration: 6.8,
  },
  {
    Icon: Fish,
    label: "Thịt cá tươi sống",
    className: "left-[25%] top-[5%] h-20 w-20",
    iconSize: 36,
    rotate: "rotate-12",
    delay: 1.1,
    duration: 7.4,
  },
  {
    Icon: CupSoda,
    label: "Đồ uống",
    className: "right-[8%] top-[10%] h-24 w-24",
    iconSize: 40,
    rotate: "rotate-6",
    delay: 2.2,
    duration: 6.4,
  },
  {
    Icon: Wheat,
    label: "Đồ khô và ngũ cốc",
    className: "right-[26%] top-[4%] h-16 w-16",
    iconSize: 30,
    rotate: "-rotate-6",
    delay: 3.1,
    duration: 7.1,
  },
  {
    Icon: Beef,
    label: "Thịt tươi",
    className: "left-[8%] bottom-[12%] h-24 w-24",
    iconSize: 40,
    rotate: "rotate-6",
    delay: 0.7,
    duration: 7.8,
  },
  {
    Icon: Milk,
    label: "Sữa và sản phẩm lạnh",
    className: "left-[31%] bottom-[5%] h-16 w-16",
    iconSize: 30,
    rotate: "-rotate-12",
    delay: 1.8,
    duration: 6.6,
  },
  {
    Icon: Package,
    label: "Đồ gia dụng",
    className: "right-[28%] bottom-[6%] h-20 w-20",
    iconSize: 34,
    rotate: "rotate-12",
    delay: 2.8,
    duration: 7.2,
  },
  {
    Icon: ShoppingBag,
    label: "Mua sắm thông minh",
    className: "right-[6%] bottom-[14%] h-24 w-24",
    iconSize: 40,
    rotate: "-rotate-6",
    delay: 3.6,
    duration: 6.9,
  },
];

function DecorativeBackground() {
  return (
    <>
      <style>{`
        @keyframes monogramFadePulse {
          0%, 100% {
            opacity: 0;
            transform: translateY(12px) scale(.92);
          }
          18% {
            opacity: .12;
            transform: translateY(0) scale(1);
          }
          48% {
            opacity: .34;
            transform: translateY(-4px) scale(1.035);
          }
          76% {
            opacity: .10;
            transform: translateY(-8px) scale(.98);
          }
        }
      `}</style>
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#15803D]/15 blur-3xl" />
      <div className="absolute -bottom-24 right-12 h-80 w-80 rounded-full bg-[#15803D]/15 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#15803D]/10" />
      <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />

      {DECORATIVE_MONOGRAMS.map(({ Icon, label, className, iconSize, rotate, delay, duration }) => (
        <div
          key={label}
          className={`absolute flex items-center justify-center text-[#15803D] drop-shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] ${className} ${rotate ?? ""}`}
          style={{
            animation: `monogramFadePulse ${duration}s ease-in-out ${delay}s infinite`,
            opacity: 0,
          }}
        >
          <Icon size={iconSize} strokeWidth={1.2} />
        </div>
      ))}

      <Sparkles className="absolute left-[14%] top-[42%] text-[#15803D]/10" size={30} />
      <Sparkles className="absolute right-[15%] top-[44%] text-[#15803D]/10" size={26} />
      <Sparkles className="absolute bottom-[27%] left-[47%] text-[#334155]/[0.045]" size={22} />
    </div>
    </>
  );
}

export function SplashScreen({ start }: SplashScreenProps) {
  return (
    <section className="relative flex h-full items-center justify-center overflow-hidden bg-[#F5F5E6] text-[#334155]">
      <DecorativeBackground />

      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center gap-16 px-12">
        <div className="relative shrink-0 flex items-center justify-center p-8">
          <ClayCartLogo className="h-[280px] w-[280px] animate-[bounce_4s_ease-in-out_infinite]" />
        </div>

        <div className="max-w-xl">
          <div className="mb-5 flex items-center gap-3 text-[#15803D]">
            <GoldIcon className="h-12 w-12">
              <Sparkles size={23} />
            </GoldIcon>
            <span className="text-sm font-black uppercase tracking-[.2em]">
              Smart Shopping Experience
            </span>
          </div>

          <h1 className="text-[5rem] font-black leading-[.98] tracking-wide text-[#334155] drop-shadow-sm">
            Smart Cart <span className="text-[#15803D]">AI</span>
          </h1>

          <p className="mt-6 text-xl leading-relaxed text-[#475569]">
            Trợ lý mua sắm thông minh giúp tìm đúng sản phẩm, đồng bộ giỏ hàng
            và thanh toán thuận tiện trong siêu thị.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-extrabold text-[#475569]">
            {["Rau củ", "Thịt & Cá", "Đồ uống", "Đồ gia dụng"].map((category) => (
              <span
                key={category}
                className="rounded-full border border-[#E2E8F0] bg-white/[0.045] px-3 py-1.5"
              >
                {category}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={start}
            className="mt-9 flex items-center gap-3 rounded-2xl border border-[#15803D] bg-[#15803D] px-8 py-4 text-lg font-black text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] transition hover:-translate-y-0.5 hover:bg-white shadow-sm border border-[#E2E8F0] active:scale-95"
          >
            <ShoppingBag size={22} />
            Bắt đầu mua sắm
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}