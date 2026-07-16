const fs = require('fs');
const content = fs.readFileSync('src/pages/FrontPages.tsx', 'utf8');

const updatedContent = content
  .replace(/categories\.filter\(\(cat: any\) => cat\.type === 'COURSE'\)\.map\(cat => \(/g, 'getTranslated(categories, language).filter((cat: any) => cat.type === \'COURSE\').map((cat: any) => (')
  .replace(/categories\.filter\(\(cat: any\) => cat\.type === 'MEMBERSHIP'\)\.map\(cat => \(/g, 'getTranslated(categories, language).filter((cat: any) => cat.type === \'MEMBERSHIP\').map((cat: any) => (')
  .replace(/\{course\.category\.name\}/g, '{getTranslated(categories, language).find((c: any) => c.id === course.categoryId)?.name || course.category?.name}');

fs.writeFileSync('src/pages/FrontPages.tsx', updatedContent);
