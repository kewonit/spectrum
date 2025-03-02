import React from 'react';
import { motion } from 'framer-motion';
import { Medal } from 'lucide-react';

interface ProgressCounterProps {
  attempts: number;
  maxAttempts: number;
  className?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressCounter({
  attempts,
  maxAttempts,
  className = '',
  showBadge = true,
  size = 'md',
}: ProgressCounterProps) {
  // Calculate sizes based on size prop
  const badgeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm"
  };
  
  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };
  
  const attemptsPercentage = (attempts / maxAttempts) * 100;
  
  // Define color based on attempts used
  const getColor = () => {
    if (attempts === maxAttempts) return 'bg-red-100 text-red-800';
    if (attempts > maxAttempts * 0.65) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };
  
  if (!showBadge) {
    return (
      <span className={`${className} text-gray-600`}>
        Attempt {attempts} of {maxAttempts}
      </span>
    );
  }
  
  return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`${className} inline-flex items-center ${badgeClasses[size]} rounded-full font-medium ${getColor()}`}
    >
      {attempts === maxAttempts && (
        <Medal className={`${iconSize[size]} mr-1`} />
      )}
      Attempt {attempts} of {maxAttempts}
    </motion.span>
  );
}
