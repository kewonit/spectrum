import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Clock, Award, Zap, RotateCw, ArrowRight, Activity, Code, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

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
}

export function RoundStartCard({ round, onStart, attempts = 1, maxAttempts = 3 }: RoundStartCardProps) {
  const [isStarting, setIsStarting] = useState(false);

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

  const handleStartClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (isStarting) return;

    setIsStarting(true);
    console.log("Start button clicked, calling onStart handler");
    
    // Add a message to users that the page will reload
    const startButton = e.currentTarget as HTMLButtonElement;
    if (startButton) {
      startButton.innerHTML = 'Starting and reloading page...';
    }

    // Call the onStart handler, which will trigger the API request
    onStart();
    
    // Keep the button disabled - the page will reload anyway
  };

  const attemptsRemaining = maxAttempts - attempts + 1;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 shadow-md rounded-2xl p-8"
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
          disabled={isStarting || attemptsRemaining <= 0}
        >
          {isStarting ? (
            <span>Starting & Reloading...</span>
          ) : attemptsRemaining > 0 ? (
            <>
              Start Round <ArrowRight className="ml-2 h-4 w-4" />
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
