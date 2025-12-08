'use client';

interface EvaluationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'not_started';
  badge?: string;
  badgeColor?: string;
  onAction?: () => void;
}

export default function EvaluationCard({
  icon,
  title,
  description,
  status,
  badge,
  badgeColor = 'bg-gray-100 text-gray-600',
  onAction,
}: EvaluationCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 bg-[#0D5C5C] text-white text-xs rounded font-medium">
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 bg-[#D4A84B] text-[#0D5C5C] text-xs rounded font-medium">
            In progress
          </span>
        );
      default:
        return null;
    }
  };

  const getActionButton = () => {
    switch (status) {
      case 'completed':
        return (
          <button
            onClick={onAction}
            className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            View Results
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={onAction}
            className="w-full py-2 bg-[#0D5C5C] text-white rounded-lg text-sm font-medium hover:bg-[#0a4a4a] transition-colors"
          >
            Continue
          </button>
        );
      default:
        return (
          <button
            onClick={onAction}
            className="w-full py-2 bg-[#D4A84B] text-[#0D5C5C] rounded-lg text-sm font-medium hover:bg-[#c49a42] transition-colors"
          >
            Start
          </button>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header with icon and badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-[#e8f4f4] rounded-lg flex items-center justify-center text-[#0D5C5C]">
          {icon}
        </div>
        {badge && (
          <span className={`px-2 py-1 text-xs rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-3 flex-1">{description}</p>

      {/* Status Badge */}
      <div className="mb-3">{getStatusBadge()}</div>

      {/* Action Button */}
      {getActionButton()}
    </div>
  );
}
