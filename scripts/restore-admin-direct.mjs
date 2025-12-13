import { PrismaClient } from '@prisma/client';

// Connect directly to the provided database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:cNUvlInibCwWkKnKWLiETJnODwqiuasH@mainline.proxy.rlwy.net:27665/railway'
    }
  }
});

async function main() {
  const adminEmail = 'clement@clementroy.work';
  
  console.log(`🔍 Connecting to database...`);
  console.log(`🔍 Checking user: ${adminEmail}`);
  
  try {
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
      console.log(`💡 The user may need to be created first.`);
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
      
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          role: 'admin',
          isActive: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        }
      });
      
      console.log(`\n✅ SUCCESS! User has been promoted to admin!`);
      console.log(`   Updated Role: ${updatedUser.role}`);
      console.log(`   Active: ${updatedUser.isActive ? 'Yes' : 'No'}`);
      console.log(`\n🎉 You can now log in as admin with: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

