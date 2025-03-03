import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  startTime: number;
  answered?: boolean;
  isCorrect?: boolean;
  question_number?: number;
}

interface MathQuizRoundProps {
  roundId: string;
  progressId: string;
  timeLimit: number;
  onComplete: (results: any) => void;
  attempts?: number;
  maxAttempts?: number;
}

export function MathQuizRound({ 
  roundId, 
  progressId, 
  timeLimit, 
  onComplete,
  attempts = 1,
  maxAttempts = 3
}: MathQuizRoundProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, isCorrect: false });
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on question change
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, loading]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/techtreasurehunt/questions?progressId=${progressId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch questions");
        }
        
        const data = await response.json();
        
        // Add startTime to each question for response time tracking
        const questionsWithTime = data.questions.map((q: any) => ({
          ...q,
          startTime: Date.now(),
          answered: false,
          isCorrect: false
        }));
        
        setQuestions(questionsWithTime);
      } catch (error) {
        console.error("Error fetching questions:", error);
        const message = error instanceof Error ? error.message : "Error fetching questions";
        setError(message);
        toast.error("Failed to load quiz questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [progressId]);

  // Complete the quiz - wrap in useCallback to avoid recreation on each render
  const completeQuiz = useCallback(async () => {
    try {
      console.log('Completing quiz...', { progressId });
      
      const allAnswered = questions.every(q => q.answered === true);
      
      // If not all questions are answered, calculate the score but don't pass them
      if (!allAnswered) {
        console.log("Not all questions were answered");
      }
      
      const response = await fetch('/api/techtreasurehunt/complete-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId,
          totalTimeSeconds: timeLimit - timeRemaining,
          forceComplete: true, // Even if not all questions are answered
          autoPass: false     // Only pass if they've met the passing criteria
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to complete quiz");
      }
      
      const result = await response.json();
      
      if (result.results) {
        onComplete(result.results);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error completing quiz:", error);
      toast.error("Failed to submit quiz results");
      // Handle the error gracefully - return to quiz list or show retry button
    }
  }, [progressId, timeLimit, timeRemaining, onComplete, questions]);

  // Set up timer with completeQuiz as a dependency
  const handleTimeUp = useCallback(async () => {
    if (!completed) {
      setCompleted(true);
      toast.warning("Time's up! Submitting your answers...");
      await completeQuiz();
    }
  }, [completed, completeQuiz]);

  // Timer effect
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

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (submitting || answer.trim() === "") return;
    
    setSubmitting(true);
    
    try {
      const currentQuestion = questions[currentIndex];
      const responseTime = Date.now() - currentQuestion.startTime;
      
      const response = await fetch('/api/techtreasurehunt/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId,
          questionId: currentQuestion.id,
          questionNumber: currentQuestion.question_number || currentIndex + 1,
          answer: parseFloat(answer),
          responseTimeMs: responseTime
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }
      
      const result = await response.json();
      
      setFeedback({
        visible: true,
        isCorrect: result.isCorrect
      });
      
      // Update the question in our array
      setQuestions(prevQuestions => prevQuestions.map((q, idx) => 
        idx === currentIndex ? { 
          ...q, 
          answered: true, 
          isCorrect: result.isCorrect 
        } : q
      ));
      
      // Short delay to show feedback
      setTimeout(() => {
        setFeedback({ visible: false, isCorrect: false });
        
        // Move to next question or complete if done
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setAnswer("");
        } else {
          // All questions completed, show results
          setCompleted(true);
          completeQuiz();
        }
        
      }, 1500);
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Enter key handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitting && answer.trim() !== "") {
      handleSubmitAnswer();
    }
  };

  // Handle errors with retry option
  if (error) {
    return (
      <div className="rounded-xl overflow-hidden bg-gradient-to-b from-white/95 to-red-50/90 backdrop-blur-md border border-red-100 shadow-sm p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="border-red-200 hover:bg-red-50 text-red-600"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden bg-gradient-to-b from-white/95 to-indigo-50/90 backdrop-blur-md border border-indigo-100 shadow-sm p-6">
        <div className="flex justify-center items-center min-h-[300px] flex-col gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-indigo-800 font-medium">Loading math quiz questions...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!questions.length) {
    return (
      <div className="rounded-xl overflow-hidden bg-gradient-to-b from-white/95 to-amber-50/90 backdrop-blur-md border border-amber-100 shadow-sm p-6 text-center">
        <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Found</h3>
        <p className="text-gray-600 mb-4">We couldn&apos;t find any questions for this round.</p>
        <Button onClick={() => window.location.reload()} className="bg-amber-600 hover:bg-amber-700">
          Refresh
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter(q => q.answered).length;
  const timerPercentage = (timeRemaining / timeLimit) * 100;
  const timerColorClass = 
    timerPercentage > 60 ? "bg-green-500" : 
    timerPercentage > 30 ? "bg-amber-500" : 
    "bg-red-500";

  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-b from-white/95 to-indigo-50/90 backdrop-blur-md border border-indigo-100 shadow-sm">
      {/* Quiz header with timer and progress */}
      <div className="bg-indigo-50 px-5 py-3 border-b border-indigo-100">
        <div className="flex flex-wrap justify-between items-center gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-indigo-800">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {answeredCount} / {questions.length} answered
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-800" />
            <span className="text-sm font-medium text-indigo-800">
              {formatTimeRemaining()}
            </span>
            <div className="w-16 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${timerColorClass} transition-all duration-1000 ease-linear`} 
                style={{ width: `${timerPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <Progress value={(answeredCount / questions.length) * 100} className="h-1.5" />

      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border border-indigo-100 shadow-sm overflow-hidden bg-white">
              {/* Question display */}
              <div className="p-6 text-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-8 flex items-center justify-center min-h-[80px] bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 p-4">
                  {currentQuestion?.question || "Loading question..."}
                </div>
                
                <div className="w-full max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      ref={inputRef}
                      value={answer}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers, decimal point, and minus sign
                        if (/^-?\d*\.?\d*$/.test(value) || value === "") {
                          setAnswer(value);
                        }
                      }}
                      type="text"
                      placeholder="Enter your answer"
                      className="text-lg text-center"
                      onKeyDown={handleKeyDown}
                      disabled={submitting}
                      autoFocus
                    />
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answer.trim()}
                      className="sm:w-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Checking...
                        </>
                      ) : 'Submit'}
                    </Button>
                  </div>
                  
                  {/* Feedback animation */}
                  <AnimatePresence>
                    {feedback.visible && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4"
                      >
                        {feedback.isCorrect ? (
                          <div className="flex items-center justify-center text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                            <CheckCircle className="mr-2 h-5 w-5" />
                            <span className="font-medium">Correct!</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-red-600 bg-red-50 px-4 py-2 rounded-full border border-red-200">
                            <XCircle className="mr-2 h-5 w-5" />
                            <span className="font-medium">Incorrect</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
        
        {/* Question navigation dots */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full ${
                  idx === currentIndex
                    ? 'bg-indigo-600'
                    : q.answered 
                      ? q.isCorrect 
                        ? 'bg-green-400' 
                        : 'bg-red-400'
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
