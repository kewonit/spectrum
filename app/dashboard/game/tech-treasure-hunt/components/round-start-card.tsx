import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Activity, Code, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Round {
  id: string;
  name: string;
  description: string;
  round_number: number;
  round_type: string;
  time_limit: number;
}

interface RoundStartCardProps {
  round: Round;
  onStart: () => void;
  attempts?: number;
  maxAttempts?: number;
  isLoading?: boolean;
  redirectUrl?: string | null; // Updated to allow null
}

export function RoundStartCard({ 
  round, 
  onStart, 
  attempts = 1, 
  maxAttempts = 3,
  isLoading = false,
  redirectUrl = `/dashboard/game/tech-treasure-hunt/round/${round.id}` // Default URL to redirect to after starting
}: RoundStartCardProps) {
  const [buttonText, setButtonText] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();
  
  const isButtonDisabled = isLoading || isStarting;
  const attemptsRemaining = maxAttempts - attempts + 1;

  const formatTimeLimit = (seconds: number) => {
    if (!seconds) return "No time limit";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRoundTypeInfo = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'math_quiz':
        return {
          name: 'Math Quiz',
          description: 'Test your mathematical skills with operations like addition, subtraction, multiplication, and division.',
          icon: <Calculator className="h-6 w-6 text-blue-500" />
        };
      case 'image_code':
        return {
          name: 'Image Code Hunt',
          description: 'Find hidden codes in images and submit them to progress.',
          icon: <Code className="h-6 w-6 text-emerald-500" />
        };
      case 'code_hunt':
        return {
          name: 'Code Hunt',
          description: 'Solve coding challenges to move forward.',
          icon: <Code className="h-6 w-6 text-purple-500" />
        };
      default:
        return {
          name: 'Challenge',
          description: 'Complete this round to advance',
          icon: <Activity className="h-6 w-6 text-blue-500" />
        };
    }
  };

  const typeInfo = getRoundTypeInfo(round.round_type);

  // Update the handler to use proper redirection logic
  const handleStartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isButtonDisabled) return;
    
    setIsStarting(true);
    setButtonText('Starting round...');
    
    try {
      console.log("Starting round process, will redirect to:", redirectUrl);
      
      // Call the onStart handler which will make the API call
      await onStart();
      
      // Only redirect if redirectUrl is explicitly provided (not null)
      if (redirectUrl !== null) {
        setButtonText('Redirecting...');
        console.log("onStart succeeded, redirecting to:", redirectUrl);
        
        // Force redirect immediately instead of using setTimeout
        router.push(redirectUrl);
      } else {
        // When redirectUrl is null, stay on current page
        console.log("onStart succeeded, no redirect requested (staying on page)");
        setButtonText(null);
        setIsStarting(false);
      }
    } catch (error) {
      console.error("Error starting round:", error);
      setIsStarting(false);
      setButtonText(null);
      
      // Show user-friendly error message
      toast.error("Failed to start round. Please try again.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white/95 to-indigo-50/90 backdrop-blur-md border border-indigo-100 shadow-lg rounded-2xl p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center">
        <div className="rounded-full bg-indigo-100 p-3 mr-4">
          {typeInfo.icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{round.name}</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Round {round.round_number}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Attempt {attempts} of {maxAttempts}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600">{round.description || typeInfo.description}</p>
      </div>
      
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
        <h4 className="text-sm font-semibold text-indigo-800 mb-2">Round Info</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{typeInfo.name}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-600">Time Limit:</span>
            <span className="font-medium">{formatTimeLimit(round.time_limit)}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-600">Attempts:</span>
            <span className="font-medium">{attemptsRemaining} remaining</span>
          </li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-t border-indigo-100 pt-6">
        <div className="text-sm text-gray-500">
          {round.time_limit ? 
            `You have ${formatTimeLimit(round.time_limit)} to complete this round.` : 
            'Complete this round to advance.'}
        </div>
        
        <Button 
          onClick={handleStartClick} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          disabled={isButtonDisabled || attemptsRemaining <= 0}
        >
          {isButtonDisabled ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              <span>{buttonText || 'Starting...'}</span>
            </div>
          ) : attemptsRemaining > 0 ? (
            <>
              {attempts > 1 ? 'Retry Round' : 'Start Round'} <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            'No attempts remaining'
          )}
        </Button>
      </div>
      
      {attemptsRemaining <= 0 && (
        <div className="mt-4 text-sm text-red-500 text-center">
          You have used all your attempts for this round.
        </div>
      )}
    </motion.div>
  );
}
