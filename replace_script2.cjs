const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf-8');

// Replace textarea for category description translations
content = content.replace(
  /<textarea placeholder="Description" rows={3} value={c\.description \|\| ''} onChange={e=>handleTranslationChange\(i, 'description', e\.target\.value\)} className="(.*?)" \/>/g,
  `<HtmlEditor placeholder="Description" rows={4} value={c.description || ''} onChange={val=>handleTranslationChange(i, 'description', val)} />`
);

// Lesson description
content = content.replace(
  /<textarea placeholder="Lesson description" rows={2} value={\(lesson\.translations \|\| \[\]\)\.find\(\(t: any\) => t\.languageCode === activeLangTab\)\?\.description \|\| ''} onChange=\{e=>\{([^}]*?)setFormData\(\{...formData, lessons: newLessons\}\);\s*\}\} className="(.*?)" \/>/,
  `<HtmlEditor placeholder="Lesson description" rows={4} value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.description || ''} onChange={val=>{
                                    const newLessons = [...formData.lessons];
                                    if (!newLessons[i].translations) newLessons[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' }));
                                    const transIndex = newLessons[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                                    if(transIndex !== -1) newLessons[i].translations[transIndex].description = val;
                                    setFormData({...formData, lessons: newLessons});
                                }} />`
);


fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
console.log("Replaced using Node!");
