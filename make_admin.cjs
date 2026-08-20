const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.updateMany({
    where: { email: 'tirtha944@gmail.com' },
    data: { role: 'ADMIN' }
  });
  
  await prisma.user.updateMany({
    where: { email: 'tirthatalukdar989@gmail.com' },
    data: { role: 'ADMIN' }
  });
  console.log("Made user an ADMIN");
}
main();
