import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'speed';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = `
      relative inline-flex items-center justify-center
      font-semibold transition-all duration-fast
      rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95 transform-gpu
    `;

    const variants = {
      primary: `
        bg-velocity-blue text-white
        hover:bg-velocity-blue-dark
        focus:ring-velocity-blue
      `,
      secondary: `
        bg-slate-100 text-slate-900
        hover:bg-slate-200
        focus:ring-slate-500
      `,
      ghost: `
        bg-transparent text-slate-700
        hover:bg-slate-100
        focus:ring-slate-500
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700
        focus:ring-red-600
      `,
      success: `
        bg-success text-white
        hover:bg-green-700
        focus:ring-success
      `,
      speed: `
        bg-gradient-to-r from-velocity-blue to-neural-purple text-white
        hover:from-velocity-blue-dark hover:to-neural-purple-dark
        focus:ring-neural-purple
        shadow-lg hover:shadow-xl
      `
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5 min-h-[48px]' // Mobile-friendly touch target
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';