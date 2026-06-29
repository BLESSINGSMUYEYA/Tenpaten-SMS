import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      mustChangePassword: true,
      school: {
        select: {
          name: true,
          schoolCode: true,
        }
      }
    }
  });
  console.log('All Users in DB:', JSON.stringify(users, null, 2));
}

main().catch(err => console.error(err));
