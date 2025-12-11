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
    
    // Validate assessment type
    const validTypes = ['tki', '360', 'wellness', 'mbti'];
    if (!validTypes.includes(id)) {
      return NextResponse.json(
        { error: 'Invalid assessment type' },
        { status: 400 }
      );
    }
    
    // Get assessment config from database or return default
    const config = await prisma.assessmentConfig.findUnique({
      where: { assessmentType: id }
    });

    if (config) {
      return NextResponse.json({ assessment: config });
    }

    // Return default config if not found
    const defaults: Record<string, any> = {
      tki: { name: 'TKI Conflict Style', description: 'Conflict resolution assessment', duration: 15, questionCount: 30, isActive: true },
      '360': { name: '360° Feedback', description: 'Multi-rater feedback assessment', duration: 15, questionCount: 30, isActive: true },
      wellness: { name: 'Wellness', description: 'Holistic well-being evaluation', duration: 15, questionCount: 30, isActive: true }
    };

    return NextResponse.json({ 
      assessment: defaults[id] || { name: id, description: '', duration: 15, questionCount: 0, isActive: false }
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { name, description, duration, questionCount, isActive } = body;

    // Validate assessment type
    const validTypes = ['tki', '360', 'wellness', 'mbti'];
    if (!validTypes.includes(id)) {
      return NextResponse.json(
        { error: 'Invalid assessment type' },
        { status: 400 }
      );
    }

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Assessment name is required' },
        { status: 400 }
      );
    }

    if (typeof duration !== 'number' || duration < 1 || duration > 120) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 120 minutes' },
        { status: 400 }
      );
    }

    // Upsert assessment config
    const config = await prisma.assessmentConfig.upsert({
      where: { assessmentType: id },
      update: {
        name: name.trim(),
        description: description?.trim() || '',
        duration,
        questionCount: questionCount || 0,
        isActive: Boolean(isActive)
      },
      create: {
        assessmentType: id,
        name: name.trim(),
        description: description?.trim() || '',
        duration,
        questionCount: questionCount || 0,
        isActive: Boolean(isActive)
      }
    });

    return NextResponse.json({ success: true, assessment: config });
  } catch (error) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to update assessment' },
      { status: 500 }
    );
  }
}
