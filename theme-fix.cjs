const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { regex: /bg-white text-black\/10/g, replacement: 'bg-white/10' },
  { regex: /bg-white text-black\/20/g, replacement: 'bg-white/10' },
  { regex: /bg-white text-black text-white/g, replacement: 'bg-white text-black' },
  { regex: /text-white font-medium bg-white text-black/g, replacement: 'text-black font-medium bg-white' },
  { regex: /file:bg-white text-black file:text-white/g, replacement: 'file:bg-white file:text-black' },
  { regex: /hover:bg-white text-black/g, replacement: 'hover:bg-zinc-200 hover:text-black' },
  { regex: /hover:bg-zinc-200 text-black/g, replacement: 'hover:bg-zinc-200 hover:text-black' },
  { regex: /shadow-blue-600\/20/g, replacement: 'shadow-none' },
  { regex: /text-black px-6 py-2 rounded-full text-white/g, replacement: 'text-black px-6 py-2 rounded-full' },
  { regex: /bg-white text-black py-4 rounded-full text-white/g, replacement: 'bg-white text-black py-4 rounded-full' },
  { regex: /bg-white text-black px-8 py-3 rounded-full text-white/g, replacement: 'bg-white text-black px-8 py-3 rounded-full' }
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
console.log('Fixed luxury theme applied successfully!');
