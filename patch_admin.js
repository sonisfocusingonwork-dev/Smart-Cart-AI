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

    // Fix remaining dark backgrounds
    content = content.replace(/bg-\[#0B0F19\]/gi, 'bg-[#F5F5E6]');
    content = content.replace(/bg-\[#090D1A\]/gi, 'bg-[#F5F5E6]');
    content = content.replace(/bg-\[#151D30\]/gi, 'bg-[#FFFFFF]');

    // Fix the orange gradients and their text colors
    content = content.replace(/bg-gradient-to-[a-z]+ from-orange-[0-9]+ to-amber-[0-9]+ text-\[#334155\]/g, 'bg-[#15803D] text-white');
    content = content.replace(/bg-gradient-to-[a-z]+ from-orange-[0-9]+ to-amber-[0-9]+/g, 'bg-[#15803D]');
    
    // There are some blue charts? (The screenshot shows black and blue bars). 
    // Wait, the chart bars might be #0F172A (black) and #0EA5E9 (blue).
    // The user didn't explicitly mention charts, but they did mention "all hardware diagnostics grids, latency charts..." to switch containers.
    // If the bars are black, maybe we change them to green `#15803D` and mint `#D1FAE5`.
    content = content.replace(/fill="?#0F172A"?/g, 'fill="#15803D"');
    content = content.replace(/fill="?#0EA5E9"?/g, 'fill="#D1FAE5"');
    content = content.replace(/fill="?#38BDF8"?/g, 'fill="#D1FAE5"'); // other blues

    // Sidebar collapse button border
    content = content.replace(/border-\[#0F172A\]/gi, 'border-[#E2E8F0]');

    // And make sure that any leftover dark slate borders are handled
    content = content.replace(/border-\[#1E293B\]/gi, 'border-[#E2E8F0]');

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
console.log("Patch complete!");
