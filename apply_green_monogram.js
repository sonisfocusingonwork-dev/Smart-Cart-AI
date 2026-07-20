const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'client/src/app/screens');
const componentsDir = path.join(__dirname, 'client/src/app/components');
const sharedFile = path.join(__dirname, 'client/src/app/shared.tsx');
const uiAvatarFile = path.join(__dirname, 'client/src/app/components/ui/avatar.tsx');

const monogramScreens = [
    'HomeScreen.tsx',
    'CategoryScreen.tsx',
    'CartScreen.tsx',
    'GroupSessionScreen.tsx',
    'OffersScreen.tsx',
    'PurchaseHistoryScreen.tsx'
];

// Helper to inject MonogramPattern
function injectMonogram(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if not present
    if (!content.includes('MonogramPattern')) {
        const importMatch = content.match(/import [^{]*{[^}]*} from "[^"]+";/);
        if (importMatch) {
            content = content.replace(importMatch[0], importMatch[0] + '\nimport { MonogramPattern } from "../components/ui/MonogramPattern";');
        } else {
            content = 'import { MonogramPattern } from "../components/ui/MonogramPattern";\n' + content;
        }
    }

    // Add relative overflow-hidden to header
    content = content.replace(/(<header[^>]*className="[^"]*)"/g, (match, p1) => {
        if (!p1.includes('relative')) p1 += ' relative';
        if (!p1.includes('overflow-hidden')) p1 += ' overflow-hidden';
        return p1 + '"';
    });

    // Inject <MonogramPattern /> immediately after <header ...>
    content = content.replace(/(<header[^>]*>)/g, (match, p1) => {
        if (!content.substring(content.indexOf(p1), content.indexOf(p1) + 100).includes('<MonogramPattern')) {
            return p1 + '<MonogramPattern />';
        }
        return p1;
    });

    // Update typography
    content = content.replace(/(<header[^>]*className="[^"]*)"/g, (match, p1) => {
        if (!p1.includes('font-black')) p1 += ' font-black';
        if (!p1.includes('tracking-wide')) p1 += ' tracking-wide';
        return p1 + '"';
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Inject Monogram
for (const file of monogramScreens) {
    const fullPath = path.join(screensDir, file);
    if (fs.existsSync(fullPath)) {
        injectMonogram(fullPath);
    }
}

// 2. Green Re-Zoning
// A. Multi-Cart Sync Row in GroupSessionScreen
const groupSessionPath = path.join(screensDir, 'GroupSessionScreen.tsx');
if (fs.existsSync(groupSessionPath)) {
    let content = fs.readFileSync(groupSessionPath, 'utf8');
    // Replace the previous #D1FAE5 borders with #A7F3D0 for the specific banner
    content = content.replace(/border-\[#D1FAE5\] bg-\[#D1FAE5\]/g, 'border-[#A7F3D0] bg-[#D1FAE5]');
    // Also if there's text-[#065F46] and bg-[#D1FAE5], make sure border is #A7F3D0
    fs.writeFileSync(groupSessionPath, content, 'utf8');
}

// B. Scanner Ready State Panel in HomeScreen and ui/avatar
const scannerFiles = [path.join(screensDir, 'HomeScreen.tsx'), uiAvatarFile];
for (const file of scannerFiles) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Find Scanner container: look for "Máy quét đang sẵn sàng" container
        // It currently has bg-[#F5F5E6] border-[#D3524B]/55
        // We need bg-[#F0FDF4] border-[#8CB867] text-[#15803D]
        content = content.replace(/bg-\[#F5F5E6\]([^>]*)>([^<]*)<div className="flex items-center gap-2">([^<]*)<span className="h-3 w-3 rounded-full bg-\[#D3524B\]/g, 
            'bg-[#F0FDF4] border-[#8CB867] text-[#15803D]$1>$2<div className="flex items-center gap-2">$3<span className="h-3 w-3 rounded-full bg-[#15803D]');
        // Make sure border is updated in the class
        content = content.replace(/border-\[#D3524B\]\/55 bg-\[#F0FDF4\]/g, 'border-[#8CB867] bg-[#F0FDF4]');
        
        fs.writeFileSync(file, content, 'utf8');
    }
}

// C. Account Progress Bars
const accountScreenPath = path.join(screensDir, 'AccountScreen.tsx');
if (fs.existsSync(accountScreenPath)) {
    let content = fs.readFileSync(accountScreenPath, 'utf8');
    // Replace `bg-[#D3524B]` inside progress bar with gradient
    // e.g. <div className="h-full rounded-full bg-[#D3524B] shadow-...
    content = content.replace(/bg-\[#D3524B\]/g, (match, offset, str) => {
        // Only replace if it's the progress bar fill
        if (str.substring(offset - 20, offset + 50).includes('width:')) {
            return 'bg-gradient-to-r from-[#8CB867] to-[#15803D]';
        }
        return match;
    });
    fs.writeFileSync(accountScreenPath, content, 'utf8');
}

// D. BottomNav in shared.tsx
if (fs.existsSync(sharedFile)) {
    let content = fs.readFileSync(sharedFile, 'utf8');
    // The active tab probably uses something like: `bg-[#D3524B] text-white`
    // We want: `bg-[#D1FAE5] text-[#15803D] border-[#8CB867]/40`
    // Let's replace the active condition class in BottomNav
    content = content.replace(/bg-\[#D3524B\] text-white/g, 'bg-[#D1FAE5] text-[#15803D] border border-[#8CB867]/40');
    content = content.replace(/bg-\[#D3524B\] text-\[#0F172A\]/g, 'bg-[#D1FAE5] text-[#15803D] border border-[#8CB867]/40');
    // Sometimes it's text-[#334155] if the previous script over-replaced text-white
    content = content.replace(/bg-\[#D3524B\] text-\[#334155\]/g, 'bg-[#D1FAE5] text-[#15803D] border border-[#8CB867]/40');
    
    fs.writeFileSync(sharedFile, content, 'utf8');
}

console.log("Green Monogram updates applied!");
