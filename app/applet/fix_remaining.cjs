const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [from, to] of replacements) {
        content = content.replaceAll(from, to);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('./src/pages/Admin.tsx', [
    ['"COURSES"', '"PROGRAMS"'],
    ['"COURSE BUNDLES"', '"PROGRAM BUNDLES"']
]);

replaceInFile('./src/pages/AdminManagerComponents.tsx', [
    ['"Course Title (Internal)"', '"Program Title (Internal)"'],
    ['"Translated Course Title"', '"Translated Program Title"'],
    ['"Course Description"', '"Program Description"'],
    ['"Course Users"', '"Program Users"'],
    ['"E.g., New Course Available!"', '"E.g., New Program Available!"'], 
    ['`Course: ', '`Program: '],
    ['"Cancel" : "+ New Course"', '"Cancel" : "+ New Program"'],
    ['e.g. Master React in 21 Days - Complete Course', 'e.g. Master React in 21 Days - Complete Program']
]);

// Let's remove this script when done
