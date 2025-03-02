'use client';

import React, { useState, useEffect } from 'react';
import { MathQuizRound } from '@/app/dashboard/game/tech-treasure-hunt/components/math-quiz-round';
import { RoundStartCard } from '@/app/dashboard/game/tech-treasure-hunt/components/round-start-card';
import { RoundResults } from '@/app/dashboard/game/tech-treasure-hunt/components/round-results';
import { GameHeader } from './game-header';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    async function fetchGameStatus() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/techtreasurehunt/status');
        if (!response.ok) throw new Error('Failed to fetch game status');
        
        const data = await response.json();
        console.log("Game status response:", data);
        
        // Set the game status from API response
        setGameStatus(data.status);
        
        if (data.currentRound) {
          setCurrentRound(data.currentRound);
        }
        
        if (data.progressId) {
          setProgressId(data.progressId);
          
          // Fetch progress details to get attempts information
          const progressResponse = await fetch(`/api/techtreasurehunt/progress?progressId=${data.progressId}`);
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData.progress) {
              setAttempts(progressData.progress.attempts || 1);
              setMaxAttempts(progressData.progress.max_attempts || 3);
            }
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
    if (!currentRound) return;
    
    setRoundStatus('starting');
    setError(null);
    
    try {
      console.log("Starting round:", currentRound.id);
      
      const response = await fetch('/api/techtreasurehunt/start-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId: currentRound.id }),
      });
      
      const responseData = await response.json();
      console.log("Start round response:", responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to start round');
      }
      
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
          // Continue anyway as this is not critical
        }
      }
      
      // Ensure that we don't change the state if the component has unmounted
      setRoundStatus('in_progress');
    } catch (err) {
      console.error("Error in startRound:", err);
      setError('Failed to start round. Please try again.');
      setRoundStatus('not_started');
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
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
        return <RoundStartCard round={currentRound} onStart={startRound} attempts={attempts} maxAttempts={maxAttempts} />;
      }
      
      // Only show no active rounds message when there's actually no round data
      return (
        <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">No Active Rounds</h3>
          <p className="text-gray-600 mb-6">There are no active rounds in the Tech Treasure Hunt right now.</p>
          <p className="text-sm text-gray-500">Please check back later or contact the event organizers.</p>
        </div>
      );
    }

    // Handle the different round states - always show start card for not_started
    if (roundStatus === 'not_started') {
      return <RoundStartCard round={currentRound} onStart={startRound} attempts={attempts} maxAttempts={maxAttempts} />;
    }

    if (roundStatus === 'starting') {
      return (
        <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Preparing Round</h3>
          <p className="text-gray-600">Setting up your challenge...</p>
          <Progress value={50} className="mt-4 h-2" />
        </div>
      );
    }

    if (roundStatus === 'in_progress' && currentRound.round_type === 'math_quiz') {
      return <MathQuizRound 
        roundId={currentRound.id} 
        progressId={progressId!} 
        timeLimit={currentRound.time_limit}
        onComplete={completeRound}
        attempts={attempts}
        maxAttempts={maxAttempts}
      />;
    }

    if (roundStatus === 'evaluating') {
      return (
        <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Evaluating Results</h3>
          <p className="text-gray-600">Checking your answers...</p>
          <Progress value={75} className="mt-4 h-2" />
        </div>
      );
    }

    if (roundStatus === 'completed' && roundResults) {
      console.log("Rendering round results with:", roundResults); // Add this debug log
      return <RoundResults 
        results={roundResults} 
        round={currentRound} 
        onRetry={retryRound}
        attempts={attempts}
        maxAttempts={maxAttempts}
      />;
    }

    return (
      <div className="bg-[#EBE9E0]/40 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-gray-600">Something went wrong. Please refresh the page.</p>
        <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">Refresh</Button>
      </div>
    );
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden relative">
      {/* Dots for ticket effect */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-indigo-100 rounded-l-full"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-6 sm:h-8 bg-indigo-100 rounded-r-full"></div>
      
      <div className="px-4 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
        <GameHeader 
          currentRound={currentRound}
          attempts={attempts}
          maxAttempts={maxAttempts}
        />
        <div className="mt-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
