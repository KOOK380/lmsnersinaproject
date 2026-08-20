const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

code = code.replace(
  '<th className="p-4 rounded-l-xl">Title</th>',
  '<th className="p-4 rounded-l-xl">Order</th>\n                <th className="p-4">Title</th>'
);

code = code.replace(
  '<td className="p-4 font-bold text-slate-800">{c.title}</td>',
  '<td className="p-4 font-bold text-slate-800"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{c.order || 0}</span></td>\n                  <td className="p-4 font-bold text-slate-800">{c.title}</td>'
);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', code);
console.log("Updated admin courses table");
