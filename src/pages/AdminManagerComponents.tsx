import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { defaultAboutUsHtml } from "./AboutUs";
import { formatCurrency } from "../lib/utils";
import { Plus, Settings, Trash2, X, BookOpen, ExternalLink } from "lucide-react";
import { Editor } from '@tinymce/tinymce-react';
import { MediaInput } from "../components/MediaInput";

function DeleteButton({ onDelete, className = "text-xs font-bold text-red-500 uppercase tracking-wide cursor-pointer" }: { onDelete: () => void, className?: string }) {
  const [asking, setAsking] = useState(false);
  if (asking) {
    return (
      <span className="flex gap-2 items-center">
        <span className="text-xs text-red-600 font-bold uppercase mr-1">Sure?</span>
        <button onClick={() => { setAsking(false); onDelete(); }} className="text-xs font-bold bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors cursor-pointer">YES</button>
        <button onClick={() => setAsking(false)} className="text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded transition-colors cursor-pointer">NO</button>
      </span>
    );
  }
  return <button type="button" className={className} onClick={(e) => { e.preventDefault(); setAsking(true); }}>Delete</button>
}

function HtmlEditor({ value, onChange, placeholder, rows = 5 }: { value: string, onChange: (val: string) => void, placeholder?: string, rows?: number }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
      <Editor
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6.8.3/tinymce.min.js"
        value={value}
        onEditorChange={(newValue) => onChange(newValue)}
        init={{
          height: rows * 40 + 100,
          menubar: false,
          placeholder: placeholder,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | code | help',
          content_style: 'body { font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif; font-size:14px }',
          promotion: false,
        }}
      />
    </div>
  );
}

export const generateMeetLink = async (formData: any, setFormData: any) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/generate-meet", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
         summary: formData.title || formData.label || "Live Class",
         startDateTime: formData.meetingDate ? new Date(formData.meetingDate).toISOString() : new Date().toISOString()
      })
    });
    const data = await res.json();
    if (res.ok) {
       setFormData({ ...formData, meetingLink: data.meetLink });
    } else {
       alert(data.error || "Failed to generate link");
    }
  } catch(e: any) {
    alert(e.message);
  }
};

export function CourseManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const { user, token, categories, setCategories, currency, languages, settings } = useStore();
  const meetEnabledSetting = settings.find((s:any) => s.key === 'GOOGLE_MEET_ENABLED')?.value;
  const meetEnabled = meetEnabledSetting ? JSON.parse(meetEnabledSetting).enabled : true;
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState((languages || []).find((l:any) => l.isDefault)?.code || (languages || []).find((l:any) => l.isActive)?.code || 'en');
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    price: 0, 
    realPrice: 0,
    expiryDate: '',
    imageUrl: '', 
    bannerVideoUrl: '',
    instructorId: '',
    categoryId: '',
    membershipIds: [] as string[],
    labels: [] as string[],
    lessons: [] as any[],
    editions: [] as any[],
    isFeatured: false,
    isUpcoming: false,
    isActive: true,
    language: 'Arabic',
    level: 'Beginner Level',
    duration: '21 Days',
    meetingLink: '', meetingDate: '', meetingNotes: '', notifyEnrolled: false,
    translations: [] as any[]
  });

  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(setCourses).catch(()=>{});
    fetch("/api/instructors").then(r => r.json()).then(setInstructors).catch(()=>{});
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(()=>{});
    fetch("/api/memberships").then(r => r.json()).then(setMemberships).catch(()=>{});
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setCourses(courses.filter(c => c.id !== id));
  };

  const handleEdit = async (courseId: string) => {
    const courseToEdit = courses.find(c => c.id === courseId);
    if (!courseToEdit) return;

    // fetch full course details to get lessons
    const res = await fetch(`/api/courses/${courseId}`);
    const fullCourse = await res.json();
    
    const mergedContents = languages.filter((l:any) => l.isActive).map((lang: any) => {
      const existing = (fullCourse.translations || []).find((c: any) => c.languageCode === lang.code);
      if (existing) return existing;
      return { languageCode: lang.code, title: '', description: '' };
    });

    setEditId(courseId);
    setFormData({
      title: fullCourse.title || '',
      description: fullCourse.description || '',
      price: fullCourse.price || 0,
      realPrice: fullCourse.realPrice || 0,
      expiryDate: fullCourse.expiryDate ? new Date(fullCourse.expiryDate).toISOString().slice(0,16) : '',
      imageUrl: fullCourse.imageUrl || '',
      bannerVideoUrl: fullCourse.bannerVideoUrl || '',
      instructorId: fullCourse.instructorId || '',
      categoryId: fullCourse.categoryId || '',
      membershipIds: fullCourse.memberships?.map((m:any) => m.id) || [],
      isFeatured: fullCourse.isFeatured || false,
      isUpcoming: fullCourse.isUpcoming || false,
      isActive: fullCourse.isActive ?? true,
      language: fullCourse.language || 'Arabic',
      level: fullCourse.level || 'Beginner Level',
      duration: fullCourse.duration || '21 Days',
      meetingLink: fullCourse.meetingLink || '',
      meetingDate: fullCourse.meetingDate ? new Date(fullCourse.meetingDate).toISOString().slice(0,16) : '',
      meetingNotes: fullCourse.meetingNotes || '',
      notifyEnrolled: false,
      labels: fullCourse.labels || [],
      translations: mergedContents,
      lessons: fullCourse.lessons?.map((l:any) => ({
         title: l.title,
         videoUrl: l.videoUrl || '',
         content: l.content || '',
         description: l.description || '',
         duration: l.duration || '',
         showAboutCourse: l.showAboutCourse !== undefined ? l.showAboutCourse : true,
         order: l.order,
         translations: languages.filter((lang:any) => lang.isActive).map((lang: any) => {
             const existing = (l.translations || []).find((c: any) => c.languageCode === lang.code);
             return existing || { languageCode: lang.code, title: '', description: '' };
         })
      })) || [],
      editions: fullCourse.editions?.map((e:any) => ({
        title: e.title,
        content: e.content || '',
        mode: e.mode || '',
        date: e.date ? new Date(e.date).toISOString().slice(0,16) : '',
        totalSeats: e.totalSeats || '',
        availableSeats: e.availableSeats || '',
        translations: languages.filter((lang:any) => lang.isActive).map((lang: any) => {
             const existing = (e.translations || []).find((c: any) => c.languageCode === lang.code);
             return existing || { languageCode: lang.code, title: '', content: '' };
        })
      })) || []
    });
    setShowAdd(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    const initialContents = languages.filter((l:any) => l.isActive).map((lang: any) => ({
      languageCode: lang.code, title: '', description: ''
    }));

    setFormData({ 
      title: '', 
      description: '', 
      price: 0, 
      realPrice: 0,
      expiryDate: '',
      imageUrl: '', 
      bannerVideoUrl: '',
      instructorId: '', 
      categoryId: '',
      membershipIds: [],
      labels: [],
      lessons: [],
      editions: [],
      isFeatured: false,
      isUpcoming: false,
      isActive: true,
      language: 'Arabic',
      level: 'Beginner Level',
      duration: '21 Days',
      meetingLink: '', meetingDate: '', meetingNotes: '', notifyEnrolled: false,
      translations: initialContents
    });
  };

  const handleTranslationChange = (index: number, field: string, value: string) => {
    const newTranslations = [...formData.translations];
    newTranslations[index] = { ...newTranslations[index], [field]: value };
    setFormData({ ...formData, translations: newTranslations });
  };

  const handleAdd = async () => {
    let method = "POST";
    let url = "/api/admin/courses";
    if (editId) {
      method = "PUT";
      url = `/api/admin/courses/${editId}`;
    }

    try {
      console.log("Saving course...", url, formData);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({...formData, price: Number(formData.price)})
      });
      
      console.log("Save response status:", res.status);
      if (!res.ok) {
        const data = await res.json();
        console.error("Save error data:", data);
        alert(`Error: ${data.error || 'Failed to save'}`);
        return;
      }
      
      // Just refresh
      fetch("/api/courses").then(r => r.json()).then(setCourses).catch(()=>{});
      setShowAdd(false);
      setEditId(null);
      resetForm();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleLessonChange = (index: number, field: string, value: string | boolean) => {
    const newLessons = [...formData.lessons];
    newLessons[index] = { ...newLessons[index], [field]: value };
    setFormData({ ...formData, lessons: newLessons });
  };

  const handleEditionChange = (index: number, field: string, value: string | number) => {
    const newEditions = [...formData.editions];
    newEditions[index] = { ...newEditions[index], [field]: value };
    setFormData({ ...formData, editions: newEditions });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Manage Courses</h2>
          <button onClick={()=>{
             if (showAdd) {
               setShowAdd(false);
               setEditId(null);
               resetForm();
             } else {
               resetForm();
               setShowAdd(true);
             }
          }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">{showAdd ? "Cancel" : "+ New Course"}</button>
      </div>

      {showAdd && (
        <div className="mb-10 p-8 border border-slate-200 rounded-2xl bg-slate-50 shadow-inner">
           <h3 className="text-lg font-bold text-slate-800 mb-6">{editId ? 'Edit Course' : 'Add New Course'}</h3>                

           {/* Central Tabs navigation */}
           <div className="flex bg-slate-100/50 p-1 rounded-lg mb-6 gap-1 w-full max-w-full overflow-x-auto hidden-scrollbar">
                 {languages.filter((l:any) => l.isActive).map((lang: any) => (
                   <button
                     key={lang.code}
                     type="button"
                     onClick={() => setActiveLangTab(lang.code)}
                     className={`px-4 py-2 text-sm font-semibold transition-all rounded-md px-3 py-1.5 ${activeLangTab === lang.code ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     {lang.name}{lang.isDefault ? ' (Default)' : ''}
                   </button>
                 ))}
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">System Title</label>
                 <input type="text" placeholder="Course Title (Internal)" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
              </div>
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Translated Title ({languages?.find((l:any) => l.code === activeLangTab)?.name || activeLangTab})</label>
                 {formData.translations.map((c, i) => {
                     if (c.languageCode !== activeLangTab) return null;
                     return (
                         <input key={i} type="text" placeholder="Translated Course Title" value={c.title || ''} onChange={e=>handleTranslationChange(i, 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                     );
                 })}
              </div>
           </div>
           
           <div className="flex items-center gap-6 pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" className="w-4 h-4 accent-indigo-600 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" checked={formData.isFeatured} onChange={e=>setFormData({...formData, isFeatured: e.target.checked})} />
                   <span className="text-sm font-medium text-slate-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" className="w-4 h-4 accent-indigo-600 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" checked={formData.isUpcoming} onChange={e=>setFormData({...formData, isUpcoming: e.target.checked})} />
                   <span className="text-sm font-medium text-slate-700">Coming Soon</span>
                </label>
           </div>
           
           <div className="space-y-2 mt-4">
               <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Description</label>
               {formData.translations.map((c, i) => {
                     if (c.languageCode !== activeLangTab) return null;
                     return (
                     <div key={i}>
                       <HtmlEditor placeholder="Course Description" rows={6} value={c.description || ''} onChange={val => handleTranslationChange(i, 'description', val)} />
                     </div>
                     );
                 })}
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-4">
             <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Price</label>
                 <input type="number" value={formData.price} onChange={e=>setFormData({...formData, price: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
             </div>
             <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Real Price</label>
                 <input type="number" value={formData.realPrice || ''} onChange={e=>setFormData({...formData, realPrice: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
             </div>
             <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Expiry Date</label>
                 <input type="datetime-local" value={formData.expiryDate} onChange={e=>setFormData({...formData, expiryDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
             </div>
             <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Instructor</label>
                 <select value={formData.instructorId} onChange={e=>setFormData({...formData, instructorId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm">
                   <option value="">Select...</option>
                   {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                 </select>
             </div>
             <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Category</label>
                 <select value={formData.categoryId || ''} onChange={e=>setFormData({...formData, categoryId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm">
                   <option value="">Select...</option>
                   {categories?.filter((c: any) => c.type === 'COURSE').map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Duration</label>
                <input type="text" placeholder="e.g. 21 Days" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
             </div>
             <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Language</label>
                <input type="text" placeholder="e.g. Arabic" value={formData.language} onChange={e=>setFormData({...formData, language: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
             </div>
             <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Level</label>
                 <input type="text" placeholder="e.g. Beginner Level" value={formData.level || ''} onChange={e=>setFormData({...formData, level: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
              </div>
              <div className="space-y-2 mt-4 col-span-1 md:col-span-3">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Labels (Comma Separated)</label>
                <input type="text" placeholder="e.g. Best Seller, New, Featured" value={(formData.labels || []).join(', ')} onChange={e => setFormData({...formData, labels: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
             </div>
           </div>

           <MediaInput 
             label="Banner Image" 
             type="image" 
             value={formData.imageUrl} 
             onChange={val => setFormData({ ...formData, imageUrl: val })} 
             className="mt-4"
           />
           <MediaInput 
             label="Banner Video (Optional)" 
             type="video" 
             value={formData.bannerVideoUrl} 
             onChange={val => setFormData({ ...formData, bannerVideoUrl: val })} 
             className="mt-4"
           />

           <div className="border border-slate-200 p-6 rounded-2xl bg-white mt-4 space-y-4">
               <div className="flex justify-between items-center mb-0">
                   <h4 className="font-bold text-sm text-slate-800">Included in Memberships</h4>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                 {memberships.map((m: any) => (
                   <label key={m.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.membershipIds.includes(m.id) ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                     <input 
                        type="checkbox" 
                        checked={formData.membershipIds.includes(m.id)} 
                        onChange={e => {
                          if (e.target.checked) setFormData({ ...formData, membershipIds: [...formData.membershipIds, m.id] });
                          else setFormData({ ...formData, membershipIds: formData.membershipIds.filter((id: string) => id !== m.id) });
                        }} 
                        className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 flex-shrink-0" 
                     />
                     <span className="text-sm font-medium text-slate-700 leading-snug break-words whitespace-normal">{m.contents?.[0]?.title || m.label || m.type}</span>
                   </label>
                 ))}
               </div>
           </div>

           <div className="border border-slate-200 p-6 rounded-2xl bg-white mt-4 space-y-4">
               <div className="flex justify-between items-center">
                   <h4 className="font-bold text-sm text-slate-800">Lessons ({formData.lessons.length})</h4>
                   <button type="button" onClick={() => setFormData({...formData, lessons: [...formData.lessons, { title: '', videoUrl: '', content: '', description: '', duration: '', showAboutCourse: true, order: formData.lessons.length + 1, translations: languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' })) }]})} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold">+ Add Lesson</button>
               </div>
               
               {formData.lessons.map((lesson, i) => (
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
                           <HtmlEditor placeholder="Lesson description" rows={4} value={(lesson.translations || []).find((t: any) => t.languageCode === activeLangTab)?.description || ''} onChange={val=>{
                                   const newLessons = [...formData.lessons];
                                   if (!newLessons[i].translations) newLessons[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '', description: '' }));
                                   const transIndex = newLessons[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                                   if(transIndex !== -1) newLessons[i].translations[transIndex].description = val;
                                   setFormData({...formData, lessons: newLessons});
                           }} />
                       </div>
                       </div>
                   </details>
               ))}
               </div>

               {/* Editions UI */}
               <div className="border border-slate-200 p-6 rounded-2xl bg-white mt-4">
               <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold text-sm text-slate-800">Editions / Batches ({formData.editions?.length || 0})</h4>
                   <button type="button" onClick={() => setFormData({...formData, editions: [...formData.editions, { title: '', content: '', date: '', mode: 'Online', totalSeats: '', availableSeats: '', translations: languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '' })) }]})} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold">+ Add Edition</button>
               </div>
               
               {formData.editions?.map((edition, i) => (
                   <details open={i === (formData.editions.length - 1)} key={i} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-3 mb-3 relative group">
                       <summary className="font-bold text-slate-700 cursor-pointer select-none list-none flex justify-between items-center outline-none">
                          <span className="flex items-center gap-2">
                             <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">{i+1}</span>
                             <span>{edition.title || 'New Edition'}</span>
                          </span>
                       </summary>
                       <div className="pt-2 border-t border-slate-200 mt-2">
                       <button type="button" onClick={() => setFormData({...formData, editions: formData.editions.filter((_, idx) => idx !== i)})} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><X size={16} /></button>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">System Edition Title</label>
                                <input type="text" placeholder="e.g. Edition 01 - Sep 2026" value={edition.title} onChange={e=>handleEditionChange(i, 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Translated Title ({languages?.find((l:any) => l.code === activeLangTab)?.name || activeLangTab})</label>
                                <input type="text" placeholder="e.g. Fall 2026 Batch" value={(edition.translations || []).find((t: any) => t.languageCode === activeLangTab)?.title || ''} onChange={e=>{
                                   const newEditions = [...formData.editions];
                                   if (!newEditions[i].translations) newEditions[i].translations = languages.filter((l:any) => l.isActive).map((l: any) => ({ languageCode: l.code, title: '' }));
                                   const transIndex = newEditions[i].translations.findIndex((t: any) => t.languageCode === activeLangTab);
                                   if(transIndex !== -1) newEditions[i].translations[transIndex].title = e.target.value;
                                   setFormData({...formData, editions: newEditions});
                               }} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date & Time</label>
                                <input type="datetime-local" value={edition.date} onChange={e=>handleEditionChange(i, 'date', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Total Seats</label>
                                <input type="number" placeholder="e.g. 20" value={edition.totalSeats} onChange={e=>handleEditionChange(i, 'totalSeats', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Available Seats</label>
                                <input type="number" placeholder="e.g. 20" value={edition.availableSeats} onChange={e=>handleEditionChange(i, 'availableSeats', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location / Mode</label>
                                <input type="text" placeholder="e.g. Online Platform" value={edition.mode} onChange={e=>handleEditionChange(i, 'mode', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Edition Details / Content</label>
                                <textarea rows={2} placeholder="Edition specific content that will show up only if this edition is selected" value={edition.content} onChange={e=>handleEditionChange(i, 'content', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm resize-y" />
                            </div>
                       </div>
                       </div>
                   </details>
               ))}
               </div>

                       <div className="border border-slate-200 p-6 rounded-2xl bg-white mt-4 space-y-4">
               <div>
                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block"></span>Live Class Details / Google Meet (Optional)</h3>
                 <p className="text-xs text-slate-500">Provide meet link and schedules that will be available to all enrolled students for this course.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Meet Link</label>
                       {meetEnabled && (
                         <button type="button" onClick={() => generateMeetLink(formData, setFormData)} className="text-xs text-indigo-600 font-bold hover:underline">Auto Generate</button>
                       )}
                    </div>
                    <input type="text" value={formData.meetingLink || ''} onChange={e=>setFormData({...formData, meetingLink: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" placeholder="https://meet.google.com/xxx-xxxx-xxx"/>
                 </div>
                 <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Date & Time</label>
                    <input type="datetime-local" value={formData.meetingDate || ''} onChange={e=>setFormData({...formData, meetingDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm"/>
                 </div>
               </div>
               <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Meeting Notes / Instructions</label>
                  <textarea value={formData.meetingNotes || ''} onChange={e=>setFormData({...formData, meetingNotes: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" rows={2} placeholder="E.g., Please read chapter 1 before joining..."></textarea>
               </div>
            </div>
            <label className="flex items-center gap-2 mt-4 text-sm font-medium text-slate-800">
              <input type="checkbox" checked={formData.notifyEnrolled || false} onChange={e=>setFormData({...formData, notifyEnrolled: e.target.checked})} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              Send email notification with meeting details to enrolled members
            </label>
            <button onClick={handleAdd} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold w-full mt-8 hover:bg-indigo-700 transition text-lg">Save Course</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 rounded-l-xl">Title</th>
                <th className="p-4">Price</th>
                <th className="p-4">Category</th>
                <th className="p-4">Instructor</th>
                <th className="p-4">Status</th>
                <th className="p-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.length === 0 ? (
                 <tr><td colSpan={6} className="py-12 text-center text-slate-400">No courses found.</td></tr>
              ) : courses.map(course => (
                <tr key={course.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-semibold text-slate-800"><div className="flex items-center gap-2">{course.title}{course.isFeatured && <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">Featured</span>}</div></td>
                  <td className="p-4 text-indigo-600 font-bold">{formatCurrency(course.price, currency)}</td>
                  <td className="p-4 text-slate-600">{course.category?.name || 'Uncategorized'}</td>
                  <td className="p-4 text-slate-600">{course.instructor?.name || 'Unassigned'}</td>
                  <td className="p-4 flex flex-col gap-1 items-start">
                     <button onClick={async () => {
                       const res = await fetch(`/api/admin/courses/${course.id}`, {
                         method: 'PUT',
                         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                         body: JSON.stringify({ isActive: !course.isActive })
                       });
                       if(res.ok) fetch("/api/courses").then(r => r.json()).then(setCourses).catch(()=>{});
                     }} className={`px-2.5 py-0.5 rounded border text-[10px] uppercase tracking-widest font-bold transition-colors ${course.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>
                       {course.isActive ? 'Active' : 'Disabled'}
                     </button>
                     <button onClick={async () => {
                       const res = await fetch(`/api/admin/courses/${course.id}`, {
                         method: 'PUT',
                         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                         body: JSON.stringify({ isFeatured: !course.isFeatured })
                       });
                       if(res.ok) fetch("/api/courses").then(r => r.json()).then(setCourses).catch(()=>{});
                     }} className={`px-2.5 py-0.5 rounded border text-[10px] uppercase tracking-widest font-bold transition-colors ${course.isFeatured ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>
                       {course.isFeatured ? 'Featured' : 'Not Featured'}
                     </button>
                     <button onClick={async () => {
                       const res = await fetch(`/api/admin/courses/${course.id}`, {
                         method: 'PUT',
                         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                         body: JSON.stringify({ isUpcoming: !course.isUpcoming })
                       });
                       if(res.ok) fetch("/api/courses").then(r => r.json()).then(setCourses).catch(()=>{});
                     }} className={`px-2.5 py-0.5 rounded border text-[10px] uppercase tracking-widest font-bold transition-colors ${course.isUpcoming ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>
                       {course.isUpcoming ? 'Coming Soon' : 'Available'}
                     </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(course.id)} className="text-indigo-600 font-semibold text-xs border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors">Edit</button>
                    <DeleteButton onDelete={() => handleDelete(course.id)} className="text-red-600 font-semibold text-xs border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export function CourseBundlesManager() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const { user, token, currency, languages } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState((languages || []).find((l:any) => l.isDefault)?.code || (languages || []).find((l:any) => l.isActive)?.code || 'en');
  
  const [formData, setFormData] = useState({
    title: '', description: '', price: 0, realPrice: 0, imageUrl: '', bannerVideoUrl: '',
    isActive: true, isFeatured: false,
    courses: [] as string[],
    translations: (languages || []).map((lang: any) => ({
      languageCode: lang.code, title: '', description: ''
    }))
  });

  const fetchBundles = () => {
    fetch("/api/admin/course-bundles", { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(setBundles).catch(console.error);
    fetch("/api/courses", { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(setCourses).catch(console.error);
  };

  useEffect(() => {
    fetchBundles();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/admin/course-bundles/${editId}` : `/api/admin/course-bundles`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAdd(false);
        setEditId(null);
        fetchBundles();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (id: string) => {
    const fullBundle = bundles.find(b => b.id === id);
    if (!fullBundle) return;
    
    const initialTranslations = (languages || []).map((lang: any) => {
      const existing = (fullBundle.translations || []).find((t: any) => t.languageCode === lang.code);
      return existing || { languageCode: lang.code, title: '', description: '' };
    });

    setEditId(id);
    setFormData({
      title: fullBundle.title || '',
      description: fullBundle.description || '',
      price: fullBundle.price || 0,
      realPrice: fullBundle.realPrice || 0,
      imageUrl: fullBundle.imageUrl || '',
      bannerVideoUrl: fullBundle.bannerVideoUrl || '',
      isActive: fullBundle.isActive ?? true,
      isFeatured: fullBundle.isFeatured || false,
      courses: fullBundle.courses?.map((c: any) => c.courseId) || [],
      translations: initialTranslations
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/course-bundles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchBundles();
  };

  const handleTranslationChange = (code: string, field: string, value: string) => {
     setFormData(prev => ({
       ...prev,
       translations: prev.translations.map((t:any) => t.languageCode === code ? { ...t, [field]: value } : t)
     }));
  };

  if (showAdd) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 p-6 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">{editId ? 'Edit Course Bundle' : 'Create New Bundle'}</h2>
          <button onClick={() => { setShowAdd(false); setEditId(null); }} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
           {/* Translation Tabs */}
           <div className="flex gap-2 border-b border-slate-200 mb-6 pb-2">
             <button type="button" onClick={() => setActiveLangTab('en')} className={`px-4 py-2 font-bold text-sm tracking-wide transition-colors ${activeLangTab === 'en' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Primary (Fallback)</button>
             {languages?.filter((l:any) => l.isActive).map((lang: any) => (
                <button type="button" key={lang.code} onClick={() => setActiveLangTab(lang.code)} className={`px-4 py-2 font-bold text-sm tracking-wide transition-colors ${activeLangTab === lang.code ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                  {lang.name}
                </button>
             ))}
           </div>

           {activeLangTab === 'en' ? (
             <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bundle Name *</label>
                   <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-medium text-slate-800" placeholder="e.g. Masterclass Bundle" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                   <HtmlEditor placeholder="Bundle description" rows={6} value={formData.description} onChange={val => setFormData({ ...formData, description: val })} />
                 </div>
               </div>
               <div className="space-y-4 lg:col-span-1">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Offer Price ({currency}) *</label>
                     <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-bold text-indigo-700" />
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Real Price (Optional)</label>
                     <input type="number" step="0.01" value={formData.realPrice || ''} onChange={e => setFormData({ ...formData, realPrice: parseFloat(e.target.value) })} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-slate-100 focus:border-slate-400 transition-all text-slate-500 line-through" />
                   </div>
                 </div>

                 <MediaInput label="Banner Image" type="image" value={formData.imageUrl} onChange={val => setFormData({ ...formData, imageUrl: val })} className="mt-4" />
                 <MediaInput label="Banner Video (Optional)" type="video" value={formData.bannerVideoUrl} onChange={val => setFormData({ ...formData, bannerVideoUrl: val })} className="mt-4" />
               </div>
             </div>
           ) : (
             <div className="grid md:grid-cols-2 gap-6 pb-20">
               {languages?.filter((l:any) => l.isActive).map((lang: any) => {
                 if (activeLangTab !== lang.code) return null;
                 const t = formData.translations.find((x:any) => x.languageCode === lang.code) || { title: '', description: '' };
                 return (
                   <div key={lang.code} className="space-y-4 col-span-2">
                     <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">Provide translations for {lang.name}. If left blank, it will fallback to the Primary language.</p>
                     <div>
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bundle Name ({lang.name})</label>
                       <input type="text" value={t.title} onChange={e => handleTranslationChange(lang.code, 'title', e.target.value)} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-medium text-slate-800" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description ({lang.name})</label>
                       <HtmlEditor rows={6} value={t.description} onChange={val => handleTranslationChange(lang.code, 'description', val)} />
                     </div>
                   </div>
                 );
               })}
             </div>
           )}

           <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Included Courses</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                 {courses.map(course => (
                   <label key={course.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.courses.includes(course.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                     <input 
                        type="checkbox" 
                        checked={formData.courses.includes(course.id)} 
                        onChange={e => {
                          if (e.target.checked) setFormData({ ...formData, courses: [...formData.courses, course.id] });
                          else setFormData({ ...formData, courses: formData.courses.filter(id => id !== course.id) });
                        }} 
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                     />
                     <span className="text-sm font-medium text-slate-700 truncate">{course.title}</span>
                   </label>
                 ))}
              </div>
           </div>

          <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-slate-100">
            <button type="button" onClick={() => { setShowAdd(false); setEditId(null); }} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
              {editId ? 'Update Bundle' : 'Create Bundle'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100 p-6 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-800">Course Bundles ({bundles.length})</h2>
        <button onClick={() => {
          setEditId(null);
          setFormData({
            title: '', description: '', price: 0, realPrice: 0, imageUrl: '', bannerVideoUrl: '',
            isActive: true, isFeatured: false,
            courses: [],
            translations: (languages || []).map((lang: any) => ({
              languageCode: lang.code, title: '', description: ''
            }))
          });
          setShowAdd(true);
        }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2">
          <BookOpen size={16} /> Add Bundle
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16">Image</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bundle Info</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Included</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Price</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bundles.map((bundle) => (
                <tr key={bundle.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                     <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shadow-sm border border-slate-200/50">
                        {bundle.imageUrl ? <img src={bundle.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-slate-300" /></div>}
                     </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{bundle.title}</div>
                    <div className="text-xs text-slate-500 max-w-[200px] truncate">{bundle.description}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex py-1 px-2.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs">
                      {bundle.courses?.length || 0} courses
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700 hidden md:table-cell">
                    {formatCurrency(bundle.price, currency)}
                  </td>
                  <td className="p-4 space-x-2 hidden lg:table-cell">
                      <button onClick={async () => {
                        const res = await fetch(`/api/admin/course-bundles/${bundle.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ isActive: !bundle.isActive })
                        });
                        if(res.ok) fetchBundles();
                      }} className={`px-2.5 py-0.5 rounded border text-[10px] uppercase tracking-widest font-bold transition-colors ${bundle.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>
                        {bundle.isActive ? 'Active' : 'Disabled'}
                      </button>
                      <button onClick={async () => {
                        const res = await fetch(`/api/admin/course-bundles/${bundle.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ isFeatured: !bundle.isFeatured })
                        });
                        if(res.ok) fetchBundles();
                      }} className={`px-2.5 py-0.5 rounded border text-[10px] uppercase tracking-widest font-bold transition-colors ${bundle.isFeatured ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>
                        {bundle.isFeatured ? 'Featured' : 'Not Featured'}
                      </button>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(bundle.id)} className="text-indigo-600 font-semibold text-xs border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors">Edit</button>
                    <DeleteButton onDelete={() => handleDelete(bundle.id)} className="text-red-600 font-semibold text-xs border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export function InstructorManager() {
  const [instructors, setInstructors] = useState<any[]>([]);
  const { token } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', bio: '', email: '', imageUrl: '' });

  useEffect(() => {
    fetch("/api/instructors").then(r => r.json()).then(setInstructors).catch(()=>{});
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/instructors/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setInstructors(instructors.filter(c => c.id !== id));
  };

  const handleEdit = (instructor: any) => {
    setEditId(instructor.id);
    setFormData({
      name: instructor.name || '',
      bio: instructor.bio || '',
      email: instructor.email || '',
      imageUrl: instructor.imageUrl || ''
    });
    setShowAdd(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    let method = "POST";
    let url = "/api/instructors";
    if (editId) {
       method = "PUT";
       url = `/api/instructors/${editId}`;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (!res.ok) { alert("Failed to save instructor"); return; }
    const newInst = await res.json();
    
    if (editId) {
      setInstructors(instructors.map(i => i.id === editId ? newInst : i));
    } else {
      setInstructors([...instructors, newInst]);
    }
    
    setShowAdd(false);
    setEditId(null);
    setFormData({ name: '', bio: '', email: '', imageUrl: '' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Manage Instructors</h2>
          <button onClick={() => {
             if (showAdd) {
               setShowAdd(false);
               setEditId(null);
               setFormData({ name: '', bio: '', email: '', imageUrl: '' });
             } else {
               setFormData({ name: '', bio: '', email: '', imageUrl: '' });
               setShowAdd(true);
             }
          }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">{showAdd ? "Cancel" : "+ New Instructor"}</button>
      </div>

      {showAdd && (
        <div className="mb-10 p-8 border border-slate-200 rounded-2xl bg-slate-50 shadow-inner space-y-6">
           <h3 className="text-lg font-bold text-slate-800">{editId ? 'Edit Instructor' : 'Add New Instructor'}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Name</label>
                 <input type="text" placeholder="Name" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
              </div>
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                 <input type="text" placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
              </div>
           </div>
           
           <MediaInput 
             label="Profile Image" 
             type="image" 
             value={formData.imageUrl} 
             onChange={val => setFormData({ ...formData, imageUrl: val })} 
             className="mb-4"
           />
           
           <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Bio</label>
              <textarea placeholder="Bio" rows={4} value={formData.bio} onChange={e=>setFormData({...formData, bio: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
           </div>
           <button onClick={handleAdd} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold w-full hover:bg-indigo-700 transition">Save Instructor</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-4 rounded-l-xl">Name</th>
                <th className="p-4">Bio</th>
                <th className="p-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instructors.length === 0 ? (
                 <tr><td colSpan={3} className="py-12 text-center text-slate-400">No instructors found.</td></tr>
              ) : instructors.map(instructor => (
                <tr key={instructor.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-semibold text-slate-800 flex items-center gap-4">
                    {instructor.imageUrl && <img src={instructor.imageUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-100" />}
                    {instructor.name}
                  </td>
                  <td className="p-4 text-slate-600 max-w-[300px] truncate">{instructor.bio}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(instructor)} className="text-indigo-600 font-semibold text-xs border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors">Edit</button>
                    <DeleteButton onDelete={() => handleDelete(instructor.id)} className="text-red-600 font-semibold text-xs border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

export function MembershipManager() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const { user, token, currency, categories, languages, settings } = useStore();
  const meetEnabledSetting = settings.find((s:any) => s.key === 'GOOGLE_MEET_ENABLED')?.value;
  const meetEnabled = meetEnabledSetting ? JSON.parse(meetEnabledSetting).enabled : true;
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState((languages || []).find((l:any) => l.isDefault)?.code || (languages || []).find((l:any) => l.isActive)?.code || 'en');

  const [formData, setFormData] = useState({ 
    type: 'STANDARD', 
    label: '', 
    offerPrice: 0, 
    realPrice: 0, 
    expiryDate: '',
    imageUrl: '',
    categoryId: '',
    contents: [] as any[],
    editions: [] as any[],
    meetingLink: '', meetingDate: '', meetingNotes: '', notifyEnrolled: false
  });

  useEffect(() => {
    fetch("/api/memberships").then(r => r.json()).then(setMemberships).catch(()=>{});
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/memberships/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setMemberships(memberships.filter(m => m.id !== id));
  };

  const handleEdit = (membership: any) => {
    setEditId(membership.id);
    
    // Ensure all active languages have a content block
    const mergedContents = languages.filter((l:any) => l.isActive).map((lang: any) => {
      const existing = (membership.contents || []).find((c: any) => c.language === lang.code);
      if (existing) return existing;
      return { language: lang.code, title: '', description: '', whoIsFor: '', benefits: '', entryCondition: '', keyDetails: '' };
    });

    setFormData({
      type: membership.type || 'STANDARD',
      label: membership.label || '',
      offerPrice: membership.offerPrice || 0,
      realPrice: membership.realPrice || 0,
      expiryDate: membership.expiryDate ? new Date(membership.expiryDate).toISOString().slice(0, 16) : '',
      imageUrl: membership.imageUrl || '',
      categoryId: membership.categoryId || '',
      meetingLink: membership.meetingLink || '',
      meetingDate: membership.meetingDate ? new Date(membership.meetingDate).toISOString().slice(0,16) : '',
      meetingNotes: membership.meetingNotes || '',
      notifyEnrolled: false,
      contents: mergedContents,
      editions: membership.editions || []
    });
    setShowAdd(true);
  };

  const resetForm = () => {
    const initialContents = languages.filter((l:any) => l.isActive).map((lang: any) => ({
      language: lang.code, title: '', description: '', whoIsFor: '', benefits: '', entryCondition: '', keyDetails: ''
    }));

    setFormData({ type: 'STANDARD', label: '', offerPrice: 0, realPrice: 0, expiryDate: '', imageUrl: '', categoryId: '', contents: initialContents, editions: [], meetingLink: '', meetingDate: '', meetingNotes: '', notifyEnrolled: false });
    setEditId(null);
    setShowAdd(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    let method = "POST";
    let url = "/api/admin/memberships";
    if (editId) {
       method = "PUT";
       url = `/api/admin/memberships/${editId}`;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({...formData, offerPrice: Number(formData.offerPrice), realPrice: Number(formData.realPrice), expiryDate: formData.expiryDate || null })
      });
      if (!res.ok) { throw new Error("Failed to save membership"); }
      const newMembership = await res.json();
      
      if (editId) {
        setMemberships(memberships.map(m => m.id === editId ? newMembership : m));
      } else {
        setMemberships([...memberships, newMembership]);
      }
      resetForm();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleContentChange = (index: number, field: string, value: string) => {
    const newContents = [...formData.contents];
    newContents[index][field] = value;
    setFormData({ ...formData, contents: newContents });
  };

  const handleEditionChange = (index: number, field: string, value: string | number) => {
    const newEditions = [...formData.editions];
    newEditions[index] = { ...newEditions[index], [field]: value };
    setFormData({ ...formData, editions: newEditions });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Programs & Memberships Management</h2>
        <button onClick={() => {resetForm(); setShowAdd(true)}} className="bg-[#4B1D3F] text-white px-4 py-2 rounded-lg font-bold">
          {showAdd ? 'Reset' : '+ Add Membership'}
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 p-6 border border-slate-200 rounded-2xl bg-white shadow-sm space-y-4">
           <h3 className="font-bold text-lg text-slate-700">{editId ? 'Edit Program/Membership' : 'Add Program/Membership'}</h3>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Type (e.g. STANDARD)" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="p-2 border rounded bg-white" />
              <select value={formData.categoryId} onChange={e=>setFormData({...formData, categoryId: e.target.value})} className="p-2 border rounded bg-white">
                 <option value="">No Category</option>
                 {categories.filter((c: any) => c.type === 'MEMBERSHIP').map((c: any) => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
              </select>
              <input type="text" placeholder="Label (e.g. Signature Program)" value={formData.label} onChange={e=>setFormData({...formData, label: e.target.value})} className="p-2 border rounded" />
              <input type="number" placeholder="Offer Price" value={formData.offerPrice} onChange={e=>setFormData({...formData, offerPrice: Number(e.target.value)})} className="p-2 border rounded" />
              <input type="number" placeholder="Real Price (Value)" value={formData.realPrice} onChange={e=>setFormData({...formData, realPrice: Number(e.target.value)})} className="p-2 border rounded" />
              <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Expiry Date</span>
              <input type="datetime-local" placeholder="Expiry Date" value={formData.expiryDate} onChange={e=>setFormData({...formData, expiryDate: e.target.value})} className="p-2 border rounded" /></div>
           </div>
           
           <MediaInput 
             label="Cover Image" 
             type="image" 
             value={formData.imageUrl} 
             onChange={val => setFormData({ ...formData, imageUrl: val })} 
             className="mb-4"
           />

           <div className="border border-slate-200 p-6 rounded-2xl bg-white space-y-4">
               <h4 className="font-bold text-sm text-slate-800">Translations</h4>
               {/* Tabs navigation */}
               <div className="flex border-b border-slate-200">
                 {languages.filter((l:any) => l.isActive).map((lang: any) => (
                   <button
                     key={lang.code}
                     type="button"
                     onClick={() => setActiveLangTab(lang.code)}
                     className={`px-4 py-2 text-sm font-semibold transition-all rounded-md px-3 py-1.5 ${activeLangTab === lang.code ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     {lang.name}{lang.isDefault ? ' (Default)' : ''}
                   </button>
                 ))}
               </div>

               {/* Tab content */}
               <div className="pt-2">
                 {formData.contents.map((c, i) => {
                     if (c.language !== activeLangTab) return null;
                     return (
                     <div key={i} className="space-y-4">
                       <input type="text" placeholder="Title" value={c.title || ''} onChange={e=>handleContentChange(i, 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                       <HtmlEditor placeholder="Description" rows={3} value={c.description || ''} onChange={val => handleContentChange(i, 'description', val)} />
                       <textarea placeholder="Who is this for?" rows={2} value={c.whoIsFor || ''} onChange={e=>handleContentChange(i, 'whoIsFor', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                       <textarea placeholder="Benefits (One per line)" rows={3} value={c.benefits || ''} onChange={e=>handleContentChange(i, 'benefits', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                       <input type="text" placeholder="Entry Condition" value={c.entryCondition || ''} onChange={e=>handleContentChange(i, 'entryCondition', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                       <textarea placeholder="Key Details (One per line) e.g., Access: Lifetime Support" rows={3} value={c.keyDetails || ''} onChange={e=>handleContentChange(i, 'keyDetails', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                     </div>
                     );
                 })}
               </div>
           </div>

           <div className="border border-slate-100 p-4 hover:border-slate-200 transition-colors rounded bg-slate-50">
             <div className="flex justify-between mb-4">
               <h4 className="font-bold text-sm">Editions (Dates/Seats)</h4>
               <button onClick={() => setFormData({...formData, editions: [...formData.editions, { title: '', date: new Date().toISOString(), mode: 'online', totalSeats: 100, availableSeats: 100 }]})} className="text-xs bg-gray-200 px-2 py-1 rounded">+ Add Edition</button>
             </div>
             {formData.editions.map((ed, i) => (
                <div key={i} className="mb-4 p-4 border bg-white rounded grid grid-cols-2 gap-2">
                   <input type="text" placeholder="Edition Title (e.g. October Batch)" value={ed.title} onChange={e=>handleEditionChange(i, 'title', e.target.value)} className="p-2 border rounded text-sm" />
                   <input type="datetime-local" value={new Date(ed.date).toISOString().slice(0,16)} onChange={e=>handleEditionChange(i, 'date', new Date(e.target.value).toISOString())} className="p-2 border rounded text-sm" />
                   <input type="text" placeholder="Mode (online/offline)" value={ed.mode} onChange={e=>handleEditionChange(i, 'mode', e.target.value)} className="p-2 border rounded text-sm" />
                   <div className="flex gap-2">
                      <input type="number" placeholder="Total Seats" value={ed.totalSeats} onChange={e=>handleEditionChange(i, 'totalSeats', Number(e.target.value))} className="w-1/2 p-2 border rounded text-sm" />
                      <input type="number" placeholder="Available Seats" value={ed.availableSeats} onChange={e=>handleEditionChange(i, 'availableSeats', Number(e.target.value))} className="w-1/2 p-2 border rounded text-sm" />
                   </div>
                   <button onClick={() => {
                      const ne = [...formData.editions]; ne.splice(i, 1); setFormData({...formData, editions: ne});
                   }} className="text-xs text-red-500 col-span-2 text-right">Remove Edition</button>
                </div>
             ))}
           </div>

                       <div className="border border-slate-200 p-6 rounded-2xl bg-white space-y-4">
               <div>
                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block"></span>Live Class Details / Google Meet (Optional)</h3>
                 <p className="text-xs text-slate-500">Provide meet link and schedules that will be available to all enrolled students for this course.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Meet Link</label>
                       {meetEnabled && (
                         <button type="button" onClick={() => generateMeetLink(formData, setFormData)} className="text-xs text-indigo-600 font-bold hover:underline">Auto Generate</button>
                       )}
                    </div>
                    <input type="text" value={formData.meetingLink || ''} onChange={e=>setFormData({...formData, meetingLink: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" placeholder="https://meet.google.com/xxx-xxxx-xxx"/>
                 </div>
                 <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Date & Time</label>
                    <input type="datetime-local" value={formData.meetingDate || ''} onChange={e=>setFormData({...formData, meetingDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm"/>
                 </div>
               </div>
               <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Meeting Notes / Instructions</label>
                  <textarea value={formData.meetingNotes || ''} onChange={e=>setFormData({...formData, meetingNotes: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" rows={2} placeholder="E.g., Please read chapter 1 before joining..."></textarea>
               </div>
            </div>
            <label className="flex items-center gap-2 mt-4 mb-4 text-sm font-medium text-slate-800">
              <input type="checkbox" checked={formData.notifyEnrolled || false} onChange={e=>setFormData({...formData, notifyEnrolled: e.target.checked})} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              Send email notification with meeting details to enrolled members
            </label>
            <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold w-full">Save Changes</button>
           <button onClick={resetForm} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold w-full mt-2">Cancel</button>
        </div>
      )}

      <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 uppercase text-xs tracking-wider">
              <th className="p-4 rounded-tl-lg">Title (EN)</th>
              <th className="p-4">Type</th>
              <th className="p-4">Price</th>
              <th className="p-4 rounded-tr-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {memberships.length === 0 ? (
               <tr><td colSpan={4} className="text-center p-4 text-slate-500">No Memberships found.</td></tr>
            ) : memberships.map((m: any) => {
               const enContent = m.contents?.find((c: any) => c.language === 'en') || m.contents?.[0] || { title: 'Untitled' };
               return (
              <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-bold max-w-[200px] truncate flex items-center gap-3">
                   {m.imageUrl ? (
                     <img src={m.imageUrl} alt={enContent.title} className="w-10 h-10 object-cover rounded shadow-sm" />
                   ) : (
                     <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">No img</div>
                   )}
                   {enContent.title}
                </td>
                <td className="p-4">{m.type}</td>
                <td className="p-4">{formatCurrency(m.offerPrice, currency)}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(m)} className="text-indigo-600 hover:underline font-bold text-sm">Edit</button>
                  <DeleteButton onDelete={() => handleDelete(m.id)} className="text-red-500 hover:underline font-bold text-sm" />
                </td>
              </tr>
            )})}
          </tbody>
      </table>
    </div>
  );
}

export function SliderManager() {
  const [sliders, setSliders] = useState<any[]>([]);
  const { token } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', linkUrl: '' });

  useEffect(() => {
    fetch("/api/sliders").then(r => r.json()).then(setSliders).catch(()=>{});
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/sliders/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setSliders(sliders.filter(s => s.id !== id));
  };

  const handleEdit = (slider: any) => {
    setEditId(slider.id);
    setFormData({
      title: slider.title || '',
      imageUrl: slider.imageUrl || '',
      linkUrl: slider.linkUrl || ''
    });
    setShowAdd(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    console.log("SliderManager handleAdd clicked, editId is:", editId);
    
    // Safety check: ensure editId is not null, undefined or 'undefined'
    const id = (editId && editId !== 'undefined') ? editId : null;
    
    let method = "POST";
    let url = "/api/admin/sliders";
    if (id) {
       method = "PUT";
       url = `/api/admin/sliders/${id}`;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (!res.ok) { alert("Failed to save slider"); return; }
    
    // Refresh list
    fetch("/api/sliders").then(r => r.json()).then(setSliders).catch(()=>{});
    
    setShowAdd(false);
    setEditId(null);
    setFormData({ title: '', imageUrl: '', linkUrl: '' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
      <div className="flex justify-between mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-serif italic font-bold text-indigo-600">Manage Sliders</h2>
          <button onClick={() => {
             if (showAdd) {
               setShowAdd(false);
               setEditId(null);
               setFormData({ title: '', imageUrl: '', linkUrl: '' });
             } else {
               setFormData({ title: '', imageUrl: '', linkUrl: '' });
               setShowAdd(true);
             }
          }} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary-dark transition">{showAdd ? "Cancel" : "+ New Slider"}</button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 border border-slate-200 rounded-xl space-y-4 bg-slate-50">
           <input type="text" placeholder="Title" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded" />
           <input type="text" placeholder="Link URL" value={formData.linkUrl} onChange={e=>setFormData({...formData, linkUrl: e.target.value})} className="w-full p-2 border rounded" />
           <MediaInput 
             label="Slider Image" 
             type="image" 
             value={formData.imageUrl} 
             onChange={val => setFormData({ ...formData, imageUrl: val })} 
             className="mb-4"
           />
           <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">Save Slider</button>
        </div>
      )}

      <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              <th className="pb-3 px-2">Image</th>
              <th className="pb-3 px-2">Link</th>
              <th className="pb-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sliders.length === 0 ? (
               <tr><td colSpan={3} className="py-12 text-center text-slate-400 font-serif italic">No sliders found.</td></tr>
            ) : sliders.map(slider => (
              <tr key={slider.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                <td className="py-4 px-2 text-sm">{slider.imageUrl ? <img src={slider.imageUrl} alt="" className="w-20 h-10 object-cover" /> : null}</td>
                <td className="py-4 px-2 text-sm text-slate-500">{slider.linkUrl}</td>
                <td className="py-4 px-2 text-right space-x-2">
                  <button onClick={() => handleEdit(slider)} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">Edit</button>
                  <DeleteButton onDelete={() => handleDelete(slider.id)} />
                </td>
              </tr>
            ))}
          </tbody>
      </table>
    </div>
  );
}

export function EmailCampaignManager() {
  const { user, token } = useStore();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("ALL");
  const [courseId, setCourseId] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const fetchCampaigns = () => {
    fetch("/api/admin/campaigns", { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setCampaigns(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetch("/api/admin/users", { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));

    fetch("/api/courses")
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]));
      
    fetch("/api/memberships")
      .then(res => res.json())
      .then(data => setMemberships(Array.isArray(data) ? data : []))
      .catch(() => setMemberships([]));

    fetchCampaigns();
  }, [token]);

  const handleSend = async () => {
    setStatus(scheduledAt ? "Scheduling campaign..." : "Sending campaign...");
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        subject,
        message,
        type,
        targetId: type === 'COURSE' ? courseId : type === 'MEMBERSHIP' ? membershipId : undefined,
        selectedUserIds: type === 'SELECTED' ? selectedUserIds : undefined,
        scheduledAt: scheduledAt || undefined
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      setStatus(scheduledAt ? `Scheduled successfully for ${data.count} user(s)!` : `Sent successfully to ${data.count} user(s)!`);
      setSubject("");
      setMessage("");
      setScheduledAt("");
      fetchCampaigns();
    } else {
      const err = await res.json();
      setStatus(`Error: ${err.error}`);
    }
  };

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const filteredUsers = users.filter((u: any) => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 max-w-2xl">
      <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-2">Email Campaign Manager</h2>
      <p className="text-sm text-slate-500 mb-8">Broadcast an email with advanced targeting.</p>
      
      <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">Recipient Type</label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="ALL" checked={type === 'ALL'} onChange={() => setType('ALL')} className="accent-primary" />
                All Users
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="COURSE" checked={type === 'COURSE'} onChange={() => setType('COURSE')} className="accent-primary" />
                Course Users
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="MEMBERSHIP" checked={type === 'MEMBERSHIP'} onChange={() => setType('MEMBERSHIP')} className="accent-primary" />
                Membership Users
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" value="SELECTED" checked={type === 'SELECTED'} onChange={() => setType('SELECTED')} className="accent-primary" />
                Selected Users
              </label>
            </div>
          </div>

          {type === 'COURSE' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">Select Course</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="">-- Choose Course --</option>
                {courses.map(c => <option key={c.id} value={c.id} className="bg-white">{c.title}</option>)}
              </select>
            </div>
          )}

          {type === 'MEMBERSHIP' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">Select Membership</label>
              <select value={membershipId} onChange={e => setMembershipId(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="">-- Choose Membership --</option>
                {memberships.map((m: any) => {
                  const title = m.contents?.find((c: any) => c.language === 'en')?.title || m.contents?.[0]?.title || m.label || m.type;
                  return <option key={m.id} value={m.id} className="bg-white">{title}</option>
                })}
              </select>
            </div>
          )}

          {type === 'SELECTED' && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users by name or email..." className="w-full border border-slate-200 rounded-lg p-2 text-xs mb-3" />
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredUsers.map(u => (
                  <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded cursor-pointer">
                    <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} className="accent-primary" />
                    <div>
                      <div className="text-sm font-bold">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </label>
                ))}
                {filteredUsers.length === 0 && <div className="text-xs text-slate-500 italic p-2">No users found.</div>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">Subject</label>
            <input type="text" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Exclusive Offer Inside" className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">Message (Use {"{{"}name{"}}"} for recipient name)</label>
            <textarea rows={6} value={message} onChange={e=>setMessage(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" placeholder="Hello {{name}}, we are excited to announce..."></textarea>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">Schedule (Leave blank to send immediately)</label>
            <input type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} className="border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-primary w-full md:w-auto" />
          </div>
          <div className="text-xs text-slate-400 italic font-serif border-l-2 border-slate-200 pl-3 py-1">Footer with 'Nesrina 369 Consultancy' will be appended automatically.</div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 max-w-[50%] truncate">{status}</span>
            <button onClick={handleSend} disabled={!subject || !message || (type === 'COURSE' && !courseId) || (type === 'MEMBERSHIP' && !membershipId) || (type === 'SELECTED' && selectedUserIds.length === 0)} className="bg-primary text-white px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed">
               {scheduledAt ? "Schedule Campaign" : "Send Campaign"}
            </button>
          </div>
      </div>
      
      {campaigns.length > 0 && (
         <div className="mt-12 pt-8 border-t border-slate-200">
           <h3 className="text-lg font-serif italic font-bold text-slate-700 mb-4">Past & Scheduled Campaigns</h3>
           <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {campaigns.map(c => (
                 <div key={c.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-slate-700">{c.subject}</div>
                      <div className="text-xs text-slate-500 mt-1">To: {c.type} {(c.type === 'COURSE' || c.type === 'MEMBERSHIP') && c.targetId ? `(Target ID: ${c.targetId})` : ''}</div>
                      {c.scheduledAt && <div className="text-[10px] text-blue-500 font-bold mt-1 uppercase tracking-wider border border-blue-200 bg-blue-50 rounded px-2 py-0.5 inline-block">Scheduled: {new Date(c.scheduledAt).toLocaleString()}</div>}
                    </div>
                    <div className="text-right">
                       <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${c.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}>
                         {c.status}
                       </div>
                       <div className="text-[10px] text-slate-400 mt-2">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                 </div>
              ))}
           </div>
         </div>
      )}
    </div>
  );
}

export function EmailTemplatesManager() {
  const { user, token } = useStore();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('COURSE_PURCHASE');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const types = ["COURSE_PURCHASE", "MEMBERSHIP_PURCHASE", "EVENT_BOOKING", "FORGOT_PASSWORD", "MEETING_SCHEDULED"];

  useEffect(() => {
    fetch("/api/admin/email-templates", { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTemplates(data);
          const t = data.find((x:any) => x.type === selectedType);
          if(t) {
            setSubject(t.subject);
            setContent(t.content);
          }
        }
      });
  }, [token]);

  useEffect(() => {
    if (Array.isArray(templates)) {
      const t = templates.find((x:any) => x.type === selectedType);
      if(t) {
        setSubject(t.subject);
        setContent(t.content);
      } else {
        if (selectedType === 'COURSE_PURCHASE') {
          setSubject('Thank you for enrolling in {{course_name}}!');
          setContent(`<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #371C3B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Thank you for your purchase!</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>Thank you for enrolling in <strong>{{course_name}}</strong>! We are excited to have you.</p>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Order Details:</strong></p>
      <p style="margin: 5px 0;">Amount Paid: <strong>{{price}}</strong></p>
      <p style="margin: 5px 0;">Date: <strong>{{date}}</strong></p>
    </div>
    <p>Enjoy your course and happy learning!</p>
  </div>
</div>`);
        } else if (selectedType === 'MEMBERSHIP_PURCHASE') {
          setSubject('Welcome to {{membership_name}}!');
          setContent(`<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #371C3B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Welcome to the Club!</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>Thank you for purchasing the <strong>{{membership_name}}</strong> membership! We are thrilled to have you on board.</p>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Membership Details:</strong></p>
      <p style="margin: 5px 0;">Amount Paid: <strong>{{price}}</strong></p>
      <p style="margin: 5px 0;">Date: <strong>{{date}}</strong></p>
    </div>
    <p>You can now access all your benefits inside your dashboard.</p>
  </div>
</div>`);
        } else if (selectedType === 'EVENT_BOOKING') {
          setSubject('Booking Confirmation: {{event_name}}');
          setContent(`<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #371C3B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Booking Confirmation</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>Thank you for booking <strong>{{event_name}}</strong>!</p>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Booking Details:</strong></p>
      <p style="margin: 5px 0;">Amount Paid: <strong>{{price}}</strong></p>
      <p style="margin: 5px 0;">Date: <strong>{{date}}</strong></p>
    </div>
    <p>Looking forward to seeing you there.</p>
  </div>
</div>`);
        } else if (selectedType === 'FORGOT_PASSWORD') {
          setSubject('Password Reset Request');
          setContent(`<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #371C3B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Password Reset Request</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetLink}}" style="background-color: #371C3B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #371C3B;"><a href="{{resetLink}}">{{resetLink}}</a></p>
    <p style="margin-top: 30px; font-size: 13px; color: #6b7280;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
  </div>
</div>`);
        } else if (selectedType === 'MEETING_SCHEDULED') {
          setSubject('New Meeting Scheduled: {{item_name}}');
          setContent(`<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background-color: #371C3B; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: #ffffff; margin: 0;">Meeting Details Updated</h2>
  </div>
  <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>We have updated the meeting details for <strong>{{item_name}}</strong>. Please find the details below:</p>
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Meeting Details:</strong></p>
      <p style="margin: 5px 0;">Date & Time: <strong>{{meetingDate}}</strong></p>
      <p style="margin: 5px 0;">Meeting Link: <strong><a href="{{meetingLink}}" style="color: #371C3B;">Join Meeting</a></strong></p>
      <p style="margin: 5px 0;">Notes: <strong>{{meetingNotes}}</strong></p>
    </div>
    <p>Looking forward to seeing you there.</p>
  </div>
</div>`);
        } else {
          setSubject('');
          setContent('');
        }
      }
    }
  }, [selectedType, templates]);

  const handleSave = async () => {
    setStatus('Saving...');
    const res = await fetch("/api/admin/email-templates", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ type: selectedType, subject, content })
    });
    if (res.ok) {
      setStatus('Saved successfully!');
      const newT = await res.json();
      setTemplates(prev => {
        const other = prev.filter(x => x.type !== selectedType);
        return [...other, newT];
      });
      setTimeout(() => setStatus(''), 2000);
    } else {
      setStatus('Error saving template');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
      <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-2">Automated Email Templates</h2>
      <p className="text-sm text-slate-500 mb-8">Manage emails sent automatically upon purchase or booking.</p>
      
      <div className="flex gap-4 border-b border-slate-200 mb-6">
         {types.map(t => (
           <button key={t} onClick={() => setSelectedType(t)} className={`pb-2 text-sm font-bold border-b-2 transition ${selectedType === t ? 'border-primary text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
             {t.replace('_', ' ')}
           </button>
         ))}
      </div>

      <div className="space-y-6">
         <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">Subject</label>
            <input type="text" value={subject} onChange={e=>setSubject(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-primary" />
         </div>
         <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">Message Content (HTML Allowed)</label>
            <textarea rows={16} value={content} onChange={e=>setContent(e.target.value)} className="w-full border border-slate-200 rounded-lg p-4 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-slate-900 text-teal-300 shadow-inner leading-relaxed" placeholder="<html>...</html>"></textarea>
            <div className="mt-2 text-xs text-slate-500 space-y-1">
               <p className="font-bold">Available Dynamic Variables:</p>
               <p className="bg-slate-50 p-2 rounded border border-slate-100 flex gap-4 flex-wrap">
                 <span><code>{'{'}{'{'}name{'}'}{'}'}</code> - User's name</span>
                  {(selectedType === 'COURSE_PURCHASE' || selectedType === 'MEMBERSHIP_PURCHASE' || selectedType === 'EVENT_BOOKING') && <>
                 <span><code>{'{'}{'{'}price{'}'}{'}'}</code> - Amount paid</span>
                 <span><code>{'{'}{'{'}date{'}'}{'}'}</code> - Order date</span>
                  </>}
                 {selectedType === 'COURSE_PURCHASE' && <span><code>{'{'}{'{'}course_name{'}'}{'}'}</code></span>}
                 {selectedType === 'MEMBERSHIP_PURCHASE' && <span><code>{'{'}{'{'}membership_name{'}'}{'}'}</code></span>}
                 {selectedType === 'EVENT_BOOKING' && <span><code>{'{'}{'{'}event_name{'}'}{'}'}</code></span>}
                  {selectedType === 'FORGOT_PASSWORD' && <span><code>{'{'}{'{'}resetLink{'}'}{'}'}</code> - Password Reset Link</span>}
                  {selectedType === 'MEETING_SCHEDULED' && <>
                    <span><code>{'{'}{'{'}item_name{'}'}{'}'}</code></span>
                    <span><code>{'{'}{'{'}meetingDate{'}'}{'}'}</code></span>
                    <span><code>{'{'}{'{'}meetingLink{'}'}{'}'}</code></span>
                    <span><code>{'{'}{'{'}meetingNotes{'}'}{'}'}</code></span>
                  </>}
               </p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <button onClick={handleSave} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary-dark transition">Save Template</button>
            <span className="text-sm font-bold text-indigo-600">{status}</span>
         </div>
      </div>
    </div>
  );
}

export function SettingsManager() {
  const { token, languages } = useStore();
  const [smtp, setSmtp] = useState({ host: '', port: '', user: '', pass: '', secure: 'true' });
  const [design, setDesign] = useState({ logoUrl: '', primaryColor: '#4B1D3F', secondaryColor: '#D4942D', headerColor: '#ffffff', footerText: 'Nesrina 369 Consultancy' });
  const [heroTexts, setHeroTexts] = useState<any>({});
  const [activeLangTab, setActiveLangTab] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [status, setStatus] = useState('');
  const [socialLinks, setSocialLinks] = useState({ instagram: '', tiktok: '', youtube: '', linkedin: '' });

  const [meetConfig, setMeetConfig] = useState({ clientEmail: '', privateKey: '' });
  const [meetEnabledConfig, setMeetEnabledConfig] = useState({ enabled: true });
  const [socialLoginConfig, setSocialLoginConfig] = useState({ googleEnabled: false, googleClientId: '', googleClientSecret: '', facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' });
  const [siteImages, setSiteImages] = useState({ aboutUsImage: '', contactUsImage: '' });
  const [analyticsConfig, setAnalyticsConfig] = useState({ googleAnalyticsId: '', googleWebmasterKey: '' });
  const [firebaseConfig, setFirebaseConfig] = useState({ enabled: false, apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '', measurementId: '', vapidKey: '', serviceAccountJson: '' });

  const [storageProvidersConfig, setStorageProvidersConfig] = useState<any>({
    activeProvider: 'supabase',
    activeImageProvider: '',
    activeVideoProvider: '',
    providers: {
      supabase: { url: '', key: '', bucket: '' },
      s3: { region: '', accessKeyId: '', secretAccessKey: '', bucket: '' },
      b2: { endpoint: '', region: '', accessKeyId: '', secretAccessKey: '', bucket: '' },
      gcs: { projectId: '', clientEmail: '', privateKey: '', bucket: '' },
      bunny: { storageZoneName: '', accessKey: '', pullZoneUrl: '', region: '' },
      cloudinary: { cloudName: '', apiKey: '', apiSecret: '', folder: '' }
    }
  });
  const [stripeConfig, setStripeConfig] = useState({ enabled: false, publishableKey: '', secretKey: '' });


  useEffect(() => {
    if (languages && languages.length > 0 && !activeLangTab) {
      setActiveLangTab(languages.find((l:any) => l.isDefault)?.code || languages.find((l:any) => l.isActive)?.code || languages[0].code);
    }
  }, [languages]);

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sSMTP = data.find((s:any) => s.key === 'SMTP_CONFIG');
          const sDesign = data.find((s:any) => s.key === 'EMAIL_DESIGN');
          const sCurrency = data.find((s:any) => s.key === 'CURRENCY');
          const sHero = data.find((s:any) => s.key === 'FRONTEND_HERO');
          const sMeet = data.find((s:any) => s.key === 'GOOGLE_MEET_CONFIG');
          const sMeetEn = data.find((s:any) => s.key === 'GOOGLE_MEET_ENABLED');
          const sSocial = data.find((s:any) => s.key === 'SOCIAL_LINKS');
          const sSocialLogin = data.find((s:any) => s.key === 'SOCIAL_LOGIN_CONFIG');
          const sStorageProviders = data.find((s:any) => s.key === 'STORAGE_PROVIDERS_CONFIG');
          const sSiteImages = data.find((s:any) => s.key === 'SITE_IMAGES');
          const sAnalytics = data.find((s:any) => s.key === 'ANALYTICS_CONFIG');
          const sStripe = data.find((s:any) => s.key === 'STRIPE_CONFIG');
          const sFirebase = data.find((s:any) => s.key === 'FIREBASE_CONFIG');


          if(sSMTP) setSmtp(JSON.parse(sSMTP.value));
          if(sDesign) setDesign(JSON.parse(sDesign.value));
          if(sCurrency) setCurrency(JSON.parse(sCurrency.value));
          if(sHero) setHeroTexts(JSON.parse(sHero.value));
          if(sMeet) setMeetConfig(JSON.parse(sMeet.value));
          if(sMeetEn) setMeetEnabledConfig(JSON.parse(sMeetEn.value));
          if(sSocial) setSocialLinks(JSON.parse(sSocial.value));
          if(sSocialLogin) setSocialLoginConfig(JSON.parse(sSocialLogin.value));
          if(sStorageProviders) {
            const parsed = JSON.parse(sStorageProviders.value);
            setStorageProvidersConfig((prev: any) => ({
              ...prev,
              ...parsed,
              providers: {
                ...prev.providers,
                ...(parsed.providers || {})
              }
            }));
          }
          if(sSiteImages) setSiteImages(JSON.parse(sSiteImages.value));
          if(sAnalytics) setAnalyticsConfig(JSON.parse(sAnalytics.value));
          if(sStripe) setStripeConfig(JSON.parse(sStripe.value));
          if(sFirebase) setFirebaseConfig(JSON.parse(sFirebase.value));
        }

      });
  }, [token]);

  const saveSettings = async (key: string, value: any) => {
    setStatus('Saving...');
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ key, value: JSON.stringify(value) })
    });
    if (res.ok) {
      setStatus('Saved successfully!');
      setTimeout(() => setStatus(''), 2000);
    } else {
      setStatus('Error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">SMTP Configuration</h2>
        <div className="grid grid-cols-2 gap-6">
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Host</label>
              <input type="text" value={smtp.host} onChange={e=>setSmtp({...smtp, host: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="smtp.gmail.com" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Port</label>
              <input type="text" value={smtp.port} onChange={e=>setSmtp({...smtp, port: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="465 or 587" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Username / Email</label>
              <input type="email" value={smtp.user} onChange={e=>setSmtp({...smtp, user: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
              <input type="password" value={smtp.pass} onChange={e=>setSmtp({...smtp, pass: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
           </div>
           <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Use SSL/TLS</label>
              <select value={smtp.secure} onChange={e=>setSmtp({...smtp, secure: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm bg-white">
                 <option value="true">Yes (Port 465)</option>
                 <option value="false">No / STARTTLS (Port 587)</option>
              </select>
           </div>
           <div className="col-span-2 flex items-center gap-4">
              <button onClick={() => saveSettings('SMTP_CONFIG', smtp)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save SMTP Settings</button>
              <span className="text-indigo-500 text-xs font-bold">{status}</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Global Design Settings</h2>
        <div className="grid grid-cols-2 gap-6">
           <div className="col-span-2">
              <MediaInput 
                label="Logo" 
                type="image" 
                value={design.logoUrl || ''} 
                onChange={val => setDesign({...design, logoUrl: val})} 
              />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Header Background Color</label>
              <input type="color" value={design.headerColor || '#ffffff'} onChange={e=>setDesign({...design, headerColor: e.target.value})} className="h-10 border border-slate-200 rounded p-1" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Primary Color (Buttons, Links)</label>
              <input type="color" value={design.primaryColor || '#4B1D3F'} onChange={e=>setDesign({...design, primaryColor: e.target.value})} className="h-10 border border-slate-200 rounded p-1" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Secondary Color (Labels, Highlights)</label>
              <input type="color" value={design.secondaryColor || '#D4942D'} onChange={e=>setDesign({...design, secondaryColor: e.target.value})} className="h-10 border border-slate-200 rounded p-1" />
           </div>
           <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Footer Text</label>
              <input type="text" value={design.footerText} onChange={e=>setDesign({...design, footerText: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
           </div>
           <div className="col-span-2 flex items-center gap-4">
              <button onClick={() => saveSettings('EMAIL_DESIGN', design)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Design Settings</button>
           </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Frontend Hero Text</h2>
        
        {languages.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {languages.map((l: any) => (
              <button 
                key={l.code}
                onClick={() => setActiveLangTab(l.code)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeLangTab === l.code ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {l.name}{l.isDefault ? ' (Default)' : ''}
              </button>
            ))}
          </div>
        )}

        {languages.map((l: any) => {
           if (l.code !== activeLangTab) return null;
           const currentHtml = heroTexts[l.code]?.html || '';
           return (
             <div key={l.code} className="space-y-4 flex-col flex h-[280px]">
               <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">Hero Text (HTML)</label>
                  <textarea 
                     rows={8}
                     value={currentHtml} 
                     onChange={(e) => setHeroTexts({...heroTexts, [l.code]: { ...heroTexts[l.code], html: e.target.value }})} 
                     className="w-full border border-slate-200 rounded p-3 text-sm font-mono" 
                  />
               </div>
             </div>
           );
        })}

        <div className="mt-8 flex flex-wrap items-center gap-4">
           <button onClick={() => saveSettings('FRONTEND_HERO', heroTexts)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Hero Texts</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6 flex justify-between items-center">
          Google Meet Integration
          <label className="flex items-center gap-2 cursor-pointer text-sm font-sans font-normal text-slate-700">
            <input type="checkbox" checked={meetEnabledConfig.enabled} onChange={e => {
              setMeetEnabledConfig({ enabled: e.target.checked });
              saveSettings('GOOGLE_MEET_ENABLED', { enabled: e.target.checked });
            }} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-primary" />
            Enable auto-meet generation feature
          </label>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Client Email</label>
              <input value={meetConfig.clientEmail || ''} onChange={e=>setMeetConfig({...meetConfig, clientEmail: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="my-service-account@gcp-project.iam.gserviceaccount.com" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Private Key</label>
              <input type="password" value={meetConfig.privateKey || ''} onChange={e=>setMeetConfig({...meetConfig, privateKey: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="-----BEGIN PRIVATE KEY-----..." />
           </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
           <p className="text-xs text-slate-500">Provide Google Cloud Service Account credentials to enable automated Google Meet generation for user dashboards.</p>
           <button onClick={() => saveSettings('GOOGLE_MEET_CONFIG', meetConfig)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Meet Config</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Social Login Integration</h2>
        <div className="grid grid-cols-1 gap-6">
           <div className="border border-slate-100 p-4 hover:border-slate-200 transition-colors rounded-xl relative">
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={socialLoginConfig.googleEnabled} onChange={e => setSocialLoginConfig({...socialLoginConfig, googleEnabled: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-primary" />
                <span className="font-bold text-slate-800">Enable Google Login</span>
              </label>
              {socialLoginConfig.googleEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Google Client ID</label>
                    <input type="text" value={socialLoginConfig.googleClientId} onChange={e=>setSocialLoginConfig({...socialLoginConfig, googleClientId: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="xxx.apps.googleusercontent.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Google Client Secret</label>
                    <input type="password" value={socialLoginConfig.googleClientSecret || ''} onChange={e=>setSocialLoginConfig({...socialLoginConfig, googleClientSecret: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="GOCSPX-..." />
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium">
                     <strong>Important:</strong> Set your Google OAuth Redirect URI to:<br/>
                     <code className="bg-white px-1 py-0.5 mt-1 inline-block rounded">{window.location.origin}/oauth/callback</code>
                  </div>
                </div>
              )}
           </div>
           
           <div className="border border-slate-100 p-4 hover:border-slate-200 transition-colors rounded-xl relative">
              <label className="flex items-center gap-2 mb-4">
                <input type="checkbox" checked={socialLoginConfig.facebookEnabled} onChange={e => setSocialLoginConfig({...socialLoginConfig, facebookEnabled: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-primary" />
                <span className="font-bold text-slate-800">Enable Facebook Login</span>
              </label>
              {socialLoginConfig.facebookEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Facebook App ID</label>
                    <input type="text" value={socialLoginConfig.facebookAppId} onChange={e=>setSocialLoginConfig({...socialLoginConfig, facebookAppId: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="1234567890" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Facebook App Secret</label>
                    <input type="password" value={socialLoginConfig.facebookAppSecret || ''} onChange={e=>setSocialLoginConfig({...socialLoginConfig, facebookAppSecret: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="App Secret..." />
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium">
                     <strong>Important:</strong> Set your Facebook OAuth Valid OAuth Redirect URIs to:<br/>
                     <code className="bg-white px-1 py-0.5 mt-1 inline-block rounded">{window.location.origin}/oauth/callback</code>
                  </div>
                </div>
              )}
           </div>
        </div>
        <div className="mt-4 flex justify-end">
           <button onClick={() => saveSettings('SOCIAL_LOGIN_CONFIG', socialLoginConfig)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Social Login Settings</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Cloud Storage Configuration</h2>
        <div className="grid grid-cols-1 gap-6">
           <div className="border border-slate-100 p-4 hover:border-slate-200 transition-colors rounded-xl relative space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Active Provider</label>
                   <select 
                      value={storageProvidersConfig.activeProvider} 
                      onChange={e => setStorageProvidersConfig({...storageProvidersConfig, activeProvider: e.target.value})} 
                      className="w-full border border-slate-200 rounded p-2 text-sm"
                   >
                      <option value="local">Local (No Cloud)</option>
                      <option value="supabase">Supabase</option>
                      <option value="s3">Amazon S3</option>
                      <option value="bunny">Bunny CDN</option>
                      <option value="b2">Backblaze B2</option>
                      <option value="gcs">Google Cloud Storage</option>
                      <option value="cloudinary">Cloudinary</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Image Provider</label>
                   <select 
                      value={storageProvidersConfig.activeImageProvider || ''} 
                      onChange={e => setStorageProvidersConfig({...storageProvidersConfig, activeImageProvider: e.target.value})} 
                      className="w-full border border-slate-200 rounded p-2 text-sm"
                   >
                      <option value="">Use Default</option>
                      <option value="supabase">Supabase</option>
                      <option value="s3">Amazon S3</option>
                      <option value="bunny">Bunny CDN</option>
                      <option value="b2">Backblaze B2</option>
                      <option value="gcs">Google Cloud Storage</option>
                      <option value="cloudinary">Cloudinary</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Video Provider</label>
                   <select 
                      value={storageProvidersConfig.activeVideoProvider || ''} 
                      onChange={e => setStorageProvidersConfig({...storageProvidersConfig, activeVideoProvider: e.target.value})} 
                      className="w-full border border-slate-200 rounded p-2 text-sm"
                   >
                      <option value="">Use Default</option>
                      <option value="supabase">Supabase</option>
                      <option value="s3">Amazon S3</option>
                      <option value="bunny">Bunny CDN</option>
                      <option value="b2">Backblaze B2</option>
                      <option value="gcs">Google Cloud Storage</option>
                      <option value="cloudinary">Cloudinary</option>
                   </select>
                 </div>
              </div>

              {storageProvidersConfig.activeProvider === 'supabase' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-sm space-y-3">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Supabase URL</label>
                     <input type="text" value={storageProvidersConfig.providers.supabase.url} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, supabase: {...storageProvidersConfig.providers.supabase, url: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Supabase Key (Service or Anon)</label>
                     <input type="password" value={storageProvidersConfig.providers.supabase.key} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, supabase: {...storageProvidersConfig.providers.supabase, key: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Bucket Name</label>
                     <input type="text" value={storageProvidersConfig.providers.supabase.bucket} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, supabase: {...storageProvidersConfig.providers.supabase, bucket: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                </div>
              )}

              {storageProvidersConfig.activeProvider === 's3' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-sm space-y-3">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">AWS Region</label>
                     <input type="text" value={storageProvidersConfig.providers.s3.region} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, s3: {...storageProvidersConfig.providers.s3, region: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="us-east-1" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Access Key ID</label>
                     <input type="text" value={storageProvidersConfig.providers.s3.accessKeyId} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, s3: {...storageProvidersConfig.providers.s3, accessKeyId: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Secret Access Key</label>
                     <input type="password" value={storageProvidersConfig.providers.s3.secretAccessKey} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, s3: {...storageProvidersConfig.providers.s3, secretAccessKey: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Bucket Name</label>
                     <input type="text" value={storageProvidersConfig.providers.s3.bucket} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, s3: {...storageProvidersConfig.providers.s3, bucket: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                </div>
              )}

              {storageProvidersConfig.activeProvider === 'bunny' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-sm space-y-3">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Storage Zone Name</label>
                     <input type="text" value={storageProvidersConfig.providers.bunny.storageZoneName} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, bunny: {...storageProvidersConfig.providers.bunny, storageZoneName: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Region Endpoint (optional, e.g. 'ny')</label>
                     <input type="text" value={storageProvidersConfig.providers.bunny.region} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, bunny: {...storageProvidersConfig.providers.bunny, region: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="Leave empty for default (Falkenstein)" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Access Key</label>
                     <input type="password" value={storageProvidersConfig.providers.bunny.accessKey} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, bunny: {...storageProvidersConfig.providers.bunny, accessKey: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Pull Zone URL</label>
                     <input type="text" value={storageProvidersConfig.providers.bunny.pullZoneUrl} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, bunny: {...storageProvidersConfig.providers.bunny, pullZoneUrl: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="https://myzone.b-cdn.net" />
                   </div>
                </div>
              )}

              {storageProvidersConfig.activeProvider === 'b2' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-sm space-y-3">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Endpoint</label>
                     <input type="text" value={storageProvidersConfig.providers.b2.endpoint} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, b2: {...storageProvidersConfig.providers.b2, endpoint: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="https://s3.us-west-004.backblazeb2.com" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Region</label>
                     <input type="text" value={storageProvidersConfig.providers.b2.region} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, b2: {...storageProvidersConfig.providers.b2, region: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="us-west-004" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">KeyID (Access Key ID)</label>
                     <input type="text" value={storageProvidersConfig.providers.b2.accessKeyId} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, b2: {...storageProvidersConfig.providers.b2, accessKeyId: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">ApplicationKey (Secret Access Key)</label>
                     <input type="password" value={storageProvidersConfig.providers.b2.secretAccessKey} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, b2: {...storageProvidersConfig.providers.b2, secretAccessKey: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Bucket Name</label>
                     <input type="text" value={storageProvidersConfig.providers.b2.bucket} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, b2: {...storageProvidersConfig.providers.b2, bucket: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                </div>
              )}

              {storageProvidersConfig.activeProvider === 'gcs' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-sm space-y-3">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Project ID</label>
                     <input type="text" value={storageProvidersConfig.providers.gcs.projectId} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, gcs: {...storageProvidersConfig.providers.gcs, projectId: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Client Email</label>
                     <input type="text" value={storageProvidersConfig.providers.gcs.clientEmail} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, gcs: {...storageProvidersConfig.providers.gcs, clientEmail: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Private Key</label>
                     <textarea value={storageProvidersConfig.providers.gcs.privateKey} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, gcs: {...storageProvidersConfig.providers.gcs, privateKey: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm font-mono h-24" placeholder="-----BEGIN PRIVATE KEY-----\n..." />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Bucket Name</label>
                     <input type="text" value={storageProvidersConfig.providers.gcs.bucket} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, gcs: {...storageProvidersConfig.providers.gcs, bucket: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                </div>
              )}

              {storageProvidersConfig.activeProvider === 'cloudinary' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-sm space-y-3">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Cloud Name</label>
                     <input type="text" value={storageProvidersConfig.providers.cloudinary?.cloudName || ''} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, cloudinary: {...storageProvidersConfig.providers.cloudinary, cloudName: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">API Key</label>
                     <input type="text" value={storageProvidersConfig.providers.cloudinary?.apiKey || ''} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, cloudinary: {...storageProvidersConfig.providers.cloudinary, apiKey: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">API Secret</label>
                     <input type="password" value={storageProvidersConfig.providers.cloudinary?.apiSecret || ''} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, cloudinary: {...storageProvidersConfig.providers.cloudinary, apiSecret: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Folder Name (Optional)</label>
                     <input type="text" value={storageProvidersConfig.providers.cloudinary?.folder || ''} onChange={e=>setStorageProvidersConfig({...storageProvidersConfig, providers: {...storageProvidersConfig.providers, cloudinary: {...storageProvidersConfig.providers.cloudinary, folder: e.target.value}}})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                </div>
              )}
           </div>
        </div>
        <div className="mt-4 flex justify-end">
           <button onClick={() => saveSettings('STORAGE_PROVIDERS_CONFIG', storageProvidersConfig)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Storage Config</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Firebase Config (Push Notifications)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="col-span-full">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <input type="checkbox" checked={firebaseConfig.enabled} onChange={e=>setFirebaseConfig({...firebaseConfig, enabled: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                  Enable Firebase Integration
              </label>
           </div>
           {firebaseConfig.enabled && (
               <>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">API Key</label>
                       <input type="text" value={firebaseConfig.apiKey} onChange={e=>setFirebaseConfig({...firebaseConfig, apiKey: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Auth Domain</label>
                       <input type="text" value={firebaseConfig.authDomain} onChange={e=>setFirebaseConfig({...firebaseConfig, authDomain: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Project ID</label>
                       <input type="text" value={firebaseConfig.projectId} onChange={e=>setFirebaseConfig({...firebaseConfig, projectId: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Storage Bucket</label>
                       <input type="text" value={firebaseConfig.storageBucket} onChange={e=>setFirebaseConfig({...firebaseConfig, storageBucket: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Messaging Sender ID</label>
                       <input type="text" value={firebaseConfig.messagingSenderId} onChange={e=>setFirebaseConfig({...firebaseConfig, messagingSenderId: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">App ID</label>
                       <input type="text" value={firebaseConfig.appId} onChange={e=>setFirebaseConfig({...firebaseConfig, appId: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">VAPID Key (for web push)</label>
                       <input type="text" value={firebaseConfig.vapidKey} onChange={e=>setFirebaseConfig({...firebaseConfig, vapidKey: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" />
                   </div>
                   <div className="col-span-full">
                       <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Service Account JSON (for Admin SDK)</label>
                       <textarea value={firebaseConfig.serviceAccountJson} onChange={e=>setFirebaseConfig({...firebaseConfig, serviceAccountJson: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm font-mono text-[10px]" rows={4} placeholder='{"type": "service_account", ...}'></textarea>
                   </div>
               </>
           )}
        </div>
        <div className="mt-4 flex justify-end">
           <button onClick={() => saveSettings('FIREBASE_CONFIG', firebaseConfig)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Firebase Config</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Site Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <MediaInput label="About Us Image" type="image" value={siteImages.aboutUsImage} onChange={v => setSiteImages({...siteImages, aboutUsImage: v})} />
           </div>
           <div>
             <MediaInput label="Contact Us Image" type="image" value={siteImages.contactUsImage} onChange={v => setSiteImages({...siteImages, contactUsImage: v})} />
           </div>
        </div>
        <div className="mt-4 flex justify-end">
           <button onClick={() => saveSettings('SITE_IMAGES', siteImages)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Images</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Analytics & SEO</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Google Analytics ID</label>
              <input type="text" value={analyticsConfig.googleAnalyticsId} onChange={e=>setAnalyticsConfig({...analyticsConfig, googleAnalyticsId: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="G-XXXXXXXXXX" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Google Webmaster Verification Key</label>
              <input type="text" value={analyticsConfig.googleWebmasterKey} onChange={e=>setAnalyticsConfig({...analyticsConfig, googleWebmasterKey: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="e.g. alphanumeric key from meta tag" />
           </div>
        </div>
        <div className="mt-4 flex justify-end">
           <button onClick={() => saveSettings('ANALYTICS_CONFIG', analyticsConfig)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Analytics Config</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Instagram URL</label>
              <input type="url" value={socialLinks.instagram} onChange={e=>setSocialLinks({...socialLinks, instagram: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="https://instagram.com/..." />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">TikTok URL</label>
              <input type="url" value={socialLinks.tiktok} onChange={e=>setSocialLinks({...socialLinks, tiktok: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="https://tiktok.com/@..." />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">YouTube URL</label>
              <input type="url" value={socialLinks.youtube} onChange={e=>setSocialLinks({...socialLinks, youtube: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="https://youtube.com/c/..." />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">LinkedIn URL</label>
              <input type="url" value={socialLinks.linkedin} onChange={e=>setSocialLinks({...socialLinks, linkedin: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="https://linkedin.com/in/..." />
           </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
           <button onClick={() => saveSettings('SOCIAL_LINKS', socialLinks)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Social Links</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Currency Settings</h2>
        <div className="grid grid-cols-1 gap-6">
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Default Currency</label>
              <select value={currency} onChange={e=>setCurrency(e.target.value)} className="w-full border border-slate-200 rounded p-2 text-sm bg-white">
                 <option value="USD">USD ($)</option>
                 <option value="EUR">EUR (€)</option>
                 <option value="GBP">GBP (£)</option>
                 <option value="AED">AED (د.إ)</option>
              </select>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => { saveSettings('CURRENCY', currency); useStore.getState().setCurrency(currency); }} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Currency</button>
              <span className="text-indigo-500 text-xs font-bold">{status}</span>
           </div>
        </div>
      </div>

    </div>
  );
}

export function CategoryManager() {
  const { categories, setCategories, token, languages } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', type: 'COURSE', translations: [] as any[] });
  const [editId, setEditId] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState((languages || []).find((l:any) => l.isDefault)?.code || (languages || []).find((l:any) => l.isActive)?.code || 'en');

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleTranslationChange = (index: number, field: string, value: string) => {
    const newTranslations = [...formData.translations];
    newTranslations[index] = { ...newTranslations[index], [field]: value };
    setFormData({ ...formData, translations: newTranslations });
  };

  const handleSave = async () => {
    if(!formData.name) return alert('Name is required');
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/admin/categories/${editId}` : '/api/admin/categories';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    fetchCategories();
    setShowAdd(false);
    setEditId(null);
    setFormData({ name: '', description: '', type: 'COURSE', translations: [] });
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchCategories();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
      <div className="flex justify-between mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-serif italic font-bold text-indigo-600">Manage Categories</h2>
          <button onClick={() => {
            setShowAdd(!showAdd);
            setEditId(null);
            const initialContents = languages.filter((l:any) => l.isActive).map((lang: any) => ({
              languageCode: lang.code, name: '', description: ''
            }));
            setFormData({ name: '', description: '', type: 'COURSE', translations: initialContents });
          }} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary-dark transition">{showAdd ? "Cancel" : "+ Add Category"}</button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 border border-slate-200 rounded-xl space-y-4 bg-slate-50 flex flex-col gap-4">
           <div className="flex flex-wrap gap-4 items-end">
               <div className="flex-1 min-w-[200px]">
                 <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                 <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" />
               </div>
               <div className="flex-[2] min-w-[300px]">
                 <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                 <HtmlEditor placeholder="Description" rows={4} value={formData.description} onChange={val=>setFormData({...formData, description: val})} />
               </div>
               <div className="flex-1 min-w-[150px]">
                 <label className="text-xs font-bold text-slate-500 uppercase">Category Type</label>
                 <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded">
                   <option value="COURSE">Course</option>
                   <option value="MEMBERSHIP">Membership</option>
                 </select>
               </div>
           </div>

           <div className="border border-slate-200 p-6 rounded-2xl bg-white mt-4 space-y-4">
               <h4 className="font-bold text-sm text-slate-800">Translations</h4>
               {/* Tabs navigation */}
               <div className="flex border-b border-slate-200">
                 {languages.filter((l:any) => l.isActive).map((lang: any) => (
                   <button
                     key={lang.code}
                     type="button"
                     onClick={() => setActiveLangTab(lang.code)}
                     className={`px-4 py-2 text-sm font-semibold transition-all rounded-md px-3 py-1.5 ${activeLangTab === lang.code ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                   >
                     {lang.name}{lang.isDefault ? ' (Default)' : ''}
                   </button>
                 ))}
               </div>

               {/* Tab content */}
               <div className="pt-2">
                 {formData.translations.map((c, i) => {
                     if (c.languageCode !== activeLangTab) return null;
                     return (
                     <div key={i} className="space-y-4">
                       <input type="text" placeholder="Name" value={c.name || ''} onChange={e=>handleTranslationChange(i, 'name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                       <HtmlEditor placeholder="Description" rows={4} value={c.description || ''} onChange={val=>handleTranslationChange(i, 'description', val)} />
                     </div>
                     );
                 })}
               </div>
           </div>

           <div className="flex justify-end pt-2 border-t border-slate-200 mt-2">
             <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold uppercase text-xs tracking-wider h-10">{editId ? 'Update' : 'Save'}</button>
           </div>
        </div>
      )}

      <div className="space-y-4">
         {categories.map((cat: any) => (
           <div key={cat.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors duration-200 overflow-hidden">
             <div>
                <p className="font-bold text-ink">{cat.name}</p>
                <p className="text-xs text-slate-500">{cat.description || 'No description'}</p>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={() => {
                  const mergedContents = languages.filter((l:any) => l.isActive).map((lang: any) => {
                    const existing = (cat.translations || []).find((c: any) => c.languageCode === lang.code);
                    if (existing) return existing;
                    return { languageCode: lang.code, name: '', description: '' };
                  });
                  setFormData({ name: cat.name, description: cat.description || '', type: cat.type || 'COURSE', translations: mergedContents });
                  setEditId(cat.id);
                  setShowAdd(true);
                }} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">Edit</button>
                <DeleteButton onDelete={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors" />
             </div>
           </div>
         ))}
         {categories.length === 0 && <div className="text-center text-slate-400 font-serif italic py-8">No categories found.</div>}
      </div>
    </div>
  );
}

export function LanguageManager() {
  const { languages, setLanguages, token } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', isDefault: false, isActive: true, translations: '{}' });

  const fetchLanguages = async () => {
    const res = await fetch("/api/languages");
    const data = await res.json();
    setLanguages(data);
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleSave = async () => {
    if(!formData.code || !formData.name) return alert('Fill code and name');
    
    // Validate JSON
    try {
      JSON.parse(formData.translations);
    } catch (e) {
      return alert('Invalid JSON in translations field.');
    }

    if (editId) {
      await fetch(`/api/admin/languages/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
    } else {
      await fetch("/api/admin/languages", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
    }
    fetchLanguages();
    setShowAdd(false);
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/languages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchLanguages();
  };

  const toggleLanguageStatus = async (lang: any, field: keyof typeof formData) => {
    await fetch(`/api/admin/languages/${lang.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ ...lang, [field]: !lang[field] })
    });
    fetchLanguages();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
      <div className="flex justify-between mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-serif italic font-bold text-indigo-600">Language Settings</h2>
          <button onClick={() => {
            if (showAdd) {
               setShowAdd(false);
               setEditId(null);
            } else {
               setFormData({ code: '', name: '', isDefault: false, isActive: true, translations: '{\n  "nav": {\n    "home": "Home"\n  }\n}' });
               setShowAdd(true);
            }
          }} className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary-dark transition">{showAdd ? "Cancel" : "+ Add Language"}</button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 border border-slate-200 rounded-xl space-y-4 bg-slate-50 flex flex-col gap-4">
           <div className="flex flex-wrap gap-4 items-end">
             <div className="flex-1 min-w-[200px]">
               <label className="text-xs font-bold text-slate-500 uppercase">Code (e.g. en)</label>
               <input type="text" disabled={!!editId} value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value})} className="w-full p-2 border rounded disabled:opacity-50 disabled:bg-gray-100" />
             </div>
             <div className="flex-1 min-w-[200px]">
               <label className="text-xs font-bold text-slate-500 uppercase">Name (e.g. English)</label>
               <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" />
             </div>
             <div className="min-w-[100px]">
               <label className="flex items-center gap-2 cursor-pointer text-sm font-bold mt-4">
                 <input type="checkbox" checked={formData.isDefault} onChange={e=>setFormData({...formData, isDefault: e.target.checked})} className="w-4 h-4" />
                 Default
               </label>
             </div>
           </div>
           
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase">UI Translations (JSON)</label>
             <p className="text-xs text-slate-400 mb-1">Enter valid JSON containing translation keys for this language.</p>
             <textarea 
               value={formData.translations} 
               onChange={e=>setFormData({...formData, translations: e.target.value})} 
               className="w-full p-2 border rounded font-mono text-sm min-h-[300px]" 
             />
           </div>

           <div className="flex justify-end">
             <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold uppercase text-xs tracking-wider">Save</button>
           </div>
        </div>
      )}

      <div className="space-y-4">
         {languages.map(lang => (
           <div key={lang.id} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors duration-200 overflow-hidden">
             <div>
                <p className="font-bold flex items-center gap-2">
                  {lang.name}{lang.isDefault ? ' (Default)' : ''} ({lang.code})
                  {lang.isDefault && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Default</span>}
                </p>
             </div>
             <div className="flex items-center gap-4">
                <button onClick={() => {
                  setFormData({ 
                    code: lang.code, 
                    name: lang.name, 
                    isDefault: lang.isDefault, 
                    isActive: lang.isActive, 
                    translations: typeof lang.translations === 'string' ? lang.translations : JSON.stringify(lang.translations || {}, null, 2) 
                  });
                  setEditId(lang.id);
                  setShowAdd(true);
                }} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors">Edit</button>
                <button onClick={() => toggleLanguageStatus(lang, 'isActive')} className={`text-xs font-bold px-3 py-1 rounded-full ${lang.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>
                  {lang.isActive ? "Enabled" : "Disabled"}
                </button>
                {!lang.isDefault && (
                  <button onClick={() => toggleLanguageStatus(lang, 'isDefault')} className="text-indigo-600 font-semibold text-xs border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors">Set Default</button>
                )}
                <DeleteButton onDelete={() => handleDelete(lang.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors" />
             </div>
           </div>
         ))}
         {languages.length === 0 && <div className="text-center text-slate-400 font-serif italic py-8">No languages found.</div>}
      </div>
    </div>
  );
}

export function PagesManager() {
  const { token } = useStore();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState("ABOUT_US_PAGE");
  const [settingsData, setSettingsData] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const pages = [
    { id: "ABOUT_US_PAGE", name: "About Us", description: "The main about us page for the public site." },
    { id: "PRIVACY_POLICY", name: "Privacy Policy", description: "Privacy policy legal document." },
    { id: "TERMS_CONDITIONS", name: "Terms and Conditions", description: "Terms and conditions legal document." }
  ];

  useEffect(() => {
    fetch("/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(settings => {
      if (Array.isArray(settings)) {
        setSettingsData(settings);
      }
    })
    .catch(()=>{});
  }, [token]);

  useEffect(() => {
    const pageSetting = settingsData.find((s: any) => s.key === selectedPage);
    if (pageSetting) {
      setContent(pageSetting.value);
    } else {
      if (selectedPage === "ABOUT_US_PAGE") {
        setContent(defaultAboutUsHtml);
      } else {
        setContent(`<h2>${pages.find(p => p.id === selectedPage)?.name}</h2><p>Content goes here...</p>`);
      }
    }
  }, [selectedPage, settingsData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newSettingsReq = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ key: selectedPage, value: content })
    });
    
    if (newSettingsReq.ok) {
       const updatedSetting = await newSettingsReq.json();
       setSettingsData(prev => {
          const exists = prev.find((s: any) => s.key === selectedPage);
          if (exists) {
            return prev.map((s: any) => s.key === selectedPage ? updatedSetting : s);
          }
          return [...prev, updatedSetting];
       });
       alert("Saved Successfully!");
       setIsEditing(false);
    } else {
       alert("Failed to save.");
    }
    setLoading(false);
  };

  if (!isEditing) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold font-serif italic text-indigo-600 mb-2">Manage Pages</h2>
        <p className="text-sm text-slate-500 mb-6">Select a page below to edit its HTML content.</p>

        <div className="space-y-4">
          {pages.map(p => (
            <div key={p.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
              <div>
                <h3 className="font-bold text-ink">{p.name}</h3>
                <p className="text-xs text-slate-500">{p.description}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPage(p.id);
                  setIsEditing(true);
                }}
                className="bg-primary/10 text-indigo-600 hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-bold transition"
              >
                Edit Content
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setIsEditing(false)}
          className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold font-serif italic text-indigo-600 mb-1">
            Editing: {pages.find(p => p.id === selectedPage)?.name}
          </h2>
          <p className="text-sm text-slate-500">Use HTML to customize the content.</p>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-600/60 mb-2">HTML Content</label>
          <HtmlEditor placeholder="Page Content" rows={10} value={content} onChange={setContent} />
        </div>
        <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-[#3a1631] transition shadow-sm">
          {loading ? "Saving..." : "Save Content"}
        </button>
      </form>
    </div>
  );
}

export function EventManager() {
  const { user, token, currency, languages, settings } = useStore();
  const meetEnabledSetting = settings.find((s:any) => s.key === 'GOOGLE_MEET_ENABLED')?.value;
  const meetEnabled = meetEnabledSetting ? JSON.parse(meetEnabledSetting).enabled : true;
  const [events, setEvents] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [activeLangTab, setActiveLangTab] = useState((languages || []).find((l:any) => l.isDefault)?.code || (languages || []).find((l:any) => l.isActive)?.code || 'en');

  const [formData, setFormData] = useState({
    title: '', description: '', date: '', endDate: '', expiryDate: '', totalSeats: 0, availableSeats: 0, price: 0, realPrice: 0, location: '', imageUrl: '', meetingLink: '', meetingDate: '', meetingNotes: '', notifyEnrolled: false, translations: [] as any[]
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    fetch("/api/events")
      .then(r => r.json())
      .then(setEvents);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    const initialContents = languages.filter((l:any) => l.isActive).map((lang: any) => ({
      languageCode: lang.code, title: '', description: ''
    }));
    setFormData({
      title: '', description: '', date: '', endDate: '', expiryDate: '', totalSeats: 0, availableSeats: 0, price: 0, realPrice: 0, location: '', imageUrl: '', meetingLink: '', meetingDate: '', meetingNotes: '', notifyEnrolled: false, translations: initialContents
    });
    setEditingEvent(null);
    setFormOpen(false);
  };

  const handleEdit = (evt: any) => {
    setEditingEvent(evt);
    const mergedContents = languages.filter((l:any) => l.isActive).map((lang: any) => {
      const existing = (evt.translations || []).find((c: any) => c.languageCode === lang.code);
      if (existing) return existing;
      return { languageCode: lang.code, title: '', description: '' };
    });

    setFormData({
      title: evt.title,
      description: evt.description,
      date: new Date(evt.date).toISOString().slice(0, 16),
      endDate: evt.endDate ? new Date(evt.endDate).toISOString().slice(0, 16) : '',
      expiryDate: evt.expiryDate ? new Date(evt.expiryDate).toISOString().slice(0, 16) : '',
      totalSeats: evt.totalSeats,
      availableSeats: evt.availableSeats,
      price: evt.price,
      realPrice: evt.realPrice || 0,
      location: evt.location || '',
      imageUrl: evt.imageUrl || '',
      meetingLink: evt.meetingLink || '',
      meetingDate: evt.meetingDate ? new Date(evt.meetingDate).toISOString().slice(0, 16) : '',
      meetingNotes: evt.meetingNotes || '',
      notifyEnrolled: false,
      translations: mergedContents
    });
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/admin/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchEvents();
  };

  const handleTranslationChange = (index: number, field: string, value: string) => {
    const newTranslations = [...formData.translations];
    newTranslations[index] = { ...newTranslations[index], [field]: value };
    setFormData({ ...formData, translations: newTranslations });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingEvent ? `/api/admin/events/${editingEvent.id}` : "/api/admin/events";
    const method = editingEvent ? "PUT" : "POST";
    
    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormOpen(false);
        fetchEvents();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save event');
      }
    } catch(err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif italic text-indigo-600">Events Management</h2>
        <button onClick={() => {
          resetForm();
          setFormOpen(true);
        }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Event</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Seats</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(evt => (
              <tr key={evt.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {evt.imageUrl && <img src={evt.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />}
                    <div>
                      <div className="font-bold text-slate-800">{evt.title}</div>
                      <div className="text-xs text-slate-500">{evt.location}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {new Date(evt.date).toLocaleString()}
                  {evt.expiryDate && new Date(evt.expiryDate) < new Date() ? <span className="ml-2 text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded">EXPIRED</span> : null}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {evt.availableSeats} / {evt.totalSeats}
                </td>
                <td className="p-4 text-sm font-bold text-indigo-600">
                  {formatCurrency(evt.price, currency)}
                  {(evt.realPrice && evt.realPrice > evt.price) ? <span className="ml-2 text-xs text-slate-400 line-through font-normal">{formatCurrency(evt.realPrice, currency)}</span> : null}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(evt)} className="p-2 text-slate-400 hover:text-indigo-600 transition bg-white border border-slate-200 rounded-lg shadow-sm">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(evt.id)} className="p-2 text-slate-400 hover:text-red-500 transition bg-white border border-slate-200 rounded-lg shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 text-sm italic font-serif">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md">
              <h2 className="text-xl font-bold font-serif italic text-indigo-600">
                {editingEvent ? "Edit Event" : "Add Event"}
              </h2>
              <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                  <HtmlEditor placeholder="Event Description" rows={6} value={formData.description} onChange={val => setFormData({...formData, description: val})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Total Seats</label>
                  <input required type="number" value={formData.totalSeats} onChange={e => setFormData({...formData, totalSeats: Number(e.target.value), availableSeats: !editingEvent ? Number(e.target.value) : formData.availableSeats})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Available Seats</label>
                  <input required type="number" value={formData.availableSeats} onChange={e => setFormData({...formData, availableSeats: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Start Date & Time</label>
                  <input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">End Date & Time</label>
                  <input type="datetime-local" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Expiry Date (Auto Hide)</label>
                  <input type="datetime-local" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Price</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Pricing Scheme (Original Price)</label>
                  <input type="number" placeholder="Optional" value={formData.realPrice} onChange={e => setFormData({...formData, realPrice: Number(e.target.value)})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                  <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div className="col-span-2">
                  <MediaInput 
                    label="Image URL" 
                    type="image" 
                    value={formData.imageUrl} 
                    onChange={val => setFormData({ ...formData, imageUrl: val })} 
                  />
                </div>

                <div className="col-span-2 border border-slate-200 p-6 rounded-xl bg-white space-y-4">
                    <h4 className="font-bold text-sm text-slate-800">Translations</h4>
                    {/* Tabs navigation */}
                    <div className="flex border-b border-slate-200">
                      {languages.filter((l:any) => l.isActive).map((lang: any) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setActiveLangTab(lang.code)}
                          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${activeLangTab === lang.code ? 'border-primary text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                          {lang.name}{lang.isDefault ? ' (Default)' : ''}
                        </button>
                      ))}
                    </div>

                    {/* Tab content */}
                    <div className="pt-4">
                      {formData.translations.map((c, i) => {
                          if (c.languageCode !== activeLangTab) return null;
                          return (
                          <div key={i} className="space-y-4">
                            <input type="text" placeholder="Title" value={c.title || ''} onChange={e=>handleTranslationChange(i, 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
                            <HtmlEditor placeholder="Description" rows={6} value={c.description || ''} onChange={val => handleTranslationChange(i, 'description', val)} />
                          </div>
                          );
                      })}
                    </div>
                </div>
              </div>
              
              <div className="border border-slate-200 p-6 rounded-2xl bg-white space-y-4 mb-4">
                 <div>
                   <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block"></span>Live Class Details / Google Meet (Optional)</h3>
                   <p className="text-xs text-slate-500">Provide meet link and schedules that will be available to all enrolled students for this course.</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <div className="flex justify-between items-center">
                         <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Meet Link</label>
                         {meetEnabled && (
                           <button type="button" onClick={() => generateMeetLink(formData, setFormData)} className="text-xs text-indigo-600 font-bold hover:underline">Auto Generate</button>
                         )}
                      </div>
                      <input type="text" value={formData.meetingLink || ''} onChange={e=>setFormData({...formData, meetingLink: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" placeholder="https://meet.google.com/xxx-xxxx-xxx"/>
                   </div>
                   <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Date & Time</label>
                      <input type="datetime-local" value={formData.meetingDate || ''} onChange={e=>setFormData({...formData, meetingDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm"/>
                   </div>
                 </div>
                 <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Meeting Notes / Instructions</label>
                    <textarea value={formData.meetingNotes || ''} onChange={e=>setFormData({...formData, meetingNotes: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" rows={2} placeholder="E.g., Please read chapter 1 before joining..."></textarea>
                 </div>
                 <label className="flex items-center gap-2 mt-4 text-sm font-medium text-slate-800">
                   <input type="checkbox" checked={formData.notifyEnrolled || false} onChange={e=>setFormData({...formData, notifyEnrolled: e.target.checked})} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                   Send email notification with meeting details to enrolled members
                 </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition border border-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 transition rounded-lg">
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function UserManager() {
  const { user, token } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Failed to fetch users", data);
          setUsers([]);
        }
      })
      .catch(e => {
        console.error(e);
        setUsers([]);
      });
  };

  const handleEdit = (u: any) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setRole(u.role);
    setPassword('');
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete the user and all their associated data.")) return;
    await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
        await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(password ? { name, email, phone, role, password } : { name, email, phone, role })
        });
    }
    setFormOpen(false);
    fetchUsers();
  };

  const handleExport = () => {
    const rows = [
      ["Date", "Name", "Email", "Phone", "Role"],
      ...users.map(u => [
        `"${new Date(u.createdAt).toLocaleString()}"`,
        `"${u.name?.replace(/"/g, '""') || ''}"`,
        `"${u.email?.replace(/"/g, '""') || ''}"`,
        `"${u.phone?.replace(/"/g, '""') || ''}"`,
        `"${u.role || ''}"`
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-bold font-serif italic text-indigo-600">Users Management</h2>
        <button onClick={handleExport} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition shadow">
          Export to CSV
        </button>
      </div>

      <div className="p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 text-sm font-bold text-slate-800">
                  {u.name}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {u.email}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {u.phone || '-'}
                </td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-primary/10 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(u)} className="p-2 text-slate-400 hover:text-indigo-600 transition bg-white border border-slate-200 rounded-lg shadow-sm">
                      <Settings className="w-4 h-4" />
                    </button>
                    {u.id !== user?.id && (
                        <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-500 transition bg-white border border-slate-200 rounded-lg shadow-sm">
                        <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 text-sm italic font-serif">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold font-serif italic text-indigo-600">
                Edit User
              </h2>
              <button onClick={() => setFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Password (Leave blank to keep current)</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="New password" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition">
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setFormOpen(false)} className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition border border-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 transition rounded-lg">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const { user, token } = useStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ rating: 0, comment: '' });

  const fetchReviews = () => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(setReviews)
      .catch(console.error);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchReviews();
      else alert('Failed to delete review');
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      const res = await fetch(`/api/admin/reviews/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setEditId(null);
        fetchReviews();
      } else {
        alert('Failed to update review');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 font-sans tracking-tight">Review Management</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.map((r: any) => (
          <div key={r.id} className="border border-slate-100 rounded-xl p-6 hover:border-slate-200 transition-colors">
            {editId === r.id ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 0 })} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Comment</label>
                  <textarea rows={3} value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition"></textarea>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Save</button>
                  <button type="button" onClick={() => setEditId(null)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold">Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-sm text-gray-900">{r.user?.name || 'Unknown User'} <span className="text-slate-400 font-normal">({r.rating} Stars)</span></div>
                    <div className="text-xs text-slate-500 mt-1">
                      {r.course?.title ? `Course: ${r.course.title}` : ''}
                      {r.membership?.label ? `Membership: ${r.membership.label} (${r.membership.type})` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setEditId(r.id); setFormData({ rating: r.rating, comment: r.comment }); }} className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Edit</button>
                    <DeleteButton onDelete={() => handleDelete(r.id)} />
                  </div>
                </div>
                <p className="text-sm text-slate-700 mt-3 bg-slate-50 p-4 rounded-lg">{r.comment}</p>
                <div className="text-xs text-slate-400 mt-3">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && <div className="text-center text-slate-500 italic py-8">No reviews found.</div>}
      </div>
    </div>
  );
}

export function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` }});
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 font-sans tracking-tight">All Orders</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="p-4">Date</th>
              <th className="p-4">User & Billing</th>
              <th className="p-4">Item</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => {
              const billing = o.billingDetails ? JSON.parse(o.billingDetails) : null;
              return (
              <tr key={o.id} className="border-b border-slate-100/50 hover:bg-slate-50 text-sm">
                <td className="p-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className="font-bold">{o.user?.name}</span><br/>
                  <span className="text-xs text-slate-400">{o.user?.email}</span>
                  {billing && (
                     <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                       {billing.fullName}<br/>
                       {billing.address}, {billing.city}, {billing.country}
                     </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                     <span className="text-[10px] uppercase font-bold text-blue-500">{o.itemType}</span>
                     <span>{o.itemName}</span>
                  </div>
                </td>
                <td className="p-4">
                   <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">{o.paymentMethod}</span>
                   {o.paymentProofUrl && (
                     <a href={o.paymentProofUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-primary mt-1 underline">Proof</a>
                   )}
                </td>
                <td className="p-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${o.status === "COMPLETED" ? "bg-green-100 text-green-700" : o.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{o.status}</span>
                </td>
                <td className="p-4 font-bold text-indigo-600 text-right">${o.price}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BlogManager() {
  const { token, languages } = useStore();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState((languages || []).find((l:any) => l.isDefault)?.code || (languages || []).find((l:any) => l.isActive)?.code || 'en');
  
  const initialContents = languages.filter((l:any) => l.isActive).map((lang: any) => ({
    languageCode: lang.code, title: '', content: ''
  }));

  const [formData, setFormData] = useState({ 
    title: '', category: '', imageUrl: '', content: '', published: true, 
    translations: initialContents 
  });

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleTranslationChange = (index: number, field: string, value: string) => {
    const newTranslations = [...formData.translations];
    newTranslations[index] = { ...newTranslations[index], [field]: value };
    setFormData({ ...formData, translations: newTranslations });
  };

  const handleEdit = (blog: any) => {
    const mergedContents = languages.filter((l:any) => l.isActive).map((lang: any) => {
      const existing = (blog.translations || []).find((c: any) => c.languageCode === lang.code);
      if (existing) return existing;
      return { languageCode: lang.code, title: '', content: '' };
    });

    setFormData({
      title: blog.title || '',
      category: blog.category || '',
      imageUrl: blog.imageUrl || '',
      content: blog.content || '',
      published: blog.published !== false,
      translations: mergedContents
    });
    setEditingId(blog.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete blog?")) return;
    try {
      await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (e) {}
  };

  const handleSave = async () => {
    const defaultLangCode = languages.find((l:any) => l.isDefault)?.code || 'en';
    const baseTranslation = formData.translations.find((t: any) => t.languageCode === defaultLangCode) || formData.translations[0];
    const finalTitle = baseTranslation?.title || formData.title;
    const finalContent = baseTranslation?.content || formData.content || "";
    
    if (!finalTitle) return alert("Title required");
    
    try {
      const endpoint = editingId ? `/api/admin/blogs/${editingId}` : "/api/admin/blogs";
      const method = editingId ? "PUT" : "POST";
      await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          title: finalTitle,
          content: finalContent
        })
      });
      setFormOpen(false);
      setEditingId(null);
      setFormData({ 
        title: '', category: '', imageUrl: '', content: '', published: true, 
        translations: languages.filter((l:any) => l.isActive).map((lang: any) => ({
          languageCode: lang.code, title: '', content: ''
        }))
      });
      fetchBlogs();
    } catch (e) {}
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Manage Blogs</h2>
          <button onClick={() => {
            if (formOpen) {
              setFormOpen(false);
              setEditingId(null);
            } else {
              setFormData({ 
                title: '', category: '', imageUrl: '', content: '', published: true, 
                translations: languages.filter((l:any) => l.isActive).map((lang: any) => ({
                  languageCode: lang.code, title: '', content: ''
                }))
              });
              setFormOpen(true);
            }
          }} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-primary-dark transition">
            {formOpen ? "Cancel" : "+ Add Blog"}
          </button>
      </div>

      {formOpen && (
        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex bg-white rounded-lg border border-slate-200 p-1 mb-6 gap-2 w-max shadow-sm">
             {languages.filter((l:any)=>l.isActive).map((lang:any) => (
                <button
                   key={lang.code}
                   onClick={() => setActiveLangTab(lang.code)}
                   className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${activeLangTab === lang.code ? 'bg-primary text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                   {lang.name}
                </button>
             ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
             {formData.translations.map((c, i) => {
               if (c.languageCode !== activeLangTab) return null;
               return (
                 <div key={i} className="col-span-1 sm:col-span-2 space-y-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                     <input type="text" value={c.title} onChange={e=>handleTranslationChange(i, 'title', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2" placeholder="Blog Title" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Content (HTML)</label>
                     <HtmlEditor placeholder="Blog Content" rows={10} value={c.content} onChange={val=>handleTranslationChange(i, 'content', val)} />
                   </div>
                 </div>
               )
             })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 border-t border-slate-200 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
              <input type="text" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2" placeholder="e.g. Mindset" />
            </div>
            <MediaInput 
              label="Blog Header Image" 
              type="image" 
              value={formData.imageUrl} 
              onChange={val => setFormData({ ...formData, imageUrl: val })} 
            />
          </div>
          <div className="flex items-center gap-2 mb-6">
            <input type="checkbox" checked={formData.published} onChange={e=>setFormData({...formData, published: e.target.checked})} className="rounded text-primary focus:ring-primary" id="published-check" />
            <label htmlFor="published-check" className="text-sm font-medium text-slate-700">Published</label>
          </div>
          <div className="flex justify-end gap-3 text-sm">
             <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
             <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm hover:bg-indigo-700">Save Blog</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {blogs.map(blog => (
           <div key={blog.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col items-start relative group">
              {blog.imageUrl && <img src={blog.imageUrl} alt={blog.title} className="w-full h-40 object-cover" />}
              <div className="p-5 flex-1 w-full">
                {blog.category && <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-500 text-[10px] font-bold rounded-md mb-2">{blog.category}</span>}
                <h3 className="font-bold text-slate-800 text-base leading-tight mb-2 line-clamp-2">{blog.title}</h3>
                {!blog.published && <span className="text-xs text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded inline-block mb-2">Draft</span>}
              </div>
              <div className="p-4 border-t border-slate-100 w-full flex justify-between items-center bg-slate-50/50">
                <button onClick={() => handleEdit(blog)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">Edit</button>
                <DeleteButton onDelete={() => handleDelete(blog.id)} className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-red-50 transition" />
              </div>
           </div>
         ))}
         {blogs.length === 0 && <div className="col-span-full py-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50">No blogs found.</div>}
      </div>
    </div>
  );
}

export function TestimonialManager() {
  const { token } = useStore();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', text: '', image: '' });

  const fetchTestimonials = () => {
    fetch('/api/testimonials').then(r => r.json()).then(setTestimonials).catch(console.error);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', role: '', text: '', image: '' });
    setEditingId(null);
    setFormOpen(false);
  };

  const handleEdit = (t: any) => {
    setFormData({ name: t.name || '', role: t.role || '', text: t.text || '', image: t.image || '' });
    setEditingId(t.id);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete testimonial?')) return;
    try {
      await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTestimonials();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/admin/testimonials/${editingId}` : `/api/admin/testimonials`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchTestimonials();
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 font-sans tracking-tight">Testimonials Management</h3>
        <button onClick={() => { resetForm(); setFormOpen(true); }} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="p-3 border rounded-xl" required />
            <input type="text" placeholder="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="p-3 border rounded-xl" />
          </div>
          <MediaInput label="Reviewer Image" type="image" value={formData.image} onChange={(v) => setFormData({...formData, image: v})} />
          <textarea placeholder="Testimonial text" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full mt-4 p-3 border rounded-xl h-24" required></textarea>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm font-bold bg-white text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">Save</button>
          </div>
        </form>
      )}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="p-4">Name</th>
            <th className="p-4">Role</th>
            <th className="p-4">Text</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {testimonials.map(t => (
            <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 text-sm">
              <td className="p-4 font-bold flex items-center gap-2">
                {t.image && <img src={t.image} alt={t.name} className="w-8 h-8 rounded-full object-cover" />}
                {t.name}
              </td>
              <td className="p-4">{t.role}</td>
              <td className="p-4 lg:max-w-xs truncate text-slate-500">{t.text}</td>
              <td className="p-4 text-right space-x-2 whitespace-nowrap">
                <button onClick={() => handleEdit(t)} className="p-2 border rounded-lg text-xs bg-white text-slate-700 hover:bg-slate-50"><Settings className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
          {testimonials.length === 0 && (
            <tr><td colSpan={4} className="p-4 text-center text-slate-500 italic">No testimonials added yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


export function ReportManager() {
  const { token } = useStore();
  const [data, setData] = useState<{ courses: any[], orders: any[], users: any[], leads: any[] }>({ courses: [], orders: [], users: [], leads: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ dateRange: 'all', type: 'all', status: 'COMPLETED' });

  const fetchData = async () => {
    try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [coursesRes, ordersRes, usersRes, leadsRes] = await Promise.all([
            fetch('/api/courses'),
            fetch('/api/admin/orders', { headers }),
            fetch('/api/admin/users', { headers }),
            fetch('/api/admin/leads', { headers })
        ]);
        setData({
            courses: await coursesRes.json(),
            orders: await ordersRes.json(),
            users: await usersRes.json(),
            leads: await leadsRes.json()
        });
        setLoading(false);
    } catch(e) {
        console.error(e);
        setLoading(false);
    }
  }

  useEffect(() => { fetchData() }, []);

  const exportCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const exportOrders = () => exportCSV('orders_report.csv', ['Date', 'User Name', 'User Email', 'Item', 'Price', 'Type', 'Status'], filteredOrders.map(o => [new Date(o.createdAt).toLocaleDateString(), o.user?.name, o.user?.email, o.itemName, o.price, o.itemType, o.status || 'N/A']));
  
  const filteredOrders = data.orders.filter(o => {
      if (filter.status !== 'all' && o.status !== filter.status) return false;
      if (filter.type !== 'all' && o.itemType !== filter.type) return false;
      if (filter.dateRange !== 'all') {
         const d = new Date(o.createdAt);
         const now = new Date();
         if (filter.dateRange === 'today' && (d.getDate() !== now.getDate() || d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
         if (filter.dateRange === 'week' && (now.getTime() - d.getTime() > 7 * 24 * 60 * 60 * 1000)) return false;
         if (filter.dateRange === 'month' && (now.getTime() - d.getTime() > 30 * 24 * 60 * 60 * 1000)) return false;
      }
      return true;
  });

  const totalFilteredRevenue = filteredOrders.reduce((sum, o) => {
    if (o.status === 'COMPLETED') {
      return sum + (o.price || 0);
    }
    return sum;
  }, 0);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 font-sans tracking-tight">System Reports</h3>
        <button onClick={exportOrders} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition shadow">
          Export Filtered Orders (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Total Completed Orders</h4>
            <p className="text-3xl font-black text-indigo-950">{data.orders.filter((o:any)=>o.status === 'COMPLETED').length}</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Courses Sold (Completed)</h4>
            <p className="text-3xl font-black text-emerald-950">{data.orders.filter((o:any)=>o.itemType==='COURSE' && o.status === 'COMPLETED').length}</p>
        </div>
        <div className="p-6 bg-cyan-50 rounded-2xl border border-cyan-100">
            <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-2">Memberships Sold (Completed)</h4>
            <p className="text-3xl font-black text-cyan-950">{data.orders.filter((o:any)=>o.itemType==='MEMBERSHIP' && o.status === 'COMPLETED').length}</p>
        </div>
        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">Events Sold (Completed)</h4>
            <p className="text-3xl font-black text-amber-950">{data.orders.filter((o:any)=>(o.itemType==='EVENT' || o.itemType==='BOOKING') && o.status === 'COMPLETED').length}</p>
        </div>
      </div>
      
      <div className="border-t border-slate-100 pt-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
              <h4 className="font-bold text-lg text-gray-900">
                Filtered Order Details 
                <span className="ml-4 text-emerald-600">Revenue (Completed Only): ${totalFilteredRevenue.toFixed(2)}</span>
              </h4>
              <div className="flex gap-2">
                 <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})} className="border border-slate-200 rounded-lg p-2 text-sm bg-white mr-1.5 font-sans outline-none">
                      <option value="COMPLETED">Completed/Paid</option>
                      <option value="PENDING">Pending Approval</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="all">All Statuses</option>
                 </select>
                 <select value={filter.dateRange} onChange={e => setFilter({...filter, dateRange: e.target.value})} className="border border-slate-200 rounded-lg p-2 text-sm bg-white outline-none">
                     <option value="all">All Dates</option>
                     <option value="today">Today</option>
                     <option value="week">Last 7 Days</option>
                     <option value="month">Last 30 Days</option>
                 </select>
                 <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})} className="border border-slate-200 rounded-lg p-2 text-sm">
                     <option value="all">All Types</option>
                     <option value="COURSE">Courses</option>
                     <option value="MEMBERSHIP">Memberships</option>
                     <option value="BOOKING">Events/Booking</option>
                 </select>
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                      <tr>
                          <th className="p-4">Date</th>
                          <th className="p-4">User</th>
                          <th className="p-4">Item</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Price</th>
                      </tr>
                  </thead>
                  <tbody>
                      {filteredOrders.map((o: any, i: number) => (
                          <tr key={i} className="border-b border-slate-100 text-sm">
                              <td className="p-4 text-slate-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-slate-700">{o.user?.name || 'Anonymous'}</td>
                              <td className="p-4 font-semibold text-slate-900">{o.itemName}</td>
                              <td className="p-4 text-xs capitalize text-slate-500">{o.itemType?.toLowerCase()}</td>
                              <td className="p-4 text-xs">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      o.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                      o.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                  }`}>
                                      {o.status || "PENDING"}
                                  </span>
                              </td>
                              <td className="p-4 text-right font-bold text-slate-900">{formatCurrency(o.price, 'USD')}</td>
                          </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                          <tr>
                              <td colSpan={6} className="p-12 text-center text-slate-400 font-serif italic text-sm">
                                  No orders match current criteria.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}


export function SeoManager() {
  const { token } = useStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ id: string, type: string, name: string } | null>(null);
  const [seoData, setSeoData] = useState({ title: '', description: '', keywords: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/courses").then(r => r.json()).then(setCourses);
    fetch("/api/memberships").then(r => r.json()).then(setMemberships);
    fetch("/api/events").then(r => r.json()).then(setEvents);
  }, []);

  const loadSeo = async (item: any, type: string, name: string) => {
    setSelectedItem({ id: item.id, type, name });
    setSeoData({ title: '', description: '', keywords: '' });
    try {
       const res = await fetch(`/api/seo/${type}/${item.id}`);
       const result = await res.json();
       if (result && result.title !== undefined) {
         setSeoData({
            title: result.title || '',
            description: result.description || '',
            keywords: result.keywords || ''
         });
       }
    } catch(e) { }
  };

  const saveSeo = async () => {
    if (!selectedItem) return;
    setSaving(true);
    await fetch("/api/admin/seo", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        entityType: selectedItem.type,
        entityId: selectedItem.id,
        ...seoData
      })
    });
    setSaving(false);
    alert('SEO details updated!');
    setSelectedItem(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
      <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-2">SEO Manager</h2>
      <p className="text-sm text-slate-500 mb-8">Optimize metadata for search engines across all your items.</p>

      {selectedItem ? (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm max-w-2xl text-sm">
           <h3 className="font-bold text-lg mb-4 text-slate-800">Editing SEO: <span className="text-primary">{selectedItem.name}</span> <span className="text-xs uppercase bg-slate-200 text-slate-600 px-2 py-1 rounded-full ml-2">{selectedItem.type}</span></h3>
           <div className="space-y-4">
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Meta Title</label>
                 <input type="text" value={seoData.title} onChange={e => setSeoData({...seoData, title: e.target.value})} className="w-full border border-slate-200 rounded p-2" placeholder="e.g. Master React in 21 Days - Complete Course" />
                 <p className="text-[10px] text-slate-400 mt-1">Recommended: 50-60 characters</p>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Meta Description</label>
                 <textarea rows={3} value={seoData.description} onChange={e => setSeoData({...seoData, description: e.target.value})} className="w-full border border-slate-200 rounded p-2" placeholder="e.g. Learn React from scratch with real-world projects..."></textarea>
                 <p className="text-[10px] text-slate-400 mt-1">Recommended: 150-160 characters</p>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Keywords (Meta Tags)</label>
                 <input type="text" value={seoData.keywords} onChange={e => setSeoData({...seoData, keywords: e.target.value})} className="w-full border border-slate-200 rounded p-2" placeholder="e.g. react, programming, course, web development" />
              </div>
           </div>
           <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setSelectedItem(null)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold transition">Cancel</button>
              <button onClick={saveSeo} disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg font-bold shadow-sm disabled:opacity-50 transition">{saving ? 'Saving...' : 'Save Meta Data'}</button>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div>
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Courses</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                 {courses.map(c => (
                    <button key={c.id} onClick={() => loadSeo(c, 'COURSE', c.title)} className="w-full text-left p-3 text-smborder border-slate-100 rounded-lg hover:border-indigo-200 hover:bg-slate-50 transition font-bold text-slate-700 truncate block bg-white">
                      {c.title}
                    </button>
                 ))}
                 {courses.length === 0 && <span className="text-sm text-slate-400 italic font-serif">No courses available.</span>}
              </div>
           </div>
           <div>
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Memberships</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                 {memberships.map(m => (
                    <button key={m.id} onClick={() => loadSeo(m, 'MEMBERSHIP', m.label || m.type)} className="w-full text-left p-3 text-smborder border-slate-100 rounded-lg hover:border-indigo-200 hover:bg-slate-50 transition font-bold text-slate-700 truncate block bg-white">
                      {m.label || m.type}
                    </button>
                 ))}
                 {memberships.length === 0 && <span className="text-sm text-slate-400 italic font-serif">No memberships available.</span>}
              </div>
           </div>
           <div>
              <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Events</h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                 {events.map(e => (
                    <button key={e.id} onClick={() => loadSeo(e, 'EVENT', e.title)} className="w-full text-left p-3 text-smborder border-slate-100 rounded-lg hover:border-indigo-200 hover:bg-slate-50 transition font-bold text-slate-700 truncate block bg-white">
                       {e.title}
                    </button>
                 ))}
                 {events.length === 0 && <span className="text-sm text-slate-400 italic font-serif">No events available.</span>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
export function LeadsManager() {
  const { token } = useStore();
  const [leads, setLeads] = useState<any[]>([]);
  const [tab, setTab] = useState<'CONTACT' | 'NEWSLETTER'>('CONTACT');

  const fetchLeads = () => {
    fetch('/api/admin/leads', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(setLeads).catch(console.error);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const exportCSV = () => {
    const filtered = leads.filter(l => tab === 'CONTACT' ? l.source !== 'NEWSLETTER' && l.message !== 'Newsletter Subscription Request' : (l.source === 'NEWSLETTER' || l.message === 'Newsletter Subscription Request'));
    const rows = [
      ["Date", "Name", "Email", "Message", "Source"],
      ...filtered.map(l => [
        `"${new Date(l.createdAt).toLocaleString()}"`,
        `"${l.name?.replace(/"/g, '""') || ''}"`,
        `"${l.email?.replace(/"/g, '""') || ''}"`,
        `"${l.message?.replace(/"/g, '""') || ''}"`,
        `"${l.source || 'CONTACT_FORM'}"`
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${tab.toLowerCase()}_leads.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => tab === 'CONTACT' ? l.source !== 'NEWSLETTER' && l.message !== 'Newsletter Subscription Request' : (l.source === 'NEWSLETTER' || l.message === 'Newsletter Subscription Request'));

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 font-sans tracking-tight">Leads & Newsletters</h3>
        <button onClick={exportCSV} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition shadow">
          Export to CSV
        </button>
      </div>

      <div className="flex bg-slate-100/50 p-1 rounded-lg mb-6 gap-1 w-full max-w-full overflow-x-auto hidden-scrollbar">
        <button onClick={() => setTab('CONTACT')} className={`px-4 py-3 font-bold text-sm ${tab === 'CONTACT' ? 'border-b-2 border-primary text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Contact Form</button>
        <button onClick={() => setTab('NEWSLETTER')} className={`px-4 py-3 font-bold text-sm ${tab === 'NEWSLETTER' ? 'border-b-2 border-primary text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Newsletters</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="p-4">Date</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(t => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 text-sm align-top">
                <td className="p-4 whitespace-nowrap text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
                <td className="p-4 font-bold">{t.name}</td>
                <td className="p-4 text-indigo-600">{t.email}</td>
                <td className="p-4 whitespace-pre-wrap text-slate-600 max-w-md">{t.message}</td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500 italic">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PopupManager() {
  const { token, settings, setSettings } = useStore();
  const [status, setStatus] = useState('');
  const popupSettingStr = settings?.find((s:any) => s.key === 'WEBSITE_POPUP')?.value;
  const initPopup = popupSettingStr ? JSON.parse(popupSettingStr) : { enabled: false, type: 'IMAGE', content: '', linkUrl: '', displayMode: 'ONCE_PER_SESSION', delayMs: 1500 };
  
  if (!initPopup.displayMode) initPopup.displayMode = 'ONCE_PER_SESSION';
  if (initPopup.delayMs === undefined) initPopup.delayMs = 1500;

  const [popupConfig, setPopupConfig] = useState(initPopup);

  const saveSettings = async () => {
    setStatus('Saving...');
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ key: 'WEBSITE_POPUP', value: JSON.stringify(popupConfig) })
    });
    if(res.ok) {
       setStatus('Saved successfully!');
       const storeSettings = [...settings];
       const i = storeSettings.findIndex((s:any) => s.key === 'WEBSITE_POPUP');
       const updated = { key: 'WEBSITE_POPUP', value: JSON.stringify(popupConfig) };
       if(i >= 0) storeSettings[i] = updated;
       else storeSettings.push(updated);
       setSettings(storeSettings);
    } else {
       setStatus('Error saving settings.');
    }
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600">Website Popup settings</h2>
        <p className="text-slate-500 text-sm mt-2">Manage the universal promotional popup shown to visitors.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-4">
        <div className="space-y-6">
           
           <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
             <input type="checkbox" id="popupEnabled" checked={popupConfig.enabled} onChange={e => setPopupConfig({...popupConfig, enabled: e.target.checked})} className="w-5 h-5 accent-indigo-600 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
             <div>
                <label htmlFor="popupEnabled" className="font-bold text-base block text-slate-900 cursor-pointer">Enable Universal Website Popup</label>
                <p className="text-sm text-slate-500 mt-1">Turn this on to display a promotional popup to your website visitors based on the rules below.</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Display Frequency</label>
                  <select value={popupConfig.displayMode} onChange={e => setPopupConfig({...popupConfig, displayMode: e.target.value})} className="w-full border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition bg-white shadow-sm">
                     <option value="EVERY_TIME">Every Time (Multiple times per session)</option>
                     <option value="ONCE_PER_SESSION">Once Per Session (Resets when browser closes)</option>
                     <option value="ONCE_PER_DAY">Once Per Day</option>
                     <option value="SINGLE_TIME">Single Time (Once forever until cleared)</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-2">Control how often the same user sees this popup.</p>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Delay Before Showing (milliseconds)</label>
                  <input type="number" step="100" min="0" value={popupConfig.delayMs} onChange={e => setPopupConfig({...popupConfig, delayMs: parseInt(e.target.value) || 0})} className="w-full border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition shadow-sm" />
                  <p className="text-xs text-slate-400 mt-2">1000ms = 1 second. Example: 1500 for 1.5s delay.</p>
               </div>
           </div>
           
           <hr className="border-slate-100 my-6" />
           
           <div>
             <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Popup Content Type</label>
             <select value={popupConfig.type} onChange={e => setPopupConfig({...popupConfig, type: e.target.value as any})} className="border border-slate-200 rounded p-3 text-sm max-w-xs w-full focus:border-indigo-500 focus:ring-indigo-500 outline-none shadow-sm bg-white">
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="HTML">Custom HTML</option>
             </select>
           </div>

           {(popupConfig.type === 'IMAGE' || popupConfig.type === 'VIDEO') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-xl border border-slate-100 mt-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Media URL</label>
                    <MediaInput 
                       label="Popup Media"
                       type={popupConfig.type === 'IMAGE' ? 'image' : 'video'}
                       value={popupConfig.content}
                       onChange={v => setPopupConfig({...popupConfig, content: v})} 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Redirect Link (Optional)</label>
                    <input type="url" placeholder="https://..." value={popupConfig.linkUrl} onChange={e => setPopupConfig({...popupConfig, linkUrl: e.target.value})} className="w-full border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 shadow-sm" />
                    <p className="text-xs text-slate-500 mt-2">If provided, tapping the media will redirect to this link.</p>
                 </div>
              </div>
           )}

           {popupConfig.type === 'HTML' && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mt-4">
                 <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Custom HTML / Text</label>
                 <HtmlEditor value={popupConfig.content} onChange={v => setPopupConfig({...popupConfig, content: v})} />
              </div>
           )}
           
           <div className="pt-4 flex items-center justify-end border-t border-slate-100 mt-8 gap-4">
              {status && <span className="text-indigo-600 font-bold text-sm animate-pulse">{status}</span>}
              <button onClick={saveSettings} className="bg-primary text-white px-8 py-3 rounded text-sm font-bold shadow-md hover:bg-opacity-90 transition-all active:scale-95">Save Popup Configuration</button>
           </div>
        </div>
      </div>
    </div>
  );
}



export function PaymentSetupManager() {
  const { token } = useStore();
  const [stripeConfig, setStripeConfig] = useState({ enabled: false, publishableKey: '', secretKey: '' });
  const [manualConfig, setManualConfig] = useState({ enabled: false, bankDetails: '', qrCodeUrl: '', instructions: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sStripe = data.find((s:any) => s.key === 'STRIPE_CONFIG');
          const sManual = data.find((s:any) => s.key === 'MANUAL_PAYMENT_CONFIG');
          if(sStripe) setStripeConfig(JSON.parse(sStripe.value));
          if(sManual) setManualConfig(JSON.parse(sManual.value));
        }
      });
  }, [token]);

  const saveSettings = async (key: string, value: any) => {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ key, value: JSON.stringify(value) })
    });
    if (res.ok) setStatus('Saved Successfully!');
    else setStatus('Error Saving Settings');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="animate-in fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-serif italic text-indigo-600">Payment Gateways</h2>
        <p className="text-slate-500 text-sm mt-1">Configure your online and manual payment methods.</p>
        {status && <p className="text-green-600 font-bold mt-2">{status}</p>}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold mb-4 font-serif italic text-indigo-600">Stripe (Online Payments)</h3>
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={stripeConfig.enabled} onChange={e => setStripeConfig({...stripeConfig, enabled: e.target.checked})} className="w-5 h-5 accent-indigo-600 rounded" />
          <span className="font-bold text-slate-800">Enable Stripe Payments</span>
        </label>
        {stripeConfig.enabled && (
          <div className="space-y-4 max-w-lg mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Publishable Key</label>
              <input type="text" value={stripeConfig.publishableKey} onChange={e=>setStripeConfig({...stripeConfig, publishableKey: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Secret Key</label>
              <input type="password" value={stripeConfig.secretKey} onChange={e=>setStripeConfig({...stripeConfig, secretKey: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-slate-50" />
            </div>
          </div>
        )}
        <button onClick={() => saveSettings('STRIPE_CONFIG', stripeConfig)} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow hover:bg-opacity-90 transition">Save Stripe Config</button>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
        <h3 className="text-lg font-bold mb-4 font-serif italic text-indigo-600">Manual Payment (Bank Transfer / QR)</h3>
        <label className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={manualConfig.enabled} onChange={e => setManualConfig({...manualConfig, enabled: e.target.checked})} className="w-5 h-5 accent-indigo-600 rounded" />
          <span className="font-bold text-slate-800">Enable Manual Payments</span>
        </label>
        {manualConfig.enabled && (
          <div className="space-y-6 max-w-2xl mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Bank Account Details (Displayed to User)</label>
              <textarea value={manualConfig.bankDetails} onChange={e=>setManualConfig({...manualConfig, bankDetails: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-slate-50 min-h-[100px]" placeholder="Bank Name: XYZ\nAccount: 1234..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">QR Code Image URL (Optional)</label>
              <MediaInput label="QR Code" type="image" value={manualConfig.qrCodeUrl} onChange={v => setManualConfig({...manualConfig, qrCodeUrl: v})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Customer Instructions</label>
              <textarea value={manualConfig.instructions} onChange={e=>setManualConfig({...manualConfig, instructions: e.target.value})} className="w-full border p-3 rounded-lg text-sm bg-slate-50 min-h-[80px]" placeholder="Please upload a screenshot of your payment receipt after transferring." />
            </div>
          </div>
        )}
        <button onClick={() => saveSettings('MANUAL_PAYMENT_CONFIG', manualConfig)} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow hover:bg-opacity-90 transition">Save Manual Config</button>
      </div>
    </div>
  );
}

export function ManualPaymentApprovalManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState<{ type: string, message: string } | null>(null);
  const [confirmingRow, setConfirmingRow] = useState<{ orderId: string, status: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/orders/pending", { headers: { Authorization: `Bearer ${token}` }});
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  };

  const executeAction = async (id: string, status: string, reason?: string) => {
    setProcessingId(id);
    setActionStatus(null);
    setConfirmingRow(null);
    setRejectReason("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status, rejectReason: reason })
      });
      if (res.ok) {
        setActionStatus({ 
          type: 'success', 
          message: `Payment successfully ${status === 'COMPLETED' ? 'approved and items provisioned' : 'rejected'}.` 
        });
        fetchOrders();
      } else {
        const data = await res.json();
        setActionStatus({ type: 'error', message: data.error || 'Failed to update order status' });
      }
    } catch (err: any) {
      setActionStatus({ type: 'error', message: err.message || 'An unexpected error occurred' });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold font-serif italic text-indigo-600 mb-2">Manual Payment Approvals</h3>
      <p className="text-xs text-slate-500 mb-6 font-sans">Review and approve manual bank transfer payments submitted by students.</p>

      {actionStatus && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-sans flex items-start gap-2 border shadow-sm transition-all duration-300 ${
          actionStatus.type === 'error' 
            ? 'bg-red-50 border-red-100 text-red-800' 
            : 'bg-green-50 border-green-100 text-green-800'
        }`}>
          <div className="flex-1">
            <p className="font-bold uppercase text-[11px] tracking-wider mb-0.5">
              {actionStatus.type === 'error' ? 'Operation Failed' : 'Success'}
            </p>
            <p className="text-xs md:text-sm font-semibold">{actionStatus.message}</p>
          </div>
          <button onClick={() => setActionStatus(null)} className="text-inherit opacity-60 hover:opacity-100 text-xs font-bold font-mono px-1">✕</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="p-4">Date</th>
              <th className="p-4">User</th>
              <th className="p-4">Item</th>
              <th className="p-4">Total</th>
              <th className="p-4">Proof</th>
              <th className="p-4">Status</th>
              <th className="p-4 rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50 font-sans">
                <td className="p-4 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-sm font-bold">{o.user?.name}<br/><span className="text-xs text-slate-400 font-normal">{o.user?.email}</span></td>
                <td className="p-4">
                  <div className="flex flex-col">
                     <span className="text-[10px] uppercase font-bold text-blue-500">{o.itemType}</span>
                     <span className="text-sm font-semibold text-slate-800">{o.itemName}</span>
                  </div>
                </td>
                <td className="p-4 text-sm font-bold text-indigo-600">${o.price}</td>
                <td className="p-4">
                  {o.paymentProofUrl ? (
                    <a href={o.paymentProofUrl} target="_blank" rel="noreferrer" className="text-primary hover:text-black underline text-xs font-bold flex items-center gap-1 transition-colors">
                      <ExternalLink className="w-3 h-3" /> View Receipt
                    </a>
                  ) : <span className="text-xs text-slate-400">None</span>}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase border ${
                    o.status === 'REJECTED' 
                      ? 'bg-red-50 text-red-700 border-red-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {o.status || 'PENDING'}
                  </span>
                  {o.status === 'REJECTED' && o.rejectReason && (
                    <div className="text-[10px] text-red-500 mt-1 font-mono italic max-w-[150px] truncate" title={o.rejectReason}>
                      Reason: {o.rejectReason}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {processingId === o.orderId ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping"></span>
                      Updating...
                    </div>
                  ) : confirmingRow?.orderId === o.orderId ? (
                    <div className="flex flex-col gap-2 min-w-[200px] p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                        Confirm {confirmingRow.status === 'COMPLETED' ? 'Approve' : 'Reject'}?
                      </span>
                      {confirmingRow.status === 'REJECTED' && (
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Rejection reason (students will see this in their portal)..."
                          className="w-full text-xs p-1.5 border border-slate-200 rounded bg-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                          rows={2}
                        />
                      )}
                      <div className="flex items-center gap-1.5 justify-end">
                        <button 
                          onClick={() => executeAction(o.orderId, confirmingRow.status, confirmingRow.status === 'REJECTED' ? rejectReason : undefined)} 
                          className={`text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-colors ${
                            confirmingRow.status === 'COMPLETED' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => { setConfirmingRow(null); setRejectReason(""); }} 
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setConfirmingRow({ orderId: o.orderId, status: 'COMPLETED' })} 
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => setConfirmingRow({ orderId: o.orderId, status: 'REJECTED' })} 
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 shadow-sm cursor-pointer"
                      >
                        {o.status === 'REJECTED' ? 'Edit Rejection' : 'Reject'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-400 text-sm font-serif italic">
                  No pending or rejected manual payments.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-400 text-xs font-bold animate-pulse">
                  Loading manual payments...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PushNotificationManager() {
  const { token } = useStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return setStatus({ type: 'error', message: 'Title and body are required' });
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
       const res = await fetch('/api/admin/notifications/send', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
         body: JSON.stringify({ title, body, url })
       });
       const data = await res.json();
       if (data.error) throw new Error(data.error);
       setStatus({ type: 'success', message: `Sent to ${data.successCount} devices${data.failureCount ? ` (${data.failureCount} failed)` : ''}`});
       setTitle(''); setBody(''); setUrl('/');
    } catch(err: any) {
       setStatus({ type: 'error', message: err.message || 'Failed to send notification' });
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8">
      <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Send Push Notification</h2>
      <form onSubmit={handleSend} className="space-y-4 max-w-xl">
        {status.message && (
          <div className={`p-4 rounded-lg text-sm ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
             {status.message}
          </div>
        )}
        
        <div>
           <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
           <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required placeholder="E.g., New Course Available!" className="w-full border border-slate-200 rounded-lg px-4 py-2" />
        </div>
        <div>
           <label className="block text-sm font-bold text-slate-700 mb-1">Body / Message</label>
           <textarea value={body} onChange={e=>setBody(e.target.value)} required rows={3} placeholder="A short description of the notification..." className="w-full border border-slate-200 rounded-lg px-4 py-2"></textarea>
        </div>
        <div>
           <label className="block text-sm font-bold text-slate-700 mb-1">Target URL (Optional)</label>
           <input type="text" value={url} onChange={e=>setUrl(e.target.value)} placeholder="/courses" className="w-full border border-slate-200 rounded-lg px-4 py-2" />
           <p className="text-xs text-slate-500 mt-1">Users will be directed here when they click the notification.</p>
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
           {loading ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  )
}

export function PromoBadgeManager() {
  const { token, settings, setSettings } = useStore();
  const [status, setStatus] = useState('');
  const promoSettingStr = settings?.find((s:any) => s.key === 'PROMO_BADGE_CONFIG')?.value;
  
  // Backwards compatible parsing
  const parsedPromo = promoSettingStr ? JSON.parse(promoSettingStr) : {};
  const initPromo = { 
    enabled: parsedPromo.enabled ?? false, 
    badgeType: parsedPromo.badgeType ?? 'demo', 
    badgeText: parsedPromo.badgeText ?? 'Exclusive Offer', 
    message: parsedPromo.message ?? 'Flat 50% off on Premium collection!', 
    linkUrl: parsedPromo.linkUrl ?? '',
    bgColor: parsedPromo.bgColor ?? '',
    borderColor: parsedPromo.borderColor ?? '',
    textColor: parsedPromo.textColor ?? '',
    tagBgColor: parsedPromo.tagBgColor ?? '',
    tagTextColor: parsedPromo.tagTextColor ?? ''
  };
  
  const [promoConfig, setPromoConfig] = useState(initPromo);

  const saveSettings = async () => {
    setStatus('Saving...');
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ key: 'PROMO_BADGE_CONFIG', value: JSON.stringify(promoConfig) })
    });
    if(res.ok) {
       setStatus('Saved successfully!');
       const storeSettings = [...settings];
       const i = storeSettings.findIndex((s:any) => s.key === 'PROMO_BADGE_CONFIG');
       const updated = { key: 'PROMO_BADGE_CONFIG', value: JSON.stringify(promoConfig) };
       if(i >= 0) storeSettings[i] = updated;
       else storeSettings.push(updated);
       setSettings(storeSettings);
    } else {
       setStatus('Error saving settings.');
    }
    setTimeout(() => setStatus(''), 3000);
  };

  // Beautiful modern sub-component for picking colors
  const ColorPickerField = ({ 
    label, 
    value, 
    onChange, 
    presets = [
      '#d7b068', // Brand Nesrina Gold
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#10b981', // Emerald
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#0ea5e9', // Sky
      '#1e293b', // Slate / Charcoal
      '#64748b'  // Gray
    ] 
  }: { 
    label: string; 
    value: string; 
    onChange: (val: string) => void; 
    presets?: string[] 
  }) => {
    return (
      <div className="flex flex-col space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-xs">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2.5">
          {/* Custom color browser-native picker box */}
          <div 
            className="relative w-10 h-10 rounded-lg border border-slate-200 shadow-sm flex-shrink-0 cursor-pointer overflow-hidden group hover:scale-105 transition-transform" 
            style={{ backgroundColor: value || '#ffffff' }}
          >
            <input 
              type="color" 
              value={value || '#ffffff'} 
              onChange={e => onChange(e.target.value)} 
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
            />
            {!value && (
              <div className="absolute inset-0 flex items-center justify-center bg-white text-slate-400 text-[10px] font-bold">Def</div>
            )}
          </div>
          {/* Hex display input */}
          <input 
            type="text" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder="Theme Default" 
            className="flex-1 min-w-0 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-indigo-500 bg-white shadow-sm"
          />
          {value && (
            <button 
              type="button" 
              onClick={() => onChange('')} 
              className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 px-2.5 py-2 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
        {/* Preset colors pallet */}
        <div className="flex flex-wrap gap-1.5 mt-1 border-t border-slate-200/50 pt-2">
          {presets.map(color => (
            <button
              key={color}
              type="button"
              className="w-5.5 h-5.5 rounded-full border border-slate-200 hover:scale-110 active:scale-95 transition shadow-xs"
              style={{ backgroundColor: color }}
              title={color}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 font-sans">
        <h2 className="text-2xl font-serif italic font-bold text-violet-600">Dynamic Promo Badge settings</h2>
        <p className="text-slate-500 text-sm mt-2">Manage the homepage promo banner shown right before the slider. Choose your design styles, pick custom branding colors, and configure content.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-4 font-sans">
        <div className="space-y-6">
           
           <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
             <input type="checkbox" id="promoEnabled" checked={promoConfig.enabled} onChange={e => setPromoConfig({...promoConfig, enabled: e.target.checked})} className="w-5 h-5 accent-indigo-600 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
             <div>
                <label htmlFor="promoEnabled" className="font-bold text-base block text-slate-900 cursor-pointer">Enable Homepage Promo Badge</label>
                <p className="text-sm text-slate-500 mt-1">Turn this on to show a customizable announcement / offer badge before the main homepage image slider.</p>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Badge Styling Theme</label>
                  <select value={promoConfig.badgeType} onChange={e => setPromoConfig({...promoConfig, badgeType: e.target.value})} className="w-full border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition bg-white shadow-sm font-semibold">
                     <option value="demo">Exclusive Offer (Elegant Purple Theme)</option>
                     <option value="badge-tag">Version / Gray-Tag (Neutral Slate Theme)</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-2">Pick the brand accent variant that best matches your announcement.</p>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Badge Tag Label text</label>
                  <input type="text" value={promoConfig.badgeText} onChange={e => setPromoConfig({...promoConfig, badgeText: e.target.value})} className="w-full border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition shadow-sm font-bold" placeholder="e.g. Exclusive Offer, New Update, Version 7.8" />
                  <p className="text-xs text-slate-400 mt-2">Keep this short for high impact (e.g. 1-3 words).</p>
               </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Promo Announcement Message</label>
                  <input type="text" value={promoConfig.message} onChange={e => setPromoConfig({...promoConfig, message: e.target.value})} className="w-full border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition shadow-sm" placeholder="e.g. Flat 50% off on Premium collection!, Let's try our brand new course builder!" />
                  <p className="text-xs text-slate-400 mt-2">The core sentence explaining your announcement or offer details.</p>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Redirect URL / Link (Optional)</label>
                  <input type="text" value={promoConfig.linkUrl} onChange={e => setPromoConfig({...promoConfig, linkUrl: e.target.value})} className="w-full border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition shadow-sm" placeholder="e.g. /courses, /memberships, https://..." />
                  <p className="text-xs text-slate-400 mt-2">Redirect path or external link when users click on the banner badge.</p>
               </div>
           </div>

           {/* Brand Color Picker Panel */}
           <div className="border-t border-slate-100 pt-8 mt-8">
              <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded"></span>
                Custom Badge Coloring & Branding
              </h3>
              <p className="text-xs text-slate-500 mb-6">Customize the colors of your promotional badge. Clearing a color will revert that element to its theme's default style.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <ColorPickerField 
                   label="Outer Pill Background" 
                   value={promoConfig.bgColor || ''} 
                   onChange={val => setPromoConfig({...promoConfig, bgColor: val})} 
                 />
                 <ColorPickerField 
                   label="Outer Pill Border" 
                   value={promoConfig.borderColor || ''} 
                   onChange={val => setPromoConfig({...promoConfig, borderColor: val})} 
                 />
                 <ColorPickerField 
                   label="Outer Pill Message Text" 
                   value={promoConfig.textColor || ''} 
                   onChange={val => setPromoConfig({...promoConfig, textColor: val})} 
                 />
                 <ColorPickerField 
                   label="Inner Tag Background" 
                   value={promoConfig.tagBgColor || ''} 
                   onChange={val => setPromoConfig({...promoConfig, tagBgColor: val})} 
                 />
                 <ColorPickerField 
                   label="Inner Tag Text" 
                   value={promoConfig.tagTextColor || ''} 
                   onChange={val => setPromoConfig({...promoConfig, tagTextColor: val})} 
                 />
              </div>

              <div className="mt-4 flex justify-end">
                 <button 
                   type="button" 
                   onClick={() => setPromoConfig({
                     ...promoConfig,
                     bgColor: '',
                     borderColor: '',
                     textColor: '',
                     tagBgColor: '',
                     tagTextColor: ''
                   })} 
                   className="text-xs font-bold text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 bg-white hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
                 >
                   Reset All Colors to Default
                 </button>
              </div>
           </div>

           <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mt-8 font-sans">
              <span className="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Visual Live Preview</span>
              <div className="p-4 bg-white rounded-lg border border-slate-200 flex justify-center items-center">
                {promoConfig.badgeType === "badge-tag" ? (
                   <div 
                      style={{
                        backgroundColor: promoConfig.bgColor || undefined,
                        borderColor: promoConfig.borderColor || undefined,
                        color: promoConfig.textColor || undefined
                      }}
                      className={`flex items-center space-x-2.5 sm:space-x-3 border rounded-2xl sm:rounded-full p-1.5 md:p-2 pl-2 sm:pl-2.5 pr-3 sm:pr-4 md:pr-5 text-sm transition-all duration-300 ${promoConfig.bgColor ? 'border-gray-500/30' : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.08)]'}`}
                   >
                       <div 
                          style={{
                            backgroundColor: promoConfig.tagBgColor || undefined,
                            borderColor: promoConfig.borderColor || undefined
                          }}
                          className={`flex items-center space-x-1.5 shrink-0 border px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full transition-transform duration-300 ${promoConfig.tagBgColor ? '' : 'bg-white/10 backdrop-blur-sm border-white/15 text-secondary font-bold'}`}
                       >
                           <p 
                             style={{ color: promoConfig.tagTextColor || undefined }}
                             className="font-extrabold text-[10px] sm:text-[11px] md:text-xs tracking-wider uppercase whitespace-nowrap"
                           >
                             {promoConfig.badgeText || "Version 7.8"}
                           </p>
                       </div>
                       <p 
                         style={{ color: promoConfig.textColor || undefined }}
                         className="text-xs sm:text-sm font-semibold tracking-wide text-inherit md:text-base leading-snug sm:leading-normal pr-1 flex-1 min-w-0"
                       >
                         {promoConfig.message || "New feature is ready to use, let's try"}
                       </p>
                   </div>
                ) : (
                   <div 
                      style={{
                        backgroundColor: promoConfig.bgColor || undefined,
                        borderColor: promoConfig.borderColor || undefined,
                        color: promoConfig.textColor || undefined
                      }}
                      className={`flex items-center space-x-2.5 sm:space-x-3 border-2 rounded-2xl sm:rounded-full p-1.5 md:p-2 pl-2 sm:pl-2.5 pr-3 sm:pr-4 md:pr-5 text-sm transition-all duration-300 ${promoConfig.bgColor ? 'border-gray-500/30' : 'bg-primary/5 border-primary/15 text-primary shadow-[0_4px_16px_rgba(55,28,59,0.06)]'}`}
                   >
                       <div 
                          style={{
                            backgroundColor: promoConfig.tagBgColor || undefined,
                            borderColor: promoConfig.borderColor || undefined
                          }}
                          className={`flex items-center space-x-1.5 shrink-0 border px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full transition-transform duration-300 ${promoConfig.tagBgColor ? '' : 'bg-secondary text-white border-secondary shadow-[0_2px_8px_rgba(212,148,45,0.25)]'}`}
                       >
                           <p 
                             style={{ color: promoConfig.tagTextColor || undefined }}
                             className="font-extrabold text-[10px] sm:text-[11px] md:text-xs tracking-wider uppercase whitespace-nowrap"
                           >
                             {promoConfig.badgeText || "Exclusive Offer"}
                           </p>
                       </div>
                       <p 
                         style={{ color: promoConfig.textColor || undefined }}
                         className="text-xs sm:text-sm font-semibold tracking-wide text-inherit md:text-base leading-snug sm:leading-normal pr-1 flex-1 min-w-0"
                       >
                         {promoConfig.message || "Flat 50% off on Premium collection!"}
                       </p>
                   </div>
                )}
              </div>
           </div>

           <div className="pt-4 flex items-center justify-end border-t border-slate-100 mt-8 gap-4">
              {status && <span className="text-violet-600 font-bold text-sm animate-pulse">{status}</span>}
              <button onClick={saveSettings} className="bg-primary text-white px-8 py-3 rounded text-sm font-bold shadow-md hover:bg-opacity-90 transition-all active:scale-95">Save Promo Configuration</button>
           </div>
        </div>
      </div>
    </div>
  );
}

