const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client/src');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Strip BOM or other weird characters at the start
    // \uFEFF is BOM. Also check for \uFFFD (replacement character)
    // We should also check if the file starts with literal "ï»¿" due to bad encoding conversions
    
    if (content.startsWith('ï»¿')) {
        content = content.substring(3);
        changed = true;
    }

    while (content.length > 0 && (content.charCodeAt(0) === 0xFEFF || content.charCodeAt(0) === 0xFFFD || content.charCodeAt(0) === 65533)) {
        content = content.substring(1);
        changed = true;
    }
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
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
            fixFile(fullPath);
        }
    }
}

walk(srcDir);
