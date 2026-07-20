const fs = require('fs');
const path = require('path');

const dirsToProcess = [
    path.join(__dirname, 'client/src/app/screens'),
    path.join(__dirname, 'client/src/app/components'),
    path.join(__dirname, 'client/src/app')
];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace legacy reds/oranges with #15803D (except in text-[#D1FAE5] or similar safe strings, but these are exact hexes)
    content = content.replace(/(bg|text|border|fill|stroke)-\[#D3524B\]/gi, '$1-[#15803D]');
    content = content.replace(/(bg|text|border|fill|stroke)-\[#EF4444\]/gi, '$1-[#15803D]');
    content = content.replace(/(bg|text|border|fill|stroke)-\[#DC2626\]/gi, '$1-[#15803D]');
    content = content.replace(/(bg|text|border|fill|stroke)-\[#F97316\]/gi, '$1-[#15803D]');
    content = content.replace(/(bg|text|border|fill|stroke)-\[#EA580C\]/gi, '$1-[#15803D]');
    
    // Replace generic red/orange utility classes
    content = content.replace(/\b(bg|text|border)-red-(400|500|600)\b/g, '$1-[#15803D]');
    content = content.replace(/\b(bg|text|border)-orange-(400|500|600)\b/g, '$1-[#15803D]');
    content = content.replace(/\b(bg|text|border)-emerald-(400|500|600)\b/g, '$1-[#15803D]'); // Some emeralds might have been used, standardize to #15803D
    content = content.replace(/\b(text)-emerald-400\b/g, 'text-[#15803D]');

    // 2. Update generic borders to #E2E8F0
    content = content.replace(/border-\[#CBD5E1\]/gi, 'border-[#E2E8F0]');
    content = content.replace(/\bborder-slate-200\b/g, 'border-[#E2E8F0]');
    content = content.replace(/\bborder-slate-300\b/g, 'border-[#E2E8F0]');

    // 3. Admin Dashboard Dark Tech Blues Purge
    if (filePath.includes('AdminDashboardScreen.tsx') || filePath.includes('AdminLoginScreen.tsx') || filePath.includes('AdminProtectedRoute.tsx')) {
        content = content.replace(/bg-\[#0F172A\]/gi, 'bg-[#F5F5E6]');
        content = content.replace(/bg-\[#1E293B\]/gi, 'bg-white'); // Sub-containers to white
        // Because canvas is now light, text must be dark
        content = content.replace(/text-white/g, 'text-[#334155]');
        content = content.replace(/text-\[#F8FAFC\]/gi, 'text-[#334155]');
        content = content.replace(/text-slate-200/g, 'text-[#475569]');
        content = content.replace(/text-slate-300/g, 'text-[#475569]');
        content = content.replace(/text-slate-400/g, 'text-[#64748B]');
        content = content.replace(/border-\[#334155\]/gi, 'border-[#E2E8F0]');
        // Reverse specific buttons back to white text if they use green background
        content = content.replace(/(bg-\[#15803D\][^"]*)text-\[#334155\]/g, '$1text-white');
    }

    // 4. Guest Access Button Fix (Login Screen)
    if (filePath.includes('LoginScreen.tsx')) {
        // Find the "Mua sắm cá nhân với tư cách khách" button
        content = content.replace(/className="([^"]*)Mua sắm cá nhân với tư cách khách/g, (match, p1) => {
            // Remove glassmorphism/mờ mờ from this specific button
            let newClass = p1.replace(/bg-white\/70/g, 'bg-white/95');
            newClass = newClass.replace(/bg-\[#F5F5E6\]\/70/g, 'bg-white/95');
            newClass = newClass.replace(/text-\[#475569\]/g, 'text-[#334155]');
            newClass = newClass.replace(/text-white/g, 'text-[#334155]');
            if (!newClass.includes('text-[#334155]')) newClass += ' text-[#334155]';
            if (newClass.includes('border-white/50')) newClass = newClass.replace('border-white/50', 'border-transparent');
            return `className="${newClass}Mua sắm cá nhân với tư cách khách`;
        });
    }

    // 5. "Smart Cart AI" Logo "AI" text color
    // Usually it's `Smart Cart <span className="text-[#D3524B]">AI</span>`
    // Since we did a blanket replace for `#D3524B` to `#15803D`, this should automatically be fixed!
    // But let's check for any inline styles or specific generic classes
    content = content.replace(/>AI<\/span>/g, (match, offset, str) => {
        let prev = str.substring(offset - 40, offset);
        if (prev.includes('text-')) {
            // It was matched by regex and updated, or it needs update
        }
        return match;
    });

    // 6. Top Status Bar (shared.tsx and App.tsx)
    if (filePath.includes('shared.tsx')) {
        // Ensure Support Center trigger is distinct
        content = content.replace(/bg-white\/20 backdrop-blur-md border border-white\/40 px-3 text-xs font-black text-white/g, 'bg-[#15803D] border border-[#15803D] px-3 text-xs font-black text-white');
    }
    if (filePath.includes('App.tsx')) {
        // The groupCode floating button has Wifi icon with text-emerald-400
        content = content.replace(/text-emerald-400/g, 'text-[#15803D]');
        content = content.replace(/border-emerald-400/g, 'border-[#A7F3D0]');
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Processed:', filePath);
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else {
            processFile(fullPath);
        }
    });
}

dirsToProcess.forEach(walk);
console.log("Final UI Synchronization applied successfully!");
