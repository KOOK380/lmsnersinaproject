import { prisma } from './src/lib/prisma.js';

const html = `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
    <div class="flex-1 text-lg">
      <p class="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-8">ABOUT NESRINA</p>
      
      <div class="text-gray-600 space-y-6 leading-relaxed">
        <p>Most people are waiting for the right moment. The right strategy. The right opportunity. You are not most people.</p>
        <p>You feel it &mdash; that pull toward something bigger. That quiet certainty that you were built for more. You just haven&apos;t found the key yet.</p>
        <p class="text-2xl font-serif italic text-[#0f172a]">I am here because I found it.</p>
        <p><strong>I am Nesrina. Not just a coach. A living proof.</strong></p>
        <p>I came from Tunisia with a vision and no safety net. I built my financial freedom at 28 &mdash; from scratch, on my own terms. I scaled businesses by 10x. I studied money, mind, and reality for 8 years straight &mdash; not in theory. In life.</p>
        <p>And what I discovered changed everything.</p>
        
        <div class="pl-6 border-l-4 border-[#d7b068] my-8 py-2">
            <p class="font-bold text-xl text-ink">Success is not a strategy.</p>
            <p class="font-bold text-xl text-ink">Money is not a method.</p>
            <p class="font-bold text-xl text-ink">Business is not a system.</p>
            <p class="font-bold text-2xl text-primary mt-4">They are all frequencies First.</p>
        </div>

        <p>And when you learn to become &mdash; not just to do &mdash; everything you&apos;ve been reaching for starts reaching back.</p>
        <p>This is what I teach. This is what I live. <strong>This is Nesrina 369.</strong></p>
        <p class="text-xl font-medium mt-6 text-black">Your freedom is not a dream. It is a frequency away.</p>
        <p class="font-bold pt-2 text-2xl text-primary font-serif italic">Are you ready to find it?</p>
      </div>
    </div>
    <div class="flex-1 w-full flex justify-center md:justify-end">
      <div class="w-full md:w-[80%] bg-white pb-8">
         <img src="https://kesaqpisyoljqacpnezk.storage.supabase.co/storage/v1/object/public/uploads/1777980905649_w4ut7m_about_us_.png" alt="Nesrina" class="w-full h-auto object-cover rounded-xl shadow-lg" />
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
</div>`;

async function run() {
  await prisma.setting.upsert({
    where: { key: 'ABOUT_US_PAGE' },
    update: { value: html },
    create: { key: 'ABOUT_US_PAGE', value: html }
  });
  console.log('Updated db');
}
run();
