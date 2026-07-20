const fs = require('fs');
const path = require('path');

const dirsToProcess = [
    path.join(__dirname, 'client/src/app/screens'),
    path.join(__dirname, 'client/src/app/components'),
    path.join(__dirname, 'client/src/app')
];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // We want to make buttons "mờ mờ" (glassmorphism).
    // Find all <button ... className="...">
    // If it has bg-white, change to bg-white/70 backdrop-blur-md border border-white/50
    // If it has bg-[#F5F5E6], change to bg-[#F5F5E6]/70 backdrop-blur-md border border-white/50
    // If it has bg-[#15803D] (our new green), change to bg-[#15803D]/80 backdrop-blur-md
    // If it has bg-[#D3524B] (red), change to bg-[#D3524B]/80 backdrop-blur-md
    
    // We will use a regex to match the className of <button> tags.
    // Due to JSX multi-line attributes, it's safer to just replace globally within the file if it's a known button style, but let's be careful.
    
    // Replace solid white button backgrounds
    content = content.replace(/(<button[^>]*className="[^"]*)(bg-white)([^"]*")/g, (match, p1, p2, p3) => {
        if (!match.includes('backdrop-blur')) {
            return p1 + 'bg-white/70 backdrop-blur-md border border-white/50' + p3;
        }
        return match;
    });

    // Replace solid beige button backgrounds
    content = content.replace(/(<button[^>]*className="[^"]*)(bg-\[#F5F5E6\])([^"]*")/g, (match, p1, p2, p3) => {
        if (!match.includes('backdrop-blur')) {
            return p1 + 'bg-[#F5F5E6]/70 backdrop-blur-md border border-white/50' + p3;
        }
        return match;
    });

    // Replace solid red button backgrounds
    content = content.replace(/(<button[^>]*className="[^"]*)(bg-\[#D3524B\])([^"]*")/g, (match, p1, p2, p3) => {
        if (!match.includes('backdrop-blur')) {
            return p1 + 'bg-[#D3524B]/80 backdrop-blur-md' + p3;
        }
        return match;
    });

    // Replace solid green button backgrounds
    content = content.replace(/(<button[^>]*className="[^"]*)(bg-\[#15803D\])([^"]*")/g, (match, p1, p2, p3) => {
        if (!match.includes('backdrop-blur')) {
            return p1 + 'bg-[#15803D]/80 backdrop-blur-md' + p3;
        }
        return match;
    });
    
    // Also, there are some `Link` or `a` tags acting as buttons. Let's do a general pass for common button classes:
    content = content.replace(/className="([^"]*\b(shadow-\[4px_4px[^"]*\]|rounded-full|rounded-2xl|rounded-xl)\b[^"]*)"/g, (match, p1) => {
        // If it looks like a button and has bg-white but no backdrop-blur
        if (match.includes('bg-white') && !match.includes('bg-white/') && !match.includes('backdrop-blur') && match.includes('shadow')) {
            return `className="${p1.replace('bg-white', 'bg-white/70 backdrop-blur-md border border-white/50')}"`;
        }
        if (match.includes('bg-[#F5F5E6]') && !match.includes('bg-[#F5F5E6]/') && !match.includes('backdrop-blur') && match.includes('shadow')) {
            return `className="${p1.replace('bg-[#F5F5E6]', 'bg-[#F5F5E6]/70 backdrop-blur-md border border-white/50')}"`;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated buttons in:', filePath);
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
console.log("Glass buttons applied!");
