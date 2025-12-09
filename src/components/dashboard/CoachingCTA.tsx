'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CoachingCTA() {
  const router = useRouter();

  const handleExploreCoaching = () => {
    // Navigate to results page where coaching modal is available
    router.push('/dashboard/results');
  };

  return (
    <div className="bg-[#0D5C5C] rounded-2xl p-8 flex items-center justify-between overflow-hidden relative">
      {/* Content */}
      <div className="relative z-10 max-w-lg">
        <h3 className="text-2xl font-bold text-white mb-3">
          Ready to accelerate your growth?
        </h3>
        <p className="text-white/80 text-sm mb-6">
          Connect with expert ARISE coaches who specialize in leadership development. 
          Schedule your FREE coaching session to debrief your results and build a 
          personalized development plan.
        </p>
        <button 
          onClick={handleExploreCoaching}
          className="flex items-center gap-2 px-5 py-3 bg-[#D4A84B] text-[#0D5C5C] rounded-lg font-semibold text-sm hover:bg-[#c49a42] transition-colors"
        >
          Explore coaching options
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Decorative circle */}
      <div className="absolute right-32 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A84B] to-[#c49a42] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#0D5C5C] flex items-center justify-center">
          <span className="text-2xl">💬</span>
        </div>
      </div>

      {/* Image placeholder */}
      <div className="relative z-10 w-64 h-40 rounded-xl overflow-hidden bg-gray-300 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <span className="text-4xl">👥</span>
          <p className="text-xs mt-1">Coaching Image</p>
        </div>
      </div>
    </div>
  );
}
