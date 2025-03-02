'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoundStartCard } from '../components/round-start-card';
import { RoundResults } from '../components/round-results';
import { RoundSwitcher } from '../components/round-switcher';
import { LoadingState, ErrorState } from '../components/game-states';
import LeaderboardContainer from '../components/leaderboard-container';
import { GameStateProvider, useGameState, GameState } from '../components/game-state-provider';
import { debugRound } from '../debug-utils';

function RoundContent({ roundId }: { roundId: string }) {
  const {
    state, setState,
    progressId, setProgressId,
    roundData, setRoundData,
    results, setResults,
    error, setError,
    refreshTrigger
  } = useGameState();
  
  const router = useRouter();

  // Fetch round data
  useEffect(() => {
    const fetchRoundData = async () => {
      try {
        console.log(`Fetching round data for ID: ${roundId}`);
        setState(GameState.LOADING);
        
        const response = await fetch(`/api/techtreasurehunt/round/${roundId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch round data');
        }
        
        // Debug log the round data
        console.log("Round data response:", data);
        if (data.round) {
          debugRound("ROUND_DATA", data.round);
        }
        
        setRoundData(data.round);
        setProgressId(data.progressId);
        
        console.log(`Round status: ${data.status}`);
        
        if (data.status === 'not_started' || data.status === 'failed') {
          setState(GameState.START);
        } else if (data.status === 'in_progress') {
          setState(GameState.PLAYING);
        } else if (data.status === 'completed' || data.status === 'passed') {
          // If we have results, show them
          if (data.results) {
            setResults(data.results);
            setState(GameState.RESULTS);
          } else {
            // Otherwise, let them start again
            setState(GameState.START);
          }
        } else {
          setState(GameState.START);
        }
      } catch (err) {
        console.error('Error fetching round data:', err);
        setError('Failed to load round information');
        setState(GameState.ERROR);
      }
    };

    fetchRoundData();
  }, [roundId, setState, setRoundData, setProgressId, setResults, setError]);

  // Handle start round
  const handleStartRound = async () => {
    try {
      console.log("Start button clicked, setting loading state");
      setState(GameState.LOADING);
      
      console.log(`Starting round: ${roundId}, progress: ${progressId}`);
      
      const response = await fetch('/api/techtreasurehunt/start-round', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundId,
          progressId,
        }),
      });
      
      const data = await response.json();
      
      console.log("API Response:", data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start round');
      }
      
      // If we got a new progressId, update it
      if (data.progressId) {
        console.log(`Setting new progress ID: ${data.progressId}`);
        setProgressId(data.progressId);
      }
      
      // Force a re-render with the updated states and immediately change to PLAYING state
      console.log("Setting game state to PLAYING");
      setState(GameState.PLAYING);
      
      // Refresh component to ensure proper rendering 
      setTimeout(() => {
        refreshTrigger();
        
        // Add a full page reload as a fallback
        setTimeout(() => {
          console.log("Forcing page reload for fresh state");
          window.location.reload();
        }, 300);
      }, 100);
      
    } catch (err) {
      console.error('Error starting round:', err);
      setError('Failed to start round');
      setState(GameState.ERROR);
    }
  };

  // Handle round completion
  const handleRoundComplete = (roundResults: any) => {
    console.log("Round completed with results:", roundResults);
    setResults(roundResults);
    setState(GameState.RESULTS);
  };

  // Handle retry
  const handleRetry = async () => {
    try {
      setState(GameState.LOADING);
      
      // Make a call to reset the round
      const response = await fetch('/api/techtreasurehunt/reset-round', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundId,
          progressId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset round');
      }
      
      console.log("Reset round response:", data);
      setState(GameState.START);
      refreshTrigger(); // Force re-render
      
    } catch (err) {
      console.error('Error retrying round:', err);
      setError('Failed to retry round');
      setState(GameState.ERROR);
    }
  };

  if (state === GameState.LOADING) {
    return <LoadingState message="Loading..." />;
  }

  if (state === GameState.ERROR) {
    return <ErrorState message={error || 'An error occurred'} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {state === GameState.START && roundData && (
          <RoundStartCard 
            round={roundData} 
            onStart={handleStartRound} 
            attempts={roundData.attempts || 1}
            maxAttempts={roundData.max_attempts || 3}
          />
        )}
        
        {state === GameState.PLAYING && progressId && roundData && (
          <RoundSwitcher
            key={`${progressId}-${roundData.round_type}`} // Add key to force re-render
            roundId={roundId}
            progressId={progressId}
            roundType={roundData.round_type}
            onComplete={handleRoundComplete}
          />
        )}
        
        {state === GameState.RESULTS && results && roundData && (
          <RoundResults 
            results={results}
            round={roundData}
            onRetry={handleRetry}
            attempts={roundData.attempts || 1}
            maxAttempts={roundData.max_attempts || 3}
          />
        )}
      </div>
      
      <div className="lg:col-span-1">
        <LeaderboardContainer />
      </div>
    </div>
  );
}

// Define params as a Promise type
export type RoundParamsType = Promise<{ roundId: string }>;

// Main page component that wraps the content with the provider
export default async function RoundPage({ params }: { params: RoundParamsType }) {
  // Await the params Promise to get the actual roundId
  const { roundId } = await params;
  
  return (
    <GameStateProvider>
      <div className="container max-w-6xl mx-auto p-4">
        <RoundContent roundId={roundId} />
      </div>
    </GameStateProvider>
  );
}
