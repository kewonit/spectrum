'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MathQuizRound } from '@/app/dashboard/game/tech-treasure-hunt/components/math-quiz-round';
import { CodeHuntRound } from '@/app/dashboard/game/tech-treasure-hunt/components/code-hunt-round';
import { RoundResults } from '@/app/dashboard/game/tech-treasure-hunt/components/round-results';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { GameHeader } from '../../components/game-header';

interface Round {
  id: string;
  name: string;
  description: string;
  round_number: number;
  round_type: string;
  time_limit: number;
}

export default function RoundPage() {
  // All hooks must be called at the top level, before any conditional logic
  const params = useParams();
  const router = useRouter();
  const roundId = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(1);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [roundStatus, setRoundStatus] = useState<'loading' | 'active' | 'completed' | 'error'>('loading');
  const [roundResults, setRoundResults] = useState<any | null>(null);
  
  // Fix: Move the early return check inside useEffect instead of conditionally calling hooks
  useEffect(() => {
    // Check for valid roundId inside the effect
    if (!roundId) {
      setError('No round identifier was provided');
      setRoundStatus('error');
      setIsLoading(false);
      return;
    }
    
    const loadRoundData = async () => {
      try {
        setIsLoading(true);
        
        // First check if the round exists and if the user has permission
        const roundResponse = await fetch(`/api/techtreasurehunt/round-info?roundId=${roundId}`);
        
        if (!roundResponse.ok) {
          throw new Error('Could not load round information');
        }
        
        const roundData = await roundResponse.json();
        setRound(roundData.round);
        
        // Now, either get or create progress for this round
        const progressResponse = await fetch('/api/techtreasurehunt/start-round', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roundId }),
        });
        
        if (!progressResponse.ok) {
          throw new Error('Failed to start round');
        }
        
        const progressData = await progressResponse.json();
        setProgressId(progressData.progressId);
        
        // Check if there's attempt info
        if (progressData.attempts) {
          setAttempts(progressData.attempts);
        }
        
        if (progressData.maxAttempts) {
          setMaxAttempts(progressData.maxAttempts);
        }
        
        setRoundStatus('active');
      } catch (err) {
        console.error("Error loading round:", err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setRoundStatus('error');
        toast.error("Could not load round. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRoundData();
  }, [roundId]); // roundId is now used properly in the dependency array
  
  // Handle round completion
  const handleCompleteRound = async (results: any) => {
    setRoundStatus('completed');
    setRoundResults(results);
  };
  
  // Handle going back to the main game page
  const handleBackToGame = async (): Promise<void> => {
    return new Promise<void>((resolve) => {
      router.push('/dashboard/game/tech-treasure-hunt');
      // Resolve after a short timeout to ensure navigation starts
      setTimeout(resolve, 100);
    });
  };

  // Add a function to navigate to next round
  const handleNextRound = async (nextRoundId: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Simply navigate to the next round page
        const nextRoundUrl = `/dashboard/game/tech-treasure-hunt/round/${nextRoundId}`;
        router.push(nextRoundUrl);
        
        // Resolve after navigation starts
        setTimeout(resolve, 100);
      } catch (error) {
        console.error("Error navigating to next round:", error);
        toast.error("Failed to navigate to next round");
        reject(error);
      }
    });
  };
  
  // Render the appropriate round component based on the round type
  const renderRoundComponent = () => {
    if (!round || !progressId) {
      return null;
    }
    
    switch (round.round_type?.toLowerCase()) {
      case 'math_quiz':
        return (
          <MathQuizRound
            roundId={round.id}
            progressId={progressId}
            timeLimit={round.time_limit}
            onComplete={handleCompleteRound}
            attempts={attempts}
            maxAttempts={maxAttempts}
          />
        );
      case 'code_hunt':
        return (
          <CodeHuntRound
            roundId={round.id}
            progressId={progressId}
            timeLimit={round.time_limit}
            onComplete={handleCompleteRound}
          />
        );
      default:
        return (
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">Unsupported Round Type</h3>
            <p className="text-gray-600 mb-6">
              The round type &quot;{round.round_type}&quot; is not currently supported.
            </p>
            <Button onClick={handleBackToGame}>Back to Game</Button>
          </div>
        );
    }
  };
  
  // Render content based on loading/error status
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading round...</p>
          <Progress value={25} className="mt-4 w-48 h-1.5" />
        </div>
      </div>
    );
  }
  
  // Handle no roundId error - now handled in the useEffect
  if (!roundId) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Invalid Round</h3>
          <p className="text-red-600 font-medium mb-6">No round identifier was provided.</p>
          <Button 
            onClick={() => router.push('/dashboard/game/tech-treasure-hunt')} 
            variant="outline"
            size="sm"
            className="border-red-300 hover:bg-red-50 text-red-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Game
          </Button>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Round</h3>
          <p className="text-red-600 font-medium mb-6">{error}</p>
          <Button 
            onClick={handleBackToGame} 
            variant="outline"
            size="sm"
            className="border-red-300 hover:bg-red-50 text-red-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Game
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-4">
        <Button
          onClick={() => handleBackToGame()}
          variant="outline"
          size="sm"
          className="flex items-center text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Treasure Hunt
        </Button>
      </div>
      
      {/* Game header */}
      {round && (
        <div className="mb-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 sm:p-6">
          <GameHeader 
            currentRound={round}
            attempts={attempts}
            maxAttempts={maxAttempts}
          />
        </div>
      )}
      
      {/* Round content */}
      {roundStatus === 'active' && renderRoundComponent()}
      
      {/* Results */}
      {roundStatus === 'completed' && round && roundResults && (
        <RoundResults
          results={roundResults}
          round={round}
          onRetry={handleBackToGame}
          onNextRound={handleNextRound} // Add this prop
          attempts={attempts}
          maxAttempts={maxAttempts}
        />
      )}
    </div>
  );
}
