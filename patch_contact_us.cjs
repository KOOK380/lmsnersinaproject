const fs = require('fs');
const content = fs.readFileSync('src/pages/ContactUs.tsx', 'utf8');

const updatedContent = content
  .replace('const siteImagesStr = settings.find((s:any) => s.key === \'SITE_IMAGES\')?.value;', 'const siteImagesStr = settings.find((s:any) => s.key === \'SITE_IMAGES\')?.value;\n  const contactInfoStr = settings.find((s:any) => s.key === \'CONTACT_INFO\')?.value;\n  const contactInfo = contactInfoStr ? JSON.parse(contactInfoStr) : null;')
  .replace('<p className="text-slate-600" dir="ltr">+971 55 780 0863</p>', '<p className="text-slate-600" dir="ltr">{contactInfo?.phone || \'+971 55 780 0863\'}</p>')
  .replace('<p className="text-slate-600" dir="ltr">info@nesrinaconsultancy.com</p>', '<p className="text-slate-600" dir="ltr">{contactInfo?.email || \'info@nesrinaconsultancy.com\'}</p>')
  .replace('<p className="text-slate-600">{t(\'footer.location\', \'Abu Dubai, United Arab Emirates\')}</p>', '<p className="text-slate-600">{contactInfo?.location || t(\'footer.location\', \'Abu Dubai, United Arab Emirates\')}</p>');

fs.writeFileSync('src/pages/ContactUs.tsx', updatedContent);
