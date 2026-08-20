const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

code = code.replace(
  '<MediaInput label="Reviewer Image" type="image" value={formData.image} onChange={(v) => setFormData({...formData, image: v})} />',
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><MediaInput label="Reviewer Image" type="image" value={formData.image} onChange={(v) => setFormData({...formData, image: v})} /><MediaInput label="Video URL" type="video" value={formData.videoUrl} onChange={(v) => setFormData({...formData, videoUrl: v})} /></div>'
);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', code);
