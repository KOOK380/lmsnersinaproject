const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const targetStr = `<button type="button" onClick={() => generateMeetLink(formData, setFormData)} className="text-xs text-emerald-600 font-bold hover:underline">Auto Generate</button>`;
const replStr = `{meetEnabled && <button type="button" onClick={() => generateMeetLink(formData, setFormData)} className="text-xs text-emerald-600 font-bold hover:underline">Auto Generate</button>}`;

code = code.split(targetStr).join(replStr);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', code, 'utf8');
console.log('replaced in AdminManagerComponents.tsx');
