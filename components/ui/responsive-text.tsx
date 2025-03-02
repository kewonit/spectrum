import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';
  className?: string;
  align?: 'left' | 'center' | 'right';
  as?: React.ElementType;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  className = '',
  align = 'left',
  as,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isSmallMobile = useMediaQuery('(max-width: 480px)');
  
  const variantStyles = {
    h1: 'text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight',
    h2: 'text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold',
    h3: 'text-lg xs:text-xl sm:text-2xl lg:text-3xl font-semibold',
    h4: 'text-base xs:text-lg sm:text-xl font-semibold',
    body: 'text-sm sm:text-base md:text-lg',
    small: 'text-xs sm:text-sm md:text-base',
    caption: 'text-xs md:text-sm text-gray-500',
  };
  
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  // Default component based on variant
  const defaultComponent = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    small: 'p',
    caption: 'span',
  }[variant] as React.ElementType;
  
  const Component = as || defaultComponent;
  
  // Add line-height adjustments for better readability on mobile
  const lineHeightClass = isSmallMobile ? 'leading-tight' : (isMobile ? 'leading-relaxed' : 'leading-normal');
  
  return (
    <Component 
      className={`${variantStyles[variant]} ${alignStyles[align]} ${lineHeightClass} ${className}`}
    >
      {children}
    </Component>
  );
};
