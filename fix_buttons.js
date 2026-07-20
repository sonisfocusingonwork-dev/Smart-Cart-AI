const fs = require('fs');
const path = require('path');

const dirsToProcess = [
    path.join(__dirname, 'client/src/app')
];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix 1: Dark text on Dark Green background
    // If a class contains bg-[#15803D] AND text-[#334155], change text to text-white
    // Regex matches the whole className string to ensure both exist
    const classRegex = /className="([^"]*bg-\[#15803D\][^"]*text-\[#334155\][^"]*|[^"]*text-\[#334155\][^"]*bg-\[#15803D\][^"]*)"/g;
    content = content.replace(classRegex, (match, p1) => {
        // Only if it doesn't also have bg-[#15803D]/10 or something (wait, /10 or /20 is light, but standard bg-[#15803D] without opacity is dark)
        if (p1.match(/bg-\[#15803D\](?!\/)/)) {
            return `className="${p1.replace('text-[#334155]', 'text-white')}"`;
        }
        return match;
    });

    // Fix 2: White text on light canvas background
    // If a class contains bg-[#F5F5E6] (with or without opacity) or bg-white AND text-white
    const classRegex2 = /className="([^"]*bg-\[#F5F5E6\][^"]*text-white[^"]*|[^"]*text-white[^"]*bg-\[#F5F5E6\][^"]*)"/g;
    content = content.replace(classRegex2, (match, p1) => {
        return `className="${p1.replace('text-white', 'text-[#15803D]')}"`;
    });

    // Fix 3: bg-[#15803D]/80 backdrop-blur-md px-3 text-xs font-black text-white
    // Change to bg-[#15803D] text-white to be solid and clear
    content = content.replace(/bg-\[#15803D\]\/80 backdrop-blur-md/g, 'bg-[#15803D] shadow-md');

    // Fix 4: Any remaining `bg-[#15803D] text-[#334155]` across the codebase
    content = content.replace(/bg-\[#15803D\](\s+[^"]*)text-\[#334155\]/g, 'bg-[#15803D]$1text-white');
    content = content.replace(/text-\[#334155\](\s+[^"]*)bg-\[#15803D\](?![\/])/g, 'text-white$1bg-[#15803D]');

    // Fix 5: hover:bg-white/10 on light backgrounds is invisible. 
    // Example in TopStatusBar: hover:bg-white/70 backdrop-blur-md border border-white/50
    // Keep it, but make sure the base contrast is good.

    // Fix 6: The "plus" button for adding manual items
    content = content.replace(/className="h-8 rounded-2xl bg-\[#15803D\]\/80 backdrop-blur-md px-3 text-xs font-black text-white"/g, 
        'className="h-8 rounded-2xl bg-[#15803D] px-4 text-sm font-black text-white shadow-[0_2px_10px_rgba(21,128,61,0.3)]"');

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
console.log("Global button contrast patch complete!");
