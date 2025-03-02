import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  seconds: number;
  onTimeUp: () => void;
}

export function CountdownTimer({ seconds, onTimeUp }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);
  
  const minutes = Math.floor(timeLeft / 60);
  const remainingSeconds = timeLeft % 60;
  
  // Calculate percentage for visual indicator
  const percentageLeft = (timeLeft / seconds) * 100;
  
  // Determine color based on time left
  let timerColor = 'text-green-600';
  if (percentageLeft < 50) timerColor = 'text-yellow-600';
  if (percentageLeft < 25) timerColor = 'text-red-600';
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 px-3 py-2 flex items-center">
      <Clock className={`h-4 w-4 mr-2 ${timerColor}`} />
      <span className={`font-mono text-lg font-bold ${timerColor}`}>
        {minutes}:{remainingSeconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}