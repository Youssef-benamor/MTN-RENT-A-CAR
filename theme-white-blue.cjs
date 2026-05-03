const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Black/Dark theme to White/Clean theme
  { regex: /bg-black/g, replacement: 'bg-white' },
  { regex: /bg-zinc-950/g, replacement: 'bg-slate-50' },
  { regex: /bg-zinc-900/g, replacement: 'bg-slate-100' },
  { regex: /bg-zinc-800/g, replacement: 'bg-slate-200' },
  
  // Text Colors
  { regex: /text-white/g, replacement: 'text-slate-900' },
  { regex: /text-zinc-400/g, replacement: 'text-slate-500' },
  { regex: /text-zinc-500/g, replacement: 'text-slate-400' },
  
  // Borders
  { regex: /border-white\/10/g, replacement: 'border-slate-200' },
  { regex: /border-white\/20/g, replacement: 'border-slate-300' },
  { regex: /border-white\/5/g, replacement: 'border-slate-100' },
  
  // Amber accents to Royal Blue
  { regex: /text-amber-500/g, replacement: 'text-blue-600' },
  { regex: /text-amber-400/g, replacement: 'text-blue-500' },
  { regex: /text-amber-300/g, replacement: 'text-blue-400' },
  
  { regex: /bg-amber-500/g, replacement: 'bg-blue-600' },
  { regex: /bg-amber-400/g, replacement: 'bg-blue-500' },
  
  // Buttons
  { regex: /bg-white text-black/g, replacement: 'bg-blue-600 text-white' },
  { regex: /hover:bg-zinc-200/g, replacement: 'hover:bg-blue-700' },
  { regex: /focus:border-amber-500/g, replacement: 'focus:border-blue-600' },
  { regex: /focus:ring-amber-500/g, replacement: 'focus:ring-blue-600' },
  { regex: /hover:text-amber-500/g, replacement: 'hover:text-blue-600' },
  { regex: /hover:border-amber-500/g, replacement: 'hover:border-blue-600' },
  { regex: /accent-amber-500/g, replacement: 'accent-blue-600' },
  { regex: /accent-amber-400/g, replacement: 'accent-blue-500' },
  
  // Gradients
  { regex: /from-black/g, replacement: 'from-slate-50' },
  { regex: /via-black/g, replacement: 'via-slate-50' },
  { regex: /via-black\/50/g, replacement: 'via-slate-50/50' },
  
  // Hover & specific backgrounds
  { regex: /bg-white\/10/g, replacement: 'bg-slate-100' },
  { regex: /bg-white\/5/g, replacement: 'bg-slate-50' },
  { regex: /bg-black\/70/g, replacement: 'bg-slate-900/5' },
  { regex: /bg-slate-50\/70/g, replacement: 'bg-white/80' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      // Cleanup any accidental replacements
      content = content.replace(/text-slate-900 text-black/g, 'text-slate-900');
      content = content.replace(/bg-blue-600 text-slate-900/g, 'bg-blue-600 text-white');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(directoryPath);
console.log('Blue and White theme applied successfully!');
