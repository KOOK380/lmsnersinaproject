const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');

// update active courses route
code = code.replace(
  /router\.get\("\/courses\/active", async \(req, res\) => \{\s*const courses = await prisma\.course\.findMany\(\{\s*where: \{ isActive: true \},\s*orderBy: \{ createdAt: 'desc' \},/g,
  `router.get("/courses/active", async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],`
);

// update admin courses route
code = code.replace(
  /router\.get\("\/courses", async \(req, res\) => \{\s*try \{\s*const courses = await prisma\.course\.findMany\(\{\s*orderBy: \{ createdAt: 'desc' \},/g,
  `router.get("/courses", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],`
);

// update post courses
code = code.replace(
  'instructorId, categoryId, membershipIds, isFeatured, isUpcoming, isActive,',
  'instructorId, categoryId, membershipIds, isFeatured, order, isUpcoming, isActive,'
);

// update data payload in post
code = code.replace(
  /data: \{\s*title,\s*description,/g,
  'data: {\n      order: parseInt(order) || 0,\n      title,\n      description,'
);

// update put courses
code = code.replace(
  'const { lessons, translations, editions, labels, title, description, price, realPrice, imageUrl, bannerVideoUrl, instructorId, categoryId, membershipIds, isFeatured, isUpcoming, isActive,',
  'const { lessons, translations, editions, labels, title, description, price, realPrice, imageUrl, bannerVideoUrl, instructorId, categoryId, membershipIds, isFeatured, order, isUpcoming, isActive,'
);

fs.writeFileSync('src/api.ts', code);
console.log("Updated api.ts");
