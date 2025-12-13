import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing userId or action' },
        { status: 400 }
      );
    }

    // Prevent admin from modifying their own role
    if (userId === adminUser.id && (action === 'make_participant' || action === 'delete')) {
      return NextResponse.json(
        { error: 'Cannot modify your own admin account' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'make_admin':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'admin' }
        });
        break;

      case 'make_participant':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'participant' }
        });
        break;

      case 'make_coach':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'coach' }
        });
        break;

      case 'delete':
        // Delete related data first
        await prisma.assessmentResult.deleteMany({ where: { userId } });
        await prisma.evaluator.deleteMany({ where: { userId } });
        await prisma.subscription.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });
        break;

      case 'view':
      case 'edit':
        // These actions are handled on the frontend
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing user action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
