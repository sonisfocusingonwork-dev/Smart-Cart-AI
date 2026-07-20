const fs = require('fs');
const path = require('path');

const dirsToProcess = [
    path.join(__dirname, 'client/src/app')
];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Replace all legacy dark text text-[#0F172A] to text-[#334155] (Charcoal)
    content = content.replace(/text-\[#0F172A\]/g, 'text-[#334155]');

    // 2. Fix Admin tabs overlays (CustomerCrmTab.tsx, HelpdeskTab.tsx, etc.)
    // In CustomerCrmTab: bg-black/20 text-slate-400 -> bg-[#F1F5F9] text-[#64748B]
    content = content.replace(/bg-black\/20(\s+)text-slate-400/g, 'bg-[#F1F5F9]$1text-[#64748B]');
    // In other places where bg-black/20 is used as a container (HelpdeskTab)
    content = content.replace(/bg-black\/20(\s+)rounded-2xl/g, 'bg-[#F5F5E6]$1rounded-2xl');

    // 3. Fix other black transparent overlays in components to use slate overlay if they are strictly for modals
    // Wait, the prompt asked to replace them. For Modals in App.tsx / CartScreen / AdminProtectedRoute: bg-black/50, bg-black/60
    content = content.replace(/bg-black\/50/g, 'bg-[#334155]/40');
    content = content.replace(/bg-black\/55/g, 'bg-[#334155]/45');
    content = content.replace(/bg-black\/60/g, 'bg-[#334155]/50');

    // Remove stray hover:bg-black/5
    content = content.replace(/hover:bg-black\/5\b/g, 'hover:bg-[#334155]/5');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Patched:', filePath);
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
console.log("Global color patch complete!");
