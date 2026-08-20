const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const targetFunction = `  const handleDelete = async (id: string) => {`;
const repFunction = `  const handleQuickUpdateOrder = async (id: string, newOrder: number) => {
    try {
      await fetch(\`/api/admin/courses/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
        body: JSON.stringify({ order: newOrder })
      });
      setCourses(courses.map(c => c.id === id ? { ...c, order: newOrder } : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {`;

code = code.replace(targetFunction, repFunction);

const targetTd = `<td className="p-4 font-bold text-slate-800"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{c.order || 0}</span></td>`;
const repTd = `<td className="p-4 font-bold text-slate-800">
                  <input 
                    type="number" 
                    defaultValue={c.order || 0} 
                    onBlur={(e) => handleQuickUpdateOrder(c.id, parseInt(e.target.value) || 0)} 
                    className="w-16 px-2 py-1 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none" 
                  />
                </td>`;

code = code.replace(targetTd, repTd);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', code);
console.log("Updated AdminManagerComponents.tsx");
