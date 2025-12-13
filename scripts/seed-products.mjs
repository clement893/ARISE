import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  // Products from signup/choose-plan
  {
    name: 'Starter',
    planType: 'starter',
    description: 'Perfect for individuals starting their leadership journey',
    monthlyPrice: 4900, // $49 in cents
    annualPrice: 3900, // $39/month in cents (annual billing)
    currency: 'USD',
    features: [
      'All 4 assessments',
      'Personal dashboard',
      'Basic reports',
      'Email support'
    ],
    isActive: true,
    isPopular: false,
    displayOrder: 1,
  },
  {
    name: 'Professional',
    planType: 'professional',
    description: 'For serious leaders committed to growth',
    monthlyPrice: 9900, // $99 in cents
    annualPrice: 7900, // $79/month in cents (annual billing)
    currency: 'USD',
    features: [
      'Everything in Starter',
      'Advanced analytics',
      'Priority support',
      '1-on-1 coaching session'
    ],
    isActive: true,
    isPopular: true,
    displayOrder: 2,
  },
  {
    name: 'Enterprise',
    planType: 'enterprise',
    description: 'For teams and organizations',
    monthlyPrice: 19900, // $199 in cents
    annualPrice: 15900, // $159/month in cents (annual billing)
    currency: 'USD',
    features: [
      'Everything in Professional',
      'Team dashboards',
      'Custom integrations',
      'Dedicated account manager'
    ],
    isActive: true,
    isPopular: false,
    displayOrder: 3,
  },
  // Products from pricing page
  {
    name: 'Individual',
    planType: 'individual',
    description: 'For professionals seeking personal growth',
    monthlyPrice: 4900, // $49 in cents
    annualPrice: 3900, // Assuming same discount
    currency: 'USD',
    features: [
      'All 4 assessments (MBTI, TKI, 360°, Wellness)',
      'Comprehensive leadership report',
      'Personal development plan',
      'Progress tracking dashboard',
      'Email support',
    ],
    isActive: true,
    isPopular: false,
    displayOrder: 4,
  },
  {
    name: 'Coach',
    planType: 'coach',
    description: 'For coaches and consultants',
    monthlyPrice: 14900, // $149 in cents
    annualPrice: 11900, // Assuming 20% discount
    currency: 'USD',
    features: [
      'Everything in Individual',
      'Up to 25 client accounts',
      'Client management dashboard',
      'White-label reports',
      'Group analytics',
      'Priority support',
    ],
    isActive: true,
    isPopular: true,
    displayOrder: 5,
  },
  // Note: Business uses 'enterprise' planType as it's the same tier
  // If you need separate Business product, consider adding a new planType to the enum
];

async function main() {
  console.log('🌱 Seeding products...');

  for (const product of products) {
    try {
      // Check if product already exists
      const existing = await prisma.product.findUnique({
        where: { planType: product.planType },
      });

      if (existing) {
        console.log(`⚠️  Product ${product.name} (${product.planType}) already exists, updating...`);
        await prisma.product.update({
          where: { planType: product.planType },
          data: product,
        });
        console.log(`✅ Updated product: ${product.name}`);
      } else {
        await prisma.product.create({
          data: product,
        });
        console.log(`✅ Created product: ${product.name}`);
      }
    } catch (error) {
      console.error(`❌ Error processing product ${product.name}:`, error.message);
    }
  }

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
