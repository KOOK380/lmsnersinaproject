const fs = require('fs');

let content = fs.readFileSync('src/pages/FrontPages.tsx', 'utf-8');

// The block to extract starts from `        {/* Right Column / Sidebar */}` and ends exactly before `      </div>\n      \n      {/* Sticky Mobile Add To Cart Bar */}`
const sidebarStartStr = '        {/* Right Column / Sidebar */}\n        <div className="xl:col-span-1">\n           <div className="sticky top-24 border border-slate-200 rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col">';
const sidebarEndStr = '              </div>\n           </div>\n        </div>';

const sidebarStartIndex = content.indexOf(sidebarStartStr);
const sidebarEndIndex = content.indexOf(sidebarEndStr, sidebarStartIndex) + sidebarEndStr.length;

let sidebarCode = content.substring(sidebarStartIndex, sidebarEndIndex);

// Add row-span styling to the sidebar column
sidebarCode = sidebarCode.replace('<div className="xl:col-span-1">', '<div className="xl:col-span-1 xl:row-span-2">');

// Remove the sidebar from its original position
content = content.substring(0, sidebarStartIndex) + content.substring(sidebarEndIndex);

// The `</div>\n\n        {/* Right Column / Sidebar */}` will now be just `</div>\n\n      </div>\n      \n      {/* Sticky Mobile Add To Cart Bar */}`.
// But wait, there is a `        </div>` closing the left column just before the sidebar start index.
// It's like:
//         </div>
//
//         {/* Right Column / Sidebar */}
// 

content = content.replace('        </div>\n\n\n      </div>\n      \n      {/* Sticky Mobile Add To Cart Bar */}', '      </div>\n      \n      {/* Sticky Mobile Add To Cart Bar */}');


// Now find the insert point. It should be before `          {/* Feedback & Reviews */}`
const insertPointStr = '          {/* Feedback & Reviews */}';
const insertIndex = content.indexOf(insertPointStr);

// Split left column into two:
// Insert the sidebar, and close the first left column `</div>`, open the second left column `<div>`

let insertion = `        </div>

${sidebarCode}

        {/* Left Column Part 2 */}
        <div className="xl:col-span-2 space-y-8">
          
`;

content = content.substring(0, insertIndex) + insertion + content.substring(insertIndex);

fs.writeFileSync('src/pages/FrontPages.tsx', content, 'utf-8');
console.log("Done");
