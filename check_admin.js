const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function check() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'campuscart@gmail.com' }
    });
    
    if (admin) {
      console.log('Admin found:', admin.email, 'Role:', admin.role);
    } else {
      console.log('Admin user NOT FOUND');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
