'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/dashboard/Sidebar';
import { Brain, Users, MessageSquare, Heart, Info, ExternalLink } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

interface Assessment {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'in-progress' | 'not-started';
  tags: { label: string; type: 'external' | 'platform' | 'info' }[];
  actionLabel: string;
  actionType: 'view' | 'continue' | 'review' | 'add' | 'start';
  hasEvaluatorNotice?: boolean;
}

export default function AssessmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('arise_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const assessments: Assessment[] = [
    {
      id: 'mbti',
      name: 'MBTI Personality',
      description: 'Understanding your natural preferences',
      icon: <Brain className="w-6 h-6 text-[#0D5C5C]" />,
      status: 'completed',
      tags: [
        { label: 'External link', type: 'external' },
      ],
      actionLabel: 'Retrieve my score',
      actionType: 'view',
    },
    {
      id: 'tki',
      name: 'TKI Conflict Style',
      description: 'Explore your conflict management approach',
      icon: <MessageSquare className="w-6 h-6 text-[#0D5C5C]" />,
      status: 'completed',
      tags: [
        { label: 'External link', type: 'external' },
      ],
      actionLabel: 'Review',
      actionType: 'review',
    },
    {
      id: '360-feedback',
      name: '360° Feedback',
      description: 'Multi-faceted leadership perspectives',
      icon: <Users className="w-6 h-6 text-[#0D5C5C]" />,
      status: 'in-progress',
      tags: [
        { label: 'ARISE Platform', type: 'platform' },
      ],
      actionLabel: 'Continue',
      actionType: 'continue',
      hasEvaluatorNotice: true,
    },
    {
      id: 'wellness',
      name: 'Wellness',
      description: 'Assess your holistic Well-Being',
      icon: <Heart className="w-6 h-6 text-[#0D5C5C]" />,
      status: 'not-started',
      tags: [
        { label: 'ARISE Platform', type: 'platform' },
      ],
      actionLabel: 'Start',
      actionType: 'start',
    },
  ];

  const getStatusBadge = (status: Assessment['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#0D5C5C] text-white">
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#D4A84B] text-white">
            In progress
          </span>
        );
      case 'not-started':
        return (
          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
            Not Started
          </span>
        );
    }
  };

  const getTagBadge = (tag: Assessment['tags'][0]) => {
    switch (tag.type) {
      case 'external':
        return (
          <span key={tag.label} className="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-600 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {tag.label}
          </span>
        );
      case 'platform':
        return (
          <span key={tag.label} className="px-3 py-1 text-xs font-medium rounded-full bg-[#0D5C5C]/10 text-[#0D5C5C]">
            {tag.label}
          </span>
        );
      default:
        return (
          <span key={tag.label} className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            {tag.label}
          </span>
        );
    }
  };

  const getActionButton = (assessment: Assessment) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-lg transition-colors";
    
    switch (assessment.actionType) {
      case 'view':
        return (
          <button className={`${baseClasses} border border-[#0D5C5C] text-[#0D5C5C] hover:bg-[#0D5C5C] hover:text-white`}>
            {assessment.actionLabel}
          </button>
        );
      case 'review':
        return (
          <button className={`${baseClasses} border border-[#0D5C5C] text-[#0D5C5C] hover:bg-[#0D5C5C] hover:text-white`}>
            {assessment.actionLabel}
          </button>
        );
      case 'continue':
        return (
          <button className={`${baseClasses} bg-[#0D5C5C] text-white hover:bg-[#0a4a4a]`}>
            {assessment.actionLabel}
          </button>
        );
      case 'add':
        return (
          <button className={`${baseClasses} border border-gray-300 text-gray-600 hover:bg-gray-100`}>
            {assessment.actionLabel}
          </button>
        );
      case 'start':
        return (
          <button className={`${baseClasses} bg-[#D4A84B] text-white hover:bg-[#c49a42]`}>
            {assessment.actionLabel}
          </button>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D5C5C]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar user={user} activePage="assessments" />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0D5C5C]">Your assessments</h1>
            <p className="text-gray-600">Track and manage your leadership assessments</p>
          </div>

          {/* Assessments List */}
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id}>
                {/* Assessment Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {assessment.icon}
                      </div>
                      
                      {/* Content */}
                      <div>
                        <h3 className="font-semibold text-gray-900">{assessment.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{assessment.description}</p>
                        
                        {/* Tags */}
                        <div className="flex items-center gap-2 mt-3">
                          {getStatusBadge(assessment.status)}
                          {assessment.tags.map((tag) => getTagBadge(tag))}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {getActionButton(assessment)}
                    </div>
                  </div>
                </div>

                {/* Evaluator Notice (for 360° Feedback) */}
                {assessment.hasEvaluatorNotice && (
                  <div className="mt-2 bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Add your evaluators before starting this assessment.
                      </span>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">
                      Add
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Assessment Card (Wellness when not started) */}
            <div className="bg-[#0D5C5C] rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Wellness</h3>
                  <p className="text-sm text-white/70">Assess your holistic Well-Being</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 text-sm font-medium rounded-lg bg-[#D4A84B] text-white hover:bg-[#c49a42] transition-colors flex items-center gap-2">
                  <span>Add the assessment</span>
                </button>
                <button className="px-4 py-2 text-sm font-medium rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
