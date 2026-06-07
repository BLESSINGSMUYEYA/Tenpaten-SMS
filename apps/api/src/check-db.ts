import { prisma } from './config/database';

async function main() {
  try {
    const schools = await prisma.school.findMany();
    const users = await prisma.user.findMany();
    console.log('--- DATABASE STATUS ---');
    console.log(`Total Schools: ${schools.length}`);
    schools.forEach(s => {
      console.log(`School: ${s.name} (${s.schoolCode}) - Active: ${s.isActive}`);
    });
    console.log(`Total Users: ${users.length}`);
    users.forEach(u => {
      console.log(`User: ${u.firstName} ${u.lastName} (${u.email}) - Role: ${u.role}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
