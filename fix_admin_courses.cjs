const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

// add order to formData
code = code.replace(
  'isFeatured: false,',
  'order: 0,\n    isFeatured: false,'
);

// handle resetForm
code = code.replace(
  "isFeatured: false, isUpcoming: false, isActive: true, language: 'Arabic', level: 'Beginner Level', duration: '21 Days'",
  "order: 0, isFeatured: false, isUpcoming: false, isActive: true, language: 'Arabic', level: 'Beginner Level', duration: '21 Days'"
);

// handle handleEdit
code = code.replace(
  'isFeatured: c.isFeatured || false,',
  'order: c.order || 0,\n      isFeatured: c.isFeatured || false,'
);

// add input in the form
const targetInput = `                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status & Visibility</label>
                  <div className="flex flex-col gap-2 mt-2">`;
const replacementInput = `                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Sequence Order</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
` + targetInput;

code = code.replace(targetInput, replacementInput);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', code);
console.log("Updated admin courses form");
