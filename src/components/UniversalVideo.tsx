import React from "react";
import ReactPlayer from "react-player";

export function UniversalVideo({ url, className = "absolute inset-0 w-full h-full", autoPlay = false }: { url: string, className?: string, autoPlay?: boolean }) {
  if (!url) return null;

  const isIframeHtml = url.trim().startsWith('<iframe');
  
  // Handle known iframe sources that ReactPlayer might struggle with (like Bunny.net embed)
  if (url.trim().startsWith('<iframe')) {
    let srcMatch = url.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      let finalSrc = srcMatch[1];
      if (autoPlay) {
        finalSrc += finalSrc.includes('?') ? '&autoplay=true' : '?autoplay=true';
      }
      return (
        <iframe 
          src={finalSrc} 
          loading="lazy" 
          className={`${className} border-none`}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen" 
          allowFullScreen>
        </iframe>
      );
    }
    return (
       <div 
          className={`[&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none ${className}`} 
          dangerouslySetInnerHTML={{ __html: url }} 
       />
    );
  }

  // Convert standard YouTube URLs to embed URLs to use raw iframe which works best
  let finalUrl = url;
  if (url.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
    } catch(e) {}
  } else if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (url.includes('youtube.com/shorts/')) {
    const videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
    if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  // Convert standard Vimeo URLs
  if (finalUrl.includes('vimeo.com/') && !finalUrl.includes('player.vimeo.com')) {
    const vimeoId = finalUrl.split('vimeo.com/')[1]?.split(/[?/#]/)[0];
    if (vimeoId) finalUrl = `https://player.vimeo.com/video/${vimeoId}`;
  }

  // Use raw iframe for Bunny.net or direct embed paths
  if (finalUrl.includes('iframe.mediadelivery.net') || finalUrl.includes('/embed/') || finalUrl.includes('player.vimeo.com')) {
    let embedUrl = finalUrl;
    if (autoPlay) {
      embedUrl += embedUrl.includes('?') ? '&autoplay=1' : '?autoplay=1';
    }
    return (
      <iframe 
        src={embedUrl} 
        loading="lazy" 
        className={`${className} border-none`}
        allow="accelerometer;gyroscope;autoplay;clipboard-write;encrypted-media;picture-in-picture;web-share;fullscreen" 
        allowFullScreen>
      </iframe>
    );
  }

  // Ensure plain mp4/webm falls back to standard video tag if possible, 
  // but we can rely on ReactPlayer as a last resort
  if (finalUrl.endsWith('.mp4') || finalUrl.endsWith('.webm')) {
     return (
        <video 
           src={finalUrl} 
           controls 
           autoPlay={autoPlay}
           className={`${className} bg-black object-cover`} 
        />
     );
  }

  // Fallback to ReactPlayer for anything else
  return (
    <div className={`${className} bg-black overflow-hidden flex items-center justify-center`}>
      {/* @ts-ignore */}
      {React.createElement(ReactPlayer as any, { 
         url: finalUrl, 
         width: '100%', 
         height: '100%', 
         controls: true,
         playing: autoPlay
      })}
    </div>
  );
}
