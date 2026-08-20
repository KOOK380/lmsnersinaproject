const fs = require('fs');

// Fix AdminManagerComponents
let adminCode = fs.readFileSync('src/pages/AdminManagerComponents.tsx', 'utf8');
adminCode = adminCode.replace('<textarea placeholder="Testimonial text" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full mt-4 p-3 border rounded-xl h-24" required></textarea>', '<textarea placeholder="Testimonial text (Optional)" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} className="w-full mt-4 p-3 border rounded-xl h-24"></textarea>');
fs.writeFileSync('src/pages/AdminManagerComponents.tsx', adminCode);

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const targetInterval = `    if (isPlaying) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, isPlaying]);`;

const repInterval = `    if (isPlaying || testimonials[index]?.videoUrl) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, isPlaying, index, testimonials]);`;

const targetPlayer = `<ReactPlayer url={testi.videoUrl} width="100%" height="100%" controls onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />`;
const repPlayer = `<ReactPlayer url={testi.videoUrl} width="100%" height="100%" controls playing={true} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => { setIsPlaying(false); setIndex((prev) => (prev + 1) % testimonials.length); }} />`;

const targetText = `<p className="text-[14px] md:text-[15px] italic font-medium leading-[1.7] text-[#1e293b] mb-8 flex-1 whitespace-pre-line">
              {testi.text}
           </p>`;
const repText = `{testi.text && (
           <p className="text-[14px] md:text-[15px] italic font-medium leading-[1.7] text-[#1e293b] mb-8 flex-1 whitespace-pre-line">
              {testi.text}
           </p>
           )}`;

appCode = appCode.replace(targetInterval, repInterval).replace(targetPlayer, repPlayer).replace(targetText, repText);

fs.writeFileSync('src/App.tsx', appCode);
console.log("Done");
