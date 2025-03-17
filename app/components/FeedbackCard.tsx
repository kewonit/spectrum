"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Edit2, Trash2, Check, X, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Image from 'next/image';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface FeedbackCardProps {
  feedback: {
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
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FeedbackCard({ feedback, onEdit, onDelete }: FeedbackCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(feedback.rating);
  const [editFeedbackText, setEditFeedbackText] = useState(feedback.feedback_text || '');
  const [editAnonymous, setEditAnonymous] = useState(feedback.anonymous);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/feedback/${feedback.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }
      
      toast.success('Feedback deleted successfully');
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const startEditing = () => {
    setEditRating(feedback.rating);
    setEditFeedbackText(feedback.feedback_text || '');
    setEditAnonymous(feedback.anonymous);
    setFormError(null);
    setIsEditing(true);
  };
  
  const cancelEditing = () => {
    setIsEditing(false);
    setFormError(null);
  };
  
  const handleSubmit = async () => {
    setFormError(null);
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/feedback/${feedback.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: feedback.events?.id,
          rating: editRating,
          feedbackText: editFeedbackText.trim() || null,
          anonymous: editAnonymous,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      toast.success('Feedback updated successfully');
      setIsEditing(false);
      if (onEdit) onEdit();
    } catch (error) {
      console.error('Error updating feedback:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to update feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md border border-gray-100 bg-gradient-to-b from-white to-[#FCFBF8] backdrop-blur">
      <div className="p-4 flex flex-col gap-3">
        {/* Event info (if available) */}
        {feedback.events && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#E8F4FF] rounded-lg overflow-hidden flex-shrink-0 relative">
              {feedback.events.img_url ? (
                <Image 
                  src={feedback.events.img_url} 
                  alt={feedback.events.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm sm:text-base truncate">
                {feedback.events.name}
              </h3>
              <p className="text-xs text-gray-500">Event feedback</p>
            </div>
          </div>
        )}
        
        {!feedback.events && (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <div className="h-8 w-8 bg-[#E6F7FF] rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <span>Website feedback</span>
          </div>
        )}
        
        {/* Display mode */}
        {!isEditing ? (
          <>
            {/* Rating */}
            <div className="flex items-center gap-1 bg-[#FFF9F0] px-3 py-2 rounded-md">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= feedback.rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-amber-200'
                  }`}
                />
              ))}
              <span className="text-xs font-medium ml-1.5 text-amber-700">{feedback.rating}/5</span>
            </div>
            
            {/* Feedback text */}
            {feedback.feedback_text && (
              <div className="bg-[#F0F7FF]/50 rounded-lg p-3 mt-0.5 border border-blue-50">
                <p className="text-sm text-gray-700">{feedback.feedback_text}</p>
              </div>
            )}
          </>
        ) : (
          /* Edit mode */
          <div className="space-y-3 border border-blue-100 p-3 rounded-xl bg-blue-50/30">
            {formError && (
              <Alert variant="destructive" className="mb-3 py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">{formError}</AlertDescription>
              </Alert>
            )}
            
            {/* Rating edit */}
            <div className="space-y-1">
              <Label htmlFor="editRating" className="text-xs font-medium">Edit Rating</Label>
              <div className="flex items-center p-2 bg-white rounded-lg border border-gray-200">
                <div className="flex gap-1" id="editRating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditRating(value)}
                      onMouseEnter={() => setHoverRating(value)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-5 w-5 transition-colors ${
                          (hoverRating ? value <= hoverRating : value <= editRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-amber-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium ml-1.5 text-gray-500">{hoverRating || editRating}/5</span>
              </div>
            </div>
            
            {/* Feedback text edit */}
            <div className="space-y-1">
              <Label htmlFor="editFeedback" className="text-xs font-medium">Edit Comments (optional)</Label>
              <Textarea
                id="editFeedback"
                value={editFeedbackText}
                onChange={(e) => setEditFeedbackText(e.target.value)}
                placeholder="Share your thoughts..."
                className="h-20 text-sm resize-none bg-white/90"
              />
            </div>
            
            {/* Anonymous option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="editAnonymous"
                checked={editAnonymous}
                onCheckedChange={(checked) => setEditAnonymous(checked === true)}
                className="border-gray-300 data-[state=checked]:bg-blue-500"
              />
              <Label 
                htmlFor="editAnonymous"
                className="text-xs cursor-pointer"
              >
                Submit anonymously
              </Label>
            </div>
            
            {/* Edit actions */}
            <div className="flex justify-end space-x-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={cancelEditing}
                disabled={submitting}
                className="h-8 text-xs border-gray-200"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              
              <Button
                type="button" 
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="h-8 text-xs bg-blue-500"
              >
                {submitting ? (
                  <>
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Metadata and actions */}
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal bg-white/90 border-lavender-200 text-gray-600">
              {formatDate(feedback.created_at)}
            </Badge>
            
            {feedback.anonymous && (
              <Badge variant="secondary" className="text-xs font-normal bg-purple-50 text-purple-600">
                Anonymous
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {!isEditing && (
              <button
                onClick={startEditing}
                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="Edit feedback"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              aria-label="Delete feedback"
            >
              {isDeleting ? (
                <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
