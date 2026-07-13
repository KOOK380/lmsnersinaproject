const fs = require('fs');
const content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const replacement = `      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">WhatsApp Number</label>
              <input type="text" value={contactInfo.whatsapp} onChange={e=>setContactInfo({...contactInfo, whatsapp: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="+1234567890" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Telegram ID</label>
              <input type="text" value={contactInfo.telegram} onChange={e=>setContactInfo({...contactInfo, telegram: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="username" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone Number (Call Us Now)</label>
              <input type="text" value={contactInfo.phone} onChange={e=>setContactInfo({...contactInfo, phone: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="+1234567890" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
              <input type="email" value={contactInfo.email} onChange={e=>setContactInfo({...contactInfo, email: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="info@example.com" />
           </div>
           <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Location</label>
              <input type="text" value={contactInfo.location} onChange={e=>setContactInfo({...contactInfo, location: e.target.value})} className="w-full border border-slate-200 rounded p-2 text-sm" placeholder="Dubai, UAE" />
           </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
           <button onClick={() => saveSettings('CONTACT_INFO', contactInfo)} className="bg-primary text-white px-4 py-2 rounded text-sm font-bold shadow-sm">Save Contact Info</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Currency Settings</h2>`;

const updatedContent = content.replace(/<div className="bg-white rounded-2xl border border-slate-200\/60 p-6 md:p-8 mt-8">\s*<h2 className="text-2xl font-serif italic font-bold text-indigo-600 mb-6">Currency Settings<\/h2>/g, replacement);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', updatedContent);
