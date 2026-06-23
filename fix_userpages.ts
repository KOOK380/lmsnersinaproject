import fs from 'fs';
const lines = fs.readFileSync('./src/pages/UserPages.tsx', 'utf8').split('\n');
const visible = lines.filter(line => line.toLowerCase().includes('course'));
console.log(visible.slice(0, 30).join('\n'));
