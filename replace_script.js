const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'client/src/app/screens');
const componentsDir = path.join(__dirname, 'client/src/app/components');
const rootFile = path.join(__dirname, 'client/src/app/App.tsx');

const adminFiles = [
    'AdminDashboardScreen.tsx',
    'CustomerCrmTab.tsx',
    'HelpdeskTab.tsx',
    'StaffManagementTab.tsx',
    'SystemSettingsTab.tsx'
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const isAdmin = adminFiles.some(f => filePath.endsWith(f));

    // Global Primary Color Replace
    content = content.replace(/#F97316/gi, '#D3524B'); // Orange -> Tomato Red
    content = content.replace(/bg-orange-500/g, 'bg-[#D3524B]');
    content = content.replace(/text-orange-500/g, 'text-[#D3524B]');
    content = content.replace(/border-orange-500/g, 'border-[#D3524B]');
    content = content.replace(/#EA580C/gi, '#D3524B'); // Darker orange

    // Shadow replacements
    content = content.replace(/shadow-\[0_[^\]]+\]/g, 'shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]');
    content = content.replace(/shadow-lg/g, 'shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]');
    content = content.replace(/shadow-xl/g, 'shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]');
    content = content.replace(/shadow-2xl/g, 'shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]');
    content = content.replace(/shadow-md/g, 'shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]');
    
    // Rounded corners uniform
    content = content.replace(/rounded-xl/g, 'rounded-2xl');
    content = content.replace(/rounded-lg/g, 'rounded-2xl');
    content = content.replace(/rounded-md/g, 'rounded-2xl');

    if (isAdmin) {
        // Admin Dashboard changes
        content = content.replace(/bg-\[#0F172A\]/gi, 'bg-[#1E293B]');
        
        // success/alerts
        content = content.replace(/text-emerald-400/g, 'text-[#8CB867]');
        content = content.replace(/text-emerald-500/g, 'text-[#8CB867]');
        content = content.replace(/text-green-500/g, 'text-[#8CB867]');
        content = content.replace(/text-red-500/g, 'text-[#D3524B]');
        
    } else {
        // Customer screens
        content = content.replace(/bg-\[#0F172A\]/gi, 'bg-[#F5F5E6]');
        
        const classNameRegex = /className="([^"]*)"/g;
        content = content.replace(classNameRegex, (match, classes) => {
            if (classes.includes('text-white') && !classes.includes('bg-[#D3524B]') && !classes.includes('bg-[#1E293B]') && !classes.includes('bg-white/')) {
                classes = classes.replace(/\btext-white\b/g, 'text-[#334155]');
            }
            classes = classes.replace(/text-\[#CBD5E1\]/g, 'text-[#475569]');
            classes = classes.replace(/border-white\/\d+/g, 'border-[#E2E8F0]');
            classes = classes.replace(/border-\[#CBD5E1\]/g, 'border-[#E2E8F0]');
            return `className="${classes}"`;
        });
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

console.log('Replacements done.');
