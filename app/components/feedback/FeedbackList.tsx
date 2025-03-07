'use client';

import { useState } from 'react';
import { FeedbackCard } from './FeedbackCard';
import { FeedbackFormData } from './FeedbackForm';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FeedbackListProps {
  feedbackItems: Array<{
    id: string;
    rating: number;
    feedback_text: string | null;
    anonymous: boolean;
    user: {
      id: string;
      full_name: string;
    } | null;
    created_at: string;
    updated_at: string;
    event_id: string | null;
  }>;
  currentUserId: string;
  onUpdate: (data: FeedbackFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function FeedbackList({ feedbackItems, currentUserId, onUpdate, onDelete }: FeedbackListProps) {
  const [expandedList, setExpandedList] = useState(false);

  // Sort: Show user's own feedback at top, then by date
  const sortedFeedback = [...feedbackItems].sort((a, b) => {
    // First, put user's own feedback at the top
    const aIsOwn = a.user?.id === currentUserId;
    const bIsOwn = b.user?.id === currentUserId;
    
    if (aIsOwn && !bIsOwn) return -1;
    if (!aIsOwn && bIsOwn) return 1;
    
    // Then, sort by date (most recent first)
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
  
  // Show only 3 items when not expanded, or all items when expanded
  const visibleFeedback = expandedList ? sortedFeedback : sortedFeedback.slice(0, 3);
  
  // Don't show toggle button if there are 3 or fewer items
  const showToggleButton = sortedFeedback.length > 3;

  return (
    <div className="space-y-4">
      {visibleFeedback.length > 0 ? (
        <>
          <div className="space-y-3">
            {visibleFeedback.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                isOwner={feedback.user?.id === currentUserId}
                onUpdate={(data) => onUpdate(data)}
                onDelete={() => onDelete(feedback.id)}
              />
            ))}
          </div>
          
          {showToggleButton && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedList(!expandedList)}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                {expandedList ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show {sortedFeedback.length - 3} more
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-6 text-center text-gray-500 bg-white/50 rounded-lg border border-dashed border-gray-300">
          No feedback shared yet. Be the first to provide feedback!
        </div>
      )}
    </div>
  );
}
