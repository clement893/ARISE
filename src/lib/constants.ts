/**
 * Centralized constants for the ARISE application
 * This file contains all shared constants, mappings, and configuration
 * to reduce duplication and improve maintainability.
 */

// =============================================================================
// NAVIGATION
// =============================================================================

/**
 * Main navigation links for the public header
 */
export const NAV_LINKS = [
  { href: '/#four-dimensions', label: 'Approach' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
] as const;

/**
 * Dashboard sidebar navigation items
 */
export const DASHBOARD_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/dashboard/assessments', label: 'Assessments', icon: 'ClipboardList' },
  { href: '/dashboard/results', label: 'Results', icon: 'BarChart3' },
  { href: '/dashboard/development', label: 'Development', icon: 'Target' },
  { href: '/dashboard/profile', label: 'Profile', icon: 'User' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
] as const;

/**
 * Admin sidebar navigation items
 */
export const ADMIN_NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/assessments', label: 'Assessments', icon: 'ClipboardList' },
] as const;

// =============================================================================
// STATUS MAPPINGS
// =============================================================================

/**
 * Assessment status configuration
 * Maps status values to display properties
 */
export const ASSESSMENT_STATUS = {
  not_started: {
    label: 'Not Started',
    variant: 'neutral' as const,
    color: 'bg-neutral-100 text-neutral-600',
  },
  in_progress: {
    label: 'In Progress',
    variant: 'warning' as const,
    color: 'bg-secondary-100 text-secondary-700',
  },
  completed: {
    label: 'Completed',
    variant: 'success' as const,
    color: 'bg-success-100 text-success-700',
  },
} as const;

/**
 * Evaluator status configuration
 */
export const EVALUATOR_STATUS = {
  pending: {
    label: 'Pending',
    variant: 'neutral' as const,
    color: 'bg-neutral-100 text-neutral-600',
  },
  invited: {
    label: 'Invited',
    variant: 'info' as const,
    color: 'bg-info-100 text-info-700',
  },
  started: {
    label: 'Started',
    variant: 'warning' as const,
    color: 'bg-secondary-100 text-secondary-700',
  },
  completed: {
    label: 'Completed',
    variant: 'success' as const,
    color: 'bg-success-100 text-success-700',
  },
} as const;

/**
 * Subscription status configuration
 */
export const SUBSCRIPTION_STATUS = {
  active: {
    label: 'Active',
    variant: 'success' as const,
    color: 'bg-success-100 text-success-700',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'error' as const,
    color: 'bg-error-100 text-error-700',
  },
  past_due: {
    label: 'Past Due',
    variant: 'warning' as const,
    color: 'bg-warning-100 text-warning-700',
  },
  trialing: {
    label: 'Trial',
    variant: 'info' as const,
    color: 'bg-info-100 text-info-700',
  },
} as const;

/**
 * Invoice status configuration
 */
export const INVOICE_STATUS = {
  paid: {
    label: 'Paid',
    variant: 'success' as const,
    icon: 'CheckCircle',
  },
  open: {
    label: 'Open',
    variant: 'warning' as const,
    icon: 'AlertCircle',
  },
  draft: {
    label: 'Draft',
    variant: 'neutral' as const,
    icon: 'FileText',
  },
  void: {
    label: 'Void',
    variant: 'error' as const,
    icon: 'XCircle',
  },
} as const;

/**
 * Goal status configuration
 */
export const GOAL_STATUS = {
  not_started: {
    label: 'Not Started',
    color: 'bg-gray-300',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-secondary-500',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-500',
  },
} as const;

// =============================================================================
// ROLE MAPPINGS
// =============================================================================

/**
 * User role configuration
 */
export const USER_ROLES = {
  admin: {
    label: 'Admin',
    variant: 'admin' as const,
    color: 'bg-error-100 text-error-700',
    permissions: ['manage_users', 'manage_assessments', 'view_analytics'],
  },
  coach: {
    label: 'Coach',
    variant: 'coach' as const,
    color: 'bg-info-100 text-info-700',
    permissions: ['view_clients', 'manage_sessions'],
  },
  user: {
    label: 'User',
    variant: 'neutral' as const,
    color: 'bg-neutral-100 text-neutral-600',
    permissions: ['take_assessments', 'view_results'],
  },
} as const;

// =============================================================================
// ASSESSMENT TYPES
// =============================================================================

/**
 * Assessment type configuration
 */
export const ASSESSMENT_TYPES = {
  tki: {
    id: 'tki',
    name: 'TKI Assessment',
    description: 'Thomas-Kilmann Conflict Mode Instrument',
    icon: 'Users',
    color: 'primary',
    questionCount: 30,
  },
  wellness: {
    id: 'wellness',
    name: 'Wellness Assessment',
    description: 'Holistic wellness evaluation',
    icon: 'Heart',
    color: 'secondary',
    questionCount: 30,
  },
  '360-self': {
    id: '360-self',
    name: '360° Self Assessment',
    description: 'Self-evaluation for 360° feedback',
    icon: 'Target',
    color: 'primary',
    questionCount: 30,
  },
} as const;

// =============================================================================
// PRICING PLANS
// =============================================================================

/**
 * Pricing plan configuration
 */
export const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for individuals starting their leadership journey',
    features: [
      'TKI Assessment',
      'Basic results dashboard',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    period: 'month',
    description: 'For leaders seeking comprehensive development',
    features: [
      'All Starter features',
      'Wellness Assessment',
      '360° Feedback',
      'Development planning',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    period: 'month',
    description: 'For organizations with multiple leaders',
    features: [
      'All Professional features',
      'Team analytics',
      'Custom assessments',
      'Dedicated account manager',
      'API access',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
] as const;

// =============================================================================
// FORM VALIDATION
// =============================================================================

/**
 * Common validation patterns
 */
export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
} as const;

// =============================================================================
// API ENDPOINTS
// =============================================================================

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  assessments: '/api/assessments',
  evaluators: '/api/evaluators',
  admin: {
    users: '/api/admin/users',
    stats: '/api/admin/stats',
    assessments: '/api/admin/assessments',
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get status configuration by status key
 */
export function getStatusConfig<T extends Record<string, unknown>>(
  statusMap: T,
  status: keyof T
): T[keyof T] {
  return statusMap[status] || statusMap[Object.keys(statusMap)[0] as keyof T];
}

/**
 * Get badge variant from status
 */
export function getStatusBadgeVariant(
  status: string,
  statusMap: Record<string, { variant: string }>
): string {
  return statusMap[status]?.variant || 'neutral';
}

/**
 * Check if user has specific role
 */
export function hasRole(userRole: string, requiredRole: string | string[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  return userRole === requiredRole;
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

/**
 * Check if user is coach
 */
export function isCoach(userRole: string): boolean {
  return userRole === 'coach';
}
