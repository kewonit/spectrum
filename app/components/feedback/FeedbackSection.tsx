'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from './StarRating';
import { FeedbackList } from './FeedbackList';
import { FeedbackForm, FeedbackFormData } from './FeedbackForm';
import { EmptyFeedbackState } from '../EmptyFeedbackState';
import { toast } from "sonner";
import { AlertCircle } from 'lucide-react';

interface FeedbackSectionProps {
  profileId: string;
  userName: string;
}

export function FeedbackSection({ profileId, userName }: FeedbackSectionProps) {
  const [userFeedback, setUserFeedback] = useState<any>(null);
  const [allFeedback, setAllFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchFeedbackData();
  }, [profileId]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/feedback');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch feedback');
      }
      
      const data = await response.json();
      setUserFeedback(data.userFeedback || null);
      setAllFeedback(data.allFeedback || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching feedback:', err);
      setError(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (data: FeedbackFormData) => {
    try {
      const response = await fetch('/api/user/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit feedback');
      }
      
      setUserFeedback(responseData.feedback);
      toast.success('Feedback submitted successfully!');
      fetchFeedbackData(); // Refresh the feedback list
      setShowForm(false);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      toast.error('Failed to submit feedback', {
        description: err.message || 'Please try again later',
      });
    }
  };

  const handleUpdateFeedback = async (data: FeedbackFormData) => {
    try {
      if (!data.id) {
        throw new Error('Feedback ID is missing');
      }
      
      const response = await fetch(`/api/user/feedback/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update feedback');
      }
      
      setUserFeedback(responseData.feedback);
      toast.success('Feedback updated successfully!');
      fetchFeedbackData(); // Refresh the feedback list
    } catch (err: any) {
      console.error('Error updating feedback:', err);
      toast.error('Failed to update feedback', {
        description: err.message || 'Please try again later',
      });
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      const response = await fetch(`/api/user/feedback/${id}`, {
        method: 'DELETE',
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to delete feedback');
      }
      
      setUserFeedback(null);
      toast.success('Feedback deleted successfully!');
      fetchFeedbackData(); // Refresh the feedback list
    } catch (err: any) {
      console.error('Error deleting feedback:', err);
      toast.error('Failed to delete feedback', {
        description: err.message || 'Please try again later',
      });
    }
  };

  // Handle errors gracefully
  if (error) {
    return (
      <Card className="p-4 bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="bg-red-50 rounded-full p-4 mb-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load feedback</h3>
          <p className="text-sm text-gray-500 mb-4">
            We encountered an error while loading the feedback section.
          </p>
          <Button 
            onClick={fetchFeedbackData} 
            variant="outline" 
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4 bg-white/80 backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-2" />
          <div className="h-24 bg-gray-100 rounded" />
          <div className="h-10 w-1/4 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Event Feedback</h2>
          {!userFeedback && (
            <Button 
              onClick={() => setShowForm(true)} 
              size="sm"
              className="text-xs sm:text-sm"
            >
              Share Your Feedback
            </Button>
          )}
        </div>
        
        {showForm && !userFeedback ? (
          <FeedbackForm 
            onSubmit={handleSubmitFeedback} 
            onCancel={() => setShowForm(false)}
          />
        ) : userFeedback ? null : (
          <div className="py-2">
            <p className="text-sm text-gray-600 mb-4">
              Your feedback helps us improve future events. Let us know about your experience!
            </p>
          </div>
        )}
        
        {allFeedback.length > 0 ? (
          <FeedbackList 
            feedbackItems={allFeedback}
            currentUserId={profileId}
            onUpdate={handleUpdateFeedback}
            onDelete={handleDeleteFeedback}
          />
        ) : (
          <EmptyFeedbackState />
        )}
      </div>
    </Card>
  );
}
