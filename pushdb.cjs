const { execSync } = require('child_process');
const fs = require('fs');

const envFile = fs.readFileSync('.env.example', 'utf8');
const env = {};
for (const line of envFile.split('\n')) {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, ...vals] = line.split('=');
    const val = vals.join('=').trim().replace(/^"|"$/g, '');
    if (key.trim()) env[key.trim()] = val;
  }
}

console.log("Pushing DB schema...");
try {
  execSync('npx -y prisma db push --accept-data-loss', { env: { ...process.env, ...env }, stdio: 'inherit' });
} catch (e) {
  console.error("Failed to push DB schema:", e.message);
}
