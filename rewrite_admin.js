const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'client/src/app/screens/AdminDashboardScreen.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Core Backgrounds
// Main canvas wrapper might be bg-slate-900 or bg-slate-950 or bg-[#F5F5E6] (we partly replaced it earlier)
content = content.replace(/\bbg-slate-900\b/g, 'bg-[#F5F5E6]');
content = content.replace(/\bbg-slate-950\b/g, 'bg-[#F5F5E6]');
// Sub containers
content = content.replace(/\bbg-slate-800(\/\d+)?\b/g, 'bg-[#FFFFFF]');
content = content.replace(/\bbg-slate-700(\/\d+)?\b/g, 'bg-[#F1F5F9]');
content = content.replace(/\bbg-slate-900\/[0-9]+\b/g, 'bg-[#FFFFFF]/90 backdrop-blur-md');
content = content.replace(/\bbg-black\/\d+\b/g, 'bg-[#F5F5E6]/95 backdrop-blur-md');

// 2. Text Colors
content = content.replace(/\btext-white\b/g, 'text-[#334155]');
content = content.replace(/\btext-slate-100\b/g, 'text-[#334155]');
content = content.replace(/\btext-slate-300\b/g, 'text-[#475569]');
content = content.replace(/\btext-slate-400\b/g, 'text-[#64748B]');
content = content.replace(/\btext-slate-500\b/g, 'text-[#94A3B8]');

// Restore white text if it's explicitly on a solid dark/green background (e.g. #15803D)
// We'll rely on the previous pass or manually fix it if we break a button.
content = content.replace(/(bg-\[#15803D\][^"]*)text-\[#334155\]/g, '$1text-white');

// 3. Borders
content = content.replace(/\bborder-slate-800\b/g, 'border-[#E2E8F0]');
content = content.replace(/\bborder-slate-700\b/g, 'border-[#E2E8F0]');
content = content.replace(/\bborder-slate-600\b/g, 'border-[#E2E8F0]');

// 4. Alerts & Sensor States
// Red alerts (Warning/Errors)
content = content.replace(/\bbg-red-[0-9]+\/10\b/g, 'bg-[#FEE2E2]');
content = content.replace(/\bbg-red-[0-9]+\/20\b/g, 'bg-[#FEE2E2]');
content = content.replace(/\bbg-red-[0-9]+\b/g, 'bg-[#FEE2E2]');
content = content.replace(/\btext-red-[0-9]+\b/g, 'text-[#EF4444]');

// Green alerts (Success/Connected)
content = content.replace(/\bbg-green-[0-9]+\/10\b/g, 'bg-[#D1FAE5]');
content = content.replace(/\bbg-green-[0-9]+\/20\b/g, 'bg-[#D1FAE5]');
content = content.replace(/\bbg-green-[0-9]+\b/g, 'bg-[#D1FAE5]');
content = content.replace(/\btext-green-[0-9]+\b/g, 'text-[#15803D]');

// Amber/Yellow alerts (Syncing/Pending)
content = content.replace(/\bbg-amber-[0-9]+\/10\b/g, 'bg-[#FEF3C7]');
content = content.replace(/\bbg-amber-[0-9]+\/20\b/g, 'bg-[#FEF3C7]');
content = content.replace(/\bbg-yellow-[0-9]+\/10\b/g, 'bg-[#FEF3C7]');
content = content.replace(/\btext-amber-[0-9]+\b/g, 'text-[#D97706]');
content = content.replace(/\btext-yellow-[0-9]+\b/g, 'text-[#D97706]');

// Blue alerts (Info)
content = content.replace(/\bbg-blue-[0-9]+\/10\b/g, 'bg-[#E0F2FE]');
content = content.replace(/\bbg-sky-[0-9]+\/10\b/g, 'bg-[#E0F2FE]');
content = content.replace(/\btext-blue-[0-9]+\b/g, 'text-[#0284C7]');
content = content.replace(/\btext-sky-[0-9]+\b/g, 'text-[#0284C7]');

// Orange (legacy) -> organic green just in case
content = content.replace(/\bbg-orange-[0-9]+\/10\b/g, 'bg-[#D1FAE5]');
content = content.replace(/\bbg-orange-[0-9]+\/20\b/g, 'bg-[#D1FAE5]');
content = content.replace(/\bbg-orange-[0-9]+\b/g, 'bg-[#D1FAE5]');
content = content.replace(/\btext-orange-[0-9]+\b/g, 'text-[#15803D]');

// 5. Shadows
// Strip out all neon shadows
content = content.replace(/\bshadow-[a-z]+-[0-9]+\/\d+\b/g, 'shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]');
// If there are standard shadows (shadow-md, shadow-lg), make sure they aren't overridden, but it's fine. We'll replace them with flat shadow if they have custom colors.
content = content.replace(/\bshadow-amber-500\/5\b/g, 'shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]');
content = content.replace(/\bshadow-red-500\/5\b/g, 'shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]');

// Also inject the flat shadow into rounded-xl or rounded-2xl containers if they don't have it
content = content.replace(/(rounded-[23]xl[^"]*bg-\[#FFFFFF\])([^"]*")/g, (match, p1, p2) => {
    if (!match.includes('shadow-')) {
        return p1 + ' shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]' + p2;
    }
    return match;
});

// Enforce rounded-2xl
content = content.replace(/\brounded-lg\b/g, 'rounded-2xl');
content = content.replace(/\brounded-xl\b/g, 'rounded-2xl');

// 6. Logo Branding
// Find "AI" in the title and change its color
content = content.replace(
    /(<span[^>]*className="[^"]*)(text-\[#[A-F0-9]+\])([^"]*">AI<\/span>)/gi,
    (match, p1, p2, p3) => p1 + 'text-[#15803D]' + p3
);

// If the logo container has a bg-slate-800, it was replaced by bg-[#FFFFFF].
// We need to make sure the "Smart Cart" text is charcoal #334155, which is handled by the text-white replacement!

fs.writeFileSync(targetFile, content, 'utf8');
console.log('AdminDashboardScreen successfully rewritten!');
