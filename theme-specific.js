const fs = require('fs');

const path = 'src/app/field-agent/capture/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Fix task selection cards: "border border-gray-150/70", "text-gray-950"
code = code.replace(/text-gray-950/g, 'text-white');
code = code.replace(/border-gray-150\/70/g, 'border-white/10 hover:bg-white/5');

// Fix Icon containers: bg-X-50 text-X-600 -> bg-X-500/20 text-X-400 border-X-100 -> border-X-500/30
const colors = ['purple', 'cyan', 'rose', 'yellow', 'emerald'];
colors.forEach(c => {
    code = code.replace(new RegExp(`bg-${c}-50`, 'g'), `bg-${c}-500/20`);
    code = code.replace(new RegExp(`text-${c}-600`, 'g'), `text-${c}-400`);
    code = code.replace(new RegExp(`border-${c}-100`, 'g'), `border-${c}-500/30`);
});

// Update standard form inputs
code = code.replace(/className="w-full bg-\[\#050d1a\] border border-white\/10 rounded-xl p-3 text-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"/g, 
                    'className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"');
code = code.replace(/focus:ring-emerald-200/g, 'focus:ring-emerald-500/20');
code = code.replace(/focus:ring-emerald-500/g, 'focus:ring-emerald-500/50');
code = code.replace(/focus:border-emerald-500/g, 'focus:border-emerald-400');

// Fix the Success Screen Background
code = code.replace(/bg-green-100 text-green-500/g, 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30');

// Back to Dashboard buttons in Success screen
code = code.replace(/bg-white\/5 text-slate-400 font-bold py-3 rounded-xl hover:bg-white\/10 transition text-center block/g, 
                    'bg-white/5 text-slate-300 font-bold py-3 rounded-xl hover:bg-white/10 transition text-center block border border-white/10');
code = code.replace(/bg-\[\#1b7348\] text-white font-bold py-3 rounded-xl hover:bg-\[\#145635\] transition/g, 
                    'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-3 rounded-xl hover:opacity-90 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition');
code = code.replace(/bg-gray-100 text-gray-700/g, 'bg-white/5 text-slate-300 border border-white/10');
code = code.replace(/hover:bg-gray-200/g, 'hover:bg-white/10');
code = code.replace(/border-gray-100/g, 'border-white/10');

// Camera / Video container
code = code.replace(/bg-black overflow-hidden/g, 'bg-black/50 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl');

fs.writeFileSync(path, code);
console.log("Applied specific dark mode fixes!");
