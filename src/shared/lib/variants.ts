import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[#192363] text-white hover:bg-[#1a2a75] focus:ring-2 focus:ring-[#192363] focus:ring-offset-2',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
        outline:
          'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
        ghost:
          'text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
        danger:
          'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        brand:
          'bg-[#1e2364] text-white hover:bg-[#233567] focus:ring-2 focus:ring-[#1e2364] focus:ring-offset-2',
        brandOutline:
          'border-2 border-[#1e2364] bg-white text-[#1e2364] hover:-translate-y-0.5',
        brandGhost:
          'border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#1e2364]',
        brandInverse:
          'border-2 border-white bg-white text-[#1e2364] hover:bg-[#00a8f1] hover:border-[#00a8f1] hover:text-white',
        // Product UI (profile, academy, auth). See docs/product-ui.md.
        product:
          'bg-[#1e2364] text-white hover:bg-[#2a3178] focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2',
        productSecondary:
          'border border-[#d9ddea] bg-white text-[#1e2364] hover:border-[#1e2364]/40 hover:bg-[#f7f8fb] focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2',
        productText:
          'text-[#0077ad] hover:bg-[#e6f6fe] focus-visible:ring-2 focus-visible:ring-[#00a8f1]',
        productDanger:
          'text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500',
      },
      // Before `size` so product sizes can override the radius.
      shape: {
        default: 'rounded-lg',
        pill: 'rounded-full',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        hero: 'px-[30px] py-4 text-[15px]',
        // Product sizes: 44px meets touch targets, 36px for dense rows.
        control: 'h-11 rounded-xl px-5 text-[14px]',
        compact: 'h-9 rounded-[10px] px-3.5 text-[13px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      shape: 'default',
    },
  }
);

export const inputVariants = cva(
  'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors duration-150',
  {
    variants: {
      state: {
        default: 'border-gray-300 focus:ring-blue-500',
        error: 'border-red-500 focus:ring-red-500',
      },
    },
    defaultVariants: { state: 'default' },
  }
);

export const labelVariants = cva('text-sm font-medium text-gray-700');

export const cardVariants = cva('rounded-2xl border bg-white shadow-sm', {
  variants: {
    variant: {
      default: 'border-gray-100 p-6',
      flat: 'border-gray-100 p-4',
      elevated: 'border-gray-200 p-6 shadow-md',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'size-4',
        md: 'size-6',
        lg: 'size-10',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

export const toastVariants = cva(
  'rounded-lg border px-4 py-3 text-sm font-medium shadow-md',
  {
    variants: {
      type: {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
      },
    },
    defaultVariants: { type: 'info' },
  }
);

export const badgeVariants = cva(
  'inline-flex items-center gap-2.5 rounded-full border-2 px-4 py-2 text-[13px] font-semibold tracking-[0.4px]',
  {
    variants: {
      variant: {
        default: 'border-[#e5e7f0] bg-white text-[#1e2364]',
        brand: 'border-[#1e2364] bg-[#1e2364] text-white',
        accent: 'border-[#00a8f1] bg-white text-[#00a8f1]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export const modalVariants = cva(
  'relative z-10 w-full rounded-2xl bg-white shadow-xl',
  {
    variants: {
      size: {
        sm: 'max-w-sm p-5',
        md: 'max-w-md p-6',
        lg: 'max-w-lg p-8',
      },
    },
    defaultVariants: { size: 'md' },
  }
);
