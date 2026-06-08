import { prisma } from './src/lib/prisma.js';
import fs from 'fs';
import path from 'path';

async function run() {
  const aboutUsFilePath = path.join(process.cwd(), 'src', 'pages', 'AboutUs.tsx');
  const fileContent = fs.readFileSync(aboutUsFilePath, 'utf8');
  
  // Extract the defaultAboutUsHtml content using string splitting or regex
  const match = fileContent.match(/export const defaultAboutUsHtml = `([\s\S]*?)`;\n\nexport function AboutUs()/);
  
  if (match && match[1]) {
    const html = match[1];
    await prisma.setting.upsert({
      where: { key: 'ABOUT_US_PAGE' },
      update: { value: html },
      create: { key: 'ABOUT_US_PAGE', value: html }
    });
    console.log('Updated db with latest HTML from AboutUs.tsx');
  } else {
    console.log('Could not extract HTML from AboutUs.tsx');
  }
}
run();
