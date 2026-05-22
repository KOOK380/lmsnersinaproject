const fs = require('fs');

let content = fs.readFileSync('src/pages/FrontPages.tsx', 'utf-8');

// 1. Rename left column to part 1
content = content.replace('        {/* Left Column */}\n        <div className="xl:col-span-2 space-y-8">', '        {/* Left Column Part 1 */}\n        <div className="xl:col-span-2 space-y-8">');

// 2. Extract Sidebar
const sidebarStart = '        {/* Right Column / Sidebar */}\n        <div className="xl:col-span-1">\n           <div className="sticky top-24 border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col">';
const sidebarEnd = '              </div>\n           </div>\n        </div>';

const idxStart = content.indexOf(sidebarStart);
const idxEnd = content.indexOf(sidebarEnd, idxStart) + sidebarEnd.length;

let sidebarCode = content.substring(idxStart, idxEnd);
// Adjust to row-span-2 for grid auto placement
sidebarCode = sidebarCode.replace('<div className="xl:col-span-1">', '<div className="xl:col-span-1 xl:row-span-2 w-full max-w-full">');

// Remove original sidebar
content = content.substring(0, idxStart) + content.substring(idxEnd);

// Clean up trailing divs
content = content.replace('        </div>\n\n\n      </div>\n      \n      {/* Sticky Mobile Add To Cart Bar */}', '      </div>\n      \n      {/* Sticky Mobile Add To Cart Bar */}');

// 3. Find Reviews start and split
const reviewsStart = '          {/* Feedback & Reviews */}\n          <div className="space-y-6 pt-8 border-t border-slate-200">';

const reviewIdx = content.indexOf(reviewsStart);

const splitInsertion = `        </div>

${sidebarCode}

        {/* Left Column Part 2 */}
        <div className="xl:col-span-2 space-y-8 w-full max-w-full">
          
          {/* Feedback & Reviews */}
          <div className="space-y-6 pt-8 md:pt-0 border-t md:border-t-0 border-slate-200">`;

content = content.substring(0, reviewIdx) + splitInsertion + content.substring(reviewIdx + reviewsStart.length);

fs.writeFileSync('src/pages/FrontPages.tsx', content, 'utf-8');
console.log('Script completed');
