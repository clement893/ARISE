'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge variants using class-variance-authority
 */
const badgeVariants = cva(
  [
    'inline-flex items-center justify-center',
    'font-medium rounded-full',
    'transition-colors duration-200',
  ],
  {
    variants: {
      variant: {
        // Semantic variants
        neutral: 'bg-neutral-100 text-neutral-700',
        primary: 'bg-primary-100 text-primary-700',
        secondary: 'bg-secondary-100 text-secondary-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700',
        // Role-based variants
        admin: 'bg-red-100 text-red-700',
        coach: 'bg-purple-100 text-purple-700',
        participant: 'bg-blue-100 text-blue-700',
        user: 'bg-neutral-100 text-neutral-700',
        // Status variants
        completed: 'bg-green-100 text-green-700',
        'in-progress': 'bg-yellow-100 text-yellow-700',
        pending: 'bg-yellow-100 text-yellow-700',
        cancelled: 'bg-red-100 text-red-700',
        scheduled: 'bg-blue-100 text-blue-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      outline: {
        true: 'bg-transparent border',
        false: '',
      },
    },
    compoundVariants: [
      { variant: 'primary', outline: true, className: 'border-primary-500 text-primary-500 bg-transparent' },
      { variant: 'secondary', outline: true, className: 'border-secondary-500 text-secondary-500 bg-transparent' },
      { variant: 'success', outline: true, className: 'border-green-500 text-green-500 bg-transparent' },
      { variant: 'error', outline: true, className: 'border-red-500 text-red-500 bg-transparent' },
    ],
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
      outline: false,
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: ReactNode;
  dot?: boolean;
  icon?: ReactNode;
  onRemove?: () => void;
}

/**
 * Badge component for labels, tags, and status indicators
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, size, outline, children, dot, icon, onRemove, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, outline }), className)}
        {...props}
      >
        {dot && (
          <span
            className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"
            aria-hidden="true"
          />
        )}
        {icon && <span className="mr-1" aria-hidden="true">{icon}</span>}
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Remove"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * BadgeGroup - Container for multiple badges
 */
interface BadgeGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const BadgeGroup = forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-wrap gap-2', className)} {...props}>
        {children}
      </div>
    );
  }
);

BadgeGroup.displayName = 'BadgeGroup';

/**
 * StatusBadge - Pre-configured badge for status display
 */
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'error' | 'scheduled' | 'in-progress';
  children?: ReactNode;
}

const StatusBadge = ({ status, children }: StatusBadgeProps) => {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'neutral', label: 'Inactive' },
    pending: { variant: 'pending', label: 'Pending' },
    completed: { variant: 'completed', label: 'Completed' },
    cancelled: { variant: 'cancelled', label: 'Cancelled' },
    error: { variant: 'error', label: 'Error' },
    scheduled: { variant: 'scheduled', label: 'Scheduled' },
    'in-progress': { variant: 'in-progress', label: 'In Progress' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant={config.variant} dot>
      {children || config.label}
    </Badge>
  );
};

/**
 * RoleBadge - Pre-configured badge for user roles
 */
interface RoleBadgeProps {
  role: 'admin' | 'coach' | 'participant' | 'user';
}

const RoleBadge = ({ role }: RoleBadgeProps) => {
  const roleConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
    admin: { variant: 'admin', label: 'Admin' },
    coach: { variant: 'coach', label: 'Coach' },
    participant: { variant: 'participant', label: 'Participant' },
    user: { variant: 'user', label: 'User' },
  };

  const config = roleConfig[role] || roleConfig.user;

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export { Badge, BadgeGroup, StatusBadge, RoleBadge, badgeVariants };
export default Badge;
export type { BadgeProps };
