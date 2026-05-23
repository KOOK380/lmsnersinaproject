import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore, getTranslated } from "../store";
import { formatCurrency, stripHtml } from "../lib/utils";
import { Check, Calendar, MapPin, AlertCircle } from "lucide-react";
import ReactPlayer from "react-player";
import { UniversalVideo } from "../components/UniversalVideo";

export function SeoTags({ entityType, entityId, fallbackTitle }: { entityType: string, entityId: string, fallbackTitle: string }) {
  useEffect(() => {
    let active = true;
    fetch(`/api/seo/${entityType}/${entityId}`)
      .then(r => r.json())
      .then(data => {
        if (!active) return;
        document.title = data.title || fallbackTitle || "Nesrina 369 Consultancy";
        
        // Update description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
           metaDesc.setAttribute('content', data.description || "Nesrina 369 Consultancy");
        } else if (data.description) {
           metaDesc = document.createElement('meta');
           metaDesc.setAttribute('name', 'description');
           metaDesc.setAttribute('content', data.description);
           document.head.appendChild(metaDesc);
        }

        // Update keywords
        let metaKey = document.querySelector('meta[name="keywords"]');
        if (metaKey) {
           metaKey.setAttribute('content', data.keywords || "");
        } else if (data.keywords) {
           metaKey = document.createElement('meta');
           metaKey.setAttribute('name', 'keywords');
           metaKey.setAttribute('content', data.keywords);
           document.head.appendChild(metaKey);
        }
      })
      .catch(e => {
         if (active) document.title = fallbackTitle || "Nesrina 369 Consultancy";
      });
      
    return () => { active = false; };
  }, [entityType, entityId, fallbackTitle]);

  return null;
}

export function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const { currency, enrolledItems, categories, language } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetch("/api/courses/active").then(r => r.json()).then(setCourses);
  }, []);

  const tCourses = getTranslated(courses, language) || [];

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12 overflow-hidden md:overflow-visible">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between border border-primary/10">
         <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-primary font-bold mb-4">{t('courses.all_courses')}</h1>
            <p className="text-slate-600 max-w-xl text-lg font-medium">Explore our exclusive courses to master new skills and elevate your career.</p>
         </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 hide-scrollbar flex-nowrap w-full">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-6 py-2 rounded-full font-bold text-sm transition shrink-0 snap-start ${activeCategory === null ? 'bg-primary text-white shadow-sm' : 'border border-primary text-primary hover:bg-primary/5'}`}
        >
          All Courses
        </button>
        {categories.filter((cat: any) => cat.type === 'COURSE').map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition shrink-0 snap-start ${activeCategory === cat.id ? 'bg-primary text-white shadow-sm' : 'border border-primary text-primary hover:bg-primary/5'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {tCourses.filter((c: any) => !activeCategory || c.categoryId === activeCategory).length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12 bg-white rounded-2xl border border-slate-100">No courses available in this category.</div>
        ) : tCourses.filter((c: any) => !activeCategory || c.categoryId === activeCategory).map((course: any) => {
          const isEnrolled = Array.isArray(enrolledItems) && enrolledItems.some((c: any) => c.itemType === "COURSE" && c.itemId === course.id);
          return (
            <Link to={`/courses/${course.id}`} key={course.id} className="bg-white rounded-2xl p-5 border border-slate-100 card-hover shadow-sm flex flex-col group">
              {course.imageUrl ? (
                <div className="h-40 rounded-xl mb-4 overflow-hidden">
                  <img src={course.imageUrl || undefined} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-primary to-[#8c356b] rounded-xl mb-4 overflow-hidden flex items-center justify-center opacity-90 relative">
                   <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                   <span className="text-5xl font-serif italic font-bold text-white/40 drop-shadow-sm">{course.title?.charAt(0) || 'C'}</span>
                </div>
              )}
              {course.level && <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-500 border border-indigo-100 text-[10px] font-bold uppercase rounded-md mb-2 w-max">{course.level}</span>}
              <div className="flex flex-wrap gap-2 mb-1 items-center">
                 <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{course.category?.name || 'Uncategorized'}</p>
                 {course.labels?.map((label: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded uppercase tracking-widest">{label}</span>
                 ))}
              </div>
              <h3 className="font-bold text-lg leading-tight mb-2 flex-1">{course.title}</h3>
              <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-4">
               <div className="flex flex-col">
                  {course.price > 0 ? (
                    <>
                      {course.realPrice && course.realPrice > course.price && <span className="text-xs text-slate-400 line-through">{formatCurrency(course.realPrice, currency)}</span>}
                      <span className="font-bold text-primary text-xl">{formatCurrency(course.price, currency)}</span>
                    </>
                  ) : course.memberships && course.memberships.length > 0 ? (
                    <>
                       <span className="text-xs text-slate-500 font-medium">{t('courses.starting_from', 'Starting from')}</span>
                       <span className="font-bold text-primary text-xl">{formatCurrency(Math.min(...course.memberships.map((m: any) => m.offerPrice || 0)), currency)}</span>
                    </>
                  ) : (
                    <span className="font-bold text-primary text-xl">{formatCurrency(0, currency)}</span>
                  )}
               </div>
                {isEnrolled ? (
                  <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider items-center flex gap-1"><Check className="w-3 h-3" /> Purchased</span>
                ) : (
                  <span className="px-5 py-2 bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white text-xs rounded-full font-bold shadow-sm transition tracking-wide">{t('courses.details')}</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}

  export function CourseDetails() {
    const { id } = useParams();
    const [courseRaw, setCourse] = useState<any>(null);
    const { user, token, addToCart, cart, setAuthModalOpen, currency, favorites, toggleFavorite, language } = useStore();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [addingToCart, setAddingToCart] = useState(false);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);
    const [selectedEdition, setSelectedEdition] = useState<string>('');
    const [selectedOption, setSelectedOption] = useState<string>('course');
    const [editionError, setEditionError] = useState<boolean>(false);
    
    const [dashboardData, setDashboardData] = useState<any>(null);

    const enrolled = React.useMemo(() => {
        if (!dashboardData) return false;
        if (selectedOption === 'course') {
            const courseUser = dashboardData.courses?.find((c: any) => c.courseId === courseRaw?.id);
            if (courseUser) return !(courseUser.expiresAt && new Date(courseUser.expiresAt) < new Date());
            return false;
        } else {
            const memUser = dashboardData.memberships?.find((m: any) => m.membershipId === selectedOption);
            if (memUser) return !(memUser.expiresAt && new Date(memUser.expiresAt) < new Date());
            return false;
        }
    }, [dashboardData, selectedOption, courseRaw?.id]);

    const baseCourse = getTranslated(courseRaw, language);
    const course = React.useMemo(() => {
        if (selectedOption === 'course' || !courseRaw?.memberships) return baseCourse;
        
        const mem = courseRaw.memberships.find((m:any) => m.id === selectedOption);
        if (!mem) return baseCourse;
        
        const memTrans = mem.contents?.find((c:any) => c.language === language) || mem.contents?.[0] || {};
        return {
            ...baseCourse,
            title: memTrans.title || mem.label || mem.type || baseCourse.title,
            description: memTrans.description || baseCourse.description,
            imageUrl: mem.imageUrl || baseCourse.imageUrl,
            bannerVideoUrl: '', 
        };
    }, [baseCourse, courseRaw?.memberships, selectedOption, language]);
    
    const [reviews, setReviews] = useState<any[]>([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

    const fetchReviews = () => {
      fetch(`/api/reviews?courseId=${id}`).then(r => r.json()).then(setReviews).catch(() => {});
    };

    useEffect(() => {
      fetch(`/api/courses/${id}`).then(r => r.json()).then(res => {
         setCourse(res);
         if (res && res.price === 0 && res.memberships?.length > 0) {
            setSelectedOption(res.memberships[0].id);
         }
      });
      fetchReviews();
    }, [id]);

    useEffect(() => {
      const localToken = localStorage.getItem("token") || token;
      if (user && course && localToken) {
        fetch("/api/dashboard", { headers: { Authorization: `Bearer ${localToken}` } })
          .then(r => r.json())
          .then(res => {
             if(!res.error) setDashboardData(res);
          });
      }
    }, [user, course, token]);

    const handlePostReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      const localToken = localStorage.getItem("token") || token;
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localToken}` },
        body: JSON.stringify({ ...newReview, courseId: id })
      });
      if (res.ok) {
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to post review");
      }
    };
  
    if (!course) return <div className="p-12 text-center text-slate-500 italic font-serif">Loading course details...</div>;
  
    const inCart = cart.some((i: any) => 
       selectedOption === 'course' ? (i.itemType === "COURSE" && i.itemId === course?.id) 
       : (i.itemType === "MEMBERSHIP" && i.itemId === selectedOption)
    );

    const handleBuy = () => {
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      if (enrolled) {
        navigate("/dashboard");
        return;
      }
      if (inCart) {
        navigate("/cart");
        return;
      }
      
      if (selectedOption !== 'course' && courseRaw?.memberships) {
         const membership = courseRaw.memberships.find((m:any) => m.id === selectedOption);
         if (membership) {
            setAddingToCart(true);
            setTimeout(() => {
              addToCart({ 
                 id: Math.random().toString(), 
                 itemType: "MEMBERSHIP", 
                 itemId: membership.id, 
                 title: membership.contents?.find((c:any) => c.language === language)?.title || membership.contents?.[0]?.title || membership.label || membership.type, 
                 price: membership.offerPrice 
              });
              setAddingToCart(false);
              navigate("/cart");
            }, 800);
            return;
         }
      }
      
      const edition = course.editions?.find((e: any) => e.id === selectedEdition);
      if (course.editions?.length > 0 && !edition) {
          setEditionError(true);
          const el = document.getElementById('editions-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          return;
      }
      setEditionError(false);
      if (edition && edition.availableSeats <= 0) return alert("This edition is full");

      let finalTitle = course.title;
      if (edition) {
          finalTitle += ` - ${edition.title}`;
          if (edition.mode || edition.date) {
             finalTitle += ` (${edition.mode || 'Online'}${edition.date ? ', ' + new Date(edition.date).toLocaleDateString() : ''})`;
          }
      }
      
      setAddingToCart(true);
      setTimeout(() => {
        addToCart({ 
           id: Math.random().toString(), 
           itemType: "COURSE", 
           itemId: course.id, 
           editionId: selectedEdition || undefined,
           title: finalTitle, 
           price: course.price 
        });
        setAddingToCart(false);
        navigate("/cart");
      }, 800);
    };

    const handleFavorite = async () => {
      const localToken = localStorage.getItem("token") || token;
      if (!user || !localToken) {
        setAuthModalOpen(true);
        return;
      }
      await toggleFavorite("COURSE", course.id, localToken);
    };

    const isFavored = favorites.some((f: any) => f.itemType === "COURSE" && f.itemId === course.id);

  const totalLessons = course.lessons?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-28 md:pb-12">
      <SeoTags entityType="COURSE" entityId={course.id} fallbackTitle={course.title} />
      {/* Breadcrumbs */}
      <div className="text-sm text-slate-500 mb-6 flex gap-2">
        <Link to="/" className="hover:text-primary">{t('nav.home')}</Link>
        <span>&gt;</span>
        <Link to="/courses" className="hover:text-primary">{t('nav.courses')}</Link>
        <span>&gt;</span>
        <span className="font-medium text-slate-800">{course.title}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12">
        {/* Left Column Part 1 */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Header Info */}
          <div>
             <div className="flex flex-wrap gap-2 mb-4 items-center">
                 {course.category?.name && (
                     <span className="inline-block px-3 py-1 bg-[var(--color-primary)] text-white text-[10px] font-bold rounded tracking-wider uppercase">
                         {course.category.name}
                     </span>
                 )}
                 {course.labels?.map((label: string, i: number) => (
                     <span key={i} className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded tracking-wider uppercase">
                         {label}
                     </span>
                 ))}
             </div>
             <h1 className="text-3xl md:text-5xl font-bold mb-4 font-sans text-gray-900 leading-tight">{course.title}</h1>
             
             <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-6">
                <span className="flex items-center gap-1 text-orange-400 font-bold">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  0 (0 reviews)
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="font-medium">{course.level || 'Beginner Level'}</span>
             </div>

             {course.instructor && (
               <div className="flex items-center gap-3">
                 {course.instructor.imageUrl ? (
                   <img src={course.instructor.imageUrl} alt={course.instructor.name} className="w-10 h-10 rounded-full object-cover lg:w-12 lg:h-12 border border-slate-100" />
                 ) : (
                   <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{course.instructor.name.charAt(0)}</div>
                 )}
                 <div className="text-sm">
                    <p className="text-slate-500">By <span className="font-bold text-gray-900">{course.instructor.name}</span></p>
                    <p className="text-slate-400 text-xs">Last updated April 25, 2026</p>
                 </div>
               </div>
             )}
          </div>

          {/* Banner */}
          {(course.bannerVideoUrl || course.imageUrl) && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 flex items-center justify-center relative shadow-sm group">
              {course.bannerVideoUrl && isPlayingVideo ? (
                <UniversalVideo url={course.bannerVideoUrl} autoPlay={true} />
              ) : (
                <>
                  {course.imageUrl ? (
                    <img src={course.imageUrl || undefined} alt="Course Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                       <span className="text-slate-400 font-medium">Course Media</span>
                    </div>
                  )}
                  {course.bannerVideoUrl && (
                    <button 
                       onClick={() => setIsPlayingVideo(true)}
                       className="absolute flex items-center justify-center w-20 h-20 bg-white/90 backdrop-blur rounded-full shadow-2xl text-primary hover:scale-110 transition-transform group-hover:bg-white"
                       aria-label="Play promotional video"
                    >
                      <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Description */}
          <div 
            className="text-slate-600 text-sm font-medium prose prose-sm max-w-none prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />

          {/* Mobile Direct Purchase or Enrollment Block */}
          <div className="xl:hidden bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-8">
             <div className="flex items-center justify-between mb-4">
               <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t('courses.price', 'Price')}</p>
                  <p className="text-3xl font-black text-gray-950 mt-1">
                     {selectedOption === 'course' ? (
                       <>
                         {course.realPrice && course.realPrice > course.price && (
                             <span className="text-sm text-slate-400 line-through mr-2 font-medium">{formatCurrency(course.realPrice, currency)}</span>
                         )}
                         {formatCurrency(course.price, currency)}
                       </>
                     ) : (
                       <>
                         {formatCurrency(courseRaw.memberships?.find((m:any) => m.id === selectedOption)?.offerPrice || 0, currency)}
                       </>
                     )}
                  </p>
               </div>
               
               <div className="text-right text-xs text-slate-500 font-medium">
                  <p>{totalLessons} {t('courses.lessons', 'lessons')} &bull; {course.duration || '21 days'}</p>
                  <p className="text-emerald-600 font-bold mt-1">✓ Instant Access</p>
               </div>
             </div>

             {courseRaw?.memberships && courseRaw.memberships.length > 0 && (
               <div className="mb-5 space-y-3">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Enrollment Options</p>
                 
                 {course.price > 0 && (
                   <label className={`block border p-4 rounded-xl cursor-pointer transition-all ${selectedOption === 'course' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" checked={selectedOption === 'course'} onChange={() => setSelectedOption('course')} className="hidden" />
                      <div className="flex justify-between items-center">
                         <span className="font-bold text-sm text-slate-800 leading-tight">Course Only</span>
                         <span className="font-bold text-primary">{formatCurrency(course.price, currency)}</span>
                      </div>
                   </label>
                 )}

                 {courseRaw.memberships.map((m: any) => (
                    <label key={m.id} className={`block border p-4 rounded-xl cursor-pointer transition-all ${selectedOption === m.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                       <input type="radio" checked={selectedOption === m.id} onChange={() => setSelectedOption(m.id)} className="hidden" />
                       <div className="flex flex-col gap-1">
                         <div className="flex justify-between items-center">
                           <span className="font-bold text-sm text-slate-800 leading-tight pr-2">{m.contents?.find((c:any) => c.language === language)?.title || m.contents?.[0]?.title || m.label || m.type}</span>
                           <span className="font-bold text-primary whitespace-nowrap">{formatCurrency(m.offerPrice, currency)}</span>
                         </div>
                         <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/memberships/${m.id}`); }} className="text-xs text-indigo-600 hover:underline text-left mt-1 inline-block">View Details →</button>
                       </div>
                    </label>
                 ))}
               </div>
             )}

             <button onClick={handleBuy} disabled={addingToCart} className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-sm hover:bg-opacity-90 transition disabled:opacity-70 flex justify-center items-center gap-2 text-base">
                {addingToCart ? (
                    <>
                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       Adding...
                    </>
                ) : enrolled ? "Already Enrolled (Go to Dashboard)" : inCart ? "In Your Cart (Go to Cart)" : "Take This Course"}
             </button>

             <button onClick={handleFavorite} className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 border border-slate-200 rounded-full hover:bg-slate-50 transition text-gray-700 mt-3">
               <svg className={`w-4 h-4 transition ${isFavored ? "fill-red-500 stroke-red-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
               {isFavored ? "Remove from favorites" : "Add to favorites"}
             </button>
          </div>

          {/* Course Content */}
          {course.lessons?.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-200">
             <h2 className="text-2xl font-bold text-gray-900">{t('courses.course_content')}</h2>
             <div className="space-y-4">
               {course.lessons?.sort((a: any, b: any) => a.order - b.order).map((lesson: any, i: number) => (
                 <div key={lesson.id} className="border border-slate-200 rounded-xl p-4 hover:border-primary transition-colors cursor-pointer bg-white group hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <span className="font-bold text-sm text-gray-800 flex-1">{lesson.title}</span>
                      {lesson.videoUrl && (
                        <svg className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      )}
                    </div>
                    {lesson.content && (
                      <div className="mt-4 pl-12 text-sm text-slate-600 border-l-2 border-slate-100 ml-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }}>
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </div>
          )}

          {/* Editions Content */}
          {course.editions?.length > 0 && (
            <div id="editions-section" className="space-y-6 pt-8 border-t border-slate-200">
               <h2 className="text-2xl font-bold text-gray-900">Available Editions</h2>
               {editionError && (
                 <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                   <AlertCircle size={18} className="flex-shrink-0" />
                   Please select an edition to proceed with enrollment.
                 </div>
               )}
               <div className="space-y-4">
                 {course.editions.map((ed: any, i: number) => (
                    <label key={ed.id} className={`block border rounded-xl p-4 transition-colors cursor-pointer bg-white group hover:shadow-md ${selectedEdition === ed.id ? 'border-primary shadow-md ring-1 ring-primary' : (editionError ? 'border-red-300' : 'border-slate-200')} ${ed.availableSeats <= 0 ? 'opacity-50 grayscale' : ''}`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <input type="radio" name="edition" value={ed.id} checked={selectedEdition === ed.id} onChange={() => { if (ed.availableSeats > 0) { setSelectedEdition(ed.id); setEditionError(false); } }} className="hidden" disabled={ed.availableSeats <= 0} />
                          <div className={`w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors md:flex ${selectedEdition === ed.id ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 group-hover:bg-slate-100'}`}>
                            {i + 1}
                          </div>
                        </div>
                        <div className="flex-1">
                           <span className="font-bold text-sm text-gray-800 block">{ed.title}</span>
                           <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                             <span className="flex items-center gap-1"><MapPin size={12} className="opacity-50" /> {ed.mode || 'Online'}</span>
                             <span className="flex items-center gap-1"><Calendar size={12} className="opacity-50" /> {ed.date ? new Date(ed.date).toLocaleDateString() : 'TBA'}</span>
                           </div>
                        </div>
                        <div className="md:ml-auto md:text-right">
                          <div className="text-sm font-bold text-primary">
                             {ed.availableSeats > 0 ? (
                               `${ed.availableSeats} Seats Left`
                             ) : (
                               'Sold Out'
                             )}
                          </div>
                          {ed.totalSeats && <div className="text-xs text-slate-400 mt-1">out of {ed.totalSeats} seats</div>}
                        </div>
                      </div>
                      {selectedEdition === ed.id && ed.content && (
                        <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: ed.content }}>
                        </div>
                      )}
                   </label>
                 ))}
               </div>
            </div>
          )}

          {/* Meet Your Instructor */}
          {course.instructor && (
          <div className="space-y-6 pt-8 border-t border-slate-200">
             <h2 className="text-2xl font-bold text-gray-900">{t('courses.meet_instructor')}</h2>
             <div className="border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 bg-white shadow-sm">
                <div className="flex-shrink-0">
                   {course.instructor.imageUrl ? (
                     <img src={course.instructor.imageUrl} alt={course.instructor.name} className="w-20 h-20 rounded-full object-cover shadow-sm" />
                   ) : (
                     <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl shadow-sm">{course.instructor.name.charAt(0)}</div>
                   )}
                </div>
                <div>
                   <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold">Coach</p>
                   <h3 className="font-bold text-2xl mb-1">{course.instructor.name}</h3>
                   <p className="text-sm text-slate-500 mb-4">{course.instructor.courses?.length || 1} Courses <span className="mx-2">&bull;</span> 0 Student</p>
                   <p className="text-sm text-slate-600 leading-relaxed">{course.instructor.bio}</p>
                </div>
             </div>
          </div>
          )}

          
        </div>

        {/* Right Column / Sidebar */}
        <div className="hidden xl:block xl:col-span-1 xl:row-span-2 w-full">
           <div className="sticky top-24 border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 bg-primary text-white">
                 <div className="text-4xl font-black">
                   {selectedOption === 'course' ? (
                     <>
                       {course.realPrice && course.realPrice > course.price && (
                           <span className="text-xl text-white/50 line-through mr-3 font-medium">{formatCurrency(course.realPrice, currency)}</span>
                       )}
                       {formatCurrency(course.price, currency)}
                     </>
                   ) : (
                     <>
                       {formatCurrency(courseRaw.memberships.find((m:any) => m.id === selectedOption)?.offerPrice || 0, currency)}
                     </>
                   )}
                 </div>
              </div>
              <div className="p-8 flex-1 flex flex-col space-y-4">
                 {courseRaw?.memberships && courseRaw.memberships.length > 0 && (
                   <div className="space-y-3 mb-2">
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Enrollment Options</p>
                     
                     {course.price > 0 && (
                       <label className={`block border p-4 rounded-xl cursor-pointer transition-all ${selectedOption === 'course' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                          <input type="radio" checked={selectedOption === 'course'} onChange={() => setSelectedOption('course')} className="hidden" />
                          <div className="flex justify-between items-center">
                             <span className="font-bold text-sm text-slate-800 leading-tight">Course Only</span>
                             <span className="font-bold text-primary">{formatCurrency(course.price, currency)}</span>
                          </div>
                       </label>
                     )}

                     {courseRaw.memberships.map((m: any) => (
                        <label key={m.id} className={`block border p-4 rounded-xl cursor-pointer transition-all ${selectedOption === m.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                           <input type="radio" checked={selectedOption === m.id} onChange={() => setSelectedOption(m.id)} className="hidden" />
                           <div className="flex flex-col gap-1">
                             <div className="flex justify-between items-center">
                               <span className="font-bold text-sm text-slate-800 leading-tight pr-2">{m.contents?.find((c:any) => c.language === language)?.title || m.contents?.[0]?.title || m.label || m.type}</span>
                               <span className="font-bold text-primary whitespace-nowrap">{formatCurrency(m.offerPrice, currency)}</span>
                             </div>
                             <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/memberships/${m.id}`); }} className="text-xs text-indigo-600 hover:underline text-left mt-1">View Details →</button>
                           </div>
                        </label>
                     ))}
                   </div>
                 )}

                 <button onClick={handleBuy} disabled={addingToCart} className="w-full bg-primary text-white py-3.5 rounded-full font-bold shadow-sm hover:bg-opacity-90 transition disabled:opacity-70 flex justify-center items-center gap-2">
                    {addingToCart ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Adding...
                        </>
                    ) : enrolled ? "Already Enrolled (Go to Dashboard)" : inCart ? "In Your Cart (Go to Cart)" : "Take This Course"}
                 </button>

                 <button onClick={handleFavorite} className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 border border-slate-200 rounded-full hover:bg-slate-50 transition text-gray-700">
                   <svg className={`w-4 h-4 transition ${isFavored ? "fill-red-500 stroke-red-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                   {isFavored ? "Remove from favorites" : "Add to favorite"}
                 </button>

                 <div className="pt-6">
                    <p className="font-bold mb-5 text-sm text-gray-800">This course includes:</p>
                    <div className="space-y-4 text-sm text-slate-600 font-medium">
                       <div className="flex justify-between border-b border-slate-100 pb-3">
                         <span className="flex items-center gap-2"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> Learners</span> 
                         <span>0 Students</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-100 pb-3">
                         <span className="flex items-center gap-2"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Lessons</span> 
                         <span>{totalLessons}</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-100 pb-3">
                         <span className="flex items-center gap-2"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Duration</span> 
                         <span>{course.duration || '21 Days'}</span>
                       </div>
                       <div className="flex justify-between pb-2">
                         <span className="flex items-center gap-2"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg> Language</span> 
                         <span>{course.language || 'Arabic'}</span>
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 flex gap-6 text-xs font-bold justify-center border-t border-slate-100 text-slate-500">
                    <button className="flex items-center gap-1 hover:text-primary transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg> 
                      Share
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                      Report
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Left Column Part 2 */}
        <div className="xl:col-span-2 space-y-8 w-full">
          
          {/* Feedback & Reviews */}
          <div className="space-y-6 pt-8 md:pt-0 border-t md:border-t-0 border-slate-200">
             <h2 className="text-2xl font-bold text-gray-900">Feedback & Reviews</h2>
             <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                 <div className="text-center md:text-left">
                    <div className="text-6xl font-black text-gray-900">
                      {reviews.length > 0 ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0'}
                    </div>
                    <div className="text-orange-400 text-lg flex gap-1 justify-center md:justify-start mt-2">
                       {Array(Math.round(reviews.length > 0 ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length) : 0)).fill(0).map((_, i) => (
                         <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                       ))}
                       {Array(5 - Math.round(reviews.length > 0 ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length) : 0)).fill(0).map((_, i) => (
                         <svg key={i} className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                       ))}
                    </div>
                    <div className="text-sm text-slate-500 mt-2 font-medium">Based on {reviews.length} Reviews</div>
                 </div>
                 <div className="flex-1 w-full space-y-2">
                    {[5,4,3,2,1].map(stars => {
                      const count = reviews.filter((r:any) => r.rating === stars).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-4">
                           <div className="flex text-orange-400 gap-1 w-24">
                             {Array(stars).fill(0).map((_, i) => <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                             {Array(5-stars).fill(0).map((_, i) => <svg key={i} className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>)}
                           </div>
                           <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-orange-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                           </div>
                           <div className="text-xs text-slate-500 font-medium w-6">({count})</div>
                        </div>
                      )
                    })}
                 </div>
              </div>

              <form onSubmit={handlePostReview} className="space-y-4">
                 <p className="font-bold text-sm text-gray-800">Your rating</p>
                 <div className="flex gap-1 text-slate-300">
                   {[1,2,3,4,5].map(star => (
                     <svg key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className={`w-5 h-5 cursor-pointer transition ${newReview.rating >= star ? 'fill-orange-400 stroke-orange-400' : 'fill-none stroke-current stroke-2 hover:fill-orange-400 hover:stroke-orange-400'}`} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                   ))}
                 </div>
                 <textarea required rows={4} value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} placeholder="Your Comment" className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition bg-slate-50 hover:bg-white"></textarea>
                 <button type="submit" className="bg-primary text-white px-8 py-3 rounded-full text-sm font-bold shadow-sm hover:bg-opacity-90 transition">Submit</button>
              </form>
              
              <div className="pt-8 space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-slate-500 text-sm italic">There are no reviews yet.</div>
                ) : (
                  reviews.map((rev: any) => (
                    <div key={rev.id} className="border-b border-slate-100 pb-6 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                          {rev.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{rev.user?.name || 'User'}</p>
                          <div className="flex text-orange-400 gap-1 mt-1">
                            {Array(rev.rating).fill(0).map((_, i) => <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                            {Array(5-rev.rating).fill(0).map((_, i) => <svg key={i} className="w-3 h-3 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>)}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      </div>
      
      {/* Sticky Mobile Add To Cart Bar */}
      {!(course.price === 0 && courseRaw?.memberships?.length > 0) && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Total</p>
              <p className="text-2xl font-black text-gray-900 leading-none">
                {selectedOption === 'course' ? (
                  <>
                    {course.realPrice && course.realPrice > course.price && (
                        <span className="text-base text-slate-400 line-through mr-2 font-medium">{formatCurrency(course.realPrice, currency)}</span>
                    )}
                    {formatCurrency(course.price, currency)}
                  </>
                ) : (
                  <>
                    {formatCurrency(courseRaw?.memberships?.find((m:any) => m.id === selectedOption)?.offerPrice || 0, currency)}
                  </>
                )}
              </p>
           </div>
           <div className="flex gap-2">
              <button onClick={handleBuy} disabled={addingToCart} className="text-sm font-bold bg-primary text-white px-6 py-3 rounded-full shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[120px]">
                 {addingToCart ? "Adding..." : enrolled ? "Already Enrolled" : inCart ? "In Cart" : "Take This Course"}
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

export function BundleDetails() {
  const { id } = useParams();
  const [bundleRaw, setBundle] = useState<any>(null);
  const { user, token, addToCart, cart, setAuthModalOpen, currency, favorites, toggleFavorite, language } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [addingToCart, setAddingToCart] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  
  const bundle = getTranslated(bundleRaw, language);
  
  useEffect(() => {
    fetch(`/api/public/course-bundles`).then(r => r.json()).then(res => {
      const b = res.find((x: any) => x.id === id);
      setBundle(b);
    }).catch(console.error);
  }, [id]);

  if (!bundle) return <div className="p-12 text-center text-slate-500">Loading bundle details...</div>;

  const inCart = cart.some(c => c.itemId === bundle.id && c.itemType === 'BUNDLE');

  const handleAddToCart = () => {
    if (!user || !token) {
      setAuthModalOpen(true);
      return;
    }
    setAddingToCart(true);
    addToCart({ id: Math.random().toString(), itemType: 'BUNDLE', itemId: bundle.id, title: bundle.title, price: bundle.price });
    setTimeout(() => {
      setAddingToCart(false);
      navigate('/cart');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
      <SeoTags entityType="BUNDLE" entityId={bundle.id} fallbackTitle={bundle.title} />
      
      <div className="grid lg:grid-cols-[1fr_400px] gap-12 mt-8">
        <div className="space-y-8">
          {/* Header Info */}
          <div>
             <span className="inline-block px-3 py-1 bg-[var(--color-primary)] text-white text-[10px] font-bold rounded mb-4 tracking-wider uppercase">Course Bundle</span>
             <h1 className="text-3xl md:text-5xl font-bold mb-4 font-sans text-gray-900 leading-tight">{bundle.title}</h1>
          </div>

          {/* Banner */}
          {(bundle.bannerVideoUrl || bundle.imageUrl) && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 flex items-center justify-center relative shadow-sm group">
              {bundle.bannerVideoUrl && isPlayingVideo ? (
                <UniversalVideo url={bundle.bannerVideoUrl} autoPlay={true} />
              ) : (
                <>
                  {bundle.imageUrl ? (
                    <img src={bundle.imageUrl || undefined} alt="Bundle Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                       <span className="text-slate-400 font-medium">Bundle Media</span>
                    </div>
                  )}
                  {bundle.bannerVideoUrl && (
                    <button 
                       onClick={() => setIsPlayingVideo(true)}
                       className="absolute flex items-center justify-center w-20 h-20 bg-white/90 backdrop-blur rounded-full shadow-2xl text-primary hover:scale-110 transition-transform group-hover:bg-white"
                       aria-label="Play promotional video"
                    >
                      <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Description */}
          <div 
             className="text-slate-600 text-sm font-medium prose prose-sm max-w-none prose-p:leading-relaxed"
             dangerouslySetInnerHTML={{ __html: bundle.description }}
          />

          {/* Bundle Content */}
          {bundle.courses?.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-slate-200">
             <h2 className="text-2xl font-bold text-gray-900">Included Courses</h2>
             <div className="space-y-4">
               {bundle.courses.map((item: any) => {
                 const course = item.course;
                 return (
                   <div key={course.id} className="border border-slate-200 rounded-xl p-4 hover:border-primary transition-colors bg-white group hover:shadow-md">
                      <div className="flex items-center gap-4">
                        {course.imageUrl && <img src={course.imageUrl || undefined} alt={course.title} className="w-20 h-20 object-cover rounded shadow-sm" />}
                         <div className="flex-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{course.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{stripHtml(course.description)}</p>
                         </div>
                      </div>
                   </div>
                 )
               })}
             </div>
          </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="relative">
           <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                 {bundle.realPrice && bundle.realPrice > bundle.price && (
                   <span className="text-xl text-slate-400 line-through mr-3 font-medium">{formatCurrency(bundle.realPrice, currency)}</span>
                 )}
                 {formatCurrency(bundle.price, currency)}
              </h3>
              
              <button 
                 onClick={handleAddToCart}
                 disabled={addingToCart}
                 className="w-full mt-6 py-4 px-6 bg-primary hover:bg-[#3A1430] text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-75 disabled:hover:scale-100"
              >
                 {addingToCart ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
                     (inCart ? t('courses.in_cart') : 'Claim This Bundle')
                 }
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export function Memberships() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const { language, currency, categories, enrolledItems } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetch("/api/memberships").then(r => r.json()).then(setMemberships);
  }, []);

  const getContent = (m: any) => m.contents?.find((c: any) => c.language === language) || m.contents?.[0] || { title: 'Untitled' };

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12 overflow-hidden md:overflow-visible">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between border border-primary/10">
         <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-primary font-bold mb-4">{t('memberships.title')}</h1>
            <p className="text-slate-600 max-w-xl text-lg font-medium">Explore our exclusive programs and memberships designed to accelerate your learning and growth.</p>
         </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 hide-scrollbar flex-nowrap w-full">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-6 py-2 rounded-full font-bold text-sm transition shrink-0 snap-start ${activeCategory === null ? 'bg-primary text-white shadow-sm' : 'border border-primary text-primary hover:bg-primary/5'}`}
        >
          {t('memberships.all_programs')}
        </button>
        {categories.filter((cat: any) => cat.type === 'MEMBERSHIP').map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition shrink-0 snap-start ${activeCategory === cat.id ? 'bg-primary text-white shadow-sm' : 'border border-primary text-primary hover:bg-primary/5'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {memberships.filter(m => !activeCategory || m.categoryId === activeCategory).length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-12 bg-white rounded-2xl border border-slate-100">No programs available in this category.</div>
        ) : memberships.filter(m => !activeCategory || m.categoryId === activeCategory).map(mem => {
          const content = getContent(mem);
          const isEnrolled = Array.isArray(enrolledItems) && enrolledItems.some((e: any) => e.itemType === "MEMBERSHIP" && e.itemId === mem.id);
          return (
            <Link to={`/memberships/${mem.id}`} key={mem.id} className="bg-white rounded-2xl p-5 border border-slate-100 card-hover shadow-sm flex flex-col group">
              {mem.imageUrl ? (
                <div className="h-40 rounded-xl mb-4 overflow-hidden">
                  <img src={mem.imageUrl || undefined} alt={content.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-primary to-[#8c356b] rounded-xl mb-4 overflow-hidden flex items-center justify-center opacity-90 relative">
                   <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                   <span className="text-5xl font-serif italic font-bold text-white/40 drop-shadow-sm">{content.title.charAt(0)}</span>
                </div>
              )}
              {mem.label && <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded-md mb-2 w-max">{mem.label}</span>}
              <p className="text-[10px] font-bold text-emerald-500 mb-1 uppercase tracking-widest">{mem.type}</p>
              <h3 className="font-bold text-lg leading-tight mb-2 flex-1">{content.title}</h3>
              <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-4">
                <div className="flex flex-col">
                   {mem.realPrice && mem.realPrice > mem.offerPrice && <span className="text-xs text-slate-400 line-through">{formatCurrency(mem.realPrice, currency)}</span>}
                   <span className="font-bold text-primary text-xl">{formatCurrency(mem.offerPrice, currency)}</span>
                </div>
                {isEnrolled ? (
                  <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider items-center flex gap-1"><Check className="w-3 h-3" /> Purchased</span>
                ) : (
                  <span className="px-5 py-2 bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white text-xs rounded-full font-bold shadow-sm transition tracking-wide">{t('memberships.view_details')}</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}

export function MembershipDetails() {
  const { id } = useParams();
  const [membership, setMembership] = useState<any>(null);
  const [selectedEdition, setSelectedEdition] = useState<string>('');
  const [editionError, setEditionError] = useState<boolean>(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });

  const [addingToCart, setAddingToCart] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const { user, token, cart, addToCart, setAuthModalOpen, language, currency, favorites, toggleFavorite } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchReviews = () => {
    fetch(`/api/reviews?membershipId=${id}`)
      .then(r => r.json())
      .then(data => setReviews(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetch(`/api/memberships/${id}`).then(r => r.json()).then(m => {
       setMembership(m);
       if (m?.editions?.length > 0) setSelectedEdition(m.editions[0].id);
    });
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const localToken = localStorage.getItem("token") || token;
    if (user && membership && localToken) {
      fetch("/api/dashboard", { headers: { Authorization: `Bearer ${localToken}` } })
        .then(r => r.json())
        .then(res => {
           if(!res.error) {
              const enrolledMem = res.memberships?.find((c: any) => c.membershipId === membership.id);
              if (enrolledMem) {
                 const isExpired = enrolledMem.expiresAt && new Date(enrolledMem.expiresAt) < new Date();
                 setEnrolled(!isExpired);
              } else {
                 setEnrolled(false);
              }
           }
        });
    }
  }, [user, membership, token]);

  if (!membership) return <div className="p-12 text-center text-slate-500 font-serif italic">Loading...</div>;

  const content = membership.contents?.find((c: any) => c.language === language) || membership.contents?.[0] || {};
  
  const inCart = cart.some((i: any) => i.itemType === "MEMBERSHIP" && i.itemId === membership?.id);

  const handleBuyNow = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (enrolled) {
      navigate("/dashboard");
      return;
    }
    if (inCart) {
      navigate("/cart");
      return;
    }

    const edition = membership.editions?.find((e: any) => e.id === selectedEdition);
    if (membership.editions?.length > 0 && !edition) {
        setEditionError(true);
        const el = document.getElementById('membership-editions-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    setEditionError(false);
    if (edition && edition.availableSeats <= 0) return alert("This edition is full");

    let title = content.title || 'Membership';
    if (edition) {
        title += ` - ${edition.title}`;
        if (edition.mode || edition.date) {
            title += ` (${edition.mode || 'Online'}${edition.date ? ', ' + new Date(edition.date).toLocaleDateString() : ''})`;
        }
    }

    setAddingToCart(true);
    setTimeout(() => {
      addToCart({ 
         id: Math.random().toString(), 
         itemType: "MEMBERSHIP", 
         itemId: membership.id, 
         editionId: selectedEdition || undefined,
         title: title, 
         price: edition ? edition.price : membership.offerPrice 
      });
      setAddingToCart(false);
      navigate("/cart");
    }, 800);
  };


  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const localToken = localStorage.getItem("token") || token;
    if (!user || !localToken) {
      setAuthModalOpen(true);
      return;
    }
    if (newReview.rating === 0) return alert('Please select a rating');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localToken}` },
        body: JSON.stringify({ ...newReview, membershipId: membership.id })
      });
      if (res.ok) {
        setNewReview({ rating: 0, comment: '' });
        fetchReviews();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to post review");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavorite = async () => {
      const localToken = localStorage.getItem("token") || token;
      if (!user || !localToken) {
        setAuthModalOpen(true);
        return;
      }
      await toggleFavorite("MEMBERSHIP", membership.id, localToken);
  };

  const isFavored = favorites.some((f: any) => f.itemType === "MEMBERSHIP" && f.itemId === membership.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-28 md:pb-12 font-sans">
      <SeoTags entityType="MEMBERSHIP" entityId={membership.id} fallbackTitle={content.title} />
      <div className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary transition">{t('nav.home')}</Link>
        <span>/</span>
        <Link to="/memberships" className="hover:text-primary transition">{t('nav.memberships')}</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">{content.title}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12 w-full">
        {/* Left Column (Content) */}
        <div className="xl:col-span-2 space-y-8 md:space-y-12">
          
          <div>
            <div className="flex flex-wrap gap-3 mb-4">
               <span className="px-3 py-1 bg-indigo-50 text-indigo-500 border border-indigo-100 text-[10px] font-bold rounded-full tracking-widest uppercase">{membership.type}</span>
               {membership.label && <span className="px-3 py-1 bg-amber-50 text-amber-500 border border-amber-100 text-[10px] font-bold uppercase rounded-full tracking-widest">{membership.label}</span>}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 font-sans text-gray-900 leading-tight">{content.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 mt-2">
               <div className="flex items-center gap-1.5">
                 <div className="flex text-amber-400">
                   <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                 </div>
                 <span className="font-bold text-gray-900 ml-0.5 text-base">
                   {reviews.length > 0 ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0'}
                 </span>
                 <span className="text-slate-500">({reviews.length} reviews)</span>
               </div>
            </div>
          </div>
          
          {/* Banner */}
          {membership.imageUrl && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 flex items-center justify-center relative shadow-sm">
              <img src={membership.imageUrl || undefined} alt="Membership Banner" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="text-slate-600 text-sm font-medium">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">About this Program</h2>
            <div className="prose prose-sm max-w-none prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: content.description }} />
          </div>

            {/* Who Is This For & Benefits Multi-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {content.whoIsFor && (
                <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100/50 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                     <svg className="w-24 h-24 text-indigo-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                   </div>
                   <h2 className="text-xl font-bold text-indigo-900 mb-4">{t('memberships.who_is_for')}</h2>
                   <div className="text-indigo-950/70 whitespace-pre-wrap leading-relaxed font-medium relative z-10 text-base">
                      {content.whoIsFor}
                   </div>
                </div>
              )}

              {content.benefits && (
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 h-full">
                   <h2 className="text-xl font-bold text-gray-900 mb-6">{t('memberships.what_you_get')}</h2>
                   <ul className="space-y-4">
                      {content.benefits.split('\n').filter(Boolean).map((benefit: string, i: number) => (
                         <li key={i} className="flex gap-4 text-slate-700 items-start font-medium group">
                            <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span className="leading-relaxed text-base">{benefit.trim()}</span>
                         </li>
                      ))}
                   </ul>
                </div>
              )}
            </div>

            {/* Entry Condition */}
            {content.entryCondition && (
               <div className="bg-amber-50 rounded-3xl p-8 md:p-10 border border-amber-100/80 shadow-[inset_0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden relative">
                  <div className="absolute -right-10 -bottom-10 opacity-10">
                    <svg className="w-48 h-48 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-amber-900 mb-4 relative z-10 flex items-center gap-3">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    {t('memberships.entry_condition')}
                  </h2>
                  <div className="text-amber-900/80 leading-relaxed font-medium relative z-10 text-base md:text-lg">
                     {content.entryCondition}
                  </div>
               </div>
            )}

          {/* Available Editions Table View */}
          {membership.editions?.length > 0 && (
             <div id="membership-editions-section" className="space-y-6 pt-8 border-t border-slate-200">
                <h2 className="text-2xl font-bold text-gray-900">{t('memberships.available_editions')}</h2>
                {editionError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
                   <AlertCircle size={18} className="flex-shrink-0" />
                   Please select an edition.
                 </div>
                )}
                <div className="space-y-4">
                  {membership.editions.map((ed: any, i: number) => (
                    <label key={ed.id} className={`block border rounded-xl p-4 transition-colors cursor-pointer bg-white group hover:shadow-md ${selectedEdition === ed.id ? 'border-primary shadow-md ring-1 ring-primary' : (editionError ? 'border-red-300' : 'border-slate-200')} ${ed.availableSeats <= 0 ? 'opacity-50 grayscale' : ''}`}>
                       <div className="flex flex-col md:flex-row md:items-center gap-4">
                         <div className="flex items-center gap-4">
                           <input type="radio" name="edition" value={ed.id} checked={selectedEdition === ed.id} onChange={() => { if (ed.availableSeats > 0) { setSelectedEdition(ed.id); setEditionError(false); } }} className="hidden" disabled={ed.availableSeats <= 0} />
                           <div className={`w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors md:flex ${selectedEdition === ed.id ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-500 group-hover:bg-slate-100'}`}>
                             {i + 1}
                           </div>
                         </div>
                         <div className="flex-1">
                            <span className="font-bold text-sm text-gray-800 block">{ed.title}</span>
                            <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                             <span className="flex items-center gap-1"><MapPin size={12} className="opacity-50" /> {ed.mode || 'Online'}</span>
                             <span className="flex items-center gap-1"><Calendar size={12} className="opacity-50" /> {ed.date ? new Date(ed.date).toLocaleDateString() : 'TBA'}</span>
                            </div>
                         </div>
                         <div className="mt-2 md:mt-0">
                           {ed.availableSeats > 0 ? (
                             <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-100 px-2 py-1 rounded-md">{ed.availableSeats} {t('memberships.seats_left')}</span>
                           ) : (
                             <span className="text-[10px] font-bold text-red-600 uppercase bg-red-100 px-2 py-1 rounded-md">{t('memberships.sold_out')}</span>
                           )}
                         </div>
                       </div>
                    </label>
                  ))}
                </div>
             </div>
          )}

          {/* Feedback & Reviews */}
          
            {/* Feedback & Reviews */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 mt-8">
               <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 tracking-tight">Student Feedback</h2>
               <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start mb-10">
                   <div className="text-center md:text-left w-full md:w-auto">
                      <div className="text-7xl font-black text-gray-900 leading-none">
                        {reviews.length > 0 ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0'}
                      </div>
                      <div className="text-amber-400 text-lg flex gap-1 justify-center md:justify-start mt-3">
                         {Array(Math.round(reviews.length > 0 ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length) : 0)).fill(0).map((_, i) => (
                           <svg key={`full-${i}`} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                         ))}
                         {Array(5 - Math.round(reviews.length > 0 ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length) : 0)).fill(0).map((_, i) => (
                           <svg key={`empty-${i}`} className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                         ))}
                      </div>
                      <div className="text-sm text-slate-500 mt-2 font-medium">Based on {reviews.length} reviews</div>
                   </div>
                   <div className="flex-1 w-full space-y-3 lg:border-l lg:border-slate-100 lg:pl-12">
                      {[5,4,3,2,1].map(stars => {
                        const count = reviews.filter((r:any) => r.rating === stars).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={stars} className="flex items-center gap-4 group">
                             <div className="flex text-amber-400 gap-1 w-24">
                               {Array(stars).fill(0).map((_, i) => <svg key={`f-${i}`} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                               {Array(5-stars).fill(0).map((_, i) => <svg key={`e-${i}`} className="w-4 h-4 fill-none stroke-current stroke-2 opacity-30" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>)}
                             </div>
                             <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                               <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                             </div>
                             <div className="text-sm text-slate-500 font-bold w-8 text-right">{percentage.toFixed(0)}%</div>
                          </div>
                        )
                      })}
                   </div>
                </div>

                <form onSubmit={handlePostReview} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 mb-8 shadow-sm">
                   <p className="font-bold text-gray-900 mb-3">Write a Review</p>
                   <div className="flex gap-2 mb-4">
                     {[1,2,3,4,5].map(star => (
                       <svg key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className={`w-8 h-8 cursor-pointer transition-transform hover:scale-110 ${newReview.rating >= star ? 'fill-amber-400 stroke-amber-400 filter drop-shadow-sm' : 'fill-none stroke-slate-300 stroke-2 hover:fill-amber-400 hover:stroke-amber-400'}` } viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                     ))}
                   </div>
                   <textarea required rows={4} value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} placeholder="Tell us about your experience..." className="w-full border-none rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-[inset_0_2px_4px_rgb(0,0,0,0.02)] transition bg-white mb-4 placeholder-slate-400 resize-none"></textarea>
                   <div className="flex justify-end">
                     <button type="submit" className="bg-primary text-white px-8 py-2.5 rounded-full font-bold shadow-[0_4px_14px_0_rgba(75,29,63,0.39)] hover:shadow-[0_6px_20px_rgba(75,29,63,0.23)] hover:bg-primary/90 transition transform hover:-translate-y-0.5">Post Review</button>
                   </div>
                </form>
                
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl">
                       <p className="text-slate-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    reviews.map((rev: any) => (
                      <div key={rev.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-primary/10 text-primary font-bold flex items-center justify-center text-lg border border-primary/20 shadow-inner">
                            {rev.user?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 leading-tight block">{rev.user?.name || 'User'}</p>
                            <div className="flex text-amber-400 gap-0.5 mt-1">
                              {Array(rev.rating).fill(0).map((_, i) => <svg key={`u-f-${i}`} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                              {Array(5-rev.rating).fill(0).map((_, i) => <svg key={`u-e-${i}`} className="w-3.5 h-3.5 fill-none stroke-slate-300 stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>)}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{new Date(rev.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        </div>
                        <p className="text-base text-slate-700 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
            </div>


        </div>

        {/* Right Column / Sidebar */}
        <div className="xl:col-span-1 relative">
           <div className="sticky top-24 pt-2">
              {/* Premium Pricing Card */}
              <div className="bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden flex flex-col group">
                 {/* Top Image if any, else decorative header */}
                 {membership.imageUrl ? (
                    <div className="h-40 w-full relative">
                      <img src={membership.imageUrl || undefined} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                      <div className="absolute bottom-4 left-6">
                        <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">{membership.type.toUpperCase()}</span>
                      </div>
                    </div>
                 ) : (
                    <div className="h-2 w-full bg-gradient-to-r from-primary to-primary/60"></div>
                 )}

                 <div className="p-8 pb-6 flex flex-col">
                    <div className="mb-6">
                       <div className="flex items-baseline gap-3">
                          <span className="text-5xl font-black text-gray-900 font-sans tracking-tight">{formatCurrency(membership.offerPrice, currency)}</span>
                       </div>
                       {membership.realPrice && membership.realPrice > membership.offerPrice && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg text-slate-400 line-through font-medium">{formatCurrency(membership.realPrice, currency)}</span>
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-200 uppercase">Save {Math.round((1 - membership.offerPrice/membership.realPrice) * 100)}%</span>
                          </div>
                       )}
                    </div>

                    <button onClick={handleBuyNow} disabled={addingToCart} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-[0_4px_14px_0_rgba(75,29,63,0.39)] hover:shadow-[0_6px_20px_rgba(75,29,63,0.23)] hover:bg-primary/90 transition transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2 text-lg mb-4">
                       {addingToCart ? (
                           <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              Adding to Cart
                           </>
                       ) : enrolled ? "Already Subscribed" : inCart ? "Added to Cart" : "Become a Member"}
                    </button>
                    
                    <button onClick={handleFavorite} className="w-full flex items-center justify-center gap-2 font-bold py-3.5 border-2 border-slate-100 rounded-2xl hover:border-slate-200 hover:bg-slate-50 transition text-slate-600">
                      <svg className={`w-5 h-5 transition ${isFavored ? "fill-red-500 stroke-red-500" : "fill-transparent stroke-slate-400"}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                      {isFavored ? "Saved to Wishlist" : "Add to Wishlist"}
                    </button>

                    <div className="pt-8 mt-6 border-t border-slate-100">
                       <p className="font-bold text-gray-900 mb-4 text-base">Key Details</p>
                       <ul className="space-y-4">
                          <li className="flex items-center gap-4 text-slate-600">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                            </div>
                            <div>
                               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Format</p>
                               <p className="font-bold text-gray-800 leading-none capitalize">{membership.type}</p>
                            </div>
                          </li>
                          {content.keyDetails ? content.keyDetails.split('\n').filter(Boolean).map((detail: string, i: number) => {
                             const keyParts = detail.split(':');
                             const keyPart = keyParts[0]?.trim() || '';
                             const valPart = keyParts.slice(1).join(':').trim() || keyPart;
                             return (
                                <li key={i} className="flex items-center gap-4 text-slate-600">
                                   <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                      {i % 2 === 0 ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                      ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                                      )}
                                   </div>
                                   <div>
                                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">{keyParts.length > 1 ? keyPart : 'Detail'}</p>
                                      <p className="font-bold text-gray-800 leading-none">{valPart}</p>
                                   </div>
                                </li>
                             );
                          }) : (
                             <li className="flex items-center gap-4 text-slate-600">
                               <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                               </div>
                               <div>
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Access</p>
                                  <p className="font-bold text-gray-800 leading-none">Lifetime Support</p>
                               </div>
                             </li>
                          )}
                       </ul>
                    </div>

                    <div className="pt-8 mt-6 flex justify-center gap-6 border-t border-slate-100">
                       <button className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition group">
                         <div className="p-2 rounded-full bg-slate-50 group-hover:bg-indigo-50 border border-slate-100 group-hover:border-indigo-100 transition-colors">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg> 
                         </div>
                         Share
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Sticky Mobile Add To Cart Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50 flex items-center justify-between">
         <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-gray-900 leading-none">{formatCurrency(membership.offerPrice, currency)}</p>
            </div>
         </div>
         <button onClick={handleBuyNow} disabled={addingToCart} className="text-base font-bold bg-primary text-white px-8 py-3.5 rounded-full shadow-[0_4px_14px_0_rgba(75,29,63,0.39)] disabled:opacity-70 disabled:shadow-none flex items-center justify-center min-w-[140px] transform active:scale-95 transition">
            {addingToCart ? "Adding..." : enrolled ? "Subscribed" : inCart ? "In Cart" : "Become a Member"}
         </button>
      </div>
    </div>
  );
}

export function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const { user, addToCart, setAuthModalOpen, currency, enrolledItems, language } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetch("/api/events").then(r => r.json()).then(setEvents);
  }, []);
  
  const tEvents = getTranslated(events, language) || [];

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12 overflow-hidden md:overflow-visible">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between border border-primary/10">
         <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic text-primary font-bold mb-4">{t('events.title')}</h1>
            <p className="text-slate-600 max-w-xl text-lg font-medium">Join our exclusive live sessions and interactive bookings to step up your growth.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {tEvents.map((evt: any) => {
           const d = new Date(evt.date);
           const month = d.toLocaleString('default', { month: 'short' });
           const day = d.getDate();
           const isBooked = Array.isArray(enrolledItems) && enrolledItems.some((e: any) => e.itemType === "EVENT" && e.itemId === evt.id);
           return (
           <Link to={`/events/${evt.id}`} key={evt.id} className="bg-white rounded-2xl p-5 border border-slate-100 card-hover shadow-sm flex flex-col group">
             {evt.imageUrl ? (
               <div className="w-full h-40 bg-slate-50 rounded-xl mb-4 relative flex items-center justify-center overflow-hidden">
                  <img src={evt.imageUrl || undefined} alt={evt.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute top-2 left-2 w-12 h-12 flex flex-col items-center justify-center bg-white/90 backdrop-blur border border-white/20 shadow-sm rounded-xl">
                    <span className="text-[10px] font-bold text-red-500 leading-none uppercase">{month}</span>
                    <span className="text-xl font-bold leading-none mt-1">{day}</span>
                  </div>
               </div>
             ) : (
                <div className="h-40 bg-gradient-to-br from-primary to-[#8c356b] rounded-xl mb-4 overflow-hidden flex items-center justify-center opacity-90 relative">
                   <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                   <div className="absolute top-2 left-2 w-12 h-12 flex flex-col items-center justify-center bg-white/90 backdrop-blur border border-white/20 shadow-sm rounded-xl">
                    <span className="text-[10px] font-bold text-red-500 leading-none uppercase">{month}</span>
                    <span className="text-xl font-bold leading-none mt-1">{day}</span>
                  </div>
                  <span className="text-5xl font-serif italic font-bold text-white/40 drop-shadow-sm">{evt.title?.charAt(0) || 'E'}</span>
                </div>
             )}
             
             <p className="text-[10px] font-bold text-emerald-500 mb-1 uppercase tracking-widest">{d.toLocaleTimeString([], {timeStyle: 'short'})} &bull; {evt.location || "Online Room"}</p>
             <h3 className="font-bold text-lg leading-tight mb-2 flex-1">{evt.title}</h3>
             
             <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
               <div className="flex flex-col">
                  {evt.realPrice && evt.realPrice > evt.price && <span className="text-xs text-slate-400 line-through">{formatCurrency(evt.realPrice, currency)}</span>}
                  <span className="font-bold text-primary text-xl">{formatCurrency(evt.price, currency)}</span>
               </div>
               
               <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{evt.availableSeats}/{evt.totalSeats} Seats</span>
                 {isBooked ? (
                    <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider items-center flex gap-1"><Check className="w-3 h-3" /> Booked</span>
                 ) : (
                    <span className="px-5 py-2 bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white text-xs rounded-full font-bold shadow-sm transition">Details</span>
                 )}
               </div>
             </div>
           </Link>
           );
        })}
      </div>
      {events.length === 0 && <div className="text-gray-500 py-8 italic text-center font-serif">{t('events.no_events')}</div>}
    </div>
  );
}

export function EventDetails() {
  const { id } = useParams();
  const [eventRaw, setEvent] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { user, token, cart, addToCart, setAuthModalOpen, currency, language } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchEvent = () => {
    fetch(`/api/events/${id}`).then(r => r.json()).then(setEvent);
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const event = getTranslated(eventRaw, language);

  useEffect(() => {
    const localToken = localStorage.getItem("token") || token;
    if (user && event && localToken) {
      fetch("/api/dashboard", { headers: { Authorization: `Bearer ${localToken}` } })
        .then(r => r.json())
        .then(res => {
           if(!res.error) {
              const enrolledEvent = res.bookings?.find((c: any) => c.eventId === event.id);
              if (enrolledEvent) {
                 setEnrolled(true);
              } else {
                 setEnrolled(false);
              }
           }
        });
    }
  }, [user, event, token]);

  if (!event) return <div className="flex h-screen items-center justify-center font-bold text-slate-400">Loading...</div>;

  const d = new Date(event.date);
  const month = d.toLocaleString('default', { month: 'short' });
  const day = d.getDate();
  
  const inCart = cart.some((i: any) => i.itemType === "EVENT" && i.itemId === event?.id);

  const handleBook = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (enrolled) {
      navigate("/dashboard");
      return;
    }
    if (inCart) {
      navigate("/cart");
      return;
    }
    setAddingToCart(true);
    setTimeout(() => {
      addToCart({ id: Math.random().toString(), itemType: "EVENT", itemId: event.id, title: `Seat for: ${event.title}`, price: event.price });
      setAddingToCart(false);
      navigate("/cart");
    }, 800);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
       <SeoTags entityType="EVENT" entityId={event.id} fallbackTitle={event.title} />
       <div className="max-w-7xl mx-auto px-4 pt-12">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row relative z-10">
             <div className="w-full md:w-1/2 min-h-[300px] md:min-h-0 bg-slate-100 relative">
               {event.imageUrl ? (
                  <img src={event.imageUrl || undefined} alt={event.title} className="w-full h-full object-cover absolute inset-0" />
               ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-[#8c356b] absolute inset-0"></div>
               )}
                <div className="absolute top-6 left-6 w-16 h-16 flex flex-col items-center justify-center bg-white/95 backdrop-blur border border-white/20 shadow-md rounded-2xl">
                  <span className="text-[12px] font-bold text-red-500 leading-none uppercase">{month}</span>
                  <span className="text-2xl font-bold leading-none mt-1">{day}</span>
                </div>
             </div>
             <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Event</p>
                 <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 leading-tight mb-4">{event.title}</h1>
                 <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 break-words">
                   <span>🕒 {d.toLocaleTimeString([], {timeStyle: 'short'})}</span>
                   <span className="hidden sm:inline">&bull;</span>
                   <span>📍 {event.location || "Online"}</span>
                 </p>
                 
                 <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                         <span className="text-3xl font-bold text-primary">{formatCurrency(event.price, currency)}</span>
                         {event.realPrice && event.realPrice > event.price && <span className="text-lg text-slate-400 line-through font-normal">{formatCurrency(event.realPrice, currency)}</span>}
                       </div>
                       <span className="text-sm font-bold text-slate-500 uppercase tracking-wider bg-white px-3 py-1.5 rounded-full border border-slate-200">{event.availableSeats} / {event.totalSeats} Seats Left</span>
                    </div>
                    <button 
                      onClick={handleBook}
                      disabled={event.availableSeats <= 0 || addingToCart}
                      className="hidden xl:flex w-full py-4 bg-primary hover:bg-primary-dark transition text-white font-bold rounded-xl text-lg shadow-md disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none justify-center items-center gap-2"
                    >
                      {addingToCart ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Booking...
                        </>
                      ) : enrolled ? "Already Booked (Go to Dashboard)" : inCart ? "Added to Cart (Go to Cart)" : (event.availableSeats > 0 ? t('events.book_seat', 'Book your seat') : t('events.sold_out', 'Sold Out'))}
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-4">Secure checkout. Instant confirmation.</p>
                 </div>
             </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
             <div className="xl:col-span-2">
                 {/* What to expect */}
                 <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
                    <h2 className="text-2xl font-bold font-serif italic text-primary mb-6">About this event</h2>
                    <div 
                      className="text-slate-600 prose prose-sm max-w-none prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                 </div>
             </div>
             
             <div className="xl:col-span-1 space-y-6">
                 {/* Info Sidebar */}
                 <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4 uppercase tracking-wider text-xs">Event Details</h3>
                    <ul className="space-y-4 text-sm text-slate-600">
                      <li className="flex gap-3">
                         <span className="text-slate-400 mt-0.5">📅</span>
                         <div>
                            <p className="font-bold text-slate-800">Date & Time</p>
                            <p>{d.toLocaleString()}</p>
                         </div>
                      </li>
                      <li className="flex gap-3">
                         <span className="text-slate-400 mt-0.5">📍</span>
                         <div>
                            <p className="font-bold text-slate-800">Location</p>
                            <p>{event.location || "Online (Link provided after booking)"}</p>
                         </div>
                      </li>
                      <li className="flex gap-3">
                         <span className="text-slate-400 mt-0.5">🎟️</span>
                         <div>
                            <p className="font-bold text-slate-800">Availability</p>
                            <p>{event.availableSeats} of {event.totalSeats} seats remaining</p>
                         </div>
                      </li>
                    </ul>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <button
                         onClick={handleBook}
                         disabled={enrolled || addingToCart || event.availableSeats === 0}
                         className="w-full text-base font-bold bg-primary text-white py-4 rounded-xl shadow-md hover:bg-primary-dark transition disabled:opacity-70 flex items-center justify-center min-h-[56px]"
                      >
                         {addingToCart ? "Processing..." : 
                             enrolled ? "Already Booked" : 
                             event.availableSeats === 0 ? "Sold Out" :
                             "Book Ticket"
                         }
                      </button>
                    </div>
                 </div>
             </div>
          </div>
       </div>

      {/* Sticky Mobile Add To Cart Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between">
         <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Total</p>
            <div className="flex items-center gap-2">
               <p className="text-2xl font-black text-gray-900 leading-none">{formatCurrency(event.price, currency)}</p>
               {event.realPrice && event.realPrice > event.price && <p className="text-sm font-normal text-slate-400 line-through leading-none">{formatCurrency(event.realPrice, currency)}</p>}
            </div>
         </div>
         <button onClick={handleBook} disabled={event.availableSeats <= 0 || addingToCart} className="text-sm font-bold bg-primary text-white px-8 py-3 rounded-full shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[120px]">
            {addingToCart ? "Adding..." : enrolled ? "Booked" : inCart ? "In Cart" : (event.availableSeats > 0 ? t('events.book_seat', 'Book your seat') : t('events.sold_out', 'Sold Out'))}
         </button>
      </div>

    </div>
  );
}

export function BlogList() {
  const { language } = useStore();
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/blogs").then(r => r.json()).then(setBlogs).catch(() => {});
  }, []);

  const navigate = useNavigate();

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-6 py-12 overflow-hidden md:overflow-visible">
      <div className="mb-12">
        <h1 className="text-4xl font-serif italic font-bold text-primary mb-4">Content by Nesrina</h1>
        <p className="text-slate-500">Read the latest articles and stories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {blogs.filter(b => b.published).map((blog: any, i: number) => {
           const b = getTranslated(blog, language);
           return (
           <div key={i} className="flex flex-col group block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition cursor-pointer" onClick={() => navigate("/blog/" + b.id)}>
             <div className="relative h-48 overflow-hidden">
               {b.imageUrl ? (
                 <img src={b.imageUrl || undefined} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
               ) : (
                 <div className="w-full h-full bg-slate-100 group-hover:scale-105 transition duration-500"></div>
               )}
               {b.category && <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-md text-[10px] font-bold text-primary uppercase tracking-widest">{b.category}</div>}
             </div>
             <div className="p-6 flex-1 flex flex-col">
               <p className="text-[11px] text-slate-500 font-medium mb-2">{new Date(b.createdAt).toLocaleDateString()}</p>
               <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition">{b.title}</h3>
               <div className="mt-auto pt-6 flex items-center gap-2 text-primary font-bold text-[13px]">
                 Read Article <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </div>
             </div>
           </div>
         )})}
      </div>
    </div>
  );
}

export function BlogDetails() {
  const { id } = useParams();
  const { language } = useStore();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    fetch("/api/blogs").then(r => r.json()).then(data => {
      setBlog(data.find((b: any) => b.id === id) || null);
    }).catch(() => {});
  }, [id]);

  if (!blog) {
    return <div className="py-24 text-center text-slate-500">Loading or not found...</div>;
  }

  const b = getTranslated(blog, language);

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 lg:py-20 animate-in fade-in">
       {b.category && <div className="mb-6 text-sm font-bold text-primary uppercase tracking-widest">{b.category}</div>}
       <h1 className="text-4xl md:text-5xl font-serif italic text-slate-900 leading-tight mb-6">{b.title}</h1>
       <div className="flex items-center gap-4 mb-12 text-sm text-slate-500">
         <span>Nesrina</span>
         <span>•</span>
         <span>{new Date(b.createdAt).toLocaleDateString()}</span>
       </div>
       
       {b.imageUrl && (
         <img src={b.imageUrl} alt={b.title} className="w-full rounded-2xl mb-12 object-cover max-h-[500px] shadow-sm" />
       )}

       <div className="prose prose-slate max-w-none prose-a:text-primary prose-img:rounded-xl">
         <div dangerouslySetInnerHTML={{ __html: b.content }} />
       </div>
    </article>
  );
}
