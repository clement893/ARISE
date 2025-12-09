'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  GripVertical,
  Save,
  X
} from 'lucide-react';

interface Assessment {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  duration: number;
  isActive: boolean;
  icon: string;
}

interface Question {
  id: string;
  text: string;
  category: string;
  order: number;
}

const defaultAssessments: Assessment[] = [
  {
    id: 'tki',
    name: 'TKI Conflict Style',
    description: 'Conflict resolution assessment',
    questionCount: 30,
    duration: 15,
    isActive: true,
    icon: '🎯'
  },
  {
    id: '360',
    name: '360° Feedback',
    description: 'Multi-rater feedback assessment',
    questionCount: 30,
    duration: 15,
    isActive: true,
    icon: '🔄'
  },
  {
    id: 'wellness',
    name: 'Wellness',
    description: 'Holistic well-being evaluation',
    questionCount: 30,
    duration: 15,
    isActive: true,
    icon: '🌿'
  }
];

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>(defaultAssessments);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(defaultAssessments[2]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    duration: 15,
    questionCount: 0,
    isActive: true
  });
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: '', category: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedAssessment) {
      loadQuestions(selectedAssessment.id);
      setEditForm({
        name: selectedAssessment.name,
        description: selectedAssessment.description,
        duration: selectedAssessment.duration,
        questionCount: selectedAssessment.questionCount,
        isActive: selectedAssessment.isActive
      });
    }
  }, [selectedAssessment]);

  const loadQuestions = async (assessmentId: string) => {
    try {
      const response = await fetch(`/api/admin/assessments/${assessmentId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedAssessment) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/assessments/${selectedAssessment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        // Update local state
        setAssessments(prev => prev.map(a => 
          a.id === selectedAssessment.id 
            ? { ...a, ...editForm }
            : a
        ));
        setSelectedAssessment(prev => prev ? { ...prev, ...editForm } : null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
    setIsSaving(false);
  };

  const handleAddQuestion = async () => {
    if (!selectedAssessment || !newQuestion.text) return;
    
    try {
      const response = await fetch(`/api/admin/assessments/${selectedAssessment.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newQuestion.text,
          category: newQuestion.category,
          order: questions.length + 1
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(prev => [...prev, data.question]);
        setNewQuestion({ text: '', category: '' });
        setShowAddQuestion(false);
      }
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedAssessment) return;
    
    try {
      const response = await fetch(`/api/admin/assessments/${selectedAssessment.id}/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assessment Configuration</h1>
        <p className="text-gray-500">Configure questions for all assessments</p>
      </div>

      <div className="flex gap-8">
        {/* Left Panel - Assessment List */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {assessments.map((assessment) => (
              <button
                key={assessment.id}
                onClick={() => setSelectedAssessment(assessment)}
                className={`w-full p-4 flex items-center gap-4 border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedAssessment?.id === assessment.id
                    ? 'bg-[#0D5C5C] text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  selectedAssessment?.id === assessment.id
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                }`}>
                  {assessment.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${
                    selectedAssessment?.id === assessment.id ? 'text-white' : 'text-gray-900'
                  }`}>
                    {assessment.name}
                  </p>
                  <p className={`text-sm ${
                    selectedAssessment?.id === assessment.id ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {assessment.questionCount} questions
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedAssessment?.id === assessment.id
                    ? 'bg-white/20 text-white'
                    : 'bg-[#0D5C5C] text-white'
                }`}>
                  MBTI
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Assessment Details */}
        <div className="flex-1">
          {selectedAssessment ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Assessment Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedAssessment.name}</h2>
                    <p className="text-gray-500">{selectedAssessment.description}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Settings
                  </button>
                </div>

                {/* Settings Form */}
                {isEditing && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={editForm.duration}
                          onChange={(e) => setEditForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Questions
                        </label>
                        <input
                          type="number"
                          value={editForm.questionCount}
                          onChange={(e) => setEditForm(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 text-[#0D5C5C] rounded focus:ring-[#0D5C5C]"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSettings}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0D5C5C] text-white rounded-lg hover:bg-[#0a4a4a] disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Questions Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                    <p className="text-sm text-gray-500">Manage assessment questions and their properties</p>
                  </div>
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#D4A84B] text-white rounded-lg hover:bg-[#c49a42]"
                  >
                    <Plus className="w-4 h-4" />
                    Add question
                  </button>
                </div>

                {/* Add Question Form */}
                {showAddQuestion && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">New Question</h4>
                      <button onClick={() => setShowAddQuestion(false)}>
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Question text..."
                        value={newQuestion.text}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                      />
                      <input
                        type="text"
                        placeholder="Category (e.g., Communication, Leadership)"
                        value={newQuestion.category}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D5C5C]"
                      />
                      <button
                        onClick={handleAddQuestion}
                        className="w-full px-4 py-2 bg-[#0D5C5C] text-white rounded-lg hover:bg-[#0a4a4a]"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                {questions.length > 0 ? (
                  <div className="space-y-2">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg group"
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                        <span className="w-8 h-8 rounded-full bg-[#0D5C5C] text-white flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-900">{question.text}</p>
                          {question.category && (
                            <p className="text-sm text-gray-500">{question.category}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No questions configured.</p>
                    <p className="text-sm text-gray-400">Click &apos;Add Question&apos; to get started</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500">Select an assessment to configure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
