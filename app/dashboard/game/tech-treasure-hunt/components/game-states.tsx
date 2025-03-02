import React from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <Card className="p-8 flex flex-col items-center justify-center min-h-[300px]">
      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
      <p className="text-lg font-medium text-gray-800">{message}</p>
      <p className="text-sm text-gray-500 mt-2">This may take a few moments...</p>
    </Card>
  );
}

interface ErrorStateProps {
  message: string;
  action?: ReactNode;
}

export function ErrorState({ message, action }: ErrorStateProps) {
  return (
    <Card className="p-8 border-red-200 bg-red-50">
      <div className="flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h3>
        <p className="text-red-600 mb-4">{message}</p>
        
        {action || (
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors mt-2"
          >
            Refresh Page
          </button>
        )}
      </div>
    </Card>
  );
}

interface ProcessingStateProps {
  title: string;
  message: string;
  progress?: number;
}

export function ProcessingState({ title, message, progress = 50 }: ProcessingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-amber-50/30 border border-amber-100 rounded-2xl p-6 text-center"
    >
      <Loader2 className="h-6 w-6 animate-spin text-amber-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{message}</p>
      <Progress 
        value={progress} 
        className="mt-4 h-2 bg-amber-100" 
      />
      <style jsx global>{`
        .Progress-indicator {
          background-color: #d97706; /* amber-600 */
        }
      `}</style>
    </motion.div>
  );
}

interface SuccessStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SuccessState({ title, message, actionLabel, onAction }: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white to-green-50/30 border border-green-100 rounded-2xl p-6 text-center"
    >
      <div className="inline-flex items-center justify-center rounded-full p-3 bg-green-100 mb-4">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      
      {onAction && actionLabel && (
        <Button onClick={onAction} className="bg-green-600 hover:bg-green-700">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
