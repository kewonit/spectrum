'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';
import { Card } from "@/components/ui/card";
import { FeedbackForm, FeedbackFormData } from './FeedbackForm';
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackCardProps {
  feedback: {
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
  };
  isOwner: boolean;
  onUpdate: (data: FeedbackFormData) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function FeedbackCard({ feedback, isOwner, onUpdate, onDelete }: FeedbackCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const formattedDate = formatDistanceToNow(new Date(feedback.updated_at), { addSuffix: true });
  
  // Only show the user name if not anonymous and user exists
  const displayName = feedback.anonymous ? 'Anonymous User' : (feedback.user?.full_name || 'User');
  
  // Handle edit button click
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  // Handle update submission
  const handleUpdate = async (data: FeedbackFormData) => {
    await onUpdate(data);
    setIsEditing(false);
  };
  
  // Handle delete
  const handleDelete = async () => {
    await onDelete();
  };
  
  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm">
      {isEditing ? (
        <FeedbackForm
          initialData={{
            id: feedback.id,
            rating: feedback.rating,
            feedback_text: feedback.feedback_text || '',
            anonymous: feedback.anonymous,
            event_id: feedback.event_id
          }}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          onDelete={handleDelete}
          isEditing={true}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <StarRating initialRating={feedback.rating} readOnly size="sm" />
            <span className="text-xs text-gray-500">({feedback.rating}/5)</span>
          </div>
          
          {feedback.feedback_text && (
            <p className="text-sm text-gray-700">{feedback.feedback_text}</p>
          )}
          
          {isOwner && (
            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={handleEdit}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors text-xs sm:text-sm"
                aria-label="Edit feedback"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              
              <button 
                onClick={() => {
                  if(confirm("Are you sure you want to delete this feedback?")) {
                    handleDelete();
                  }
                }}
                className="flex items-center text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Delete feedback"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
            <span>{displayName}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
