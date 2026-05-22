import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Membership" },
    { name: "Business Growth" },
    { name: "Financial Freedom" },
    { name: "Money Mindset" },
    { name: "One to one Coaching" },
    { name: "Transformational Coaching" },
    { name: "Wealth Building" }
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name }
    });
    if (!existing) {
      await prisma.category.create({
        data: { name: cat.name }
      });
      console.log(`Added category: ${cat.name}`);
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
