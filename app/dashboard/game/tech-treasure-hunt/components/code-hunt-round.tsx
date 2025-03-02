'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, Image } from 'lucide-react';
import { motion } from 'framer-motion';

interface CodeHuntRoundProps {
  roundId: string;
  progressId: string;
  timeLimit: number;
  onComplete: (score: any) => void;
  attempts?: number;
  maxAttempts?: number;
}

export function CodeHuntRound({ 
  roundId, 
  progressId, 
  timeLimit,
  onComplete,
  attempts = 1,
  maxAttempts = 3
}: CodeHuntRoundProps) {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter a code');
      return;
    }
    
    try {
      // This is a placeholder - in a real implementation, you'd verify the code
      // with an API call
      
      // For now, we'll just simulate completion
      onComplete({
        totalTime: timeLimit,
        avgResponseTime: timeLimit / 2,
      });
    } catch (err) {
      setError('Failed to submit code. Please try again.');
      console.error(err);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col"
    >
      <Card className="p-6 mb-6 border border-amber-100 shadow-md bg-gradient-to-br from-white to-amber-50/30">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center rounded-full p-4 mb-4 bg-amber-100">
            <Image className="h-8 w-8 text-amber-700" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Find the Hidden Code</h3>
          <p className="text-gray-600">
            This round is under development. In the finished version, you would need to find a code hidden in an image.
          </p>
        </div>
        
        <div className="border-2 border-dashed border-amber-200 rounded-lg bg-amber-50/50 p-8 mb-6 flex items-center justify-center">
          <div className="text-amber-400 text-center">
            <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Image placeholder</p>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 flex items-center p-3 text-red-600 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the code you found"
            className="text-lg text-center focus:ring-amber-500 focus:border-amber-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          
          <Button 
            onClick={handleSubmit}
            className="sm:w-auto w-full bg-amber-600 hover:bg-amber-700 text-white transition-all"
          >
            Submit
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
