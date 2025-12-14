'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, LoadingPage } from '@/components/ui';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { authenticatedFetch } from '@/lib/token-refresh';
import { generateLeadershipReport } from '@/lib/generateReport';

interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

type MBTIType = 'ENFJ' | 'ENFP' | 'ENTJ' | 'ENTP' | 'ESFJ' | 'ESFP' | 'ESTJ' | 'ESTP' | 'INFJ' | 'INFP' | 'INTJ' | 'INTP' | 'ISFJ' | 'ISFP' | 'ISTJ' | 'ISTP';

const mbtiDescriptions: Record<MBTIType, { name: string; description: string; strengths: string[]; developmentAreas: string[] }> = {
  'ENFJ': {
    name: 'The Protagonist',
    description: 'ENFJs are natural-born leaders, full of passion and charisma. They are able to inspire others to achieve and to do good in the world.',
    strengths: ['Natural leadership abilities', 'Strong communication skills', 'Empathetic and understanding', 'Organized and decisive'],
    developmentAreas: ['Avoid taking on too much responsibility', 'Learn to say no', 'Take time for self-reflection', 'Balance idealism with realism']
  },
  'ENFP': {
    name: 'The Campaigner',
    description: 'ENFPs are enthusiastic, creative, and sociable free spirits. They are always ready to explore new possibilities and connect with others.',
    strengths: ['Creative and innovative', 'Enthusiastic and energetic', 'Excellent communication', 'Open-minded and flexible'],
    developmentAreas: ['Focus on follow-through', 'Develop time management skills', 'Learn to handle criticism', 'Balance spontaneity with planning']
  },
  'ENTJ': {
    name: 'The Commander',
    description: 'ENTJs are strategic leaders, motivated to organize change. They are quick to see inefficiency and conceptualize new solutions.',
    strengths: ['Natural strategic thinking', 'Strong leadership skills', 'Decisive and confident', 'Excellent at planning'],
    developmentAreas: ['Practice active listening', 'Consider emotional factors', 'Learn to delegate effectively', 'Balance work and personal life']
  },
  'ENTP': {
    name: 'The Debater',
    description: 'ENTPs are smart and curious thinkers who cannot resist an intellectual challenge. They are quick-witted and enjoy debating ideas.',
    strengths: ['Quick thinking and adaptable', 'Excellent problem-solving', 'Charismatic and energetic', 'Innovative and creative'],
    developmentAreas: ['Follow through on commitments', 'Develop emotional intelligence', 'Learn to focus', 'Balance debate with listening']
  },
  'ESFJ': {
    name: 'The Consul',
    description: 'ESFJs are extraverted, caring, and social people, always eager to help. They are practical and focused on creating harmony.',
    strengths: ['Strong practical skills', 'Loyal and reliable', 'Good at organizing', 'Caring and supportive'],
    developmentAreas: ['Learn to handle conflict', 'Avoid overcommitting', 'Take time for self-care', 'Develop assertiveness']
  },
  'ESFP': {
    name: 'The Entertainer',
    description: 'ESFPs are spontaneous, energetic, and enthusiastic people who love life and live it to the fullest. They are the life of the party.',
    strengths: ['Bold and practical', 'Original and aesthetic', 'Showmanship', 'Practical and observant'],
    developmentAreas: ['Plan for the future', 'Develop long-term thinking', 'Learn to handle routine', 'Balance fun with responsibility']
  },
  'ESTJ': {
    name: 'The Executive',
    description: 'ESTJs are organized, practical, and dedicated. They are natural-born leaders who excel at managing people and projects.',
    strengths: ['Strong organizational skills', 'Direct and honest', 'Dedicated and responsible', 'Excellent at planning'],
    developmentAreas: ['Develop emotional intelligence', 'Be open to new ideas', 'Learn to relax', 'Consider others\' feelings']
  },
  'ESTP': {
    name: 'The Entrepreneur',
    description: 'ESTPs are smart, energetic, and perceptive people who are keenly aware of their environment. They are action-oriented risk-takers.',
    strengths: ['Bold and practical', 'Original and perceptive', 'Direct and sociable', 'Rational and practical'],
    developmentAreas: ['Think before acting', 'Consider long-term consequences', 'Develop patience', 'Learn to plan ahead']
  },
  'INFJ': {
    name: 'The Advocate',
    description: 'INFJs are creative, insightful, and principled individuals with a strong sense of personal integrity. They are driven by their values.',
    strengths: ['Creative and insightful', 'Inspiring and convincing', 'Decisive and determined', 'Passionate and altruistic'],
    developmentAreas: ['Avoid perfectionism', 'Learn to say no', 'Take care of yourself', 'Share your thoughts with others']
  },
  'INFP': {
    name: 'The Mediator',
    description: 'INFPs are poetic, kind, and altruistic people, always eager to help a good cause. They are guided by their values and seek harmony.',
    strengths: ['Idealistic and principled', 'Loyal and committed', 'Open-minded and flexible', 'Creative and passionate'],
    developmentAreas: ['Be more assertive', 'Focus on practical matters', 'Avoid overthinking', 'Set boundaries']
  },
  'INTJ': {
    name: 'The Architect',
    description: 'INTJs are imaginative and strategic thinkers, with a plan for everything. They are independent and determined individuals.',
    strengths: ['Strategic thinking', 'Independent and decisive', 'Self-confident', 'Hard-working and determined'],
    developmentAreas: ['Develop social skills', 'Express appreciation', 'Be patient with others', 'Consider emotional factors']
  },
  'INTP': {
    name: 'The Thinker',
    description: 'INTPs are innovative inventors with an unquenchable thirst for knowledge. They are logical and objective thinkers.',
    strengths: ['Analytical and objective', 'Abstract thinking', 'Independent and original', 'Honest and straightforward'],
    developmentAreas: ['Develop social skills', 'Express emotions', 'Follow through on projects', 'Be more organized']
  },
  'ISFJ': {
    name: 'The Protector',
    description: 'ISFJs are very dedicated and warm protectors, always ready to defend their loved ones. They are practical and responsible.',
    strengths: ['Supportive and reliable', 'Patient and practical', 'Imaginative and observant', 'Enthusiastic and loyal'],
    developmentAreas: ['Learn to say no', 'Take breaks', 'Express your needs', 'Avoid overcommitting']
  },
  'ISFP': {
    name: 'The Adventurer',
    description: 'ISFPs are flexible and charming artists, always ready to explore new possibilities. They are practical and spontaneous.',
    strengths: ['Bold and practical', 'Aesthetic and artistic', 'Flexible and laid-back', 'Sensitive to others'],
    developmentAreas: ['Plan for the future', 'Develop assertiveness', 'Avoid conflict avoidance', 'Set long-term goals']
  },
  'ISTJ': {
    name: 'The Logistician',
    description: 'ISTJs are practical and fact-minded individuals, reliable and responsible. They are thorough and systematic.',
    strengths: ['Honest and direct', 'Strong-willed and dutiful', 'Very responsible', 'Calm and practical'],
    developmentAreas: ['Be open to new ideas', 'Express emotions', 'Learn to relax', 'Consider different perspectives']
  },
  'ISTP': {
    name: 'The Virtuoso',
    description: 'ISTPs are bold and practical experimenters, masters of all kinds of tools. They are independent and practical problem-solvers.',
    strengths: ['Optimistic and creative', 'Practical and original', 'Spontaneous and rational', 'Know how to prioritize'],
    developmentAreas: ['Develop emotional intelligence', 'Follow through on commitments', 'Consider long-term consequences', 'Express your feelings']
  }
};

export default function MBTIDetailedResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mbtiResult, setMbtiResult] = useState<any>(null);

  const fetchMBTIResults = useCallback(async () => {
    try {
      const response = await authenticatedFetch('/api/assessments?type=mbti');
      
      if (response.ok) {
        const data = await response.json();
        const mbtiAssessment = data.assessments?.find((a: any) => a.assessmentType === 'mbti');
        if (mbtiAssessment) {
          setMbtiResult(mbtiAssessment);
        }
      }
    } catch (error) {
      console.error('Failed to fetch MBTI results:', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      const storedUser = localStorage.getItem('arise_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (isMounted) {
            setUser(userData);
            await fetchMBTIResults();
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          if (isMounted) {
            router.push('/signup');
          }
          return;
        }
      } else {
        if (isMounted) {
          router.push('/signup');
        }
        return;
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchMBTIResults, router]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My MBTI Personality Results',
          text: `My MBTI personality type is ${mbtiType}. Check out my ARISE leadership assessment results!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
        alert('Please copy this link manually: ' + window.location.href);
      }
    }
  };

  const handleDownloadPDF = () => {
    if (!user || !mbtiResult) return;
    
    generateLeadershipReport(
      { firstName: user.firstName || '', lastName: user.lastName || '', email: user.email },
      {
        mbti: {
          dominantResult: mbtiType,
          overallScore: 100,
          completedAt: mbtiResult.completedAt,
        }
      }
    );
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || !mbtiResult || !mbtiResult.dominantResult) {
    return (
      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">No MBTI Results Found</h2>
          <p className="text-gray-600 mb-6">You haven't completed the MBTI assessment yet.</p>
          <Button onClick={() => router.push('/dashboard/assessments')} fullWidth>
            Upload MBTI Results
          </Button>
        </Card>
      </main>
    );
  }

  const mbtiType = mbtiResult.dominantResult as MBTIType;
  const typeInfo = mbtiDescriptions[mbtiType];

  if (!typeInfo) {
    return (
      <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Invalid MBTI Type</h2>
          <p className="text-gray-600 mb-6">The MBTI type "{mbtiType}" is not recognized.</p>
          <Button onClick={() => router.push('/dashboard/results')} fullWidth>
            Back to Results
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 overflow-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/results')}
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Back to Results
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">MBTI Personality - Detailed Results</h1>
            <p className="text-sm sm:text-base text-gray-600">Myers-Briggs Type Indicator</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            leftIcon={<Share2 className="w-4 h-4" />}
            onClick={handleShare}
            className="w-full sm:w-auto"
          >
            Share
          </Button>
          <Button 
            variant="secondary" 
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto"
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* MBTI Type Card */}
      <Card className="mb-4 sm:mb-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0 bg-primary-500"
          >
            {mbtiType}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your MBTI Type: {mbtiType}</h2>
              <span className="px-2 sm:px-3 py-1 bg-primary-500 text-white text-xs sm:text-sm rounded-full font-medium self-start sm:self-auto">
                {typeInfo.name}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{typeInfo.description}</p>
          </div>
        </div>
      </Card>

      {/* Strengths */}
      <Card className="mb-4 sm:mb-6 p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Key Strengths</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {typeInfo.strengths.map((strength, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">✓</span>
              <span className="text-gray-700">{strength}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Development Areas */}
      <Card className="mb-6 p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Development Areas</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {typeInfo.developmentAreas.map((area, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-secondary-500 mt-1">→</span>
              <span className="text-gray-700">{area}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* MBTI Dimensions */}
      <Card className="mb-6 p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Your MBTI Dimensions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Energy</div>
            <div className="text-lg font-bold text-gray-900">
              {mbtiType[0] === 'E' ? 'Extraversion' : 'Introversion'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {mbtiType[0] === 'E' 
                ? 'You gain energy from external interactions' 
                : 'You gain energy from internal reflection'}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Information</div>
            <div className="text-lg font-bold text-gray-900">
              {mbtiType[1] === 'N' ? 'Intuition' : 'Sensing'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {mbtiType[1] === 'N' 
                ? 'You focus on patterns and possibilities' 
                : 'You focus on facts and details'}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Decisions</div>
            <div className="text-lg font-bold text-gray-900">
              {mbtiType[2] === 'F' ? 'Feeling' : 'Thinking'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {mbtiType[2] === 'F' 
                ? 'You make decisions based on values' 
                : 'You make decisions based on logic'}
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Structure</div>
            <div className="text-lg font-bold text-gray-900">
              {mbtiType[3] === 'J' ? 'Judging' : 'Perceiving'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {mbtiType[3] === 'J' 
                ? 'You prefer structure and planning' 
                : 'You prefer flexibility and spontaneity'}
            </div>
          </div>
        </div>
      </Card>

      {/* Completion Date */}
      <Card className="p-6">
        <div className="text-sm text-gray-600">
          Assessment completed: {new Date(mbtiResult.completedAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </Card>
    </main>
  );
}

