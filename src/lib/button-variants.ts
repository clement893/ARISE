import { cva } from 'class-variance-authority';

/**
 * Button variants - can be used in both server and client components
 * Import this instead of buttonVariants from Button.tsx for server components
 */
export const buttonVariants = cva(
  // Base styles
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-primary-500 text-white',
          'hover:bg-primary-600',
          'focus:ring-primary-500/50',
        ],
        secondary: [
          'bg-secondary-500 text-dark-gray',
          'hover:bg-secondary-600',
          'focus:ring-secondary-500/50',
        ],
        gold: [
          'bg-[#c9a961] text-[#333333]',
          'hover:bg-[#b89a52]',
          'focus:ring-[#c9a961]/50',
        ],
        white: [
          'bg-white text-[#333333]',
          'hover:bg-gray-100',
          'focus:ring-white/50',
        ],
        outline: [
          'border-2 border-primary-500 text-primary-500 bg-transparent',
          'hover:bg-primary-50',
          'focus:ring-primary-500/50',
        ],
        ghost: [
          'text-primary-600 bg-transparent',
          'hover:bg-primary-50',
          'focus:ring-primary-500/50',
        ],
        danger: [
          'bg-error-500 text-white',
          'hover:bg-error-600',
          'focus:ring-error-500/50',
        ],
        success: [
          'bg-success-500 text-white',
          'hover:bg-success-600',
          'focus:ring-success-500/50',
        ],
        link: [
          'text-primary-500 bg-transparent underline-offset-4',
          'hover:underline',
          'focus:ring-0',
          'p-0 h-auto',
        ],
        dark: [
          'bg-neutral-800 text-white',
          'hover:bg-neutral-900',
          'focus:ring-neutral-500/50',
        ],
      },
      size: {
        xs: 'text-xs px-2.5 py-1.5',
        sm: 'text-sm px-3 py-2',
        md: 'text-sm px-4 py-2.5',
        lg: 'text-base px-5 py-3',
        xl: 'text-lg px-6 py-3.5',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
