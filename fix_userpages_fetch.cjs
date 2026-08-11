const fs = require('fs');
let code = fs.readFileSync('src/pages/UserPages.tsx', 'utf8');

code = code.replace(/fetch\("\/api\/dashboard"[\s\S]*?then\(res => \{\s*setDashboardData\(res\);\s*\}\)/g, `$&.catch(console.error)`);

fs.writeFileSync('src/pages/UserPages.tsx', code);
