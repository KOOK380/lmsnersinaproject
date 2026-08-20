const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Website popup video unmuted
code = code.replace(
  '<video src={popupConfig.content} controls autoPlay loop muted playsInline className="w-full max-h-[80vh] bg-black/5 block" />',
  '<video src={popupConfig.content} controls autoPlay loop playsInline className="w-full max-h-[80vh] bg-black/5 block" />'
);

// 2. Testimonial in view
const targetCarousel = `function TestimonialCarousel({ testimonials }: { testimonials: any[] }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {`;

const repCarousel = `function TestimonialCarousel({ testimonials }: { testimonials: any[] }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.5 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {`;

code = code.replace(targetCarousel, repCarousel);

const targetDiv = `<div className="relative w-full overflow-hidden flex flex-col justify-center items-center min-h-[350px]">`;
const repDiv = `<div ref={containerRef} className="relative w-full overflow-hidden flex flex-col justify-center items-center min-h-[350px]">`;

code = code.replace(targetDiv, repDiv);

const targetPlayer = `<ReactPlayer url={testi.videoUrl} width="100%" height="100%" controls playing={true} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => { setIsPlaying(false); setIndex((prev) => (prev + 1) % testimonials.length); }} />`;
const repPlayer = `<ReactPlayer url={testi.videoUrl} width="100%" height="100%" controls playing={isInView} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => { setIsPlaying(false); setIndex((prev) => (prev + 1) % testimonials.length); }} />`;

code = code.replace(targetPlayer, repPlayer);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
