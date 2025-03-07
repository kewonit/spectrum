'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { FeedbackForm, FeedbackFormData } from './FeedbackForm';
import { MessageSquare, Badge as BadgeIcon, Star, Pencil, Trash2, AlertCircle, ChevronUp, ChevronDown, Laptop } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FeedbackSectionProps {
  profileId: string;
  userName: string;
}

export function FeedbackSection({ profileId, userName }: FeedbackSectionProps) {
  const [myFeedback, setMyFeedback] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/feedback');
        const data = await response.json();
        
        if (response.ok) {
          setMyFeedback(data.userFeedback || null);
        }
      } catch (error) {
        console.error('Failed to fetch feedback:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (profileId) {
      fetchFeedback();
    }
  }, [profileId]);
  
  const handleSubmitFeedback = async (data: FeedbackFormData) => {
    try {
      const response = await fetch('/api/user/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      const result = await response.json();
      setMyFeedback(result.feedback);
      setIsEditing(false);
      toast.success("Thank you for your website feedback! 🙌", {
        description: "Your insights help us improve Spectrum's web experience"
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };
  
  const handleUpdateFeedback = async (data: FeedbackFormData) => {
    if (!data.id) return;
    
    try {
      const response = await fetch(`/api/user/feedback/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }
      
      const result = await response.json();
      setMyFeedback(result.feedback);
      setIsEditing(false);
      toast.success("Your website feedback has been updated", {
        description: "Thank you for keeping your review current"
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  };
  
  const handleDeleteFeedback = async (id: string) => {
    try {
      const response = await fetch(`/api/user/feedback/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }
      
      setMyFeedback(null);
      setIsEditing(false);
      toast.success("Your website feedback has been deleted");
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  };

  // Helper function to render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden bg-[#EBE9E0]/40 backdrop-blur border-2 border-gray-300 rounded-2xl shadow-sm max-w-[1400px] mx-auto">
      <Collapsible
        open={expanded}
        onOpenChange={setExpanded}
      >
        <CollapsibleTrigger asChild>
          <div className="p-4 sm:p-5 lg:p-6 border-b-2 border-gray-300 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between cursor-pointer bg-[#EBE9E0]/30 hover:bg-[#EBE9E0]/40 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#EBE9E0]/80 p-1.5 rounded-full">
                {/* Changed icon to match the Dashboard section icons styling */}
                <Laptop className="h-5 w-5 text-primary/80" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-lg lg:text-xl">Website Feedback</h3>
                <p className="text-xs text-gray-600 mt-0.5 sm:hidden">Help us improve our website</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
              {myFeedback && !isEditing && (
                <Badge variant="outline" className="bg-[#EBE9E0]/70 text-gray-700 px-3 py-1.5 text-sm sm:text-base font-medium h-9 sm:h-10 flex items-center justify-center border-2 border-gray-300">
                  <BadgeIcon className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="whitespace-nowrap">
                    {myFeedback.rating}/5 Stars
                  </span>
                </Badge>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 sm:h-9 sm:w-9 border border-gray-300 rounded-full bg-white/50 hover:bg-white/80"
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle feedback section</span>
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 sm:p-6 lg:p-8 bg-white/20">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-32 ml-auto" />
              </div>
            ) : (
              <>
                {/* Submitted Feedback View */}
                {myFeedback && !isEditing ? (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                    {/* Website feedback notice - styled to match the dashboard alerts */}
                    <div className="mb-4 px-3 py-2.5 bg-blue-50/80 border border-blue-100 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
                      <p className="text-xs sm:text-sm text-blue-700">
                        This feedback is about the <span className="font-medium">website</span> only, not about events
                      </p>
                    </div>
                    
                    {/* Moved buttons below content for better mobile experience */}
                    <div className="flex flex-col gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="text-base sm:text-lg font-medium text-gray-800">
                          Your Website Review
                        </h4>
                        <div className="flex items-center gap-2">
                          {renderStars(myFeedback.rating)}
                          <span className="text-sm text-gray-500 font-medium">{myFeedback.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    {myFeedback.feedback_text ? (
                      <div className="bg-[#EBE9E0]/40 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200">
                        <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{myFeedback.feedback_text}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 border border-gray-200 text-gray-500 italic text-xs sm:text-sm">
                        You submitted a rating without additional comments.
                      </div>
                    )}
                    
                    {/* Action buttons moved below content */}
                    <div className="flex items-center gap-2 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-8 sm:h-9 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300"
                      >
                        <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete your feedback?")) {
                            handleDeleteFeedback(myFeedback.id);
                          }
                        }}
                        className="h-8 w-8 sm:h-9 sm:w-9 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="sr-only">Delete feedback</span>
                      </Button>
                    </div>
                    
                    {/* Changed from showing anonymous/public status to just showing submission date */}
                    <div className="flex justify-end items-center mt-4 text-xs text-gray-500">
                      <div>
                        Submitted: {new Date(myFeedback.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-50 p-1.5 rounded-full shrink-0 mt-0.5">
                          <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Thank you for helping us improve our website! Your feedback helps us enhance the user experience.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                    {/* Website feedback notice - styled to match the dashboard alerts */}
                    <div className="mb-4 px-3 py-2.5 bg-blue-50/80 border border-blue-100 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
                      <p className="text-xs sm:text-sm text-blue-700">
                        This feedback is about the <span className="font-medium">website</span> only, not about events
                      </p>
                    </div>
                    
                    <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                      <h4 className="text-base sm:text-lg font-medium text-gray-800">
                        Edit your website review
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Update your rating and comments about our website. Your honest feedback helps us improve.
                      </p>
                    </div>
                    <FeedbackForm
                      initialData={{
                        id: myFeedback.id,
                        rating: myFeedback.rating,
                        feedback_text: myFeedback.feedback_text || '',
                        anonymous: false // Keep this for compatibility but it won't be shown
                      }}
                      onSubmit={handleUpdateFeedback}
                      onCancel={() => setIsEditing(false)}
                      onDelete={() => handleDeleteFeedback(myFeedback.id)}
                      isEditing={true}
                    />
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Website feedback notice - styled to match the dashboard alerts */}
                    <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-3 sm:p-4 flex items-center gap-2.5">
                      <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
                      <p className="text-xs sm:text-sm text-blue-700">
                        This feedback is about the <span className="font-medium">website</span> only, not about events
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-white/60 to-[#EBE9E0]/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                      <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-5 w-5 text-primary/80 shrink-0" />
                          <h4 className="text-base sm:text-lg font-medium text-gray-800">
                            Rate Your Website Experience
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-2">
                          We value your opinion on our website! Please share how you find the usability, design, and functionality of Spectrum&apos;s website.
                        </p>
                      </div>
                      <FeedbackForm
                        onSubmit={handleSubmitFeedback}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
