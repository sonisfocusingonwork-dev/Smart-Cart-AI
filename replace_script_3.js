const fs = require('fs');
const path = require('path');

const adminFiles = [
    'AdminDashboardScreen.tsx',
    'CustomerCrmTab.tsx',
    'HelpdeskTab.tsx',
    'StaffManagementTab.tsx',
    'SystemSettingsTab.tsx'
];
const screensDir = path.join(__dirname, 'client/src/app/screens');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace border-white/5, border-white/10, etc. with border-[#E2E8F0]
    content = content.replace(/border-white\/\d+/g, 'border-[#E2E8F0]');
    // There are some `bg-[#1E293B]` table headers that need to be `bg-[#F5F5E6]` since panels are white.
    // E.g., `<tr className="bg-[#1E293B]` inside a table which is inside a white container.
    content = content.replace(/<tr className="bg-\[#1E293B\]([^"]*)"/g, '<tr className="bg-[#F5F5E6]$1"');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

for (const file of adminFiles) {
    const p = path.join(screensDir, file);
    if (fs.existsSync(p)) {
        processFile(p);
    }
}

console.log('Third pass for Admin borders done.');
