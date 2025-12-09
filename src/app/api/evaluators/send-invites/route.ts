import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEvaluatorInviteEmail } from '@/lib/sendgrid';

// POST - Send invitations to pending evaluators
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, evaluatorIds } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { firstName: true, lastName: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'A colleague';

    // Get evaluators to invite
    const whereClause: any = {
      userId: parseInt(userId),
      status: 'pending',
    };

    if (evaluatorIds && evaluatorIds.length > 0) {
      whereClause.id = { in: evaluatorIds.map((id: string | number) => parseInt(String(id))) };
    }

    const evaluators = await prisma.evaluator.findMany({
      where: whereClause,
    });

    if (evaluators.length === 0) {
      return NextResponse.json(
        { error: 'No pending evaluators found' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://web-production-d62b.up.railway.app';
    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Send invitations
    for (const evaluator of evaluators) {
      const feedbackUrl = `${baseUrl}/feedback/${evaluator.token}`;
      
      const relationshipLabels: Record<string, string> = {
        manager: 'Manager / Supervisor',
        peer: 'Peer / Colleague',
        direct_report: 'Direct Report',
        other: 'Professional Contact',
      };

      const result = await sendEvaluatorInviteEmail({
        evaluatorEmail: evaluator.email,
        evaluatorName: evaluator.name,
        userName,
        userEmail: user.email,
        relationship: relationshipLabels[evaluator.relationship] || evaluator.relationship,
        feedbackUrl,
      });

      if (result.success) {
        // Update evaluator status
        await prisma.evaluator.update({
          where: { id: evaluator.id },
          data: {
            status: 'invited',
            inviteSentAt: new Date(),
          },
        });
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`Failed to send to ${evaluator.email}: ${result.error}`);
      }
    }

    return NextResponse.json({
      message: `Sent ${results.success} invitation(s)`,
      results,
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    );
  }
}
