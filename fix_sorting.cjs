const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const targetFunction = `      setCourses(courses.map(c => c.id === id ? { ...c, order: newOrder } : c));`;
const repFunction = `      setCourses(courses.map(c => c.id === id ? { ...c, order: newOrder } : c).sort((a,b) => (a.order||0) - (b.order||0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));`;

code = code.replace(targetFunction, repFunction);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', code);
console.log("Updated sorting logic");
