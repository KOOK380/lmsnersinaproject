const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

// Membership Form
content = content.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\n\s*<input type="text" placeholder="Type/g,
  `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                <span className="text-sm font-bold text-slate-700">Active (Visible on Frontend)</span>
              </label>
              <input type="text" placeholder="Type`
);

// Event Form
content = content.replace(
  /<div className="grid grid-cols-2 gap-6">\n\s*<div className="col-span-2">\n\s*<label className="block text-sm font-bold text-slate-700 mb-1">Title<\/label>/g,
  `<div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                    <span className="text-sm font-bold text-slate-700">Active (Visible on Frontend)</span>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>`
);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
