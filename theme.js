const fs = require('fs');

const path = 'src/app/field-agent/capture/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Global Background & Text
code = code.replace(/bg-\[\#f7fbf9\]/g, 'bg-[#050d1a] bg-gradient-to-br from-[#050d1a] via-[#0a1628] to-[#0f1e35]');
code = code.replace(/text-gray-800/g, 'text-slate-200');
code = code.replace(/text-gray-900/g, 'text-white');
code = code.replace(/text-gray-[567]00/g, 'text-slate-400');
code = code.replace(/text-gray-400/g, 'text-slate-500');

// Containers
code = code.replace(/bg-white/g, 'bg-[#0f1e35]/60 backdrop-blur-xl border border-white/10 shadow-2xl');
code = code.replace(/bg-gray-50/g, 'bg-[#050d1a]');
code = code.replace(/bg-gray-100/g, 'bg-white/5');
code = code.replace(/bg-gray-200/g, 'bg-white/10');
code = code.replace(/bg-gray-800/g, 'border-white/10');
code = code.replace(/border-gray-[123]00/g, 'border-white/10');

// Headers & Nav
code = code.replace(/bg-\[\#1b7348\]/g, 'bg-[#0a1628] border-b border-white/10 backdrop-blur-md');
code = code.replace(/bg-\[\#0f172a\]/g, 'bg-[#050d1a]/80 backdrop-blur-md');

// Inputs
code = code.replace(/bg-white border/g, 'bg-white/5 border border-white/10 text-white placeholder-slate-500');

// Write back
fs.writeFileSync(path, code);
console.log("Applied dark theme replacements!");
