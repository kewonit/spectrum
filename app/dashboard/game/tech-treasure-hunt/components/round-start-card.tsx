import React from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Clock, Award, Zap, RotateCw } from 'lucide-react';
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
  const formatTimeLimit = (seconds: number) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    return `${seconds} seconds`;
  };
  
  const getRoundTypeInfo = (type: string) => {
    switch (type) {
      case 'math_quiz':
        return {
          name: 'Math Challenge',
          description: 'Solve mathematical problems under time pressure',
          icon: <Zap className="h-6 w-6 text-yellow-500" />
        };
      case 'image_code':
        return {
          name: 'Image Code Challenge',
          description: 'Find and enter hidden codes from images',
          icon: <Award className="h-6 w-6 text-emerald-500" />
        };
      case 'advanced_problems':
        return {
          name: 'Advanced Problems',
          description: 'Tackle complex mathematical problems',
          icon: <RotateCw className="h-6 w-6 text-purple-500" />
        };
      default:
        return {
          name: 'Challenge',
          description: 'Complete this round to advance',
          icon: <Award className="h-6 w-6 text-blue-500" />
        };
    }
  };
  
  const typeInfo = getRoundTypeInfo(round.round_type);
  
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
            {/* Attempts badge */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Attempt {attempts} of {maxAttempts}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 mb-8 leading-relaxed">
        {round.description || typeInfo.description}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl flex items-center border border-gray-100 shadow-sm">
          <Clock className="text-indigo-600 h-5 w-5 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Time Limit</p>
            <p className="font-medium">{formatTimeLimit(round.time_limit)}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl flex items-center border border-gray-100 shadow-sm">
          <Award className="text-indigo-600 h-5 w-5 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Round Type</p>
            <p className="font-medium">{typeInfo.name}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={onStart} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          size="lg"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Start Round
        </Button>
        
        <p className="text-center text-sm text-gray-500 mt-2">
          Ready when you are! Click the button above to begin.
        </p>
      </div>
    </motion.div>
  );
}
