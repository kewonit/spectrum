'use client';

import React from 'react';

type CustomBadgeProps = {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'success';
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
};

/**
 * A custom badge component that doesn't use the cn function
 * This is a workaround for build issues with the cn function
 */
export function CustomBadge({
  variant = 'default',
  children,
  className = '',
  ...props
}: CustomBadgeProps) {
  // Base classes that are always applied
  let baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  // Apply variant-specific classes
  if (variant === 'default') {
    baseClasses += " bg-primary text-primary-foreground hover:bg-primary/80";
  } else if (variant === 'secondary') {
    baseClasses += " bg-secondary text-secondary-foreground hover:bg-secondary/80";
  } else if (variant === 'destructive') {
    baseClasses += " bg-destructive text-destructive-foreground hover:bg-destructive/80";
  } else if (variant === 'outline') {
    baseClasses += " border border-input bg-background hover:bg-accent hover:text-accent-foreground";
  } else if (variant === 'success') {
    baseClasses += " bg-green-100 text-green-800 hover:bg-green-200 border border-green-200";
  }
  
  // Combine with any additional classes passed in
  const classNames = [baseClasses, className].filter(Boolean).join(' ');
  
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
