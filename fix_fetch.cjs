const fs = require('fs');
let code = fs.readFileSync('src/pages/FrontPages.tsx', 'utf8');

// Replace `.then(r => r.json()).then(setCourses);` with `.then(r => r.json()).then(setCourses).catch(console.error);`
code = code.replace(/\.then\(set([A-Za-z]+)\);/g, '.then(set$1).catch(console.error);');
code = code.replace(/\.then\(\(res\) => {\n(.*?)setCourse\(res\);\n(.*?)}\);/gs, '.then((res) => {\n$1setCourse(res);\n$2}).catch(console.error);');
code = code.replace(/\.then\(res => \{\s*setCourse\(res\);\s*if \(res && res.price === 0 && res.memberships\?\.length > 0\) \{\s*setSelectedOption\(res\.memberships\[0\]\.id\);\s*\}\s*\}\)/g, '.then(res => {\n         setCourse(res);\n         if (res && res.price === 0 && res.memberships?.length > 0) {\n            setSelectedOption(res.memberships[0].id);\n         }\n      }).catch(console.error)');

// Replace fetch("/api/dashboard"...).then...then(res => {...}); with catch
code = code.replace(/fetch\("\/api\/dashboard"[\s\S]*?then\(res => \{[\s\S]*?setDashboardData\(res\);\s*\}\s*\}\)/g, `$&.catch(console.error)`);

code = code.replace(/fetch\(`\/api\/memberships\/\$\{id\}`\)[\s\S]*?then\(m => \{[\s\S]*?setMembership\(m\);\s*\}\)/g, `$&.catch(console.error)`);

fs.writeFileSync('src/pages/FrontPages.tsx', code);
