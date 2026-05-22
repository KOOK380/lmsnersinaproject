const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

// Replace activeLangTab initializers
c = c.replace(/\(languages \|\| \[\]\)\.find\(\(l:any\) => l\.isActive\)\?\.code \|\| 'en'/g, 
  "(languages || []).find((l:any) => l.isDefault)?.code || (languages || []).find((l:any) => l.isActive)?.code || 'en'");

// Replace tab texts
c = c.replace(/\{lang\.name\}(?!\s*\{lang\.isDefault)/g, "{lang.name}{lang.isDefault ? ' (Default)' : ''}");

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', c);
