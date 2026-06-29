import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@myklasi.online';
  const newPassword = 'Admin@MyKlasi2026';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);
  
  const user = await prisma.user.updateMany({
    where: { email, role: 'super_admin' },
    data: {
      passwordHash: hash,
      mustChangePassword: false,
      isActive: true,
    }
  });
  
  console.log('Reset admin user response:', user);
}

main().catch(err => console.error(err));
