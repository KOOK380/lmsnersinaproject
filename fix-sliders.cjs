const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const origSlider1 = `export function SliderManager() {
  const [sliders, setSliders] = useState<any[]>([]);
  const { token } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', linkUrl: '' });`;

const newSlider1 = `export function SliderManager() {
  const [sliders, setSliders] = useState<any[]>([]);
  const { token, languages } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', linkUrl: '', languageCode: 'en' });`;

content = content.replace(origSlider1, newSlider1);

const origSlider2 = `  const handleEdit = (slider: any) => {
    setEditId(slider.id);
    setFormData({
      title: slider.title || '',
      imageUrl: slider.imageUrl || '',
      linkUrl: slider.linkUrl || ''
    });
    setShowAdd(true);
  };`;

const newSlider2 = `  const handleEdit = (slider: any) => {
    setEditId(slider.id);
    setFormData({
      title: slider.title || '',
      imageUrl: slider.imageUrl || '',
      linkUrl: slider.linkUrl || '',
      languageCode: slider.languageCode || 'en'
    });
    setShowAdd(true);
  };`;

content = content.replace(origSlider2, newSlider2);

const origSlider3 = `          <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition" required />
          <input type="url" placeholder="Link URL (optional)" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition" />`;

const newSlider3 = `          <select value={formData.languageCode} onChange={e => setFormData({...formData, languageCode: e.target.value})} className="border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition">
             <option value="en">English (Default)</option>
             {languages.filter((l: any) => l.code !== 'en').map((l: any) => (
                <option key={l.code} value={l.code}>{l.name}</option>
             ))}
          </select>
          <input type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition" required />
          <input type="url" placeholder="Link URL (optional)" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} className="border border-slate-200 rounded p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition" />`;

content = content.replace(origSlider3, newSlider3);

const origSlider4 = `              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-4">Title</th>
              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-4">Status</th>
              <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider py-4">Actions</th>`;

const newSlider4 = `              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-4">Title</th>
              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-4">Lang</th>
              <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider py-4">Status</th>
              <th className="text-right text-xs font-bold text-slate-500 uppercase tracking-wider py-4">Actions</th>`;

content = content.replace(origSlider4, newSlider4);

const origSlider5 = `              <td className="py-4 font-bold text-slate-800">{slider.title}</td>
              <td className="py-4">
                <span className={\`px-2.5 py-1 text-xs font-bold rounded-full \${slider.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}\`}>
                  {slider.active ? 'Active' : 'Inactive'}
                </span>
              </td>`;

const newSlider5 = `              <td className="py-4 font-bold text-slate-800">{slider.title}</td>
              <td className="py-4 font-medium text-slate-600">{slider.languageCode}</td>
              <td className="py-4">
                <span className={\`px-2.5 py-1 text-xs font-bold rounded-full \${slider.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}\`}>
                  {slider.active ? 'Active' : 'Inactive'}
                </span>
              </td>`;

content = content.replace(origSlider5, newSlider5);


fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
