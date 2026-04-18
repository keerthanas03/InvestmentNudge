import fs from 'fs';
import path from 'path';

const pagesDir = 'artifacts/spendwise-ai/src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find occurrences of motion.div with basic initial animations and make them bouncy
  content = content.replace(/initial=\{\{\s*opacity:\s*0,\s*y:\s*20\s*\}\}(.*?animate=\{\{.*?\}\})/g, 'initial={{ opacity: 0, y: 100, scale: 0.95 }}$1 transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}');
  
  // Replace missing scale on animate if needed
  content = content.replace(/(initial=\{\{\s*opacity:\s*0,\s*y:\s*100,\s*scale:\s*0\.95\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*y:\s*0)\s*\}\}/g, '$1, scale: 1 }}');

  // Let's also find initial={{ opacity: 0, scale: 0.9x }}
  content = content.replace(/initial=\{\{\s*opacity:\s*0,\s*scale:\s*0\.9[058]\s*\}\}/g, 'initial={{ opacity: 0, y: 100, scale: 0.95 }}');

  // Update headers (y: -20 to y: -20 with smooth easing - actually wait, a rise effect on headers might be cool, or just let them be, we'll focus on the cards)
  
  fs.writeFileSync(filePath, content, 'utf8');
}

console.log("Updated animations.");
