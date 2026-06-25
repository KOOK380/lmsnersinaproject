const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const promoOrig = `export function PromoBadgeManager() {
  const { token, settings, setSettings } = useStore();
  const [status, setStatus] = useState('');
  
  const promoSettingStr = settings?.find((s:any) => s.key === 'PROMO_BADGE')?.value;
  const parsedPromo = promoSettingStr ? JSON.parse(promoSettingStr) : {};
  const initPromo = { 
    enabled: parsedPromo.enabled ?? false, 
    badgeType: parsedPromo.badgeType ?? 'demo', 
    badgeText: parsedPromo.badgeText ?? 'Exclusive Offer', 
    message: parsedPromo.message ?? 'Flat 50% off on Premium collection!', 
    linkUrl: parsedPromo.linkUrl ?? '',
    bgColor: parsedPromo.bgColor ?? '',
    borderColor: parsedPromo.borderColor ?? '',
    textColor: parsedPromo.textColor ?? '',
    tagBgColor: parsedPromo.tagBgColor ?? '',
    tagTextColor: parsedPromo.tagTextColor ?? ''
  };

  const [promoConfig, setPromoConfig] = useState(initPromo);`;

const promoNew = `export function PromoBadgeManager() {
  const { token, settings, setSettings, languages } = useStore();
  const [status, setStatus] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const settingKey = selectedLanguage === "en" ? 'PROMO_BADGE' : \`PROMO_BADGE_\${selectedLanguage}\`;

  const [promoConfig, setPromoConfig] = useState({ 
    enabled: false, 
    badgeType: 'demo', 
    badgeText: 'Exclusive Offer', 
    message: 'Flat 50% off on Premium collection!', 
    linkUrl: '',
    bgColor: '',
    borderColor: '',
    textColor: '',
    tagBgColor: '',
    tagTextColor: ''
  });

  useEffect(() => {
    const promoSettingStr = settings?.find((s:any) => s.key === settingKey)?.value;
    const parsedPromo = promoSettingStr ? JSON.parse(promoSettingStr) : {};
    setPromoConfig({ 
      enabled: parsedPromo.enabled ?? false, 
      badgeType: parsedPromo.badgeType ?? 'demo', 
      badgeText: parsedPromo.badgeText ?? 'Exclusive Offer', 
      message: parsedPromo.message ?? 'Flat 50% off on Premium collection!', 
      linkUrl: parsedPromo.linkUrl ?? '',
      bgColor: parsedPromo.bgColor ?? '',
      borderColor: parsedPromo.borderColor ?? '',
      textColor: parsedPromo.textColor ?? '',
      tagBgColor: parsedPromo.tagBgColor ?? '',
      tagTextColor: parsedPromo.tagTextColor ?? ''
    });
  }, [selectedLanguage, settings, settingKey]);`;

content = content.replace(promoOrig, promoNew);

const promoSaveOrig = `  const saveSettings = async () => {
    setStatus('Saving...');
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
      body: JSON.stringify({ key: 'PROMO_BADGE', value: JSON.stringify(promoConfig) })
    });
    if(res.ok) {
       setStatus('Saved successfully!');
       const storeSettings = [...settings];
       const i = storeSettings.findIndex((s:any) => s.key === 'PROMO_BADGE');
       const updated = { key: 'PROMO_BADGE', value: JSON.stringify(promoConfig) };`;

const promoSaveNew = `  const saveSettings = async () => {
    setStatus('Saving...');
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
      body: JSON.stringify({ key: settingKey, value: JSON.stringify(promoConfig) })
    });
    if(res.ok) {
       setStatus('Saved successfully!');
       const storeSettings = [...settings];
       const i = storeSettings.findIndex((s:any) => s.key === settingKey);
       const updated = { key: settingKey, value: JSON.stringify(promoConfig) };`;

content = content.replace(promoSaveOrig, promoSaveNew);

const promoHeaderOrig = `<div className="mb-8">
        <h2 className="text-2xl font-serif italic font-bold text-violet-600">Dynamic Promo Badge settings</h2>
        <p className="text-slate-500 text-sm mt-2">Manage the sticky promo badge shown at the bottom of the screen.</p>
      </div>`;

const promoHeaderNew = `<div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif italic font-bold text-violet-600">Dynamic Promo Badge settings</h2>
          <p className="text-slate-500 text-sm mt-2">Manage the sticky promo badge shown at the bottom of the screen.</p>
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

content = content.replace(promoHeaderOrig, promoHeaderNew);

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
