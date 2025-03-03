import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  startTime: number;
  answered?: boolean;  // Add this property
  isCorrect?: boolean; // Add this property
  question_number?: number;
}

interface MathQuizRoundProps {
  roundId: string;
  progressId: string;
  timeLimit: number;
  onComplete: (results: any) => void;
  attempts?: number; // Add optional attempts prop
  maxAttempts?: number; // Add optional maxAttempts prop
}

export function MathQuizRound({ 
  roundId, 
  progressId, 
  timeLimit, 
  onComplete,
  attempts, // Optional props - not used in this component
  maxAttempts
}: MathQuizRoundProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ visible: false, isCorrect: false });
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [completed, setCompleted] = useState(false);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/techtreasurehunt/questions?progressId=${progressId}`);
        const data = await response.json();
        
        if (response.ok) {
          // Add startTime to each question for response time tracking
          const questionsWithTime = data.questions.map((q: any) => ({
            ...q,
            startTime: Date.now(),
            answered: false,
            isCorrect: false
          }));
          
          setQuestions(questionsWithTime);
          setLoading(false);
        } else {
          console.error("Failed to fetch questions:", data.error);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
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
      
      const result = await response.json();
      
      if (response.ok && result.results) {
        onComplete(result.results);
      } else {
        console.error("Error completing quiz:", result.error);
      }
    } catch (error) {
      console.error("Error completing quiz:", error);
    }
  }, [progressId, timeLimit, timeRemaining, onComplete, questions]); // Add all dependencies

  // Set up timer - now with completeQuiz as a dependency
  const handleTimeUp = useCallback(async () => {
    if (!completed) {
      setCompleted(true);
      await completeQuiz();
    }
  }, [completed, completeQuiz]); // Add completeQuiz as a dependency

  // Timer effect
  useEffect(() => {
    if (loading || completed) return;

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
  }, [loading, completed, handleTimeUp]);

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (submitting || answer === "") return;
    
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
      
      const result = await response.json();
      
      if (response.ok) {
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
      } else {
        console.error("Error submitting answer:", result.error);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Enter key handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitAnswer();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter(q => q.answered).length;
  const timerPercentage = (timeRemaining / timeLimit) * 100;
  const timerColor = timerPercentage > 60 ? "bg-green-500" : timerPercentage > 30 ? "bg-amber-500" : "bg-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            {answeredCount} / {questions.length} answered
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

      <Progress value={(answeredCount / questions.length) * 100} className="h-2 mb-6" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 mb-6 border border-amber-100 shadow-md bg-gradient-to-br from-white to-amber-50/30">
            <div className="text-center">
              <div className="text-3xl font-bold mb-8 flex items-center justify-center h-24 bg-amber-50 rounded-lg border border-amber-100">
                {currentQuestion?.question || "Loading question..."}
              </div>
              
              <div className="w-full max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                <Input
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
                />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !answer}
                  className="sm:w-auto w-full bg-amber-600 hover:bg-amber-700 text-white transition-all"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {submitting ? 'Checking...' : 'Submit'}
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
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center">
        <div className="flex space-x-1">
          {questions.map((_, idx) => (
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
