const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<div className="flex gap-1 text-[#fbbf24] mb-4">
               {[...Array(5)].map((_, idx) => <svg key={idx} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>)}
           </div>`;

const replacement = target + `
           {testi.videoUrl && (
             <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-black">
               <ReactPlayer url={testi.videoUrl} width="100%" height="100%" controls />
             </div>
           )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced successfully!");
} else {
  console.log("Target not found!");
}
