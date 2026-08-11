const fs = require('fs');
let code = fs.readFileSync('src/pages/UserPages.tsx', 'utf8');

code = code.replace(/fetch\(\`\/api\/courses\/\$\{id\}\`\)\.then\(r => r\.json\(\)\)\.then\(data => \{\s*setCourse\(data\);\s*if \(data && data\.lessons && data\.lessons\.length > 0\) \{\s*setActiveLesson\(data\.lessons\[0\]\);\s*\}\s*\}\);/g, `fetch(\`/api/courses/\${id}\`).then(r => r.json()).then(data => {
       setCourse(data);
       if (data && data.lessons && data.lessons.length > 0) {
         setActiveLesson(data.lessons[0]);
       }
     }).catch(console.error);`);

fs.writeFileSync('src/pages/UserPages.tsx', code);
