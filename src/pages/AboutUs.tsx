import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const getDefaultAboutUsHtml = (t: any) => `
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div class="text-start mb-16 relative">
    <h1 class="text-5xl font-bold font-serif italic text-[#0f172a] mb-4">${t('about.title', 'About Us')}</h1>
    <p class="text-gray-500 text-lg sm:text-xl">${t('about.subtitle', 'Inspiring discovery through creativity.')}</p>
    
    <!-- Abstract graphic top right -->
    <div class="absolute right-0 top-0 opacity-20 pointer-events-none hidden md:block">
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M100 200A100 100 0 0 1 0 100 100 100 0 0 1 100 0v200z" fill="#d7b068"/>
      </svg>
    </div>
  </div>

  <div class="flex flex-col md:flex-row items-center gap-16 mb-24">
    <div class="flex-1">
      <p class="text-[10px] font-bold uppercase tracking-widest text-[#d7b068] mb-6">${t('about.about_nesrina', 'ABOUT NESRINA')}</p>
      <div class="text-gray-600 space-y-6 leading-relaxed text-lg">
        <p>
          ${t('about.p1', "Most people are waiting for the right moment. The right strategy. The right opportunity. You are not most people. You feel it — that pull toward something bigger. That quiet certainty that you were built for more. You just haven't found the key yet. I am here because I found it.")}
        </p>
        <p>
          <strong class="text-xl font-serif italic text-ink block mb-2">${t('about.p2_title', 'I am Nesrina. Not just a coach. A living proof.')}</strong>
          ${t('about.p2', "I came from Tunisia with a vision and no safety net. I built my financial freedom at 28 — from scratch, on my own terms. I scaled businesses by 10x. I studied money, mind, and reality for 8 years straight — not in theory. In life. And what I discovered changed everything.")}
        </p>
        <div class="pl-6 border-l-4 border-[#d7b068] my-8 py-2">
            <p class="font-bold text-xl text-ink">${t('about.q1', 'Success is not a strategy.')}</p>
            <p class="font-bold text-xl text-ink">${t('about.q2', 'Money is not a method.')}</p>
            <p class="font-bold text-xl text-ink">${t('about.q3', 'Business is not a system.')}</p>
            <p class="font-bold text-2xl text-primary mt-4">${t('about.q4', 'They are all frequencies First.')}</p>
        </div>
        <p>
          ${t('about.p3', "And when you learn to become — not just to do — everything you've been reaching for starts reaching back. This is what I teach. This is what I live. This is Nesrina 369.")}
        </p>
        <p class="text-xl font-medium mt-6 text-black border-b border-gray-200 pb-6 inline-block">
          ${t('about.p4', "Your freedom is not a dream. It is a frequency away. Are you ready to find it?")}
        </p>
      </div>
    </div>
    <div class="flex-1 w-full flex justify-center md:justify-end">
      <div class="w-full md:w-[80%] bg-white pb-8">
         <img src="https://kesaqpisyoljqacpnezk.storage.supabase.co/storage/v1/object/public/uploads/1777980905649_w4ut7m_about_us_.png" alt="Nesrina" class="w-full h-auto object-cover rounded shadow-lg" />
      </div>
    </div>
  </div>

  <div class="mb-16">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 relative gap-6">
       <div>
         <p class="text-[12px] font-bold uppercase tracking-widest text-[#d7b068] mb-4">${t('about.why_choose_us', 'WHY CHOOSE US')}</p>
         <h2 class="text-3xl md:text-5xl font-bold font-sans text-ink">${t('about.why_title', 'Learn the Skills you Need\nto Succeed').replace('\\n', '<br/>')}</h2>
       </div>
       <p class="text-gray-500 max-w-lg text-start md:text-start text-sm md:text-base leading-relaxed hidden sm:block">${t('about.why_desc', 'Online learning community with thousands of classes for creative and curious people, on topics including illustration, design, photography, video, freelancing, and more.')}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-[#d7b068] text-white p-10 rounded-[30px] flex gap-4 item-start relative overflow-hidden group">
        <div class="flex-1">
          <h3 class="text-xl font-bold mb-4 z-10 relative">${t('about.b1_title', 'Get Achieve New Level')}</h3>
          <p class="text-white/80 text-sm leading-relaxed z-10 relative">${t('about.b1_desc', 'Flexible Classes refers to the process of acquiring. Dui accumsan sit amet nulla facilisi. Neque convallis a cras semper auctor neque.')}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white/20 shrink-0 flex items-center justify-center z-10 relative">
          <span class="text-xl">🎓</span>
        </div>
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition duration-700"></div>
      </div>
      <div class="bg-primary text-white p-10 rounded-[30px] flex gap-4 item-start relative overflow-hidden group">
        <div class="flex-1">
          <h3 class="text-xl font-bold mb-4 z-10 relative">${t('about.b2_title', 'Learn With Effectivey')}</h3>
          <p class="text-white/80 text-sm leading-relaxed z-10 relative">${t('about.b2_desc', 'Flexible Classes refers to the process of acquiring. Dui accumsan sit amet nulla facilisi. Neque convallis a cras semper auctor neque.')}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white/10 shrink-0 flex items-center justify-center z-10 relative">
          <span class="text-xl">💡</span>
        </div>
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition duration-700"></div>
      </div>
      <div class="bg-[#d7b068] text-white p-10 rounded-[30px] flex gap-4 item-start relative overflow-hidden group">
        <div class="flex-1">
          <h3 class="text-xl font-bold mb-4 z-10 relative">${t('about.b3_title', 'Award Winning Team')}</h3>
          <p class="text-white/80 text-sm leading-relaxed z-10 relative">${t('about.b3_desc', 'Flexible Classes refers to the process of acquiring. Dui accumsan sit amet nulla facilisi. Neque convallis a cras semper auctor neque.')}</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white/20 shrink-0 flex items-center justify-center z-10 relative">
          <span class="text-xl">🏆</span>
        </div>
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition duration-700"></div>
      </div>
    </div>
  </div>
</div>
`;

export function AboutUs() {
  const [htmlContent, setHtmlContent] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(() => {
    fetch("/api/settings") // ensure there is an endpoint for public settings
      .then(res => res.json())
      .then(settings => {
         const pageKey = i18n.language === 'en' ? "ABOUT_US_PAGE" : `ABOUT_US_PAGE_${i18n.language}`;
         const aboutUsSetting = settings.find((s: any) => s.key === pageKey);
         let content = getDefaultAboutUsHtml(t);
         if (aboutUsSetting && aboutUsSetting.value) {
           content = aboutUsSetting.value;
         }

         const siteImagesSetting = settings.find((s: any) => s.key === "SITE_IMAGES");
         if (siteImagesSetting && siteImagesSetting.value) {
           try {
             const siteImages = JSON.parse(siteImagesSetting.value);
             if (siteImages.aboutUsImage) {
               // Replace the hardcoded Unsplash image or inject it.
               content = content.replace(/https:\/\/images\.unsplash\.com\/photo-1573496359142-b8d87734a5a2\?auto=format&fit=crop&q=80&w=800/g, siteImages.aboutUsImage);
               // Also generic replace if they somehow modified the html but kept the img structure
               // A slightly safer approach if the user hasn't edited the image src.
             }
           } catch (e) {}
         }
         
         setHtmlContent(content);
      })
      .catch(() => {
         setHtmlContent(getDefaultAboutUsHtml(t));
      });
  }, [i18n.language]);

  return (
    <div className="bg-white min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
