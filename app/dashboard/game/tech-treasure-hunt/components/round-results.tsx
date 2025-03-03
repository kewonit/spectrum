import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, BarChart, RefreshCw, Award, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner'; // Fixed import

interface Round {
  id: string;
  name: string;
  round_number: number;
}

interface Answer {
  question: string;
  answer: number;
  correct_answer: number;
  is_correct: boolean;
}

interface RoundResults {
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  totalTime: number;
  avgResponseTime: number;
  answers: Answer[];
  progressId: string; // Added this property to fix the TypeScript error
}

interface RoundResultsProps {
  results: RoundResults;
  round: Round;
  onRetry: () => Promise<void>;
  onNextRound?: (nextRoundId: string) => Promise<void>; // Add this new prop
  attempts?: number;
  maxAttempts?: number;
}

export function RoundResults({ 
  results, 
  round, 
  onRetry,
  onNextRound, // New prop
  attempts = 1,
  maxAttempts = 3
}: RoundResultsProps) {
  const percentage = Math.round((results.correctCount / results.totalQuestions) * 100);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextRoundInfo, setNextRoundInfo] = useState<{ hasNextRound: boolean, nextRound: any } | null>(null);
  
  // Calculate if user can retry based on attempts
  const canRetry = attempts < maxAttempts || results.passed;
  
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Add debug logging
      console.log("Retry with data:", {
        progressId: results.progressId,
        roundId: round.id,
        resultsData: results
      });
      
      // Ensure progressId exists before making the API call
      if (!results.progressId) {
        console.error("Missing progressId in results:", results);
        throw new Error("Cannot retry: missing progressId");
      }
      
      const response = await fetch('/api/techtreasurehunt/reset-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          progressId: results.progressId,
          roundId: round.id 
        }),
      });
      
      // Add response logging
      const responseData = await response.json();
      console.log("Reset round response:", responseData);
      
      if (!response.ok) {
        throw new Error(`Failed to reset round: ${responseData.error || 'Unknown error'}`);
      }
      
      await onRetry();
    } catch (error) {
      console.error("Failed to retry round:", error);
      alert("Failed to retry round. Please reload the page and try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  // Load next round information
  useEffect(() => {
    async function checkNextRound() {
      try {
        const response = await fetch(`/api/techtreasurehunt/next-round?currentRoundId=${round.id}`);
        if (response.ok) {
          const data = await response.json();
          setNextRoundInfo(data);
        }
      } catch (error) {
        console.error("Error checking for next round:", error);
      }
    }
    
    checkNextRound();
  }, [round.id]);
  
  // Handle next round click
  const handleNextRound = async () => {
    if (!nextRoundInfo?.hasNextRound || !nextRoundInfo.nextRound) {
      toast.error("There's no next round available");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (onNextRound) {
        await onNextRound(nextRoundInfo.nextRound.id);
      } else {
        // Fallback if no handler provided
        window.location.href = `/dashboard/game/tech-treasure-hunt/round/${nextRoundInfo.nextRound.id}`;
      }
    } catch (error) {
      console.error("Error navigating to next round:", error);
      toast.error("Failed to navigate to next round");
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 shadow-md rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center rounded-full p-4 mb-4 ${
          results.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        }`}>
          {results.passed ? (
            <CheckCircle className="h-8 w-8" />
          ) : (
            <XCircle className="h-8 w-8" />
          )}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {results.passed ? 'Round Completed!' : 'Round Failed'}
        </h3>
        <p className="text-gray-600">
          {results.passed 
            ? 'You have successfully completed this round!' 
            : 'Unfortunately, you did not meet the criteria to pass this round.'}
        </p>
        
        {/* Attempts display */}
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Attempt {attempts} of {maxAttempts}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl flex items-center border border-gray-100 shadow-sm">
          <div className="rounded-full bg-indigo-100 p-2 mr-3">
            <BarChart className="text-indigo-600 h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Score</p>
            <p className="font-medium text-lg">{results.correctCount} / {results.totalQuestions} ({percentage}%)</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl flex items-center border border-gray-100 shadow-sm">
          <div className="rounded-full bg-indigo-100 p-2 mr-3">
            <Clock className="text-indigo-600 h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium text-lg">{results.totalTime.toFixed(1)} seconds</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-lg">Questions & Answers</h4>
          <span className="text-sm text-gray-500">
            Avg. Response: {results.avgResponseTime.toFixed(2)}s
          </span>
        </div>
        
        <div className="space-y-3 max-h-72 overflow-y-auto pr-2 styled-scrollbar">
          {results.answers.map((answer, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border ${
                answer.is_correct 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="font-medium mb-1">{answer.question}</p>
                {answer.is_correct 
                  ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                }
              </div>
              <div className="text-sm flex justify-between items-center">
                <span>Your answer: <span className="font-medium">{answer.answer}</span></span>
                {!answer.is_correct && (
                  <span className="font-medium text-gray-700">Correct: {answer.correct_answer}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {/* Award or result message */}
        {results.passed ? (
          <div className="flex items-center text-green-600">
            <Award className="mr-2 h-5 w-5" /> 
            <span className="font-medium">Round passed!</span>
          </div>
        ) : (
          <div className="text-gray-600">
            {canRetry 
              ? `You have ${maxAttempts - attempts} attempts remaining` 
              : "No more attempts remaining"}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetry}
            variant="outline"
            disabled={isRetrying || !canRetry}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {results.passed ? 'Try Next Round' : 'Try Again'}
              </>
            )}
          </Button>
          
          {nextRoundInfo?.hasNextRound ? (
            <Button 
              onClick={handleNextRound}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Loading...
                </>
              ) : (
                <>
                  Try Next Round <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button disabled className="text-gray-500 cursor-not-allowed">
              No Next Round Available
            </Button>
          )}
        </div>
      </div>
      
      {/* Additional styling for scroll area */}
      <style jsx global>{`
        .styled-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .styled-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </motion.div>
  );
}
