import { useEffect, useState } from "react";

export const defaultAboutUsHtml = `
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div class="text-left mb-16 relative">
    <h1 class="text-5xl font-bold font-serif italic text-[#0f172a] mb-4">About Us</h1>
    <p class="text-gray-500 text-lg sm:text-xl">Inspiring discovery through creativity.</p>
    
    <!-- Abstract graphic top right -->
    <div class="absolute right-0 top-0 opacity-20 pointer-events-none hidden md:block">
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M100 200A100 100 0 0 1 0 100 100 100 0 0 1 100 0v200z" fill="#d7b068"/>
      </svg>
    </div>
  </div>

  <div class="flex flex-col md:flex-row items-center gap-16 mb-24">
    <div class="flex-1">
      <p class="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">ABOUT ME</p>
      <h2 class="text-4xl lg:text-5xl font-bold font-serif italic text-[#0f172a] mb-6 leading-tight">Hey there!<br/>I'm Nesrina</h2>
      <div class="text-gray-600 space-y-4 leading-relaxed">
        <p>Not Just a Coach - A Living Case Study!" I am Nesrina. Industrial Engineer. Certified Coach. Investor. Entrepreneur. Financially free at 28 - built from scratch, from Tunisia to the UAE, through failures, breakthroughs, and 8 years of obsessive research into money and the human mind.</p>
        <p>I have scaled company sales by 10x. I have been named Best Employee of the Year. I have lived both sides - the employee and the entrepreneur. And I have done what most people only dream about: I built my own financial freedom - on my own terms. I do not teach only theory. I teach what I lived. I believe in mindset. I believe in strategy. And I believe in luck - the kind you activate through preparation, discipline, and the decision to finally bet on yourself. Nesrina 369 Consultancy exists for one reason – to make your freedom inevitable.</p>
        <p class="font-bold pt-4 text-ink">Welcome to the Community</p>
      </div>
    </div>
    <div class="flex-1 w-full flex justify-center md:justify-end">
      <div class="w-full md:w-[80%] bg-white pb-8">
         <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Nesrina" class="w-full h-auto object-cover" />
      </div>
    </div>
  </div>

  <div class="mb-16">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 relative gap-6">
       <div>
         <p class="text-[12px] font-bold uppercase tracking-widest text-[#d7b068] mb-4">WHY CHOOSE US</p>
         <h2 class="text-3xl md:text-5xl font-bold font-sans text-ink">Learn the Skills you Need<br/>to Succeed</h2>
       </div>
       <p class="text-gray-500 max-w-lg text-left md:text-left text-sm md:text-base leading-relaxed hidden sm:block">Online learning community with thousands of classes for creative and curious people, on topics including illustration, design, photography, video, freelancing, and more.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-[#d7b068] text-white p-10 rounded-[30px] flex gap-4 item-start relative overflow-hidden group">
        <div class="flex-1">
          <h3 class="text-xl font-bold mb-4 z-10 relative">Get Achieve<br/>New Level</h3>
          <p class="text-white/80 text-sm leading-relaxed z-10 relative">Flexible Classes refers to the process of acquiring. Dui accumsan sit amet nulla facilisi. Neque convallis a cras semper auctor neque. Ut placerat orci nulla pellentesque.</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white/20 shrink-0 flex items-center justify-center z-10 relative">
          <span class="text-xl">🎓</span>
        </div>
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition duration-700"></div>
      </div>
      <div class="bg-primary text-white p-10 rounded-[30px] flex gap-4 item-start relative overflow-hidden group">
        <div class="flex-1">
          <h3 class="text-xl font-bold mb-4 z-10 relative">Learn With<br/>Effectivey</h3>
          <p class="text-white/80 text-sm leading-relaxed z-10 relative">Flexible Classes refers to the process of acquiring. Dui accumsan sit amet nulla facilisi. Neque convallis a cras semper auctor neque. Ut placerat orci nulla pellentesque.</p>
        </div>
        <div class="w-12 h-12 rounded-full bg-white/10 shrink-0 flex items-center justify-center z-10 relative">
          <span class="text-xl">💡</span>
        </div>
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition duration-700"></div>
      </div>
      <div class="bg-[#d7b068] text-white p-10 rounded-[30px] flex gap-4 item-start relative overflow-hidden group">
        <div class="flex-1">
          <h3 class="text-xl font-bold mb-4 z-10 relative">Award Winning<br/>Team</h3>
          <p class="text-white/80 text-sm leading-relaxed z-10 relative">Flexible Classes refers to the process of acquiring. Dui accumsan sit amet nulla facilisi. Neque convallis a cras semper auctor neque. Ut placerat orci nulla pellentesque.</p>
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

  useEffect(() => {
    fetch("/api/settings") // ensure there is an endpoint for public settings
      .then(res => res.json())
      .then(settings => {
         const aboutUsSetting = settings.find((s: any) => s.key === "ABOUT_US_PAGE");
         let content = defaultAboutUsHtml;
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
         setHtmlContent(defaultAboutUsHtml);
      });
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}
