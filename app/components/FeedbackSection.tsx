"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, RefreshCw, Star, ChevronUp, ChevronDown } from "lucide-react";
import { FeedbackCard } from "./FeedbackCard";
import { EmptyFeedbackState } from "./EmptyFeedbackState";
import { toast } from "sonner";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle } from "lucide-react";

// Define a simple utility function for class name joining
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Form states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchFeedback = async () => {
    try {
      const response = await fetch('/api/feedback');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFeedback();
    setIsRefreshing(false);
  };

  const resetForm = () => {
    setRating(5);
    setFeedbackText('');
    setAnonymous(false);
    setFormError(null);
  };

  const toggleFeedbackForm = () => {
    if (showFeedbackForm) {
      resetForm();
    }
    setShowFeedbackForm(!showFeedbackForm);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: null,
          rating,
          feedbackText: feedbackText.trim() || null,
          anonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      toast.success('Feedback submitted successfully!');
      resetForm();
      setShowFeedbackForm(false);
      handleRefresh();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-[#F0F7FF]/40 to-[#F9F5FF]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6F7FF] p-2 rounded-full shadow-sm">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-800">Website Feedback</h2>
              <p className="text-sm text-gray-600">Help us improve your Spectrum platform experience</p>
            </div>
          </div>
          
          <div className="flex gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 px-3 border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <Button
              onClick={toggleFeedbackForm}
              size="sm"
              variant={showFeedbackForm ? "outline" : "default"}
              className={showFeedbackForm ? 'border-gray-200 hover:bg-gray-50' : 'bg-blue-500 hover:bg-blue-600'}
            >
              {showFeedbackForm ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Add Feedback</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Inline Feedback Form */}
      {showFeedbackForm && (
        <div className="border-b border-gray-100">
          <Card className="m-4 sm:m-6 bg-[#FAF9F6] shadow-none border border-gray-200">
            <div className="pb-2 pt-4 px-6">
              <h3 className="text-lg font-medium text-gray-900">Share Your Website Feedback</h3>
            </div>
            <div className="px-6 pb-6">
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                {formError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                
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

                {/* Feedback text */}
                <div className="space-y-2">
                  <Label htmlFor="feedbackText" className="text-sm font-medium">Your Comments (optional)</Label>
                  <Textarea
                    id="feedbackText"
                    placeholder="Share your thoughts about the website, any issues you've encountered, or suggestions for improvement..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="h-28 resize-none bg-white/80 border-gray-200 focus-visible:ring-blue-300 focus-visible:border-blue-300"
                  />
                  <p className="text-xs text-gray-500">
                    Your feedback helps us improve the Spectrum website and platform experience.
                  </p>
                </div>

                {/* Anonymous option */}
                <div className="flex items-center space-x-3 pt-1">
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
                      Submit anonymously (hide your name)
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={toggleFeedbackForm}
                    disabled={submitting}
                    className="border-gray-200 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || rating < 1}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : 'Submit Feedback'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="py-10 flex justify-center">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feedback.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {feedback.map((item) => (
              <FeedbackCard 
                key={item.id} 
                feedback={item} 
                onDelete={handleRefresh}
                onEdit={handleRefresh}
              />
            ))}
          </div>
        ) : (
          <EmptyFeedbackState />
        )}
      </div>
    </div>
  );
}
