import React, { useState, useEffect } from "react";
import { SocialConnect } from "../components/ui/connect-with-us";
import { Headphones, Mail, MapPin } from "lucide-react";
import { useStore } from "../store";

export function ContactUs() {
  const { settings } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<null | 'submitting' | 'success' | 'error'>(null);

  const siteImagesStr = settings.find((s:any) => s.key === 'SITE_IMAGES')?.value;
  const siteImages = siteImagesStr ? JSON.parse(siteImagesStr) : {};
  const contactUsImage = siteImages.contactUsImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to submit');
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1100px] mx-auto px-4 pt-4 pb-16">
        
        {/* Social Links Section */}
        <div className="mb-16">
          <SocialConnect />
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6 items-start">
            <Headphones className="w-10 h-10 text-[#d4af37]" strokeWidth={1.5} />
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Contact phone number</h3>
              <p className="text-slate-600">+971 55 780 0863</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6 items-start">
            <Mail className="w-10 h-10 text-[#d4af37]" strokeWidth={1.5} />
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Email Address</h3>
              <p className="text-slate-600">info@nesrinaconsultancy.com</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-6 items-start">
            <MapPin className="w-10 h-10 text-[#d4af37]" strokeWidth={1.5} />
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Our Location</h3>
              <p className="text-slate-600">Abu Dhabi , UAE</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-stretch mb-20">
          
          {/* Left Column: Image and Details */}
          <div className="flex flex-col h-full bg-[#3B1736] rounded-[40px] overflow-hidden relative shadow-lg w-full max-w-[480px] mx-auto min-h-[400px]">
            {/* Background Arc */}
            <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-primary rounded-t-[50%] z-0" />
            
            <div className="absolute inset-0 z-10 flex-1 flex items-end justify-center pt-10 px-8">
               <img src={contactUsImage} alt="Customer Support" className="w-[85%] object-cover object-bottom drop-shadow-2xl relative -bottom-2" />
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="flex flex-col justify-center py-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">Send a Message</h1>
            <p className="text-slate-500 mb-8 font-medium">Have a question or need assistance? Our team is here to help.</p>

            {status === 'success' ? (
              <div className="p-6 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
                <p className="font-bold">Thank you for your message!</p>
                <p className="text-sm mt-1">We will get back to you soon.</p>
                <button onClick={() => setStatus(null)} className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg text-sm hover:bg-emerald-200">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white shadow-sm" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white shadow-sm" placeholder="example@gmail.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Message</label>
                  <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white shadow-sm min-h-[180px] resize-y" placeholder="Your message..."></textarea>
                </div>
                <button disabled={status === 'submitting'} type="submit" className="w-auto px-8 py-3.5 bg-[#3B1736] text-white rounded-full font-bold hover:bg-primary transition disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>
                {status === 'error' && <p className="text-red-500 text-sm font-bold mt-2">Failed to send message. Please try again.</p>}
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
