const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!content.includes('isActive        Boolean  @default(true)') && content.includes('model Membership {')) {
    content = content.replace(/model Membership \{([\s\S]*?)createdAt   DateTime/g, 'model Membership {$1isActive        Boolean  @default(true)\n  createdAt   DateTime');
}

if (!content.includes('isActive       Boolean  @default(true)') && content.includes('model Event {')) {
    content = content.replace(/model Event \{([\s\S]*?)createdAt      DateTime/g, 'model Event {$1isActive       Boolean  @default(true)\n  createdAt      DateTime');
}

fs.writeFileSync('prisma/schema.prisma', content);
