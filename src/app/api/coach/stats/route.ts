import { NextRequest, NextResponse } from 'next/server';
import { requireCoach } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Get coach dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    const coach = await requireCoach(request);
    if (!coach) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all participants (users who are not coaches/admins)
    // Note: We'll filter by role field first, then check roles array in code
    const allUsers = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        plan: true,
        createdAt: true,
        hasCoach: true,
        role: true,
        roles: true,
      }
    });

    // Filter to only participants (not coaches or admins)
    const participants = allUsers.filter(user => {
      const roles = user.roles 
        ? (Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles as string))
        : [user.role];
      return roles.includes('participant') && !roles.includes('admin') && !roles.includes('coach');
    });

    // Get assessment results for all participants
    const participantIds = participants.map(p => p.id);
    const assessmentResults = await prisma.assessmentResult.findMany({
      where: {
        userId: {
          in: participantIds
        }
      },
      select: {
        id: true,
        userId: true,
        assessmentType: true,
        completedAt: true,
        overallScore: true,
      }
    });

    // Calculate statistics
    const totalParticipants = participants.length;
    const participantsWithCoach = participants.filter(p => p.hasCoach).length;
    const totalAssessments = assessmentResults.length;
    const completedAssessments = assessmentResults.filter(a => a.completedAt !== null).length;
    
    // Group assessments by type
    const assessmentsByType = assessmentResults.reduce((acc, result) => {
      acc[result.assessmentType] = (acc[result.assessmentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average scores
    const scores = assessmentResults
      .filter(a => a.overallScore !== null)
      .map(a => a.overallScore!);
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return NextResponse.json({
      stats: {
        totalParticipants,
        participantsWithCoach,
        totalAssessments,
        completedAssessments,
        averageScore: Math.round(averageScore),
        assessmentsByType,
      },
      participants: participants.slice(0, 10), // Return first 10 for preview
    });
  } catch (error) {
    console.error('Error fetching coach stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach statistics' },
      { status: 500 }
    );
  }
}

