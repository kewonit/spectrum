"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackFormValues {
  eventId?: string | null;
  rating: number;
  feedbackText: string;
  anonymous: boolean;
}

interface FeedbackFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  feedbackId?: string;
  initialValues?: FeedbackFormValues;
  mode: 'create' | 'edit';
}

export function FeedbackFormDialog({
  isOpen,
  onClose,
  onSubmit,
  feedbackId,
  initialValues = {
    eventId: null,
    rating: 5,
    feedbackText: '',
    anonymous: false
  },
  mode = 'create'
}: FeedbackFormDialogProps) {
  const [rating, setRating] = useState(initialValues.rating);
  const [feedbackText, setFeedbackText] = useState(initialValues.feedbackText);
  const [anonymous, setAnonymous] = useState(initialValues.anonymous);
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Reset form when dialog opens or initialValues change
  useEffect(() => {
    if (isOpen) {
      setRating(initialValues.rating);
      setFeedbackText(initialValues.feedbackText);
      setAnonymous(initialValues.anonymous);
    }
  }, [isOpen, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === 'create' 
        ? '/api/feedback' 
        : `/api/feedback/${feedbackId}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: initialValues.eventId,
          rating,
          feedbackText: feedbackText.trim() || null,
          anonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      toast.success(
        mode === 'create' 
          ? 'Feedback submitted successfully!' 
          : 'Feedback updated successfully!'
      );
      
      onSubmit();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(
        `Failed to ${mode === 'create' ? 'submit' : 'update'} feedback`, 
        { description: error instanceof Error ? error.message : 'Please try again' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 bg-[#FAF9F6] rounded-2xl">
        <DialogHeader className="p-6 pb-2 bg-gradient-to-b from-[#E6F7FF]/50 to-transparent">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Share Your Website Feedback' : 'Edit Your Feedback'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 pt-3">
          {/* Rating */} 
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-sm font-medium">Rate Your Experience</Label>
            <div className="flex items-center justify-between p-4 bg-[#FFF4E5]/60 rounded-xl border border-amber-100">
              <div className="flex gap-1 sm:gap-2" id="rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 sm:p-1.5 touch-manipulation hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors ${
                        (hoverRating ? value <= hoverRating : value <= rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-amber-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium ml-2 min-w-[36px] text-right">
                {hoverRating || rating}/5
              </span>
            </div>
          </div>

          {/* Feedback text - FIXED VERSION */}
          <div className="space-y-2">
            <label htmlFor="feedbackText" className="text-sm font-medium block">Your Comments (optional)</label>
            <textarea
              id="feedbackText"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts about the website, any issues you've encountered, or suggestions for improvement..."
              className="w-full h-28 px-3 py-2 text-base placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
              style={{ zIndex: 100, position: 'relative' }}
            />
            <p className="text-xs text-gray-500">
              Your feedback helps us improve the Spectrum website and platform experience.
            </p>
          </div>

          {/* Anonymous option - FIXED VERSION */}
          <div className="flex items-center space-x-3 pt-1">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymousCheck"
                checked={anonymous}
                onChange={() => setAnonymous(!anonymous)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                style={{ zIndex: 100, position: 'relative' }}
              />
              <label 
                htmlFor="anonymousCheck" 
                className="ml-2 text-sm font-normal cursor-pointer"
                onClick={() => setAnonymous(!anonymous)}
              >
                Submit anonymously (hide your name)
              </label>
            </div>
          </div>

          <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-3 pt-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-gray-200 hover:bg-gray-100 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || rating < 1}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {mode === 'create' ? 'Submitting...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Submit Feedback' : 'Update Feedback'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
