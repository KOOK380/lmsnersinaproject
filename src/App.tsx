import React, { useEffect, useState, useRef, forwardRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore, getTranslated } from "./store";
import { ShoppingCart, BookOpen, Menu, X, Heart, Globe, Instagram, Youtube, Linkedin, Check, ChevronLeft, ChevronRight, MapPin, Phone, Mail } from "lucide-react";

import { Courses, CourseDetails, Memberships, Events, MembershipDetails, EventDetails, BundleDetails, BlogList, BlogDetails } from "./pages/FrontPages";
import { Cart, Dashboard, CoursePlayer, Wishlist } from "./pages/UserPages";
import { Admin } from "./pages/Admin";
import { AboutUs } from "./pages/AboutUs";
import { ContactUs } from "./pages/ContactUs";
import { formatCurrency, stripHtml } from "./lib/utils";
import { countryCodes } from "./lib/countryCodes";

import { PushNotificationPrompt } from "./components/PushNotificationPrompt";
import BadgeTag from "./components/ui/badge-tag";
import DemoBadge from "./components/ui/demo";

// --- LAYOUT & COMPONENTS ---
import { NavHeader, Tab } from "./components/ui/nav-header";
import { TestimonialsColumn } from "./components/ui/testimonials-columns-1";
import { motion, AnimatePresence } from "motion/react";

function Navbar() {
  const { user, cart, favorites, setAuthModalOpen, setUser, language, setLanguage, languages, categories, getCartTotal, currency, settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalCartItems = cart.length;
  const totalFavorites = favorites?.length || 0;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const lng = e.target.value;
     setLanguage(lng);
     i18n.changeLanguage(lng);
  };

  const designSettingStr = settings?.find((s:any) => s.key === 'EMAIL_DESIGN')?.value;
  const design = designSettingStr ? JSON.parse(designSettingStr) : null;
  const logoUrl = design?.logoUrl || '';

  return (
    <header className="bg-white text-ink sticky top-0 z-50 border-b border-gray-200" style={design?.headerColor ? { backgroundColor: design.headerColor } : {}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between py-4 gap-4">
          <Link to="/" className="text-4xl font-bold italic font-serif flex items-center shrink-0 tracking-tighter" style={{ fontFamily: 'cursive' }}>
            {logoUrl ? <img src={logoUrl} alt="Logo" className="max-h-12 object-contain" /> : 'Nesrina'}
          </Link>

          {/* Search Bar */}
          <div className="hidden xl:flex flex-1 max-w-2xl mx-8">
            <div className="flex w-full items-center border border-gray-200 rounded-full overflow-hidden bg-white h-12 shadow-sm transition focus-within:ring-2 focus-within:ring-primary/20 bg-transparent pr-1">
               <select className="px-4 text-sm text-gray-600 border-r border-gray-200 bg-transparent h-full focus:outline-none cursor-pointer max-w-[160px] truncate leading-10">
                 <option value="">{t('home.all_categories', 'All categories')}</option>
                 {categories.filter((c: any) => c.name.toLowerCase() !== 'membership' && c.name.toLowerCase() !== 'memberships').map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
              <input 
                type="text" 
                placeholder={t('home.search_placeholder', 'What do you want to learn?...')} 
                className="flex-1 px-4 py-2 border-none focus:outline-none text-sm w-full min-w-0 placeholder-gray-400 h-full"
              />
              <button className="bg-primary hover:bg-primary-dark transition text-white px-6 h-full flex items-center justify-center gap-2 font-bold shrink-0 rounded-full my-1">
                {t('home.search', 'Search')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden xl:flex items-center gap-4 shrink-0">
            {!user ? (
                <button 
                  onClick={() => {
                    // Open auth modal with login view
                    setAuthModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary-dark shadow text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wide"
                >
                  {t('nav.login')} / {t('nav.register')}
                </button>
            ) : (
                <div className="flex items-center gap-4">
                  <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition flex items-center gap-1">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-primary">{user.name.charAt(0)}</div>
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="text-[10px] font-bold text-black bg-yellow-400 px-2 py-1 rounded">{t('nav.admin')}</Link>
                  )}
                  <button 
                    onClick={() => setUser(null, null)}
                    className="text-xs font-bold uppercase hover:text-red-500 transition"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
            )}
            <div className="flex items-center gap-1 ml-4 text-xs font-medium text-gray-500 cursor-pointer">
               <Globe className="w-4 h-4" />
               <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent text-xs focus:outline-none uppercase font-semibold cursor-pointer"
               >
                 {languages && languages.length > 0 ? (
                   [...languages].filter(l => l.isActive).sort((a,b) => b.isDefault ? 1 : -1).map((l: any) => (
                     <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>
                   ))
                 ) : (
                   <>
                     <option value="en">EN</option>
                     <option value="ar">AR</option>
                     <option value="fr">FR</option>
                   </>
                 )}
               </select>
            </div>
          </div>

          <div className="xl:hidden flex items-center gap-4">
             {user ? (
               <Link to="/dashboard" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-primary shadow-sm border border-slate-200">
                 {user.name.charAt(0)}
               </Link>
             ) : (
               <button onClick={() => setAuthModalOpen(true)} className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-full shadow-sm">
                 {t('nav.login')}
               </button>
             )}
             <Link to="/cart" className="relative hover:opacity-80 transition flex items-center">
                <ShoppingCart className="w-6 h-6 stroke-[1.5] text-ink" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#d7b068] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {totalCartItems}
                </span>
             </Link>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-ink ml-2">
                {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="hidden xl:flex items-center gap-8 py-3 w-full border-t border-gray-50">
           <div className="flex items-center gap-8 flex-1">
              <Link to="/" className="text-[15px] font-bold text-ink hover:text-primary transition">{t('nav.home')}</Link>
              <Link to="/about" className="text-[15px] font-bold text-ink hover:text-primary transition">{t('footer.about_title')} Nesrina</Link>
              <Link to="/courses" className="text-[15px] font-bold text-ink hover:text-primary transition">{t('nav.courses')}</Link>
              <Link to="/events" className="text-[15px] font-bold text-ink hover:text-primary transition">{t('nav.events', 'Events')}</Link>
              <Link to="/contact" className="text-[15px] font-bold text-ink hover:text-primary transition">{t('nav.contact')}</Link>
           </div>
           
           <div className="flex items-center gap-8 shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[11px] text-gray-500 font-medium">{t('nav.call_us_now', 'Call us Now!')}</span>
                    <span className="text-[15px] font-bold text-[#0f172a] tracking-tight" dir="ltr">{t('nav.phone', '+971 55 780 0863')}</span>
                 </div>
              </div>

              <div className="flex items-center gap-6 border-l border-gray-200 pl-6 text-ink">
                 <Link to="/wishlist" className="relative hover:opacity-80 transition flex items-center">
                    <Heart className="w-6 h-6 stroke-[1.5]" />
                    <span className="absolute -top-1.5 -right-1.5 bg-[#d7b068] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {totalFavorites}
                    </span>
                 </Link>
                 <Link to="/cart" className="relative hover:opacity-80 transition flex items-center gap-2">
                    <div className="relative">
                       <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
                       <span className="absolute -top-1.5 -right-1.5 bg-[#d7b068] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                         {totalCartItems}
                       </span>
                    </div>
                    <div className="text-[15px] text-[#0f172a] font-bold whitespace-nowrap hidden xl:block">{formatCurrency(getCartTotal(), currency)}</div>
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white px-4 pt-2 pb-4 space-y-1 shadow-inner border-t border-gray-100 text-ink">
          <Link to="/" className="block py-3 border-b border-gray-100 font-bold" onClick={()=>setMobileMenuOpen(false)}>{t('nav.home')}</Link>
          <Link to="/about" className="block py-3 border-b border-gray-100 font-bold" onClick={()=>setMobileMenuOpen(false)}>{t('footer.about_title')} Nesrina</Link>
          <Link to="/courses" className="block py-3 border-b border-gray-100 font-bold" onClick={()=>setMobileMenuOpen(false)}>{t('nav.courses')}</Link>
          <Link to="/events" className="block py-3 border-b border-gray-100 font-bold" onClick={()=>setMobileMenuOpen(false)}>{t('nav.events', 'Events')}</Link>
          <Link to="/contact" className="block py-3 border-b border-gray-100 font-bold" onClick={()=>setMobileMenuOpen(false)}>{t('nav.contact')}</Link>
          <div className="py-3 border-b border-gray-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-xs font-bold focus:outline-none uppercase"
            >
              {languages && languages.length > 0 ? (
                [...languages].filter(l => l.isActive).sort((a,b) => b.isDefault ? 1 : -1).map((l: any) => (
                  <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>
                ))
              ) : (
                <>
                  <option value="en">EN</option>
                  <option value="ar">AR</option>
                  <option value="fr">FR</option>
                </>
              )}
            </select>
          </div>
          {user ? (
              <>
                 <Link to="/dashboard" className="block py-3 border-b border-gray-100 font-bold" onClick={()=>setMobileMenuOpen(false)}>{t('nav.dashboard')}</Link>
                 {user.role === 'ADMIN' && <Link to="/admin" className="block py-3 border-b border-gray-100 text-yellow-500 font-bold" onClick={()=>setMobileMenuOpen(false)}>{t('nav.admin')}</Link>}
                 <button className="block py-3 border-b border-gray-100 w-full text-left font-bold text-red-600" onClick={()=>{setUser(null, null); setMobileMenuOpen(false)}}>{t('nav.logout')}</button>
              </>
          ) : (
             <div className="pt-4 flex flex-col gap-2">
                <button onClick={()=>{setAuthModalOpen(true); setMobileMenuOpen(false)}} className="w-full bg-primary text-white py-2 rounded-full font-bold">{t('nav.login')} / {t('nav.register')}</button>
             </div>
          )}
        </div>
      )}
    </header>
  );
}

function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setUser, settings } = useStore();
  const socialLoginSetting = settings.find((s:any) => s.key === 'SOCIAL_LOGIN_CONFIG')?.value;
  const socialLoginConfig = socialLoginSetting ? JSON.parse(socialLoginSetting) : null;
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+971 ");
  const [isForgot, setIsForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleOAuthLogin = async (provider: string) => {
    try {
      const redirectUri = `${window.location.origin}/oauth/callback`;
      const res = await fetch(`/api/auth/${provider}/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('oauth_provider', provider);
        const authWindow = window.open(data.url, 'oauth_popup', 'width=600,height=700');
        if (!authWindow) {
          alert('Please allow popups for this site to connect your account.');
        }
      } else {
        alert(data.error || "Failed to initialize social login");
      }
    } catch (err) {
      console.error("OAuth init err", err);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { token, user: authUser } = event.data;
        localStorage.setItem("token", token);
        setUser(authUser, token);
        setAuthModalOpen(false);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setUser, setAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgot) {
      if (!email) return alert("Please enter email");
      try {
        await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        setForgotSent(true);
      } catch (err) {
        alert("An error occurred");
      }
      return;
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const body = isLogin ? { email, password } : { email, password, name, phone };
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user, data.token);
        setAuthModalOpen(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  return (
     <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
       <div className="bg-white text-black rounded-lg p-6 w-full max-w-sm relative">
         <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4"><X className="w-5 h-5 text-gray-500"/></button>
         <div className="flex border-b border-slate-200 mb-6">
           <button 
             onClick={() => { setIsLogin(true); setIsForgot(false); }} 
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${isLogin && !isForgot ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
           >
             {t('auth.login')}
           </button>
           <button 
             onClick={() => { setIsLogin(false); setIsForgot(false); }} 
             className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${!isLogin && !isForgot ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
           >
             {t('auth.register')}
           </button>
         </div>
         {forgotSent ? (
            <div className="text-center py-8">
               <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-2">{t('auth.check_email')}</h3>
               <p className="text-slate-500 text-sm">{t('auth.email_sent_msg')} {email}</p>
               <button onClick={() => { setIsForgot(false); setForgotSent(false); }} className="mt-6 text-primary font-bold hover:underline">{t('auth.back_to_login')}</button>
            </div>
         ) : (
         <form onSubmit={handleSubmit} className="space-y-4">
           {!isLogin && !isForgot && (
             <>
               <div>
                 <label className="block text-sm font-medium mb-1">{t('auth.name')}</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded p-2" />
               </div>
               <div>
                 <label className="block text-sm font-medium mb-1">{t('auth.phone')} *</label>
                 <div className="flex">
                   <select className="border border-r-0 rounded-l p-2 bg-slate-50 w-28 outline-none text-xs" value={phone.split(' ')[0] || '+971'} onChange={(e) => setPhone(e.target.value + ' ' + (phone.split(' ')[1] || ''))} required>
                     <option value="">{t('auth.code')}</option>
                     {countryCodes.map(c => (
                       <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
                     ))}
                   </select>
                   <input type="tel" value={phone.split(' ')[1] || ''} onChange={e => setPhone((phone.split(' ')[0] || '+971') + ' ' + e.target.value)} required placeholder={t('auth.phone')} className="w-full border rounded-r p-2 outline-none text-sm" />
                 </div>
               </div>
             </>
           )}
           <div>
             <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
             <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded p-2" />
           </div>
           {!isForgot && (
           <div>
             <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
             <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded p-2" />
             {isLogin && (
               <div className="text-right mt-1">
                 <button type="button" onClick={() => setIsForgot(true)} className="text-xs text-primary font-bold hover:underline">{t('auth.forgot_password')}</button>
               </div>
             )}
           </div>
           )}
           <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow hover:bg-primary-dark transition text-lg mt-2">
             {isForgot ? t('auth.reset_password') : isLogin ? t('auth.login') : t('auth.register')}
           </button>
           {isForgot && (
              <div className="text-center mt-2">
                 <button type="button" onClick={() => setIsForgot(false)} className="text-xs text-slate-500 font-bold hover:underline">{t('auth.back_to_login')}</button>
              </div>
           )}
         </form>
         )}
         
         {!isForgot && !forgotSent && (socialLoginConfig?.googleEnabled || socialLoginConfig?.facebookEnabled) && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <p className="text-center text-sm text-slate-500 mb-4 font-bold uppercase tracking-wider">{t('auth.or_continue_with')}</p>
              <div className="space-y-3">
                {socialLoginConfig?.googleEnabled && (
                  <button type="button" onClick={() => handleOAuthLogin('google')} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-bold py-2.5 rounded-lg hover:bg-slate-50 transition shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google
                  </button>
                )}
                {socialLoginConfig?.facebookEnabled && (
                  <button type="button" onClick={() => handleOAuthLogin('facebook')} className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-bold py-2.5 rounded-lg hover:bg-[#1864D9] transition shadow-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </button>
                )}
              </div>
            </div>
         )}


       </div>
    </div>
  );
}

function WebsitePopup() {
  const { settings, language } = useStore();
  const settingKey = language === "en" ? 'WEBSITE_POPUP' : `WEBSITE_POPUP_${language}`;
  const popupSettingStr = settings.find((s:any) => s.key === settingKey)?.value || settings.find((s:any) => s.key === 'WEBSITE_POPUP')?.value;
  const popupConfig = popupSettingStr ? JSON.parse(popupSettingStr) : null;
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (popupConfig?.enabled) {
      const mode = popupConfig.displayMode || 'ONCE_PER_SESSION';
      const storageKey = 'popup_shown_status';
      const delay = popupConfig.delayMs !== undefined ? popupConfig.delayMs : 1500;
      
      let shouldShow = false;

      if (mode === 'EVERY_TIME') {
        shouldShow = true;
      } else if (mode === 'ONCE_PER_SESSION') {
        if (!sessionStorage.getItem(storageKey)) {
          shouldShow = true;
        }
      } else if (mode === 'SINGLE_TIME') {
        if (!localStorage.getItem(storageKey)) {
          shouldShow = true;
        }
      } else if (mode === 'ONCE_PER_DAY') {
        const lastShown = localStorage.getItem(storageKey);
        if (lastShown) {
          const lastDate = new Date(parseInt(lastShown));
          const today = new Date();
          if (lastDate.getDate() !== today.getDate() || lastDate.getMonth() !== today.getMonth() || lastDate.getFullYear() !== today.getFullYear()) {
            shouldShow = true;
          }
        } else {
          shouldShow = true;
        }
      }

      if (shouldShow) {
        const t = setTimeout(() => setIsOpen(true), delay);
        return () => clearTimeout(t);
      }
    }
  }, [popupConfig?.enabled, popupConfig?.displayMode, popupConfig?.delayMs]);

  if (!isOpen || !popupConfig?.enabled) return null;

  const handleClose = () => {
    setIsOpen(false);
    const mode = popupConfig.displayMode || 'ONCE_PER_SESSION';
    const storageKey = 'popup_shown_status';
    
    if (mode === 'ONCE_PER_SESSION') {
       sessionStorage.setItem(storageKey, 'true');
    } else if (mode === 'SINGLE_TIME') {
       localStorage.setItem(storageKey, 'true');
    } else if (mode === 'ONCE_PER_DAY') {
       localStorage.setItem(storageKey, Date.now().toString());
    }
  };

  const renderContent = () => {
    if (popupConfig.type === 'IMAGE' && popupConfig.content) {
      const img = <img src={popupConfig.content} alt="Popup Option" className="w-full h-auto object-contain max-h-[80vh] block" />;
      return popupConfig.linkUrl ? <a href={popupConfig.linkUrl} target="_blank" rel="noopener noreferrer">{img}</a> : img;
    }
    if (popupConfig.type === 'VIDEO' && popupConfig.content) {
      const video = <video src={popupConfig.content} controls autoPlay loop muted playsInline className="w-full max-h-[80vh] bg-black/5 block" />;
      return popupConfig.linkUrl ? <a href={popupConfig.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative">{video}</a> : video;
    }
    if (popupConfig.type === 'HTML' && popupConfig.content) {
      return (
        <div className="p-8 prose prose-slate max-w-none w-full max-h-[80vh] overflow-y-auto">
           <div dangerouslySetInnerHTML={{ __html: popupConfig.content }} />
           {popupConfig.linkUrl && (
             <div className="mt-6 text-center">
               <a href={popupConfig.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full shadow hover:opacity-90 transition">{t('home.learn_more', 'Learn More')}</a>
             </div>
           )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden animate-in fade-in zoom-in duration-300">
        <button onClick={handleClose} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition">
          <X className="w-4 h-4" />
        </button>
        {renderContent()}
      </div>
    </div>
  );
}

const DragScrollContainer = React.forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string }>(({ children, className }, forwardedRef) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const ref = (forwardedRef as React.MutableRefObject<HTMLDivElement>) || internalRef;
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    if (!ref.current) return;
    ref.current.style.scrollBehavior = 'auto';
    setStartX(e.pageX - (ref.current.getBoundingClientRect().left + window.scrollX));
    setScrollLeft(ref.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    if (isDown) {
      setIsDown(false);
      if (ref.current) ref.current.style.scrollBehavior = 'smooth';
    }
  };

  const handleMouseUp = () => {
    if (isDown) {
      setIsDown(false);
      if (ref.current) ref.current.style.scrollBehavior = 'smooth';
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - (ref.current.getBoundingClientRect().left + window.scrollX);
    const walk = (x - startX) * 0.75; 
    ref.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div 
      className={className} 
      ref={ref}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      style={{ cursor: isDown ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'pan-x' }}
    >
      {children}
    </div>
  );
});

function TestimonialCarousel({ testimonials }: { testimonials: any[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;
  const testi = testimonials[index];

  return (
    <div className="relative w-full overflow-hidden flex flex-col justify-center items-center min-h-[350px]">
      <AnimatePresence mode="wait">
        <motion.div
           key={index}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.6, ease: "easeInOut" }}
           className="w-full max-w-[500px] bg-white rounded-[1.25rem] p-8 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-50 flex flex-col mx-auto"
        >
           <div className="flex gap-1 text-[#fbbf24] mb-4">
               {[...Array(5)].map((_, idx) => <svg key={idx} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>)}
           </div>
           <p className="text-[14px] md:text-[15px] italic font-medium leading-[1.7] text-[#1e293b] mb-8 flex-1 whitespace-pre-line">
              {testi.text}
           </p>
           <div className="flex items-center gap-4 mt-auto">
               {testi.image ? (
                   <div className="w-[44px] h-[44px] rounded-full overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                     <img src={testi.image || undefined} alt={testi.name} className="w-full h-full object-cover" />
                   </div>
               ) : (
                   <div className="w-[44px] h-[44px] rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm bg-primary/10 text-primary">
                     {testi.name?.charAt(0) || 'U'}
                   </div>
               )}
               <div>
                  <h4 className="font-bold text-[#0f172a] text-[15px]">{testi.name}</h4>
                  {(testi.role || testi.username) && <p className="text-[12px] text-slate-500 mt-0.5">{testi.role || testi.username}</p>}
               </div>
           </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-2 justify-center mt-6 h-6 items-center">
         {testimonials.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? 'bg-primary w-6' : 'bg-slate-200 w-2 hover:bg-slate-300'}`} aria-label={`Go to slide ${i + 1}`} />
         ))}
      </div>
    </div>
  )
}

function Home() {
  const { language, currency, categories, settings, enrolledItems } = useStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [courseBundles, setCourseBundles] = useState<any[]>([]);
  const [rawSliders, setRawSliders] = useState<any[]>([]);
  const sliders = rawSliders.filter(s => (s.languageCode || 'en') === language);
  const [plans, setPlans] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const bundlesRef = useRef<HTMLDivElement>(null);
  const comingSoonRef = useRef<HTMLDivElement>(null);

  const heroSettingStr = settings.find((s:any) => s.key === 'FRONTEND_HERO')?.value;
  const heroData = heroSettingStr ? JSON.parse(heroSettingStr) : null;
  const currentLang = i18n.language || 'en';
  const dynamicHeroHTML = heroData?.[currentLang]?.html || `
     <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">${t('home.hero_title')}</h2>
     <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">${t('home.hero_subtitle')}</h2>
  `;

  useEffect(() => {
    Promise.all([
      fetch("/api/courses/active").then(r => r.json()).then(setCourses).catch(() => {}),
      fetch("/api/public/course-bundles").then(r => r.json()).then(setCourseBundles).catch(() => {}),
      fetch("/api/sliders").then(r => r.json()).then(setRawSliders).catch(() => {}),
      fetch("/api/memberships").then(r => r.json()).then(setPlans).catch(() => {}),
      fetch("/api/events").then(r => r.json()).then(setEvents).catch(() => {}),
      fetch("/api/testimonials").then(r => r.json()).then(setTestimonialsList).catch(() => {}),
      fetch("/api/blogs").then(r => r.json()).then(setBlogs).catch(() => {})
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (sliders.length < 2) return;
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [sliders]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent flex items-center justify-center rounded-full animate-spin"></div>
      </div>
    );
  }

  const tCourses = getTranslated(courses, language) || [];
  const tEvents = getTranslated(events, language) || [];
  const tPlans = getTranslated(plans, language) || [];
  const tCategories = getTranslated(categories, language) || [];

  const sPromoKey = language === "en" ? 'PROMO_BADGE_CONFIG' : `PROMO_BADGE_CONFIG_${language}`;
  const sPromo = settings?.find((s:any) => s.key === sPromoKey) || settings?.find((s:any) => s.key === "PROMO_BADGE_CONFIG");
  let promoConfig = { 
    enabled: false, 
    badgeType: "demo", 
    badgeText: "Exclusive Offer", 
    message: "Flat 50% off on Premium collection!", 
    linkUrl: "",
    bgColor: "",
    borderColor: "",
    textColor: "",
    tagBgColor: "",
    tagTextColor: ""
  };
  if (sPromo) {
    try {
      promoConfig = { ...promoConfig, ...JSON.parse(sPromo.value) };
    } catch (e) {
      console.error("Error parsing promo config:", e);
    }
  }

  return (
    <div className="pb-20">
      {/* Promo Badge Container */}
      {promoConfig.enabled && (
        <div className="max-w-7xl mx-auto px-4 mt-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: [0, -6, 0],
              scale: 1,
            }}
            transition={{
              opacity: { duration: 0.6, ease: "easeOut" },
              scale: { duration: 0.6, ease: "easeOut" },
              y: {
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2.5,
                ease: "easeInOut",
              }
            }}
            whileHover={{ 
              scale: 1.04, 
              y: -8, 
              boxShadow: "0 12px 30px -10px rgba(0,0,0,0.15)",
              transition: { duration: 0.2, y: { repeat: 0 } } 
            }}
            whileTap={{ scale: 0.98 }}
            className="inline-block relative z-10 cursor-pointer rounded-full"
          >
            {promoConfig.badgeType === "badge-tag" ? (
              <BadgeTag 
                badgeText={promoConfig.badgeText} 
                message={promoConfig.message} 
                onClick={promoConfig.linkUrl ? () => navigate(promoConfig.linkUrl) : undefined}
                bgColor={promoConfig.bgColor}
                borderColor={promoConfig.borderColor}
                textColor={promoConfig.textColor}
                tagBgColor={promoConfig.tagBgColor}
                tagTextColor={promoConfig.tagTextColor}
              />
            ) : (
              <DemoBadge 
                badgeText={promoConfig.badgeText} 
                message={promoConfig.message} 
                onClick={promoConfig.linkUrl ? () => navigate(promoConfig.linkUrl) : undefined}
                bgColor={promoConfig.bgColor}
                borderColor={promoConfig.borderColor}
                textColor={promoConfig.textColor}
                tagBgColor={promoConfig.tagBgColor}
                tagTextColor={promoConfig.tagTextColor}
              />
            )}
          </motion.div>
        </div>
      )}

      {/* Hero / Slider */}
      <div className="max-w-7xl mx-auto px-4 mt-8 relative group">
         {sliders.length > 0 ? (
           <>
             <DragScrollContainer ref={sliderRef} className="flex overflow-x-auto snap-x hide-scrollbar gap-4 rounded-2xl mx-auto w-full scroll-smooth">
               {sliders.map(slider => (
                 <div key={slider.id} className="min-w-full w-full rounded-2xl snap-center shrink-0 shadow-sm relative overflow-hidden flex items-center justify-center" >
                   <img src={slider.imageUrl || undefined} alt="Slider" className="w-full aspect-[16/9] lg:aspect-[21/9] object-cover block" />
                   {slider.linkUrl && <Link to={slider.linkUrl} className="absolute inset-0 z-20" />}
                   <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent pointer-events-none"></div>
                  </div>
               ))}
             </DragScrollContainer>
             {sliders.length > 1 && (
               <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30">
                 {sliders.map((_, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => {
                        if (sliderRef.current) sliderRef.current.scrollTo({ left: idx * sliderRef.current.clientWidth, behavior: 'smooth' });
                     }}
                     className="w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white transition-colors focus:outline-none focus:bg-white"
                   />
                 ))}
               </div>
             )}
           </>
         ) : (
           <div className="mx-auto w-full h-[40vh] md:h-[60vh] rounded-3xl flex flex-col items-center justify-center p-12 text-white italic font-serif bg-gradient-to-br from-primary to-[#8c356b] shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
             <div className="relative z-10 text-center max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{t('home.default_banner_title', 'Master Your Mindset.')}<br/>{t('home.default_banner_subtitle', 'Build Your Legacy.')}</h1>
                <p className="text-lg md:text-xl font-sans not-italic text-white/90 mb-8 max-w-2xl mx-auto font-medium">{t('home.default_banner_desc', 'Join thousands of ambitious individuals transforming their careers and wealth through our proven frameworks.')}</p>
                <div className="flex justify-center gap-4">
                  <Link to="/courses" className="bg-white text-primary font-sans not-italic font-bold px-8 py-3.5 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.3)] hover:scale-105 transition transform">{t('home.explore_programs', 'Explore Programs')}</Link>
                </div>
             </div>
           </div>
         )}
      </div>



      <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-12 overflow-x-visible space-y-8 md:space-y-12">

         <div>
            {/* Title and Category Filter */}
            <div className="text-center mb-6 md:mb-8 mt-2 md:mt-10 relative">
               <div dangerouslySetInnerHTML={{ __html: dynamicHeroHTML }}></div>
            </div>

            <div className="relative flex items-center justify-center w-full mb-4">
              <div className="w-full md:px-24">
                <DragScrollContainer className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar flex-nowrap w-fit mx-auto max-w-full px-4">
                   <button
                     onClick={() => setActiveCategory(null)}
                     className={`px-6 py-2 rounded-full font-bold text-sm transition shrink-0 snap-start ${activeCategory === null ? 'bg-primary text-white' : 'border border-primary text-primary hover:bg-slate-50'}`}
                   >
                     {t('courses.all_courses')}
                   </button>
                   {tCategories.filter((cat: any) => cat.name.toLowerCase() !== 'membership' && cat.name.toLowerCase() !== 'memberships').map((cat: any) => (
                     <button
                       key={cat.id}
                       onClick={() => setActiveCategory(cat.id)}
                       className={`px-6 py-2 rounded-full font-bold text-sm transition shrink-0 snap-start ${activeCategory === cat.id ? 'bg-primary text-white' : 'border border-primary text-primary hover:bg-slate-50'}`}
                     >
                       {cat.name}
                     </button>
                   ))}
                </DragScrollContainer>
              </div>
              <div className="hidden md:flex gap-2 absolute right-0 top-0">
                  <button onClick={() => { if(coursesRef.current) coursesRef.current.scrollBy({ left: -320, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition z-10"><ChevronLeft size={16} /></button>
                  <button onClick={() => { if(coursesRef.current) coursesRef.current.scrollBy({ left: 320, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition z-10"><ChevronRight size={16} /></button>
              </div>
            </div>
         </div>

         {/* Filtered Courses */}
         <section>
             <DragScrollContainer ref={coursesRef} className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar mt-2 md:mt-4 scroll-smooth">
                {(activeCategory 
                    ? tCourses.filter((c: any) => c.categoryId === activeCategory && !c.isUpcoming) 
                    : tCourses.filter(c => !c.isUpcoming && c.category?.name?.toLowerCase() !== 'membership' && c.category?.name?.toLowerCase() !== 'memberships')
                ).map(course => {
                  const isEnrolled = enrolledItems?.courses.some((c: any) => c.courseId === course.id);
                  return (
                  <Link to={`/courses/${course.id}`} key={course.id} className="min-w-[280px] md:min-w-[320px] w-[280px] md:w-[320px] snap-start bg-white rounded-2xl p-5 border border-slate-100 card-hover shadow-sm flex flex-col group">
                    <img src={course.imageUrl || undefined} alt={course.title} className="w-full h-auto min-h-[160px] object-contain bg-slate-50 rounded-xl mb-4 shadow-sm" style={{maxHeight: '240px'}} />
                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{course.title}</h3>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-bold text-lg text-primary flex items-center pr-2">
                        {course.price > 0 ? (
                           <>
                             {course.realPrice && course.realPrice > course.price && (
                               <span className="text-sm text-slate-400 line-through mr-2 font-medium">{formatCurrency(course.realPrice, currency)}</span>
                             )}
                             {formatCurrency(course.price, currency)}
                           </>
                        ) : course.memberships && course.memberships.length > 0 ? (
                           <>
                              <span className="text-[10px] text-slate-500 font-medium mr-1 uppercase tracking-wider">{t('courses.starting_from', 'Starting from')}</span>
                              {formatCurrency(Math.min(...course.memberships.map((m: any) => m.offerPrice || 0)), currency)}
                           </>
                        ) : (
                           <><span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-sm uppercase tracking-widest">{t('home.free', 'Free')}</span></>
                        )}
                      </span>
                      {isEnrolled ? (
                         <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider items-center flex gap-1">{t('home.purchased', 'Purchased')}</span>
                      ) : (
                         <span className="px-3 py-1 bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white text-xs rounded-full font-bold transition">{t('home.enroll_now', 'Enroll Now')}</span>
                      )}
                    </div>
                  </Link>
                )})}
             </DragScrollContainer>
         </section>

         {/* Program Bundles */}
         {getTranslated(courseBundles, language) && getTranslated(courseBundles, language).length > 0 && (
           <section>
             <div className="flex justify-between items-end mb-6 editorial-divider pt-6">
                <h2 className="text-2xl md:text-3xl font-serif italic text-primary font-bold flex items-center gap-2"><span className="w-1 h-6 bg-primary inline-block"></span>{t('home.program_bundles', 'Program Bundles')}</h2>
                <div className="hidden md:flex gap-2">
                   <button onClick={() => { if(bundlesRef.current) bundlesRef.current.scrollBy({ left: -320, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition"><ChevronLeft size={16} /></button>
                   <button onClick={() => { if(bundlesRef.current) bundlesRef.current.scrollBy({ left: 320, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition"><ChevronRight size={16} /></button>
                </div>
             </div>
             <DragScrollContainer ref={bundlesRef} className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar scroll-smooth">
                {getTranslated(courseBundles, language).map((bundle: any) => {
                  return (
                    <Link to={`/bundles/${bundle.id}`} key={bundle.id} className="min-w-[280px] md:min-w-[320px] w-[280px] md:w-[320px] snap-start bg-white rounded-2xl p-5 border border-slate-100 card-hover shadow-sm flex flex-col group">
                       <img src={bundle.imageUrl || undefined} alt={bundle.title} className="w-full h-auto min-h-[160px] object-contain bg-slate-50 rounded-xl mb-4 shadow-sm" style={{maxHeight: '240px'}} />
                       <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{bundle.title}</h3>
                       <p className="text-sm text-slate-500 mb-4 line-clamp-2">{stripHtml(bundle.description)}</p>
                       <div className="flex justify-between items-center mt-auto">
                         <span className="font-bold text-lg text-primary">
                           {bundle.realPrice && bundle.realPrice > bundle.price && (
                             <span className="text-sm text-slate-400 line-through mr-2 font-medium">{formatCurrency(bundle.realPrice, currency)}</span>
                           )}
                           {bundle.price === 0 ? <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-sm uppercase tracking-widest">{t('home.free', 'Free')}</span> : formatCurrency(bundle.price, currency)}
                         </span>
                         <span className="px-3 py-1 bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white text-xs rounded-full font-bold transition">{t('home.view_bundle', 'View Bundle')}</span>
                       </div>
                    </Link>
                  )
                })}
             </DragScrollContainer>
           </section>
         )}

         {/* Upcoming Events */}
         {tEvents && tEvents.length > 0 && (
           <section>
             <div className="flex justify-between items-end mb-6 editorial-divider pt-6">
                <h2 className="text-2xl md:text-3xl font-serif italic text-primary font-bold flex items-center gap-2"><span className="w-1 h-6 bg-primary inline-block"></span>{t('home.events', 'Events')}</h2>
                <Link to="/events" className="text-xs font-bold uppercase tracking-widest text-primary/40 cursor-pointer hover:text-primary transition hidden md:block">{t('home.all_events', 'All Events')}</Link>
             </div>
             <div className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar scroll-smooth">
                {tEvents.map(evt => {
  const d = new Date(evt.date);
  const month = d.toLocaleString("default", { month: "short" });
  const day = d.getDate();
  const isBooked = enrolledItems?.bookings.some((b: any) => b.eventId === evt.id);
  return (
  <Link to={`/events/${evt.id}`} key={evt.id} className="min-w-[320px] w-[320px] snap-start bg-white rounded-2xl p-4 flex flex-col border border-slate-100 shadow-sm card-hover relative group">
                    <div className="w-full min-h-[128px] bg-slate-50 rounded-xl mb-4 relative flex items-center justify-center overflow-hidden">
                       <img src={evt.imageUrl || undefined} alt={evt.title} className="w-full h-auto object-contain max-h-[200px]" />
                       <div className="absolute top-2 left-2 w-10 h-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur border border-white/20 shadow-sm rounded-lg">
                          <span className="text-[8px] font-bold text-red-500 leading-none uppercase">{month}</span>
                          <span className="text-lg font-bold leading-none mt-1">{day}</span>
                       </div>
                    </div>
                    <h3 className="font-bold text-md leading-tight mb-1 line-clamp-1">{evt.title}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">{d.toLocaleTimeString([], {timeStyle: 'short'})} &bull; {evt.location || t('events.online_room', 'Online Room')}</p>
                    
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-auto">
                       <span className="font-bold text-primary flex-1 text-sm">{evt.price > 0 ? formatCurrency(evt.price, currency) : <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-xs uppercase tracking-widest">{t('home.free', 'Free')}</span>}</span>
  {isBooked ? (
    <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider items-center flex gap-1"><Check className="w-3 h-3" /> {t('events.already_booked_short', 'Booked')}</span>
  ) : (
    <span className="text-[10px] font-bold py-1.5 px-4 bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white rounded-lg whitespace-nowrap shadow-sm transition">{t('events.book_ticket', 'Book Seat')}</span>
  )}
  </div>
  </Link>
                )})}
             </div>
           </section>
         )}

         {/* Coming Soon Course */}
         {tCourses && tCourses.filter(c => c.isUpcoming).length > 0 && (
           <section>
             <div className="flex justify-between items-end mb-6 editorial-divider pt-6">
                <h2 className="text-2xl md:text-3xl font-serif italic text-primary font-bold">{t('home.coming_soon', 'Coming Soon')}</h2>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex gap-2">
                     <button onClick={() => { if(comingSoonRef.current) comingSoonRef.current.scrollBy({ left: -320, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition"><ChevronLeft size={16} /></button>
                     <button onClick={() => { if(comingSoonRef.current) comingSoonRef.current.scrollBy({ left: 320, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition"><ChevronRight size={16} /></button>
                  </div>
                  <Link to="/courses" className="text-xs font-bold uppercase tracking-widest text-primary/40 cursor-pointer hover:text-primary transition hidden md:block">{t('home.view_catalog', 'View Catalog')} &rarr;</Link>
                </div>
             </div>
             
             <DragScrollContainer ref={comingSoonRef} className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar scroll-smooth">
                {tCourses.filter(c => c.isUpcoming).map(course => {
                  const isEnrolled = enrolledItems?.courses.some((c: any) => c.courseId === course.id);
                  return (
                  <Link to={`/courses/${course.id}`} key={course.id} className="min-w-[280px] md:min-w-[320px] w-[280px] md:w-[320px] snap-start bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col group opacity-80 cursor-not-allowed" onClick={e => e.preventDefault()}>
                     <img src={course.imageUrl || undefined} alt={course.title} className="w-full h-auto min-h-[160px] object-contain bg-slate-50 rounded-xl mb-4 shadow-sm grayscale" style={{maxHeight: '240px'}} />
                     <p className="text-xs font-bold text-orange-500 mb-1 uppercase tracking-tighter">{t('home.coming_soon', 'Coming Soon')}</p>
                     <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{course.title} ({t('home.coming_soon', 'Coming Soon')})</h3>
                     <div className="flex justify-between items-center mt-auto">
                       <span className="font-bold text-lg text-primary">{t('home.tbd', 'TBD')}</span>
                       {isEnrolled ? (
                           <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider items-center flex gap-1">{t('home.purchased', 'Purchased')}</span>
                        ) : (
                           <span className="px-3 py-1 bg-slate-200 text-slate-500 text-xs rounded-full">{t('home.coming_soon', 'Coming Soon')}</span>
                        )}
                     </div>
                  </Link>
                )})}
             </DragScrollContainer>
           </section>
         )}

         {/* Testimonials */}
         {testimonialsList && testimonialsList.length > 0 && (
           <section className="my-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 py-12 px-4 md:px-0 mx-[-1rem] md:mx-0">
             {/* Decorative Background SVG */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.15] hidden md:block z-0">
               <svg viewBox="0 0 1000 500" preserveAspectRatio="none" className="w-full h-full text-primary">
                  <path d="M-100 300 C 150 450, 250 -50, 600 250 S 800 400, 1100 0" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                  <path d="M400 600 C 600 200, 700 -100, 1100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
               </svg>
             </div>

             {/* Left Content */}
             <div className="w-full lg:w-5/12 relative z-10 pl-4 md:pl-0">
               <h3 className="text-[13px] font-medium uppercase tracking-[0.15em] text-primary/60 mb-4">{t('home.testimonials', 'Testimonials')}</h3>
               <h2 className="text-4xl md:text-[2.75rem] font-bold tracking-tight text-gray-900 mb-6 leading-[1.15]">
                  {t('home.testimonials_title', 'They Were Exactly Where You Are. Look Where They Are Now')}
               </h2>
               <p className="text-[17px] text-slate-500 mb-10 leading-relaxed max-w-md">
                  {t('home.testimonials_desc', 'Read slowly. Because somewhere between these lines you will find yourself - the version of you that exists six months from now, on the other side of the decision you are about to make.')}
               </p>
             </div>

             {/* Right Content - Cards */}
             <div className="w-full lg:w-7/12 relative z-10">
                <TestimonialCarousel testimonials={testimonialsList} />
             </div>
           </section>
         )}

         {/* Content by Nesrina (Blog) */}
         <section className="mt-8 relative group/section">
           <div className="flex justify-between items-end mb-6 editorial-divider pt-6">
              <h2 className="text-2xl md:text-3xl font-serif italic text-primary font-bold flex items-center gap-2"><span className="w-1 h-6 bg-primary inline-block"></span>{t('home.content_by', 'Content by')} Nesrina</h2>
              <div className="flex items-center gap-4">
                  <div className="hidden md:flex gap-2">
                     <button onClick={() => { if(blogRef.current) blogRef.current.scrollBy({ left: -320, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition"><ChevronLeft size={16} /></button>
                     <button onClick={() => { if(blogRef.current) blogRef.current.scrollBy({ left: 320, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-primary transition"><ChevronRight size={16} /></button>
                  </div>
                  <button onClick={() => navigate("/blog")} className="text-xs font-bold uppercase tracking-widest text-primary/40 cursor-pointer hover:text-primary transition hidden md:block">{t('home.view_all', 'View All')}</button>
              </div>
           </div>
           <DragScrollContainer ref={blogRef} className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar mt-2 md:mt-4 scroll-smooth">
              {blogs.filter((b: any) => b.published).map((blog: any, i: number) => {
                const b = getTranslated(blog, language);
                return (
                <div key={i} className="min-w-[280px] md:min-w-[320px] w-[280px] md:w-[320px] snap-start bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col group cursor-pointer hover:shadow-md transition card-hover" onClick={() => navigate("/blog/" + b.id)}>
                  <div className="relative w-full h-auto min-h-[160px] max-h-[240px] overflow-hidden rounded-xl mb-4 shadow-sm shrink-0">
                    {b.imageUrl ? (
                      <img src={b.imageUrl || undefined} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 group-hover:scale-105 transition duration-500 min-h-[160px]"></div>
                    )}
                    {b.category && <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-md text-[10px] font-bold text-primary uppercase tracking-widest">{b.category}</div>}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-[11px] text-slate-500 font-medium mb-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition line-clamp-2">{b.title}</h3>
                    <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-bold text-[13px]">
                      {t('home.read_article', 'Read Article')} <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </div>
              )})}
              {blogs.filter((b: any) => b.published).length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-500">More content coming soon...</div>
              )}
           </DragScrollContainer>
         </section>

      </div>
    </div>
  )
}

function Footer() {
  const { settings, language } = useStore();
  const { t, i18n } = useTranslation();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const designSettingStr = settings.find((s:any) => s.key === 'EMAIL_DESIGN')?.value;
  const design = designSettingStr ? JSON.parse(designSettingStr) : null;
  const logoUrl = design?.logoUrl || '';

  const socialLinksStr = settings.find((s:any) => s.key === 'SOCIAL_LINKS')?.value;
  const socialLinks = socialLinksStr ? JSON.parse(socialLinksStr) : { instagram: '#', tiktok: '#', youtube: '#', linkedin: '#' };

  const handleSubscribe = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email: email,
          message: "Newsletter Subscription Request",
          source: "NEWSLETTER"
        })
      });
      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 3000);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 mt-auto text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-8">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <Link to="/" className="text-4xl font-bold italic font-serif flex items-center shrink-0 tracking-tighter" style={{ fontFamily: 'cursive' }}>
               {logoUrl ? <img src={logoUrl} alt="Logo" className="max-h-12 object-contain" /> : 'Nesrina'}
            </Link>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              {t('footer.description', 'The global online learning platform that offers anyone, anywhere access to online programs and degrees from world-class universities and companies.')}
            </p>
            <div className="flex gap-3 mt-2">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition">
                <Instagram size={18} />
              </a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href={socialLinks.youtube} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition">
                <Youtube size={18} />
              </a>
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 hover:bg-primary hover:text-white transition">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="font-bold text-lg text-slate-900 mb-2">{t('footer.important_link', 'Important Link')}</h3>
            <Link to="/about" className="text-slate-500 hover:text-primary transition font-medium">{t('footer.about_title', 'About Nesrina')}</Link>
            <Link to="/courses" className="text-slate-500 hover:text-primary transition font-medium">{t('footer.programs', 'Programs')}</Link>
            <Link to="/events" className="text-slate-500 hover:text-primary transition font-medium">{t('nav.events', 'Events')}</Link>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            <h3 className="font-bold text-[17px] text-slate-900 mb-2">{t('footer.inquiries', 'Inquiries')}</h3>
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-slate-500 font-medium">{t('footer.location', 'Abu Dubai, United Arab Emirates')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-slate-400 shrink-0" />
              <p className="text-slate-500 font-medium" dir="ltr">{t('footer.phone', '+971 55 780 0863')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-400 shrink-0" />
              <a href="mailto:info@nesrinaconsultancy.com" className="font-bold text-slate-900 hover:text-primary transition break-words">info@nesrinaconsultancy.com</a>
            </div>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            <h3 className="font-bold text-[17px] text-slate-900 mb-2 lg:whitespace-nowrap">{t('footer.newsletter_title', 'Sign up for the newsletter')}</h3>
            <div className="relative w-full">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('footer.email_placeholder', 'Email address')} className="w-full bg-slate-50 border-none rounded-full py-3.5 pl-5 pr-24 outline-none focus:ring-2 focus:ring-[#371C3B]/20 text-slate-700 font-medium shadow-sm transition-shadow" />
              <button disabled={loading} onClick={handleSubscribe} className="absolute right-1.5 top-1.5 bottom-1.5 bg-transparent text-slate-900 font-bold px-4 hover:text-[#371C3B] transition">{loading ? '...' : success ? t('footer.done', 'Done') : t('footer.sign_up', 'Sign Up')}</button>
            </div>
            <label className="flex items-start gap-3 mt-2 cursor-pointer group">
              <input type="checkbox" className="mt-1 flex-shrink-0 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" />
              <span className="text-sm text-slate-400 group-hover:text-slate-600 transition leading-snug">{t('footer.newsletter_consent', 'I\'m okay with getting emails and having that activity tracked to improve my experience.')}</span>
            </label>
          </div>

        </div>
      </div>
    </footer>
  );
}

function DefaultLayout({ children }: { children: React.ReactNode }) {
  const { user, token, setFavorites, language, languages, setLanguages, settings, setSettings } = useStore();
  const { t, i18n } = useTranslation();

  const designSettingStr = settings.find((s:any) => s.key === 'EMAIL_DESIGN')?.value;
  const design = designSettingStr ? JSON.parse(designSettingStr) : null;
  const primaryColor = design?.primaryColor || '#371C3B';
  const secondaryColor = design?.secondaryColor || '#D4942D';
  const footerText = design?.footerText || `© ${new Date().getFullYear()} Nesrina. ${i18n.t('footer.rights')}.`;

  useEffect(() => {
    // Dynamic color assignment
    document.documentElement.style.setProperty('--color-primary', primaryColor);
    document.documentElement.style.setProperty('--primary', primaryColor);
    document.documentElement.style.setProperty('--color-secondary', secondaryColor);
    document.documentElement.style.setProperty('--secondary', secondaryColor);
    
    // Attempting to calculate HSL-like values wouldn't map exactly to oklch without a lib,
    // so we set both shadcn's and tailwind's primary to the exact hex.
  }, [primaryColor, secondaryColor]);

  useEffect(() => {
    fetch("/api/languages").then(r => r.json()).then(langs => {
       setLanguages(langs);
       if (!localStorage.getItem("user_lang_pref") || !useStore.getState().language) {
          const defaultLang = langs.find((l: any) => l.isDefault)?.code || langs.find((l: any) => l.isActive)?.code || 'en';
          useStore.getState().setLanguage(defaultLang);
       }
    });
    fetch("/api/settings").then(r => r.json()).then(setSettings).catch(()=>{});
  }, []);

  useEffect(() => {
    if (languages && languages.length > 0) {
      languages.forEach((l: any) => {
        try {
          const dict = JSON.parse(l.translations || '{}');
          if (Object.keys(dict).length > 0) {
             i18n.addResourceBundle(l.code, 'translation', dict, true, true);
          }
        } catch (e) {}
      });
    }
  }, [languages, i18n]);

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, i18n]);

  useEffect(() => {
    // Quick session check
    const localToken = localStorage.getItem("token");
    if (localToken && !user) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${localToken}` } })
        .then(r => r.json())
        .then(u => {
          if (u.id) useStore.getState().setUser(u, localToken);
        }).catch(() => {});
    }

    // Fetch globally needed data
    fetch("/api/categories")
      .then(r => r.json())
      .then(cats => useStore.getState().setCategories(cats))
      .catch(()=>{});
  }, []);

  useEffect(() => {
    if (user && token) {
      fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(setFavorites)
        .catch(()=>{});
        
      fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
            const courses = Array.isArray(data.courses) ? data.courses : [];
            const memberships = Array.isArray(data.memberships) ? data.memberships : [];
            const bookings = Array.isArray(data.bookings) ? data.bookings : [];
            useStore.getState().setEnrolledItems({ courses, memberships, bookings });
        })
        .catch(()=>{});
    } else {
      setFavorites([]);
      useStore.getState().setEnrolledItems(null);
    }
  }, [user, token, setFavorites]);

  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <PushNotificationPrompt />
      {!isAdminRoute && <Navbar />}
      <AuthModal />
      {!isAdminRoute && <WebsitePopup />}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("No reset token provided");
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        alert(data.error);
        setStatus("idle");
      }
    } catch (e) {
      alert("Error resetting password");
      setStatus("idle");
    }
  };

  if (status === "success") {
     return (
       <div className="flex flex-col items-center justify-center py-20 px-4">
         <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
         </div>
         <h1 className="text-3xl font-serif font-bold text-slate-800 mb-4">{t('auth.reset_success', 'Password Reset Successfully')}</h1>
         <p className="text-slate-500 mb-8 max-w-md text-center">Your password has been securely updated. You can now log in using your new credentials.</p>
         <Link to="/" className="bg-primary text-white px-8 py-3 rounded-lg font-bold shadow-sm hover:bg-primary-dark transition">{t('auth.go_home', 'Go to Homepage')}</Link>
       </div>
     );
  }

  return (
    <div className="flex items-center justify-center py-20 px-4">
       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
          <h1 className="text-2xl font-bold font-serif text-slate-800 mb-2">{t('auth.reset_password', 'Reset Password')}</h1>
          <p className="text-sm text-slate-500 mb-6">{t('auth.enter_secure_password', 'Enter your new secure password below.')}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{t('auth.new_password', 'New Password')}</label>
                <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required minLength={8} className="w-full border border-slate-200 rounded-lg p-3 text-sm" placeholder="••••••••" />
                <p className="text-xs text-slate-400 mt-1">{t('auth.min_length', 'Must be at least 8 characters long.')}</p>
             </div>
             <button disabled={status === "loading"} type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold shadow-sm hover:bg-primary-dark transition disabled:opacity-50 mt-4">
                {status === "loading" ? t('auth.resetting', 'Resetting...') : t('auth.update_password', 'Update Password')}
             </button>
          </form>
       </div>
    </div>
  );
}

function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const provider = sessionStorage.getItem('oauth_provider');
    
    if (code && provider) {
      const redirectUri = `${window.location.origin}/oauth/callback`;
      fetch(`/api/auth/${provider}/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectUri })
      })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
           setStatus("Success! Redirecting...");
           if (window.opener) {
             window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: data.token, user: data.user }, '*');
             setTimeout(() => window.close(), 1000);
           } else {
             localStorage.setItem("token", data.token);
             window.location.href = "/";
           }
        } else {
          setStatus(`Failed: ${data.error}`);
        }
      })
      .catch(err => {
         setStatus(`Error: ${err.message}`);
      });
    } else {
       setStatus("No code or provider found");
    }
  }, []);

  return <div className="p-10 font-bold text-center h-screen flex items-center justify-center bg-white text-slate-700">{status}</div>;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function GlobalHead() {
  const { settings } = useStore();
  
  useEffect(() => {
    const sAnalytics = settings.find((s:any) => s.key === 'ANALYTICS_CONFIG');
    if (!sAnalytics) return;
    
    try {
      const config = JSON.parse(sAnalytics.value);
      
      if (config.googleWebmasterKey) {
        let meta = document.querySelector('meta[name="google-site-verification"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'google-site-verification');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', config.googleWebmasterKey);
      }
      
      if (config.googleAnalyticsId && !window.location.host.includes('localhost')) {
         // GA injection
         const existingScript = document.getElementById('ga-script');
         if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'ga-script';
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
            document.head.appendChild(script);

            const inlineScript = document.createElement('script');
            inlineScript.id = 'ga-inline';
            inlineScript.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.googleAnalyticsId}');
            `;
            document.head.appendChild(inlineScript);
         }
      }
    } catch(e) {}
  }, [settings]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalHead />
      <ScrollToTop />
      <DefaultLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          <Route path="/bundles/:id" element={<BundleDetails />} />
          <Route path="/courses/:id/player" element={<CoursePlayer />} />
          <Route path="/memberships" element={<Memberships />} />
          <Route path="/memberships/:id" element={<MembershipDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
        </Routes>
      </DefaultLayout>
    </BrowserRouter>
  );
}
