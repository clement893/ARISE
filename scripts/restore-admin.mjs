import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'clement@clementroy.work';
  
  console.log(`🔍 Checking user: ${adminEmail}`);
  
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
    }
  });

  if (!user) {
    console.log(`❌ User ${adminEmail} not found!`);
    console.log(`💡 You may need to create the user first or check the email address.`);
    process.exit(1);
  }

  console.log(`✅ User found:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A');
  console.log(`   Current Role: ${user.role}`);
  console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);

  if (user.role === 'admin') {
    console.log(`\n✅ User is already an admin. No changes needed.`);
  } else {
    console.log(`\n🔄 Updating user role to admin...`);
    
    await prisma.user.update({
      where: { email: adminEmail },
      data: { 
        role: 'admin',
        isActive: true
      }
    });
    
    console.log(`✅ User ${adminEmail} has been promoted to admin!`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

