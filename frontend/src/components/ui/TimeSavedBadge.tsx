import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimeSavedBadgeProps {
  hours?: number;
  minutes?: number;
  variant?: 'default' | 'large' | 'hero';
  animated?: boolean;
  className?: string;
}

export const TimeSavedBadge: React.FC<TimeSavedBadgeProps> = ({
  hours = 0,
  minutes = 0,
  variant = 'default',
  animated = true,
  className
}) => {
  const totalMinutes = hours * 60 + minutes;
  const displayHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;

  const variants = {
    default: {
      container: 'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
      icon: 'w-4 h-4',
      text: 'text-sm font-semibold',
      number: 'text-base font-bold'
    },
    large: {
      container: 'inline-flex items-center gap-3 px-4 py-2 rounded-2xl',
      icon: 'w-5 h-5',
      text: 'text-base font-semibold',
      number: 'text-lg font-bold'
    },
    hero: {
      container: 'inline-flex items-center gap-4 px-6 py-4 rounded-3xl',
      icon: 'w-8 h-8',
      text: 'text-xl font-semibold',
      number: 'text-3xl font-bold'
    }
  };

  const style = variants[variant];

  return (
    <motion.div
      className={cn(
        style.container,
        'bg-gradient-to-r from-velocity-blue/10 to-neural-purple/10',
        'border border-velocity-blue/20',
        'backdrop-blur-sm',
        className
      )}
      initial={animated ? { scale: 0, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
    >
      <motion.div
        animate={animated ? {
          rotate: [0, 360],
          transition: { duration: 2, ease: 'linear', repeat: Infinity }
        } : undefined}
      >
        <Zap className={cn(style.icon, 'text-velocity-blue')} />
      </motion.div>

      <div className="flex items-baseline gap-1">
        {displayHours > 0 && (
          <>
            <span className={cn(style.number, 'text-velocity-blue')}>
              {displayHours}
            </span>
            <span className={cn(style.text, 'text-slate-600')}>
              {displayHours === 1 ? 'hour' : 'hours'}
            </span>
          </>
        )}

        {displayMinutes > 0 && (
          <>
            {displayHours > 0 && (
              <span className={cn(style.text, 'text-slate-500 mx-1')}>
                and
              </span>
            )}
            <span className={cn(style.number, 'text-neural-purple')}>
              {displayMinutes}
            </span>
            <span className={cn(style.text, 'text-slate-600')}>
              {displayMinutes === 1 ? 'minute' : 'minutes'}
            </span>
          </>
        )}

        <span className={cn(style.text, 'text-slate-700 ml-1')}>
          saved
        </span>
      </div>

      {variant === 'hero' && (
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          <span className="text-2xl">⚡</span>
        </motion.div>
      )}
    </motion.div>
  );
};