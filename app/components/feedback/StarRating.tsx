'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useMediaQuery } from '@/app/hooks/use-media-query';

// Simple standalone utility function with no dependencies
const combineClasses = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface StarRatingProps {
  initialRating?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRating({
  initialRating = 0,
  onChange,
  readOnly = false,
  size = 'md',
  className
}: StarRatingProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [hover, setHover] = useState<number | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);
  
  const handleClick = (value: number) => {
    if (readOnly) return;
    
    // Toggle off if clicking the same star
    const newRating = rating === value ? value - 1 : value;
    setRating(newRating);
    
    if (onChange) {
      onChange(newRating);
    }
  };
  
  // Adjust star sizes based on device
  const starSizes = {
    sm: isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4',
    md: isMobile ? 'w-4.5 h-4.5' : 'w-5 h-5',
    lg: isMobile ? 'w-5 h-5' : 'w-6 h-6'
  };
  
  const containerSizes = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: isMobile ? 'gap-2' : 'gap-3'
  };
  
  return (
    <div className={combineClasses('flex items-center', containerSizes[size] || '', className || '')}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(null)}
          onTouchStart={() => !readOnly && setHover(star)}
          onTouchEnd={() => !readOnly && setHover(null)}
          disabled={readOnly}
          className={combineClasses(
            "p-1 -m-1 rounded-full transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer hover:bg-gray-100/50"
          )}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          <Star
            className={combineClasses(
              starSizes[size] || '',
              'transition-colors',
              (hover !== null ? hover >= star : rating >= star)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}
