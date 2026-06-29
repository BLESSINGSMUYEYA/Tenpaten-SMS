import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      school: true
    }
  });
  console.log('All Users in DB:');
  for (const u of users) {
    console.log(`Email: ${u.email}, Role: ${u.role}, SchoolCode: ${u.school?.schoolCode}, IsActive: ${u.isActive}`);
  }
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
