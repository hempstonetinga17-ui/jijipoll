import os
import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add imports
    if 'import { MarketingHeader }' not in content:
        # insert after "use client" or other imports
        if 'import Link' in content:
            content = content.replace('import Link from "next/link"', 'import Link from "next/link"\nimport { MarketingHeader } from "@/components/layout/MarketingHeader"\nimport { MarketingFooter } from "@/components/layout/MarketingFooter"')
        else:
            content = content.replace('"use client"', '"use client"\nimport { MarketingHeader } from "@/components/layout/MarketingHeader"\nimport { MarketingFooter } from "@/components/layout/MarketingFooter"')

    # Replace Header
    header_pattern = r'\{\/\* ── HEADER ──(?:──────────────────────────────)? \*\/}[\s\S]*?(?=\{\/\* ── (?:HERO|PAGE TITLE) ──(?:──────────────────────────────)? \*\/})'
    
    if re.search(header_pattern, content):
        content = re.sub(header_pattern, '<MarketingHeader />\n\n      ', content)
    else:
        # fallback for pages that might have a different comment style
        header_pattern = r'<header[\s\S]*?</header>'
        if re.search(header_pattern, content):
            content = re.sub(header_pattern, '<MarketingHeader />', content)

    # Replace Footer
    footer_pattern = r'\{\/\* ── FOOTER ──(?:──────────────────────────────)? \*\/}[\s\S]*?(?=</div\s*>\s*\n\s*\)\s*\n})'
    
    if re.search(footer_pattern, content):
        content = re.sub(footer_pattern, '<MarketingFooter />\n    ', content)
    else:
        footer_pattern2 = r'<footer[\s\S]*?</footer>'
        if re.search(footer_pattern2, content):
            content = re.sub(footer_pattern2, '<MarketingFooter />', content)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
files = [
    r'c:\Users\Tinga\OneDrive\Desktop\jijipoll\src\app\page.tsx',
    r'c:\Users\Tinga\OneDrive\Desktop\jijipoll\src\app\about\page.tsx',
    r'c:\Users\Tinga\OneDrive\Desktop\jijipoll\src\app\contact\page.tsx',
    r'c:\Users\Tinga\OneDrive\Desktop\jijipoll\src\app\datasets\page.tsx'
]

for file in files:
    if os.path.exists(file):
        update_file(file)
        print(f"Updated {file}")
    else:
        print(f"File not found: {file}")
