'use client';

import React from 'react';
import { FeedbackSection } from './FeedbackSection';
import { FeedbackErrorBoundary } from './FeedbackErrorBoundary';
import { Card } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';

interface FeedbackSectionWrapperProps {
  profileId: string;
  userName: string;
}

export function FeedbackSectionWrapper({ profileId, userName }: FeedbackSectionWrapperProps) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <Card className="overflow-hidden bg-[#EBE9E0]/40 backdrop-blur border-2 border-gray-300 rounded-2xl shadow-sm max-w-[1400px] mx-auto">
        <div className="p-4 sm:p-5 lg:p-6 border-b-2 border-gray-300 flex items-center gap-2.5 bg-[#EBE9E0]/30">
          <div className="bg-[#EBE9E0]/80 p-1.5 rounded-full">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg lg:text-xl">Website Feedback</h3>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 bg-white/20 text-center">
          <p>Unable to load feedback section. Please try again later.</p>
        </div>
      </Card>
    );
  }

  try {
    return (
      <FeedbackErrorBoundary>
        <FeedbackSection profileId={profileId} userName={userName} />
      </FeedbackErrorBoundary>
    );
  } catch (error) {
    console.error("Error rendering FeedbackSection:", error);
    setHasError(true);
    return null;
  }
}
