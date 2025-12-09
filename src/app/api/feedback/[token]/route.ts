import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get evaluator info by token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const evaluator = await prisma.evaluator.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!evaluator) {
      return NextResponse.json(
        { error: 'Invalid or expired feedback link' },
        { status: 404 }
      );
    }

    const userName = `${evaluator.user.firstName || ''} ${evaluator.user.lastName || ''}`.trim() || 'User';

    return NextResponse.json({
      evaluator: {
        id: evaluator.id,
        name: evaluator.name,
        relationship: evaluator.relationship,
        userName,
        status: evaluator.status,
      },
    });
  } catch (error) {
    console.error('Error fetching evaluator:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluator info' },
      { status: 500 }
    );
  }
}
