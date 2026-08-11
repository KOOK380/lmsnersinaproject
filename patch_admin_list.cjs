const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

// Event List
content = content.replace(
  /<div className="font-bold text-slate-800">\{evt\.title\}<\/div>/g,
  `<div className="font-bold text-slate-800">{evt.title} {!evt.isActive && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">INACTIVE</span>}</div>`
);

// Membership List
content = content.replace(
  /<div className="font-bold text-slate-800">\{m\.label \|\| m\.type\}<\/div>/g,
  `<div className="font-bold text-slate-800">{m.label || m.type} {!m.isActive && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">INACTIVE</span>}</div>`
);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
