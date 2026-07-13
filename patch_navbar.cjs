const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const updatedContent = content
  .replace('const designSettingStr = settings?.find((s:any) => s.key === \'EMAIL_DESIGN\')?.value;', 'const designSettingStr = settings?.find((s:any) => s.key === \'EMAIL_DESIGN\')?.value;\n  const contactInfoStr = settings?.find((s:any) => s.key === \'CONTACT_INFO\')?.value;\n  const contactInfo = contactInfoStr ? JSON.parse(contactInfoStr) : null;')
  .replace('<span className="text-[15px] font-bold text-[#0f172a] tracking-tight" dir="ltr">{t(\'nav.phone\', \'+971 55 780 0863\')}</span>', '<span className="text-[15px] font-bold text-[#0f172a] tracking-tight" dir="ltr">{contactInfo?.phone || t(\'nav.phone\', \'+971 55 780 0863\')}</span>');

fs.writeFileSync('src/App.tsx', updatedContent);
