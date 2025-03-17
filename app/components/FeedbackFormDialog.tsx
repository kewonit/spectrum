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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Submit Feedback' : 'Edit Feedback'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex items-center gap-2 p-3 bg-[#EBE9E0]/30 rounded-md border border-gray-200">
              <div className="flex gap-1" id="rating">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        (hoverRating ? value <= hoverRating : value <= rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium ml-2">
                {hoverRating || rating}/5
              </span>
            </div>
          </div>

          {/* Feedback text */}
          <div className="space-y-2">
            <Label htmlFor="feedback">Your Feedback (optional)</Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts and suggestions..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="h-24 resize-none"
            />
            <p className="text-xs text-gray-500">
              Your feedback helps us improve our events and services.
            </p>
          </div>

          {/* Anonymous option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setAnonymous(checked === true)}
            />
            <Label 
              htmlFor="anonymous" 
              className="text-sm font-normal cursor-pointer"
            >
              Submit anonymously (your name won&apos;t be submitted)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-gray-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || rating < 1}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
