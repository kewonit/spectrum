import React from 'react';
import { Trophy } from 'lucide-react';

interface Round {
  id: string;
  name: string;
  round_number: number;
}

interface GameHeaderProps {
  currentRound: Round | null;
  attempts?: number;
  maxAttempts?: number;
}

export function GameHeader({ currentRound, attempts = 1, maxAttempts = 3 }: GameHeaderProps) {
  const attemptsRemaining = maxAttempts - attempts + 1;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tech Treasure Hunt</h2>
          {currentRound && (
            <p className="text-sm text-gray-500 mt-1">
              Challenge your technical knowledge and problem-solving skills
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-1 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">Round {currentRound?.round_number || '?'}</span>
        </div>
      </div>
      
      {currentRound && (
        <div>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {currentRound.name}
            </div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              Attempt {attempts} of {maxAttempts}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
