import fs from 'fs';

const p = 'src/pages/FrontPages.tsx';
let c = fs.readFileSync(p, 'utf-8');

const badStartStr = `        {/* Right Column / Sidebar */}ny>(null);`;
const goodStartStr = `        {/* Right Column / Sidebar */}
        <div className="hidden lg:block lg:col-span-1">`;
const evtsStr = `export function Events() {`;

const startIdx = c.indexOf(badStartStr);
const goodStartIdx = c.indexOf(goodStartStr, startIdx + 1);

if (startIdx !== -1 && goodStartIdx !== -1) {
   // Wait, from goodStartIdx downwards is the valid rest of the file!
   // So we just want to remove everything from startIdx to goodStartIdx!
   const newContent = c.substring(0, startIdx) + c.substring(goodStartIdx);
   fs.writeFileSync(p, newContent);
   console.log("Fixed!");
} else {
   console.log("Strings not found", startIdx, goodStartIdx);
}
