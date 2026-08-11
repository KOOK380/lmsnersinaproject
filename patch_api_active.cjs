const fs = require('fs');
let content = fs.readFileSync('src/api.ts', 'utf8');

// Membership get
content = content.replace(
  /router\.get\("\/memberships", async \(req, res\) => \{\n\s+const memberships = await prisma\.membership\.findMany\(\{\n\s+where: \{ isActive: true \},\n\s+include: \{ contents: true, editions: true, category: true \}/g,
  `router.get("/memberships", async (req, res) => {\n  const memberships = await prisma.membership.findMany({\n    include: { contents: true, editions: true, category: true }\n  });\n  res.json(memberships);\n});\n\nrouter.get("/memberships/active", async (req, res) => {\n  const memberships = await prisma.membership.findMany({\n    where: { isActive: true },\n    include: { contents: true, editions: true, category: true }`
);

// Event get
content = content.replace(
  /router\.get\("\/events", async \(req, res\) => \{\n\s+const events = await prisma\.event\.findMany\(\{\n\s+where: \{\n\s+isActive: true,\n\s+OR: \[\n\s+\{ expiryDate: null \},\n\s+\{ expiryDate: \{ gt: new Date\(\) \} \}\n\s+\]\n\s+\},/g,
  `router.get("/events", async (req, res) => {\n  const events = await prisma.event.findMany({\n    where: {\n      OR: [\n        { expiryDate: null },\n        { expiryDate: { gt: new Date() } }\n      ]\n    },\n    orderBy: { date: 'asc' },\n    include: { translations: true }\n  });\n  res.json(events);\n});\n\nrouter.get("/events/active", async (req, res) => {\n  const events = await prisma.event.findMany({\n    where: {\n      isActive: true,\n      OR: [\n        { expiryDate: null },\n        { expiryDate: { gt: new Date() } }\n      ]\n    },`
);

fs.writeFileSync('src/api.ts', content);
