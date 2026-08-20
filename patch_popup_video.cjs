const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetReturn = `  if (!isOpen || !popupConfig?.enabled) return null;`;
const injectHooks = `  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMutedFallback, setIsMutedFallback] = useState(false);

  useEffect(() => {
    if (isOpen && popupConfig?.type === 'VIDEO' && videoRef.current) {
      // Browsers block unmuted autoplay on initial load.
      // We try to play unmuted first:
      videoRef.current.muted = false;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Unmuted autoplay blocked, falling back to muted autoplay.");
          setIsMutedFallback(true);
          if (videoRef.current) {
             videoRef.current.muted = true;
             videoRef.current.play().catch(e => console.log("Muted autoplay also blocked:", e));
          }
        });
      }
    }
  }, [isOpen, popupConfig?.type]);

  if (!isOpen || !popupConfig?.enabled) return null;`;

code = code.replace(targetReturn, injectHooks);

const targetVideo = `<video src={popupConfig.content} controls autoPlay loop playsInline className="w-full max-h-[80vh] bg-black/5 block" />`;
const repVideo = `<video ref={videoRef} src={popupConfig.content} controls loop playsInline className="w-full max-h-[80vh] bg-black/5 block" />
      {isMutedFallback && (
         <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none z-10 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            Click video to unmute
         </div>
      )}`;

// But wait, the video might be wrapped in an `<a>` tag, so placing the fallback div next to it needs a fragment or a container if we replace just the `const video = ...`

// Let's replace the whole block in renderContent:
const targetBlock = `    if (popupConfig.type === 'VIDEO' && popupConfig.content) {
      const video = <video src={popupConfig.content} controls autoPlay loop playsInline className="w-full max-h-[80vh] bg-black/5 block" />;
      return popupConfig.linkUrl ? <a href={popupConfig.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative">{video}</a> : video;
    }`;

const repBlock = `    if (popupConfig.type === 'VIDEO' && popupConfig.content) {
      const video = (
        <div className="relative w-full">
          <video ref={videoRef} src={popupConfig.content} controls loop playsInline className="w-full max-h-[80vh] bg-black/5 block" />
          {isMutedFallback && (
            <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none z-10 flex items-center gap-2 font-bold tracking-wide">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
               Tap to unmute
            </div>
          )}
        </div>
      );
      return popupConfig.linkUrl ? <a href={popupConfig.linkUrl} target="_blank" rel="noopener noreferrer" className="block relative">{video}</a> : video;
    }`;

code = code.replace(targetBlock, repBlock);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx for smart video autoplay");
