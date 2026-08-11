const fs = require('fs');

const filesToUpdate = ['src/App.tsx', 'src/pages/FrontPages.tsx', 'src/pages/UserPages.tsx'];

for (const file of filesToUpdate) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/fetch\("\/api\/events"\)/g, 'fetch("/api/events/active")');
  content = content.replace(/fetch\("\/api\/memberships"\)/g, 'fetch("/api/memberships/active")');
  fs.writeFileSync(file, content);
}
