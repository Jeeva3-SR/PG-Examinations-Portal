import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#005A9C] text-white hover:bg-[#004A8C] focus-visible:ring-[#005A9C]',
        secondary: 'bg-[#F0F4F8] text-[#1f2937] hover:bg-[#E4E9F0] focus-visible:ring-[#F0F4F8]',
        outline: 'border border-[#005A9C] text-[#005A9C] hover:bg-[#005A9C] hover:text-white focus-visible:ring-[#005A9C]',
        ghost: 'hover:bg-[#F0F4F8] hover:text-[#005A9C] focus-visible:ring-[#F0F4F8]',
        link: 'text-[#005A9C] underline-offset-4 hover:underline focus-visible:ring-[#005A9C]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 