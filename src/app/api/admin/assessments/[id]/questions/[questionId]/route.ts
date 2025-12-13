import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const { questionId } = await params;
    
    // Validate questionId
    const questionIdNum = parseInt(questionId);
    if (isNaN(questionIdNum)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    await prisma.assessmentQuestion.delete({
      where: { id: questionIdNum }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const { questionId } = await params;
    const body = await request.json();
    const { text, category, order } = body;

    // Validate questionId
    const questionIdNum = parseInt(questionId);
    if (isNaN(questionIdNum)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      );
    }

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Question text is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    const question = await prisma.assessmentQuestion.update({
      where: { id: questionIdNum },
      data: { 
        text: text.trim(), 
        category: category || '', 
        order: typeof order === 'number' ? order : undefined 
      }
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}
