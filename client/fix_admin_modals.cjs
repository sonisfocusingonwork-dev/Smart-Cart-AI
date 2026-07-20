const fs = require('fs');
let code = fs.readFileSync('src/app/screens/AdminDashboardScreen.tsx', 'utf8');

// 1. Fix modal backdrops
code = code.replace(/className="fixed inset-0 z-\[100\] flex justify-end bg-\[#F5F5E6\] shadow-sm "/g, 'className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm"');
code = code.replace(/className="fixed inset-0 z-\[150\] flex items-center justify-center bg-\[#F5F5E6\] shadow-sm p-6 "/g, 'className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"');

// 2. Fix Table headers (change to light gray instead of cream)
code = code.replace(/<tr className="bg-\[#F5F5E6\] /g, '<tr className="bg-[#F8FAFC] ');

// 3. Fix Map container (change to white)
code = code.replace(/className="relative w-full border border-\[#E2E8F0\] rounded-2xl bg-\[#F5F5E6\]/g, 'className="relative w-full border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]');

// 4. Replace ALL remaining bg-[#F5F5E6] with bg-white to guarantee "màu trắng với xanh"
code = code.replace(/bg-\[#F5F5E6\]/g, 'bg-white');

fs.writeFileSync('src/app/screens/AdminDashboardScreen.tsx', code);
console.log('Fixed modals and weird colors');
