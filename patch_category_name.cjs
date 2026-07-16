const fs = require('fs');
const content = fs.readFileSync('src/pages/FrontPages.tsx', 'utf8');

const updatedContent = content
  .replace(/\{course\.category\?\.name \|\| 'Uncategorized'\}/g, '{getTranslated(categories, language).find((c: any) => c.id === course.categoryId)?.name || course.category?.name || \'Uncategorized\'}');

fs.writeFileSync('src/pages/FrontPages.tsx', updatedContent);
