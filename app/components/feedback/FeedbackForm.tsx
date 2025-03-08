'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';

export interface FeedbackFormData {
  id?: string;
  rating: number;
  feedback_text: string;
  anonymous: boolean;
  event_id?: string | null;
}

interface FeedbackFormProps {
  initialData?: FeedbackFormData;
  onSubmit: (data: FeedbackFormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  isEditing?: boolean;
}

export function FeedbackForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  onDelete, 
  isEditing = false 
}: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [feedbackText, setFeedbackText] = useState<string>(initialData?.feedback_text || '');
  const [anonymous, setAnonymous] = useState<boolean>(initialData?.anonymous || false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({
        id: initialData?.id,
        rating,
        feedback_text: feedbackText.trim(),
        anonymous,
        event_id: initialData?.event_id || null
      });
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      setSubmitting(true);
      try {
        await onDelete();
      } catch (err) {
        setError('Failed to delete feedback');
        console.error(err);
        setSubmitting(false);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div>
        <Label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
          Your Rating
        </Label>
        <StarRating
          initialRating={rating}
          onChange={setRating}
          size="md"
          className="mb-1"
        />
        {rating === 0 && (
          <p className="text-xs text-red-600 mt-1">Please select a rating</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
          Your Feedback (Optional)
        </Label>
        <Textarea
          id="feedback"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Share your experience..."
          className="min-h-[100px] resize-y"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="anonymous"
          checked={anonymous}
          onCheckedChange={setAnonymous}
        />
        <Label htmlFor="anonymous" className="text-sm text-gray-700">
          Submit anonymously
        </Label>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md flex gap-2 items-center text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex justify-between pt-2">
        <div className="space-x-2">
          <Button 
            type="submit" 
            disabled={submitting || rating === 0}
          >
            {submitting ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
        
        {isEditing && onDelete && (
          <Button 
            type="button" 
            variant="outline"
            onClick={handleDelete}
            disabled={submitting}
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
