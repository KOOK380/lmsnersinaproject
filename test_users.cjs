const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => ({ id: u.id, email: u.email, role: u.role, p: u.passwordHash.substring(0,10) })));
}
main();
