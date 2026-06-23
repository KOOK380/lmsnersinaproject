const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [from, to] of replacements) {
        content = content.replaceAll(from, to);
    }
    fs.writeFileSync(filePath, content);
}

// i18n
replaceInFile('./src/i18n.ts', [
    ['"Courses"', '"Programs"'],
    ['"View Courses"', '"View Programs"'],
    ['"Featured Courses"', '"Featured Programs"'],
    ['"All Courses"', '"All Programs"'],
    ['"Course Content"', '"Program Content"'],
    ['"Go to Course"', '"Go to Program"'],
    ['"Active Courses"', '"Active Programs"'],
    ['"Course Purchases"', '"Program Purchases"'],
]);

// api.ts
replaceInFile('./src/api.ts', [
    ['"Courses"', '"Programs"'],
    ['"View Courses"', '"View Programs"'],
    ['"Featured Courses"', '"Featured Programs"'],
    ['"All Courses"', '"All Programs"'],
    ['"Course Content"', '"Program Content"'],
    ['"Go to Course"', '"Go to Program"'],
    ['"Course Purchases"', '"Program Purchases"'],
]);

// Admin Manager Components
replaceInFile('./src/pages/AdminManagerComponents.tsx', [
    ['>Manage Courses<', '>Manage Programs<'],
    ['>+ New Course<', '>+ New Program<'],
    ['>Add New Course<', '>Add New Program<'],
    ['>Edit Course<', '>Edit Program<'],
    ['>Save Course<', '>Save Program<'],
    ['Edit Course Bundle', 'Edit Program Bundle'],
    ['>Included Courses<', '>Included Programs<'],
    ['>Course Bundles<', '>Program Bundles<'],
    ['Course Bundles (', 'Program Bundles ('],
    ['>Select Course<', '>Select Program<'],
    ['>-- Choose Course --<', '>-- Choose Program --<'],
    ['>Course<', '>Program<'],
    ['value="COURSE">Courses<', 'value="COURSE">Programs<'], // For the select option
    ['>Courses Sold (Completed)<', '>Programs Sold (Completed)<'],
    ['mb-4">Courses<', 'mb-4">Programs<']
]);

// Admin.tsx
replaceInFile('./src/pages/Admin.tsx', [
    ['>Top Courses<', '>Top Programs<'],
    ["'Top Courses'", "'Top Programs'"]
]);

// FrontPages.tsx
replaceInFile('./src/pages/FrontPages.tsx', [
    ['Course Media', 'Program Media'],
    ['Course Only', 'Program Only'],
    [' Courses <span', ' Programs <span'],
    ['Course Bundle', 'Program Bundle'],
    ['Included Courses', 'Included Programs'],
    ['All Courses', 'All Programs']
]);

// App.tsx
replaceInFile('./src/App.tsx', [
    ['>Explore Courses<', '>Explore Programs<'],
    ['>Course Bundles<', '>Program Bundles<'],
    ['>Courses<', '>Programs<']
]);

console.log("Replacements complete.");
