const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const updatedContent = content
  .replace('const socialLinksStr = settings.find((s:any) => s.key === \'SOCIAL_LINKS\')?.value;', 'const socialLinksStr = settings.find((s:any) => s.key === \'SOCIAL_LINKS\')?.value;\n  const contactInfoStr = settings.find((s:any) => s.key === \'CONTACT_INFO\')?.value;\n  const contactInfo = contactInfoStr ? JSON.parse(contactInfoStr) : null;')
  .replace('<p className="text-slate-500 font-medium">{t(\'footer.location\', \'Abu Dubai, United Arab Emirates\')}</p>', '<p className="text-slate-500 font-medium">{contactInfo?.location || t(\'footer.location\', \'Abu Dubai, United Arab Emirates\')}</p>')
  .replace('<p className="text-slate-500 font-medium" dir="ltr">{t(\'footer.phone\', \'+971 55 780 0863\')}</p>', '<p className="text-slate-500 font-medium" dir="ltr">{contactInfo?.phone || t(\'footer.phone\', \'+971 55 780 0863\')}</p>')
  .replace('<a href="mailto:info@nesrinaconsultancy.com" className="font-bold text-slate-900 hover:text-primary transition break-words">info@nesrinaconsultancy.com</a>', '<a href={`mailto:${contactInfo?.email || \'info@nesrinaconsultancy.com\'}`} className="font-bold text-slate-900 hover:text-primary transition break-words">{contactInfo?.email || \'info@nesrinaconsultancy.com\'}</a>');

fs.writeFileSync('src/App.tsx', updatedContent);
