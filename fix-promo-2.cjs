const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');

const promoOrig = `export function PromoBadgeManager() {
  const { token, settings, setSettings } = useStore();
  const [status, setStatus] = useState('');
  
  const promoSettingStr = settings?.find((s:any) => s.key === 'PROMO_BADGE_CONFIG')?.value;
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

  const settingKey = selectedLanguage === "en" ? 'PROMO_BADGE_CONFIG' : \`PROMO_BADGE_CONFIG_\${selectedLanguage}\`;

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
      body: JSON.stringify({ key: 'PROMO_BADGE_CONFIG', value: JSON.stringify(promoConfig) })
    });
    if(res.ok) {
       setStatus('Saved successfully!');
       const storeSettings = [...settings];
       const i = storeSettings.findIndex((s:any) => s.key === 'PROMO_BADGE_CONFIG');
       const updated = { key: 'PROMO_BADGE_CONFIG', value: JSON.stringify(promoConfig) };`;

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

fs.writeFileSync('src/pages/AdminManagerComponents.tsx', content);
