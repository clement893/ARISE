import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

// Helper to get user from token
async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

const COACHING_PACKAGES = {
  single: {
    name: 'Single Coaching Session',
    description: '1 hour coaching session with a certified coach',
    price: 9900, // $99.00
    sessions: 1,
  },
  package3: {
    name: '3 Coaching Sessions',
    description: '3 coaching sessions + personalized development plan',
    price: 24900, // $249.00
    sessions: 3,
  },
  package5: {
    name: '5 Coaching Sessions',
    description: '5 coaching sessions + full coaching program',
    price: 39900, // $399.00
    sessions: 5,
  },
};

// POST - Purchase coaching package
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { packageId } = body;

    if (!packageId || !COACHING_PACKAGES[packageId as keyof typeof COACHING_PACKAGES]) {
      return NextResponse.json(
        { error: 'Invalid coaching package' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const coachingPackage = COACHING_PACKAGES[packageId as keyof typeof COACHING_PACKAGES];
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create one-time payment session for coaching
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: coachingPackage.name,
              description: coachingPackage.description,
              metadata: {
                packageId,
                sessions: coachingPackage.sessions.toString(),
              },
            },
            unit_amount: coachingPackage.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/dashboard/profile?coaching=success&sessions=${coachingPackage.sessions}`,
      cancel_url: `${baseUrl}/dashboard/profile?coaching=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        packageId,
        sessions: coachingPackage.sessions.toString(),
        type: 'coaching',
      },
    });

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating coaching checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET - Get available coaching packages
export async function GET() {
  return NextResponse.json({
    packages: Object.entries(COACHING_PACKAGES).map(([id, pkg]) => ({
      id,
      ...pkg,
      priceFormatted: `$${(pkg.price / 100).toFixed(0)}`,
    })),
  });
}
