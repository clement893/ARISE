'use client';

import { Info } from 'lucide-react';

interface FeedbackBannerProps {
  onAddEvaluators?: () => void;
}

export default function FeedbackBanner({ onAddEvaluators }: FeedbackBannerProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#e8f4f4] rounded-full flex items-center justify-center">
          <Info className="w-5 h-5 text-[#0D5C5C]" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">Add Your 360° Feedback Evaluators</h4>
          <p className="text-sm text-gray-500">
            Get comprehensive feedback by inviting colleagues to evaluate your leadership.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4A84B] to-[#c49a42] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <span className="text-gray-500 text-lg">👤</span>
          </div>
        </div>
        <button
          onClick={onAddEvaluators}
          className="px-4 py-2 bg-[#0D5C5C] text-white rounded-lg text-sm font-medium hover:bg-[#0a4a4a] transition-colors"
        >
          Add evaluators
        </button>
      </div>
    </div>
  );
}
