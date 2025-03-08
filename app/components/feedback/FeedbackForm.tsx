'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from './StarRating';
import { toast } from "sonner";
import { Edit2, Trash2, Send, X, Loader2 } from 'lucide-react';

export interface FeedbackFormData {
  id?: string;
  rating: number;
  feedback_text: string;
  event_id?: string | null;
}

interface FeedbackFormProps {
  initialData?: FeedbackFormData;
  onSubmit: (data: FeedbackFormData) => Promise<void>;
  onCancel?: () => void;
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        id: initialData?.id,
        rating,
        feedback_text: feedbackText,
        event_id: initialData?.event_id
      });
      
      if (!isEditing) {
        setRating(0);
        setFeedbackText('');
      }
      
      toast.success(isEditing ? "Feedback updated successfully" : "Thank you for your feedback");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (!window.confirm("Are you sure you want to delete your feedback?")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await onDelete();
      toast.success("Feedback deleted successfully");
    } catch (error) {
      console.error("Failed to delete feedback:", error);
      toast.error("Failed to delete feedback. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="rating" className="text-sm sm:text-base font-medium text-gray-700">
            Rate our website
          </Label>
          <span className="text-xs sm:text-sm bg-gray-50 px-2 py-0.5 rounded text-gray-500 font-medium">
            {rating > 0 ? `${rating}/5 stars` : "Select rating"}
          </span>
        </div>
        <div className="bg-white/80 rounded-lg border border-gray-200 p-3 sm:p-4 flex items-center justify-center">
          <StarRating 
            initialRating={rating} 
            onChange={setRating}
            size="lg"
            className="py-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feedback_text" className="text-sm sm:text-base font-medium text-gray-700 flex items-center">
          Your comments <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </Label>
        <Textarea
          id="feedback_text"
          placeholder="What do you like about our website? Any suggestions for improving the user experience?"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          className="resize-none h-24 sm:h-32 bg-white/80 border-gray-200 focus:border-primary text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 sm:pt-4">
        <div className="flex items-center gap-2">
          {isEditing && onDelete && (
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
              className="h-8 w-8 sm:h-9 sm:w-9 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              aria-label="Delete feedback"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </Button>
          )}
          
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting || isDeleting}
              className="h-8 sm:h-9 text-xs sm:text-sm px-2.5 sm:px-3 bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              Cancel
            </Button>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting || isDeleting || rating === 0}
          className="ml-auto h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap flex-shrink-0"
          variant={isEditing ? "outline" : "default"}
          size="sm"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 animate-spin" />
          ) : isEditing ? (
            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          ) : (
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
          )}
          {isEditing ? 'Update' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}
