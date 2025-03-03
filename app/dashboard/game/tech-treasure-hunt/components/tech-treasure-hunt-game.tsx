'use client';

import React, { useState, useEffect, useRef } from 'react'; // Add useRef
import { MathQuizRound } from '@/app/dashboard/game/tech-treasure-hunt/components/math-quiz-round';
import { RoundStartCard } from '@/app/dashboard/game/tech-treasure-hunt/components/round-start-card';
import { RoundResults } from '@/app/dashboard/game/tech-treasure-hunt/components/round-results';
import { GameHeader } from './game-header';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CodeHuntRound } from '@/app/dashboard/game/tech-treasure-hunt/components/code-hunt-round';
import { toast } from 'sonner';
import { normalizeRoundType } from '../debug-utils';
import { RefreshConfirmationDialog } from './refresh-confirmation-dialog';

type GameStatus = 'loading' | 'not_started' | 'in_progress' | 'completed';
type RoundStatus = 'not_started' | 'starting' | 'in_progress' | 'evaluating' | 'completed';

interface Round {
  id: string;
  name: string;
  description: string;
  round_number: number;
  round_type: string;
  time_limit: number;
}

export function TechTreasureHuntGame() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('loading');
  const [roundStatus, setRoundStatus] = useState<RoundStatus>('not_started');
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [roundResults, setRoundResults] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(1);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [roundType, setRoundType] = useState<string>('');
  const [isFailedRedirect, setIsFailedRedirect] = useState(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);

  // Add a ref to track the safety timeout
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear safety timeout if component unmounts
  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function fetchGameStatus() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/techtreasurehunt/status');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch game status');
        }
        
        const data = await response.json();
        console.log("Game status response:", data);
        
        // Set the game status from API response
        setGameStatus(data.status);
        
        if (data.currentRound) {
          setCurrentRound(data.currentRound);
          
          // Normalize and store the round type
          const normalizedType = normalizeRoundType(data.currentRound.round_type || '');
          setRoundType(normalizedType);
        }
        
        if (data.progressId) {
          setProgressId(data.progressId);
          
          // Fetch progress details to get attempts information
          try {
            const progressResponse = await fetch(`/api/techtreasurehunt/progress?progressId=${data.progressId}`);
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              if (progressData.progress) {
                setAttempts(progressData.progress.attempts || 1);
                setMaxAttempts(progressData.progress.max_attempts || 3);
              }
            }
          } catch (progressError) {
            console.warn("Could not fetch progress details:", progressError);
            // Non-critical error, continue with default values
          }
        }
        
        if (data.status === 'not_started') {
          setRoundStatus('not_started');
        } else if (data.status === 'in_progress') {
          setRoundStatus('in_progress');
        } else if (data.status === 'completed' && data.roundResults) {
          setRoundResults(data.roundResults);
          setRoundStatus('completed');
        }
      } catch (err) {
        setError('Failed to load game. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGameStatus();
  }, []);

  const startRound = async () => {
    if (!currentRound) return Promise.reject(new Error("No current round"));
    
    // Clear any existing safety timeout
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
    }
    
    setRoundStatus('starting');
    setError(null);
    
    // Set up a safety timeout that will force the round to start if the API call hangs
    safetyTimeoutRef.current = setTimeout(() => {
      console.log("[SAFETY TIMEOUT] Force transitioning to in_progress state");
      setRoundStatus('in_progress');
    }, 5000); // 5 seconds timeout
    
    try {
      console.log("Starting round:", currentRound.id, "of type:", currentRound.round_type);
      
      const response = await fetch('/api/techtreasurehunt/start-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId: currentRound.id }),
      });
      
      // Clear the safety timeout since we got a response
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      
      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        throw new Error(responseData.error || 'Failed to start round');
      }
      
      const responseData = await response.json().catch(() => ({}));
      console.log("Start round response:", responseData);
      
      // Store the progress ID immediately
      if (responseData.progressId) {
        setProgressId(responseData.progressId);
        
        // Also fetch the attempts information right away
        try {
          const progressResponse = await fetch(`/api/techtreasurehunt/progress?progressId=${responseData.progressId}`);
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData.progress) {
              setAttempts(progressData.progress.attempts || 1);
              setMaxAttempts(progressData.progress.max_attempts || 3);
            }
          }
        } catch (progressErr) {
          console.error("Error fetching progress info:", progressErr);
        }
      }
      
      // Important: Make sure to update the state at the end
      console.log("Setting round status to in_progress");
      setRoundStatus('in_progress');
      return Promise.resolve();
    } catch (err) {
      console.error("Error in startRound:", err);
      
      // Clear safety timeout if there was an error
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      
      toast.error('Failed to start round. Please try again.');
      setError('Failed to start round. Please try again.');
      setRoundStatus('not_started');
      return Promise.reject(err);
    }
  };

  const completeRound = async (score: any) => {
    setRoundStatus('evaluating');
    try {
      const response = await fetch('/api/techtreasurehunt/complete-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressId, score }),
      });
      
      if (!response.ok) throw new Error('Failed to complete round');
      
      const data = await response.json();
      console.log("Complete round response:", data); // Add this debug log
      setRoundResults(data.results);
      setRoundStatus('completed');
    } catch (err) {
      setError('Failed to submit results. Please try again.');
      console.error(err);
    }
  };

  // Add a function to reset and retry the current round
  const retryRound = async () => {
    setError(null);
    setIsLoading(true);
    setRoundStatus('not_started');
    setRoundResults(null);
    
    try {
      // Refresh the game status from the server
      const response = await fetch('/api/techtreasurehunt/status');
      if (!response.ok) throw new Error('Failed to fetch game status');
      
      const data = await response.json();
      
      setGameStatus(data.status);
      
      if (data.currentRound) {
        setCurrentRound(data.currentRound);
      }
      
      if (data.progressId) {
        setProgressId(data.progressId);
      }
    } catch (err) {
      setError('Failed to reset the round. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to navigate to next round
  const handleNextRound = async (nextRoundId: string): Promise<void> => {
    setRoundStatus('starting');
    setError(null);
    setIsLoading(true);
    
    try {
      // Fetch info about the next round
      const response = await fetch(`/api/techtreasurehunt/round-info?roundId=${nextRoundId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch next round info');
      }
      
      const { round: nextRound } = await response.json();
      
      // Update our current round state
      setCurrentRound(nextRound);
      
      // Start the new round
      const startResponse = await fetch('/api/techtreasurehunt/start-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId: nextRoundId }),
      });
      
      if (!startResponse.ok) {
        throw new Error('Failed to start next round');
      }
      
      const startData = await startResponse.json();
      
      // Update progress ID and attempts
      setProgressId(startData.progressId);
      setAttempts(startData.attempts || 1);
      setMaxAttempts(startData.maxAttempts || 3);
      
      // Reset states
      setRoundResults(null);
      setRoundStatus('in_progress');
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error navigating to next round:", error);
      toast.error("Failed to load next round");
      setError('Failed to navigate to next round');
      setRoundStatus('completed'); // Stay on results screen
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading Tech Treasure Hunt...</p>
        </div>
      );
    }

    if (error) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
        >
          <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            size="sm"
            className="border-red-300 hover:bg-red-50 text-red-700"
          >
            Retry
          </Button>
        </motion.div>
      );
    }

    if (gameStatus === 'not_started' || !currentRound) {
      // If there's a current round but status is not_started, show the start card
      if (currentRound) {
        return <RoundStartCard 
          round={currentRound} 
          onStart={startRound} 
          attempts={attempts} 
          maxAttempts={maxAttempts}
          redirectUrl="" // Use empty string instead of null
        />;
      }
      
      // Only show no active rounds message when there's actually no round data
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">No Active Rounds</h3>
          <p className="text-gray-600 mb-6">There are no active rounds in the Tech Treasure Hunt right now.</p>
          <p className="text-sm text-gray-500">Please check back later or contact the event organizers.</p>
        </div>
      );
    }

    // Handle the different round states - always show start card for not_started
    if (roundStatus === 'not_started') {
      return <RoundStartCard 
        round={currentRound} 
        onStart={startRound} 
        attempts={attempts} 
        maxAttempts={maxAttempts}
        redirectUrl="" // Use empty string instead of null
        isLoading={isLoading} // Pass loading state
      />;
    }

    if (roundStatus === 'starting') {
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Preparing Round</h3>
          <p className="text-gray-600">Setting up your challenge...</p>
          <Progress value={50} className="mt-4 h-2" />
          
          <div className="mt-6 space-y-3">
            <div className="text-xs text-gray-500">
              If you see this message for more than a few seconds, please use one of the options below:
            </div>
            
            <Button 
              onClick={() => {
                setRoundStatus('in_progress');
                console.log("[MANUAL OVERRIDE] User forced round to start");
              }} 
              variant="outline" 
              size="sm"
              className="text-xs text-indigo-600 border-indigo-200"
            >
              Continue to Round
            </Button>
            
            <div className="pt-1">
              <Button 
                onClick={() => {
                  setRoundStatus('not_started');
                  toast.error('Round preparation was canceled');
                  console.log("[MANUAL CANCEL] User canceled round preparation");
                }}
                variant="ghost" 
                size="sm" 
                className="text-xs text-red-500 hover:text-red-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (roundStatus === 'in_progress') {
      // BUGFIX: Handle different round types properly
      if (currentRound.round_type === 'math_quiz') {
        return <MathQuizRound 
          roundId={currentRound.id} 
          progressId={progressId!} 
          timeLimit={currentRound.time_limit}
          onComplete={completeRound}
          attempts={attempts}
          maxAttempts={maxAttempts}
        />;
      } else if (currentRound.round_type === 'code_hunt') {
        return <CodeHuntRound
          roundId={currentRound.id}
          progressId={progressId!}
          timeLimit={currentRound.time_limit}
          onComplete={completeRound}
        />;
      } else {
        // Unknown round type
        return (
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Unsupported Round Type</h3>
            <p className="text-gray-600 mb-6">
              The round type &quot;{currentRound.round_type}&quot; is not currently supported.
            </p>
            <Button onClick={retryRound}>Go Back</Button>
          </div>
        );
      }
    }

    if (roundStatus === 'evaluating') {
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Evaluating Results</h3>
          <p className="text-gray-600">Checking your answers...</p>
          <Progress value={75} className="mt-4 h-2" />
        </div>
      );
    }

    if (roundStatus === 'completed' && roundResults) {
      console.log("Rendering round results with:", roundResults); // Add this debug log
      return (
        <>
          <RoundResults 
            results={roundResults} 
            round={currentRound} 
            onRetry={async () => {
              setShowRefreshDialog(true);
              return Promise.resolve();
            }} // Fix: Return a Promise
            onNextRound={async (nextRoundId: string) => {
              setShowRefreshDialog(true);
              // Store the next round ID in case we want to use it after refresh
              sessionStorage.setItem('nextRoundId', nextRoundId);
              return Promise.resolve();
            }} // Fix: Accept ID parameter and return a Promise
            attempts={attempts}
            maxAttempts={maxAttempts}
          />
          
          {/* Add the refresh confirmation dialog */}
          <RefreshConfirmationDialog
            open={showRefreshDialog}
            onOpenChange={setShowRefreshDialog}
            isRetry={true}
          />
        </>
      );
    }

    return (
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-gray-600">Something went wrong. Please refresh the page.</p>
        <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">Refresh</Button>
      </div>
    );
  };

  // Determine if we should show the header separately
  // Don't show for not_started rounds to avoid duplication with RoundStartCard
  const shouldShowDetailedHeader = currentRound && roundStatus !== 'not_started';

  return (
    <div className="space-y-6">
      {/* Only show the detailed game header when not displaying the start card */}
      {shouldShowDetailedHeader ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 sm:p-6 ">
          <GameHeader 
            currentRound={currentRound}
            attempts={attempts}
            maxAttempts={maxAttempts}
          />
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 sm:p-6 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tech Treasure Hunt</h2>
        </div>
      )}
      
      {/* Main content area with proper spacing */}
      <div className='bg-white/80 backdrop-blur-sm rounded-xl'>
        {renderContent()}
      </div>
    </div>
  );
}
