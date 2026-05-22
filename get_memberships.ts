import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const memberships = await prisma.membership.findMany({ include: { contents: true } });
  console.log(JSON.stringify(memberships, null, 2));
}
run();
