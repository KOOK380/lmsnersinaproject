import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoriesToCreate = [
  "Business Growth",
  "Financial Freedom",
  "Money Mindset",
  "One to one Coaching",
  "Transformational Coaching",
  "Wealth Building"
];

async function main() {
  for (const name of categoriesToCreate) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (!existing) {
      await prisma.category.create({
        data: {
          name,
          description: name
        }
      });
      console.log(`Created category: ${name}`);
    } else {
      console.log(`Category already exists: ${name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
