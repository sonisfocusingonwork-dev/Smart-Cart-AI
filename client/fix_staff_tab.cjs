const fs = require('fs');
let code = fs.readFileSync('src/app/screens/StaffManagementTab.tsx', 'utf8');

// Colors replacement
code = code.replace(/text-white/g, 'text-[#334155]');
code = code.replace(/text-slate-400/g, 'text-[#94A3B8]');
code = code.replace(/text-slate-300/g, 'text-[#64748B]');
code = code.replace(/bg-\[#1E293B\]/g, 'bg-[#FFFFFF]');
code = code.replace(/border-slate-700\/50/g, 'border-[#E2E8F0]');
code = code.replace(/border-slate-700/g, 'border-[#E2E8F0]');
code = code.replace(/bg-slate-800\/50/g, 'bg-[#F1F5F9]');
code = code.replace(/hover:bg-slate-700\/20/g, 'hover:bg-[#F8FAFC]');
code = code.replace(/bg-blue-600/g, 'bg-[#15803D]');
code = code.replace(/hover:bg-blue-500/g, 'hover:bg-[#15803D]\/90');
code = code.replace(/shadow-blue-500\/20/g, 'shadow-[#15803D]\/20');
code = code.replace(/text-blue-400/g, 'text-[#15803D]');
code = code.replace(/hover:bg-blue-400\/10/g, 'hover:bg-[#15803D]\/10');
code = code.replace(/bg-slate-950\/80/g, 'bg-[#334155]\/80');
code = code.replace(/bg-slate-700/g, 'bg-[#E2E8F0]');
code = code.replace(/hover:bg-slate-600/g, 'hover:bg-[#CBD5E1]');
code = code.replace(/focus:border-blue-500/g, 'focus:border-[#15803D]');
code = code.replace(/text-slate-500/g, 'text-[#94A3B8]');

// Role badges
code = code.replace(/bg-\[#15803D\]\/20 text-\[#15803D\] border border-\[#15803D\]\/30/g, 'bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20 font-bold');
code = code.replace(/bg-purple-500\/20 text-purple-400 border border-purple-500\/30/g, 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 font-bold');
code = code.replace(/bg-blue-500\/20 text-blue-400 border border-blue-500\/30/g, 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 font-bold');
code = code.replace(/bg-amber-500\/20 text-amber-400 border border-amber-500\/30/g, 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 font-bold');
code = code.replace(/bg-slate-500\/20 text-slate-400 border border-slate-500\/30/g, 'bg-[#94A3B8]/10 text-[#64748B] border border-[#94A3B8]/20 font-bold');

// Add Avatar to staff name
code = code.replace(/<td className="p-4 text-\[#334155\] font-medium">{staff.name}<\/td>/g, 
  `<td className="p-4 font-medium text-[#334155]">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#15803D] flex items-center justify-center font-bold text-sm shrink-0 uppercase">
        {staff.name.charAt(0)}
      </div>
      {staff.name}
    </div>
  </td>`);

// Fix modal Cancel button text color (since background is now E2E8F0, text should be 334155)
code = code.replace(/flex-1 px-4 py-3 bg-\[#E2E8F0\] hover:bg-\[#CBD5E1\] text-\[#334155\] rounded-2xl/g, 'flex-1 px-4 py-3 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#334155] rounded-2xl');

fs.writeFileSync('src/app/screens/StaffManagementTab.tsx', code);
console.log('Fixed StaffManagementTab.tsx');
