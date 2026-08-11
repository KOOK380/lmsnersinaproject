const fs = require('fs');
let content = fs.readFileSync('src/api.ts', 'utf8');

// Membership get
content = content.replace(
  /router\.get\("\/memberships", async \(req, res\) => \{\n\s+const memberships = await prisma\.membership\.findMany\(\{\n\s+include: \{ contents: true, editions: true, category: true \}/g,
  `router.get("/memberships", async (req, res) => {\n  const memberships = await prisma.membership.findMany({\n    where: { isActive: true },\n    include: { contents: true, editions: true, category: true }`
);

// Event get
content = content.replace(
  /router\.get\("\/events", async \(req, res\) => \{\n\s+const events = await prisma\.event\.findMany\(\{\n\s+where: \{\n\s+OR: \[\n\s+\{ expiryDate: null \},\n\s+\{ expiryDate: \{ gt: new Date\(\) \} \}\n\s+\]\n\s+\},/g,
  `router.get("/events", async (req, res) => {\n  const events = await prisma.event.findMany({\n    where: {\n      isActive: true,\n      OR: [\n        { expiryDate: null },\n        { expiryDate: { gt: new Date() } }\n      ]\n    },`
);

// Event put (Admin)
content = content.replace(
  /const \{ title, description, date, endDate, expiryDate, totalSeats, availableSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes, notifyEnrolled \} = req\.body;/g,
  `const { title, description, date, endDate, expiryDate, totalSeats, availableSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes, notifyEnrolled, isActive } = req.body;`
);

content = content.replace(
  /data: \{\n\s+title, description, date: new Date\(date\),/g,
  `data: {\n      isActive: isActive !== undefined ? isActive : true,\n      title, description, date: new Date(date),`
);

// Membership put (Admin)
content = content.replace(
  /const \{ contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate, notifyEnrolled, enablePlatformContent, telegramLink, whatsappLink, customExternalLink \} = req\.body;/g,
  `const { contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate, notifyEnrolled, enablePlatformContent, telegramLink, whatsappLink, customExternalLink, isActive } = req.body;`
);

content = content.replace(
  /data: \{\n\s+type, label, offerPrice, realPrice, imageUrl, categoryId: parsedCategoryId,/g,
  `data: {\n        isActive: isActive !== undefined ? isActive : true,\n        type, label, offerPrice, realPrice, imageUrl, categoryId: parsedCategoryId,`
);

// Membership post (Admin) - let's check it too
content = content.replace(
  /const \{ contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate, isSubscription, subscriptionInterval, enablePlatformContent, telegramLink, whatsappLink, customExternalLink \} = req\.body;/g,
  `const { contents, editions, type, label, offerPrice, realPrice, imageUrl, categoryId, meetingLink, meetingDate, meetingNotes, expiryDate, isSubscription, subscriptionInterval, enablePlatformContent, telegramLink, whatsappLink, customExternalLink, isActive } = req.body;`
);

content = content.replace(
  /data: \{\n\s+type, label, offerPrice, realPrice, imageUrl, categoryId: parsedCategoryId, isSubscription, subscriptionInterval,/g,
  `data: {\n        isActive: isActive !== undefined ? isActive : true,\n        type, label, offerPrice, realPrice, imageUrl, categoryId: parsedCategoryId, isSubscription, subscriptionInterval,`
);

// Event post (Admin)
content = content.replace(
  /const \{ title, description, date, endDate, expiryDate, totalSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes \} = req\.body;/g,
  `const { title, description, date, endDate, expiryDate, totalSeats, price, realPrice, location, imageUrl, translations, meetingLink, meetingDate, meetingNotes, isActive } = req.body;`
);

content = content.replace(
  /data: \{\n\s+title, description, date: new Date\(date\),/g,
  `data: {\n      isActive: isActive !== undefined ? isActive : true,\n      title, description, date: new Date(date),`
);

fs.writeFileSync('src/api.ts', content);
