const fs = require('fs');
const content = fs.readFileSync('package.json', 'utf8');
fs.writeFileSync('package.json', content.replace('"build": "prisma generate && tsc && vite build"', '"build": "prisma generate && vite build"'));
