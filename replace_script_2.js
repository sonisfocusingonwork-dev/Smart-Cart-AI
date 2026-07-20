const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'client/src/app/screens');
const componentsDir = path.join(__dirname, 'client/src/app/components');
const rootFile = path.join(__dirname, 'client/src/app/App.tsx');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Header & Nav Bars: bg-[#F5F5E6] inside <header> to bg-[#FFFFFF]
    const headerRegex = /(<header[^>]+className="[^"]*)bg-\[#F5F5E6\]([^"]*")/g;
    content = content.replace(headerRegex, '$1bg-[#FFFFFF]$2');
    
    // 2. Shared Group Badges in GroupSessionScreen
    if (filePath.endsWith('GroupSessionScreen.tsx')) {
        content = content.replace(/bg-emerald-50/g, 'bg-[#D1FAE5]');
        content = content.replace(/text-emerald-700/g, 'text-[#065F46]');
        content = content.replace(/border-emerald-300/g, 'border-[#D1FAE5]');
        content = content.replace(/text-emerald-600/g, 'text-[#065F46]');
        
        // 3. Shopping List Popup (was FEF9ED)
        content = content.replace(/bg-\[#FEF9ED\]/g, 'bg-[#FBCFE8]');
    }

    // 5. Login inputs warm paper cream overlay focus:border-[#D3524B]
    if (filePath.endsWith('LoginScreen.tsx') || filePath.endsWith('AdminLoginScreen.tsx')) {
        content = content.replace(/focus:border-\[#F97316\]/gi, 'focus:border-[#D3524B]');
        content = content.replace(/focus:ring-\[#F97316\]/gi, 'focus:border-[#D3524B] focus:ring-[#D3524B]');
        content = content.replace(/focus:border-orange-500/gi, 'focus:border-[#D3524B]');
        content = content.replace(/focus:ring-orange-500/gi, 'focus:ring-[#D3524B]');
    }

    // 6. Admin Dashboard Screen
    if (filePath.endsWith('AdminDashboardScreen.tsx')) {
        content = content.replace(/bg-\[#1E293B\]\/70/g, 'bg-[#FFFFFF] text-[#334155]');
        content = content.replace(/text-white/g, 'text-[#334155]');
        content = content.replace(/<main([^>]+)bg-\[#1E293B\]/g, '<main$1bg-[#F5F5E6]');
        content = content.replace(/text-\[#CBD5E1\]/g, 'text-[#475569]');
        content = content.replace(/text-slate-400/g, 'text-slate-500');
        // Ensure success and alert text colors in AdminDashboard
        content = content.replace(/text-\[#10B981\]/g, 'text-[#8CB867]'); // replace emerald-500 equivalent if any
        content = content.replace(/text-\[#EF4444\]/g, 'text-[#D3524B]'); // replace red-500 equivalent if any
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walk(screensDir);
walk(componentsDir);
if (fs.existsSync(rootFile)) processFile(rootFile);

console.log('Second pass replacements done.');
