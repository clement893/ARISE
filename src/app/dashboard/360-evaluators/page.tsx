'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, Users, Mail, Plus, X, Send, UserPlus, Briefcase, UserCheck, ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

interface Evaluator {
  id: string;
  name: string;
  email: string;
  relationship: 'manager' | 'peer' | 'direct_report' | 'other';
  status: 'pending' | 'sent' | 'completed';
}

const relationshipOptions = [
  { value: 'manager', label: 'Manager / Supervisor', icon: Briefcase, description: 'Your direct manager or supervisor' },
  { value: 'peer', label: 'Peer / Colleague', icon: Users, description: 'Colleagues at the same level' },
  { value: 'direct_report', label: 'Direct Report', icon: UserCheck, description: 'People who report to you' },
  { value: 'other', label: 'Other', icon: UserPlus, description: 'Other professional contacts' },
];

export default function AddEvaluatorsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvaluator, setNewEvaluator] = useState({ name: '', email: '', relationship: 'peer' as const });
  const [sendingInvites, setSendingInvites] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('arise_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Load saved evaluators from localStorage
    const savedEvaluators = localStorage.getItem(`arise_evaluators_${parsedUser.id}`);
    if (savedEvaluators) {
      setEvaluators(JSON.parse(savedEvaluators));
    }
    
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  const handleAddEvaluator = () => {
    if (!newEvaluator.name || !newEvaluator.email) return;
    
    const evaluator: Evaluator = {
      id: Date.now().toString(),
      name: newEvaluator.name,
      email: newEvaluator.email,
      relationship: newEvaluator.relationship,
      status: 'pending',
    };
    
    const updatedEvaluators = [...evaluators, evaluator];
    setEvaluators(updatedEvaluators);
    
    // Save to localStorage
    if (user) {
      localStorage.setItem(`arise_evaluators_${user.id}`, JSON.stringify(updatedEvaluators));
    }
    
    setNewEvaluator({ name: '', email: '', relationship: 'peer' });
    setShowAddForm(false);
  };

  const handleRemoveEvaluator = (id: string) => {
    const updatedEvaluators = evaluators.filter(e => e.id !== id);
    setEvaluators(updatedEvaluators);
    
    if (user) {
      localStorage.setItem(`arise_evaluators_${user.id}`, JSON.stringify(updatedEvaluators));
    }
  };

  const handleSendInvites = async () => {
    setSendingInvites(true);
    
    // Simulate sending invites
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedEvaluators = evaluators.map(e => ({
      ...e,
      status: e.status === 'pending' ? 'sent' as const : e.status,
    }));
    
    setEvaluators(updatedEvaluators);
    
    if (user) {
      localStorage.setItem(`arise_evaluators_${user.id}`, JSON.stringify(updatedEvaluators));
    }
    
    setSendingInvites(false);
    setSuccessMessage('Invitations sent successfully! Your evaluators will receive an email with instructions.');
    
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const getRelationshipIcon = (relationship: string) => {
    const option = relationshipOptions.find(o => o.value === relationship);
    return option ? option.icon : Users;
  };

  const getRelationshipLabel = (relationship: string) => {
    const option = relationshipOptions.find(o => o.value === relationship);
    return option ? option.label : relationship;
  };

  const getStatusBadge = (status: Evaluator['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Pending</span>;
      case 'sent':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">Invited</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Completed</span>;
    }
  };

  const pendingCount = evaluators.filter(e => e.status === 'pending').length;
  const sentCount = evaluators.filter(e => e.status === 'sent').length;
  const completedCount = evaluators.filter(e => e.status === 'completed').length;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0D5C5C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A84B]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} onLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add 360° Evaluators</h1>
              <p className="text-gray-600">Invite colleagues to provide feedback on your leadership</p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#0D5C5C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-[#0D5C5C]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Why 360° Feedback?</h2>
                <p className="text-sm text-gray-600 mb-3">
                  360° feedback provides a comprehensive view of your leadership by gathering perspectives from people who work with you at different levels. This multi-source feedback helps identify blind spots and strengths you might not see yourself.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#0D5C5C]" />
                    <span className="text-gray-600">1-2 Managers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0D5C5C]" />
                    <span className="text-gray-600">3-5 Peers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#0D5C5C]" />
                    <span className="text-gray-600">2-4 Direct Reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {evaluators.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-gray-400">{pendingCount}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-blue-500">{sentCount}</p>
                <p className="text-sm text-gray-500">Invited</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-green-500">{completedCount}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          )}

          {/* Evaluators List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Your Evaluators ({evaluators.length})</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#0D5C5C] text-white rounded-lg text-sm font-medium hover:bg-[#0a4a4a] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Evaluator
              </button>
            </div>

            {evaluators.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No evaluators added yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Add colleagues, managers, and direct reports to get comprehensive feedback
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-[#0D5C5C] text-white rounded-lg text-sm font-medium hover:bg-[#0a4a4a] transition-colors"
                >
                  Add your first evaluator
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {evaluators.map((evaluator) => {
                  const Icon = getRelationshipIcon(evaluator.relationship);
                  return (
                    <div key={evaluator.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#0D5C5C]/10 rounded-full flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#0D5C5C]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{evaluator.name}</p>
                          <p className="text-sm text-gray-500">{evaluator.email}</p>
                          <p className="text-xs text-gray-400">{getRelationshipLabel(evaluator.relationship)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(evaluator.status)}
                        {evaluator.status === 'pending' && (
                          <button
                            onClick={() => handleRemoveEvaluator(evaluator.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Send Invites Button */}
          {pendingCount > 0 && (
            <button
              onClick={handleSendInvites}
              disabled={sendingInvites}
              className="w-full py-3 bg-[#D4A84B] text-white rounded-xl font-semibold hover:bg-[#c49a42] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sendingInvites ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending invitations...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send {pendingCount} invitation{pendingCount > 1 ? 's' : ''}
                </>
              )}
            </button>
          )}

          {/* Note */}
          <div className="mt-6 p-4 bg-[#0D5C5C]/5 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#0D5C5C] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Important</p>
              <p>
                We recommend completing your self-assessment before your evaluators submit their feedback. 
                This allows for a more meaningful comparison between your self-perception and others' perspectives.
              </p>
              <button
                onClick={() => router.push('/dashboard/360-self')}
                className="mt-2 text-[#0D5C5C] font-medium hover:underline"
              >
                Start self-assessment →
              </button>
            </div>
          </div>
        </div>

        {/* Add Evaluator Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Evaluator</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newEvaluator.name}
                    onChange={(e) => setNewEvaluator({ ...newEvaluator, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5C5C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEvaluator.email}
                    onChange={(e) => setNewEvaluator({ ...newEvaluator, email: e.target.value })}
                    placeholder="john.doe@company.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D5C5C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <div className="grid grid-cols-2 gap-2">
                    {relationshipOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setNewEvaluator({ ...newEvaluator, relationship: option.value as any })}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            newEvaluator.relationship === option.value
                              ? 'border-[#0D5C5C] bg-[#0D5C5C]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-1 ${
                            newEvaluator.relationship === option.value ? 'text-[#0D5C5C]' : 'text-gray-400'
                          }`} />
                          <p className={`text-sm font-medium ${
                            newEvaluator.relationship === option.value ? 'text-[#0D5C5C]' : 'text-gray-700'
                          }`}>
                            {option.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvaluator}
                  disabled={!newEvaluator.name || !newEvaluator.email}
                  className="flex-1 py-2 bg-[#0D5C5C] text-white rounded-lg font-medium hover:bg-[#0a4a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Evaluator
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
