const fs = require('fs');
let content = fs.readFileSync('./src/pages/AdminManagerComponents.tsx', 'utf8');

content = content.replace(
  /<div className="grid grid-cols-2 gap-6 mt-4">\s*<div className="space-y-2">\s*<label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Duration<\/label>/,
  '<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">\n              <div className="space-y-2">\n                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Duration</label>'
);

content = content.replace(
  /<div className="space-y-2 mt-4 col-span-2">\s*<label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Labels \(Comma Separated\)<\/label>/,
  `<div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Level</label>
                 <input type="text" placeholder="e.g. Beginner Level" value={formData.level || ''} onChange={e=>setFormData({...formData, level: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" />
              </div>
              <div className="space-y-2 mt-4 col-span-1 md:col-span-3">
                 <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Labels (Comma Separated)</label>`
);

fs.writeFileSync('./src/pages/AdminManagerComponents.tsx', content);
