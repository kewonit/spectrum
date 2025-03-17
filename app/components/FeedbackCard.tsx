"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Edit2, Trash2, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Image from 'next/image';
import { FeedbackFormDialog } from '@/app/components/FeedbackFormDialog';

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
  const [showEditDialog, setShowEditDialog] = useState(false);
  
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
  
  const handleEditComplete = () => {
    setShowEditDialog(false);
    if (onEdit) onEdit();
  };

  return (
    <>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
          {/* Event info (if available) */}
          {feedback.events && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#EBE9E0] rounded-md overflow-hidden flex-shrink-0 relative">
                {feedback.events.img_url ? (
                  <Image 
                    src={feedback.events.img_url} 
                    alt={feedback.events.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-400" />
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
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar className="h-4 w-4" />
              <span>General feedback</span>
            </div>
          )}
          
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= feedback.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm font-medium ml-1.5">{feedback.rating}/5</span>
          </div>
          
          {/* Feedback text */}
          {feedback.feedback_text && (
            <div className="flex gap-2 mt-0.5">
              <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
              <p className="text-sm text-gray-700">{feedback.feedback_text}</p>
            </div>
          )}
          
          {/* Metadata and actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                {formatDate(feedback.created_at)}
              </Badge>
              
              {feedback.anonymous && (
                <Badge variant="secondary" className="text-xs font-normal">
                  Anonymous
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditDialog(true)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="Edit feedback"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Delete feedback"
              >
                {isDeleting ? (
                  <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Edit dialog */}
      <FeedbackFormDialog 
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onSubmit={handleEditComplete}
        feedbackId={feedback.id}
        initialValues={{
          eventId: feedback.events?.id,
          rating: feedback.rating,
          feedbackText: feedback.feedback_text || '',
          anonymous: feedback.anonymous
        }}
        mode="edit"
      />
    </>
  );
}
