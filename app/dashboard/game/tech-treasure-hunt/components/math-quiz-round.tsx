'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  question_number: number;
  question: string;
  correct_answer?: number;
}

interface MathQuizRoundProps {
  roundId: string;
  progressId: string;
  timeLimit: number;
  onComplete: (score: any) => void;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState<{[key: string]: {isCorrect: boolean, answer: number, responseTime: number}}>({});
  const [feedback, setFeedback] = useState<{isCorrect: boolean, visible: boolean}>({ isCorrect: false, visible: false });
  const [nextQuestionPreloaded, setNextQuestionPreloaded] = useState(false);
  
  // Add timer animation
  const timerPercentage = (timeRemaining / timeLimit) * 100;
  const timerColor = timerPercentage > 50 ? 'bg-green-500' : 
                    timerPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500';
  
  // Fetch questions
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(`/api/techtreasurehunt/questions?progressId=${progressId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (err) {
        setError('Failed to load questions. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchQuestions();
  }, [progressId]);
  
  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleTimeUp();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeRemaining]);
  
  const handleTimeUp = useCallback(() => {
    // Submit whatever answers we have
    const finalScore = {
      totalTime: (Date.now() - startTime) / 1000,
      avgResponseTime: Object.values(results).reduce((sum, item) => sum + item.responseTime, 0) / 
                       Math.max(1, Object.values(results).length) / 1000,
      answers: Object.values(results).length
    };
    
    onComplete(finalScore);
  }, [results, startTime, onComplete]);
  
  const moveToNextQuestion = useCallback(() => {
    setAnswer('');
    setFeedback({ isCorrect: false, visible: false });
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setNextQuestionPreloaded(false);
    } else {
      // Quiz complete
      const finalScore = {
        totalTime: (Date.now() - startTime) / 1000,
        avgResponseTime: Object.values(results).reduce((sum, item) => sum + item.responseTime, 0) / questions.length / 1000,
        answers: questions.length
      };
      onComplete(finalScore);
    }
    
    setIsSubmitting(false);
  }, [currentQuestionIndex, questions.length, results, startTime, onComplete]);
  
  // Optimistic UI update + real submission
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isSubmitting) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    setIsSubmitting(true);
    const responseTime = Date.now() - startTime - (timeLimit - timeRemaining) * 1000;
    const numericAnswer = parseFloat(answer);
    
    // Fix: Handle potentially undefined correct_answer
    const correctAnswer = currentQuestion.correct_answer ?? 0;
    
    // Optimistically show feedback (fast UI response)
    // Simple client-side validation
    const likelyCorrect = Math.abs(numericAnswer - correctAnswer) < 0.0001;
    setFeedback({ isCorrect: likelyCorrect, visible: true });
    
    // Preload next question UI state (optimistic)
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setNextQuestionPreloaded(true);
      }, 300); // Small delay to prevent layout thrashing
    }
    
    try {
      // In parallel, submit to server
      const response = await fetch('/api/techtreasurehunt/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId,
          questionId: currentQuestion.id,
          answer: numericAnswer,
          responseTimeMs: responseTime
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit answer');
      
      const data = await response.json();
      
      // Update results with server confirmation
      setResults(prev => ({
        ...prev,
        [currentQuestion.id]: {
          isCorrect: data.isCorrect, // Use server's determination
          answer: numericAnswer,
          responseTime
        }
      }));
      
      // If our optimistic UI was wrong, correct it
      if (likelyCorrect !== data.isCorrect) {
        setFeedback({ isCorrect: data.isCorrect, visible: true });
      }
      
      // Show feedback briefly and move to next question faster
      setTimeout(moveToNextQuestion, 600);
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      setIsSubmitting(false);
      setFeedback({ isCorrect: false, visible: false });
      console.error(err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-gray-600">Loading quiz questions...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
        <p className="text-yellow-600 font-medium">No questions found for this round.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Refresh
        </Button>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          
          {/* Attempts badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Attempt {attempts} of {maxAttempts}
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
      
      <Progress 
        value={(currentQuestionIndex / questions.length) * 100} 
        className="h-2 mb-6"
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 mb-6 border border-indigo-100 shadow-md bg-gradient-to-br from-white to-indigo-50/30">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-800">
              {currentQuestion?.question}
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="number"
                step="any"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter your answer"
                className="text-lg text-center focus:ring-indigo-500 focus:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitAnswer();
                }}
                autoFocus
              />
              
              <Button 
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !answer.trim()}
                className="sm:w-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isSubmitting ? 'Checking...' : 'Submit'}
              </Button>
            </div>
            
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

            {/* Keyboard shortcuts help */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>Press <kbd className="px-1.5 py-0.5 mx-1 border rounded-md bg-gray-100">Enter</kbd> to submit your answer</p>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Progress indicator at the bottom */}
      <div className="flex justify-center">
        {questions.length > 0 && (
          <div className="flex space-x-1">
            {questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full ${
                  idx === currentQuestionIndex ? 'bg-indigo-600' :
                  idx < currentQuestionIndex ? 'bg-indigo-300' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
