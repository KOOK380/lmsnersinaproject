const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const updatedContent = content
  .replace('const [socialLinks, setSocialLinks] = useState({ instagram: \'\', tiktok: \'\', youtube: \'\', linkedin: \'\' });', 'const [socialLinks, setSocialLinks] = useState({ instagram: \'\', tiktok: \'\', youtube: \'\', linkedin: \'\' });\n  const [contactInfo, setContactInfo] = useState({ whatsapp: \'\', telegram: \'\', phone: \'\', email: \'\', location: \'\' });')
  .replace('const sSocial = data.find((s:any) => s.key === \'SOCIAL_LINKS\');', 'const sSocial = data.find((s:any) => s.key === \'SOCIAL_LINKS\');\n          const sContactInfo = data.find((s:any) => s.key === \'CONTACT_INFO\');')
  .replace('if(sSocial) setSocialLinks(JSON.parse(sSocial.value));', 'if(sSocial) setSocialLinks(JSON.parse(sSocial.value));\n          if(sContactInfo) setContactInfo(JSON.parse(sContactInfo.value));');

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', updatedContent);
