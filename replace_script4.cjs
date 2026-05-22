const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf-8');

const t430_regex = /<textarea placeholder="Lesson description" rows=\{2\} value=\{\(lesson\.translations \|\| \[\]\)\.find\(\(t: any\) => t\.languageCode === activeLangTab\)\?\.description \|\| ''\} onChange=\{e=>\{[\s\S]*?setFormData\(\{\.\.\.formData, lessons: newLessons\}\);\s*\}\} className=".*?" \/>/;

const n430 = `<HtmlEditor placeholder="Lesson description" rows={4} value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.description || ''} onChange={val=>{
                                   const newLessons = [...formData.lessons];
                                   if (!newLessons[i].translations) newLessons[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' }));
                                   const transIndex = newLessons[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                                   if(transIndex !== -1) newLessons[i].translations[transIndex].description = val;
                                   setFormData({...formData, lessons: newLessons});
                           }} />`;

content = content.replace(t430_regex, n430);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
console.log("Replaced using Node!");
