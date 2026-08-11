const fs = require('fs');
let code = fs.readFileSync('src/pages/FrontPages.tsx', 'utf8');

// Replace fetch("/api/dashboard", ...).then(r => r.json()).then(res => { ... });
code = code.replace(/(\.then\(res => \{\s*if\(!res\.error\) setDashboardData\(res\);\s*\}\))/g, '$1.catch(console.error)');

// Replace fetch(`/api/courses/${id}`).then(r => r.json()).then(res => { ... });
code = code.replace(/(\.then\(res => \{\s*setCourse\(res\);\s*if \(res && res\.price === 0 && res\.memberships\?\.length > 0\) \{\s*setSelectedOption\(res\.memberships\[0\]\.id\);\s*\}\s*\}\))/g, '$1.catch(console.error)');

// Replace fetch(`/api/public/course-bundles`).then(r => r.json()).then(res => { ... });
code = code.replace(/(\.then\(res => \{\s*setCourseBundles\(res\);\s*\}\))/g, '$1.catch(console.error)');

// Replace fetch(`/api/memberships/${id}`).then(r => r.json()).then(m => { ... });
code = code.replace(/(\.then\(m => \{\s*setMembership\(m\);\s*if \(m && m\.price === 0\) \{\s*setSelectedEdition\(m\.editions\?\.\[0\]\?\.id\);\s*\}\s*\}\))/g, '$1.catch(console.error)');

fs.writeFileSync('src/pages/FrontPages.tsx', code);
