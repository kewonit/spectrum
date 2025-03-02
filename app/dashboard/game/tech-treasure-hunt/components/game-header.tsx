import React from 'react';
import { Calculator, Layers, Code, Brain, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface Round {
  id?: string;
  name?: string;
  description?: string;
  round_number?: number;
  round_type?: string;
}

interface GameHeaderProps {
  currentRound: Round | null;
  attempts?: number;
  maxAttempts?: number;
}

export function GameHeader({ currentRound, attempts = 1, maxAttempts = 3 }: GameHeaderProps) {
  const getRoundIcon = (type?: string) => {
    switch(type) {
      case 'math_quiz':
        return <Calculator className="h-6 w-6 text-indigo-600" />;
      case 'image_code':
        return <Code className="h-6 w-6 text-indigo-600" />;
      case 'advanced_problems':
        return <Brain className="h-6 w-6 text-indigo-600" />;
      default:
        return <Layers className="h-6 w-6 text-indigo-600" />;
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-indigo-100"
    >
      <div className="flex items-center mb-4 sm:mb-0">
        <div className="bg-indigo-100 p-2 rounded-lg">
          {currentRound ? getRoundIcon(currentRound.round_type) : <Trophy className="h-6 w-6 text-indigo-600" />}
        </div>
        <div className="ml-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentRound?.name || 'Tech Treasure Hunt'}
          </h2>
          <div className="flex items-center gap-2">
            {currentRound?.round_number ? (
              <span className="text-sm text-gray-500">
                Round {currentRound.round_number}
              </span>
            ) : (
              <span className="text-sm text-gray-500">Welcome</span>
            )}
            
            {/* Attempts badge */}
            {currentRound?.round_number && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Attempt {attempts} of {maxAttempts}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress tracker */}
      {currentRound?.round_number && (
        <div className="flex items-center py-1 px-3 bg-indigo-50 rounded-full text-sm text-indigo-700 font-medium">
          <Trophy className="h-4 w-4 mr-1.5" />
          <span>Tech Treasure Hunt</span>
        </div>
      )}
    </motion.div>
  );
}
