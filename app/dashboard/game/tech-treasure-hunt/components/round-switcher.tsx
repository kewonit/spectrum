'use client';

import { useState, useEffect } from 'react';
import { MathQuizRound } from './math-quiz-round';
import { CodeHuntRound } from './code-hunt-round';
import { LoadingState, ErrorState } from './game-states';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { normalizeRoundType } from '../debug-utils';

interface RoundSwitcherProps {
  roundId: string;
  progressId: string;
  roundType: string;
  onComplete: (results: any) => void;
}

export function RoundSwitcher({ 
  roundId, 
  progressId,
  roundType,
  onComplete
}: RoundSwitcherProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLimit, setTimeLimit] = useState(300); // default 5 minutes
  const [retries, setRetries] = useState(0);

  console.log(`RoundSwitcher rendered with:`, { roundId, progressId, roundType });

  const handleRetry = () => {
    console.log("Retrying component load...");
    setLoading(true);
    setError(null);
    setRetries(prev => prev + 1);
  };

  useEffect(() => {
    // Fetch round configuration based on round type
    const fetchRoundConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const normalizedType = normalizeRoundType(roundType);
        
        console.log(`Fetching config for round type: ${normalizedType}`);
        
        // Special case for image code rounds - we'll still load data even if we can't fetch config
        if (normalizedType === 'imagecode') {
          setLoading(false);
          return;
        }
        
        // Otherwise try to fetch quiz config for math_quiz
        if (normalizedType === 'mathquiz') {
          console.log(`Fetching math quiz config for round ID: ${roundId}`);
          const response = await fetch(`/api/techtreasurehunt/quiz-config?roundId=${roundId}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to load round configuration');
          }
          
          console.log(`Received math quiz config:`, data);
          
          // Set time limit from configuration
          if (data.timeLimit) {
            setTimeLimit(data.timeLimit);
          }
        }
      } catch (err) {
        console.error('Error fetching round config:', err);
        setError('Failed to load round configuration');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoundConfig();
  }, [roundId, roundType, retries]);
  
  // If we don't have a valid progress ID, that's a problem
  if (!progressId) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-red-700 mb-2">Missing Progress ID</h3>
          <p className="text-red-600 mb-4">
            This round couldn&apos;t be properly initialized. Please refresh the page and try again.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </Card>
    );
  }
  
  if (loading) {
    return <LoadingState message={`Loading round...`} />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error} 
        action={
          <Button onClick={handleRetry} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        } 
      />
    );
  }

  // Normalize the round type for more flexible matching
  const normalizedType = normalizeRoundType(roundType);
  console.log(`RoundSwitcher selecting component for: ${normalizedType}`);
  
  // Render the appropriate component based on normalized round type
  switch(normalizedType) {
    case 'mathquiz':
      console.log("Rendering MathQuizRound component with", { progressId, timeLimit });
      return (
        <MathQuizRound 
          roundId={roundId} 
          progressId={progressId}
          timeLimit={timeLimit}
          onComplete={onComplete}
        />
      );
    case 'imagecode':
      console.log("Rendering CodeHuntRound component with", { progressId, timeLimit });
      return (
        <CodeHuntRound 
          roundId={roundId} 
          progressId={progressId}
          timeLimit={timeLimit}
          onComplete={onComplete}
        />
      );
    default:
      console.error(`No component found for round type: ${roundType} (normalized: ${normalizedType})`);
      return (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Unsupported Round Type</h3>
            <p className="text-gray-600">
              The round type &quot;{roundType}&quot; is not currently supported.
            </p>
            <p className="text-gray-500 text-sm mt-4">
              If you believe this is an error, please contact support.
            </p>
            <pre className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded whitespace-pre-wrap break-all">
              Round ID: {roundId}<br />
              Progress ID: {progressId}<br />
              Round Type: {roundType}<br />
              Normalized Type: {normalizedType}
            </pre>
          </div>
        </Card>
      );
  }
}
