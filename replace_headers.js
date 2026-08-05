const fs = require('fs');
const path = require('path');

const updateFile = (filepath) => {
    if (!fs.existsSync(filepath)) {
        console.log(`File not found: ${filepath}`);
        return;
    }
    
    let content = fs.readFileSync(filepath, 'utf8');

    // Add imports
    if (!content.includes('import { MarketingHeader }')) {
        if (content.includes('import Link from "next/link"')) {
            content = content.replace('import Link from "next/link"', 'import Link from "next/link"\nimport { MarketingHeader } from "@/components/layout/MarketingHeader"\nimport { MarketingFooter } from "@/components/layout/MarketingFooter"');
        } else {
            content = content.replace('"use client"', '"use client"\nimport { MarketingHeader } from "@/components/layout/MarketingHeader"\nimport { MarketingFooter } from "@/components/layout/MarketingFooter"');
        }
    }

    // Replace Header
    const headerPattern = /\{\/\* ── HEADER ──(?:──────────────────────────────)? \*\/\}[\s\S]*?(?=\{\/\* ── (?:HERO|PAGE TITLE) ──(?:──────────────────────────────)? \*\/\}|<div className="max-w-\[1200px\])/;
    if (headerPattern.test(content)) {
        content = content.replace(headerPattern, '<MarketingHeader />\n\n      ');
    } else {
        const headerPattern2 = /<header[\s\S]*?<\/header>/;
        if (headerPattern2.test(content)) {
            content = content.replace(headerPattern2, '<MarketingHeader />');
        }
    }

    // Replace Footer
    const footerPattern = /\{\/\* ── FOOTER ──(?:──────────────────────────────)? \*\/\}[\s\S]*?(?=<\/div\s*>\s*\n\s*\)\s*\n})/;
    if (footerPattern.test(content)) {
        content = content.replace(footerPattern, '<MarketingFooter />\n    ');
    } else {
        const footerPattern2 = /<footer[\s\S]*?<\/footer>/;
        if (footerPattern2.test(content)) {
            content = content.replace(footerPattern2, '<MarketingFooter />');
        }
    }

    // Replace contact info
    content = content.replace(/hello@rieng\.co/g, 'data@rieng.co.ke');
    content = content.replace(/\+254 700 000 000/g, '0710588758');
    content = content.replace(/254700000000/g, '254710588758');

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
};

const files = [
    path.join(__dirname, 'src', 'app', 'page.tsx'),
    path.join(__dirname, 'src', 'app', 'about', 'page.tsx'),
    path.join(__dirname, 'src', 'app', 'contact', 'page.tsx'),
    path.join(__dirname, 'src', 'app', 'datasets', 'page.tsx')
];

files.forEach(updateFile);
