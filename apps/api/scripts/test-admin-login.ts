import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@myklasi.online';
  const password = 'Admin@MyKlasi2026';
  
  const user = await prisma.user.findFirst({
    where: { email, role: 'super_admin', isDeleted: false }
  });
  
  if (!user) {
    console.log('User not found!');
    return;
  }
  
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  console.log('User found:', user.email);
  console.log('Password hash in DB:', user.passwordHash);
  console.log('Password matches hash:', isMatch);
}

main().catch(err => console.error(err));
