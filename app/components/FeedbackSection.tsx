"use client";

import { useState, useEffect } from 'react';
import { FeedbackCard } from '@/app/components/FeedbackCard';
import { FeedbackFormDialog } from '@/app/components/FeedbackFormDialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, PlusCircle, RefreshCw } from 'lucide-react';
import { EmptyFeedbackState } from '@/app/components/EmptyFeedbackState';
import { toast } from 'sonner';

interface FeedbackItem {
  id: string;
  rating: number;
  feedback_text: string | null;
  anonymous: boolean;
  created_at: string;
  updated_at: string;
  events: {
    id: string;
    name: string;
    img_url: string | null;
  } | null;
}

export function FeedbackSection() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feedback');
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleRefresh = async () => {
    if (refreshing) return;
    
    try {
      setRefreshing(true);
      await fetchFeedback();
      toast.success('Feedback refreshed');
    } catch (error) {
      toast.error('Failed to refresh feedback');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddFeedback = () => {
    setShowAddDialog(true);
  };

  return (
    <div className="bg-white/80 backdrop-blur p-6 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-lg">Your Feedback</h2>
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="h-9 text-gray-600"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleAddFeedback}
            disabled={loading}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Add Feedback
          </Button>
        </div>
      </div>
      
      {/* Feedback content */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : feedback.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {feedback.map((item) => (
              <FeedbackCard
                key={item.id}
                feedback={item}
                onEdit={fetchFeedback}
                onDelete={fetchFeedback}
              />
            ))}
          </div>
        ) : (
          <EmptyFeedbackState />
        )}
      </div>
      
      {/* Add feedback dialog */}
      <FeedbackFormDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={() => {
          fetchFeedback();
          setShowAddDialog(false);
        }}
        initialValues={{
          eventId: null,
          rating: 5,
          feedbackText: '',
          anonymous: false
        }}
        mode="create"
      />
    </div>
  );
}
