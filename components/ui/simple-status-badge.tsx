'use client';

import React from 'react';

interface SimpleStatusBadgeProps {
  status: 'accepted' | 'rejected' | 'pending' | string;
  children?: React.ReactNode;
  className?: string;
}

export function SimpleStatusBadge({ status, children, className = '' }: SimpleStatusBadgeProps) {
  // Determine the base style based on status
  let baseStyle = '';
  
  switch (status.toLowerCase()) {
    case 'accepted':
      baseStyle = 'bg-green-100 text-green-700';
      break;
    case 'rejected':
      baseStyle = 'bg-red-100 text-red-700';
      break;
    case 'pending':
      baseStyle = 'bg-yellow-100 text-yellow-700';
      break;
    default:
      baseStyle = 'bg-gray-100 text-gray-700';
  }
  
  // Combine base style with padding, rounded corners, and any additional classes
  const fullStyle = `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${baseStyle} ${className}`;
  
  return (
    <span className={fullStyle}>
      {children || status}
    </span>
  );
}
