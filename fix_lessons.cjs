const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const oldStr = `formData.lessons.map((lesson, i) => (
                   <div key={i} className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-3">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" placeholder="Lesson Title" value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.title || ''} onChange={e=>{
                               const newLessons = [...formData.lessons];
                               if (!newLessons[i].translations) newLessons[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' }));
                               const transIndex = newLessons[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                               if(transIndex !== -1) newLessons[i].translations[transIndex].title = e.target.value;
                               setFormData({...formData, lessons: newLessons});
                           }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                           <input type="text" placeholder="Duration" value={lesson.duration} onChange={e=>handleLessonChange(i, 'duration', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                       </div>
                       <MediaInput 
                         label="Video Content" 
                         type="video" 
                         value={lesson.videoUrl || ''} 
                         onChange={val => handleLessonChange(i, 'videoUrl', val)} 
                       />
                       <textarea placeholder="Description" rows={2} value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.description || ''} onChange={e=>{
                               const newLessons = [...formData.lessons];
                               if (!newLessons[i].translations) newLessons[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' }));
                               const transIndex = newLessons[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                               if(transIndex !== -1) newLessons[i].translations[transIndex].description = e.target.value;
                               setFormData({...formData, lessons: newLessons});
                       }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                   </div>
               ))`;

const newStr = `formData.lessons.map((lesson, i) => (
                   <details open={i === formData.lessons.length - 1} key={i} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3 group shadow-sm hover:shadow transition-shadow">
                       <summary className="font-bold text-slate-700 cursor-pointer select-none list-none flex justify-between items-center outline-none">
                          <span className="flex items-center gap-2">
                             <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">{i+1}</span>
                             <span>{(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.title || 'New Lesson'}</span>
                          </span>
                          <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                       </summary>
                       <div className="pt-3 space-y-3 border-t border-slate-200 mt-3">
                       <div className="grid grid-cols-1 sm:grid-cols-11 gap-4">
                            <div className="sm:col-span-8">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Lesson Title</label>
                                <input type="text" placeholder="Write lesson title" value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.title || ''} onChange={e=>{
                                   const newLessons = [...formData.lessons];
                                   if (!newLessons[i].translations) newLessons[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' }));
                                   const transIndex = newLessons[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                                   if(transIndex !== -1) newLessons[i].translations[transIndex].title = e.target.value;
                                   setFormData({...formData, lessons: newLessons});
                               }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration</label>
                                <input type="text" placeholder="e.g. 15m" value={lesson.duration} onChange={e=>handleLessonChange(i, 'duration', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                            </div>
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 hidden">Video Content</label>
                         <MediaInput 
                           label="Video Content" 
                           type="video" 
                           value={lesson.videoUrl || ''} 
                           onChange={val => handleLessonChange(i, 'videoUrl', val)} 
                         />
                       </div>
                       <div>
                           <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                           <textarea placeholder="Lesson description" rows={2} value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.description || ''} onChange={e=>{
                                   const newLessons = [...formData.lessons];
                                   if (!newLessons[i].translations) newLessons[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' }));
                                   const transIndex = newLessons[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                                   if(transIndex !== -1) newLessons[i].translations[transIndex].description = e.target.value;
                                   setFormData({...formData, lessons: newLessons});
                           }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm resize-y" />
                       </div>
                       </div>
                   </details>
               ))`;

c = c.replace(oldStr, newStr);
fs.writeFileSync('src/pages/AdminManagerComponents.tsx', c);
