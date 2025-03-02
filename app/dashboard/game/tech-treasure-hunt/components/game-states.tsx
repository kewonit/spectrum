import React from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
      <p className="text-gray-600">{message}</p>
    </motion.div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
    >
      <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
      <p className="text-red-600 font-medium mb-4">{message}</p>
      {onRetry ? (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="border-red-300 hover:bg-red-50 text-red-700"
        >
          Retry
        </Button>
      ) : (
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="border-red-300 hover:bg-red-50 text-red-700"
        >
          Refresh Page
        </Button>
      )}
    </motion.div>
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
      className="bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 rounded-2xl p-6 text-center"
    >
      <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{message}</p>
      <Progress value={progress} className="mt-4 h-2" />
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
