import React from 'react';
import { ResponsiveContainer } from '../components/ui/responsive-container';
import { ResponsiveText } from '../components/ui/responsive-text';

export const ResponsiveLayoutExample = () => {
  return (
    <ResponsiveContainer maxWidth="lg" padding="md">
      <ResponsiveText variant="h1" align="center" className="mb-6">
        Responsive Layout Example
      </ResponsiveText>
      
      <ResponsiveContainer layout="grid" className="mb-8">
        {[1, 2, 3, 4, 5, 6].map(item => (
          <div key={item} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <ResponsiveText variant="h3">Card {item}</ResponsiveText>
            <ResponsiveText variant="body">
              This content automatically adapts to different screen sizes.
              Touch targets are larger on mobile devices for better usability.
            </ResponsiveText>
          </div>
        ))}
      </ResponsiveContainer>
      
      <ResponsiveContainer layout="flex" verticalSpacing="lg">
        <div className="flex-1 min-w-[280px]">
          <ResponsiveText variant="h2">Left Column</ResponsiveText>
          <ResponsiveText variant="body">
            On mobile, this content stacks vertically.
            On larger screens, it displays side by side.
          </ResponsiveText>
        </div>
        <div className="flex-1 min-w-[280px]">
          <ResponsiveText variant="h2">Right Column</ResponsiveText>
          <ResponsiveText variant="body">
            The components automatically handle responsive behaviors
            while maintaining consistent spacing and typography.
          </ResponsiveText>
        </div>
      </ResponsiveContainer>
    </ResponsiveContainer>
  );
};
