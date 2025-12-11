import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // SECURITY: Require webhook signature verification in production
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      // In production, reject requests without webhook secret
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Webhook not configured' },
          { status: 500 }
        );
      }
    }

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    // Verify webhook signature
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
          { error: 'Webhook signature verification failed' },
          { status: 400 }
        );
      }
    } else {
      // Only allow in development mode
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Webhook secret required in production' },
          { status: 500 }
        );
      }
      event = JSON.parse(body) as Stripe.Event;
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          // Validate userId is a number
          const userIdNum = parseInt(userId);
          if (isNaN(userIdNum)) {
            console.error('Invalid userId in webhook metadata:', userId);
            break;
          }

          // Validate planId
          const validPlans = ['starter', 'individual', 'coach', 'business'];
          if (!validPlans.includes(planId)) {
            console.error('Invalid planId in webhook metadata:', planId);
            break;
          }

          // Update user's plan in database
          await prisma.user.update({
            where: { id: userIdNum },
            data: {
              plan: planId as PlanType,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
            },
          });
          console.log(`User ${userId} upgraded to ${planId} plan`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          const userIdNum = parseInt(userId);
          if (isNaN(userIdNum)) {
            console.error('Invalid userId in subscription metadata:', userId);
            break;
          }

          const status = subscription.status;
          if (status === 'active') {
            console.log(`Subscription for user ${userId} is active`);
          } else if (status === 'canceled' || status === 'unpaid') {
            // Downgrade user to free plan
            await prisma.user.update({
              where: { id: userIdNum },
              data: { plan: 'starter' as PlanType },
            });
            console.log(`User ${userId} downgraded to free plan`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (userId) {
          const userIdNum = parseInt(userId);
          if (isNaN(userIdNum)) {
            console.error('Invalid userId in subscription metadata:', userId);
            break;
          }

          // Downgrade user to free plan
          await prisma.user.update({
            where: { id: userIdNum },
            data: {
              plan: 'starter' as PlanType,
              stripeSubscriptionId: null,
            },
          });
          console.log(`Subscription deleted for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
