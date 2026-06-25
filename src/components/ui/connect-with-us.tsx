import React, { useEffect, useState } from 'react';
import { Instagram, Youtube, Linkedin, Music2 } from 'lucide-react';
import { useStore } from '../../store';
import { useTranslation } from 'react-i18next';

const SocialConnect = () => {
  const { settings } = useStore();
  const { t } = useTranslation();
  const [links, setLinks] = useState({ instagram: '#', tiktok: '#', youtube: '#', linkedin: '#' });

  useEffect(() => {
    const sSocial = settings.find((s:any) => s.key === 'SOCIAL_LINKS');
    if(sSocial) {
      try {
        setLinks(JSON.parse(sSocial.value));
      } catch(e) {}
    }
  }, [settings]);

  return (
    <div className="bg-transparent flex flex-col items-center justify-center p-4 font-sans w-full rounded-3xl py-12">
      <div className="w-full max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-serif italic text-primary mb-4">
          {t('connect.title', 'Connect With Us')}
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {t('connect.desc', 'Join our community and stay updated with the latest news, releases, and exclusive content')}
        </p>
      </div>
      
      <div className="relative w-full max-w-2xl">
        <div 
          className="rounded-3xl bg-white border border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-8 transition-all duration-500 hover:scale-[1.02]"
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <a href={links.instagram} target="_blank" rel="noreferrer" className="social-icon instagram group">
              <div className="icon-container border border-slate-100 bg-slate-50 text-slate-700 shadow-sm transition-all duration-300">
                <Instagram className="h-8 w-8 transition-colors group-hover:text-white" />
              </div>
              <span className="icon-label text-slate-700">Instagram</span>
            </a>
            
            <a href={links.tiktok} target="_blank" rel="noreferrer" className="social-icon tiktok group">
              <div className="icon-container border border-slate-100 bg-slate-50 text-slate-700 shadow-sm transition-all duration-300">
                 <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 transition-colors group-hover:text-white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                 </svg>
              </div>
              <span className="icon-label text-slate-700">TikTok</span>
            </a>
            
            <a href={links.youtube} target="_blank" rel="noreferrer" className="social-icon youtube group">
              <div className="icon-container border border-slate-100 bg-slate-50 text-slate-700 shadow-sm transition-all duration-300">
                <Youtube className="h-8 w-8 transition-colors group-hover:text-white" />
              </div>
              <span className="icon-label text-slate-700">YouTube</span>
            </a>
            
            <a href={links.linkedin} target="_blank" rel="noreferrer" className="social-icon linkedin group">
              <div className="icon-container border border-slate-100 bg-slate-50 text-slate-700 shadow-sm transition-all duration-300">
                <Linkedin className="h-8 w-8 transition-colors group-hover:text-white" />
              </div>
              <span className="icon-label text-slate-700">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
      
      <style>{`
        .social-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }
        
        .icon-container {
          display: inline-flex;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          transition: all 0.3s ease;
          position: relative;
          justify-content: center;
          align-items: center;
        }
        
        .social-icon:hover .icon-container {
          transform: translateY(-8px);
        }
        
        .social-icon:hover .icon-label {
          opacity: 1;
          transform: translateY(3px);
          color: #4B1D3F;
          font-weight: 700;
        }
        
        .icon-label {
          margin-top: 12px;
          font-weight: 600;
          opacity: 0.8;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        
        .social-icon.instagram:hover .icon-container {
          background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%);
          border-color: transparent;
          box-shadow: 0 10px 20px rgba(225, 48, 108, 0.3);
        }
        
        .social-icon.tiktok:hover .icon-container {
          background: #000000;
          border-color: transparent;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }
        
        .social-icon.youtube:hover .icon-container {
          background: #FF0000;
          border-color: transparent;
          box-shadow: 0 10px 20px rgba(255, 0, 0, 0.3);
        }
        
        .social-icon.linkedin:hover .icon-container {
          background: #0077b5;
          border-color: transparent;
          box-shadow: 0 10px 20px rgba(0, 119, 181, 0.3);
        }
        
        .social-icon:hover svg {
          animation: shake 0.5s;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          20% { transform: translateX(-3px) rotate(-3deg); }
          40% { transform: translateX(3px) rotate(3deg); }
          60% { transform: translateX(-3px) rotate(-3deg); }
          80% { transform: translateX(3px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
};

export {SocialConnect};
