const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const updatedContent = content
  .replace(/\{categories\.filter\(\(c: any\) => c\.name\.toLowerCase\(\) !== 'membership' && c\.name\.toLowerCase\(\) !== 'memberships'\)\.map\(\(c: any\) => <option key=\{c\.id\} value=\{c\.id\}>\{c\.name\}<\/option>\)\}/g, '{getTranslated(categories, language).filter((c: any) => c.name.toLowerCase() !== \'membership\' && c.name.toLowerCase() !== \'memberships\').map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}');

fs.writeFileSync('src/App.tsx', updatedContent);
