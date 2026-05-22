const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf-8');

// Replace textarea for Lesson Description
content = content.replace(
  /<textarea placeholder="Lesson description" rows={2} value={\(lesson\.translations \|\| \[\]\)\.find\(\(t: any\) => t\.languageCode === activeLangTab\)\?\.description \|\| ''} onChange={e=>\{([\s\S]*?)setFormData\(\{...formData, lessons: newLessons\}\);\s*\}\} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500\/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm resize-y" \/>/g,
  `<HtmlEditor placeholder="Lesson description" rows={4} value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.description || ''} onChange={val=>{
$1if(transIndex !== -1) newLessons[i].translations[transIndex].description = val;
                                  else newLessons[i].translations.push({ languageCode: activeLangTab, title: '', description: val });
                                  setFormData({...formData, lessons: newLessons});
                          }} />`
).replace('if(transIndex !== -1) newLessons[i].translations[transIndex].description = e.target.value;', '');

// Replace textarea for general Description (like Categories / etc)
content = content.replace(
  /<textarea placeholder="Description" rows={3} value={c\.description \|\| ''} onChange={e=>handleTranslationChange\(i, 'description', e\.target\.value\)} className="(.*?)" \/>/g,
  `<HtmlEditor placeholder="Description" rows={6} value={c.description || ''} onChange={val=>handleTranslationChange(i, 'description', val)} />`
);

// Replace textarea for Contents (like in Memberships)
content = content.replace(
  /<textarea placeholder="Description" rows={2} value={c\.description \|\| ''} onChange={e=>handleContentChange\(i, 'description', e\.target\.value\)} className="(.*?)" \/>/g,
  `<HtmlEditor placeholder="Description" rows={6} value={c.description || ''} onChange={val=>handleContentChange(i, 'description', val)} />`
);

// Replace textarea for Category Manager (main)
content = content.replace(
  /<input type="text" value={formData\.description} onChange={e=>setFormData\(\{...formData, description: e\.target\.value\}\)} className="(.*?)" \/>/g,
  `<HtmlEditor placeholder="Description" rows={4} value={formData.description} onChange={val=>setFormData({...formData, description: val})} />`
);


fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
console.log("Replaced using Node!");
