const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages', 'admin');

const replacements = [
  ['bg-[#1A1A1A]', 'bg-cardBg'],
  ['bg-[#1E1E1E]', 'bg-cardBg'],
  ['bg-[#1C1C1C]', 'bg-cardBg'],
  ['bg-[#252525]', 'bg-cardBg'],
  ['bg-[#2A2A2A]', 'bg-cardBg'],
  ['bg-[#111111]', 'bg-secondaryBg'],
  ['bg-[#141414]', 'bg-secondaryBg'],
  ['bg-[#181818]', 'bg-secondaryBg'],
  ['bg-[#0D0D0D]', 'bg-secondaryBg'],
  ['border-white/5', 'border-borderColor'],
  ['border-white/8', 'border-borderColor'],
  ['border-white/10', 'border-borderColor'],
  ['border-white/15', 'border-borderColor'],
  ['divide-white/5', 'divide-borderColor'],
  ['divide-white/3', 'divide-borderColor'],
  ['bg-white/5', 'bg-surface'],
  ['bg-white/3', 'bg-surface'],
  ['bg-white/2', 'bg-surface'],
  ['bg-white/8', 'bg-surface'],
  ['bg-white/10', 'bg-surface'],
  // Text replacements
  ['text-white', 'text-textPrimary'],
  ['text-gray-300', 'text-textSecondary'],
  ['text-gray-400', 'text-textSecondary'],
  ['text-gray-500', 'text-textSecondary'],
  ['text-gray-600', 'text-textSecondary'],
  // Hover replacements
  ['hover:text-textPrimary', 'hover:text-textPrimary'],  // no-op to prevent double replace
  ['hover:bg-surface', 'hover:bg-surface'],  // no-op
];

// Second pass: hover-specific replacements (must come after text replacements)
const hoverReplacements = [
  ['hover:text-white', 'hover:text-textPrimary'],
  ['hover:bg-white/5', 'hover:bg-surface'],
  ['hover:bg-white/8', 'hover:bg-surface'],
  ['hover:bg-white/10', 'hover:bg-surface'],
  ['hover:border-white/10', 'hover:border-borderColor'],
  ['hover:border-white/15', 'hover:border-borderColor'],
];

// Patterns that should NOT be replaced (keep intentional text-white on colored bg)
// We'll handle this by doing replacements then fixing back known patterns

const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;

  // Apply bg/border/divide replacements
  replacements.forEach(([from, to]) => {
    content = content.split(from).join(to);
  });

  // Apply hover replacements
  hoverReplacements.forEach(([from, to]) => {
    content = content.split(from).join(to);
  });

  // Fix back: text-black should stay text-black (not caught by our replacements)
  // Fix back: status badges with colored bg should keep white text
  // 'bg-yellow-500 text-textPrimary' should stay for active tabs -> actually this is bg-yellow + text-black originally
  // Fix: 'bg-red-500 text-textPrimary' -> 'bg-red-500 text-white' (badges need white text on colored bg)
  content = content.replace(/bg-(red|green|emerald|blue|cyan|purple|orange)-500 text-textPrimary/g, 'bg-$1-500 text-white');
  // Fix: button with bg-yellow-500 text-textPrimary -> bg-yellow-500 text-black  
  content = content.replace(/bg-yellow-500 text-textPrimary/g, 'bg-yellow-500 text-black');
  content = content.replace(/bg-yellow-400 text-textPrimary/g, 'bg-yellow-400 text-black');
  // Fix: 'bg-accentBlue text-textPrimary' -> 'bg-accentBlue text-black'
  content = content.replace(/bg-accentBlue text-textPrimary/g, 'bg-accentBlue text-black');
  // Fix: Timeline dot icons should stay white on colored dot
  content = content.replace(/className="text-textPrimary"(\s*\/?>)\s*<\/Icon/g, 'className="text-white"$1</Icon');

  if (content !== original) {
    fs.writeFileSync(fp, content);
    console.log('UPDATED:', f);
  } else {
    console.log('SKIP:', f);
  }
});

console.log('Done!');
