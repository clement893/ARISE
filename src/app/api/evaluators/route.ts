import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEvaluatorInviteEmail, sendEvaluatorAddedConfirmation } from '@/lib/sendgrid';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

// GET - List all evaluators for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const currentUser = await requireAuth(request);
    
    if (!currentUser) {
      return unauthorizedResponse('Authentication required');
    }

    // Use the authenticated user's ID, not a query parameter
    const evaluators = await prisma.evaluator.findMany({
      where: { userId: currentUser.id },
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

// POST - Add a new evaluator for the authenticated user
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const currentUser = await requireAuth(request);
    
    if (!currentUser) {
      return unauthorizedResponse('Authentication required');
    }

    const body = await request.json();
    const { name, email, relationship } = body;

    // Validate required fields
    if (!name || !email || !relationship) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, relationship' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate relationship
    const validRelationships = ['manager', 'peer', 'direct_report', 'other'];
    if (!validRelationships.includes(relationship)) {
      return NextResponse.json(
        { error: 'Invalid relationship type' },
        { status: 400 }
      );
    }

    // Check if evaluator already exists for this user
    const existingEvaluator = await prisma.evaluator.findUnique({
      where: {
        userId_email: {
          userId: currentUser.id,
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
      where: { id: currentUser.id },
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
        userId: currentUser.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
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

// DELETE - Remove an evaluator (only if owned by authenticated user)
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const currentUser = await requireAuth(request);
    
    if (!currentUser) {
      return unauthorizedResponse('Authentication required');
    }

    const { searchParams } = new URL(request.url);
    const evaluatorId = searchParams.get('id');

    if (!evaluatorId) {
      return NextResponse.json(
        { error: 'Evaluator ID is required' },
        { status: 400 }
      );
    }

    // Validate evaluatorId
    const evaluatorIdNum = parseInt(evaluatorId);
    if (isNaN(evaluatorIdNum)) {
      return NextResponse.json(
        { error: 'Invalid evaluator ID' },
        { status: 400 }
      );
    }

    // Check if evaluator belongs to the current user
    const evaluator = await prisma.evaluator.findUnique({
      where: { id: evaluatorIdNum },
    });

    if (!evaluator) {
      return NextResponse.json(
        { error: 'Evaluator not found' },
        { status: 404 }
      );
    }

    if (evaluator.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'You can only delete your own evaluators' },
        { status: 403 }
      );
    }

    await prisma.evaluator.delete({
      where: { id: evaluatorIdNum },
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
