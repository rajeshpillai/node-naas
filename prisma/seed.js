import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Register the Todo app
  const todoApp = await prisma.app.create({
    data: {
      name: 'TodoApp',
      apiKey: uuidv4(), // Generate a unique API key for the app
      rateLimit: 1000,  // Set an appropriate rate limit : todo (unused)
    },
  });

  console.log(`TodoApp registered with API key: ${todoApp.apiKey}`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
