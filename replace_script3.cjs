const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf-8');

const t2430 = `<textarea placeholder="Description" rows={3} value={c.description || ''} onChange={e=>handleTranslationChange(i, 'description', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />`;

const n2430 = `<HtmlEditor placeholder="Description" rows={4} value={c.description || ''} onChange={val=>handleTranslationChange(i, 'description', val)} />`;

content = content.replace(t2430, n2430);

const t430 = `<textarea placeholder="Lesson description" rows={2} value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.description || ''} onChange={e=>{
                                   const newLessons = [...formData.lessons];
                                   if (!newLessons[i].translations) newLessons[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' }));
                                   const transIndex = newLessons[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                                   if(transIndex !== -1) newLessons[i].translations[transIndex].description = e.target.value;
                                   setFormData({...formData, lessons: newLessons});
                           }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm resize-y" />`;

const n430 = `<HtmlEditor placeholder="Lesson description" rows={4} value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.description || ''} onChange={val=>{
                                   const newLessons = [...formData.lessons];
                                   if (!newLessons[i].translations) newLessons[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' }));
                                   const transIndex = newLessons[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                                   if(transIndex !== -1) newLessons[i].translations[transIndex].description = val;
                                   setFormData({...formData, lessons: newLessons});
                           }} />`;

content = content.replace(t430, n430);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
console.log("Replaced using Node!");
