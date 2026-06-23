import fs from 'fs';
const lines = fs.readFileSync('./src/pages/AdminManagerComponents.tsx', 'utf8').split('\n');
const visible = lines.filter(line => line.match(/>[^<]*Course/i) || line.match(/["'](?:[^"']*)Course/i));
console.log(visible.slice(0, 30).join('\n'));
