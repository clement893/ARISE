import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Prix des plans (en centimes)
const PLAN_PRICES = {
  starter: { monthly: 0, annual: 0 },
  professional: { monthly: 2900, annual: 29000 },
  enterprise: { monthly: 9900, annual: 99000 },
  revelation: { monthly: 4900, annual: 49000 },
  coaching: { monthly: 14900, annual: 149000 },
};

// GET - Récupérer l'abonnement de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Si pas d'abonnement, retourner les infos du plan de base
    if (!user.subscription) {
      return NextResponse.json({
        subscription: {
          plan: user.plan,
          billingCycle: user.billingCycle,
          status: 'active',
          price: PLAN_PRICES[user.plan as keyof typeof PLAN_PRICES]?.[user.billingCycle] || 0,
          currency: 'USD',
          hasCoaching: false,
          coachingSessions: 0,
        },
      });
    }

    return NextResponse.json({ subscription: user.subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour un abonnement
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan, billingCycle, hasCoaching } = body;

    // Valider le plan
    const validPlans = ['starter', 'professional', 'enterprise', 'revelation', 'coaching'];
    if (plan && !validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Valider le cycle de facturation
    const validCycles = ['monthly', 'annual'];
    if (billingCycle && !validCycles.includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }

    const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]?.[billingCycle as 'monthly' | 'annual'] || 0;

    // Calculer la date de fin selon le cycle
    const startDate = new Date();
    const endDate = new Date();
    if (billingCycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Mettre à jour l'utilisateur et créer/mettre à jour l'abonnement
    const [updatedUser, subscription] = await prisma.$transaction([
      prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          plan: plan || undefined,
          billingCycle: billingCycle || undefined,
        },
      }),
      prisma.subscription.upsert({
        where: { userId: parseInt(userId) },
        create: {
          userId: parseInt(userId),
          plan: plan || 'starter',
          billingCycle: billingCycle || 'monthly',
          status: 'active',
          price,
          currency: 'USD',
          startDate,
          endDate,
          nextBillingDate: endDate,
          hasCoaching: hasCoaching || plan === 'coaching',
          coachingSessions: plan === 'coaching' ? 4 : 0,
        },
        update: {
          plan: plan || undefined,
          billingCycle: billingCycle || undefined,
          status: 'active',
          price,
          startDate,
          endDate,
          nextBillingDate: endDate,
          hasCoaching: hasCoaching || plan === 'coaching',
          coachingSessions: plan === 'coaching' ? 4 : undefined,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Subscription updated successfully',
      subscription,
      user: {
        plan: updatedUser.plan,
        billingCycle: updatedUser.billingCycle,
      },
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// DELETE - Annuler l'abonnement
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Marquer l'abonnement comme annulé
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: parseInt(userId) },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    // Rétrograder l'utilisateur au plan starter
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        plan: 'starter',
      },
    });

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
