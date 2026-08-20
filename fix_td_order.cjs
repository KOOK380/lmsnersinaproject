const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const target = `<td className="p-4 font-semibold text-slate-800"><div className="flex items-center gap-2">{course.title}`;

const replacement = `<td className="p-4">
                    <input 
                      type="number" 
                      defaultValue={course.order || 0} 
                      onBlur={(e) => handleQuickUpdateOrder(course.id, parseInt(e.target.value) || 0)} 
                      className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none font-bold text-center shadow-sm" 
                    />
                  </td>\n                  <td className="p-4 font-semibold text-slate-800"><div className="flex items-center gap-2">{course.title}`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', code);
console.log("Updated AdminManagerComponents.tsx table rows");
