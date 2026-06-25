const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

// Update PopupManager
const popupOriginal = `export function PopupManager() {
  const { token, settings, setSettings } = useStore();
  const [status, setStatus] = useState('');
  const popupSettingStr = settings?.find((s:any) => s.key === 'WEBSITE_POPUP')?.value;
  const initPopup = popupSettingStr ? JSON.parse(popupSettingStr) : { enabled: false, type: 'IMAGE', content: '', linkUrl: '', displayMode: 'ONCE_PER_SESSION', delayMs: 1500 };
  
  if (!initPopup.displayMode) initPopup.displayMode = 'ONCE_PER_SESSION';
  if (initPopup.delayMs === undefined) initPopup.delayMs = 1500;

  const [popupConfig, setPopupConfig] = useState(initPopup);`;

const popupNew = `export function PopupManager() {
  const { token, settings, setSettings, languages } = useStore();
  const [status, setStatus] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const settingKey = selectedLanguage === "en" ? 'WEBSITE_POPUP' : \`WEBSITE_POPUP_\${selectedLanguage}\`;

  const [popupConfig, setPopupConfig] = useState({ enabled: false, type: 'IMAGE', content: '', linkUrl: '', displayMode: 'ONCE_PER_SESSION', delayMs: 1500 });

  useEffect(() => {
    const popupSettingStr = settings?.find((s:any) => s.key === settingKey)?.value;
    const initPopup = popupSettingStr ? JSON.parse(popupSettingStr) : { enabled: false, type: 'IMAGE', content: '', linkUrl: '', displayMode: 'ONCE_PER_SESSION', delayMs: 1500 };
    if (!initPopup.displayMode) initPopup.displayMode = 'ONCE_PER_SESSION';
    if (initPopup.delayMs === undefined) initPopup.delayMs = 1500;
    setPopupConfig(initPopup);
  }, [selectedLanguage, settings, settingKey]);`;

content = content.replace(popupOriginal, popupNew);

// Update PopupManager Save
const popupSaveOrig = `  const saveSettings = async () => {
    setStatus('Saving...');
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
      body: JSON.stringify({ key: 'WEBSITE_POPUP', value: JSON.stringify(popupConfig) })
    });
    if(res.ok) {
       setStatus('Saved successfully!');
       const storeSettings = [...settings];
       const i = storeSettings.findIndex((s:any) => s.key === 'WEBSITE_POPUP');
       const updated = { key: 'WEBSITE_POPUP', value: JSON.stringify(popupConfig) };`;

const popupSaveNew = `  const saveSettings = async () => {
    setStatus('Saving...');
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
      body: JSON.stringify({ key: settingKey, value: JSON.stringify(popupConfig) })
    });
    if(res.ok) {
       setStatus('Saved successfully!');
       const storeSettings = [...settings];
       const i = storeSettings.findIndex((s:any) => s.key === settingKey);
       const updated = { key: settingKey, value: JSON.stringify(popupConfig) };`;

content = content.replace(popupSaveOrig, popupSaveNew);

// Update PopupManager Header
const popupHeaderOrig = `<div className="mb-8">
        <h2 className="text-2xl font-serif italic font-bold text-indigo-600">Website Popup settings</h2>
        <p className="text-slate-500 text-sm mt-2">Manage the universal promotional popup shown to visitors.</p>
      </div>`;

const popupHeaderNew = `<div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif italic font-bold text-indigo-600">Website Popup settings</h2>
          <p className="text-slate-500 text-sm mt-2">Manage the universal promotional popup shown to visitors.</p>
        </div>
        <div className="flex items-center gap-3">
           <label className="text-sm font-bold text-slate-700">Language:</label>
           <select
             value={selectedLanguage}
             onChange={(e) => setSelectedLanguage(e.target.value)}
             className="border border-slate-200 rounded p-1.5 text-sm bg-white"
           >
              <option value="en">English (Default)</option>
              {languages.filter(l => l.code !== 'en').map(l => (
                 <option key={l.code} value={l.code}>{l.name}</option>
              ))}
           </select>
        </div>
      </div>`;

content = content.replace(popupHeaderOrig, popupHeaderNew);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
