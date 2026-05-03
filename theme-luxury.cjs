const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { regex: /bg-slate-50/g, replacement: 'bg-black' },
  { regex: /bg-slate-100/g, replacement: 'bg-zinc-900' },
  { regex: /bg-slate-200/g, replacement: 'bg-zinc-800' },
  
  { regex: /bg-white/g, replacement: 'bg-zinc-950' },
  { regex: /text-slate-900/g, replacement: 'text-white' },
  { regex: /text-slate-600/g, replacement: 'text-zinc-400' },
  { regex: /text-slate-500/g, replacement: 'text-zinc-500' },
  
  { regex: /border-slate-200/g, replacement: 'border-white/10' },
  { regex: /border-slate-300/g, replacement: 'border-white/20' },
  
  { regex: /text-blue-600/g, replacement: 'text-amber-500' },
  { regex: /text-blue-500/g, replacement: 'text-amber-400' },
  { regex: /text-blue-400/g, replacement: 'text-amber-300' },
  
  { regex: /bg-blue-600/g, replacement: 'bg-white text-black' },
  { regex: /bg-blue-500/g, replacement: 'bg-white/10 text-white' },
  
  { regex: /hover:bg-blue-700/g, replacement: 'hover:bg-zinc-200' },
  { regex: /hover:text-blue-600/g, replacement: 'hover:text-amber-500' },
  { regex: /hover:border-blue-600/g, replacement: 'hover:border-amber-500' },
  { regex: /focus:border-blue-600/g, replacement: 'focus:border-amber-500' },
  { regex: /focus:ring-blue-600/g, replacement: 'focus:ring-amber-500' },
  
  { regex: /from-white/g, replacement: 'from-black' },
  { regex: /via-white/g, replacement: 'via-black' },
  { regex: /via-white\/50/g, replacement: 'via-black/50' },
  
  { regex: /glass p-2 rounded-2xl/g, replacement: 'glass p-2 rounded-full' },
  { regex: /rounded-xl/g, replacement: 'rounded-full' },
  { regex: /rounded-2xl/g, replacement: 'rounded-[2rem]' },
  
  { regex: /bg-zinc-950 text-black/g, replacement: 'bg-white text-black' },
  { regex: /text-white text-black/g, replacement: 'text-black' },
  { regex: /bg-zinc-950\/10 text-white/g, replacement: 'bg-white/10 text-white' }
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
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDirectory(directoryPath);
console.log('Luxury theme applied successfully!');
