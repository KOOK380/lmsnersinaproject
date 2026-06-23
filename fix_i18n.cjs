const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [from, to] of replacements) {
        content = content.replaceAll(from, to);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('./src/i18n.ts', [
    ['"This course includes:"', '"This program includes:"'],
    ['"No courses purchased yet."', '"No programs purchased yet."'],
    ['"An educational platform offering the best courses."', '"An educational platform offering the best programs."']
]);

replaceInFile('./src/api.ts', [
    ['"This course includes:"', '"This program includes:"'],
    ['"No courses purchased yet."', '"No programs purchased yet."'],
    ['"An educational platform offering the best courses."', '"An educational platform offering the best programs."']
]);
