import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'clement@clementroy.work';
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingUser) {
    // Promote to admin if not already
    if (existingUser.role !== 'admin') {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'admin' }
      });
      console.log(`✅ User ${adminEmail} promoted to admin`);
    } else {
      console.log(`ℹ️ User ${adminEmail} is already an admin`);
    }
  } else {
    // Create new admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Clement',
        lastName: 'Admin',
        role: 'admin',
        isActive: true,
        emailVerified: true
      }
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: Admin123!`);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
