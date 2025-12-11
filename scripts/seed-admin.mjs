import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'clement@clementroy.work';
  
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
    // Use environment variable for password, or generate a secure random one
    let adminPassword = process.env.ADMIN_PASSWORD;
    let passwordGenerated = false;
    
    if (!adminPassword) {
      // Generate a secure random password
      adminPassword = crypto.randomBytes(16).toString('base64').slice(0, 20) + '!A1';
      passwordGenerated = true;
    }
    
    const hashedPassword = await bcrypt.hash(adminPassword, 12); // Use stronger hash rounds
    
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
    
    if (passwordGenerated) {
      console.log(`🔑 Generated Password: ${adminPassword}`);
      console.log(`⚠️  IMPORTANT: Save this password now! It won't be shown again.`);
      console.log(`⚠️  Consider setting ADMIN_PASSWORD environment variable for consistent deployments.`);
    } else {
      console.log(`🔑 Password: (from ADMIN_PASSWORD environment variable)`);
    }
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
