const fs = require('fs');
const path = require('path');

const dirsToProcess = [
    path.join(__dirname, 'client/src/app')
];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Fix SoftIcon in avatar.tsx: text-white on bg-[#F1F5F9]
    content = content.replace(/bg-\[#F1F5F9\] text-white/g, 'bg-[#F1F5F9] text-[#15803D]');
    
    // 2. Fix MiniCartButton in avatar.tsx: text-white on bg-[#F5F5E6]
    content = content.replace(/bg-\[#F5F5E6\](?:\/\d+)?(\s+[^"]*)text-white/g, 'bg-[#F5F5E6]$1text-[#334155]');
    content = content.replace(/text-white(\s+[^"]*)bg-\[#F5F5E6\](?:\/\d+)?/g, 'text-[#334155]$1bg-[#F5F5E6]');

    // 3. Remove blur from Categories (HomeScreen.tsx) and Back Button (avatar.tsx) and others
    content = content.replace(/bg-white\/[0-9]+\s+backdrop-blur-(?:md|sm|lg|xl)/g, 'bg-white shadow-sm');
    content = content.replace(/bg-\[#F5F5E6\]\/[0-9]+\s+backdrop-blur-(?:md|sm|lg|xl)/g, 'bg-[#F5F5E6] shadow-sm');
    content = content.replace(/border-white\/50/g, 'border-[#E2E8F0]');

    // 4. Specifically fix the Back button which has "bg-white/75" but the backdrop-blur might not be directly adjacent
    content = content.replace(/bg-white\/75(\s+[^"]*)backdrop-blur-xl/g, 'bg-white shadow-sm$1');
    content = content.replace(/bg-white\/70(\s+[^"]*)backdrop-blur-md/g, 'bg-white shadow-sm$1');
    content = content.replace(/bg-white\/88(\s+[^"]*)backdrop-blur-xl/g, 'bg-white shadow-sm$1');
    content = content.replace(/bg-white\/92(\s+[^"]*)backdrop-blur-xl/g, 'bg-white shadow-sm$1');

    // 5. Check if we missed any text-white on light bg
    // If a button has text-white but no bg-[#15803D] or bg-black, it might be white on white.
    // I will replace `text-white` with `text-[#334155]` in TopStatusBar's call to help button since TopStatusBar is white/beige.
    // Wait, the TopStatusBar button is `bg-[#15803D]`, so `text-white` is correct there.

    // 6. Fix "border border-[#15803D]/70 bg-white/75 text-[#334155] shadow-sm backdrop-blur-xl hover:bg-white" -> "border border-[#15803D]/70 bg-white text-[#334155] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)] hover:bg-[#F5F5E6]"
    content = content.replace(/bg-white\/[0-9]+/g, 'bg-white');
    content = content.replace(/bg-\[#F5F5E6\]\/[0-9]+/g, 'bg-[#F5F5E6]');
    
    // Clean up duplicate shadow-sm if created
    content = content.replace(/shadow-sm shadow-sm/g, 'shadow-[4px_4px_0px_0px_rgba(51,65,85,0.06)]');
    content = content.replace(/backdrop-blur-(?:md|sm|lg|xl)/g, '');

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
console.log("Blur and text-white patch complete!");
