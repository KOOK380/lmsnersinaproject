const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');

code = code.replace(
  'isFeatured, isUpcoming, isActive, language, level, duration',
  'isFeatured, isUpcoming, isActive, order, language, level, duration'
);

code = code.replace(
  'if (isFeatured !== undefined) updateData.isFeatured = isFeatured;',
  'if (isFeatured !== undefined) updateData.isFeatured = isFeatured;\n    if (order !== undefined) updateData.order = parseInt(order) || 0;'
);

fs.writeFileSync('src/api.ts', code);
console.log("Updated PUT block");
