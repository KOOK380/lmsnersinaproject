const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');

code = code.replace(
  'if (isFeatured !== undefined) updateData.isFeatured = isFeatured;\n    if (isUpcoming !== undefined) updateData.isUpcoming = isUpcoming;',
  'if (isFeatured !== undefined) updateData.isFeatured = isFeatured;\n    if (order !== undefined) updateData.order = parseInt(order) || 0;\n    if (isUpcoming !== undefined) updateData.isUpcoming = isUpcoming;'
);

fs.writeFileSync('src/api.ts', code);
