import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { UniversalVideo } from './UniversalVideo';

interface MediaInputProps {
  label: string;
  type: 'image' | 'video';
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function MediaInput({ label, type, value, onChange, className = '', placeholder }: MediaInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('upload');
  const [uploading, setUploading] = useState(false);
  const { token, settings } = useStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'video' && file.size > 50 * 1024 * 1024) {
        alert("Video file is too large for upload (limit 50MB). Please use an external URL.");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data = await res.json();
          if (res.ok) {
            onChange(data.url);
          } else {
            throw new Error(data.error || "Upload failed");
          }
        } else {
          // The server (or proxy) returned an HTML error page (e.g., 413 Payload Too Large or 500)
          throw new Error(`Upload failed. The file size might be too large for the network proxy, or the storage provider is returning an error.`);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        alert(err.message || "Failed to upload file. Check storage configuration.");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className={`space-y-2 p-3 border border-slate-200 bg-white rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        <div className="flex bg-slate-100 rounded-md p-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${mode === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Upload className="w-3 h-3" /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${mode === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LinkIcon className="w-3 h-3" /> URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <input 
          type="text" 
          placeholder={placeholder || (type === 'image' ? "https://example.com/image.jpg" : "https://example.com/video.mp4")} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm bg-white transition-all shadow-sm" 
        />
      ) : (
        <div className="relative w-full border-2 border-dashed border-slate-200 rounded-md p-3 hover:border-indigo-400 transition-colors bg-slate-50/50">
          <input 
            type="file" 
            accept={type === 'image' ? "image/*" : "video/*"} 
            onChange={handleFileUpload} 
            disabled={uploading}
            className={`absolute inset-0 w-full h-full opacity-0 ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
          />
          <div className="flex flex-col items-center justify-center text-slate-500 space-y-2 pointer-events-none">
            {uploading ? (
                <>
                   <Loader2 className="w-6 h-6 animate-spin text-primary" />
                   <span className="text-sm font-semibold text-primary">Uploading...</span>
                </>
            ) : (
                <>
                   <Upload className="w-6 h-6 text-slate-400" />
                   <span className="text-sm font-semibold">Click or drag {type} to upload</span>
                   {type === 'video' && <span className="text-[10px]">Max size: 50MB</span>}
                </>
            )}
          </div>
        </div>
      )}

      {value && type === 'image' && (
        <img src={value} alt="Preview" className="h-32 object-contain mt-4 rounded-lg border border-slate-100 bg-slate-50" />
      )}
      
      {value && type === 'video' && mode === 'url' && (
         <div className="mt-4 flex flex-col gap-2">
            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 leading-relaxed">
              External URL saved. The player handles YouTube, Vimeo, Bunny.net and standard mp4 files.
            </div>
            <div className="h-32 w-full rounded bg-black relative overflow-hidden">
               <UniversalVideo url={value} />
            </div>
         </div>
      )}
      {value && type === 'video' && mode === 'upload' && (
         <div className="mt-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100 flex flex-col gap-2">
           <span className="font-medium">Video uploaded successfully.</span>
           <video className="h-32 w-full object-cover rounded bg-black" src={value} controls={true} />
         </div>
      )}
    </div>
  );
}
