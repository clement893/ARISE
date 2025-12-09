import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendFeedbackCompletedEmail, sendEvaluatorThankYouEmail } from '@/lib/sendgrid';

// POST - Submit feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { answers } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Find evaluator
    const evaluator = await prisma.evaluator.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
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

    if (evaluator.status === 'completed') {
      return NextResponse.json(
        { error: 'Feedback has already been submitted' },
        { status: 400 }
      );
    }

    // Calculate scores by category
    const categories = ['Communication', 'Team Culture', 'Leadership Style', 'Change Management', 'Problem Solving', 'Stress Management'];
    const questionsPerCategory = 5;
    const scores: Record<string, number> = {};
    
    categories.forEach((category, index) => {
      const startId = index * questionsPerCategory + 1;
      const endId = startId + questionsPerCategory;
      let total = 0;
      let count = 0;
      
      for (let id = startId; id < endId; id++) {
        if (answers[id]) {
          total += answers[id];
          count++;
        }
      }
      
      scores[category] = count > 0 ? Math.round((total / count) * 20) : 0; // Convert to percentage (1-5 scale to 0-100)
    });

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(scores).reduce((a, b) => a + b, 0) / categories.length
    );

    // Update evaluator with feedback
    await prisma.evaluator.update({
      where: { id: evaluator.id },
      data: {
        status: 'completed',
        feedbackAnswers: answers,
        feedbackScores: { ...scores, overall: overallScore },
        completedAt: new Date(),
      },
    });

    const userName = `${evaluator.user.firstName || ''} ${evaluator.user.lastName || ''}`.trim() || 'User';
    
    const relationshipLabels: Record<string, string> = {
      manager: 'Manager / Supervisor',
      peer: 'Peer / Colleague',
      direct_report: 'Direct Report',
      other: 'Professional Contact',
    };

    // Send confirmation emails (non-blocking)
    Promise.all([
      // Notify user that feedback was received
      sendFeedbackCompletedEmail({
        userEmail: evaluator.user.email,
        userName,
        evaluatorName: evaluator.name,
        relationship: relationshipLabels[evaluator.relationship] || evaluator.relationship,
      }),
      // Thank the evaluator
      sendEvaluatorThankYouEmail({
        evaluatorEmail: evaluator.email,
        evaluatorName: evaluator.name,
        userName,
      }),
    ]).catch(err => console.error('Failed to send feedback completion emails:', err));

    return NextResponse.json({
      message: 'Feedback submitted successfully',
      scores,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
