import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className }) => {
  return (
    <div 
      className={cn(
        "w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin",
        className
      )}
    />
  );
};