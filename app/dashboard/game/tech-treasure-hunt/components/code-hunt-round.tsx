import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ClockIcon, Loader2, XCircle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ImageCode {
  id: string;
  url: string;
  hint?: string;
  isCorrect?: boolean;
  attempts: number;
  maxAttempts: number;
}

interface CodeHuntRoundProps {
  roundId: string;
  progressId: string;
  timeLimit: number;
  onComplete: (results: any) => void;
}

export function CodeHuntRound({ roundId, progressId, timeLimit, onComplete }: CodeHuntRoundProps) {
  const [images, setImages] = useState<ImageCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, isCorrect: false });
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerPercentage = (timeRemaining / timeLimit) * 100;
  const timerColor = timerPercentage > 60 ? "bg-green-500" : timerPercentage > 30 ? "bg-amber-500" : "bg-red-500";

  // Fetch image data
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        console.log(`Fetching images for progress ID: ${progressId}`);
        
        const response = await fetch(`/api/techtreasurehunt/image-codes?progressId=${progressId}`);
        const data = await response.json();
        
        if (response.ok) {
          console.log(`Received ${data.images?.length || 0} images:`, data.images);
          setImages(data.images || []);
          
          // Update time limit if provided by the API
          if (data.timeLimit && data.timeLimit !== timeLimit) {
            console.log(`Updating time limit from ${timeLimit} to ${data.timeLimit}`);
            setTimeRemaining(data.timeLimit);
          }
        } else {
          console.error("Failed to fetch images:", data.error);
          setError(`Failed to load images: ${data.error || 'Unknown error'}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching images:", error);
        setError(`Failed to load images: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchImages();
  }, [progressId, timeLimit]);

  // Memoize handleTimeUp using useCallback to avoid dependency issues
  const handleTimeUp = useCallback(async () => {
    if (!completed) {
      setCompleted(true);
      await completeRound();
    }
  }, [completed]); // Will add completeRound as a dependency after its definition

  // Setup timer with proper dependencies
  useEffect(() => {
    if (loading || completed || error) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, completed, handleTimeUp, error]);

  // Focus input when changing images
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, loading]);

  const handleSubmitCode = async () => {
    if (!code.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const currentImage = images[currentIndex];
      
      console.log(`Submitting code "${code}" for image ${currentImage.id}`);
      
      const response = await fetch('/api/techtreasurehunt/submit-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId,
          roundId,
          imageId: currentImage.id,
          code: code.trim()
        })
      });
      
      const result = await response.json();
      
      console.log("Submission result:", result);
      
      // Update the image with new data
      if (response.ok) {
        setFeedback({ 
          visible: true, 
          isCorrect: result.isCorrect 
        });
        
        // Update images array with submission result
        setImages(prevImages => prevImages.map((img, idx) => 
          idx === currentIndex 
            ? { 
                ...img, 
                isCorrect: result.isCorrect,
                attempts: result.attempts 
              } 
            : img
        ));
        
        // Clear feedback after 1.5 seconds
        setTimeout(() => {
          setFeedback({ visible: false, isCorrect: false });
          
          // If correct, move to next image or complete if all done
          if (result.isCorrect) {
            if (currentIndex < images.length - 1) {
              setCurrentIndex(prev => prev + 1);
              setCode("");
            } else {
              // All images completed successfully
              setCompleted(true);
              completeRound();
            }
          } else {
            setCode("");
          }
        }, 1500);
      } else {
        console.error("Error submitting code:", result.error);
        setError(`Error: ${result.error || 'Failed to submit code'}`);
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      setError(`Error: ${error instanceof Error ? error.message : 'Failed to submit code'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define completeRound before using it in handleTimeUp
  const completeRound = useCallback(async () => {
    try {
      console.log(`Completing round with progress ID: ${progressId}`);
      
      const response = await fetch('/api/techtreasurehunt/complete-image-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId,
          totalTimeSeconds: timeLimit - timeRemaining
        })
      });
      
      const result = await response.json();
      
      console.log("Round completion result:", result);
      
      if (response.ok && result.results) {
        onComplete(result.results);
      } else {
        console.error("Error completing round:", result.error);
        setError(`Failed to complete round: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error completing round:", error);
      setError(`Failed to complete round: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [progressId, timeLimit, timeRemaining, onComplete]);

  // Handle keydown for submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitCode();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex flex-col items-center justify-center text-center">
          <XCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-700 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 text-amber-600 mb-4 animate-spin" />
          <h3 className="text-xl font-bold mb-2">No images found</h3>
          <p className="text-gray-600">
            There are no images available for this round. Please contact support.
          </p>
        </div>
      </Card>
    );
  }

  // Count completed images
  const completedCount = images.filter(img => img.isCorrect).length;
  const currentImage = images[currentIndex];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">
            Image {currentIndex + 1} of {images.length}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {completedCount} / {images.length} completed
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-500 mb-1">
            Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${timerColor} transition-all duration-1000 ease-linear`} 
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <Progress value={(completedCount / images.length) * 100} className="h-2 mb-6" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 mb-6 border border-amber-100 shadow-md bg-gradient-to-br from-white to-amber-50/30">
            <div className="flex flex-col items-center">
              {/* Attempts counter */}
              <div className="self-end mb-2 text-sm text-gray-500">
                Attempts: {currentImage?.attempts || 0}/{currentImage?.maxAttempts || 3}
              </div>
              
              {/* Image container */}
              <div className="relative w-full max-w-md mx-auto mb-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {currentImage?.url ? (
                  /* eslint-disable @next/next/no-img-element */
                  <img 
                    src={currentImage.url} 
                    alt={`Code challenge ${currentIndex + 1}`} 
                    className="w-full h-auto object-contain"
                    onError={(e) => {
                      // Use a fallback image if the original fails to load
                      e.currentTarget.src = `https://placehold.co/600x400/png?text=Image+${currentIndex+1}`;
                    }}
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <span className="text-gray-400">Image not available</span>
                  </div>
                )}
              </div>
              
              {/* Hint */}
              {currentImage?.hint && (
                <div className="text-sm italic text-gray-600 mb-4 text-center">
                  Hint: {currentImage.hint}
                </div>
              )}
              
              {/* Code input */}
              <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
                <Input
                  ref={inputRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isSubmitting || currentImage?.isCorrect}
                  placeholder="Enter code"
                  className="text-lg text-center focus:ring-amber-500 focus:border-amber-500"
                  onKeyDown={handleKeyDown}
                  maxLength={10}
                />
                <Button
                  onClick={handleSubmitCode}
                  disabled={isSubmitting || !code.trim() || currentImage?.isCorrect}
                  className="sm:w-auto w-full bg-amber-600 hover:bg-amber-700 text-white transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isSubmitting ? 'Checking...' : 'Submit'}
                </Button>
              </div>
              
              {/* Feedback */}
              <AnimatePresence>
                {feedback.visible && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center justify-center"
                  >
                    {feedback.isCorrect ? (
                      <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        <span className="font-medium">Correct!</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-full">
                        <XCircle className="mr-2 h-5 w-5" />
                        <span className="font-medium">Incorrect</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Help text */}
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>Enter the code exactly as it appears in the image. Codes are case-sensitive.</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center">
        <div className="flex space-x-1">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx === currentIndex
                  ? 'bg-amber-600'
                  : idx < currentIndex
                  ? 'bg-amber-300'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
