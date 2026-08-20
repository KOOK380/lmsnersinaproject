const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `function TestimonialCarousel({ testimonials }: { testimonials: any[] }) {
  const [index, setIndex] = useState(0);`;

const rep1 = `function TestimonialCarousel({ testimonials }: { testimonials: any[] }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);`;

const target2 = `    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);`;

const rep2 = `    if (isPlaying) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, isPlaying]);`;

const target3 = `<ReactPlayer url={testi.videoUrl} width="100%" height="100%" controls />`;

const rep3 = `<ReactPlayer url={testi.videoUrl} width="100%" height="100%" controls onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />`;

code = code.replace(target1, rep1).replace(target2, rep2).replace(target3, rep3);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
