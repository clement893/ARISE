import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const { id } = await params;
    
    const questions = await prisma.assessmentQuestion.findMany({
      where: { assessmentType: id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdmin(request);
    
    if (!adminUser) {
      return forbiddenResponse('Admin access required');
    }

    const { id } = await params;
    const body = await request.json();
    const { text, category, order } = body;

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

    const question = await prisma.assessmentQuestion.create({
      data: {
        assessmentType: id,
        text: text.trim(),
        category: category || '',
        order: order || 0
      }
    });

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
