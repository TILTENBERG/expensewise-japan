const { execSync } = require('child_process');

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.STORAGE_URL ||
  process.env.STORAGE_DATABASE_URL;

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
  try {
    console.log('Pushing database schema to Neon Postgres...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env,
    });
    console.log('Database schema successfully synced to Neon!');
  } catch (err) {
    console.warn('Warning: prisma db push warning, continuing build:', err.message);
  }
} else {
  console.log('No DATABASE_URL found, skipping prisma db push.');
}
