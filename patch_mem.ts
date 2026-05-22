import fs from 'fs';

let content = fs.readFileSync('src/pages/FrontPages.tsx', 'utf-8');

// The replacement content
const replaceUI = `
          {/* Feedback & Reviews */}
          <div className="space-y-6 pt-8 border-t border-slate-200">
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
                             <div className="h-full bg-orange-400 rounded-full" style={{ width: \`\${percentage}%\` }}></div>
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
                     <svg key={star} onClick={() => setNewReview({ ...newReview, rating: star })} className={\`w-5 h-5 cursor-pointer transition \${newReview.rating >= star ? 'fill-orange-400 stroke-orange-400' : 'fill-none stroke-current stroke-2 hover:fill-orange-400 hover:stroke-orange-400'}\` } viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                   ))}
                 </div>
                 <textarea required rows={4} value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} placeholder="Your Comment" className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#4B1D3F] focus:ring-1 focus:ring-[#4B1D3F] transition bg-slate-50 hover:bg-white"></textarea>
                 <button type="submit" className="bg-[#4B1D3F] text-white px-8 py-3 rounded-full text-sm font-bold shadow-sm hover:bg-opacity-90 transition">Submit</button>
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
`;

// Append state to MembershipDetails
const searchState = `  const [selectedEdition, setSelectedEdition] = useState<string>('');`;
const stateAdd = `
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
`;

// Append fetch to MembershipDetails
const searchFetch = `  useEffect(() => {`;
const fetchAdd = `
  const fetchReviews = () => {
    fetch(\`/api/reviews?membershipId=\${id}\`)
      .then(r => r.json())
      .then(data => setReviews(data))
      .catch(err => console.error(err));
  };
`;

// Add fetchReviews into useEffect
const searchEffectInner = `       if (m?.editions?.length > 0) setSelectedEdition(m.editions[0].id);
    });`;
const effectAdd = `
    fetchReviews();`;

// Append handler to MembershipDetails
const searchHandler = `  const handleFavorite = async () => {`;
const handlerAdd = `
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
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${localToken}\` },
        body: JSON.stringify({ ...newReview, membershipId: membership.id })
      });
      if (res.ok) {
        setNewReview({ rating: 0, comment: '' });
        fetchReviews();
      } else {
        alert('Failed to post review');
      }
    } catch (err) {
      console.error(err);
    }
  };
`;

// Let's do replacements
const components = content.split('export function MembershipDetails() {');

if (components.length > 1) {
  let memDetails = components[1];
  
  memDetails = memDetails.replace(searchState, searchState + stateAdd);
  memDetails = memDetails.replace(searchHandler, handlerAdd + '\n' + searchHandler);
  memDetails = memDetails.replace(searchFetch, fetchAdd + '\n' + searchFetch);
  memDetails = memDetails.replace(searchEffectInner, searchEffectInner + effectAdd);
  
  // Replace the Feedback & Reviews UI
  const fromStr = `<div className="space-y-6 pt-8 border-t border-slate-200">
             <h2 className="text-2xl font-bold text-gray-900">Feedback & Reviews</h2>`;
  const toStr = `</div>
           </div>

        </div>

        {/* Right Column / Sidebar */}`;
        
  const startIndex = memDetails.indexOf(fromStr);
  if (startIndex !== -1) {
    const endIndex = memDetails.indexOf(toStr, startIndex) + toStr.length;
    memDetails = memDetails.substring(0, startIndex) + replaceUI + '\n\n        </div>\n\n        {/* Right Column / Sidebar */}' + memDetails.substring(endIndex);
  }

  // Update overall views summary in the header (0 reviews) to real one
  const badgeSearch = `0 (0 reviews)`;
  const badgeReplace = `{reviews.length > 0 ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0'} ({reviews.length} reviews)`;
  memDetails = memDetails.replace(badgeSearch, badgeReplace);
  
  content = components[0] + 'export function MembershipDetails() {' + memDetails;
  
  fs.writeFileSync('src/pages/FrontPages.tsx', content);
  console.log("Patched MembershipDetails");
}
