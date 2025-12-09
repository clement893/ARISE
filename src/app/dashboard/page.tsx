'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import FeedbackBanner from '@/components/dashboard/FeedbackBanner';
import ProgressCard from '@/components/dashboard/ProgressCard';
import EvaluationCard from '@/components/dashboard/EvaluationCard';
import CoachingCTA from '@/components/dashboard/CoachingCTA';
import { Brain, Users, MessageSquare, Heart } from 'lucide-react';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  plan?: string;
}

interface AssessmentSummary {
  tki: {
    dominantResult: string;
    overallScore: number;
    completedAt: string;
  } | null;
  wellness: {
    dominantResult: string;
    overallScore: number;
    completedAt: string;
  } | null;
  self_360: {
    dominantResult: string;
    overallScore: number;
    completedAt: string;
  } | null;
  mbti: {
    dominantResult: string;
    overallScore: number;
    completedAt: string;
  } | null;
  completedCount: number;
  totalAssessments: number;
  overallProgress: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary | null>(null);

  useEffect(() => {
    // Check for user in localStorage (from signup flow)
    const storedUser = localStorage.getItem('arise_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Fetch assessment results
        fetchAssessments(userData.id);
      } catch {
        // Invalid data, redirect to login
        router.push('/signup');
      }
    } else {
      // No user, redirect to signup
      router.push('/signup');
    }
    setLoading(false);
  }, [router]);

  const fetchAssessments = async (userId: number) => {
    try {
      const response = await fetch('/api/assessments', {
        headers: {
          'x-user-id': userId.toString(),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAssessmentSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D5C5C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A84B]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Calculate progress based on actual assessment results
  const getAssessmentStatus = (type: 'tki' | 'wellness' | 'self_360' | 'mbti') => {
    if (!assessmentSummary) return 'not_started';
    const result = assessmentSummary[type];
    return result ? 'completed' : 'not_started';
  };

  const getProgressPercentage = (type: 'tki' | 'wellness' | 'self_360' | 'mbti') => {
    if (!assessmentSummary) return 0;
    const result = assessmentSummary[type];
    return result ? 100 : 0;
  };

  const progressItems = [
    { label: 'MBTI', percentage: getProgressPercentage('mbti') },
    { label: 'TKI', percentage: getProgressPercentage('tki') },
    { label: '360° Feedback', percentage: getProgressPercentage('self_360') },
    { label: 'Wellness', percentage: getProgressPercentage('wellness'), showAdd: getProgressPercentage('wellness') === 0 },
  ];

  const totalProgress = assessmentSummary?.overallProgress || 0;

  // Get result display text
  const getTKIResult = () => {
    if (assessmentSummary?.tki) {
      return `Style: ${assessmentSummary.tki.dominantResult}`;
    }
    return 'Explore Your Conflict Management Approach';
  };

  const getWellnessResult = () => {
    if (assessmentSummary?.wellness) {
      return `Light Score: ${assessmentSummary.wellness.overallScore}%`;
    }
    return 'Assess Your Holistic Well-Being';
  };

  const get360Result = () => {
    if (assessmentSummary?.self_360) {
      return `Self Rating: ${assessmentSummary.self_360.dominantResult}`;
    }
    return 'Multi-Faceted Leadership Perspectives';
  };

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome <span className="text-[#0D5C5C]">{user.firstName || 'User'}</span>
          </h1>
          <p className="text-gray-600">Continue your journey to authentic leadership</p>
        </div>

        {/* Feedback Banner */}
        <div className="mb-6">
          <FeedbackBanner onAddEvaluators={() => router.push('/dashboard/360-self')} />
        </div>

        {/* Progress Card */}
        <div className="mb-8">
          <ProgressCard totalProgress={totalProgress} items={progressItems} />
        </div>

        {/* Your Evaluations */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your evaluations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <EvaluationCard
              icon={<Brain className="w-6 h-6" />}
              title="MBTI Personality"
              description="Understanding your natural preferences"
              status={getAssessmentStatus('mbti')}
              badge="External link"
              badgeColor="bg-gray-100 text-gray-600"
            />
            <EvaluationCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="TKI Conflict Style"
              description={getTKIResult()}
              status={getAssessmentStatus('tki')}
              badge="ARISE Platform"
              badgeColor="bg-[#0D5C5C]/10 text-[#0D5C5C]"
              onAction={() => router.push('/dashboard/tki')}
            />
            <EvaluationCard
              icon={<Users className="w-6 h-6" />}
              title="360° Feedback"
              description={get360Result()}
              status={getAssessmentStatus('self_360')}
              badge="ARISE Platform"
              badgeColor="bg-[#0D5C5C]/10 text-[#0D5C5C]"
              onAction={() => router.push('/dashboard/360-self')}
            />
            <EvaluationCard
              icon={<Heart className="w-6 h-6" />}
              title="Wellness"
              description={getWellnessResult()}
              status={getAssessmentStatus('wellness')}
              onAction={() => router.push('/dashboard/wellness')}
            />
          </div>
        </div>

        {/* Coaching CTA */}
        <CoachingCTA />
      </main>
    </div>
  );
}
