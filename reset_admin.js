const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function reset() {
  try {
    const hash = await bcrypt.hash('1234567890', 10);
    await prisma.user.upsert({
      where: { email: 'campuscart@gmail.com' },
      update: { passwordHash: hash, role: 'ADMIN' },
      create: { 
        email: 'campuscart@gmail.com', 
        passwordHash: hash, 
        role: 'ADMIN',
        name: 'Admin User'
      }
    });
    console.log('Admin password reset to 1234567890');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

reset();
