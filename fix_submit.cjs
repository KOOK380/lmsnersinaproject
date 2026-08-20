const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replaceAll('const handleSubmit = async (e: React.FormEvent) => {', 'const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();');

fs.writeFileSync('src/App.tsx', code);
