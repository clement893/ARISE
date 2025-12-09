import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEvaluatorInviteEmail, sendEvaluatorAddedConfirmation } from '@/lib/sendgrid';

// GET - List all evaluators for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const evaluators = await prisma.evaluator.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ evaluators });
  } catch (error) {
    console.error('Error fetching evaluators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluators' },
      { status: 500 }
    );
  }
}

// POST - Add a new evaluator
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, email, relationship } = body;

    if (!userId || !name || !email || !relationship) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if evaluator already exists for this user
    const existingEvaluator = await prisma.evaluator.findUnique({
      where: {
        userId_email: {
          userId: parseInt(userId),
          email: email.toLowerCase(),
        },
      },
    });

    if (existingEvaluator) {
      return NextResponse.json(
        { error: 'This evaluator has already been added' },
        { status: 409 }
      );
    }

    // Get user info for confirmation email
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

    // Create evaluator
    const evaluator = await prisma.evaluator.create({
      data: {
        userId: parseInt(userId),
        name,
        email: email.toLowerCase(),
        relationship,
      },
    });

    // Send confirmation email to user that evaluator was added
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    
    sendEvaluatorAddedConfirmation({
      userEmail: user.email,
      userName,
      evaluatorName: name,
      evaluatorEmail: email,
      relationship,
    }).catch(err => console.error('Failed to send confirmation email:', err));

    return NextResponse.json(
      { message: 'Evaluator added successfully', evaluator },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding evaluator:', error);
    return NextResponse.json(
      { error: 'Failed to add evaluator' },
      { status: 500 }
    );
  }
}

// DELETE - Remove an evaluator
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const evaluatorId = searchParams.get('id');

    if (!evaluatorId) {
      return NextResponse.json(
        { error: 'Evaluator ID is required' },
        { status: 400 }
      );
    }

    await prisma.evaluator.delete({
      where: { id: parseInt(evaluatorId) },
    });

    return NextResponse.json({ message: 'Evaluator removed successfully' });
  } catch (error) {
    console.error('Error removing evaluator:', error);
    return NextResponse.json(
      { error: 'Failed to remove evaluator' },
      { status: 500 }
    );
  }
}
