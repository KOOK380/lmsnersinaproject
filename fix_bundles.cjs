const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');

// Remove from courseBundle.create
code = code.replace(
  '      order: parseInt(order) || 0,\n      title,',
  '      title,'
);

// Remove from courseBundle.update
code = code.replace(
  '    if (order !== undefined) updateData.order = parseInt(order) || 0;\n',
  ''
);

fs.writeFileSync('src/api.ts', code);
console.log("Fixed bundles in api.ts");
