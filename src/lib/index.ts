/**
 * Library exports
 * Central export point for all utility functions, constants, and helpers
 */

// Utility functions
export { cn } from './utils';

// Button variants for server/client components
export { buttonVariants } from './button-variants';

// Constants and mappings
export {
  // Navigation
  NAV_LINKS,
  DASHBOARD_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
  
  // Status mappings
  ASSESSMENT_STATUS,
  EVALUATOR_STATUS,
  SUBSCRIPTION_STATUS,
  INVOICE_STATUS,
  GOAL_STATUS,
  
  // Role mappings
  USER_ROLES,
  
  // Assessment types
  ASSESSMENT_TYPES,
  
  // Pricing
  PRICING_PLANS,
  
  // Validation
  VALIDATION,
  
  // API endpoints
  API_ENDPOINTS,
  
  // Utility functions
  getStatusConfig,
  getStatusBadgeVariant,
  hasRole,
  isAdmin,
  isCoach,
} from './constants';

// Helper functions
export {
  // Date & Time
  formatDate,
  formatDateTime,
  getRelativeTime,
  
  // String
  capitalize,
  toTitleCase,
  truncate,
  getInitials,
  slugify,
  
  // Number
  formatNumber,
  formatCurrency,
  formatPercentage,
  clamp,
  
  // Array
  groupBy,
  sortBy,
  unique,
  chunk,
  
  // Validation
  isValidEmail,
  isValidPassword,
  isEmpty,
  
  // Async
  delay,
  debounce,
  throttle,
  
  // Object
  deepClone,
  pick,
  omit,
} from './helpers';
