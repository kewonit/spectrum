import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  verticalSpacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  layout?: 'stack' | 'grid' | 'flex';
  as?: React.ElementType;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  padding = 'md',
  verticalSpacing = 'md',
  layout = 'stack',
  as: Component = 'div',
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isSmallMobile = useMediaQuery('(max-width: 480px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  // Determine max-width based on prop
  const maxWidthClass = {
    xs: 'max-w-xs',
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }[maxWidth];

  // Determine padding based on prop and screen size
  let paddingClass = '';
  if (padding !== 'none') {
    const base = {
      xs: 'px-2 sm:px-3 md:px-4',
      sm: 'px-3 sm:px-4 md:px-5',
      md: 'px-4 sm:px-5 md:px-6',
      lg: 'px-5 sm:px-6 md:px-8',
    }[padding];
    
    paddingClass = isSmallMobile ? `px-3` : base;
  }

  // Determine vertical spacing
  const spacingClass = {
    none: '',
    xs: 'py-1 sm:py-2',
    sm: 'py-2 sm:py-3',
    md: 'py-3 sm:py-4 md:py-6',
    lg: 'py-4 sm:py-6 md:py-8',
  }[verticalSpacing];

  // Determine layout class
  let layoutClass = '';
  if (layout === 'grid') {
    layoutClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6';
  } else if (layout === 'flex') {
    layoutClass = 'flex flex-col sm:flex-row flex-wrap items-start gap-3 sm:gap-4';
  }

  // Touch-friendly adjustments for mobile
  const touchClass = isMobile ? 'touch-manipulation' : '';

  return (
    <Component
      className={`mx-auto ${maxWidthClass} ${paddingClass} ${spacingClass} ${layoutClass} ${touchClass} ${className}`}
    >
      {children}
    </Component>
  );
};
