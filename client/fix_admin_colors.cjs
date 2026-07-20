const fs = require('fs');
let code = fs.readFileSync('src/app/screens/AdminDashboardScreen.tsx', 'utf8');

// 1. Sidebar background: Make it transparent so it inherits the #F5F5E6 root background
code = code.replace(/shrink-0 bg-white border-r border-\[#E2E8F0\] flex flex-col justify-between/g, 'shrink-0 bg-transparent border-r border-[#E2E8F0] flex flex-col justify-between');

// 2. Header background: Make it transparent so it inherits the #F5F5E6 root background
code = code.replace(/<header className="h-16 shrink-0 border-b border-\[#E2E8F0\] bg-white px-8 flex items-center justify-between z-10">/g, '<header className="h-16 shrink-0 border-b border-[#E2E8F0] bg-transparent px-8 flex items-center justify-between z-10">');

// 3. The 4 Product Stats cards: Currently they are bg-[#F5F5E6] which blends into the root background, they should be bg-white to pop out
code = code.replace(/bg-\[#F5F5E6\] p-5 shadow-\[4px_4px_0px_0px_rgba\(51,65,85,0\.08\)\]/g, 'bg-white p-5 shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]');

fs.writeFileSync('src/app/screens/AdminDashboardScreen.tsx', code);
console.log('Fixed admin dashboard colors');
