import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    process.env.DIRECT_URL = dbUrl;
    execSync('npx prisma db push', { stdio: 'inherit' });
  } else {
    console.error("No DATABASE_URL");
  }
}

main().catch(console.error);
