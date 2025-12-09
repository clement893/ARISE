import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    const { id } = await params;
    const body = await request.json();
    const { name, description, duration, questionCount, isActive } = body;

    // Upsert assessment config
    const config = await prisma.assessmentConfig.upsert({
      where: { assessmentType: id },
      update: {
        name,
        description,
        duration,
        questionCount,
        isActive
      },
      create: {
        assessmentType: id,
        name,
        description,
        duration,
        questionCount,
        isActive
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
