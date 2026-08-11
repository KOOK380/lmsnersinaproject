const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

// Membership form initial state
content = content.replace(
  /type: 'STANDARD',\s*label: '',/g,
  `type: 'STANDARD',\n    isActive: true,\n    label: '',`
);

// Membership edit logic
content = content.replace(
  /type: membership\.type \|\| 'STANDARD',/g,
  `type: membership.type || 'STANDARD',\n      isActive: membership.isActive !== undefined ? membership.isActive : true,`
);

// Event form initial state
content = content.replace(
  /title: '', description: '', date: '',/g,
  `isActive: true, title: '', description: '', date: '',`
);

// Event edit logic
content = content.replace(
  /title: evt\.title,\n\s+description: evt\.description,/g,
  `isActive: evt.isActive !== undefined ? evt.isActive : true,\n      title: evt.title,\n      description: evt.description,`
);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
