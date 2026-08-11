const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

// Event Button
content = content.replace(
  /<button onClick=\{\(\) => handleEdit\(evt\)\} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">/g,
  `<button onClick={async (e) => {
                         e.stopPropagation();
                         await fetch(\`/api/admin/events/\${evt.id}\`, {
                           method: 'PUT',
                           headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
                           body: JSON.stringify({ isActive: !evt.isActive })
                         });
                         fetchEvents();
                     }} className={\`px-2.5 py-0.5 rounded border text-[10px] uppercase tracking-widest font-bold transition-colors \${evt.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}\`}>
                       {evt.isActive ? 'Active' : 'Disabled'}
                     </button>
                     <button onClick={() => handleEdit(evt)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">`
);

// Membership Button
content = content.replace(
  /<button onClick=\{\(\) => handleEdit\(m\)\} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">/g,
  `<button onClick={async (e) => {
                         e.stopPropagation();
                         await fetch(\`/api/admin/memberships/\${m.id}\`, {
                           method: 'PUT',
                           headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
                           body: JSON.stringify({ isActive: !m.isActive })
                         });
                         fetchMemberships();
                     }} className={\`px-2.5 py-0.5 rounded border text-[10px] uppercase tracking-widest font-bold transition-colors \${m.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}\`}>
                       {m.isActive ? 'Active' : 'Disabled'}
                     </button>
                     <button onClick={() => handleEdit(m)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">`
);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
